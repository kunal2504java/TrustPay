# Design Document: Setu UPI Payment Integration

## Overview

This design document details the technical implementation of Setu UPI payment gateway integration into TrustPay. The integration enables real UPI payment collection via collect requests, fund holding, and automated releases for escrow transactions. The design follows a webhook-driven architecture where Setu notifies TrustPay of payment events, ensuring reliable payment processing.

## Architecture

### High-Level Flow

```
┌─────────┐         ┌──────────────┐         ┌──────────┐         ┌────────────┐
│  Payer  │────────▶│   TrustPay   │────────▶│   Setu   │────────▶│   Payee    │
│         │         │   Backend    │         │ Gateway  │         │            │
└─────────┘         └──────────────┘         └──────────┘         └────────────┘
     │                      │                      │                      │
     │  1. Create Escrow    │                      │                      │
     │─────────────────────▶│                      │                      │
     │                      │  2. Create Collect   │                      │
     │                      │─────────────────────▶│                      │
     │                      │  3. Return Collect   │                      │
     │  4. Collect Request  │◀─────────────────────│                      │
     │◀─────────────────────│                      │                      │
     │  5. Approve in UPI   │                      │                      │
     │──────────────────────┼─────────────────────▶│                      │
     │                      │  6. Webhook: Success │                      │
     │                      │◀─────────────────────│                      │
     │                      │  7. Update Status    │                      │
     │                      │  (HELD)              │                      │
     │                      │                      │                      │
     │  8. Confirm Delivery │                      │                      │
     │─────────────────────▶│                      │                      │
     │                      │  9. Initiate Payout  │                      │
     │                      │─────────────────────▶│                      │
     │                      │                      │  10. Transfer Funds  │
     │                      │                      │─────────────────────▶│
     │                      │  11. Webhook: Payout │                      │
     │                      │◀─────────────────────│                      │
     │                      │  12. Update Status   │                      │
     │                      │  (RELEASED)          │                      │
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Escrow     │  │   Waiting    │  │   Status     │      │
│  │   Creation   │  │   Room       │  │   Tracking   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Endpoints                           │   │
│  │  • POST /escrows (create)                           │   │
│  │  • GET /escrows/{id} (status)                       │   │
│  │  • POST /escrows/{id}/confirm (release)            │   │
│  │  • POST /webhooks/setu (events)                    │   │
│  │  • POST /escrows/join (join by code)               │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  ┌─────────────────┐  ┌──────────────────┐         │   │
│  │  │ EscrowService   │  │ SetuService      │         │   │
│  │  │ • Create        │  │ • Create Collect │         │   │
│  │  │ • Update Status │  │ • Create Payout  │         │   │
│  │  │ • Confirm       │  │ • Verify Webhook │         │   │
│  │  │ • Join by Code  │  │ • Get Status     │         │   │
│  │  └─────────────────┘  └──────────────────┘         │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL)                   │   │
│  │  • escrows table (with code, name fields)           │   │
│  │  • users table                                       │   │
│  │  • payment_logs table                               │   │
│  │  • confirmations table                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Setu UPI Gateway                           │
│  • UPI Collect API                                           │
│  • Payouts API                                               │
│  • Webhooks                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. SetuService

**Purpose**: Encapsulates all Setu API interactions

**Location**: `backend/app/services/setu_service.py`

**Methods**:

```python
class SetuService:
    def __init__(self):
        """Initialize Setu client with API credentials"""
        
    async def _get_access_token(self) -> str:
        """Get OAuth access token from Setu using client credentials"""
        
    async def create_collect_request(
        self, 
        amount: int,  # Amount in paise
        customer_vpa: str,
        merchant_vpa: str,
        reference_id: str,
        transaction_note: str,
        metadata: dict,
        expire_after: int = 2  # Minutes
    ) -> dict:
        """Create a Setu UPI collect request"""
        
    async def get_collect_status(
        self,
        collect_id: str
    ) -> dict:
        """Get status of a collect request"""
        
    async def create_payout(
        self,
        amount: int,
        payee_vpa: str,
        reference_id: str,
        remarks: str
    ) -> dict:
        """Create a UPI payout to release funds"""
        
    async def create_refund(
        self,
        collect_id: str,
        amount: int = None
    ) -> dict:
        """Create a refund for cancelled escrow"""
        
    async def verify_webhook_signature(
        self,
        body: bytes,
        signature: str
    ) -> bool:
        """Verify webhook signature from Setu"""
