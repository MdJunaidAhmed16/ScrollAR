from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.paper import Paper
from app.models.social import Bookmark
from app.models.user import User
from app.schemas.feed import BookmarkToggleResponse, CardResponse, FeedItem, PaperBrief

router = APIRouter(prefix="/papers", tags=["papers"])


@router.get("/{arxiv_id}", response_model=FeedItem)
async def get_paper(
    arxiv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Paper)
        .where(Paper.arxiv_id == arxiv_id)
        .options(selectinload(Paper.card))
    )
    paper = result.scalar_one_or_none()

    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
    if not paper.card:
        raise HTTPException(status_code=status.HTTP_202_ACCEPTED, detail="Card generation in progress")

    bookmark_result = await db.execute(
        select(Bookmark.id).where(
            Bookmark.user_id == current_user.id,
            Bookmark.paper_id == paper.id,
        )
    )
    is_bookmarked = bookmark_result.scalar_one_or_none() is not None

    return FeedItem(
        paper=PaperBrief.model_validate(paper),
        card=CardResponse.model_validate(paper.card),
        is_bookmarked=is_bookmarked,
    )


@router.get("/{arxiv_id}/pdf")
async def get_pdf(arxiv_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Paper.pdf_url).where(Paper.arxiv_id == arxiv_id))
    pdf_url = result.scalar_one_or_none()

    if not pdf_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    return RedirectResponse(url=pdf_url, status_code=status.HTTP_302_FOUND)


@router.post("/{arxiv_id}/bookmark", response_model=BookmarkToggleResponse)
async def toggle_bookmark(
    arxiv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    paper_result = await db.execute(select(Paper.id).where(Paper.arxiv_id == arxiv_id))
    paper_id = paper_result.scalar_one_or_none()

    if not paper_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    existing = await db.execute(
        select(Bookmark).where(Bookmark.user_id == current_user.id, Bookmark.paper_id == paper_id)
    )
    bookmark = existing.scalar_one_or_none()

    if bookmark:
        await db.delete(bookmark)
        await db.commit()
        return BookmarkToggleResponse(bookmarked=False, paper_id=paper_id)
    else:
        db.add(Bookmark(user_id=current_user.id, paper_id=paper_id))
        await db.commit()
        return BookmarkToggleResponse(bookmarked=True, paper_id=paper_id)
