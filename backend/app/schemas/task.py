from datetime import datetime
from pydantic import BaseModel


class TaskResponse(BaseModel):
    id: int
    project_id: int
    user_story_id: int | None
    title: str
    description: str
    order: int
    effort: str
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None
