import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.repositories.task_repo import TaskRepository
from app.schemas.task import TaskResponse, TaskUpdate
from app.services.task_service import TaskService

logger = logging.getLogger(__name__)

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(db))


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate,
                _=Depends(get_current_user),
                service: TaskService = Depends(get_service)):
    return service.update(task_id, data)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, _=Depends(get_current_user),
                  service: TaskService = Depends(get_service)):
    return service.complete(task_id)
