from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.mongodb import init_db_indexes, test_database_connection
from app.database.taxonomy_db import seed_default_taxonomy_if_empty
from app.routers.auth import router as auth_router
from app.routers.challenges import router as challenges_router
from app.routers.universities import router as universities_router
from app.routers.industries import router as industries_router
from app.routers.government import router as government_router


logger = logging.getLogger("unibridge.backend")



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    try:
        test_database_connection()
        init_db_indexes()
        seed_default_taxonomy_if_empty()
        logger.info("MongoDB connection verified, indexes initialized, and taxonomy ready.")
    except Exception as error:
        logger.error(f"Failed to initialize database: {error}")
    yield
    # Shutdown actions (if any)


app = FastAPI(
    title="UniBridge API",
    description="Backend API for the UniBridge societal problem-solving platform (SIH 2026)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

if settings.allowed_origins:
    origins.extend([origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(challenges_router, prefix="/api/challenges", tags=["Challenges"])
app.include_router(universities_router, prefix="/api/universities", tags=["Universities"])
app.include_router(industries_router, prefix="/api/industries", tags=["Industries"])
app.include_router(government_router, prefix="/api")



@app.get("/", tags=["System"])
def root():
    return {
        "message": "UniBridge API is running",
        "status": "ok",
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
    }


@app.get("/health/database", tags=["System"])
def database_health_check():
    try:
        test_database_connection()
        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(error),
            },
        )