# Step 1: Build environment
FROM python:3.12-slim AS builder
WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Step 2: Runtime image (smaller)
FROM python:3.12-slim
WORKDIR /app

# Copy installed site-packages and application
COPY --from=builder /usr/local /usr/local
COPY --from=builder /app /app

EXPOSE 8000

# Start FastAPI with uvicorn
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]