```

**Configuration**:
- Base URL: From environment variable `SETU_BASE_URL` (UAT: `https://umap-uat-core.setu.co`, Production: `https://umap.setu.co`)
- Client ID: From environment variable `SETU_CLIENT_ID`
- Client Secret: From environment variable `SETU_CLIENT_SECRET`
- Merchant ID: From environment variable `SETU_MERCHANT_ID`
- Merchant VPA: From environment variable `SETU_MERCHANT_VPA`
- Webhook Secret: From environment variable `SETU_WEBHOOK_SECRET`

### 2. Enhanced EscrowService

**Purpose**: Orchestrates escrow lifecycle with Setu integration

**Location**: `backend/app/services/escrow_service.py`

**New/Modified Methods**:

```python
class EscrowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.setu = SetuService()
        self.blockchain = BlockchainService()
        
    def _generate_escrow_code(self) -> str:
        """Generate unique 6-character alphanumeric code"""
        
    def _generate_escrow_name(self) -> str:
        """Generate friendly name from predefined list"""
        
    async def create_escrow(
        self,
        payer_id: str,
        escrow_data: EscrowCreate
    ) -> tuple[Escrow, dict]:
        """
        Create escrow and generate Setu collect request
        Returns: (escrow_object, setu_collect_data)
        """
        
    async def get_escrow_by_code(
        self,
        escrow_code: str
    ) -> Optional[Escrow]:
        """Get escrow by its 6-character code"""
        
    async def join_escrow_by_code(
        self,
        user_id: str,
        escrow_code: str
    ) -> Escrow:
        """Join existing escrow using code"""
        
    async def handle_payment_success(
        self,
        escrow_id: str,
        collect_id: str
    ) -> Escrow:
        """Update escrow status when payment succeeds"""
        
    async def release_funds(
        self,
        escrow_id: str,
        payee_vpa: str
    ) -> dict:
        """Initiate payout to payee"""
        
    async def handle_payout_success(
        self,
        escrow_id: str,
        payout_id: str
    ) -> Escrow:
        """Update escrow status when payout succeeds"""
        
    async def process_refund(
        self,
        escrow_id: str,
        reason: str
    ) -> dict:
        """Process refund for cancelled escrow"""
```

### 3. Webhook Handler

**Purpose**: Receive and process Setu webhook events

**Location**: `backend/app/api/v1/endpoints/webhooks.py`

**Endpoints**:

```python
@router.post("/webhooks/setu")
async def setu_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Setu webhook events:
    - collect.success
    - collect.failed
    - payout.success
    - payout.failed
    - refund.processed
    """
```

**Event Handlers**:

```python
async def handle_collect_success(payload: dict, db: AsyncSession)
async def handle_collect_failed(payload: dict, db: AsyncSession)
async def handle_payout_success(payload: dict, db: AsyncSession)
async def handle_payout_failed(payload: dict, db: AsyncSession)
async def handle_refund_processed(payload: dict, db: AsyncSession)
```

### 4. Enhanced Escrow API Endpoints

**Location**: `backend/app/api/v1/endpoints/escrows.py`

**Modified Endpoints**:

```python
@router.post("/", response_model=EscrowResponse)
async def create_escrow(
    escrow: EscrowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create escrow and return Setu collect request
    Response includes: escrow_id, escrow_code, escrow_name, collect_id
    """

@router.post("/join")
async def join_escrow(
    escrow_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Join escrow using 6-character code
    """

@router.post("/{escrow_id}/confirm")
async def confirm_escrow(
    escrow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm escrow delivery
    Triggers payout if both parties confirmed
    """

@router.post("/{escrow_id}/cancel")
async def cancel_escrow(
    escrow_id: str,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel escrow and initiate refund
    """
```

### 5. Frontend Payment Integration

**Location**: `frontend/src/components/Dashboard/`

**New Components**:

