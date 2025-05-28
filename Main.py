import uvicorn
from ultralytics import RTDETR
import cv2
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from config import settings

app = FastAPI()

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
model = RTDETR(settings.model_path)

# Store the last uploaded video path
global_last_video_path = None
global_stop_stream = False

@app.post("/api/stop_stream")
def stop_stream():
    global global_stop_stream
    global_stop_stream = True
    return {"message": "Stream stopped."}

@app.post("/api/detect_and_stream")
async def detect_and_stream(file: UploadFile = File(...)):
    global global_last_video_path
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(await file.read())
        global_last_video_path = temp_video.name
    return {"message": "Video uploaded successfully."}

@app.get("/api/stream/")
def stream_video():
    global global_stop_stream
    global_stop_stream = False  # Reset stop flag at the start
    if not global_last_video_path:
        raise HTTPException(status_code=404, detail="No video uploaded yet.")

    def frame_generator():
        cap = cv2.VideoCapture(global_last_video_path)
        while cap.isOpened():
            if global_stop_stream:
                break
            ret, frame = cap.read()
            if not ret:
                break
            # Process frame (add your detection logic here)
            results = model(frame)
            if results and hasattr(results[0], 'boxes'):
                for result in results[0].boxes:
                    x1, y1, x2, y2 = map(int, result.xyxy[0])
                    confidence = float(result.conf[0])
                    class_id = int(result.cls[0])
                    label = model.names[class_id]
                    if confidence >= settings.conf_thresh:
                        color = (0, 255, 0)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(frame, f"{label} {confidence:.2f}", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        cap.release()

    return StreamingResponse(frame_generator(), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/")
def root():
    return {"message": "FastAPI backend for video detection is running."}

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
