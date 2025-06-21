import os
import uuid
import torch
import numpy as np
import cv2
import torchvision
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
from torchvision.models.detection import SSDLite320_MobileNet_V3_Large_Weights
from torchvision.models.detection.ssd import SSDClassificationHead
from torchvision.models.detection import _utils
import torchvision.transforms as T
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import logging

# === Configuration ===
CLASS_NAME_MAP = {
    'bioflu': 'Bioflu',
    'biogesic': 'Biogesic',
    'buscopan': 'Buscopan',
    'decolgen': 'Decolgen',
    'flanax': 'Flanax',
    'imodium': 'Imodium',
}
ALLOWED_CLASSES = list(CLASS_NAME_MAP.keys())
STATIC_DIR = "static"
MODEL_PATH = "best_ssd_mobilenetv3.pth"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# === FastAPI setup ===
app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("__main__")

# === Model Loader ===
def create_model(num_classes=9, size=320):
    model = torchvision.models.detection.ssdlite320_mobilenet_v3_large(
        weights=SSDLite320_MobileNet_V3_Large_Weights.COCO_V1)
    in_channels = _utils.retrieve_out_channels(model.backbone, (size, size))
    num_anchors = model.anchor_generator.num_anchors_per_location()

    model.head.classification_head = SSDClassificationHead(
        in_channels=in_channels,
        num_anchors=num_anchors,
        num_classes=num_classes
    )

    model.transform.min_size = [size]
    model.transform.max_size = size
    return model

MODEL = create_model()
MODEL.load_state_dict(torch.load(MODEL_PATH, map_location=device))
MODEL.to(device)
MODEL.eval()
logger.info("✅ Model loaded and ready")

# === Image Preprocessing (OpenCV) ===
def preprocess_image_cv2(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Failed to load image: {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (320, 320))

    # Histogram equalization
    yuv = cv2.cvtColor(image, cv2.COLOR_RGB2YUV)
    yuv[:, :, 0] = cv2.equalizeHist(yuv[:, :, 0])
    image_eq = cv2.cvtColor(yuv, cv2.COLOR_YUV2RGB)

    transform = T.Compose([
        T.ToTensor()
    ])
    tensor = transform(image_eq).unsqueeze(0).to(device)  # Move to device here
    return tensor, image_eq

# === Inference Endpoint ===
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    temp_path = "temp_input.jpg"
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        input_tensor, image_eq = preprocess_image_cv2(temp_path)

        with torch.no_grad():
            outputs = MODEL(input_tensor)[0]

        boxes = outputs['boxes'].cpu().numpy()
        scores = outputs['scores'].cpu().numpy()
        labels = outputs['labels'].cpu().numpy()

        logger.info(f"Detected boxes: {boxes}")
        logger.info(f"Detected scores: {scores}")
        logger.info(f"Detected classes: {labels}")

        if len(scores) == 0 or max(scores) < 0.1:
            return {"class": "unknown", "confidence": 0.0, "message": "No high-confidence detection"}

        top_idx = np.argmax(scores)
        pred_class_idx = labels[top_idx]
        pred_confidence = scores[top_idx]
        pred_box = boxes[top_idx].astype(int)

        class_names = ["background", "bioflu", "biogesic", "bonamine", "buscopan", "decolgen", "flanax", "imodium", "tuseranforte"]
        predicted_class = class_names[pred_class_idx].lower()

        if predicted_class not in ALLOWED_CLASSES:
            return {"class": "unknown", "confidence": float(pred_confidence), "message": "Unsupported class detected"}

        cropped_filename = f"{predicted_class}_{uuid.uuid4().hex}.jpg"
        cropped_path = os.path.join(STATIC_DIR, cropped_filename)

        image = Image.open(temp_path).convert("RGB")
        cropped = image.crop((pred_box[0], pred_box[1], pred_box[2], pred_box[3]))
        cropped.save(cropped_path)

        return {
            "class": CLASS_NAME_MAP[predicted_class],
            "confidence": float(pred_confidence),
            "box": pred_box.tolist(),
            "cropped_image_url": f"/static/{cropped_filename}"
        }

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/", response_class=HTMLResponse)
async def index():
    with open("main.html", "r") as file:
        return file.read()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8003)
