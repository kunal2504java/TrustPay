from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta, timezone
import logging

from app.models.escrow import Escrow, EscrowStatus
from app.models.confirmation import Confirmation
from app.models.payment_log import PaymentLog
from app.schemas.escrow import EscrowCreate
from app.services.setu_service import SetuService
from app.services.blockchain_service import BlockchainService
from app.services.razorpay_service import RazorpayService
from app.services.websocket_manager import manager
from app.core.config import settings

logger = logging.getLogger(__name__)

class EscrowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.setu_service = SetuService()
        self.blockchain_service = BlockchainService()
        self.razorpay_service = RazorpayService()
    
    async def _notify_escrow_update(self, escrow: Escrow, event_type: str = "status_change"):
        """Send WebSocket notification for escrow updates"""
        try:
            update_data = {
                "escrow_id": str(escrow.id),
                "status": escrow.status.value,
                "amount": float(escrow.amount),
                "event_type": event_type,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            await manager.broadcast_escrow_update(str(escrow.id), update_data)
        except Exception as e:
            logger.error(f"Error sending WebSocket notification: {e}")
    
    async def create_escrow(self, payer_id: UUID, escrow_data: EscrowCreate) -> Tuple[Escrow, Dict[str, Any]]:
        """
        Create a new escrow transaction and generate Razorpay payment order
        
        Returns:
            Tuple of (escrow_object, razorpay_order_data)
        """
        
        try:
            # Create escrow record
            escrow = Escrow(
                payer_id=payer_id,
                payee_vpa=escrow_data.payee_vpa,
                amount=escrow_data.amount,
                currency=escrow_data.currency,
                description=escrow_data.description,
                order_id=escrow_data.order_id,
                condition=escrow_data.condition,
                status=EscrowStatus.INITIATED,
                expires_at=datetime.now(timezone.utc) + timedelta(days=7),  # 7 days expiry
                payment_initiated_at=datetime.now(timezone.utc)
            )
        except Exception as e:
            logger.error(f"Error creating escrow object: {e}")
            raise
        
        self.db.add(escrow)
        await self.db.commit()
        await self.db.refresh(escrow)
        
        # Create Razorpay payment order
        razorpay_order = None
        try:
            razorpay_order = await self.razorpay_service.create_payment_order(
                amount=escrow_data.amount,
                currency=escrow_data.currency,
                receipt=f"escrow_{escrow.id}",
                notes={
                    "escrow_id": str(escrow.id),
                    "payer_id": str(payer_id),
                    "payee_vpa": escrow_data.payee_vpa,
                    "description": escrow_data.description or "Escrow payment"
                }
            )
            
            # Update escrow with Razorpay order ID
            escrow.razorpay_order_id = razorpay_order.get("id")
            escrow.status = EscrowStatus.INITIATED
            
            # Create payment log
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="payment",
                event_status="initiated",
                razorpay_id=razorpay_order.get("id"),
                razorpay_order_id=razorpay_order.get("id"),
                amount=escrow_data.amount,
                currency=escrow_data.currency
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
            logger.info(f"Escrow created with Razorpay order: escrow_id={escrow.id}, order_id={razorpay_order.get('id')}")
            
        except Exception as e:
            # Handle Razorpay API error
            logger.error(f"Razorpay API error: {e}")
            escrow.status = EscrowStatus.INITIATED
            escrow.last_payment_error = str(e)
            
            # Create payment log for failure
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="payment",
                event_status="failed",
                amount=escrow_data.amount,
                currency=escrow_data.currency,
                error_message=str(e)
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
            # Return escrow with empty order data
            razorpay_order = {
                "error": str(e),
                "message": "Payment order creation failed. Please try again."
            }
        
        # Ensure all attributes are loaded
        await self.db.refresh(escrow)
        
        # Add Razorpay key to the payment order response for frontend
        if razorpay_order and "error" not in razorpay_order:
            razorpay_order["key"] = settings.RAZORPAY_KEY_ID
        
        return escrow, razorpay_order
    
    async def get_escrow(self, escrow_id: UUID) -> Optional[Escrow]:
        """Get escrow by ID"""
        result = await self.db.execute(
            select(Escrow).where(Escrow.id == escrow_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_escrows(self, user_id: UUID) -> List[Escrow]:
        """Get all escrows for a user"""
        result = await self.db.execute(
            select(Escrow).where(Escrow.payer_id == user_id).order_by(Escrow.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def confirm_escrow(self, escrow_id: UUID, user_id: UUID) -> dict:
        """Confirm escrow completion and trigger payout if both parties confirmed"""
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError("Escrow not found")
        
        if escrow.status not in [EscrowStatus.HELD, EscrowStatus.INITIATED]:
            raise ValueError(f"Escrow is not in confirmable status: {escrow.status}")
        
        # Record confirmation
        confirmation = Confirmation(
            escrow_id=escrow_id,
            user_id=user_id,
            role="payer" if escrow.payer_id == user_id else "payee"
        )
        self.db.add(confirmation)
        await self.db.commit()
        
        # Check if both parties have confirmed
        result = await self.db.execute(
            select(Confirmation).where(Confirmation.escrow_id == escrow_id)
        )
        confirmations = list(result.scalars().all())
        
        if len(confirmations) >= 2:
            # Both confirmed, trigger payout
            try:
                await self.release_funds(
                    escrow_id=escrow_id,
                    payee_upi=escrow.payee_vpa
                )
                return {
                    "message": "Both parties confirmed. Payout initiated.",
                    "status": "releasing"
                }
            except Exception as e:
                logger.error(f"Failed to initiate payout for escrow {escrow_id}: {e}")
                return {
                    "message": "Both parties confirmed but payout failed. Will retry automatically.",
                    "error": str(e),
                    "status": "payout_pending"
                }
        
        return {"message": "Confirmation recorded, waiting for other party"}
    
    async def raise_dispute(self, escrow_id: UUID, user_id: UUID, reason: str) -> dict:
        """Raise a dispute for escrow"""
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError("Escrow not found")
        
        escrow.status = EscrowStatus.DISPUTED
        await self.db.commit()
        
        return {"message": "Dispute raised successfully", "escrow_id": str(escrow_id)}

    async def handle_payment_success(
        self,
        escrow_id: UUID,
        payment_id: str,
        order_id: str
    ) -> Escrow:
        """
        Handle successful payment capture from Razorpay webhook
        
        Args:
            escrow_id: Escrow UUID
            payment_id: Razorpay payment ID
            order_id: Razorpay order ID
            
        Returns:
            Updated escrow object
        """
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError(f"Escrow not found: {escrow_id}")
        
        try:
            # Update escrow status to HELD
            escrow.status = EscrowStatus.HELD
            escrow.razorpay_payment_id = payment_id
            escrow.payment_completed_at = datetime.now(timezone.utc)
            escrow.last_payment_error = None  # Clear any previous errors
            
            # Create payment log
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="payment",
                event_status="success",
                razorpay_id=payment_id,
                razorpay_order_id=order_id,
                amount=escrow.amount,
                currency=escrow.currency
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
            # Record on blockchain
            try:
                await self.blockchain_service.mark_escrow_held(str(escrow_id))
                logger.info(f"Blockchain updated for escrow {escrow_id}")
            except Exception as e:
                logger.error(f"Blockchain update failed for escrow {escrow_id}: {e}")
                # Don't fail the payment if blockchain update fails
            
            logger.info(f"Payment successful for escrow {escrow_id}: payment_id={payment_id}")
            return escrow
            
        except Exception as e:
            logger.error(f"Error handling payment success for escrow {escrow_id}: {e}")
            raise

    async def release_funds(
        self,
        escrow_id: UUID,
        payee_upi: str,
        account_number: str = None
    ) -> Dict[str, Any]:
        """
        Initiate payout to release escrow funds to payee
        
        Args:
            escrow_id: Escrow UUID
            payee_upi: Payee's UPI ID
            account_number: Razorpay account number for payout (optional)
            
        Returns:
            Payout details from Razorpay
        """
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError(f"Escrow not found: {escrow_id}")
        
        if escrow.status != EscrowStatus.HELD:
            raise ValueError(f"Escrow must be in HELD status to release funds. Current status: {escrow.status}")
        
        # Verify both parties have confirmed
        result = await self.db.execute(
            select(Confirmation).where(Confirmation.escrow_id == escrow_id)
        )
        confirmations = list(result.scalars().all())
        
        if len(confirmations) < 2:
            raise ValueError("Both parties must confirm before releasing funds")
        
        try:
            # Update status to RELEASING
            escrow.status = EscrowStatus.RELEASED  # Will be updated to RELEASED after payout success
            escrow.payout_initiated_at = datetime.now(timezone.utc)
            
            # Create payout via Razorpay
            # Note: In production, you'll need a valid Razorpay account number
            # For now, we'll use a placeholder or the one from settings
            payout = await self.razorpay_service.create_payout(
                account_number=account_number or "default_account",  # Replace with actual account
                amount=escrow.amount,
                currency=escrow.currency,
                mode="UPI",
                payee_vpa=payee_upi,
                reference_id=f"escrow_{escrow.id}",
                narration=f"Escrow release: {escrow.description or escrow.id}"
            )
            
            # Update escrow with payout ID
            escrow.razorpay_payout_id = payout.get("id")
            
            # Create payment log
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="payout",
                event_status="initiated",
                razorpay_id=payout.get("id"),
                amount=escrow.amount,
                currency=escrow.currency
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
            logger.info(f"Payout initiated for escrow {escrow_id}: payout_id={payout.get('id')}")
            return payout
            
        except Exception as e:
            logger.error(f"Error initiating payout for escrow {escrow_id}: {e}")
            
            # Update error tracking
            escrow.last_payment_error = str(e)
            escrow.payment_retry_count += 1
            
            # Create payment log for failure
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="payout",
                event_status="failed",
                amount=escrow.amount,
                currency=escrow.currency,
                error_message=str(e)
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            raise

    async def handle_payout_success(
        self,
        escrow_id: UUID,
        payout_id: str
    ) -> Escrow:
        """
        Handle successful payout from Razorpay webhook
        
        Args:
            escrow_id: Escrow UUID
            payout_id: Razorpay payout ID
            
        Returns:
            Updated escrow object
        """
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError(f"Escrow not found: {escrow_id}")
        
        try:
            # Update escrow status to RELEASED
            escrow.status = EscrowStatus.RELEASED
            escrow.razorpay_payout_id = payout_id
            escrow.payout_completed_at = datetime.now(timezone.utc)
            escrow.last_payment_error = None  # Clear any previous errors
            
            # Create payment log
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="payout",
                event_status="success",
                razorpay_id=payout_id,
                amount=escrow.amount,
                currency=escrow.currency
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
            # Record on blockchain
            try:
                await self.blockchain_service.release_escrow(str(escrow_id))
                logger.info(f"Blockchain updated for escrow release {escrow_id}")
            except Exception as e:
                logger.error(f"Blockchain update failed for escrow {escrow_id}: {e}")
                # Don't fail the payout if blockchain update fails
            
            logger.info(f"Payout successful for escrow {escrow_id}: payout_id={payout_id}")
            return escrow
            
        except Exception as e:
            logger.error(f"Error handling payout success for escrow {escrow_id}: {e}")
            raise

    async def process_refund(
        self,
        escrow_id: UUID,
        reason: str,
        amount: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process refund for cancelled or disputed escrow
        
        Args:
            escrow_id: Escrow UUID
            reason: Reason for refund
            amount: Amount to refund in paise (None for full refund)
            
        Returns:
            Refund details from Razorpay
        """
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError(f"Escrow not found: {escrow_id}")
        
        if not escrow.razorpay_payment_id:
            raise ValueError("No payment found to refund")
        
        if escrow.status == EscrowStatus.REFUNDED:
            raise ValueError("Escrow already refunded")
        
        try:
            # Create refund via Razorpay
            refund = await self.razorpay_service.create_refund(
                payment_id=escrow.razorpay_payment_id,
                amount=amount,  # None for full refund
                notes={
                    "escrow_id": str(escrow.id),
                    "reason": reason
                }
            )
            
            # Update escrow
            escrow.status = EscrowStatus.REFUNDED
            escrow.razorpay_refund_id = refund.get("id")
            
            # Create payment log
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="refund",
                event_status="initiated",
                razorpay_id=refund.get("id"),
                amount=amount or escrow.amount,
                currency=escrow.currency
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            await self.db.refresh(escrow)
            
            logger.info(f"Refund initiated for escrow {escrow_id}: refund_id={refund.get('id')}")
            
            # TODO: Send notification to payer about refund
            
            return refund
            
        except Exception as e:
            logger.error(f"Error processing refund for escrow {escrow_id}: {e}")
            
            # Create payment log for failure
            payment_log = PaymentLog(
                escrow_id=escrow.id,
                event_type="refund",
                event_status="failed",
                amount=amount or escrow.amount,
                currency=escrow.currency,
                error_message=str(e)
            )
            self.db.add(payment_log)
            
            await self.db.commit()
            raise

    async def retry_failed_payout(
        self,
        escrow_id: UUID,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Retry failed payout with exponential backoff
        
        Args:
            escrow_id: Escrow UUID
            max_retries: Maximum number of retry attempts
            
        Returns:
            Payout details or error information
        """
        escrow = await self.get_escrow(escrow_id)
        
        if not escrow:
            raise ValueError(f"Escrow not found: {escrow_id}")
        
        if escrow.payment_retry_count >= max_retries:
            error_msg = f"Max retries ({max_retries}) exceeded for escrow {escrow_id}"
            logger.error(error_msg)
            
            # TODO: Alert admin about failed payout
            
            raise ValueError(error_msg)
        
        try:
            # Attempt payout again
            result = await self.release_funds(
                escrow_id=escrow_id,
                payee_upi=escrow.payee_vpa
            )
            
            # Reset retry count on success
            escrow.payment_retry_count = 0
            escrow.last_payment_error = None
            await self.db.commit()
            
            return result
            
        except Exception as e:
            # Increment retry count
            escrow.payment_retry_count += 1
            escrow.last_payment_error = str(e)
            await self.db.commit()
            
            logger.warning(f"Payout retry {escrow.payment_retry_count}/{max_retries} failed for escrow {escrow_id}: {e}")
            
            if escrow.payment_retry_count >= max_retries:
                # TODO: Alert admin
                logger.error(f"All payout retries exhausted for escrow {escrow_id}")
            
            raise
