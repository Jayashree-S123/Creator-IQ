from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.routes.auth import router as auth_router
from app.routes.content import router as content_router
from app.routes.audience import router as audience_router
from app.routes.growth import router as growth_router

from app.database import engine
from app.database import Base
from app.models.user import User
from app.models.content import Content
from app.models.growth import Growth
from app.models.youtube import YouTubeConnection
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CreatorIQ API",
    description="Creator Analytics & Content Performance Dashboard API",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(audience_router)
app.include_router(growth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "CreatorIQ API Running",
        "status": "success"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CreatorIQ Backend"
    }


@app.get("/health/db")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "PostgreSQL",
            "connection": "successful"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "PostgreSQL",
            "connection": "failed",
            "error": str(e)
        }

