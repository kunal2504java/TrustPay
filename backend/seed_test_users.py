"""
Seed script to create test users for development and testing.
Run this script to populate the database with test accounts.

Usage:
    python seed_test_users.py
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.security import get_password_hash

# Import all models to ensure relationships are properly configured
from app.models.user import User
from app.models.escrow import Escrow
from app.models.confirmation import Confirmation
from app.models.dispute import Dispute
from app.models.blockchain_log import BlockchainLog
from app.models.payment_log import PaymentLog


async def create_test_user(
    db: AsyncSession,
    name: str,
    email: str,
    password: str,
    phone: str = None,
    vpa: str = None,
    upi_id: str = None,
    kyc_status: str = "VERIFIED"
):
    """Create a test user if it doesn't already exist."""
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        print(f"✓ User already exists: {email}")
        return existing_user
    
    # Create new user
    hashed_password = get_password_hash(password)
    user = User(
        name=name,
        email=email,
        hashed_password=hashed_password,
        phone=phone,
        vpa=vpa,
        upi_id=upi_id,
        upi_verified=True if upi_id else False,
        kyc_status=kyc_status,
        is_active=True
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    print(f"✓ Created user: {email}")
    return user


async def seed_test_users():
    """Seed the database with test users."""
    
    print("\n🌱 Seeding test users...\n")
    
    async with AsyncSessionLocal() as db:
        # Test User 1 - Main test account
        await create_test_user(
            db=db,
            name="Test User",
            email="test@trustpay.com",
            password="test123",
            phone="+919876543210",
            vpa="test@paytm",
            upi_id="test@paytm",
            kyc_status="VERIFIED"
        )
        
        # Test User 2 - Secondary account for testing escrows
        await create_test_user(
            db=db,
            name="Demo User",
            email="demo@trustpay.com",
            password="demo123",
            phone="+919876543211",
            vpa="demo@paytm",
            upi_id="demo@paytm",
            kyc_status="VERIFIED"
        )
        
        # Test User 3 - Seller account
        await create_test_user(
            db=db,
            name="Seller Account",
            email="seller@trustpay.com",
            password="seller123",
            phone="+919876543212",
            vpa="seller@paytm",
            upi_id="seller@paytm",
            kyc_status="VERIFIED"
        )
        
        # Test User 4 - Buyer account
        await create_test_user(
            db=db,
            name="Buyer Account",
            email="buyer@trustpay.com",
            password="buyer123",
            phone="+919876543213",
            vpa="buyer@paytm",
            upi_id="buyer@paytm",
            kyc_status="VERIFIED"
        )
        
        # Test User 5 - Unverified KYC
        await create_test_user(
            db=db,
            name="Pending User",
            email="pending@trustpay.com",
            password="pending123",
            phone="+919876543214",
            kyc_status="PENDING"
        )
    
    print("\n✅ Test users seeded successfully!\n")
    print("=" * 60)
    print("TEST ACCOUNTS:")
    print("=" * 60)
    print("\n1. Main Test Account:")
    print("   Email: test@trustpay.com")
    print("   Password: test123")
    print("   Status: KYC Verified\n")
    
    print("2. Demo Account:")
    print("   Email: demo@trustpay.com")
    print("   Password: demo123")
    print("   Status: KYC Verified\n")
    
    print("3. Seller Account:")
    print("   Email: seller@trustpay.com")
    print("   Password: seller123")
    print("   Status: KYC Verified\n")
    
    print("4. Buyer Account:")
    print("   Email: buyer@trustpay.com")
    print("   Password: buyer123")
    print("   Status: KYC Verified\n")
    
    print("5. Pending KYC Account:")
    print("   Email: pending@trustpay.com")
    print("   Password: pending123")
    print("   Status: KYC Pending\n")
    
    print("=" * 60)
    print("\nYou can now login with any of these accounts!")
    print("Visit: http://localhost:3000/login\n")


if __name__ == "__main__":
    asyncio.run(seed_test_users())
