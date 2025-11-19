from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.escrow import EscrowCreate, EscrowResponse, EscrowWithPaymentOrder
from app.services.escrow_service import EscrowService

router = APIRouter()

@router.post("/create", response_model=EscrowWithPaymentOrder)
async def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new escrow transaction with Razorpay payment order"""
    escrow_service = EscrowService(db)
    escrow, payment_order = await escrow_service.create_escrow(current_user.id, escrow_data)
    
    return {
        "escrow": escrow,
        "payment_order": payment_order
    }

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


@router.get("/{escrow_id}/payment-status")
async def get_payment_status(
    escrow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get payment status for an escrow"""
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
    
    return {
        "escrow_id": str(escrow.id),
        "status": escrow.status,
        "payment": {
            "razorpay_order_id": escrow.razorpay_order_id,
            "razorpay_payment_id": escrow.razorpay_payment_id,
            "initiated_at": escrow.payment_initiated_at,
            "completed_at": escrow.payment_completed_at,
            "error": escrow.last_payment_error
        },
        "payout": {
            "razorpay_payout_id": escrow.razorpay_payout_id,
            "initiated_at": escrow.payout_initiated_at,
            "completed_at": escrow.payout_completed_at,
            "retry_count": escrow.payment_retry_count
        },
        "refund": {
            "razorpay_refund_id": escrow.razorpay_refund_id
        }
    }


@router.post("/{escrow_id}/cancel")
async def cancel_escrow(
    escrow_id: UUID,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel escrow and initiate refund"""
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
    
    # Check if escrow can be cancelled
    from app.models.escrow import EscrowStatus
    if escrow.status not in [EscrowStatus.INITIATED, EscrowStatus.HELD]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel escrow in {escrow.status} status"
        )
    
    try:
        # Process refund if payment was made
        if escrow.razorpay_payment_id:
            refund = await escrow_service.process_refund(
                escrow_id=escrow_id,
                reason=reason
            )
            return {
                "message": "Escrow cancelled and refund initiated",
                "escrow_id": str(escrow_id),
                "refund_id": refund.get("id"),
                "status": "refunded"
            }
        else:
            # No payment made, just cancel
            escrow.status = EscrowStatus.REFUNDED
            await db.commit()
            return {
                "message": "Escrow cancelled (no payment to refund)",
                "escrow_id": str(escrow_id),
                "status": "cancelled"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel escrow: {str(e)}"
        )