```javascript
// EscrowWaitingRoom.jsx
// Displays escrow code and waits for partner to join
const EscrowWaitingRoom = ({ escrow, onBothJoined }) => {
  // Display escrow code and name
  // Show copy button for code
  // Poll for partner join status
  // Trigger payment when both joined
}

// PaymentStatus.jsx
// Shows real-time payment status
const PaymentStatus = ({ escrowId }) => {
  // Poll for payment status updates
  // Display status: Pending, Success, Failed
}
```

**Modified Components**:

```javascript
// CreateEscrowFormPage.jsx
// After creating escrow, show waiting room
const handleSubmit = async (data) => {
  const response = await createEscrow(data);
  // response contains: escrow_id, escrow_code, escrow_name
  setShowWaitingRoom(true);
}

// EscrowDetailPage.jsx
// Show payment status and payout information
```

## Data Models

### Enhanced Escrow Model

**Location**: `backend/app/models/escrow.py`

**New Fields**:

```python
class Escrow(Base):
    # ... existing fields ...
    
    # Setu Integration Fields
    setu_collect_id: str = Column(String, nullable=True)
    setu_payment_id: str = Column(String, nullable=True)
    setu_payout_id: str = Column(String, nullable=True)
    setu_refund_id: str = Column(String, nullable=True)
    
    # Escrow Code Matching
    escrow_code: str = Column(String(6), unique=True, nullable=False)
    escrow_name: str = Column(String, nullable=False)
    is_code_active: bool = Column(Boolean, default=True)
    expires_at: datetime = Column(DateTime, nullable=True)
    
    # Payment tracking
    payment_initiated_at: datetime = Column(DateTime, nullable=True)
    payment_completed_at: datetime = Column(DateTime, nullable=True)
    payout_initiated_at: datetime = Column(DateTime, nullable=True)
    payout_completed_at: datetime = Column(DateTime, nullable=True)
    
    # Error tracking
    last_payment_error: str = Column(Text, nullable=True)
    payment_retry_count: int = Column(Integer, default=0)
```

### PaymentLog Model

**Purpose**: Audit trail for all payment operations

**Location**: `backend/app/models/payment_log.py`

```python
class PaymentLog(Base):
    __tablename__ = "payment_logs"
    
    id: UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escrow_id: UUID = Column(UUID(as_uuid=True), ForeignKey("escrows.id"))
    
    # Event details
    event_type: str = Column(String)  # "payment", "payout", "refund"
    event_status: str = Column(String)  # "initiated", "success", "failed"
    
    # Setu references (reusing razorpay_id field for Setu IDs)
    razorpay_id: str = Column(String)  # collect_id, payout_id, or refund_id
    razorpay_order_id: str = Column(String, nullable=True)
    
    # Amounts
    amount: int = Column(Integer)  # Amount in paise
    currency: str = Column(String, default="INR")
    
    # Metadata
    webhook_payload: dict = Column(JSON, nullable=True)
    error_message: str = Column(Text, nullable=True)
    
    # Timestamps
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    escrow = relationship("Escrow", back_populates="payment_logs")
```

### Confirmation Model

**Purpose**: Track confirmations from both parties

**Location**: `backend/app/models/confirmation.py`

