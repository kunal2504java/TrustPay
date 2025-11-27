from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/trustpay"
    
    @property
    def database_url(self) -> str:
        """Fix Railway's postgres:// to postgresql:// for SQLAlchemy"""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Blockchain
    POLYGON_RPC_URL: str = "https://polygon-rpc.com"
    PRIVATE_KEY: Optional[str] = None
    CONTRACT_ADDRESS: Optional[str] = None
    
    # UPI Gateway (Setu) - PRIMARY PAYMENT PROVIDER
    SETU_CLIENT_ID: Optional[str] = None
    SETU_CLIENT_SECRET: Optional[str] = None
    SETU_BASE_URL: str = "https://umap-uat-core.setu.co"  # UAT for testing, prod: https://umap.setu.co
    SETU_MERCHANT_ID: Optional[str] = None
    SETU_MERCHANT_VPA: Optional[str] = None
    SETU_WEBHOOK_SECRET: Optional[str] = None
    SETU_SCHEME_ID: Optional[str] = None  # Setu scheme ID for UPI
    
    # Razorpay Integration (LEGACY - Optional, for backward compatibility)
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
