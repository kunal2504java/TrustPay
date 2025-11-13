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
    created_at: datetime
    updated_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True
