from typing import Any


def _resume_text_blob(resume_data: dict[str, Any]) -> str:
    text_parts = [
        " ".join(resume_data.get("skills", [])),
        resume_data.get("resume_text", ""),
        " ".join(resume_data.get("suggested_roles", [])),
    ]
    return " ".join(text_parts).lower()


def generate_rule_based_tasks(resume_data: dict[str, Any]) -> list[dict[str, str]]:
    skills = [skill.lower() for skill in resume_data.get("skills", [])]
    projects = int(resume_data.get("projects", 0) or 0)
    placement_probability = int(resume_data.get("placement_probability", 0) or 0)
    text_blob = _resume_text_blob(resume_data)

    tasks: list[dict[str, str]] = []

    if "dsa" not in skills:
        tasks.append(
            {
                "task": "Solve 10 DSA problems daily",
                "priority": "High",
                "status": "Pending",
            }
        )

    if projects < 2:
        tasks.append(
            {
                "task": "Build 2 real-world projects",
                "priority": "High",
                "status": "Pending",
            }
        )

    if "internship" not in text_blob:
        tasks.append(
            {
                "task": "Apply to internships on LinkedIn",
                "priority": "Medium",
                "status": "Pending",
            }
        )

    if placement_probability < 70:
        tasks.append(
            {
                "task": "Improve core fundamentals",
                "priority": "High",
                "status": "Pending",
            }
        )

    if not tasks:
        tasks.append(
            {
                "task": "Maintain momentum with one mock interview this week",
                "priority": "Low",
                "status": "Pending",
            }
        )

    return tasks
