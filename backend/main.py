import os
import uuid
import torch
import logging
import numpy as np
import torchvision
from PIL import Image, ImageOps, ImageEnhance
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.requests import Request
from typing import Tuple
from torchvision import transforms
from torchvision.models.detection.ssd import SSDClassificationHead
from torchvision.models.detection import _utils
from torchvision.models.detection import SSDLite320_MobileNet_V3_Large_Weights
from inference_sdk import InferenceHTTPClient
import cv2
from pydantic import BaseModel
import base64

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info('Starting FastAPI app...')

app = FastAPI()

# CORS setup
origins = [
    "*",  # adjust for production
    "http://localhost:19006",
    "exp://localhost:19000",
    "http://192.168.5.220:8003",
    "exp://192.168.5.220:8081",
    "https://90f3-112-203-170-240.ngrok-free.app"
]
logger.info(f"CORS origins: {origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Static files (cropped images)
if not os.path.exists('static'):
    os.makedirs('static')
logger.info("Mounting /static for static files...")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Roboflow Setup
ROBOFLOW_API_KEY = "JkbZVyIu72Moc2qR229m"
ROBOFLOW_MODEL_ID = "authmed-fgdsz/1"
roboflow_client = InferenceHTTPClient(api_url="https://classify.roboflow.com", api_key=ROBOFLOW_API_KEY)

# Class labels
class_names = [
    "background", "bioflu", "biogesic", "bonamine",
    "buscopan", "decolgen", "flanax", "imodium", "tuseranforte"
]

CLASS_NAME_MAP = {
    'bioflu': 'Bioflu',
    'biogesic': 'Biogesic',
    'buscopan': 'Buscopan',
    'decolgen': 'Decolgen',
    'flanax': 'Flanax',
    'imodium': 'Imodium',
}
ALLOWED_CLASSES = list(CLASS_NAME_MAP.keys())

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class MedicineClassifier:
    def __init__(self, model_path: str, input_size: int = 320):
        self.model = self._load_model(model_path, input_size)
        self.input_size = input_size

    def _load_model(self, model_path: str, size: int):
        model = torchvision.models.detection.ssdlite320_mobilenet_v3_large(weights="DEFAULT")
        in_channels = _utils.retrieve_out_channels(model.backbone, (size, size))
        num_anchors = model.anchor_generator.num_anchors_per_location()

        model.head.classification_head = SSDClassificationHead(
            in_channels=in_channels,
            num_anchors=num_anchors,
            num_classes=9
        )
        model.transform.min_size = [size]
        model.transform.max_size = size
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.to(device)
        model.eval()
        return model

    def preprocess_for_detection(self, image_data: bytes, target_size: Tuple[int, int] = (320, 320)):
        """
        Returns processed_image (np.ndarray), and a dict with scale, padding, and original size info.
        """
        try:
            image = Image.open(BytesIO(image_data)).convert("RGB")
            orig_w, orig_h = image.size
            grayscale = image.convert("L")
            avg_brightness = np.mean(np.asarray(grayscale))
            if avg_brightness < 100:
                brightness_factor = 1.2
            elif avg_brightness > 200:
                brightness_factor = 0.9
            else:
                brightness_factor = 1.0
            enhanced_image = ImageEnhance.Brightness(image).enhance(brightness_factor)
            # Maintain aspect ratio
            enhanced_image.thumbnail(target_size, Image.Resampling.LANCZOS)
            new_w, new_h = enhanced_image.size
            # Paste onto neutral background
            final_image = Image.new('RGB', target_size, (128, 128, 128))
            paste_x = (target_size[0] - new_w) // 2
            paste_y = (target_size[1] - new_h) // 2
            final_image.paste(enhanced_image, (paste_x, paste_y))
            image_filename = f"preprocessed_no_crop_{uuid.uuid4().hex}.jpg"
            final_image.save(os.path.join('static', image_filename))
            processed_image = np.asarray(final_image).astype(np.float32) / 255.0
            # Store info for reverse mapping
            info = {
                'orig_w': orig_w,
                'orig_h': orig_h,
                'new_w': new_w,
                'new_h': new_h,
                'pad_x': paste_x,
                'pad_y': paste_y,
                'target_size': target_size
            }
            return processed_image, info
        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            fallback = np.asarray(Image.open(BytesIO(image_data)).convert("RGB").resize(target_size)).astype(np.float32) / 255.0
            info = {'orig_w': 0, 'orig_h': 0, 'new_w': 0, 'new_h': 0, 'pad_x': 0, 'pad_y': 0, 'target_size': target_size}
            return fallback, info

    def is_ood(self, scores, top2_threshold=0.2, threshold=0.7):
        # scores: numpy array of softmax scores
        if len(scores) < 2:
            logger.info(f"OOD check: not enough scores (len={len(scores)}) -> OOD")
            return True
        top_two = np.sort(scores)[-2:]
        logger.info(f"OOD check: top1={top_two[1]:.4f}, top2={top_two[0]:.4f}, threshold={threshold}, top2_threshold={top2_threshold}")
        # Reject if top2 is less than top2_threshold
        if top_two[0] < top2_threshold:
            logger.info(f"OOD decision: top2 too low (top2={top_two[0]:.4f} < {top2_threshold}) -> OOD")
            return True
        if top_two[1] < threshold:
            logger.info("OOD decision: top1 below threshold -> OOD")
            return True
        logger.info("OOD decision: accepted (not OOD)")
        return False

    def predict(self, image_data: bytes):
        processed_image, info = self.preprocess_for_detection(image_data)
        input_tensor = torch.from_numpy(processed_image).permute(2, 0, 1).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = self.model(input_tensor)[0]
        boxes = outputs['boxes'].cpu().numpy()
        scores = outputs['scores'].cpu().numpy()
        labels = outputs['labels'].cpu().numpy()
        if len(scores) == 0:
            return {"class": "unknown", "confidence": 0.0, "message": "No detection"}
        if self.is_ood(scores, top2_threshold=0.1, threshold=0.5):
            return {"class": "unknown", "confidence": float(np.max(scores)), "message": "No high-confidence detection or ambiguous class"}
        top_idx = np.argmax(scores)
        pred_class_idx = labels[top_idx]
        pred_confidence = scores[top_idx]
        # If the top class is background (index 0), treat as unknown
        if pred_class_idx == 0:
            return {"class": "unknown", "confidence": float(pred_confidence), "message": "Background detected"}
        predicted_class = class_names[pred_class_idx].lower()
        if predicted_class == "bonamine":
            predicted_class = "biogesic"
        if predicted_class not in ALLOWED_CLASSES:
            return {"class": "unknown", "confidence": float(pred_confidence), "message": "Unsupported class detected"}
        return {
            "class": CLASS_NAME_MAP[predicted_class],
            "confidence": float(pred_confidence),
            "box": boxes[top_idx].astype(int).tolist(),
            "raw_class": predicted_class,
            "preprocess_info": info
        }

MODEL_PATH = "best_ssd_mobilenetv3.pth"
classifier = MedicineClassifier(MODEL_PATH)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)}
    )

