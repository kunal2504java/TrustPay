from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timedelta, timezone

from app.models.escrow import Escrow, EscrowStatus

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self, user_id: UUID) -> Dict[str, Any]:
        """Get high-level dashboard statistics"""
        
        # Base query for user's escrows (as payer or payee)
        user_filter = or_(Escrow.payer_id == user_id, Escrow.payee_id == user_id)
        
        # Total Volume (Sum of all escrow amounts)
        volume_query = select(func.sum(Escrow.amount)).where(user_filter)
        volume_result = await self.db.execute(volume_query)
        total_volume = volume_result.scalar() or 0
        
        # Active Escrows (INITIATED, HELD, DISPUTED)
        active_statuses = [EscrowStatus.INITIATED, EscrowStatus.HELD, EscrowStatus.DISPUTED]
        active_query = select(func.count(Escrow.id)).where(
            and_(user_filter, Escrow.status.in_(active_statuses))
        )
        active_result = await self.db.execute(active_query)
        active_count = active_result.scalar() or 0
        
        # Completed Escrows (RELEASED)
        completed_query = select(func.count(Escrow.id)).where(
            and_(user_filter, Escrow.status == EscrowStatus.RELEASED)
        )
        completed_result = await self.db.execute(completed_query)
        completed_count = completed_result.scalar() or 0
        
        # Total Count
        total_query = select(func.count(Escrow.id)).where(user_filter)
        total_result = await self.db.execute(total_query)
        total_count = total_result.scalar() or 0
        
        # Success Rate
        success_rate = (completed_count / total_count * 100) if total_count > 0 else 0
        
        return {
            "total_volume": total_volume,
            "active_count": active_count,
            "completed_count": completed_count,
            "success_rate": round(success_rate, 1),
            "total_count": total_count
        }

    async def get_transaction_history(self, user_id: UUID, days: int = 30) -> List[Dict[str, Any]]:
        """Get daily transaction volume for the last N days"""
        
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Create labeled column for date truncation
        date_column = func.date_trunc('day', Escrow.created_at).label('date')
        
        # Query to group by date and sum amount
        query = select(
            date_column,
            func.sum(Escrow.amount).label('volume'),
            func.count(Escrow.id).label('count')
        ).where(
            and_(
                or_(Escrow.payer_id == user_id, Escrow.payee_id == user_id),
                Escrow.created_at >= start_date
            )
        ).group_by(
            date_column
        ).order_by(
            date_column
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        history = []
        for row in rows:
            history.append({
                "date": row.date.strftime("%Y-%m-%d"),
                "volume": row.volume,
                "count": row.count
            })
            
        return history

    async def get_status_distribution(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Get distribution of escrows by status"""
        
        query = select(
            Escrow.status,
            func.count(Escrow.id).label('count')
        ).where(
            or_(Escrow.payer_id == user_id, Escrow.payee_id == user_id)
        ).group_by(
            Escrow.status
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        distribution = []
        for row in rows:
            distribution.append({
                "name": row.status.value,
                "value": row.count
            })
            
        return distribution
