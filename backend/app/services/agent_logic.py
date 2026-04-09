from sqlalchemy.orm import Session
from .. import models, schemas
from typing import Any, List

def run_agentic_rules(db: Session, student_id: str, org_id: str, resume_data: dict[str, Any]):
    """
    IF DSA missing → assign DSA tasks
    IF projects < 2 → assign project tasks
    IF probability < threshold → mark as 'At Risk'
    """
    skills = [s.lower() for s in resume_data.get("skills", [])]
    missing_skills = [s.lower() for s in resume_data.get("missing_skills", [])]
    projects = int(resume_data.get("projects", 0))
    probability = float(resume_data.get("placement_probability", 0))

    new_tasks = []

    # Rule: DSA
    if "dsa" in missing_skills or ("dsa" not in skills and "data structures" not in skills):
        new_tasks.append({
            "title": "Solve 10 DSA problems daily (LeetCode/CodeChef)",
            "priority": "High"
        })

    # Rule: Projects
    if projects < 2:
        new_tasks.append({
            "title": "Build 2 real-world full-stack projects using React & FastAPI",
            "priority": "High"
        })

    # Rule: Placement Probability
    if probability < 70:
        new_tasks.append({
            "title": "Focus on CS fundamentals (OS, DBMS, Networking)",
            "priority": "Medium"
        })

    # Persist Tasks
    created_tasks = []
    for task_data in new_tasks:
        # Check if task already exists (basic de-duplication)
        existing = db.query(models.Task).filter(
            models.Task.student_id == student_id,
            models.Task.title == task_data["title"],
            models.Task.status == "Pending"
        ).first()
        
        if not existing:
            task = models.Task(
                student_id=student_id,
                org_id=org_id,
                title=task_data["title"],
                priority=task_data["priority"],
                status="Pending"
            )
            db.add(task)
            created_tasks.append(task)
    
    db.commit()
    return created_tasks
