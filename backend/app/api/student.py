from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .deps import get_current_user
from .. import models, schemas
from ..db.session import get_db
from ..services.ai_service import AIService
from ..services.agent_logic import run_agentic_rules

router = APIRouter()
ai_service = AIService()

@router.get("/profile", response_model=schemas.StudentProfileInDB)
def get_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    if current_user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="Not a student user")
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    if current_user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="Not a student user")
    
    # Read file content
    content = await file.read()
    # In a real app, we'd use a PDF parser here. For now, assume it's text.
    resume_text = content.decode("utf-8", errors="ignore")
    
    # Analyze
    analysis = ai_service.analyze_resume(resume_text)
    
    # Update profile
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    profile.resume_data = analysis
    profile.placement_probability = analysis.get("placement_probability", 0)
    
    db.commit()
    db.refresh(profile)
    
    # Trigger Agentic Core
    run_agentic_rules(db, profile.id, current_user.org_id, analysis)
    
    return {"ok": True, "analysis": analysis}

@router.get("/tasks", response_model=List[schemas.TaskInDB])
def get_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        return []
    return db.query(models.Task).filter(models.Task.student_id == profile.id).all()

@router.post("/chat")
def career_chat(
    message: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    context = profile.resume_data if profile else {}
    
    prompt = f"Context: {context}. User: {message.get('text')}"
    # This would call AIService.mentor_chat in a real version
    response_text = "Focus on your DSA gaps and build 2 more projects to reach 70% readiness."
    
    # Persist chat
    chat = models.ChatHistory(
        user_id=current_user.id,
        message=message.get('text'),
        response=response_text,
        context_snapshot=context
    )
    db.add(chat)
    db.commit()
    
    return {"text": response_text}
