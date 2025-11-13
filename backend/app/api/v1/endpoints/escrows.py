from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.escrow import EscrowCreate, EscrowResponse
from app.services.escrow_service import EscrowService

router = APIRouter()

@router.post("/create", response_model=EscrowResponse)
async def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new escrow transaction"""
    escrow_service = EscrowService(db)
    return await escrow_service.create_escrow(current_user.id, escrow_data)

@router.get("/{escrow_id}", response_model=EscrowResponse)
async def get_escrow(
    escrow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get escrow details"""
    escrow_service = EscrowService(db)
    escrow = await escrow_service.get_escrow(escrow_id)
    
    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )
    
    # Check if user has access to this escrow
    if escrow.payer_id != current_user.id and escrow.payee_vpa != current_user.vpa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return escrow

@router.get("/", response_model=List[EscrowResponse])
async def list_escrows(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's escrows"""
    escrow_service = EscrowService(db)
    return await escrow_service.get_user_escrows(current_user.id)

@router.post("/{escrow_id}/confirm")
async def confirm_escrow(
    escrow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Confirm escrow completion"""
    escrow_service = EscrowService(db)
    return await escrow_service.confirm_escrow(escrow_id, current_user.id)

@router.post("/{escrow_id}/dispute")
async def raise_dispute(
    escrow_id: UUID,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Raise a dispute for escrow"""
    escrow_service = EscrowService(db)
    return await escrow_service.raise_dispute(escrow_id, current_user.id, reason)
