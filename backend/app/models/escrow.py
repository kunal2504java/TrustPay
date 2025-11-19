from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base

class EscrowStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    HELD = "HELD"
    RELEASED = "RELEASED"
    REFUNDED = "REFUNDED"
    DISPUTED = "DISPUTED"
    EXPIRED = "EXPIRED"

class Escrow(Base):
    __tablename__ = "escrows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    payee_vpa = Column(String(100), nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in paise
    currency = Column(String(3), default="INR")
    status = Column(Enum(EscrowStatus), default=EscrowStatus.INITIATED)
    
    # Setu Integration
    setu_collect_id = Column(String(100), nullable=True)
    setu_virtual_account_id = Column(String(100), nullable=True)
    
    # Razorpay Integration
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_payout_id = Column(String(100), nullable=True)
    razorpay_refund_id = Column(String(100), nullable=True)
    
    # Payment Tracking
    payment_initiated_at = Column(DateTime(timezone=True), nullable=True)
    payment_completed_at = Column(DateTime(timezone=True), nullable=True)
    payout_initiated_at = Column(DateTime(timezone=True), nullable=True)
    payout_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Error Tracking
    last_payment_error = Column(Text, nullable=True)
    payment_retry_count = Column(Integer, default=0)
    
    # Blockchain
    blockchain_tx_hash = Column(String(66), nullable=True)
    
    # Metadata
    description = Column(Text, nullable=True)
    order_id = Column(String(100), nullable=True)
    condition = Column(String(50), default="manual_confirm")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    payer = relationship("User", back_populates="escrows")
    confirmations = relationship("Confirmation", back_populates="escrow")
    disputes = relationship("Dispute", back_populates="escrow")
    blockchain_logs = relationship("BlockchainLog", back_populates="escrow")
    payment_logs = relationship("PaymentLog", back_populates="escrow")
