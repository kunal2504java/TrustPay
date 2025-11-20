"""
Check recent Razorpay payments in the database
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.payment_log import PaymentLog
from app.models.escrow import Escrow

# Import all models
from app.models.user import User
from app.models.confirmation import Confirmation
from app.models.dispute import Dispute
from app.models.blockchain_log import BlockchainLog


async def check_payments():
    """Check recent payments"""
    
    print("\n" + "="*80)
    print("📊 RAZORPAY PAYMENT STATUS")
    print("="*80 + "\n")
    
    async with AsyncSessionLocal() as db:
        # Get recent payments
        result = await db.execute(
            select(PaymentLog)
            .order_by(PaymentLog.created_at.desc())
            .limit(10)
        )
        payments = result.scalars().all()
        
        if not payments:
            print("❌ No payments found in database\n")
            print("💡 Create an escrow and make a payment to see results here.\n")
            return
        
        print(f"✅ Found {len(payments)} recent payment(s):\n")
        
        for idx, payment in enumerate(payments, 1):
            print(f"Payment #{idx}")
            print("-" * 80)
            print(f"  Payment ID:        {payment.id}")
            print(f"  Escrow ID:         {payment.escrow_id}")
            print(f"  Razorpay Order ID: {payment.razorpay_order_id or 'N/A'}")
            print(f"  Razorpay Payment:  {payment.razorpay_payment_id or 'N/A'}")
            print(f"  Amount:            ₹{payment.amount/100:.2f}")
            print(f"  Currency:          {payment.currency}")
            print(f"  Status:            {payment.status}")
            print(f"  Method:            {payment.payment_method or 'N/A'}")
            print(f"  Created:           {payment.created_at}")
            print(f"  Updated:           {payment.updated_at or 'N/A'}")
            
            # Get associated escrow
            escrow_result = await db.execute(
                select(Escrow).where(Escrow.id == payment.escrow_id)
            )
            escrow = escrow_result.scalar_one_or_none()
            
            if escrow:
                print(f"  Escrow Status:     {escrow.status}")
                print(f"  Escrow Amount:     ₹{escrow.amount}")
            
            print()
        
        # Summary
        print("="*80)
        print("📈 SUMMARY")
        print("="*80)
        
        status_counts = {}
        total_amount = 0
        
        for payment in payments:
            status_counts[payment.status] = status_counts.get(payment.status, 0) + 1
            if payment.status == 'captured':
                total_amount += payment.amount
        
        print(f"\nStatus Breakdown:")
        for status, count in status_counts.items():
            emoji = "✅" if status == "captured" else "⏳" if status == "created" else "❌"
            print(f"  {emoji} {status.upper()}: {count}")
        
        print(f"\nTotal Captured: ₹{total_amount/100:.2f}")
        print()


async def check_escrows_with_payments():
    """Check escrows that have payments"""
    
    print("\n" + "="*80)
    print("💰 ESCROWS WITH PAYMENTS")
    print("="*80 + "\n")
    
    async with AsyncSessionLocal() as db:
        # Get escrows with payments
        result = await db.execute(
            select(Escrow)
            .where(Escrow.razorpay_order_id.isnot(None))
            .order_by(Escrow.created_at.desc())
            .limit(10)
        )
        escrows = result.scalars().all()
        
        if not escrows:
            print("❌ No escrows with payments found\n")
            return
        
        print(f"✅ Found {len(escrows)} escrow(s) with payments:\n")
        
        for idx, escrow in enumerate(escrows, 1):
            print(f"Escrow #{idx}")
            print("-" * 80)
            print(f"  Escrow ID:         {escrow.id}")
            print(f"  Amount:            ₹{escrow.amount}")
            print(f"  Status:            {escrow.status}")
            print(f"  Razorpay Order:    {escrow.razorpay_order_id}")
            print(f"  Description:       {escrow.description}")
            print(f"  Created:           {escrow.created_at}")
            
            # Get payment logs for this escrow
            payment_result = await db.execute(
                select(PaymentLog).where(PaymentLog.escrow_id == escrow.id)
            )
            payments = payment_result.scalars().all()
            
            if payments:
                print(f"  Payments:          {len(payments)}")
                for payment in payments:
                    print(f"    - {payment.status}: ₹{payment.amount/100:.2f}")
            
            print()


if __name__ == "__main__":
    print("\n🔍 Checking Razorpay Payments...\n")
    
    try:
        asyncio.run(check_payments())
        asyncio.run(check_escrows_with_payments())
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user\n")
    except Exception as e:
        print(f"\n\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
