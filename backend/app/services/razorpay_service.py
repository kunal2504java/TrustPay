import razorpay
from typing import Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RazorpayService:
    """Service for handling Razorpay payment operations"""
    
    def __init__(self):
        """Initialize Razorpay client with API credentials"""
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            logger.warning("Razorpay credentials not configured. Payment operations will fail.")
            self.client = None
        else:
            try:
                self.client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
                logger.info("Razorpay client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Razorpay client: {e}")
                self.client = None
    
    def _ensure_client(self):
        """Ensure Razorpay client is initialized"""
        if not self.client:
            raise Exception("Razorpay client not initialized. Check API credentials.")

    async def create_payment_order(
        self, 
        amount: int,  # Amount in paise
        currency: str = "INR",
        receipt: str = None,
        notes: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a Razorpay order for payment collection
        
        Args:
            amount: Amount in paise (e.g., 50000 for ₹500)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            notes: Additional metadata
            
        Returns:
            Order details including order_id
        """
        self._ensure_client()
        
        try:
            # Generate a short receipt ID (max 40 chars as per Razorpay requirement)
            import time
            import uuid
            if not receipt:
                # Use timestamp + short UUID (total ~30 chars)
                timestamp = int(time.time())
                short_uuid = str(uuid.uuid4())[:8]
                receipt = f"rcpt_{timestamp}_{short_uuid}"
            
            # Ensure receipt is not longer than 40 characters
            if len(receipt) > 40:
                receipt = receipt[:40]
            
            order_data = {
                "amount": amount,
                "currency": currency,
                "receipt": receipt,
                "notes": notes or {}
            }
            
            logger.info(f"Creating Razorpay order: amount={amount}, currency={currency}")
            order = self.client.order.create(data=order_data)
            logger.info(f"Razorpay order created successfully: {order.get('id')}")
            
            return order
            
        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay bad request error: {e}")
            raise Exception(f"Invalid payment order request: {str(e)}")
        except razorpay.errors.ServerError as e:
            logger.error(f"Razorpay server error: {e}")
            raise Exception("Payment service temporarily unavailable. Please try again.")
        except Exception as e:
            logger.error(f"Unexpected error creating payment order: {e}")
            raise Exception(f"Failed to create payment order: {str(e)}")

    async def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        """
        Verify Razorpay webhook signature for security
        
        Args:
            body: Raw webhook request body
            signature: X-Razorpay-Signature header value
            
        Returns:
            True if signature is valid, False otherwise
        """
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            logger.warning("Webhook secret not configured. Skipping signature verification.")
            return True  # Allow in development without webhook secret
        
        try:
            self._ensure_client()
            
            # Razorpay utility method for signature verification
            is_valid = self.client.utility.verify_webhook_signature(
                body.decode('utf-8') if isinstance(body, bytes) else body,
                signature,
                settings.RAZORPAY_WEBHOOK_SECRET
            )
            
            if is_valid:
                logger.info("Webhook signature verified successfully")
            else:
                logger.warning("Invalid webhook signature")
                
            return is_valid
            
        except Exception as e:
            logger.error(f"Webhook signature verification error: {e}")
            return False

    async def create_payout(
        self,
        account_number: str,
        amount: int,  # Amount in paise
        currency: str = "INR",
        mode: str = "UPI",
        fund_account_id: str = None,
        payee_vpa: str = None,
        reference_id: str = None,
        narration: str = "Escrow release"
    ) -> Dict[str, Any]:
        """
        Create a payout to release escrow funds
        
        Args:
            account_number: Razorpay account number for payout
            amount: Amount in paise
            currency: Currency code (default: INR)
            mode: Payment mode (UPI, IMPS, NEFT, RTGS)
            fund_account_id: Existing fund account ID (optional)
            payee_vpa: UPI VPA for new fund account (required if fund_account_id not provided)
            reference_id: Reference ID for tracking
            narration: Payment description
            
        Returns:
            Payout details including payout_id
        """
        self._ensure_client()
        
        try:
            payout_data = {
                "account_number": account_number,
                "amount": amount,
                "currency": currency,
                "mode": mode,
                "purpose": "payout",
                "queue_if_low_balance": True,
                "reference_id": reference_id or f"payout_{amount}",
                "narration": narration
            }
            
            # If fund_account_id is provided, use it; otherwise create inline fund account
            if fund_account_id:
                payout_data["fund_account_id"] = fund_account_id
            elif payee_vpa:
                payout_data["fund_account"] = {
                    "account_type": "vpa",
                    "vpa": {
                        "address": payee_vpa
                    }
                }
            else:
                raise ValueError("Either fund_account_id or payee_vpa must be provided")
            
            logger.info(f"Creating Razorpay payout: amount={amount}, mode={mode}, reference={reference_id}")
            payout = self.client.payout.create(data=payout_data)
            logger.info(f"Razorpay payout created successfully: {payout.get('id')}")
            
            return payout
            
        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay payout bad request: {e}")
            raise Exception(f"Invalid payout request: {str(e)}")
        except razorpay.errors.ServerError as e:
            logger.error(f"Razorpay payout server error: {e}")
            raise Exception("Payout service temporarily unavailable. Please try again.")
        except Exception as e:
            logger.error(f"Unexpected error creating payout: {e}")
            raise Exception(f"Failed to create payout: {str(e)}")

    async def create_refund(
        self,
        payment_id: str,
        amount: Optional[int] = None,  # Amount in paise, None for full refund
        notes: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a refund for a payment
        
        Args:
            payment_id: Razorpay payment ID to refund
            amount: Amount to refund in paise (None for full refund)
            notes: Additional metadata
            
        Returns:
            Refund details including refund_id
        """
        self._ensure_client()
        
        try:
            refund_data = {}
            
            if amount is not None:
                refund_data["amount"] = amount
                logger.info(f"Creating partial refund: payment_id={payment_id}, amount={amount}")
            else:
                logger.info(f"Creating full refund: payment_id={payment_id}")
            
            if notes:
                refund_data["notes"] = notes
            
            refund = self.client.payment.refund(payment_id, refund_data)
            logger.info(f"Razorpay refund created successfully: {refund.get('id')}")
            
            return refund
            
        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay refund bad request: {e}")
            raise Exception(f"Invalid refund request: {str(e)}")
        except razorpay.errors.ServerError as e:
            logger.error(f"Razorpay refund server error: {e}")
            raise Exception("Refund service temporarily unavailable. Please try again.")
        except Exception as e:
            logger.error(f"Unexpected error creating refund: {e}")
            raise Exception(f"Failed to create refund: {str(e)}")

    async def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Fetch payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Payment details including status
        """
        self._ensure_client()
        
        try:
            logger.info(f"Fetching payment details: payment_id={payment_id}")
            payment = self.client.payment.fetch(payment_id)
            logger.info(f"Payment details fetched: status={payment.get('status')}")
            
            return payment
            
        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay payment fetch bad request: {e}")
            raise Exception(f"Invalid payment ID: {str(e)}")
        except razorpay.errors.ServerError as e:
            logger.error(f"Razorpay payment fetch server error: {e}")
            raise Exception("Payment service temporarily unavailable. Please try again.")
        except Exception as e:
            logger.error(f"Unexpected error fetching payment: {e}")
            raise Exception(f"Failed to fetch payment details: {str(e)}")
    
    async def verify_payment_signature(
        self,
        order_id: str,
        payment_id: str,
        signature: str
    ) -> bool:
        """
        Verify payment signature after payment completion
        
        Args:
            order_id: Razorpay order ID
            payment_id: Razorpay payment ID
            signature: Payment signature from frontend
            
        Returns:
            True if signature is valid, False otherwise
        """
        self._ensure_client()
        
        try:
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            
            # Razorpay utility method for payment signature verification
            self.client.utility.verify_payment_signature(params_dict)
            logger.info(f"Payment signature verified: order_id={order_id}, payment_id={payment_id}")
            return True
            
        except razorpay.errors.SignatureVerificationError as e:
            logger.warning(f"Invalid payment signature: {e}")
            return False
        except Exception as e:
            logger.error(f"Payment signature verification error: {e}")
            return False