```python
class Confirmation(Base):
    __tablename__ = "confirmations"
    
    id: UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escrow_id: UUID = Column(UUID(as_uuid=True), ForeignKey("escrows.id"))
    user_id: UUID = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    role: str = Column(String)  # "payer" or "payee"
    confirmed_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    escrow = relationship("Escrow", back_populates="confirmations")
    user = relationship("User")
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Collect Request Creation

*For any* valid escrow data with amount, customer VPA, and metadata, creating an escrow should result in a Setu collect request being created with matching parameters.
**Validates: Requirements 1.1**

### Property 2: Collect Response Completeness

*For any* successfully created collect request, the response should contain the collect request ID and all required payment details.
**Validates: Requirements 1.2**

### Property 3: Payment Success Status Update

*For any* successful payment webhook, the escrow status should be updated to HELD and the payment completion timestamp should be recorded.
**Validates: Requirements 1.4**

### Property 4: Payment Failure Handling

*For any* failed payment webhook, the escrow status should be updated to FAILED and an error notification should be triggered.
**Validates: Requirements 1.5**

### Property 5: Webhook Signature Verification

*For any* incoming webhook, the signature must be verified before processing, and invalid signatures should be rejected with a security alert.
**Validates: Requirements 2.1, 2.2**

### Property 6: Payment Verification After Webhook

*For any* webhook with valid signature, the collect request ID should be extracted and verified against the Setu API before updating escrow state.
**Validates: Requirements 2.3**

### Property 7: Collect ID Persistence

*For any* successfully verified payment, the Setu collect request ID should be stored in the escrow record.
**Validates: Requirements 2.4**

### Property 8: Payout Trigger on Dual Confirmation

*For any* escrow where both payer and payee have confirmed, a Setu payout should be initiated to the payee VPA.
**Validates: Requirements 3.1**

### Property 9: Payout Status Transition

*For any* initiated payout, the escrow status should transition to RELEASING, and upon success should transition to RELEASED.
**Validates: Requirements 3.2, 3.3**

### Property 10: Payout Retry Logic

*For any* failed payout, the system should retry up to 3 times with exponential backoff before marking as RELEASE_FAILED.
**Validates: Requirements 3.4, 3.5**

### Property 11: Refund Initiation

*For any* cancelled or disputed escrow, a refund should be initiated to the payer VPA with the original payment amount.
**Validates: Requirements 4.1, 4.2**

### Property 12: Refund Status Update

*For any* successfully processed refund, the escrow status should be updated to REFUNDED.
**Validates: Requirements 4.3**

### Property 13: Refund Notification

*For any* initiated refund, a notification should be sent to the payer with refund details and timeline.
**Validates: Requirements 4.4**

### Property 14: API Error Logging

*For any* failed Setu API call, an error log entry should be created with full context including escrow ID and error details.
**Validates: Requirements 5.1**

### Property 15: Error State Persistence

*For any* failed payment operation, the error state should be stored in the database with timestamp and error message.
**Validates: Requirements 5.2**

### Property 16: Critical Error Alerting

*For any* critical payment operation failure, an alert notification should be sent to administrators.
**Validates: Requirements 5.3**

### Property 17: Transaction ID Storage

*For any* payment transaction, all Setu IDs (collect, payout, refund) should be stored in the database for reconciliation.
**Validates: Requirements 6.1**

### Property 18: Reconciliation Data Retrieval

*For any* date range query, the reconciliation API should return all escrows with payment transactions in that range.
**Validates: Requirements 6.2**

### Property 19: Mismatch Detection

*For any* reconciliation run, mismatches between Setu records and escrow records should be identified and flagged.
**Validates: Requirements 6.3, 6.4**

### Property 20: Dashboard Status Display

*For any* escrow, the dashboard should display the correct payment status: "Payment Pending" for initiated, "Payment Received" for successful, or "Payment Failed" for failed.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 21: Receipt Availability

*For any* completed payment, a receipt download option should be available in the dashboard.
**Validates: Requirements 8.4**

### Property 22: Escrow Code Uniqueness

*For any* created escrow, the generated 6-character alphanumeric code should be unique across all escrows in the system.
**Validates: Requirements 9.1**

### Property 23: Friendly Name Assignment

*For any* created escrow, the assigned friendly name should be from the predefined list of escrow names.
**Validates: Requirements 9.2**

### Property 24: Code Validation and Lookup

*For any* entered escrow code, the system should validate the format and return the corresponding escrow details if valid and active.
**Validates: Requirements 9.3**

### Property 25: Payment Activation on Dual Join

*For any* escrow where both parties have joined using the code, the payment collection process should be activated.
**Validates: Requirements 9.4**

### Property 26: Code Expiration

*For any* escrow code older than 7 days, the code should be deactivated and new join attempts should be rejected.
**Validates: Requirements 9.5**

## Error Handling

### Error Categories

1. **Payment Errors**
   - Collect request creation failure
   - Payment capture failure
   - Payment verification failure

2. **Payout Errors**
   - Insufficient balance
   - Invalid VPA
   - Payout processing failure

3. **Webhook Errors**
   - Invalid signature
   - Duplicate webhook
   - Processing failure

4. **Code Matching Errors**
   - Invalid code format
   - Expired code
   - Code already used

### Error Handling Strategy

```python
class PaymentError(Exception):
    """Base exception for payment errors"""
    pass

