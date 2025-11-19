from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.escrow import Escrow
from app.services.razorpay_service import RazorpayService
from app.services.escrow_service import EscrowService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Razorpay webhook events
    
    Supported events:
    - payment.captured: Payment successful
    - payment.failed: Payment failed
    - payout.processed: Payout successful
    - payout.failed: Payout failed
    - refund.processed: Refund successful
    """
    # Get request body and signature
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    
    logger.info(f"Received webhook with signature: {signature[:20]}...")
    
    # Verify webhook signature
    razorpay_service = RazorpayService()
    is_valid = await razorpay_service.verify_webhook_signature(body, signature)
    
    if not is_valid:
        logger.warning("Invalid webhook signature received")
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    
    # Parse webhook data
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook JSON: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    event = data.get("event")
    payload = data.get("payload", {})
    
    logger.info(f"Processing webhook event: {event}")
    
    try:
        # Route to appropriate handler
        if event == "payment.captured":
            await handle_payment_captured(payload, db)
        elif event == "payment.failed":
            await handle_payment_failed(payload, db)
        elif event == "payout.processed":
            await handle_payout_processed(payload, db)
        elif event == "payout.failed":
            await handle_payout_failed(payload, db)
        elif event == "refund.processed":
            await handle_refund_processed(payload, db)
        else:
            logger.warning(f"Unhandled webhook event: {event}")
            # Return 200 even for unhandled events to prevent retries
            return {"status": "ok", "message": f"Event {event} not handled"}
    
    except Exception as e:
        logger.error(f"Error processing webhook {event}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Webhook processing failed")
    
    return {"status": "ok", "event": event}



async def handle_payment_captured(payload: dict, db: AsyncSession):
    """Handle successful payment capture"""
    payment = payload.get("payment", {}).get("entity", {})
    payment_id = payment.get("id")
    order_id = payment.get("order_id")
    notes = payment.get("notes", {})
    escrow_id = notes.get("escrow_id")
    
    logger.info(f"Payment captured: payment_id={payment_id}, order_id={order_id}, escrow_id={escrow_id}")
    
    if not escrow_id:
        logger.warning("No escrow_id found in payment notes")
        return
    
    # Get escrow
    result = await db.execute(select(Escrow).where(Escrow.id == escrow_id))
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        logger.error(f"Escrow {escrow_id} not found")
        return
    
    # Update escrow using service
    escrow_service = EscrowService(db)
    try:
        await escrow_service.handle_payment_success(
            escrow_id=escrow_id,
            payment_id=payment_id,
            order_id=order_id
        )
        logger.info(f"Escrow {escrow_id} marked as HELD")
    except Exception as e:
        logger.error(f"Failed to update escrow {escrow_id}: {e}")
        raise



async def handle_payment_failed(payload: dict, db: AsyncSession):
    """Handle failed payment"""
    payment = payload.get("payment", {}).get("entity", {})
    payment_id = payment.get("id")
    notes = payment.get("notes", {})
    escrow_id = notes.get("escrow_id")
    error_description = payment.get("error_description", "Payment failed")
    
    logger.warning(f"Payment failed: payment_id={payment_id}, escrow_id={escrow_id}, error={error_description}")
    
    if not escrow_id:
        logger.warning("No escrow_id found in failed payment notes")
        return
    
    # Get escrow
    result = await db.execute(select(Escrow).where(Escrow.id == escrow_id))
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        logger.error(f"Escrow {escrow_id} not found")
        return
    
    # Update escrow with error
    escrow.last_payment_error = error_description
    
    # Create payment log
    from app.models.payment_log import PaymentLog
    payment_log = PaymentLog(
        escrow_id=escrow.id,
        event_type="payment",
        event_status="failed",
        razorpay_id=payment_id,
        amount=escrow.amount,
        currency=escrow.currency,
        error_message=error_description,
        webhook_payload=payload
    )
    db.add(payment_log)
    
    await db.commit()
    logger.info(f"Payment failure recorded for escrow {escrow_id}")
    
    # TODO: Send notification to payer about payment failure



async def handle_payout_processed(payload: dict, db: AsyncSession):
    """Handle successful payout"""
    payout = payload.get("payout", {}).get("entity", {})
    payout_id = payout.get("id")
    reference_id = payout.get("reference_id", "")
    
    logger.info(f"Payout processed: payout_id={payout_id}, reference_id={reference_id}")
    
    # Extract escrow_id from reference_id (format: "escrow_{uuid}")
    if not reference_id.startswith("escrow_"):
        logger.warning(f"Invalid reference_id format: {reference_id}")
        return
    
    escrow_id = reference_id.replace("escrow_", "")
    
    # Get escrow
    result = await db.execute(select(Escrow).where(Escrow.id == escrow_id))
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        logger.error(f"Escrow {escrow_id} not found")
        return
    
    # Update escrow using service
    escrow_service = EscrowService(db)
    try:
        await escrow_service.handle_payout_success(
            escrow_id=escrow_id,
            payout_id=payout_id
        )
        logger.info(f"Escrow {escrow_id} marked as RELEASED")
    except Exception as e:
        logger.error(f"Failed to update escrow {escrow_id}: {e}")
        raise
    
    # TODO: Send notifications to both parties about successful release



async def handle_payout_failed(payload: dict, db: AsyncSession):
    """Handle failed payout"""
    payout = payload.get("payout", {}).get("entity", {})
    payout_id = payout.get("id")
    reference_id = payout.get("reference_id", "")
    error_description = payout.get("status_details", {}).get("description", "Payout failed")
    
    logger.warning(f"Payout failed: payout_id={payout_id}, reference_id={reference_id}, error={error_description}")
    
    # Extract escrow_id from reference_id
    if not reference_id.startswith("escrow_"):
        logger.warning(f"Invalid reference_id format: {reference_id}")
        return
    
    escrow_id = reference_id.replace("escrow_", "")
    
    # Get escrow
    result = await db.execute(select(Escrow).where(Escrow.id == escrow_id))
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        logger.error(f"Escrow {escrow_id} not found")
        return
    
    # Update escrow with error
    escrow.last_payment_error = error_description
    escrow.payment_retry_count += 1
    
    # Create payment log
    from app.models.payment_log import PaymentLog
    payment_log = PaymentLog(
        escrow_id=escrow.id,
        event_type="payout",
        event_status="failed",
        razorpay_id=payout_id,
        amount=escrow.amount,
        currency=escrow.currency,
        error_message=error_description,
        webhook_payload=payload
    )
    db.add(payment_log)
    
    await db.commit()
    logger.info(f"Payout failure recorded for escrow {escrow_id}, retry count: {escrow.payment_retry_count}")
    
    # Check if we should retry
    if escrow.payment_retry_count < 3:
        logger.info(f"Will retry payout for escrow {escrow_id}")
        # TODO: Implement automatic retry with exponential backoff
        # For now, admin will need to manually retry
    else:
        logger.error(f"Max retries exceeded for escrow {escrow_id}")
        # TODO: Alert admin about failed payout



async def handle_refund_processed(payload: dict, db: AsyncSession):
    """Handle successful refund"""
    refund = payload.get("refund", {}).get("entity", {})
    refund_id = refund.get("id")
    payment_id = refund.get("payment_id")
    notes = refund.get("notes", {})
    escrow_id = notes.get("escrow_id")
    
    logger.info(f"Refund processed: refund_id={refund_id}, payment_id={payment_id}, escrow_id={escrow_id}")
    
    if not escrow_id:
        # Try to find escrow by payment_id
        result = await db.execute(
            select(Escrow).where(Escrow.razorpay_payment_id == payment_id)
        )
        escrow = result.scalar_one_or_none()
        if escrow:
            escrow_id = str(escrow.id)
    else:
        result = await db.execute(select(Escrow).where(Escrow.id == escrow_id))
        escrow = result.scalar_one_or_none()
    
    if not escrow:
        logger.error(f"Escrow not found for refund {refund_id}")
        return
    
    # Update escrow
    from app.models.escrow import EscrowStatus
    escrow.status = EscrowStatus.REFUNDED
    escrow.razorpay_refund_id = refund_id
    
    # Create payment log
    from app.models.payment_log import PaymentLog
    payment_log = PaymentLog(
        escrow_id=escrow.id,
        event_type="refund",
        event_status="success",
        razorpay_id=refund_id,
        amount=refund.get("amount", escrow.amount),
        currency=escrow.currency,
        webhook_payload=payload
    )
    db.add(payment_log)
    
    await db.commit()
    logger.info(f"Escrow {escrow.id} marked as REFUNDED")
    
    # TODO: Send notification to payer about successful refund
