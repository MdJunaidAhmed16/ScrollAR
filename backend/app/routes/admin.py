from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, cast, func, select, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.paper import Card, Paper
from app.models.social import Bookmark, SwipeEvent
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not settings.ADMIN_EMAIL or current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@router.post("/ingest", status_code=status.HTTP_202_ACCEPTED)
async def trigger_ingest(admin: User = Depends(require_admin)):
    from app.tasks.ingest_arxiv import ingest_arxiv_task
    task = ingest_arxiv_task.delay()
    return {"task_id": task.id, "status": "queued"}


@router.post("/generate/{paper_id}", status_code=status.HTTP_202_ACCEPTED)
async def trigger_generate(paper_id: str, admin: User = Depends(require_admin)):
    import uuid
    try:
        uuid.UUID(paper_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid paper ID")
    from app.tasks.generate_summary import generate_summary_task
    task = generate_summary_task.delay(paper_id)
    return {"task_id": task.id, "status": "queued"}


@router.get("/stats")
async def get_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)

    # --- User counts ---
    total_users = await db.scalar(select(func.count()).select_from(User))
    new_today = await db.scalar(
        select(func.count()).select_from(User).where(User.created_at >= day_ago)
    )
    new_this_week = await db.scalar(
        select(func.count()).select_from(User).where(User.created_at >= week_ago)
    )
    dau = await db.scalar(
        select(func.count()).select_from(User).where(User.last_seen_at >= day_ago)
    )
    wau = await db.scalar(
        select(func.count()).select_from(User).where(User.last_seen_at >= week_ago)
    )

    # --- Paper / card counts ---
    total_papers = await db.scalar(select(func.count()).select_from(Paper))
    total_cards = await db.scalar(select(func.count()).select_from(Card))

    # --- Swipe stats ---
    total_swipes = await db.scalar(select(func.count()).select_from(SwipeEvent))
    swipes_today = await db.scalar(
        select(func.count()).select_from(SwipeEvent).where(SwipeEvent.swiped_at >= day_ago)
    )
    direction_counts = (await db.execute(
        select(SwipeEvent.direction, func.count().label("n"))
        .group_by(SwipeEvent.direction)
    )).all()
    swipes_by_direction = {row.direction: row.n for row in direction_counts}

    # --- Bookmarks ---
    total_bookmarks = await db.scalar(select(func.count()).select_from(Bookmark))

    # --- Retention: users active on 2+ distinct days ---
    retained = await db.scalar(
        select(func.count()).select_from(
            select(SwipeEvent.user_id)
            .group_by(SwipeEvent.user_id)
            .having(func.count(func.distinct(cast(SwipeEvent.swiped_at, Date))) >= 2)
            .subquery()
        )
    )

    # --- Signups per day (last 7 days) ---
    signup_rows = (await db.execute(
        select(
            cast(User.created_at, Date).label("day"),
            func.count().label("n"),
        )
        .where(User.created_at >= week_ago)
        .group_by("day")
        .order_by("day")
    )).all()
    signups_per_day = [{"date": str(r.day), "count": r.n} for r in signup_rows]

    # --- Swipes per day (last 7 days) ---
    swipe_rows = (await db.execute(
        select(
            cast(SwipeEvent.swiped_at, Date).label("day"),
            func.count().label("n"),
        )
        .where(SwipeEvent.swiped_at >= week_ago)
        .group_by("day")
        .order_by("day")
    )).all()
    swipes_per_day = [{"date": str(r.day), "count": r.n} for r in swipe_rows]

    # --- Top 5 liked papers ---
    top_papers_rows = (await db.execute(
        select(Paper.title, func.count(SwipeEvent.id).label("likes"))
        .join(SwipeEvent, SwipeEvent.paper_id == Paper.id)
        .where(SwipeEvent.direction == "right")
        .group_by(Paper.id, Paper.title)
        .order_by(func.count(SwipeEvent.id).desc())
        .limit(5)
    )).all()
    top_papers = [{"title": r.title, "likes": r.likes} for r in top_papers_rows]

    # --- Recent users (last 10) ---
    recent_users_rows = (await db.execute(
        select(User.username, User.email, User.created_at, User.last_seen_at)
        .order_by(User.created_at.desc())
        .limit(10)
    )).all()
    recent_users = [
        {
            "username": r.username,
            "email": r.email,
            "joined": r.created_at.isoformat() if r.created_at else None,
            "last_seen": r.last_seen_at.isoformat() if r.last_seen_at else None,
        }
        for r in recent_users_rows
    ]

    return {
        "users": {
            "total": total_users,
            "new_today": new_today,
            "new_this_week": new_this_week,
            "dau": dau,
            "wau": wau,
            "retained": retained,
        },
        "content": {
            "papers": total_papers,
            "cards": total_cards,
        },
        "engagement": {
            "total_swipes": total_swipes,
            "swipes_today": swipes_today,
            "by_direction": swipes_by_direction,
            "total_bookmarks": total_bookmarks,
        },
        "charts": {
            "signups_per_day": signups_per_day,
            "swipes_per_day": swipes_per_day,
        },
        "top_papers": top_papers,
        "recent_users": recent_users,
    }
