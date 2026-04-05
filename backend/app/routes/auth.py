from sqlalchemy import func
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(user: User) -> UserResponse:
    data = UserResponse.model_validate(user)
    data.is_admin = bool(settings.ADMIN_EMAIL and user.email == settings.ADMIN_EMAIL)
    return data


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.last_seen_at = func.now()
    db.add(current_user)
    await db.commit()
    return _user_response(current_user)
