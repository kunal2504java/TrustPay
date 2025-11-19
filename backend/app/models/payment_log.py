from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class PaymentLog(Base):
    """Audit trail for all payment operations"""
    __tablename__ = "payment_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escrow_id = Column(UUID(as_uuid=True), ForeignKey("escrows.id"), nullable=False)
    
    # Event details
    event_type = Column(String(50), nullable=False)  # "payment", "payout", "refund"
    event_status = Column(String(50), nullable=False)  # "initiated", "success", "failed"
    
    # Razorpay references
    razorpay_id = Column(String(100), nullable=True)  # payment_id, payout_id, or refund_id
    razorpay_order_id = Column(String(100), nullable=True)
    
    # Amounts
    amount = Column(Integer, nullable=False)  # Amount in paise
    currency = Column(String(3), default="INR")
    
    # Metadata
    webhook_payload = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    escrow = relationship("Escrow", back_populates="payment_logs")
