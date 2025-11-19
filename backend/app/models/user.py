from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    vpa = Column(String(100), unique=True, nullable=True)  # UPI VPA
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(15), nullable=True)
    kyc_status = Column(String(20), default="PENDING")  # PENDING, VERIFIED, REJECTED
    is_active = Column(Boolean, default=True)
    
    # UPI Details for Payouts
    upi_id = Column(String(100), nullable=True)  # Primary UPI ID for receiving payments
    upi_verified = Column(Boolean, default=False)
    
    # Bank Account Details (Alternative to UPI)
    bank_account_number = Column(String(50), nullable=True)
    bank_ifsc = Column(String(11), nullable=True)
    bank_account_name = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    escrows = relationship("Escrow", back_populates="payer")
