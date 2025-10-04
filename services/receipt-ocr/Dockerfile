FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    paddlepaddle==2.6.1 \
    paddleocr==2.7.1 \
    doctr[torch]==0.7.1 \
    python-multipart==0.0.6 \
    pydantic==2.8.2 \
    pillow==10.1.0

WORKDIR /app
COPY app /app

EXPOSE 9001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9001"]
