from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .deps import get_current_admin
from .. import models, schemas
from ..db.session import get_db

router = APIRouter()

@router.get("/dashboard", response_model=dict)
def get_admin_dashboard(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> Any:
    # All analytics scoped to organization
    org_id = current_admin.org_id
    
    total_students = db.query(models.User).filter(
        models.User.org_id == org_id,
        models.User.role == models.UserRole.STUDENT
    ).count()
    
    avg_probability = db.query(func.avg(models.StudentProfile.placement_probability)).join(models.User).filter(
        models.User.org_id == org_id
    ).scalar() or 0.0
    
    high_risk_students = db.query(models.User).join(models.StudentProfile).filter(
        models.User.org_id == org_id,
        models.StudentProfile.placement_probability < 60
    ).count()
    
    return {
        "total_students": total_students,
        "avg_readiness_score": round(avg_probability, 1),
        "high_risk_count": high_risk_students,
        "org_name": current_admin.organization.name
    }

@router.get("/students", response_model=List[dict])
def list_students(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> Any:
    students = db.query(models.User, models.StudentProfile).join(models.StudentProfile).filter(
        models.User.org_id == current_admin.org_id
    ).all()
    
    result = []
    for user, profile in students:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "probability": profile.placement_probability,
            "skills": profile.resume_data.get("skills", []) if profile.resume_data else []
        })
    return result

@router.get("/analytics")
def get_skill_gaps(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> Any:
    # Aggregate missing skills across org
    profiles = db.query(models.StudentProfile).join(models.User).filter(
        models.User.org_id == current_admin.org_id
    ).all()
    
    gaps = {}
    for p in profiles:
        if p.resume_data:
            for skill in p.resume_data.get("missing_skills", []):
                gaps[skill] = gaps.get(skill, 0) + 1
    
    sorted_gaps = sorted(gaps.items(), key=lambda x: x[1], reverse=True)
    return {"top_skill_gaps": sorted_gaps[:10]}
