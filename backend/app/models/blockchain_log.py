from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class BlockchainLog(Base):
    __tablename__ = "blockchain_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escrow_id = Column(UUID(as_uuid=True), ForeignKey("escrows.id"), nullable=False)
    tx_hash = Column(String(66), nullable=False)
    event_type = Column(String(50), nullable=False)  # CREATED, HELD, RELEASED, REFUNDED
    payload_json = Column(JSON, nullable=True)
    block_number = Column(String(20), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    escrow = relationship("Escrow", back_populates="blockchain_logs")
