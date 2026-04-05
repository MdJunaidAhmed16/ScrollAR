import re
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services.firebase_service import verify_firebase_token

bearer_scheme = HTTPBearer()


def _derive_username(email: str) -> str:
    """Turn an email address into a safe username."""
    base = email.split("@")[0].lower()
    base = re.sub(r"[^a-z0-9_-]", "", base)[:40] or "user"
    return base


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    claims = verify_firebase_token(credentials.credentials)
    firebase_uid: str = claims["uid"]
    email: str = claims.get("email", "")

    # Look up by firebase_uid first
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()

    if user is None:
        # First sign-in — create the user
        username = _derive_username(email)

        # Ensure username uniqueness
        existing = await db.execute(select(User.username).where(User.username == username))
        if existing.scalar_one_or_none():
            username = f"{username}_{secrets.token_hex(3)}"

        user = User(firebase_uid=firebase_uid, email=email, username=username)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account inactive")

    return user
