import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.project_repo import ProjectRepository
from app.services.export_service import export_csv, to_json, to_markdown

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_project(project_id: int, user: User, db: Session):
    project = ProjectRepository(db).get(project_id, user.id)
    if not project:
        raise HTTPException(404, "Not found")
    return project


@router.get("/{project_id}/export/markdown")
def export_markdown(project_id: int, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    project = _get_project(project_id, user, db)
    logger.info("export md project=%d user=%d", project_id, user.id)
    filename = project.title.replace('"', '') or "project"
    return Response(
        content=to_markdown(project),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}.md"'},
    )


@router.get("/{project_id}/export/json")
def export_json(project_id: int, user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    project = _get_project(project_id, user, db)
    logger.info("export json project=%d user=%d", project_id, user.id)
    filename = project.title.replace('"', '') or "project"
    return Response(
        content=to_json(project),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}.json"'},
    )


@router.get("/{project_id}/export/csv")
def export_csv_endpoint(project_id: int, user: User = Depends(get_current_user),
                        db: Session = Depends(get_db)):
    project = _get_project(project_id, user, db)
    logger.info("export csv project=%d user=%d", project_id, user.id)
    filename = project.title.replace('"', '') or "project"
    return Response(
        content=export_csv(project),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}.csv"'},
    )
