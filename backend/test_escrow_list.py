import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.services.escrow_service import EscrowService
from app.models.user import User
from sqlalchemy import select

async def test_list_escrows():
    """Test listing escrows for a user"""
    print("\n📋 Testing escrow list functionality...\n")
    
    async with AsyncSessionLocal() as db:
        try:
            # Get a test user
            result = await db.execute(
                select(User).where(User.email == "test@trustpay.com")
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ Test user not found")
                return
            
            print(f"✅ Found user: {user.name} ({user.email})")
            print(f"   User ID: {user.id}")
            print(f"   User VPA: {user.vpa}")
            
            # Test escrow service
            escrow_service = EscrowService(db)
            escrows = await escrow_service.get_user_escrows(user.id, user.vpa)
            
            print(f"\n✅ Found {len(escrows)} escrows for user")
            
            for escrow in escrows:
                print(f"\n   Escrow ID: {escrow.id}")
                print(f"   Code: {escrow.escrow_code}")
                print(f"   Name: {escrow.escrow_name}")
                print(f"   Amount: ₹{escrow.amount / 100:.2f}")
                print(f"   Status: {escrow.status}")
                print(f"   Payee VPA: {escrow.payee_vpa}")
                
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_list_escrows())
