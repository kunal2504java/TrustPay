from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone

from app.models.escrow import Escrow, EscrowStatus
from app.models.confirmation import Confirmation
from app.schemas.escrow import EscrowCreate
from app.services.setu_service import SetuService
from app.services.blockchain_service import BlockchainService

class EscrowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.setu_service = SetuService()
        self.blockchain_service = BlockchainService()
    
    async def create_escrow(self, payer_id: UUID, escrow_data: EscrowCreate) -> Escrow:
        """Create a new escrow transaction"""
        
        try:
            # Create escrow record
            escrow = Escrow(
                payer_id=payer_id,
                payee_vpa=escrow_data.payee_vpa,
                amount=escrow_data.amount,
                currency=escrow_data.currency,
                description=escrow_data.description,
                order_id=escrow_data.order_id,
                condition=escrow_data.condition,
                status=EscrowStatus.INITIATED,
                expires_at=datetime.now(timezone.utc) + timedelta(days=7)  # 7 days expiry
            )
        except Exception as e:
            print(f"Error creating escrow object: {e}")
            raise
        
        self.db.add(escrow)
        await self.db.commit()
        await self.db.refresh(escrow)
        
        # Create UPI collect request via Setu (in production)
        try:
            # Uncomment when Setu integration is ready
            # collect_response = await self.setu_service.create_collect_request(
            #     amount=escrow_data.amount,
            #     description=escrow_data.description or f"Escrow payment {escrow.id}"
            # )
            # escrow.setu_collect_id = collect_response.get("collect_id")
            
            # For now, just set a mock ID
            escrow.setu_collect_id = f"mock_collect_{escrow.id}"
            escrow.status = EscrowStatus.INITIATED
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
        except Exception as e:
            # Handle Setu API error
            print(f"Setu API error: {e}")
            escrow.status = EscrowStatus.INITIATED
            await self.db.commit()
            await self.db.refresh(escrow)
        
        # Ensure all attributes are loaded
        await self.db.refresh(escrow)
        return escrow
    
    async def get_escrow(self, escrow_id: UUID) -> Optional[Escrow]:
        """Get escrow by ID"""
        result = await self.db.execute(
            select(Escrow).where(Escrow.id == escrow_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_escrows(self, user_id: UUID) -> List[Escrow]:
        """Get all escrows for a user"""
        result = await self.db.execute(
            select(Escrow).where(Escrow.payer_id == user_id).order_by(Escrow.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def confirm_escrow(self, escrow_id: UUID, user_id: UUID) -> dict:
        """Confirm escrow completion"""
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError("Escrow not found")
        
        if escrow.status not in [EscrowStatus.HELD, EscrowStatus.INITIATED]:
            raise ValueError(f"Escrow is not in confirmable status: {escrow.status}")
        
        # Record confirmation
        confirmation = Confirmation(
            escrow_id=escrow_id,
            user_id=user_id,
            role="payer" if escrow.payer_id == user_id else "payee"
        )
        self.db.add(confirmation)
        
        # Check if both parties have confirmed
        result = await self.db.execute(
            select(Confirmation).where(Confirmation.escrow_id == escrow_id)
        )
        confirmations = list(result.scalars().all())
        
        if len(confirmations) >= 2:
            # Both confirmed, trigger release
            escrow.status = EscrowStatus.RELEASED
            await self.db.commit()
            return {"message": "Escrow released successfully"}
        
        await self.db.commit()
        return {"message": "Confirmation recorded, waiting for other party"}
    
    async def raise_dispute(self, escrow_id: UUID, user_id: UUID, reason: str) -> dict:
        """Raise a dispute for escrow"""
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError("Escrow not found")
        
        escrow.status = EscrowStatus.DISPUTED
        await self.db.commit()
        
        return {"message": "Dispute raised successfully", "escrow_id": str(escrow_id)}
