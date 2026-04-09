from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db.session import get_db
from ..core import security
from ..services.mail_service import send_otp_email, generate_otp
from ..services.agent_service import CareerAgent, log_activity

router = APIRouter()

@router.post("/otp/send")
def send_otp(
    *,
    db: Session = Depends(get_db),
    payload: schemas.EmailRequest
) -> Any:
    # 1. Find or create user
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    
    if not user:
        # For passwordless login, we auto-register new users to a default org
        org = db.query(models.Organization).filter(models.Organization.slug == "default").first()
        if not org:
            org = models.Organization(name="General Institution", slug="default")
            db.add(org)
            db.commit()
            db.refresh(org)
        
        user = models.User(
            email=payload.email,
            org_id=org.id,
            role=models.UserRole.STUDENT,
            name=payload.email.split("@")[0]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create student profile
        profile = models.StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()

    # 2. Generate and store OTP
    otp = generate_otp()
    user.otp = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    # 3. Send Email
    success = send_otp_email(user.email, otp)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")
    
    return {"message": "OTP sent successfully"}

@router.post("/otp/verify", response_model=schemas.Token)
def verify_otp(
    *,
    db: Session = Depends(get_db),
    payload: schemas.OTPVerify
) -> Any:
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check OTP
    if not user.otp or user.otp != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check expiry (ensure user.otp_expires_at is offset-aware or matched)
    if not user.otp_expires_at or user.otp_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Clear OTP after use
    user.otp = None
    user.otp_expires_at = None
    db.commit()

    # Trigger Agent Cycle
    agent = CareerAgent(db, str(user.id))
    agent.run_cycle()
    log_activity(db, str(user.id), "login")

    # Create token
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "org_id": str(user.org_id)
        }
    }
