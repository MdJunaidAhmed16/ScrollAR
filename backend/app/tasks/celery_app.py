from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "scrollar",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.ingest_arxiv", "app.tasks.generate_summary"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    beat_schedule={
        "ingest-arxiv-periodically": {
            "task": "app.tasks.ingest_arxiv.ingest_arxiv_task",
            "schedule": crontab(minute="0", hour=f"*/{settings.ARXIV_INGEST_INTERVAL_HOURS}"),
        }
    },
)
