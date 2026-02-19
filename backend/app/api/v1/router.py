from fastapi import APIRouter
from app.api.v1.endpoints import generate

api_router = APIRouter()
api_router.include_router(generate.router, prefix="/tests")
# api_router.include_router(health.router, prefix="/health")