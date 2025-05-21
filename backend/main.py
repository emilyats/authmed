import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
from io import BytesIO
from PIL import Image
from PIL import ImageOps
from typing import Tuple
import tensorflow as tf
import logging
import requests
import os
from inference_sdk import InferenceHTTPClient
from fastapi.staticfiles import StaticFiles
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Update CORS settings to allow connections from your React Native app
origins = [
    "http://localhost:19006",  # Expo development server
    "exp://localhost:19000",   # Expo Go
    "exp://192.168.1.13:19000",  # Your actual IP
    "http://192.168.1.13:8003",  # Your backend server
    "*"  # Allow all origins for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Roboflow configuration
ROBOFLOW_API_KEY = "JkbZVyIu72Moc2qR229m"
ROBOFLOW_MODEL_ID = "authmed-fgdsz/1"

# Initialize Roboflow client
roboflow_client = InferenceHTTPClient(
    api_url="https://classify.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

roboflow_detection_client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

# Load model using TFSMLayer for Keras 3 compatibility
MODEL = tf.saved_model.load("ssd_mobilenet_v2-may14/saved_model")
CLASS_NAMES = ['bioflu', 'biogesic', 'buscopan', 'decolgen', 'flanax', 'imodium']

ALLOWED_DETECTION_MODEL = "ssd-mobilenetv2-detection/1"
ALLOWED_CLASSES = set(CLASS_NAMES)  # Convert to set for faster lookup

# Mount a static directory for serving cropped images
if not os.path.exists('static'):
    os.makedirs('static')
app.mount('/static', StaticFiles(directory='static'), name='static')

CLASS_NAME_MAP = {
    "decolgen": "Decolgen Forte",
    "bioflu": "Bioflu",
    "biogesic": "Biogesic",
    "buscopan": "Buscopan Venus",
    "flanax": "Flanax",
    "imodium": "Imodium",
    # Add more mappings as needed
}

def crop_image(image: np.ndarray, box: list, img_size: Tuple[int, int]) -> np.ndarray:
    """Crop image based on bounding box coordinates."""
    height, width = image.shape[:2]
    ymin, xmin, ymax, xmax = box
    
    # Convert normalized coordinates to pixel coordinates
    xmin = int(xmin * width)
    xmax = int(xmax * width)
    ymin = int(ymin * height)
    ymax = int(ymax * height)
    
    # Ensure coordinates are within image bounds
    xmin = max(0, xmin)
    xmax = min(width, xmax)
    ymin = max(0, ymin)
    ymax = min(height, ymax)
    
    # Crop the image
    cropped = image[ymin:ymax, xmin:xmax]
    return cropped

def classify_authenticity(image: np.ndarray) -> dict:
    """Classify medicine authenticity using Roboflow API."""
    try:
        # Convert numpy array to PIL Image
        pil_image = Image.fromarray(image)
        
        # Standardize image size (e.g., 224x224 for common classification models)
        pil_image = pil_image.resize((224, 224), Image.BICUBIC)
        
        # Basic preprocessing
        pil_image = ImageOps.equalize(pil_image)  # Enhance contrast
        
        # Save to temporary file
        temp_path = "temp_image.jpg"
        pil_image.save(temp_path, quality=95)  # High quality JPEG
        
        try:
            # Use Roboflow SDK to make prediction
            result = roboflow_client.infer(temp_path, model_id=ROBOFLOW_MODEL_ID)
            logger.info(f"Roboflow API response: {result}")
            
            # Process the result
            predictions = result.get('predictions', [])
            if not predictions:
                return {"status": "unknown", "confidence": 0.0}
            
            # Get the highest confidence prediction
            top_prediction = max(predictions, key=lambda x: x['confidence'])
            authenticity_confidence = top_prediction['confidence']
            authenticity_class = top_prediction['class']
            
            # Determine authenticity status based on confidence
            if top_prediction['class'] == 'authentic':
                if authenticity_confidence >= 0.5:
                    status = "authentic"
                else:
                    status = "counterfeit"
            else:  # counterfeit class
                if authenticity_confidence >= 0.8:
                    status = "counterfeit"
                elif authenticity_confidence >= 0.5:
                    status = "suspected counterfeit"
                else:
                    status = "authentic"
            
            return {
            'status': authenticity_class,
            'confidence': authenticity_confidence
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"Error in authenticity classification: {str(e)}")
        return {"status": "error", "confidence": 0.0, "message": str(e)}

@app.get("/ping")
async def ping():
    return "hello , i am alive"

def read_file_as_image(data) -> Tuple[np.ndarray, Tuple[int, int]]:
    try:
        img = Image.open(BytesIO(data))
        img = ImageOps.exif_transpose(img)
        img = img.convert('RGB')
        img_resized = img.resize((640, 640), resample=Image.BICUBIC)
        image = np.array(img_resized)
        return image, img_resized.size
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        logger.info(f"Received image file: {file.filename}")
        
        image, img_size = read_file_as_image(contents)
        logger.info(f"Image processed successfully. Shape: {image.shape}")
        
        # Prepare input for model
        input_tensor = tf.convert_to_tensor(np.expand_dims(image, 0))
        logger.info(f"Input tensor shape: {input_tensor.shape}")
        
        # Make prediction with SSD MobileNetV2
        try:
            detections = MODEL(input_tensor)
            logger.info(f"Raw detections: {detections}")
            
            # Process detections
            boxes = detections['detection_boxes'][0].numpy()
            scores = detections['detection_scores'][0].numpy()
            classes = detections['detection_classes'][0].numpy().astype(int)
            
            # Get the highest confidence detection
            if len(scores) > 0 and scores[0] > 0.5:  # Only consider detections with confidence > 0.5
                predicted_class = CLASS_NAMES[classes[0] - 1]  # Subtract 1 because classes are 1-indexed
                display_class = CLASS_NAME_MAP.get(predicted_class, predicted_class)
                confidence = float(scores[0])
                box = boxes[0].tolist()
                
                # Crop the image using the bounding box
                cropped_image = crop_image(image, box, img_size)
                
                # Classify authenticity using Roboflow
                authenticity_result = classify_authenticity(cropped_image)
                
                logger.info(f"Predicted class: {predicted_class}, Confidence: {confidence}")
                logger.info(f"Authenticity result: {authenticity_result}")
                
                return {
                    'class': display_class,
                    'confidence': confidence,
                    'box': box,
                    'authenticity': authenticity_result
                }
            else:
                return {
                    'class': 'unknown',
                    'confidence': 0.0,
                    'message': 'No medicine detected with high confidence'
                }
                
        except Exception as e:
            logger.error(f"Error during model prediction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error during model prediction: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/", response_class=HTMLResponse)
async def index():
    with open("main.html", "r") as file:
        return file.read()

@app.post("/predict_roboflow")
async def predict_roboflow(file: UploadFile = File(...)):
    try:
        # Save uploaded image to a temporary file
        contents = await file.read()
        temp_path = "temp_detection_image.jpg"
        with open(temp_path, "wb") as f:
            f.write(contents)

        try:
            # Use Roboflow serverless detection model
            detection_result = roboflow_detection_client.infer(
                temp_path, model_id="ssd-mobilenetv2-detection/1"
            )
            logger.info(f"Roboflow Detection API response: {detection_result}")

            # Parse detection result
            predictions = detection_result.get('predictions', [])
            if not predictions:
                return {
                    'class': 'unknown',
                    'confidence': 0.0,
                    'message': 'No medicine detected with high confidence'
                }

            # Get the highest confidence detection
            top_detection = max(predictions, key=lambda x: x['confidence'])
            predicted_class = top_detection['class'].lower()  # Convert to lowercase for comparison
            
            # Validate the predicted class is one of the allowed classes
            if predicted_class not in CLASS_NAMES:
                logger.warning(f"Predicted class '{predicted_class}' not in allowed classes: {CLASS_NAMES}")
                return {
                    'class': 'unknown',
                    'confidence': 0.0,
                    'message': 'Detected medicine is not in supported classes'
                }
                
            display_class = CLASS_NAME_MAP.get(predicted_class, predicted_class)
            confidence = top_detection['confidence']

            # Get image dimensions
            image_pil = Image.open(temp_path)
            image_pil = ImageOps.exif_transpose(image_pil)
            image_pil = image_pil.convert('RGB')
            image = np.array(image_pil)
            img_height, img_width = image.shape[:2]
            logger.info(f"Image dimensions: width={img_width}, height={img_height}")
            logger.info(f"Image shape: {image.shape}")

            # Calculate box coordinates in pixel space using Roboflow's dynamic cropping approach
            x_center = top_detection['x']
            y_center = top_detection['y']
            width = top_detection['width']
            height = top_detection['height']
            logger.info(f"Roboflow detection coordinates: x_center={x_center}, y_center={y_center}, width={width}, height={height}")
            logger.info(f"Roboflow image dimensions: {detection_result['image']}")

            # Convert center coordinates to x_min, y_min, x_max, y_max format
            # Note: Roboflow coordinates are in the original image orientation
            x_min = int(max(0, x_center - width / 2))
            y_min = int(max(0, y_center - height / 2))
            x_max = int(min(img_width, x_center + width / 2))
            y_max = int(min(img_height, y_center + height / 2))
            logger.info(f"Calculated crop coordinates: x_min={x_min}, y_min={y_min}, x_max={x_max}, y_max={y_max}")

            # Ensure coordinates are within image bounds
            x_min = max(0, x_min)
            y_min = max(0, y_min)
            x_max = min(img_width, x_max)
            y_max = min(img_height, y_max)

            # Crop the image using the calculated coordinates
            cropped_image = image[y_min:y_max, x_min:x_max]
            logger.info(f"Cropped image shape: {cropped_image.shape}")

            # Save cropped image to static directory with a unique name
            cropped_filename = f"{predicted_class}_{uuid.uuid4().hex}.jpg"
            cropped_path = os.path.join('static', cropped_filename)
            Image.fromarray(cropped_image).save(cropped_path, format='JPEG')
            cropped_image_url = f"/static/{cropped_filename}"
            
            # Add logging for debugging
            logger.info(f"Saved cropped image to: {cropped_path}")
            logger.info(f"Full URL will be: {cropped_image_url}")
            logger.info(f"File exists: {os.path.exists(cropped_path)}")

            # Classify authenticity using Roboflow
            authenticity_result = classify_authenticity(cropped_image)

            logger.info(f"Predicted class: {predicted_class}, Confidence: {confidence}")
            logger.info(f"Authenticity result: {authenticity_result}")

            return {
                'class': display_class,
                'confidence': confidence,
                'box': [y_min, x_min, y_max, x_max],  # Keep format consistent with previous implementation
                'cropped_image_url': cropped_image_url,
                'authenticity': authenticity_result
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)