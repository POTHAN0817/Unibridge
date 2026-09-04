from fastapi import FastAPI, HTTPException

from app.database.mongodb import test_database_connection


app = FastAPI(
    title="UniBridge API",
    description="Backend API for the UniBridge societal problem-solving platform",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "UniBridge API is running",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


@app.get("/health/database")
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