from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile
import numpy as np
import cv2

# Load model once
model = YOLO("yolov8s.pt")

def detect_crowd(image):
    results = model(image)
    people_count = 0

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            
            if cls == 0:  # person class
                people_count += 1

    # Density logic
    if people_count < 10:
        density = "LOW"
    elif people_count < 30:
        density = "MEDIUM"
    else:
        density = "HIGH"

    return people_count, density

app = FastAPI()

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
        # Read image from upload (bytes → numpy)
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Run model
        people_count, density = detect_crowd(image)

        return {
            "people_count": people_count,
            "density": density
        }

    except Exception as e:
        return {
            "error": str(e)
        }
