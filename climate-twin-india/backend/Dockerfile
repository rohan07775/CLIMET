FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app files
COPY . .

EXPOSE 8000

# Automatically seed database, train models, and start the FastAPI application
CMD ["sh", "-c", "python -m app.db.init_db && python -m app.ml.train --model all && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
