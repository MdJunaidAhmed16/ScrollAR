#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting Celery worker in background..."
celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2 &

echo "Starting FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
