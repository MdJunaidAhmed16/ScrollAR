from contextlib import asynccontextmanager
import logging

import redis.asyncio as aioredis
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.limiter import limiter
from app.routes import auth, feed, papers, admin

logger = logging.getLogger("scrollar")


def _trigger_ingestion():
    from app.tasks.ingest_arxiv import ingest_arxiv_task
    ingest_arxiv_task.delay()
    logger.info("Scheduled ingestion triggered")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.SECRET_KEY in ("change-me-in-production", "CHANGE_ME_GENERATE_A_REAL_SECRET"):
        raise RuntimeError("SECRET_KEY is still the default — set a real secret in .env")

    # Auto-trigger ingestion if no cards yet
    try:
        from sqlalchemy import select, func
        from app.database import async_session_maker
        from app.models.paper import Paper, Card
        async with async_session_maker() as session:
            paper_count = await session.scalar(select(func.count()).select_from(Paper))
            card_count = await session.scalar(select(func.count()).select_from(Card))
        if paper_count == 0 or card_count < paper_count:
            logger.info(f"Found {paper_count} papers, {card_count} cards — triggering ingestion...")
            _trigger_ingestion()
    except Exception as e:
        logger.error(f"Failed to trigger initial ingestion: {e}")

    # APScheduler replaces Celery Beat — runs ingestion every N hours
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        _trigger_ingestion,
        "interval",
        hours=settings.ARXIV_INGEST_INTERVAL_HOURS,
        id="ingest_arxiv",
    )
    scheduler.start()

    yield

    scheduler.shutdown()
    await engine.dispose()


app = FastAPI(
    title="ScrollAr API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def error_alert_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        if response.status_code >= 500:
            import asyncio
            from app.services.email_service import send_error_alert
            asyncio.get_event_loop().run_in_executor(
                None,
                send_error_alert,
                request.url.path,
                request.method,
                f"HTTP {response.status_code}",
            )
        return response
    except Exception as exc:
        import asyncio
        from app.services.email_service import send_error_alert
        asyncio.get_event_loop().run_in_executor(
            None,
            send_error_alert,
            request.url.path,
            request.method,
            str(exc),
        )
        raise


app.include_router(auth.router, prefix="/api")
app.include_router(feed.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/health")
async def health():
    from app.database import async_session_maker
    db_ok = False
    redis_ok = False

    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
        redis_ok = True
    except Exception:
        pass

    return {"status": "ok" if (db_ok and redis_ok) else "degraded", "db": db_ok, "redis": redis_ok}
