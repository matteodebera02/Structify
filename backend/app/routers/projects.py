import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.project_repo import ProjectRepository
from app.repositories.task_repo import TaskRepository
from app.repositories.userstory_repo import UserStoryRepository
from app.schemas.project import AddFeatureRequest, ProjectCreate, ProjectResponse
from app.services.project_service import ProjectService

logger = logging.getLogger(__name__)

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> ProjectService:
    return ProjectService(ProjectRepository(db), TaskRepository(db), UserStoryRepository(db))


@router.get("", response_model=list[ProjectResponse])
def list_projects(user: User = Depends(get_current_user), service: ProjectService = Depends(get_service)):
    return service.list_projects(user.id)


@router.post("", response_model=ProjectResponse)
async def create_project(data: ProjectCreate, user: User = Depends(get_current_user),
                         service: ProjectService = Depends(get_service)):
    return await service.create_project(user.id, data.title, data.description, data.mode, data.generated)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, user: User = Depends(get_current_user),
                service: ProjectService = Depends(get_service)):
    return service.get_project(project_id, user.id)


@router.delete("/{project_id}")
def delete_project(project_id: int, user: User = Depends(get_current_user),
                   service: ProjectService = Depends(get_service)):
    service.delete_project(project_id, user.id)
    return {"ok": True}


@router.post("/{project_id}/features", response_model=ProjectResponse)
async def add_feature(project_id: int, data: AddFeatureRequest,
                      user: User = Depends(get_current_user),
                      service: ProjectService = Depends(get_service)):
    return await service.add_feature(project_id, user.id, data.description, data.mode,
                                     api_key=user.groq_api_key or None)
