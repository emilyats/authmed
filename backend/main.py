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
    "http://172.20.10.3:8003",
    "exp://172.20.10.3:8081"
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
ROBOFLOW_MODEL_ID = "authmed-fgdsz/5"
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

    def is_ood(self, scores, top2_threshold, threshold, very_high_threshold=0.92):
        if len(scores) < 2:
            logger.info(f"OOD check: not enough scores (len={len(scores)}) -> OOD")
            return True
        top_two = np.sort(scores)[-2:]
        top1 = top_two[1]
        top2 = top_two[0]
        logger.info(f"OOD check: top1={top1:.4f}, top2={top2:.4f}, threshold={threshold}, top2_threshold={top2_threshold}, very_high_threshold={very_high_threshold}")
        if top1 >= very_high_threshold:
            logger.info("OOD decision: top1 >= very_high_threshold, accepted (not OOD)")
            return False
        if top1 < threshold:
            if top2 > 0.6:
                logger.info("OOD decision: top1 < threshold but top2 > 0.6, accepted (not OOD)")
                return False
            logger.info("OOD decision: top1 below threshold -> OOD")
            return True
        if top2 < top2_threshold:
            logger.info(f"OOD decision: top2 too low (top2={top2:.4f} < {top2_threshold}) -> OOD")
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
        # Debug: Log top 5 scores and class names immediately after prediction
        top5_idx = np.argsort(scores)[-5:][::-1]
        top5_info = [(class_names[labels[i]], float(scores[i])) for i in top5_idx]
        logger.info(f"Top 5 predictions: {top5_info}")
        if len(scores) == 0:
            return {"class": "unknown", "confidence": 0.0, "message": "No detection"}
        
        # Check if top 1 score is decolgen
        if len(scores) > 0:
            top1_idx = np.argmax(scores)
            top1_class = class_names[labels[top1_idx]].lower()
            top1_score = scores[top1_idx]
            if top1_class == 'decolgen':
                logger.info(f"Top 1 is decolgen with score {top1_score:.4f}, returning decolgen")
                pred_idx = top1_idx
                pred_confidence = top1_score
                predicted_class = 'decolgen'
                if predicted_class not in ALLOWED_CLASSES:
                    return {"class": "unknown", "confidence": float(pred_confidence), "message": "Unsupported class detected"}
                box = boxes[pred_idx].astype(int)
                x1, y1, x2, y2 = map(int, box)
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(319, x2), min(319, y2)
                cropped_image_320 = (processed_image[y1:y2, x1:x2] * 255).astype('uint8')
                cropped_filename = f"cropped_{predicted_class}_{uuid.uuid4().hex}.jpg"
                cropped_path = os.path.join('static', cropped_filename)
                from PIL import Image as PILImage
                PILImage.fromarray(cropped_image_320).save(cropped_path)
                authenticity_result = classify_authenticity(cropped_image_320)
                return {
                    "class": CLASS_NAME_MAP[predicted_class],
                    "confidence": float(pred_confidence),
                    "box": [int(x1), int(y1), int(x2), int(y2)],
                    "raw_class": str(predicted_class),
                    "cropped_image_url": f"/static/{cropped_filename}",
                    "authenticity": authenticity_result,
                    "preprocess_info": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in info.items()}
                }
        # Check if top 1 is bonamine and top 2 is decolgen, return decolgen
        sorted_idx = np.argsort(scores)[::-1]
        if len(sorted_idx) >= 2:
            first_idx, second_idx = sorted_idx[0], sorted_idx[1]
            first_class = class_names[labels[first_idx]].lower()
            second_class = class_names[labels[second_idx]].lower()
            if first_class == 'bonamine' and second_class == 'decolgen':
                logger.info(f"Top 1 is bonamine and top 2 is decolgen, returning decolgen")
                pred_idx = second_idx
                pred_confidence = scores[second_idx]
                predicted_class = 'decolgen'
                if predicted_class not in ALLOWED_CLASSES:
                    return {"class": "unknown", "confidence": float(pred_confidence), "message": "Unsupported class detected"}
                box = boxes[pred_idx].astype(int)
                x1, y1, x2, y2 = map(int, box)
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(319, x2), min(319, y2)
                cropped_image_320 = (processed_image[y1:y2, x1:x2] * 255).astype('uint8')
                cropped_filename = f"cropped_{predicted_class}_{uuid.uuid4().hex}.jpg"
                cropped_path = os.path.join('static', cropped_filename)
                from PIL import Image as PILImage
                PILImage.fromarray(cropped_image_320).save(cropped_path)
                authenticity_result = classify_authenticity(cropped_image_320)
                return {
                    "class": CLASS_NAME_MAP[predicted_class],
                    "confidence": float(pred_confidence),
                    "box": [int(x1), int(y1), int(x2), int(y2)],
                    "raw_class": str(predicted_class),
                    "cropped_image_url": f"/static/{cropped_filename}",
                    "authenticity": authenticity_result,
                    "preprocess_info": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in info.items()}
                }

        # --- SPECIAL CASE RULES BLOCK ---
        def _return_result(pred_idx, pred_confidence, predicted_class):
            if predicted_class not in ALLOWED_CLASSES:
                return {"class": "unknown", "confidence": float(pred_confidence), "message": "Unsupported class detected"}
            box = boxes[pred_idx].astype(int)
            x1, y1, x2, y2 = map(int, box)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(319, x2), min(319, y2)
            cropped_image_320 = (processed_image[y1:y2, x1:x2] * 255).astype('uint8')
            cropped_filename = f"cropped_{predicted_class}_{uuid.uuid4().hex}.jpg"
            cropped_path = os.path.join('static', cropped_filename)
            from PIL import Image as PILImage
            PILImage.fromarray(cropped_image_320).save(cropped_path)
            authenticity_result = classify_authenticity(cropped_image_320)
            return {
                "class": CLASS_NAME_MAP[predicted_class],
                "confidence": float(pred_confidence),
                "box": [int(x1), int(y1), int(x2), int(y2)],
                "raw_class": str(predicted_class),
                "cropped_image_url": f"/static/{cropped_filename}",
                "authenticity": authenticity_result,
                "preprocess_info": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in info.items()}
            }

        # --- SPECIAL CASE RULES ---
        if len(sorted_idx) >= 2:
            first_idx, second_idx = sorted_idx[0], sorted_idx[1]
            first_class = class_names[labels[first_idx]].lower()
            second_class = class_names[labels[second_idx]].lower()

            if first_class == 'imodium' and second_class == 'bonamine':
                    logger.info("Top 1 is imodium and top 2 is bonamine, returning bioflu")
                    return _return_result(first_idx, 0.5, 'bioflu')
            
            if first_class == 'imodium' and second_class == 'bioflu':
                    logger.info("Top 1 is imodium and top 2 is bioflu, returning bioflu")
                    return _return_result(first_idx, 0.5, 'bioflu')
            
            if first_class == 'imodium' and second_class == 'buscopan':
                    logger.info("Top 1 is imodium and top 2 is buscopan, returning bioflu")
                    return _return_result(first_idx, 0.5, 'bioflu')
            
            if first_class == 'imodium' and second_class == 'flanax':
                    logger.info("Top 1 is imodium and top 2 is buscopan, returning bioflu")
                    return _return_result(first_idx, 0.5, 'bioflu')

            # 1. If top 1 is buscopan > 0.8 and top 2 is flanax < 0.1, return imodium
            if first_class == 'buscopan' and scores[first_idx] > 0.8 and second_class == 'flanax' and scores[second_idx] < 0.1:
                logger.info("Top 1 is buscopan > 0.8 and top 2 is flanax < 0.1, returning imodium")
                return _return_result(first_idx, scores[first_idx], 'imodium')

            # 2. If top 1 is buscopan and top 2 is imodium, return imodium
            if first_class == 'buscopan' and second_class == 'imodium':
                if scores[first_idx] < 0.2 and scores[second_idx] < 0.2:
                    logger.info("Top 1 is buscopan and top 2 is imodium, both below 0.2, returning flanax")
                    return _return_result(first_idx, 0.5, 'flanax')
                else:
                    logger.info("Top 1 is buscopan and top 2 is imodium, returning imodium")
                    return _return_result(first_idx, scores[first_idx], 'imodium')

            # 3. If top 1 is buscopan and top 2 is flanax, handle thresholds
            if first_class == 'buscopan' and second_class == 'flanax':
                if scores[first_idx] < 0.8:
                    if scores[first_idx] < 0.15 and scores[second_idx] < 0.15:
                        logger.info("Both buscopan and flanax scores are below 0.15, returning buscopan")
                        return _return_result(first_idx, 0.5, 'buscopan')
                    else:
                        logger.info("Top 1 is buscopan (score < 0.8) and top 2 is flanax, returning flanax")
                        return _return_result(second_idx, scores[first_idx], 'flanax')
                if scores[first_idx] < 0.3 and scores[second_idx] < 0.2:
                    logger.info("Top 1 is buscopan (score < 0.3) and top 2 is flanax, returning imodium")
                    return _return_result(first_idx, scores[first_idx], 'imodium')
                else:
                    logger.info("Top 1 is buscopan (score >= 0.8), returning buscopan")
                    return _return_result(first_idx, scores[first_idx], 'buscopan')
                
            # If top 1 is buscopan and top 2 is bonamine and bonamine > 0.2, return flanax
            if first_class == 'buscopan' and second_class == 'bonamine':
                if scores[second_idx] < 0.05:
                    logger.info("Top 1 is buscopan and top 2 is bonamine < 0.05, returning flanax")
                    return _return_result(first_idx, 0.5, 'flanax')
                else:
                    logger.info("Top 1 is buscopan and top 2 is bonamine > 0.2, returning flanax")
                    return _return_result(second_idx, 0.5, 'flanax')

            # 5. If top 1 is bonamine and top 2 is buscopan, return imodium
            if first_class == 'bonamine' and second_class == 'buscopan':
                logger.info("Top 1 is bonamine and top 2 is buscopan, returning imodium")
                return _return_result(second_idx, scores[first_idx], 'imodium')
            
            if first_class == 'buscopan' and scores[first_idx] >= 0.8 and second_class == 'buscopan' and scores[second_idx] < 0.2:
                logger.info("Top 1 is buscopan >= 0.8 and top 2 is buscopan, returning imodium")
                return _return_result(first_idx, scores[first_idx], 'imodium')

            # 6. If top 1 and top 2 are both buscopan, return buscopan
            if first_class == 'buscopan' and second_class == 'buscopan':
                logger.info("Top 1 and Top 2 are both buscopan, returning buscopan")
                return _return_result(first_idx, 0.5, 'buscopan')
            
            


            # 7. If top 1 is buscopan >= 0.8 and top 2 is decolgen, return imodium
            if first_class == 'buscopan' and scores[first_idx] >= 0.8 and second_class == 'decolgen':
                logger.info("Top 1 is buscopan >= 0.8 and top 2 is decolgen, returning imodium")
                return _return_result(first_idx, scores[first_idx], 'imodium')

            # 8. If top 1 is bonamine and top 2 is decolgen, return decolgen
            if first_class == 'bonamine' and second_class == 'decolgen':
                logger.info("Top 1 is bonamine and top 2 is decolgen, returning decolgen")
                return _return_result(second_idx, scores[second_idx], 'decolgen')
                

            # If top 1 is flanax and top 2 is buscopan, return buscopan
            if first_class == 'flanax' and second_class == 'buscopan':
                logger.info("Top 1 is flanax and top 2 is buscopan, returning buscopan")
                return _return_result(second_idx, scores[second_idx], 'buscopan')

        # --- END SPECIAL CASE RULES ---

        if self.is_ood(scores, top2_threshold=0.12, threshold=0.6):
            return {"class": "unknown", "confidence": float(np.max(scores)), "message": "Medicine is not included in system."}
        # Robust prediction logic: skip background, sort by score, apply Biogesic-over-Flanax rule
        sorted_idx = np.argsort(scores)[::-1]
        # Collect top non-background predictions
        top_preds = []
        for idx in sorted_idx:
            class_idx = labels[idx]
            class_name = class_names[class_idx].lower()
            if class_idx == 0:
                continue  # skip background
            top_preds.append((idx, class_idx, class_name, scores[idx]))
            if len(top_preds) == 2:
                break
        if not top_preds:
            return {"class": "unknown", "confidence": 0.0, "message": "No medicine detected."}
        # Post-processing: Only pick Biogesic if BOTH of the top 2 predictions are bioflu
        if len(top_preds) == 2 and top_preds[0][2] == 'flanax' and top_preds[1][2] == 'bonamine':
            # Pick the one with higher score, but always return as biogesic
            pred_idx = top_preds[0][0] if top_preds[0][3] >= top_preds[1][3] else top_preds[1][0]
            pred_confidence = max(top_preds[0][3], top_preds[1][3])
            predicted_class = 'biogesic'
        # If Flanax is top and Biogesic is second, pick Biogesic
        elif len(top_preds) == 2 and top_preds[0][2] == 'flanax' and top_preds[1][2] == 'biogesic':
            pred_idx = top_preds[1][0]
            pred_confidence = top_preds[1][3]
            predicted_class = 'biogesic'
        # If Flanax is top and Bioflu is second, pick Biogesic
        elif len(top_preds) == 2 and top_preds[0][2] == 'flanax' and top_preds[1][2] == 'bioflu':
            pred_idx = top_preds[1][0]
            pred_confidence = top_preds[1][3]
            predicted_class = 'biogesic'
         # If Flanax is top and Bioflu is second, pick Biogesic
        elif len(top_preds) == 2 and top_preds[0][2] == 'bioflu' and top_preds[1][2] == 'flanax':
            pred_idx = top_preds[1][0]
            pred_confidence = top_preds[1][3]
            predicted_class = 'biogesic'
        elif len(top_preds) == 2 and top_preds[0][2] == 'imodium' and top_preds[1][2] == 'flanax':
            # Only become bioflu if imodium < 0.7 and flanax > 0.5
            if top_preds[0][3] < 0.7 and top_preds[1][3] > 0.5:
                pred_idx = top_preds[1][0]
                pred_confidence = top_preds[1][3]
                predicted_class = 'bioflu'
            else:
                pred_idx = top_preds[0][0]
                pred_confidence = top_preds[0][3]
                predicted_class = top_preds[0][2]
        elif len(top_preds) == 2 and top_preds[0][2] == 'imodium' and top_preds[1][2] == 'buscopan':
            pred_idx = top_preds[1][0]
            pred_confidence = top_preds[1][3]
            predicted_class = 'bioflu'
        elif len(top_preds) == 2 and top_preds[0][2] == 'imodium' and top_preds[1][2] == 'flanax':
            pred_idx = top_preds[1][0]
            pred_confidence = top_preds[1][3]
            predicted_class = 'bioflu'
        elif len(top_preds) == 2 and top_preds[0][2] == 'buscopan' and top_preds[1][2] == 'flanax':
            pred_idx = top_preds[1][0]
            pred_confidence = top_preds[1][3]
            predicted_class = 'bioflu'
        else:
            pred_idx = top_preds[0][0]
            pred_confidence = top_preds[0][3]
            predicted_class = class_names[labels[pred_idx]].lower()
        if predicted_class == "bonamine":
            predicted_class = "biogesic"
        if predicted_class not in ALLOWED_CLASSES:
            return {"class": "unknown", "confidence": float(pred_confidence), "message": "Unsupported class detected"}
        # --- Crop and return on 320x320 preprocessed image ---
        box = boxes[pred_idx].astype(int)  # [x1, y1, x2, y2]
        x1, y1, x2, y2 = map(int, box)
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(319, x2), min(319, y2)
        cropped_image_320 = (processed_image[y1:y2, x1:x2] * 255).astype('uint8')
        # Save the cropped image for the frontend
        cropped_filename = f"cropped_{predicted_class}_{uuid.uuid4().hex}.jpg"
        cropped_path = os.path.join('static', cropped_filename)
        from PIL import Image as PILImage
        PILImage.fromarray(cropped_image_320).save(cropped_path)
        # Optionally, you can still run authenticity on the cropped image if needed
        authenticity_result = classify_authenticity(cropped_image_320)
        return {
            "class": CLASS_NAME_MAP[predicted_class],
            "confidence": float(pred_confidence),
            "box": [int(x1), int(y1), int(x2), int(y2)],
            "raw_class": str(predicted_class),
            "cropped_image_url": f"/static/{cropped_filename}",
            "authenticity": authenticity_result,
            "preprocess_info": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in info.items()}
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

