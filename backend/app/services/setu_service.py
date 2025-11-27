import httpx
import base64
from typing import Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SetuService:
    def __init__(self):
        self.base_url = settings.SETU_BASE_URL
        self.client_id = settings.SETU_CLIENT_ID
        self.client_secret = settings.SETU_CLIENT_SECRET
        self.merchant_id = settings.SETU_MERCHANT_ID
        self.merchant_vpa = settings.SETU_MERCHANT_VPA
        self.webhook_secret = settings.SETU_WEBHOOK_SECRET
        self.scheme_id = settings.SETU_SCHEME_ID
        self._access_token: Optional[str] = None
    
    async def _get_access_token(self) -> str:
        """Get OAuth access token from Setu"""
        if self._access_token:
            return self._access_token
        
        # Create Basic Auth header
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/token",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self._access_token = token_data.get("access_token")
                logger.info("Setu access token obtained successfully")
                return self._access_token
            else:
                logger.error(f"Failed to get Setu access token: {response.text}")
                raise Exception(f"Setu auth error: {response.text}")
    
    async def _get_headers(self) -> Dict[str, str]:
        """Get headers with access token"""
        token = await self._get_access_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    async def create_collect_request(
        self, 
        amount: int,  # Amount in paise
        customer_vpa: str,
        reference_id: str,
        transaction_note: str,
        metadata: Optional[Dict[str, Any]] = None,
        expire_after: int = 15  # Minutes
    ) -> Dict[str, Any]:
        """
        Create UPI collect request
        
        Args:
            amount: Amount in paise (will be converted to rupees)
            customer_vpa: Payer's UPI ID
            reference_id: Unique reference ID for this transaction
            transaction_note: Description of the transaction
            metadata: Additional metadata (optional)
            expire_after: Expiry time in minutes (default 15)
        
        Returns:
            Collect request details from Setu
        """
        headers = await self._get_headers()
        headers["merchantId"] = self.merchant_id
        
        payload = {
            "amount": amount / 100,  # Convert paise to rupees
            "customerVpa": customer_vpa,
            "expireAfter": expire_after,
            "merchantVpa": self.merchant_vpa,
            "metadata": metadata or {},
            "referenceId": reference_id,
            "transactionNote": transaction_note
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/merchants/collect",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Setu collect request created: reference_id={reference_id}")
                return response.json()
            else:
                logger.error(f"Setu collect request failed: {response.status_code} - {response.text}")
                raise Exception(f"Setu API error: {response.text}")
    
    async def get_collect_status(self, collect_id: str) -> Dict[str, Any]:
        """
        Get status of a collect request
        
        Args:
            collect_id: The collect request ID returned from create_collect_request
        
        Returns:
            Collect request status and details
        """
        headers = await self._get_headers()
        headers["merchantId"] = self.merchant_id
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/merchants/collect/{collect_id}",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                logger.info(f"Setu collect status retrieved: collect_id={collect_id}")
                return response.json()
            else:
                logger.error(f"Setu collect status failed: {response.status_code} - {response.text}")
                raise Exception(f"Setu API error: {response.text}")
    
    async def create_payout(
        self,
        payee_vpa: str,
        amount: int,  # Amount in paise
        reference_id: str,
        remarks: str = "Escrow release"
    ) -> Dict[str, Any]:
        """
        Create UPI payout to release escrow funds
        
        Args:
            payee_vpa: Payee's UPI VPA (e.g., user@paytm)
            amount: Amount in paise (will be converted to rupees)
            reference_id: Unique reference ID for tracking
            remarks: Payment description
            
        Returns:
            Payout details from Setu
        """
        headers = await self._get_headers()
        headers["merchantId"] = self.merchant_id
        
        payload = {
            "amount": amount / 100,  # Convert paise to rupees
            "payeeVpa": payee_vpa,
            "referenceId": reference_id,
            "remarks": remarks,
            "merchantVpa": self.merchant_vpa
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/merchants/payout",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Setu payout created: reference_id={reference_id}, amount={amount/100}")
                return response.json()
            else:
                logger.error(f"Setu payout failed: {response.status_code} - {response.text}")
                raise Exception(f"Setu payout error: {response.text}")
    
    async def get_payout_status(self, payout_id: str) -> Dict[str, Any]:
        """
        Get status of a payout
        
        Args:
            payout_id: The payout ID returned from create_payout
            
        Returns:
            Payout status and details
        """
        headers = await self._get_headers()
        headers["merchantId"] = self.merchant_id
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/merchants/payout/{payout_id}",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                logger.info(f"Setu payout status retrieved: payout_id={payout_id}")
                return response.json()
            else:
                logger.error(f"Setu payout status failed: {response.status_code} - {response.text}")
                raise Exception(f"Setu API error: {response.text}")
    
    async def create_refund(
        self,
        collect_id: str,
        amount: Optional[int] = None,  # Amount in paise, None for full refund
        reference_id: str = None,
        reason: str = "Escrow cancelled"
    ) -> Dict[str, Any]:
        """
        Create refund for a UPI collect payment
        
        Args:
            collect_id: Original collect request ID
            amount: Amount to refund in paise (None for full refund)
            reference_id: Unique reference ID
            reason: Reason for refund
            
        Returns:
            Refund details from Setu
        """
        headers = await self._get_headers()
        headers["merchantId"] = self.merchant_id
        
        payload = {
            "collectId": collect_id,
            "referenceId": reference_id or f"refund_{collect_id}",
            "reason": reason
        }
        
        if amount is not None:
            payload["amount"] = amount / 100  # Convert paise to rupees
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/merchants/refund",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Setu refund created: collect_id={collect_id}")
                return response.json()
            else:
                logger.error(f"Setu refund failed: {response.status_code} - {response.text}")
                raise Exception(f"Setu refund error: {response.text}")
    
    async def verify_webhook_signature(
        self,
        body: bytes,
        signature: str
    ) -> bool:
        """
        Verify Setu webhook signature for security
        
        Args:
            body: Raw webhook request body
            signature: X-Setu-Signature header value
            
        Returns:
            True if signature is valid, False otherwise
        """
        if not self.webhook_secret:
            logger.warning("Setu webhook secret not configured. Skipping signature verification.")
            return True  # Allow in development without webhook secret
        
        try:
            import hmac
            import hashlib
            
            # Compute HMAC SHA256
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            
            is_valid = hmac.compare_digest(expected_signature, signature)
            
            if is_valid:
                logger.info("Setu webhook signature verified successfully")
            else:
                logger.warning("Invalid Setu webhook signature")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Setu webhook signature verification error: {e}")
            return False
