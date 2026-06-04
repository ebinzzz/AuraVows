# Backend Dockerfile — optimized for Railway
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies first (layer cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create static/uploads directory (note: ephemeral on Railway — use cloud storage for persistence)
RUN mkdir -p static/uploads

# Expose the port — Railway injects $PORT at runtime
EXPOSE 8000

# Run with the PORT env var Railway provides (defaults to 8000 for local)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
