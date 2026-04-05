import uuid
from datetime import datetime

from pydantic import BaseModel


class PaperBrief(BaseModel):
    id: uuid.UUID
    arxiv_id: str
    title: str
    authors: list[str]
    categories: list[str]
    published_at: datetime
    pdf_url: str
    arxiv_url: str

    model_config = {"from_attributes": True}


class CardResponse(BaseModel):
    id: uuid.UUID
    paper_id: uuid.UUID
    hook: str
    eli5: str
    key_finding: str
    why_it_matters: str
    tags: list[str]
    difficulty: str
    key_contributions: list
    generated_at: datetime

    model_config = {"from_attributes": True}


class FeedItem(BaseModel):
    paper: PaperBrief
    card: CardResponse
    is_bookmarked: bool = False
    like_count: int = 0


class FeedResponse(BaseModel):
    items: list[FeedItem]
    next_cursor: str | None
    total_returned: int


class SwipeRequest(BaseModel):
    paper_id: uuid.UUID
    direction: str  # left | right | up

    def model_post_init(self, __context) -> None:
        if self.direction not in ("left", "right", "up"):
            raise ValueError("direction must be left, right, or up")


class BookmarkToggleResponse(BaseModel):
    bookmarked: bool
    paper_id: uuid.UUID
