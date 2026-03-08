from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import os
import time

app = FastAPI()

# 1. Path untuk kedua model
MODEL_H5_FILE = os.getenv("MODEL_PATH", "model/model070326_addData.h5")
MODEL_TFLITE_FILE = os.getenv("MODEL_TINY_PATH", "model/model_tinyml070326_addData.tflite")

# 2. Variabel Global
model_h5 = None
interpreter = None
input_details = None
output_details = None

# ==========================================
# KONFIGURASI MIN-MAX SCALER
# Sesuaikan dengan nilai latih datasetmu!
# ==========================================
V_MIN, V_MAX = 214.6, 234.0
I_MIN, I_MAX = 0.0, 6.74
P_MIN, P_MAX = 0.0, 1453.0

@app.on_event("startup")
def load_models():
    global model_h5, interpreter, input_details, output_details
    
    # --- MEMUAT MODEL H5 ---
    print(f"Memuat model H5 dari: {MODEL_H5_FILE}")
    if os.path.exists(MODEL_H5_FILE):
        model_h5 = tf.keras.models.load_model(MODEL_H5_FILE)
        print("Model H5 berhasil dimuat.")
        # Warm-up (gunakan data yang sudah di-scale)
        dummy_input = np.array([[0.5, 0.5, 0.5]], dtype=np.float32)
        for _ in range(20):
            model_h5(dummy_input, training=False)
    else:
        print("Model H5 tidak ditemukan!")

    # --- MEMUAT MODEL TFLITE ---
    print(f"Memuat model TFLite dari: {MODEL_TFLITE_FILE}")
    if os.path.exists(MODEL_TFLITE_FILE):
        interpreter = tf.lite.Interpreter(model_path=MODEL_TFLITE_FILE)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print("Model TFLite berhasil dimuat.")
        # Warm-up
        dummy_input = np.array([[0.5, 0.5, 0.5]], dtype=np.float32)
        for _ in range(20):
            interpreter.set_tensor(input_details[0]['index'], dummy_input)
            interpreter.invoke()
            _ = interpreter.get_tensor(output_details[0]['index'])
    else:
        print("Model TFLite tidak ditemukan!")
        
    print("Warm-up selesai! Server siap menerima request.")

class SensorData(BaseModel):
    voltage: float
    current: float
    power: float

# ML KONVENSIONAL .h5
@app.post("/predict")
async def predict_h5(data: SensorData):
    if model_h5 is None:
        raise HTTPException(status_code=500, detail="Model H5 belum siap")

    # Min-Max Scaling
    v_scaled = (data.voltage - V_MIN) / (V_MAX - V_MIN)
    i_scaled = (data.current - I_MIN) / (I_MAX - I_MIN)
    p_scaled = (data.power - P_MIN) / (P_MAX - P_MIN)
    
    input_arr = np.array([[v_scaled, i_scaled, p_scaled]], dtype=np.float32)
    
    start_proc = time.perf_counter()
    prediction = model_h5(input_arr, training=False)
    end_proc = time.perf_counter()
        
    score = float(prediction[0][0])
    server_latency_ms = (end_proc - start_proc) * 1000
    
    return {
        "status": "success",
        "is_anomaly": 1 if score > 0.5 else 0,
        "server_inference_ms": round(server_latency_ms, 4)
    } 

# TINYML .tflite
@app.post("/tinypredict")
async def predict_tflite(data: SensorData):
    if interpreter is None:
        raise HTTPException(status_code=500, detail="Model TFLite belum siap")

    # Min-Max Scaling (Kondisi 100% sama dengan H5)
    v_scaled = (data.voltage - V_MIN) / (V_MAX - V_MIN)
    i_scaled = (data.current - I_MIN) / (I_MAX - I_MIN)
    p_scaled = (data.power - P_MIN) / (P_MAX - P_MIN)

    input_arr = np.array([[v_scaled, i_scaled, p_scaled]], dtype=np.float32)
    
    start_proc = time.perf_counter() 
    interpreter.set_tensor(input_details[0]['index'], input_arr)
    interpreter.invoke()
    prediction = interpreter.get_tensor(output_details[0]['index'])
    end_proc = time.perf_counter()
        
    probabilitas = float(prediction[0][0])
    server_latency_ms = (end_proc - start_proc) * 1000
    
    return {
        "status": "success",
        "is_anomaly": 1 if probabilitas > 0.5 else 0,
        "server_inference_ms": round(server_latency_ms, 4)
    }