class CollectRequestError(PaymentError):
    """Raised when Setu collect request creation fails"""
    pass

class PayoutError(PaymentError):
    """Raised when payout fails"""
    pass

class WebhookVerificationError(PaymentError):
    """Raised when webhook signature is invalid"""
    pass

class EscrowCodeError(Exception):
    """Raised when escrow code operations fail"""
    pass

# Error handler decorator
def handle_payment_errors(func):
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except httpx.HTTPStatusError as e:
            # Log error
            logger.error(f"Setu API error: {e}")
            # Update escrow with error
            # Notify admin
            raise PaymentError(f"Payment operation failed: {e}")
        except httpx.TimeoutException as e:
            # Setu timeout - retry
            logger.error(f"Setu timeout: {e}")
            # Implement retry logic
            raise PaymentError("Payment service temporarily unavailable")
    return wrapper
```

### Retry Logic

```python
class RetryConfig:
    MAX_RETRIES = 3
    BACKOFF_FACTOR = 2  # Exponential backoff
    INITIAL_DELAY = 1  # seconds

async def retry_with_backoff(func, *args, **kwargs):
    """Retry function with exponential backoff"""
    for attempt in range(RetryConfig.MAX_RETRIES):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            if attempt == RetryConfig.MAX_RETRIES - 1:
                raise
            delay = RetryConfig.INITIAL_DELAY * (RetryConfig.BACKOFF_FACTOR ** attempt)
            await asyncio.sleep(delay)
```

## Testing Strategy

### Unit Tests

**Location**: `backend/tests/services/test_setu_service.py`

```python
class TestSetuService:
    async def test_get_access_token_success(self):
        """Test successful OAuth token retrieval"""
        
    async def test_create_collect_request_success(self):
        """Test successful collect request creation"""
        
    async def test_create_collect_request_failure(self):
        """Test collect request creation with invalid data"""
        
    async def test_verify_webhook_signature_valid(self):
        """Test webhook signature verification with valid signature"""
        
    async def test_verify_webhook_signature_invalid(self):
        """Test webhook signature verification with invalid signature"""
        
    async def test_create_payout_success(self):
        """Test successful payout creation"""
        
    async def test_create_payout_invalid_vpa(self):
        """Test payout with invalid VPA"""
```

### Property-Based Tests

**Location**: `backend/tests/properties/test_escrow_properties.py`

Property-based tests will be written using the `hypothesis` library for Python to verify the correctness properties defined above. Each property will be tested with randomly generated inputs to ensure the system behaves correctly across all valid scenarios.

### Integration Tests

**Location**: `backend/tests/integration/test_payment_flow.py`

```python
class TestPaymentFlow:
    async def test_complete_escrow_flow(self):
        """Test complete flow: create → collect → confirm → payout"""
        
    async def test_payment_failure_flow(self):
        """Test flow when payment fails"""
        
    async def test_refund_flow(self):
        """Test escrow cancellation and refund"""
        
    async def test_webhook_processing(self):
        """Test webhook event processing"""
        
    async def test_code_matching_flow(self):
        """Test escrow code generation and joining"""
