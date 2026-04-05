FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

# Local dev: just run uvicorn (docker-compose handles migrations separately)
# Production (Render): start.sh runs migrations + worker + uvicorn together
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
