from pydantic import BaseModel


class GenerateRequest(BaseModel):
    description: str
    mode: str = "us_and_tasks"


class EffortHours(BaseModel):
    min: float
    max: float


class TaskGenerated(BaseModel):
    id: str = ""
    user_story_id: str = ""
    title: str
    description: str
    order: int = 0
    effort: str = "M"
    effort_hours: EffortHours = EffortHours(min=2, max=6)
    confidence: float = 0.8
    assumptions: list[str] = []


class UserStoryGenerated(BaseModel):
    id: str = ""
    title: str
    description: str = ""
    order: int = 0
    tasks: list[TaskGenerated] = []


class MetaInfo(BaseModel):
    generation_time_ms: int = 0
    cache_hit: bool = False
    model: str = "llama-3.3-70b-versatile"


class GenerateResponse(BaseModel):
    project_title: str = ""
    project_summary: str = ""
    mode: str = "us_and_tasks"
    user_stories: list[UserStoryGenerated] = []
    tasks: list[TaskGenerated] = []
    warnings: list[str] = []
    assumptions_required: list[str] = []
    meta: MetaInfo = MetaInfo()