```

### Manual Testing Checklist

1. **Payment Collection**
   - [ ] Create escrow
   - [ ] Receive Setu collect request ID
   - [ ] Approve payment in UPI app
   - [ ] Verify webhook received
   - [ ] Verify escrow status updated to HELD

2. **Code Matching**
   - [ ] Create escrow and get code
   - [ ] Share code with partner
   - [ ] Partner joins using code
   - [ ] Verify both parties see waiting room
   - [ ] Verify payment activates after both join

3. **Fund Release**
   - [ ] Confirm escrow by both parties
   - [ ] Verify payout initiated
   - [ ] Verify payout webhook received
   - [ ] Verify escrow status updated to RELEASED

4. **Refund Processing**
   - [ ] Cancel escrow
   - [ ] Verify refund initiated
   - [ ] Verify refund webhook received
   - [ ] Verify escrow status updated to REFUNDED

5. **Error Scenarios**
   - [ ] Test with invalid VPA
   - [ ] Test with expired code
   - [ ] Test webhook with invalid signature
   - [ ] Test payment timeout

## Security Considerations

### 1. API Key Management

- Store API keys in environment variables
- Never commit keys to version control
- Use different keys for UAT/production
- Rotate keys periodically

### 2. Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoint
- Implement rate limiting
- Log all webhook attempts

### 3. Payment Verification

- Verify webhook signature before updating status
- Cross-check payment amount with escrow amount
- Validate collect ID against Setu API
- Prevent duplicate payment processing

### 4. Code Security

- Generate cryptographically random codes
- Expire codes after 7 days
- Deactivate codes after use
- Validate code format before lookup

### 5. Data Protection

- Encrypt sensitive payment data at rest
- Use HTTPS for all API communications
- Implement proper access controls
- Audit all payment operations

## Configuration

### Environment Variables

```bash
# Setu Configuration
SETU_BASE_URL=https://umap-uat-core.setu.co  # UAT
# SETU_BASE_URL=https://umap.setu.co  # Production
SETU_CLIENT_ID=your_client_id
SETU_CLIENT_SECRET=your_client_secret
SETU_MERCHANT_ID=your_merchant_id
SETU_MERCHANT_VPA=yourmerchant@pineaxis
SETU_WEBHOOK_SECRET=your_webhook_secret

# Application
ENVIRONMENT=development  # or production
FRONTEND_URL=http://localhost:3000
WEBHOOK_URL=https://api.trustpay.in/api/v1/webhooks/setu
```

### Setu Dashboard Configuration

1. **Webhook Setup**
   - URL: `https://api.trustpay.in/api/v1/webhooks/setu`
   - Events to subscribe:
     - `collect.success`
     - `collect.failed`
     - `payout.success`
     - `payout.failed`
     - `refund.processed`

2. **UPI Settings**
   - Configure merchant VPA
   - Set collect request timeout: 15 minutes
   - Enable auto-refund on failure

3. **Payout Settings**
   - Enable UPI payouts
   - Configure payout account
   - Set payout limits

## Performance Considerations

### 1. Webhook Processing

- Process webhooks asynchronously
- Use background tasks for heavy operations
- Implement idempotency to handle duplicate webhooks
- Cache payment status to reduce API calls

### 2. Database Optimization

- Index on `escrow_code`, `setu_collect_id`, `setu_payment_id`
- Use database transactions for status updates
- Implement connection pooling

### 3. API Rate Limiting

- Respect Setu rate limits
- Implement exponential backoff for retries
- Cache OAuth tokens (valid for 1 hour)

### 4. Code Generation

- Pre-generate codes in batches
- Cache unused codes in memory
- Validate uniqueness efficiently

## Deployment Checklist

- [ ] Install httpx Python package
- [ ] Add Setu credentials to environment
- [ ] Run database migrations for new fields
- [ ] Configure webhook URL in Setu dashboard
- [ ] Test webhook delivery
- [ ] Deploy backend with new endpoints
- [ ] Deploy frontend with waiting room component
- [ ] Test complete payment flow in UAT
- [ ] Monitor error logs
- [ ] Set up alerts for payment failures
- [ ] Complete KYC for production access
- [ ] Switch to production API endpoint
- [ ] Test with real payments (small amounts)
- [ ] Go live

## Monitoring and Alerts

### Metrics to Track

1. **Payment Metrics**
   - Collect request success rate
   - Average payment time
   - Payment failure reasons

2. **Payout Metrics**
   - Payout success rate
   - Average payout time
   - Payout failure reasons

3. **Code Matching Metrics**
   - Code generation success rate
   - Average time to match
   - Expired code rate

4. **System Metrics**
   - Webhook delivery success rate
   - API response times
   - Error rates

### Alert Conditions

- Collect request success rate < 95%
- Payout failure
- Webhook signature verification failure
- API error rate > 5%
- Payment stuck in pending > 30 minutes
- Code generation failures
