"""
Test seller login specifically
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import verify_password

# Import all models
from app.models.user import User
from app.models.escrow import Escrow
from app.models.confirmation import Confirmation
from app.models.dispute import Dispute
from app.models.blockchain_log import BlockchainLog
from app.models.payment_log import PaymentLog


async def test_seller_login():
    """Test seller login"""
    
    print("\n🔐 Testing seller login...\n")
    
    async with AsyncSessionLocal() as db:
        # Get seller user
        result = await db.execute(select(User).where(User.email == "seller@trustpay.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Seller user not found!")
            return
        
        print(f"✅ Found user: {user.name}")
        print(f"Email: {user.email}")
        print(f"Hashed Password: {user.hashed_password}")
        print(f"Active: {user.is_active}")
        print(f"KYC Status: {user.kyc_status}")
        
        # Test password
        test_password = "seller123"
        print(f"\nTesting password: '{test_password}'")
        
        is_valid = verify_password(test_password, user.hashed_password)
        print(f"Password valid: {is_valid}")
        
        if is_valid:
            print("\n✅ Login should work!")
        else:
            print("\n❌ Password verification failed!")
            
            # Try other common passwords
            print("\nTrying other passwords...")
            for pwd in ["Seller123", "SELLER123", "seller", "123"]:
                if verify_password(pwd, user.hashed_password):
                    print(f"✓ Password matches: {pwd}")


if __name__ == "__main__":
    asyncio.run(test_seller_login())
