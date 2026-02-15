import tensorflow as tf
import numpy as np
import time
import os

# OPTIONAL: batasi thread supaya stabil
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

# Load model
model = tf.keras.models.load_model("model/model_dnn(sigmoid).h5")

# Convert ke graph mode
@tf.function
def infer(x):
    return model(x, training=False)

# Gunakan tensor langsung (hindari numpy → tensor conversion berulang)
input_tensor = tf.constant([[220.0, 0.5, 110.0]], dtype=tf.float32)

# Warm-up
for _ in range(50):
    infer(input_tensor)

# Benchmark
N = 2000
start = time.perf_counter()

for _ in range(N):
    infer(input_tensor)

end = time.perf_counter()

avg_latency_ms = (end - start) / N * 1000
print(f"Rata-rata pure inference optimal: {avg_latency_ms:.4f} ms")
