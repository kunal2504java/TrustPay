from web3 import Web3
from eth_account import Account
from typing import Dict, Any, Optional
from app.core.config import settings

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
        
        # Only initialize account if we have a valid private key
        if settings.PRIVATE_KEY and settings.PRIVATE_KEY.startswith('0x') and len(settings.PRIVATE_KEY) > 10:
            try:
                self.account = Account.from_key(settings.PRIVATE_KEY)
            except Exception as e:
                print(f"Warning: Invalid private key, blockchain features disabled: {e}")
                self.account = None
        else:
            self.account = None
        
        self.contract_address = settings.CONTRACT_ADDRESS
        
        # Minimal contract ABI for escrow functions
        self.contract_abi = [
            {
                "inputs": [
                    {"name": "escrowId", "type": "string"},
                    {"name": "metadataHash", "type": "bytes32"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "createEscrow",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "escrowId", "type": "string"}],
                "name": "markHeld",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "escrowId", "type": "string"}],
                "name": "requestRelease",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
        
        # Only initialize contract if we have a valid address
        if (self.contract_address and 
            self.contract_address.startswith('0x') and 
            len(self.contract_address) == 42 and 
            self.w3.is_connected()):
            try:
                self.contract = self.w3.eth.contract(
                    address=self.contract_address,
                    abi=self.contract_abi
                )
            except Exception as e:
                print(f"Warning: Invalid contract address, blockchain features disabled: {e}")
                self.contract = None
        else:
            self.contract = None
    
    async def create_escrow_on_chain(self, escrow_id: str, metadata_hash: str, amount: int) -> Optional[str]:
        """Create escrow record on blockchain"""
        
        if not self.contract or not self.account:
            print("Blockchain not configured, skipping on-chain creation")
            return None
        
        try:
            # Build transaction
            function = self.contract.functions.createEscrow(
                escrow_id,
                metadata_hash,
                amount
            )
            
            # Get gas estimate
            gas_estimate = function.estimate_gas({'from': self.account.address})
            
            # Build transaction
            transaction = function.build_transaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Blockchain error: {str(e)}")
            return None
    
    async def mark_escrow_held(self, escrow_id: str) -> Optional[str]:
        """Mark escrow as held on blockchain"""
        
        if not self.contract or not self.account:
            return None
        
        try:
            function = self.contract.functions.markHeld(escrow_id)
            
            gas_estimate = function.estimate_gas({'from': self.account.address})
            
            transaction = function.build_transaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Blockchain error: {str(e)}")
            return None
    
    async def release_escrow(self, escrow_id: str) -> Optional[str]:
        """Release escrow on blockchain"""
        
        if not self.contract or not self.account:
            return None
        
        try:
            function = self.contract.functions.requestRelease(escrow_id)
            
            gas_estimate = function.estimate_gas({'from': self.account.address})
            
            transaction = function.build_transaction({
                'from': self.account.address,
                'gas': gas_estimate,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Blockchain error: {str(e)}")
            return None
