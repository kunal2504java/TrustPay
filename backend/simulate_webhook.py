"""
Simulate Razorpay webhook for local testing
This script manually triggers the payment captured webhook to update escrow status
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.escrow import Escrow, EscrowStatus
from app.models.payment_log import PaymentLog

# Import all models
from app.models.user import User
from app.models.confirmation import Confirmation
from app.models.dispute import Dispute
from app.models.blockchain_log import BlockchainLog


async def simulate_payment_captured(escrow_id: str):
    """Simulate payment.captured webhook"""
    
    print(f"\n🔄 Simulating payment capture for escrow: {escrow_id}\n")
    
    async with AsyncSessionLocal() as db:
        # Get escrow
        result = await db.execute(select(Escrow).where(Escrow.id == escrow_id))
        escrow = result.scalar_one_or_none()
        
        if not escrow:
            print(f"❌ Escrow {escrow_id} not found\n")
            return
        
        print(f"Current Status: {escrow.status}")
        print(f"Amount: ₹{escrow.amount/100}")
        print(f"Razorpay Order: {escrow.razorpay_order_id}\n")
        
        if escrow.status != EscrowStatus.INITIATED:
            print(f"⚠️  Escrow is not in INITIATED status. Current: {escrow.status}\n")
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                return
        
        # Update escrow status to HELD
        escrow.status = EscrowStatus.HELD
        
        # Create payment log
        payment_log = PaymentLog(
            escrow_id=escrow.id,
            event_type="payment",
            event_status="captured",
            razorpay_id=f"pay_simulated_{escrow.id}",
            razorpay_order_id=escrow.razorpay_order_id,
            amount=escrow.amount,
            currency=escrow.currency,
            webhook_payload={"simulated": True, "event": "payment.captured"}
        )
        db.add(payment_log)
        
        await db.commit()
        
        print("✅ Payment captured successfully!")
        print(f"New Status: {escrow.status}")
        print(f"\n💡 The escrow is now HELD. Funds are in escrow.\n")
        print("Next steps:")
        print("1. Both parties can confirm delivery")
        print("2. Or raise a dispute if there's an issue\n")


async def list_escrows():
    """List all escrows"""
    
    print("\n📋 Available Escrows:\n")
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Escrow).order_by(Escrow.created_at.desc()).limit(10)
        )
        escrows = result.scalars().all()
        
        if not escrows:
            print("No escrows found\n")
            return
        
        for idx, escrow in enumerate(escrows, 1):
            print(f"{idx}. ID: {escrow.id}")
            print(f"   Status: {escrow.status}")
            print(f"   Amount: ₹{escrow.amount/100}")
            print(f"   Payee: {escrow.payee_vpa}")
            print(f"   Created: {escrow.created_at}")
            print()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎭 RAZORPAY WEBHOOK SIMULATOR")
    print("="*60)
    
    try:
        asyncio.run(list_escrows())
        
        escrow_id = input("Enter Escrow ID to simulate payment capture: ").strip()
        
        if escrow_id:
            asyncio.run(simulate_payment_captured(escrow_id))
        else:
            print("\n❌ No escrow ID provided\n")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user\n")
    except Exception as e:
        print(f"\n\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
