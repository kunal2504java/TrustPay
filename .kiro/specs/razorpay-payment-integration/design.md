# Design Document: Razorpay Payment Integration

## Overview

This design document details the technical implementation of Razorpay payment gateway integration into TrustPay. The integration enables real UPI payment collection, fund holding, and automated releases for escrow transactions. The design follows a webhook-driven architecture where Razorpay notifies TrustPay of payment events, ensuring reliable payment processing.

## Architecture

### High-Level Flow

```
┌─────────┐         ┌──────────────┐         ┌──────────┐         ┌────────────┐
│  Payer  │────────▶│   TrustPay   │────────▶│ Razorpay │────────▶│   Payee    │
│         │         │   Backend    │         │ Gateway  │         │            │
└─────────┘         └──────────────┘         └──────────┘         └────────────┘
     │                      │                      │                      │
     │  1. Create Escrow    │                      │                      │
     │─────────────────────▶│                      │                      │
     │                      │  2. Create Order     │                      │
     │                      │─────────────────────▶│                      │
     │                      │  3. Return Checkout  │                      │
     │  4. Payment Link     │◀─────────────────────│                      │
     │◀─────────────────────│                      │                      │
     │  5. Complete Payment │                      │                      │
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
│  │   Escrow     │  │   Payment    │  │   Status     │      │
│  │   Creation   │  │   Display    │  │   Tracking   │      │
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
│  │  • POST /webhooks/razorpay (events)                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  ┌─────────────────┐  ┌──────────────────┐         │   │
│  │  │ EscrowService   │  │ RazorpayService  │         │   │
│  │  │ • Create        │  │ • Create Order   │         │   │
│  │  │ • Update Status │  │ • Create Payout  │         │   │
│  │  │ • Confirm       │  │ • Verify Webhook │         │   │
│  │  └─────────────────┘  └──────────────────┘         │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL)                   │   │
│  │  • escrows table                                     │   │
│  │  • users table                                       │   │
│  │  • payment_logs table (new)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Razorpay Gateway                           │
│  • Payment Orders API                                        │
│  • Payouts API                                               │
│  • Webhooks                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. RazorpayService

**Purpose**: Encapsulates all Razorpay API interactions

**Location**: `backend/app/services/razorpay_service.py`

**Methods**:

```python
class RazorpayService:
    def __init__(self):
        """Initialize Razorpay client with API credentials"""
        
    async def create_payment_order(
        self, 
        amount: int,  # Amount in paise
        currency: str,
        receipt: str,
        notes: dict
    ) -> dict:
        """Create a Razorpay order for payment collection"""
        
    async def verify_payment_signature(
        self,
        order_id: str,
        payment_id: str,
        signature: str
    ) -> bool:
        """Verify payment signature for security"""
        
    async def create_payout(
        self,
        account_number: str,
        amount: int,
        currency: str,
        mode: str,  # "UPI"
        purpose: str,
        fund_account: dict,
        reference_id: str
    ) -> dict:
        """Create a payout to release funds"""
        
    async def create_refund(
        self,
        payment_id: str,
        amount: int = None
    ) -> dict:
        """Create a refund for cancelled escrow"""
        
    async def verify_webhook_signature(
        self,
        body: bytes,
        signature: str
    ) -> bool:
        """Verify webhook signature from Razorpay"""
        
    async def get_payment_details(
        self,
        payment_id: str
    ) -> dict:
        """Fetch payment details from Razorpay"""
