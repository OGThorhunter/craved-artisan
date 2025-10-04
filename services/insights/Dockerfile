FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    prophet==1.1.5 \
    scikit-learn==1.5.1 \
    pandas==2.2.2 \
    numpy==1.26.4 \
    pydantic==2.8.2

WORKDIR /app
COPY app /app

EXPOSE 9002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9002"]
