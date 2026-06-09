from sqlalchemy.orm import Session

from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    # method to get all projects by user id
    def list_by_user(self, user_id: int) -> list[Project]:
        return self.db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()

    # method to get project by id
    def get(self, project_id: int, user_id: int) -> Project | None:
        return self.db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()

    # method to create project
    def create(self, user_id: int, title: str, description: str) -> Project:
        project = Project(user_id=user_id, title=title, description=description)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    # method to delete project
    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
