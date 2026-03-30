FROM python:3.11-slim

# Set folder kerja di dalam container
WORKDIR /app

# Copy requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy sisa file (app.py)
COPY . .

# Expose port
EXPOSE 5000

# Perintah default (bisa di-override oleh docker-compose)
CMD ["uvicorn", "execution-code:app", "--host", "0.0.0.0", "--port", "5000"]