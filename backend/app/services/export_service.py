import csv
import io
import json

from app.models.project import Project

EFFORT_HOURS: dict[str, dict[str, float]] = {
    "S": {"min": 0.5, "max": 2},
    "M": {"min": 2,   "max": 6},
    "L": {"min": 6,   "max": 8},
}
EFFORT_LABEL = {"S": "0.5–2h", "M": "2–6h", "L": "6–8h"}
EFFORT_PRIORITY = {"S": "Low", "M": "Medium", "L": "High"}


def _orphan_tasks(project: Project):
    linked_ids = {t.id for us in project.user_stories for t in us.tasks}
    return sorted(
        [t for t in project.tasks if t.id not in linked_ids],
        key=lambda t: t.order,
    )


def to_markdown(project: Project) -> str:
    lines: list[str] = [f"# {project.title}", f"> {project.description}", ""]

    if project.user_stories:
        for i, us in enumerate(sorted(project.user_stories, key=lambda u: u.order), 1):
            lines.append(f"## US {i} — {us.title}")
            lines.append(f"> {us.description}")
            lines.append("")
            if us.tasks:
                lines.append("### Tasks")
                for task in sorted(us.tasks, key=lambda t: t.order):
                    status = "x" if task.completed else " "
                    hours = EFFORT_LABEL.get(task.effort, "")
                    lines.append(f"- [{status}] **{task.title}** `{task.effort}` `{hours}`")
                    lines.append(f"  {task.description}")
                lines.append("")

    orphans = _orphan_tasks(project)
    if orphans:
        lines.append("## Tasks")
        lines.append("")
        for task in orphans:
            status = "x" if task.completed else " "
            hours = EFFORT_LABEL.get(task.effort, "")
            lines.append(f"- [{status}] **{task.title}** `{task.effort}` `{hours}`")
            lines.append(f"  {task.description}")

    return "\n".join(lines)


def to_json(project: Project) -> str:
    mode = "us_and_tasks" if project.user_stories else "tasks_only"

    us_list = []
    for i, us in enumerate(sorted(project.user_stories, key=lambda u: u.order), 1):
        us_id = f"us_{i}"
        us_list.append({
            "id": us_id,
            "title": us.title,
            "description": us.description,
            "order": us.order,
            "tasks": [
                {
                    "id": f"task_{j}",
                    "user_story_id": us_id,
                    "title": t.title,
                    "description": t.description,
                    "order": j,
                    "effort": t.effort,
                    "effort_hours": EFFORT_HOURS.get(t.effort, {"min": 2, "max": 6}),
                    "completed": t.completed,
                }
                for j, t in enumerate(sorted(us.tasks, key=lambda t: t.order), 1)
            ],
        })

    orphans = _orphan_tasks(project)
    tasks_list = [
        {
            "id": f"task_{i}",
            "user_story_id": None,
            "title": t.title,
            "description": t.description,
            "order": i,
            "effort": t.effort,
            "effort_hours": EFFORT_HOURS.get(t.effort, {"min": 2, "max": 6}),
            "completed": t.completed,
        }
        for i, t in enumerate(orphans, 1)
    ]

    data = {
        "project_title": project.title,
        "project_summary": project.description,
        "mode": mode,
        "user_stories": us_list,
        "tasks": tasks_list,
        "exported_at": project.updated_at.isoformat() if project.updated_at else None,
    }
    return json.dumps(data, indent=2, ensure_ascii=False)


def export_csv(project: Project) -> str:
    output = io.StringIO()
    fieldnames = [
        "Name", "Description", "Type", "User Story",
        "Order", "Effort", "Effort Hours Min", "Effort Hours Max",
        "Confidence", "Priority", "Status", "Tags",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for us in sorted(project.user_stories, key=lambda u: u.order):
        writer.writerow({
            "Name": us.title,
            "Description": us.description,
            "Type": "User Story",
            "User Story": "",
            "Order": us.order,
            "Effort": "",
            "Effort Hours Min": "",
            "Effort Hours Max": "",
            "Confidence": "",
            "Priority": "Medium",
            "Status": "To Do",
            "Tags": "",
        })
        for task in sorted(us.tasks, key=lambda t: t.order):
            hours = EFFORT_HOURS.get(task.effort, {"min": 2, "max": 6})
            writer.writerow({
                "Name": task.title,
                "Description": task.description,
                "Type": "Task",
                "User Story": us.title,
                "Order": task.order,
                "Effort": task.effort,
                "Effort Hours Min": hours["min"],
                "Effort Hours Max": hours["max"],
                "Confidence": task.confidence,
                "Priority": EFFORT_PRIORITY.get(task.effort, "Medium"),
                "Status": "Done" if task.completed else "To Do",
                "Tags": f"effort-{task.effort}",
            })

    for task in _orphan_tasks(project):
        hours = EFFORT_HOURS.get(task.effort, {"min": 2, "max": 6})
        writer.writerow({
            "Name": task.title,
            "Description": task.description,
            "Type": "Task",
            "User Story": "",
            "Order": task.order,
            "Effort": task.effort,
            "Effort Hours Min": hours["min"],
            "Effort Hours Max": hours["max"],
            "Confidence": "",
            "Priority": EFFORT_PRIORITY.get(task.effort, "Medium"),
            "Status": "Done" if task.completed else "To Do",
            "Tags": f"effort-{task.effort}",
        })

    return output.getvalue()
