from fastapi import APIRouter

from app.api.v1.endpoints import escrows, users, auth, webhooks

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(escrows.router, prefix="/escrows", tags=["escrows"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