```

**Configuration**:
- API Key ID: From environment variable `RAZORPAY_KEY_ID`
- API Key Secret: From environment variable `RAZORPAY_KEY_SECRET`
- Webhook Secret: From environment variable `RAZORPAY_WEBHOOK_SECRET`

### 2. Enhanced EscrowService

**Purpose**: Orchestrates escrow lifecycle with Razorpay integration

**Location**: `backend/app/services/escrow_service.py`

**New/Modified Methods**:

```python
class EscrowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.razorpay = RazorpayService()
        self.blockchain = BlockchainService()
        
    async def create_escrow_with_payment(
        self,
        escrow_data: EscrowCreate,
        payer_id: str
    ) -> tuple[Escrow, dict]:
        """
        Create escrow and generate Razorpay payment order
        Returns: (escrow_object, razorpay_order_data)
        """
        
    async def handle_payment_success(
        self,
        escrow_id: str,
        payment_id: str,
        order_id: str
    ) -> Escrow:
        """Update escrow status when payment succeeds"""
        
    async def release_funds(
        self,
        escrow_id: str,
        payee_upi: str
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

**Purpose**: Receive and process Razorpay webhook events

**Location**: `backend/app/api/v1/endpoints/webhooks.py`

**Endpoints**:

```python
@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Razorpay webhook events:
    - payment.captured
    - payment.failed
    - payout.processed
    - payout.failed
    - refund.processed
    """
```

**Event Handlers**:

```python
async def handle_payment_captured(payload: dict, db: AsyncSession)
async def handle_payment_failed(payload: dict, db: AsyncSession)
async def handle_payout_processed(payload: dict, db: AsyncSession)
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
    Create escrow and return Razorpay payment order
    Response includes: escrow_id, razorpay_order_id, amount, checkout_url
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
// PaymentModal.jsx
// Displays Razorpay checkout when escrow is created
const PaymentModal = ({ escrowId, orderId, amount, onSuccess }) => {
  // Initialize Razorpay checkout
  // Handle payment success/failure
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
// After creating escrow, show payment modal
const handleSubmit = async (data) => {
  const response = await createEscrow(data);
  // response contains: escrow_id, razorpay_order_id, amount
  setShowPaymentModal(true);
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
    
    # Razorpay Integration Fields
    razorpay_order_id: str = Column(String, nullable=True)
    razorpay_payment_id: str = Column(String, nullable=True)
    razorpay_payout_id: str = Column(String, nullable=True)
    razorpay_refund_id: str = Column(String, nullable=True)
    
    # Payment tracking
    payment_initiated_at: datetime = Column(DateTime, nullable=True)
    payment_completed_at: datetime = Column(DateTime, nullable=True)
    payout_initiated_at: datetime = Column(DateTime, nullable=True)
    payout_completed_at: datetime = Column(DateTime, nullable=True)
    
    # Error tracking
    last_payment_error: str = Column(Text, nullable=True)
    payment_retry_count: int = Column(Integer, default=0)
```

### New PaymentLog Model

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
    
    # Razorpay references
    razorpay_id: str = Column(String)  # payment_id, payout_id, or refund_id
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

### Enhanced User Model

**Location**: `backend/app/models/user.py`

**New Fields**:

```python
class User(Base):
    # ... existing fields ...
    
    # UPI details for payouts
    upi_id: str = Column(String, nullable=True)
    upi_verified: bool = Column(Boolean, default=False)
    
    # Bank account (alternative to UPI)
    bank_account_number: str = Column(String, nullable=True)
    bank_ifsc: str = Column(String, nullable=True)
    bank_account_name: str = Column(String, nullable=True)
```

## Error Handling

### Error Categories

1. **Payment Errors**
   - Order creation failure
   - Payment capture failure
   - Payment verification failure

2. **Payout Errors**
   - Insufficient balance
   - Invalid UPI ID
   - Payout processing failure

3. **Webhook Errors**
   - Invalid signature
   - Duplicate webhook
   - Processing failure

### Error Handling Strategy

```python
class PaymentError(Exception):
    """Base exception for payment errors"""
    pass

class OrderCreationError(PaymentError):
    """Raised when Razorpay order creation fails"""
    pass

class PayoutError(PaymentError):
    """Raised when payout fails"""
    pass

class WebhookVerificationError(PaymentError):
    """Raised when webhook signature is invalid"""
    pass

# Error handler decorator
def handle_payment_errors(func):
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except razorpay.errors.BadRequestError as e:
            # Log error
            logger.error(f"Razorpay bad request: {e}")
            # Update escrow with error
            # Notify admin
            raise PaymentError(f"Payment operation failed: {e}")
        except razorpay.errors.ServerError as e:
            # Razorpay server error - retry
            logger.error(f"Razorpay server error: {e}")
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

**Location**: `backend/tests/services/test_razorpay_service.py`

```python
class TestRazorpayService:
    async def test_create_payment_order_success(self):
        """Test successful order creation"""
        
    async def test_create_payment_order_failure(self):
        """Test order creation with invalid data"""
        
    async def test_verify_webhook_signature_valid(self):
        """Test webhook signature verification with valid signature"""
        
    async def test_verify_webhook_signature_invalid(self):
        """Test webhook signature verification with invalid signature"""
        
    async def test_create_payout_success(self):
        """Test successful payout creation"""
        
    async def test_create_payout_insufficient_balance(self):
        """Test payout with insufficient balance"""
```

### Integration Tests

**Location**: `backend/tests/integration/test_payment_flow.py`

```python
class TestPaymentFlow:
    async def test_complete_escrow_flow(self):
        """Test complete flow: create → pay → confirm → payout"""
        
    async def test_payment_failure_flow(self):
        """Test flow when payment fails"""
        
    async def test_refund_flow(self):
        """Test escrow cancellation and refund"""
        
    async def test_webhook_processing(self):
        """Test webhook event processing"""
```

### Manual Testing Checklist

1. **Payment Collection**
   - [ ] Create escrow
   - [ ] Receive Razorpay order ID
   - [ ] Complete payment with test UPI
   - [ ] Verify webhook received
   - [ ] Verify escrow status updated to HELD

2. **Fund Release**
   - [ ] Confirm escrow by both parties
   - [ ] Verify payout initiated
   - [ ] Verify payout webhook received
   - [ ] Verify escrow status updated to RELEASED

3. **Refund Processing**
   - [ ] Cancel escrow
   - [ ] Verify refund initiated
   - [ ] Verify refund webhook received
   - [ ] Verify escrow status updated to REFUNDED

4. **Error Scenarios**
   - [ ] Test with invalid UPI ID
   - [ ] Test with insufficient balance
   - [ ] Test webhook with invalid signature
   - [ ] Test payment timeout

## Security Considerations

### 1. API Key Management

- Store API keys in environment variables
- Never commit keys to version control
- Use different keys for test/production
- Rotate keys periodically

### 2. Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoint
- Implement rate limiting
- Log all webhook attempts

### 3. Payment Verification

- Verify payment signature before updating status
- Cross-check payment amount with escrow amount
- Validate payment ID against Razorpay API
- Prevent duplicate payment processing

### 4. Data Protection

- Encrypt sensitive payment data at rest
- Use HTTPS for all API communications
- Implement proper access controls
- Audit all payment operations

## Configuration

### Environment Variables

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxx  # Test key for development
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Production (when ready)
RAZORPAY_LIVE_KEY_ID=rzp_live_xxxxx
RAZORPAY_LIVE_KEY_SECRET=xxxxx
RAZORPAY_LIVE_WEBHOOK_SECRET=xxxxx

# Application
ENVIRONMENT=development  # or production
FRONTEND_URL=http://localhost:3000
WEBHOOK_URL=https://api.trustpay.in/api/v1/webhooks/razorpay
```

### Razorpay Dashboard Configuration

1. **Webhook Setup**
   - URL: `https://api.trustpay.in/api/v1/webhooks/razorpay`
   - Events to subscribe:
     - `payment.captured`
     - `payment.failed`
     - `payout.processed`
     - `payout.failed`
     - `refund.processed`

2. **Payment Settings**
   - Enable UPI
   - Set payment timeout: 15 minutes
   - Enable auto-refund on failure

3. **Payout Settings**
   - Enable UPI payouts
   - Set payout mode: IMPS/UPI
   - Configure payout account

## Performance Considerations

### 1. Webhook Processing

- Process webhooks asynchronously
- Use background tasks for heavy operations
- Implement idempotency to handle duplicate webhooks
- Cache payment status to reduce API calls

### 2. Database Optimization

- Index on `razorpay_order_id`, `razorpay_payment_id`
- Use database transactions for status updates
- Implement connection pooling

### 3. API Rate Limiting

- Respect Razorpay rate limits
- Implement exponential backoff for retries
- Cache frequently accessed data

## Deployment Checklist

- [ ] Install razorpay Python package
- [ ] Add Razorpay credentials to environment
- [ ] Run database migrations for new fields
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Test webhook delivery
- [ ] Deploy backend with new endpoints
- [ ] Deploy frontend with payment integration
- [ ] Test complete payment flow in staging
- [ ] Monitor error logs
- [ ] Set up alerts for payment failures
- [ ] Complete KYC for production access
- [ ] Switch to live API keys
- [ ] Test with real payments (small amounts)
- [ ] Go live

## Monitoring and Alerts

### Metrics to Track

1. **Payment Metrics**
   - Payment success rate
   - Average payment time
   - Payment failure reasons

2. **Payout Metrics**
   - Payout success rate
   - Average payout time
   - Payout failure reasons

3. **System Metrics**
   - Webhook delivery success rate
   - API response times
   - Error rates

### Alert Conditions

- Payment success rate < 95%
- Payout failure
- Webhook signature verification failure
- API error rate > 5%
- Payment stuck in pending > 30 minutes
