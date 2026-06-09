from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from app.schemas.generate import GenerateResponse
from app.schemas.task import TaskResponse


class UserStoryResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    order: int
    tasks: list[TaskResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    user_stories: list[UserStoryResponse] = []
    tasks: list[TaskResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    title: str
    description: str
    mode: str = "us_and_tasks"
    generated: Optional[GenerateResponse] = None  # if provided, skip AI generation


class AddFeatureRequest(BaseModel):
    description: str
    mode: str = "us_and_tasks"