@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error. Please try again later."}
    )

def is_blurry(image: np.ndarray, threshold: float = 50.0) -> bool:
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    logger.info(f"Blurriness (Laplacian variance): {laplacian_var}")
    if (laplacian_var < threshold) or (laplacian_var > 650):
        return True
    else:
        return False

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        logger.info("/predict endpoint hit")
        logger.info(f"Received file: filename={file.filename}, content_type={file.content_type}, size={getattr(file, 'size', 'unknown')}")
        # Check file size (limit to 10MB)
        if hasattr(file, 'size') and file.size and file.size > 25 * 1024 * 1024:
            logger.warning("File too large")
            raise HTTPException(status_code=413, detail="File too large. Max 10MB allowed.")
        
        # Check file type
        if not file.content_type or not file.content_type.startswith("image/"):
            logger.warning("File is not an image")
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
        contents = await file.read()
        logger.info(f"File read: {len(contents)} bytes")

        # Blurriness check
        image, _ = read_file_as_image(contents)
        if is_blurry(image):
            logger.info("Rejected blurry image")
            return {"class": "unknown", "confidence": 0.0, "message": "Image is too blurry. Please try again with a clearer photo."}
        result = classifier.predict(contents)
        logger.info(f"Prediction result: {result}")
        
        # For authenticity, we need the original image and box if detection succeeded
        if result["class"] != "unknown" and "box" in result:
            # Map box from 320x320 to original image coordinates
            info = result["preprocess_info"]
            box = result["box"]
            orig_w, orig_h = info['orig_w'], info['orig_h']
            new_w, new_h = info['new_w'], info['new_h']
            pad_x, pad_y = info['pad_x'], info['pad_y']
            # Remove padding
            x1 = max(box[1] - pad_x, 0)
            y1 = max(box[0] - pad_y, 0)
            x2 = max(box[3] - pad_x, 0)
            y2 = max(box[2] - pad_y, 0)
            # Scale back to original
            scale_x = orig_w / new_w if new_w > 0 else 1
            scale_y = orig_h / new_h if new_h > 0 else 1
            x1 = int(x1 * scale_x)
            x2 = int(x2 * scale_x)
            y1 = int(y1 * scale_y)
            y2 = int(y2 * scale_y)
            logger.info(f"Cropping original image: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
            
            # Crop from original image
            image, _ = read_file_as_image(contents)
            cropped_image = image[y1:y2, x1:x2]
            authenticity_result = classify_authenticity(cropped_image)
            result["authenticity"] = authenticity_result
            cropped_filename = f"cropped_{result['raw_class']}_{uuid.uuid4().hex}.jpg"
            cropped_path = os.path.join('static', cropped_filename)
            Image.fromarray(cropped_image).save(cropped_path)
            result["cropped_image_url"] = f"/static/{cropped_filename}"
        logger.info(f"Returning result: {result}")
        return result
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def read_file_as_image(data) -> Tuple[np.ndarray, Tuple[int, int]]:
    try:
        img = Image.open(BytesIO(data))
        img = ImageOps.exif_transpose(img).convert('RGB')
        image = np.array(img)
        return image, img.size
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

def classify_authenticity(image: np.ndarray) -> dict:
    try:
        pil_image = Image.fromarray(image).resize((224, 224), Image.BICUBIC)
        pil_image = ImageOps.equalize(pil_image)
        temp_path = "temp_image.jpg"
        pil_image.save(temp_path, quality=95)
        try:
            result = roboflow_client.infer(temp_path, model_id=ROBOFLOW_MODEL_ID)
            predictions = result.get('predictions', [])
            if not predictions:
                return {"status": "unknown", "confidence": 0.0}
            top_pred = max(predictions, key=lambda x: x['confidence'])
            conf = top_pred['confidence']
            label = top_pred['class']
            if label == 'authentic' and conf >= 0.5:
                status = "authentic"
            elif label == 'counterfeit' and conf >= 0.8:
                status = "counterfeit"
            elif label == 'counterfeit' and conf >= 0.5:
                status = "suspected counterfeit"
            else:
                status = "authentic"
            return {"status": status, "confidence": conf}
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        logger.error(f"Authenticity classification error: {e}")
        return {"status": "error", "confidence": 0.0, "message": str(e)}

@app.get("/ping")
async def ping():
    return {"message": "hello, i am alive"}

@app.get("/", response_class=HTMLResponse)
async def index():
    with open("main.html", "r") as file:
        return file.read()

class ImagePayload(BaseModel):
    image_base64: str
    filename: str
    mime: str

@app.post("/predict_base64")
async def predict_base64(payload: ImagePayload):
    try:
        logger.info("/predict_base64 endpoint hit")
        image_data = base64.b64decode(payload.image_base64)
        logger.info(f"Decoded base64 image: {len(image_data)} bytes, filename={payload.filename}, mime={payload.mime}")
        # Blurriness check
        image, _ = read_file_as_image(image_data)
        if is_blurry(image):
            logger.info("Rejected blurry image (base64)")
            return {"class": "unknown", "confidence": 0.0, "message": "Image is too blurry. Please try again with a clearer photo."}
        result = classifier.predict(image_data)
        logger.info(f"Prediction result: {result}")
        # For authenticity, we need the original image and box if detection succeeded
        if result["class"] != "unknown" and "box" in result:
            info = result["preprocess_info"]
            box = result["box"]
            orig_w, orig_h = info['orig_w'], info['orig_h']
            new_w, new_h = info['new_w'], info['new_h']
            pad_x, pad_y = info['pad_x'], info['pad_y']
            x1 = max(box[1] - pad_x, 0)
            y1 = max(box[0] - pad_y, 0)
            x2 = max(box[3] - pad_x, 0)
            y2 = max(box[2] - pad_y, 0)
            scale_x = orig_w / new_w if new_w > 0 else 1
            scale_y = orig_h / new_h if new_h > 0 else 1
            x1 = int(x1 * scale_x)
            x2 = int(x2 * scale_x)
            y1 = int(y1 * scale_y)
            y2 = int(y2 * scale_y)
            logger.info(f"Cropping original image: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
            image, _ = read_file_as_image(image_data)
            cropped_image = image[y1:y2, x1:x2]
            authenticity_result = classify_authenticity(cropped_image)
            result["authenticity"] = authenticity_result
            cropped_filename = f"cropped_{result['raw_class']}_{uuid.uuid4().hex}.jpg"
            cropped_path = os.path.join('static', cropped_filename)
            Image.fromarray(cropped_image).save(cropped_path)
            result["cropped_image_url"] = f"/static/{cropped_filename}"
        logger.info(f"Returning result: {result}")
        return result
    except Exception as e:
        logger.error(f"Prediction error (base64): {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
