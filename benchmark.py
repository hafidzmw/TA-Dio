import tensorflow as tf
import numpy as np
import time

# Load model sekali saja
model = tf.keras.models.load_model("model/model_dnn(sigmoid).h5")

# Dummy input (sesuaikan dengan input model)
input_arr = np.array([[220.0, 0.5, 110.0]], dtype=np.float32)

# 1️⃣ Warm-up (penting!)
for _ in range(20):
    model(input_arr, training=False)

# 2️⃣ Benchmark loop
N = 1000  # jumlah pengulangan
start = time.perf_counter()

for _ in range(N):
    model(input_arr, training=False)

end = time.perf_counter()

avg_latency_ms = (end - start) / N * 1000

print(f"Rata-rata pure inference: {avg_latency_ms:.4f} ms")
