"""
Check what users exist in the database
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


async def check_users():
    """Check all users in database"""
    
    print("\n📋 Checking users in database...\n")
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        if not users:
            print("❌ No users found in database!")
            return
        
        print(f"✅ Found {len(users)} users:\n")
        print("=" * 80)
        
        for user in users:
            print(f"\nName: {user.name}")
            print(f"Email: {user.email}")
            print(f"UPI: {user.upi_id}")
            print(f"KYC Status: {user.kyc_status}")
            print(f"Active: {user.is_active}")
            print(f"Hashed Password: {user.hashed_password[:50]}...")
            
            # Test password verification
            test_passwords = ["test123", "demo123", "seller123", "buyer123", "pending123"]
            for pwd in test_passwords:
                if verify_password(pwd, user.hashed_password):
                    print(f"✓ Password matches: {pwd}")
                    break
            
            print("-" * 80)


if __name__ == "__main__":
    asyncio.run(check_users())
