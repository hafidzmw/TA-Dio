from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import os
import time

app = FastAPI()

# Ambil path model dari environment variable (settingan docker-compose)
MODEL_FILE = os.getenv("MODEL_PATH", "model/model_dnn_tinyml.tflite")

# Global variables untuk TFLite Interpreter
interpreter = None
input_details = None
output_details = None

# ==========================================
# KONFIGURASI MIN-MAX SCALER
# Ganti angka di bawah ini dengan nilai min dan max dari dataset latihmu!
# ==========================================
V_MIN, V_MAX = 214.6, 234.0   # Tegangan
I_MIN, I_MAX = 0.0, 6.74     # Arus
P_MIN, P_MAX = 0.0, 1453.0  # Daya

@app.on_event("startup")
def load_model():
    global interpreter, input_details, output_details
    print(f"Mencoba memuat model TFLite dari: {MODEL_FILE}")
    
    if os.path.exists(MODEL_FILE):
        # 1. Inisialisasi TFLite Interpreter
        interpreter = tf.lite.Interpreter(model_path=MODEL_FILE)
        
        # 2. Alokasi memori untuk tensor (wajib untuk TFLite)
        interpreter.allocate_tensors()
        
        # 3. Dapatkan informasi detail untuk input dan output
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print("Model TFLite berhasil dimuat dan tensor dialokasikan.")

        print("Optimalisasi sistem (Warm-up)...")
        # Warm-up menggunakan data yang sudah di-scale (contoh: nilai tengah / 0.5)
        dummy_scaled = np.array([[0.5, 0.5, 0.5]], dtype=np.float32)
        for _ in range(20):
            interpreter.set_tensor(input_details[0]['index'], dummy_scaled)
            interpreter.invoke()
            _ = interpreter.get_tensor(output_details[0]['index'])
        print("Warm-up selesai! Server siap menerima request dengan cepat.")
    else:
        print("Error: Model tidak ditemukan di path tersebut.")

class SensorData(BaseModel):
    voltage: float
    current: float
    power: float

@app.post("/tinypredict")
async def predict_data(data: SensorData):
    if interpreter is None:
        raise HTTPException(status_code=500, detail="Model belum siap")

    # 1. Proses Min-Max Scaling pada data mentah yang masuk
    v_scaled = (data.voltage - V_MIN) / (V_MAX - V_MIN)
    i_scaled = (data.current - I_MIN) / (I_MAX - I_MIN)
    p_scaled = (data.power - P_MIN) / (P_MAX - P_MIN)

    # 2. Masukkan data yang sudah dinormalisasi ke array float32
    input_arr = np.array([[v_scaled, i_scaled, p_scaled]], dtype=np.float32)
    
    # --- Mulai hitung latensi inferensi ---
    start_proc = time.perf_counter() 
    
    # Masukkan data ke dalam tensor input
    interpreter.set_tensor(input_details[0]['index'], input_arr)
    
    # Jalankan inferensi
    interpreter.invoke()
    
    # Ambil hasil prediksi dari tensor output
    prediction = interpreter.get_tensor(output_details[0]['index'])
    
    end_proc = time.perf_counter()
    # --- Selesai hitung latensi ---
        
    # Ambil probabilitas (0.0 - 1.0) dari fungsi sigmoid
    probabilitas = float(prediction[0][0])
    server_latency_ms = (end_proc - start_proc) * 1000
    
    # Klasifikasi langsung ke 0 atau 1 (tanpa konfigurasi threshold eksternal)
    state_akhir = 1 if probabilitas > 0.5 else 0
    
    return {
        "status": "success",
        "is_anomaly": state_akhir,
        "server_inference_ms": round(server_latency_ms, 4)
    }