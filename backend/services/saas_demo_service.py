from __future__ import annotations

from copy import deepcopy
from typing import Any


def _segment(score: int) -> str:
    if score >= 80:
        return "Ready"
    if score >= 50:
        return "Moderate"
    return "At Risk"


def _skill_status(missing_skills: list[str]) -> str:
    count = len(missing_skills)
    if count <= 1:
        return "Good"
    if count <= 3:
        return "Weak"
    return "Critical"


class SaaSDemoService:
    def __init__(self) -> None:
        self.students: list[dict[str, Any]] = self._seed_students()

    def _seed_students(self) -> list[dict[str, Any]]:
        base = [
            ("Aarav", 84, ["System Design"], 3),
            ("Diya", 72, ["DSA", "Node.js"], 2),
            ("Kabir", 48, ["DSA", "React", "SQL"], 1),
            ("Ishita", 91, [], 4),
            ("Rohan", 56, ["DSA"], 2),
            ("Sneha", 44, ["DSA", "DBMS", "OS"], 1),
            ("Arjun", 66, ["System Design", "Cloud"], 2),
            ("Meera", 79, ["DSA"], 2),
            ("Vihaan", 38, ["DSA", "React", "Aptitude"], 1),
            ("Ananya", 88, ["Cloud"], 3),
            ("Yash", 61, ["DSA", "Communication"], 2),
            ("Nisha", 53, ["DSA", "Projects"], 1),
        ]
        students: list[dict[str, Any]] = []
        for idx, (name, score, missing, projects) in enumerate(base, start=1):
            analysis = {
                "skills": ["HTML", "CSS", "Python"],
                "missing_skills": missing,
                "projects": projects,
                "experience_level": "Beginner" if score < 60 else "Intermediate",
                "suggested_roles": ["Frontend Developer", "Software Engineer"],
                "placement_probability": score,
            }
            students.append(
                {
                    "id": f"s-{idx}",
                    "name": name,
                    "analysis": analysis,
                    "tasks": self._tasks_from_analysis(analysis),
                }
            )
        return students

    def _tasks_from_analysis(self, analysis: dict[str, Any]) -> list[dict[str, str]]:
        tasks = []
        skills_lower = [s.lower() for s in analysis.get("skills", [])]
        if "dsa" not in skills_lower:
            tasks.append({"title": "Practice DSA daily", "priority": "High", "status": "Pending"})
        if int(analysis.get("projects", 0) or 0) < 2:
            tasks.append({"title": "Build 2 real-world projects", "priority": "High", "status": "Pending"})
        if int(analysis.get("placement_probability", 0) or 0) < 50:
            tasks.append({"title": "Improve core fundamentals", "priority": "High", "status": "Pending"})
        if not tasks:
            tasks.append({"title": "Maintain interview consistency", "priority": "Low", "status": "Pending"})
        return tasks

    def list_students(self) -> list[dict[str, Any]]:
        rows = []
        for student in self.students:
            analysis = student["analysis"]
            score = int(analysis.get("placement_probability", 0) or 0)
            missing = analysis.get("missing_skills", [])
            rows.append(
                {
                    "id": student["id"],
                    "name": student["name"],
                    "placement_probability": score,
                    "segment": _segment(score),
                    "skill_status": _skill_status(missing),
                    "analysis": analysis,
                    "tasks": student["tasks"],
                    "alerts": self._student_alerts(student),
                }
            )
        return rows

    def get_student(self, student_id: str) -> dict[str, Any] | None:
        for student in self.list_students():
            if student["id"] == student_id:
                return student
        return None

    def insights(self) -> dict[str, Any]:
        students = self.list_students()
        total = len(students)
        avg = round(sum(s["placement_probability"] for s in students) / total, 2) if total else 0
        at_risk = [s for s in students if s["segment"] == "At Risk"]
        ready = [s for s in students if s["segment"] == "Ready"]
        moderate = [s for s in students if s["segment"] == "Moderate"]
        dsa_missing = sum(
            1
            for s in students
            if "dsa" in [skill.lower() for skill in s.get("analysis", {}).get("missing_skills", [])]
        )
        alerts = []
        if at_risk:
            alerts.append(f"{len(at_risk)} students are at risk")
        if dsa_missing:
            alerts.append(f"{dsa_missing} students missing DSA skills")
        return {
            "total_students": total,
            "average_placement_probability": avg,
            "at_risk_count": len(at_risk),
            "ready_count": len(ready),
            "moderate_count": len(moderate),
            "dsa_missing_count": dsa_missing,
            "alerts": alerts or ["Placement pipeline looks stable today"],
        }

    def update_current_student(self, analysis: dict[str, Any], tasks: list[dict[str, Any]]) -> None:
        current = next((row for row in self.students if row["id"] == "current-student"), None)
        data = {
            "id": "current-student",
            "name": "Current Demo Student",
            "analysis": deepcopy(analysis),
            "tasks": deepcopy(tasks),
        }
        if current is None:
            self.students.insert(0, data)
            return
        current.update(data)

    @staticmethod
    def _student_alerts(student: dict[str, Any]) -> list[str]:
        analysis = student.get("analysis", {})
        tasks = student.get("tasks", [])
        pending = sum(1 for task in tasks if task.get("status") == "Pending")
        alerts = []
        if pending > 0:
            alerts.append(f"You have {pending} pending tasks")
        if int(analysis.get("placement_probability", 0) or 0) < 50:
            alerts.append("Placement probability is low")
        return alerts