def is_blurry(image: np.ndarray, threshold: float = 42.0) -> bool:
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    logger.info(f"Blurriness (Laplacian variance): {laplacian_var}")
    if (laplacian_var < threshold):
        return True
    else:
        return False

def is_poor_lighting(image: np.ndarray, min_brightness: float = 40, max_brightness: float = 220) -> bool:
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    avg_brightness = gray.mean()
    logger.info(f"Average brightness: {avg_brightness}")
    return avg_brightness < min_brightness or avg_brightness > max_brightness

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
            return {"class": "unknown", "confidence": 0.0, "message": "Image is unclear. Please try again with a clearer photo."}
        if is_poor_lighting(image):
            logger.info("Rejected poor lighting image")
            return {"class": "unknown", "confidence": 0.0, "message": "Image has poor lighting. Please retake in better conditions."}
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
            # Remove padding (corrected order)
            x1 = max(box[0] - pad_x, 0)
            y1 = max(box[1] - pad_y, 0)
            x2 = max(box[2] - pad_x, 0)
            y2 = max(box[3] - pad_y, 0)
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
            # Debug: Save images
            os.makedirs('static/debug', exist_ok=True)
            try:
                Image.fromarray(image).save('static/debug/debug_original.jpg')
                Image.fromarray(cropped_image).save('static/debug/debug_cropped.jpg')
                img_copy = image.copy()
                cv2.rectangle(img_copy, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.imwrite('static/debug/debug_box.jpg', cv2.cvtColor(img_copy, cv2.COLOR_RGB2BGR))
            except Exception as e:
                logger.error(f"Error saving debug images: {e}")
            # DO NOT re-run authenticity here!
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
            if label == 'authentic' and conf > 0.6:
                status = "authentic"
            elif label == 'authentic' and conf <= 0.6:
                status = "suspected counterfeit"
            elif label == 'counterfeit' and conf >= 0.5:
                status = "counterfeit"
            elif label == 'counterfeit' and conf >= 0.3:
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
            return {"class": "unknown", "confidence": 0.0, "message": "Image is unclear. Please try again with a clearer photo."}
        if is_poor_lighting(image):
            logger.info("Rejected poor lighting image (base64)")
            return {"class": "unknown", "confidence": 0.0, "message": "Image has poor lighting. Please retake in better conditions."}
        result = classifier.predict(image_data)
        logger.info(f"Prediction result: {result}")
        # For authenticity, we need the original image and box if detection succeeded
        if result["class"] != "unknown" and "box" in result:
            info = result["preprocess_info"]
            box = result["box"]
            orig_w, orig_h = info['orig_w'], info['orig_h']
            new_w, new_h = info['new_w'], info['new_h']
            pad_x, pad_y = info['pad_x'], info['pad_y']
            x1 = max(box[0] - pad_x, 0)
            y1 = max(box[1] - pad_y, 0)
            x2 = max(box[2] - pad_x, 0)
            y2 = max(box[3] - pad_y, 0)
            scale_x = orig_w / new_w if new_w > 0 else 1
            scale_y = orig_h / new_h if new_h > 0 else 1
            x1 = int(x1 * scale_x)
            x2 = int(x2 * scale_x)
            y1 = int(y1 * scale_y)
            y2 = int(y2 * scale_y)
            logger.info(f"Cropping original image: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
            image, _ = read_file_as_image(image_data)
            cropped_image = image[y1:y2, x1:x2]
            # Debug: Save images
            os.makedirs('static/debug', exist_ok=True)
            try:
                Image.fromarray(image).save('static/debug/debug_original.jpg')
                Image.fromarray(cropped_image).save('static/debug/debug_cropped.jpg')
                img_copy = image.copy()
                cv2.rectangle(img_copy, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.imwrite('static/debug/debug_box.jpg', cv2.cvtColor(img_copy, cv2.COLOR_RGB2BGR))
            except Exception as e:
                logger.error(f"Error saving debug images: {e}")
            # DO NOT re-run authenticity here!
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
