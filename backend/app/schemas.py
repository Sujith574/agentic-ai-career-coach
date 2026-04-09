from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional, Any
from .models import UserRole

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str
    organization_slug: str # Used to link to existing or create new org

class UserInDB(UserBase):
    id: UUID
    org_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    org_id: Optional[str] = None

# Organization
class OrganizationBase(BaseModel):
    name: str
    slug: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationInDB(OrganizationBase):
    id: UUID
    
    class Config:
        from_attributes = True

# Student Profile
class StudentProfileBase(BaseModel):
    placement_probability: float = 0.0
    skills: List[str] = []
    missing_skills: List[str] = []

class StudentProfileInDB(StudentProfileBase):
    id: UUID
    user_id: UUID
    resume_data: Optional[Any] = None

    class Config:
        from_attributes = True

# Tasks
class TaskBase(BaseModel):
    title: str
    priority: str = "Medium"
    status: str = "Pending"

class TaskCreate(TaskBase):
    student_id: UUID

class TaskInDB(TaskBase):
    id: UUID
    org_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
