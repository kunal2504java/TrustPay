import httpx
from typing import Dict, Any
from app.core.config import settings

class SetuService:
    def __init__(self):
        self.base_url = settings.SETU_BASE_URL
        self.api_key = settings.SETU_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_collect_request(self, amount: int, description: str) -> Dict[str, Any]:
        """Create UPI collect request"""
        
        payload = {
            "amount": amount / 100,  # Convert paise to rupees
            "description": description,
            "expiresAt": "2024-12-31T23:59:59Z",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/collect",
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Setu API error: {response.text}")
    
    async def create_virtual_account(self, escrow_id: str) -> Dict[str, Any]:
        """Create virtual account for escrow"""
        
        payload = {
            "name": f"Escrow-{escrow_id}",
            "ifsc": "SETU0000001",
            "accountType": "current"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/virtual-accounts",
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Setu API error: {response.text}")
    
    async def release_funds(self, virtual_account_id: str, payee_vpa: str, amount: int) -> Dict[str, Any]:
        """Release funds from virtual account to payee"""
        
        payload = {
            "amount": amount / 100,  # Convert paise to rupees
            "payeeVPA": payee_vpa,
            "remarks": "Escrow release"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/virtual-accounts/{virtual_account_id}/pay",
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Setu API error: {response.text}")
