import os
import shutil
from glob import glob
from tqdm import tqdm
from roboflow import Roboflow
import requests
import subprocess

# CONFIGURATION
FEEDBACK_DIR = "feedback"
LOCAL_DATASET_DIR = "dataset/train"
SSD_TRAIN_SCRIPT = "train_ssd.py"
SSD_MODEL_DEST = "../backend/best_ssd_mobilenetv3.pth"
ROBOFLOW_API_KEY = "YOUR_ROBOFLOW_API_KEY"
ROBOFLOW_PROJECT = "your-project"
ROBOFLOW_WORKSPACE = "your-workspace"
ROBOFLOW_DATASET_ID = "your-dataset-id"

def sync_feedback_to_local_dataset():
    print("🔄 Syncing feedback images to local dataset...")
    for auth in os.listdir(FEEDBACK_DIR):
        auth_path = os.path.join(FEEDBACK_DIR, auth)
        if not os.path.isdir(auth_path):
            continue
        for med in os.listdir(auth_path):
            med_path = os.path.join(auth_path, med)
            if not os.path.isdir(med_path):
                continue
            dest_dir = os.path.join(LOCAL_DATASET_DIR, med)
            os.makedirs(dest_dir, exist_ok=True)
            for img in glob(os.path.join(med_path, "*.jpg")):
                dest_img = os.path.join(dest_dir, os.path.basename(img))
                if not os.path.exists(dest_img):
                    shutil.copy2(img, dest_img)
    print("✅ Feedback images synced to local dataset.")

def upload_feedback_to_roboflow():
    print("☁️ Uploading feedback images to Roboflow...")
    rf = Roboflow(api_key=ROBOFLOW_API_KEY)
    project = rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT)
    uploaded = 0
    for auth in os.listdir(FEEDBACK_DIR):
        auth_path = os.path.join(FEEDBACK_DIR, auth)
        if not os.path.isdir(auth_path):
            continue
        for med in os.listdir(auth_path):
            med_path = os.path.join(auth_path, med)
            if not os.path.isdir(med_path):
                continue
            for img in glob(os.path.join(med_path, "*.jpg")):
                # You can add more metadata if needed
                project.upload(img, label=auth)
                uploaded += 1
    print(f"✅ Uploaded {uploaded} images to Roboflow.")

def trigger_ssd_training():
    print("🚀 Starting SSD MobileNet retraining...")
    subprocess.run(["python", SSD_TRAIN_SCRIPT], check=True)
    print("✅ SSD MobileNet retraining complete.")

def deploy_ssd_model():
    print("📦 Deploying new SSD MobileNet model to backend...")
    best_model = "checkpoints/best_ssd_mobilenetv3.pth"
    if os.path.exists(best_model):
        shutil.copy2(best_model, SSD_MODEL_DEST)
        print("✅ Model deployed.")
    else:
        print("❌ Best model not found, skipping deployment.")

def trigger_roboflow_training():
    print("🚀 Triggering Roboflow ResNet-50 retraining...")
    url = f"https://api.roboflow.com/dataset/{ROBOFLOW_DATASET_ID}/train"
    params = {"api_key": ROBOFLOW_API_KEY}
    response = requests.post(url, params=params)
    if response.ok:
        print("✅ Roboflow training triggered.")
        print(response.json())
    else:
        print("❌ Failed to trigger Roboflow training.")
        print(response.text)

def main():
    sync_feedback_to_local_dataset()
    upload_feedback_to_roboflow()
    trigger_ssd_training()
    deploy_ssd_model()
    trigger_roboflow_training()
    print("🎉 All steps complete!")

if __name__ == "__main__":
    main()