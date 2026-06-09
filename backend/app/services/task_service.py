import logging

from fastapi import HTTPException

from app.repositories.task_repo import TaskRepository
from app.schemas.task import TaskResponse, TaskUpdate

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self, repo: TaskRepository):
        self.repo = repo

    def update(self, task_id: int, data: TaskUpdate) -> TaskResponse:
        task = self.repo.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        updated = self.repo.update(task, **data.model_dump(exclude_none=True))
        logger.info("updated task=%d", task_id)
        return TaskResponse.model_validate(updated)

    def complete(self, task_id: int) -> TaskResponse:
        task = self.repo.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        updated = self.repo.toggle_complete(task)
        logger.info("task=%d completed=%s", task_id, updated.completed)
        return TaskResponse.model_validate(updated)
