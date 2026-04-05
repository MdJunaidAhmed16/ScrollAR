import json
import logging

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status

from app.config import settings

logger = logging.getLogger(__name__)

_initialized = False


def _init() -> None:
    global _initialized
    if _initialized:
        return
    if not settings.FIREBASE_CREDENTIALS_JSON:
        raise RuntimeError("FIREBASE_CREDENTIALS_JSON env var is not set")
    cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    _initialized = True


def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims."""
    _init()
    try:
        return auth.verify_id_token(id_token)
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Firebase token expired")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed")
