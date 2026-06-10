import logging

from fastapi import HTTPException

from app.repositories.project_repo import ProjectRepository
from app.repositories.task_repo import TaskRepository
from app.repositories.userstory_repo import UserStoryRepository
from app.schemas.generate import GenerateRequest, GenerateResponse
from app.schemas.project import ProjectResponse
from app.models.project import Project
from app.services.ai_service import generate_structure

logger = logging.getLogger(__name__)


def _save_generated(project: Project, result: GenerateResponse,
                    task_repo: TaskRepository, us_repo: UserStoryRepository) -> None:
    nested_task_ids: set[str] = set()

    for us_data in result.user_stories:
        us = us_repo.create(project.id, us_data.title, us_data.description, us_data.order)
        for t in us_data.tasks:
            task_repo.create(project.id, us.id, t.title, t.description, t.order, t.effort, t.confidence)
            nested_task_ids.add(t.id)

    # only save tasks not already saved inside a US (handles tasks_only mode and orphans)
    orphan_tasks = [t for t in result.tasks if t.id not in nested_task_ids]
    for t in orphan_tasks:
        task_repo.create(project.id, None, t.title, t.description, t.order, t.effort, t.confidence)

    logger.info("saved project=%d stories=%d tasks=%d orphan_tasks=%d",
                project.id, len(result.user_stories), len(nested_task_ids), len(orphan_tasks))


class ProjectService:
    def __init__(self, project_repo: ProjectRepository, task_repo: TaskRepository,
                 us_repo: UserStoryRepository):
        self.project_repo = project_repo
        self.task_repo = task_repo
        self.us_repo = us_repo

    def list_projects(self, user_id: int) -> list[ProjectResponse]:
        projects = self.project_repo.list_by_user(user_id)
        return [ProjectResponse.model_validate(p) for p in projects]

    async def create_project(self, user_id: int, title: str, description: str, mode: str,
                              generated: GenerateResponse | None = None) -> ProjectResponse:
        logger.info("create user=%d mode=%s pre_generated=%s", user_id, mode, generated is not None)
        project = self.project_repo.create(user_id, title, description)
        if generated is not None:
            result = generated
        else:
            result = await generate_structure(GenerateRequest(description=description, mode=mode))
        _save_generated(project, result, self.task_repo, self.us_repo)
        self.project_repo.db.refresh(project)
        return ProjectResponse.model_validate(project)

    def get_project(self, project_id: int, user_id: int) -> ProjectResponse:
        project = self.project_repo.get(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectResponse.model_validate(project)

    def delete_project(self, project_id: int, user_id: int) -> None:
        project = self.project_repo.get(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        self.project_repo.delete(project)
        logger.info("deleted project=%d user=%d", project_id, user_id)

    async def add_feature(self, project_id: int, user_id: int, description: str, mode: str,
                           api_key: str | None = None) -> ProjectResponse:
        logger.info("add_feature project=%d user=%d mode=%s", project_id, user_id, mode)
        project = self.project_repo.get(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        result = await generate_structure(GenerateRequest(description=description, mode=mode), api_key=api_key)
        _save_generated(project, result, self.task_repo, self.us_repo)
        self.project_repo.db.refresh(project)
        return ProjectResponse.model_validate(project)
