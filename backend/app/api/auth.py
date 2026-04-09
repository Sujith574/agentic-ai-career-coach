from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db.session import get_db
from ..core import security

router = APIRouter()

@router.post("/register", response_model=schemas.UserInDB)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate
) -> Any:
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Check or create organization
    org = db.query(models.Organization).filter(models.Organization.slug == user_in.organization_slug).first()
    if not org:
        org = models.Organization(
            name=user_in.organization_slug.capitalize(),
            slug=user_in.organization_slug
        )
        db.add(org)
        db.commit()
        db.refresh(org)
    
    # Create user
    new_user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        org_id=org.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If student, create profile
    if new_user.role == models.UserRole.STUDENT:
        profile = models.StudentProfile(user_id=new_user.id)
        db.add(profile)
        db.commit()
        
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
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
