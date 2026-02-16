from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import os
import time

app = FastAPI()

# Ambil path model dari environment variable (settingan docker-compose)
MODEL_FILE = os.getenv("MODEL_PATH", "model/model_dnn(sigmoid).h5")
model = None

@app.on_event("startup")
def load_model():
    global model
    print(f"Mencoba memuat model dari: {MODEL_FILE}")
    if os.path.exists(MODEL_FILE):
        model = tf.keras.models.load_model(MODEL_FILE)
        print("Model berhasil dimuat")
    else:
        print("Model tidak ditemukan")

class SensorData(BaseModel):
    voltage: float
    current: float
    power: float

@app.post("/predict")
async def predict_data(data: SensorData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model belum siap")


    # Sesuaikan bentuk array dengan input modelmu (biasanya butuh shape (1, 3))
    input_arr = np.array([[data.voltage, data.current, data.power]])
    
    start_proc = time.perf_counter() #start time pindah di sini
    prediction = model(input_arr, training=False)
    end_proc = time.perf_counter()
        
    score = float(prediction[0][0])
    server_latency_ms = (end_proc - start_proc) * 1000
    
    return {
        "status": "success",
        "is_anomaly": 1 if score > 0.5 else 0,
        "server_inference_ms": server_latency_ms
    } 

