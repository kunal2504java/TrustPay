from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Confirmation(Base):
    __tablename__ = "confirmations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escrow_id = Column(UUID(as_uuid=True), ForeignKey("escrows.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    vpa = Column(String(100), nullable=True)
    role = Column(String(20), nullable=False)  # payer or payee
    confirmed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    escrow = relationship("Escrow", back_populates="confirmations")
