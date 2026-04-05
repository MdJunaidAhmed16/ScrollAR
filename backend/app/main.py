from contextlib import asynccontextmanager
import logging

import redis.asyncio as aioredis
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.routes import auth, feed, papers, admin

logger = logging.getLogger("scrollar")

# Global rate limiter — shared across routes
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate critical secrets on startup
    if settings.SECRET_KEY in ("change-me-in-production", "change-me-in-production-use-32-random-chars-min"):
        raise RuntimeError("SECRET_KEY is still the default value — set a real secret in .env")

    # Run DB migrations
    import subprocess
    try:
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            logger.error(f"Alembic migration failed:\n{result.stderr}")
        else:
            logger.info("Database migrations applied successfully")
    except FileNotFoundError:
        logger.warning("alembic not found on PATH — skipping auto-migration")

    # Auto-trigger ingestion if no papers OR papers exist without cards
    try:
        from sqlalchemy import select, func
        from app.database import async_session_maker
        from app.models.paper import Paper, Card
        async with async_session_maker() as session:
            paper_count = await session.scalar(select(func.count()).select_from(Paper))
            card_count = await session.scalar(select(func.count()).select_from(Card))
        if paper_count == 0 or card_count < paper_count:
            logger.info(f"Found {paper_count} papers, {card_count} cards — triggering ingestion...")
            from app.tasks.ingest_arxiv import ingest_arxiv_task
            ingest_arxiv_task.delay()
    except Exception as e:
        logger.error(f"Failed to trigger initial ingestion: {e}")

    yield
    await engine.dispose()


app = FastAPI(
    title="ScrollAr API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    # Disable interactive docs in production
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — only allow configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# Security headers on every response
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
