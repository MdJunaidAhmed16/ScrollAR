import logging
import uuid

from sqlalchemy import create_engine, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.paper import Card, Paper
from app.services.arxiv_service import fetch_recent_sync
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _get_session():
    engine = create_engine(settings.sync_db_url)
    return sessionmaker(engine)(), engine


@celery_app.task(name="app.tasks.ingest_arxiv.ingest_arxiv_task")
def ingest_arxiv_task():
    papers_data = fetch_recent_sync(
        categories=settings.arxiv_categories_list,
        max_results=settings.ARXIV_FETCH_LIMIT,
    )
    logger.info(f"Fetched {len(papers_data)} papers from arXiv")

    session, engine = _get_session()
    new_count = 0
    queued_count = 0

    try:
        for paper_data in papers_data:
            stmt = (
                pg_insert(Paper)
                .values(**paper_data)
                .on_conflict_do_nothing(index_elements=["arxiv_id"])
                .returning(Paper.id)
            )
            result = session.execute(stmt)
            row = result.fetchone()
            if row:
                new_count += 1

        session.commit()

        # Queue card generation for ALL papers that don't have a card yet
        papers_without_cards = session.execute(
            select(Paper.id).outerjoin(Card, Card.paper_id == Paper.id).where(Card.id == None)
        ).scalars().all()

        from app.tasks.generate_summary import generate_summary_task
        for paper_id in papers_without_cards:
            generate_summary_task.delay(str(paper_id))
            queued_count += 1

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
        engine.dispose()

    logger.info(f"Ingestion complete: {new_count} new papers, {queued_count} summaries queued")
    return {"fetched": len(papers_data), "new": new_count, "queued": queued_count}
