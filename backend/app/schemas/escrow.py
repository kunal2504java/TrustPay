from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from app.models.escrow import EscrowStatus

class EscrowBase(BaseModel):
    payee_vpa: str = Field(..., description="Payee's UPI VPA")
    amount: int = Field(..., gt=0, description="Amount in paise")
    currency: str = Field(default="INR", description="Currency code")
    description: Optional[str] = Field(None, description="Escrow description")
    order_id: Optional[str] = Field(None, description="External order ID")

class EscrowCreate(EscrowBase):
    condition: str = Field(default="manual_confirm", description="Release condition")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class EscrowUpdate(BaseModel):
    status: Optional[EscrowStatus] = None
    setu_collect_id: Optional[str] = None
    setu_virtual_account_id: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None

class EscrowResponse(EscrowBase):
    id: UUID
    payer_id: UUID
    status: EscrowStatus
    condition: str
    setu_collect_id: Optional[str]
    blockchain_tx_hash: Optional[str]
    
    # Escrow matching system
    escrow_code: str = Field(..., description="6-character escrow code")
    escrow_name: Optional[str] = Field(None, description="Random friendly name")
    is_code_active: bool = Field(default=True, description="Whether code can be used to join")
    
    # Razorpay fields
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_payout_id: Optional[str] = None
    razorpay_refund_id: Optional[str] = None
    
    # Payment tracking
    payment_initiated_at: Optional[datetime] = None
    payment_completed_at: Optional[datetime] = None
    payout_initiated_at: Optional[datetime] = None
    payout_completed_at: Optional[datetime] = None
    
    created_at: datetime
    updated_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class EscrowWithPaymentOrder(BaseModel):
    """Response when creating escrow with Razorpay payment order"""
    escrow: EscrowResponse
    payment_order: Dict[str, Any] = Field(..., description="Razorpay payment order details")

class EscrowCodeJoin(BaseModel):
    """Request to join escrow by code"""
    escrow_code: str = Field(..., min_length=6, max_length=6, description="6-character escrow code")
