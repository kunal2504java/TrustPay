from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get high-level dashboard statistics"""
    service = AnalyticsService(db)
    return await service.get_dashboard_stats(current_user.id)

@router.get("/history")
async def get_transaction_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get transaction volume history"""
    service = AnalyticsService(db)
    return await service.get_transaction_history(current_user.id, days)

@router.get("/distribution")
async def get_status_distribution(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get escrow status distribution"""
    service = AnalyticsService(db)
    return await service.get_status_distribution(current_user.id)
