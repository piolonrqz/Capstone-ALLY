# ================================
# STAGE 1: Builder (installs deps)
# ================================
FROM python:3.12-slim AS builder
WORKDIR /app

# Install build dependencies for PyTorch / sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        git \
        curl \
        libglib2.0-0 \
        libgl1 \
        libopencv-dev \
        && rm -rf /var/lib/apt/lists/*

# Copy dependency file
COPY requirements.txt .

# Install dependencies into a separate folder
RUN pip install --upgrade pip
RUN pip install --prefix=/install -r requirements.txt


# ================================
# STAGE 2: Runtime (lighter)
# ================================
FROM python:3.12-slim
WORKDIR /app

# Install lightweight runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libgl1 \
        && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy app source code
COPY . .

# Environment vars (useful in Render/Vercel)
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

# Start API with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
 