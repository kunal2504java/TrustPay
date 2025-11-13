from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    vpa: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    vpa: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    kyc_status: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
