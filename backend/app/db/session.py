import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .base import Base

# Standard PG or SQLite fallback for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./career_os.db")

# Render provides postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# For sqlite, we need check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # In production, use migrations (Alembic). 
    # For initial startup, we can call Base.metadata.create_all
    from .. import models # Ensure models are registered
    Base.metadata.create_all(bind=engine)
