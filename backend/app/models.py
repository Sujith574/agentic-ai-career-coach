import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Enum as SQLEnum, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .db.base import Base, TimestampMixin
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    ORG_OWNER = "org_owner"

class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    
    users = relationship("User", back_populates="organization")

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Optional for OTP-only flow
    name = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT)
    
    otp = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="users")
    
    # Specific relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)

class StudentProfile(Base, TimestampMixin):
    __tablename__ = "student_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    
    # Career Data
    resume_data = Column(JSON, nullable=True) # {skills, missing_skills, projects, experience_level}
    placement_probability = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="student_profile")
    tasks = relationship("Task", back_populates="student")

class Task(Base, TimestampMixin):
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"))
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    title = Column(String, nullable=False)
    priority = Column(String, default="Medium") # Low, Medium, High
    status = Column(String, default="Pending") # Pending, Completed
    
    student = relationship("StudentProfile", back_populates="tasks")

class ChatHistory(Base, TimestampMixin):
    __tablename__ = "chat_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    message = Column(String, nullable=False)
    response = Column(String, nullable=False)
    context_snapshot = Column(JSON, nullable=True)

class UserActivity(Base, TimestampMixin):
    __tablename__ = "user_activity"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    activity_type = Column(String, nullable=False) # login, upload, complete_task, chat
    meta_data = Column(JSON, nullable=True)

class AgentLog(Base, TimestampMixin):
    __tablename__ = "agent_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    event = Column(String, nullable=False) # cycle_trigger, state_update
    details = Column(JSON, nullable=True)

class DecisionHistory(Base, TimestampMixin):
    __tablename__ = "decision_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    state_snapshot = Column(JSON, nullable=False)
    decisions = Column(JSON, nullable=False)
    executed = Column(Boolean, default=False)
