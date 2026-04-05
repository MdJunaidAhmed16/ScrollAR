from celery import Celery
from celery.schedules import crontab

from app.config import settings


def _force_tls(url: str) -> str:
    """Ensure Upstash (and any TLS Redis) uses rediss:// scheme."""
    if url.startswith("redis://") and not url.startswith("rediss://"):
        return "rediss://" + url[len("redis://"):]
    return url


_broker = _force_tls(settings.CELERY_BROKER_URL)
_backend = _force_tls(settings.CELERY_RESULT_BACKEND)

celery_app = Celery(
    "scrollar",
    broker=_broker,
    backend=_backend,
    include=["app.tasks.ingest_arxiv", "app.tasks.generate_summary"],
)

# SSL options required for Upstash Redis (TLS)
_ssl_opts = {"ssl_cert_reqs": "none"}

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    broker_use_ssl=_ssl_opts,
    redis_backend_use_ssl=_ssl_opts,
    beat_schedule={
        "ingest-arxiv-periodically": {
            "task": "app.tasks.ingest_arxiv.ingest_arxiv_task",
            "schedule": crontab(minute="0", hour=f"*/{settings.ARXIV_INGEST_INTERVAL_HOURS}"),
        }
    },
)
