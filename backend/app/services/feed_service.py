import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.paper import Card, Paper
from app.models.social import Bookmark, Like, SwipeEvent


async def get_feed(
    user_id: uuid.UUID,
    db: AsyncSession,
    limit: int = 20,
    cursor: str | None = None,
) -> tuple[list[dict], str | None]:
    """
    Returns unseen cards for the user, newest first.
    cursor is the arxiv_id of the last item seen (for pagination).
    """
    # Subquery: paper IDs the user has already swiped
    swiped_subq = (
        select(SwipeEvent.paper_id)
        .where(SwipeEvent.user_id == user_id)
        .scalar_subquery()
    )

    # Main query: papers with cards, not yet swiped by this user
    stmt = (
        select(Paper)
        .join(Card, Card.paper_id == Paper.id)
        .where(Paper.id.not_in(swiped_subq))
        .options(selectinload(Paper.card))
        .order_by(Paper.published_at.desc())
        .limit(limit + 1)
    )

    if cursor:
        # Cursor is the published_at timestamp of the last item
        try:
            cursor_dt = datetime.fromisoformat(cursor)
            stmt = stmt.where(Paper.published_at < cursor_dt)
        except ValueError:
            pass

    result = await db.execute(stmt)
    papers = result.scalars().all()

    # Determine next cursor
    has_more = len(papers) > limit
    papers = list(papers[:limit])
    next_cursor = papers[-1].published_at.isoformat() if has_more and papers else None

    if not papers:
        return [], None

    paper_ids = [p.id for p in papers]

    # Fetch bookmarks for this user + these papers
    bookmark_result = await db.execute(
        select(Bookmark.paper_id)
        .where(Bookmark.user_id == user_id, Bookmark.paper_id.in_(paper_ids))
    )
    bookmarked_ids = set(bookmark_result.scalars().all())

    # Fetch like counts
    like_result = await db.execute(
        select(Like.paper_id, func.count(Like.id).label("cnt"))
        .where(Like.paper_id.in_(paper_ids))
        .group_by(Like.paper_id)
    )
    like_counts = {row.paper_id: row.cnt for row in like_result}

    items = []
    for paper in papers:
        items.append({
            "paper": paper,
            "card": paper.card,
            "is_bookmarked": paper.id in bookmarked_ids,
            "like_count": like_counts.get(paper.id, 0),
        })

    return items, next_cursor
