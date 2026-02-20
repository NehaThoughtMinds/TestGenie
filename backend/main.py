from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Root endpoint to avoid 404 error at /
@app.get("/")
def read_root():
    return {"message": "Welcome to my AI-powered API!"}

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router with the v1 prefix
app.include_router(api_router, prefix="/api/v1")