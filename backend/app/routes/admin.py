from fastapi import APIRouter, Depends, HTTPException, status

from app.config import settings
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not settings.ADMIN_EMAIL or current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
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
