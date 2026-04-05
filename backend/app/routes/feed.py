from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.paper import Paper
from app.models.social import Bookmark, SwipeEvent
from app.models.user import User
from app.schemas.feed import (
    BookmarkToggleResponse,
    CardResponse,
    FeedItem,
    FeedResponse,
    PaperBrief,
    SwipeRequest,
)
from app.services.feed_service import get_feed

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("", response_model=FeedResponse)
async def feed(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items, next_cursor = await get_feed(
        user_id=current_user.id,
        db=db,
        limit=limit,
        cursor=cursor,
    )

    feed_items = [
        FeedItem(
            paper=PaperBrief.model_validate(item["paper"]),
            card=CardResponse.model_validate(item["card"]),
            is_bookmarked=item["is_bookmarked"],
            like_count=item["like_count"],
        )
        for item in items
    ]

    return FeedResponse(
        items=feed_items,
        next_cursor=next_cursor,
        total_returned=len(feed_items),
    )


@router.post("/swipe", status_code=status.HTTP_204_NO_CONTENT)
async def swipe(
    payload: SwipeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        pg_insert(SwipeEvent)
        .values(user_id=current_user.id, paper_id=payload.paper_id, direction=payload.direction)
        .on_conflict_do_nothing(constraint="uq_swipe_user_paper")
    )
    await db.execute(stmt)

    # Auto-bookmark on swipe up (save)
    if payload.direction == "up":
        bookmark_stmt = (
            pg_insert(Bookmark)
            .values(user_id=current_user.id, paper_id=payload.paper_id)
            .on_conflict_do_nothing(constraint="uq_bookmark_user_paper")
        )
        await db.execute(bookmark_stmt)

    await db.commit()


@router.get("/bookmarks", response_model=list[FeedItem])
async def get_bookmarks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Paper)
        .join(Bookmark, Bookmark.paper_id == Paper.id)
        .where(Bookmark.user_id == current_user.id)
        .options(selectinload(Paper.card))
        .order_by(Bookmark.created_at.desc())
    )
    papers = result.scalars().all()

    return [
        FeedItem(
            paper=PaperBrief.model_validate(p),
            card=CardResponse.model_validate(p.card),
            is_bookmarked=True,
        )
        for p in papers if p.card
    ]
