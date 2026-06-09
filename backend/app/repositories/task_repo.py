from sqlalchemy.orm import Session

from app.models.task import Task


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    # method to get a task by id
    def get(self, task_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id).first()

    # method to create a task
    def create(self, project_id: int, user_story_id: int | None, title: str,
               description: str, order: int, effort: str) -> Task:
        task = Task(
            project_id=project_id, user_story_id=user_story_id,
            title=title, description=description, order=order, effort=effort,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    # method to update a task
    def update(self, task: Task, **kwargs) -> Task:
        for k, v in kwargs.items():
            if v is not None:
                setattr(task, k, v)
        self.db.commit()
        self.db.refresh(task)
        return task

    # method to toggle the completion of a task
    def toggle_complete(self, task: Task) -> Task:
        task.completed = not task.completed
        self.db.commit()
        self.db.refresh(task)
        return task
