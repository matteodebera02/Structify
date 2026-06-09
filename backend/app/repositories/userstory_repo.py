from sqlalchemy.orm import Session

from app.models.user_story import UserStory


class UserStoryRepository:
    def __init__(self, db: Session):
        self.db = db

    # method to create a user story
    def create(self, project_id: int, title: str, description: str, order: int) -> UserStory:
        us = UserStory(project_id=project_id, title=title, description=description, order=order)
        self.db.add(us)
        self.db.commit()
        self.db.refresh(us)
        return us
