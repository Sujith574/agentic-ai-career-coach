from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.session import init_db
import os

app = FastAPI(
    title="Agentic AI CareerOS API",
    description="Production-grade Placement Operating System",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CareerOS", "version": "1.0.0"}

# Import routers
from .api import auth, student, admin
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(student.router, prefix="/api/v1/student", tags=["Student"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
