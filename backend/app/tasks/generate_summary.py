import logging
import uuid

from sqlalchemy import create_engine, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.paper import Card, Paper
from app.services.claude_service import ClaudeParseError, generate_card_content
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _get_session():
    engine = create_engine(settings.sync_db_url)
    return sessionmaker(engine)(), engine


@celery_app.task(
    name="app.tasks.generate_summary.generate_summary_task",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def generate_summary_task(self, paper_id: str):
    session, engine = _get_session()
    try:
        paper = session.execute(
            select(Paper).where(Paper.id == uuid.UUID(paper_id))
        ).scalar_one_or_none()

        if not paper:
            logger.error(f"Paper {paper_id} not found")
            return

        existing = session.execute(
            select(Card.id).where(Card.paper_id == paper.id)
        ).scalar_one_or_none()

        if existing:
            logger.info(f"Card already exists for {paper_id}, skipping")
            return

        title = paper.title
        abstract = paper.abstract
        paper_uuid = paper.id
    finally:
        session.close()
        engine.dispose()

    # Call OpenRouter outside the DB session
    try:
        card_data = generate_card_content(title=title, abstract=abstract)
    except ClaudeParseError as exc:
        logger.warning(f"Parse error for {paper_id}, retrying: {exc}")
        raise self.retry(exc=exc)
    except Exception as exc:
        logger.error(f"OpenRouter error for {paper_id}: {exc}")
        raise self.retry(exc=exc)

    session2, engine2 = _get_session()
    try:
        stmt = (
            pg_insert(Card)
            .values(
                paper_id=paper_uuid,
                hook=card_data["hook"],
                eli5=card_data["eli5"],
                key_finding=card_data["key_finding"],
                why_it_matters=card_data["why_it_matters"],
                tags=card_data["tags"],
                difficulty=card_data["difficulty"],
                key_contributions=card_data["key_contributions"],
                model_version=settings.OPENROUTER_MODEL,
            )
            .on_conflict_do_nothing(index_elements=["paper_id"])
        )
        session2.execute(stmt)
        session2.commit()
        logger.info(f"Card generated for {paper_id}: {card_data['hook'][:60]}...")
    except Exception:
        session2.rollback()
        raise
    finally:
        session2.close()
        engine2.dispose()
