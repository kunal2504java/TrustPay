# Implementation Plan: Razorpay Payment Integration

This plan breaks down the Razorpay UPI integration into discrete, actionable coding tasks. Each task builds incrementally on previous work to integrate real payment processing into TrustPay.

---

## Tasks

- [x] 1. Set up Razorpay SDK and configuration



  - Install razorpay Python package in backend requirements
  - Add Razorpay environment variables to config.py (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
  - Update .env.example with Razorpay configuration template
  - Verify configuration loads correctly in different environments
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2. Implement RazorpayService core functionality





  - [ ] 2.1 Create RazorpayService class with client initialization
    - Write `backend/app/services/razorpay_service.py` with Razorpay client setup
    - Implement `__init__` method to initialize client with API credentials from config
    - Add error handling for missing or invalid credentials


    - _Requirements: 7.1, 7.2_

  - [ ] 2.2 Implement payment order creation
    - Write `create_payment_order()` method to create Razorpay orders
    - Accept amount, currency, receipt, and notes parameters


    - Return order details including order_id and checkout URL
    - Add error handling for API failures
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 Implement webhook signature verification


    - Write `verify_webhook_signature()` method using Razorpay utility
    - Accept webhook body and signature header
    - Return boolean indicating signature validity
    - Add logging for verification failures
    - _Requirements: 2.1, 2.2_



  - [ ] 2.4 Implement payout creation
    - Write `create_payout()` method for fund releases
    - Accept account_number, amount, mode (UPI), fund_account details, and reference_id
    - Return payout details including payout_id


    - Add error handling for insufficient balance and invalid UPI
    - _Requirements: 3.1, 3.2_






  - [ ] 2.5 Implement refund processing
    - Write `create_refund()` method for payment refunds
    - Accept payment_id and optional amount for partial refunds
    - Return refund details including refund_id


    - Add error handling for refund failures
    - _Requirements: 4.1, 4.2_

  - [x] 2.6 Implement payment verification


    - Write `get_payment_details()` method to fetch payment info from Razorpay
    - Accept payment_id parameter
    - Return payment status and details


    - Add caching to reduce API calls





    - _Requirements: 2.3, 2.4_

- [ ] 3. Update database models for payment tracking
  - [ ] 3.1 Add Razorpay fields to Escrow model
    - Add columns: razorpay_order_id, razorpay_payment_id, razorpay_payout_id, razorpay_refund_id


    - Add timestamp columns: payment_initiated_at, payment_completed_at, payout_initiated_at, payout_completed_at
    - Add error tracking columns: last_payment_error, payment_retry_count
    - _Requirements: 1.4, 3.3, 5.2_

  - [ ] 3.2 Create PaymentLog model for audit trail
    - Create `backend/app/models/payment_log.py` with PaymentLog model


    - Add fields: id, escrow_id, event_type, event_status, razorpay_id, amount, webhook_payload, error_message, created_at
    - Add relationship to Escrow model
    - _Requirements: 5.1, 5.2, 6.1_

  - [ ] 3.3 Add UPI fields to User model
    - Add columns: upi_id, upi_verified, bank_account_number, bank_ifsc, bank_account_name


    - Update user schema to include new fields
    - _Requirements: 3.1_

  - [ ] 3.4 Create database migration
    - Generate Alembic migration for all model changes
    - Test migration up and down


    - _Requirements: 6.1_

- [ ] 4. Enhance EscrowService with payment integration
  - [ ] 4.1 Update create_escrow to generate payment order
    - Modify `create_escrow()` method to call RazorpayService
    - Create Razorpay order after escrow creation
    - Store razorpay_order_id in escrow record


    - Return both escrow and order details
    - _Requirements: 1.1, 1.2_

  - [ ] 4.2 Implement payment success handler
    - Write `handle_payment_success()` method
    - Update escrow status to HELD
    - Store razorpay_payment_id and payment_completed_at
    - Create PaymentLog entry
    - Trigger blockchain update
    - _Requirements: 1.4, 2.4, 5.1_

  - [ ] 4.3 Implement fund release logic
    - Write `release_funds()` method
    - Verify both parties confirmed
    - Call RazorpayService to create payout
    - Update escrow status to RELEASING
    - Store payout_initiated_at
    - _Requirements: 3.1, 3.2_

  - [ ] 4.4 Implement payout success handler
    - Write `handle_payout_success()` method
    - Update escrow status to RELEASED
    - Store razorpay_payout_id and payout_completed_at
    - Create PaymentLog entry
    - Trigger blockchain update
    - _Requirements: 3.3, 5.1_

  - [ ] 4.5 Implement refund processing
    - Write `process_refund()` method
    - Call RazorpayService to create refund
    - Update escrow status to REFUNDED
    - Store razorpay_refund_id
    - Create PaymentLog entry
    - Send notification to payer
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 4.6 Implement retry logic for failed operations
    - Write `retry_with_backoff()` utility function
    - Apply to payout operations with exponential backoff
    - Update payment_retry_count on each attempt
    - Store error details in last_payment_error
    - Alert admin after max retries exceeded
    - _Requirements: 3.4, 3.5, 5.3_

- [ ] 5. Create webhook endpoint and handlers
  - [ ] 5.1 Create webhook router and main endpoint
    - Create `backend/app/api/v1/endpoints/webhooks.py`
    - Implement POST `/webhooks/razorpay` endpoint
    - Extract webhook body and signature from request
    - Verify signature using RazorpayService
    - Return 401 for invalid signatures
    - Parse webhook payload and route to appropriate handler
    - _Requirements: 2.1, 2.2, 5.4_

  - [ ] 5.2 Implement payment.captured handler
    - Write `handle_payment_captured()` function
    - Extract escrow_id from webhook notes
    - Call EscrowService.handle_payment_success()
    - Create PaymentLog entry with webhook payload
    - Return success response
    - _Requirements: 1.3, 1.4, 5.1_

  - [ ] 5.3 Implement payment.failed handler
    - Write `handle_payment_failed()` function
    - Extract escrow_id and error details
    - Update escrow with error message
    - Create PaymentLog entry
    - Send notification to payer
    - _Requirements: 1.5, 5.1_

  - [ ] 5.4 Implement payout.processed handler
    - Write `handle_payout_processed()` function
    - Extract escrow_id from reference_id
    - Call EscrowService.handle_payout_success()
    - Create PaymentLog entry
    - Send notifications to both parties
    - _Requirements: 3.3, 5.1_

  - [ ] 5.5 Implement payout.failed handler
    - Write `handle_payout_failed()` function
    - Extract escrow_id and error details
    - Trigger retry logic if retries remaining
    - Alert admin if max retries exceeded
    - Create PaymentLog entry
    - _Requirements: 3.4, 3.5, 5.3_

  - [ ] 5.6 Implement refund.processed handler
    - Write `handle_refund_processed()` function
    - Extract escrow_id from webhook
    - Update escrow status to REFUNDED
    - Create PaymentLog entry
    - Send notification to payer
    - _Requirements: 4.3, 5.1_

  - [ ] 5.7 Add webhook endpoint to API router
    - Update `backend/app/api/v1/api.py` to include webhooks router
    - Mount at `/webhooks` prefix
    - _Requirements: 2.1_

- [ ] 6. Update escrow API endpoints
  - [ ] 6.1 Modify create escrow endpoint response
    - Update POST `/escrows` endpoint to return payment order details
    - Include razorpay_order_id, amount, and currency in response
    - Update EscrowResponse schema to include payment fields
    - _Requirements: 1.1, 1.2_

  - [ ] 6.2 Add payment status endpoint
    - Create GET `/escrows/{escrow_id}/payment-status` endpoint
    - Return current payment status and details
    - Include razorpay_payment_id if payment completed
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 6.3 Update confirm endpoint to trigger payout
    - Modify POST `/escrows/{escrow_id}/confirm` endpoint
    - Check if both parties confirmed
    - Call EscrowService.release_funds() if conditions met
    - Return payout status
    - _Requirements: 3.1, 3.2_

  - [ ] 6.4 Add cancel endpoint with refund
    - Create POST `/escrows/{escrow_id}/cancel` endpoint
    - Accept cancellation reason
    - Call EscrowService.process_refund()
    - Return refund status
    - _Requirements: 4.1, 4.2_

- [ ] 7. Implement frontend payment integration
  - [ ] 7.1 Create PaymentModal component
    - Create `frontend/src/components/Dashboard/PaymentModal.jsx`
    - Accept escrowId, orderId, amount, and onSuccess props
    - Load Razorpay checkout script dynamically
    - Initialize Razorpay with order details
    - Handle payment success callback
    - Handle payment failure callback
    - _Requirements: 1.2, 8.1_

  - [ ] 7.2 Create PaymentStatus component
    - Create `frontend/src/components/Dashboard/PaymentStatus.jsx`
    - Accept escrowId prop
    - Poll payment status API every 5 seconds
    - Display status: Pending, Success, Failed
    - Show payment details when completed
    - Provide retry option on failure
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 7.3 Update CreateEscrowFormPage to show payment modal
    - Modify `frontend/src/components/Dashboard/CreateEscrowFormPage.jsx`
    - After successful escrow creation, extract payment order details
    - Show PaymentModal with order information
    - Handle payment success to redirect to escrow detail page
    - Handle payment failure to show error message
    - _Requirements: 1.2, 8.1_

  - [ ] 7.4 Create EscrowDetailPage component
    - Create `frontend/src/pages/EscrowDetailPage.jsx`
    - Display escrow details and current status
    - Show PaymentStatus component for payment tracking
    - Show confirm button when payment is held
    - Show payout status when releasing/released
    - Display payment receipt download option
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ] 7.5 Add Razorpay script to index.html
    - Add Razorpay checkout script tag to `frontend/public/index.html`
    - Ensure script loads before payment modal opens
    - _Requirements: 1.2_

  - [ ] 7.6 Update API client with payment endpoints
    - Add payment-related API calls to `frontend/src/services/api.js`
    - Add getPaymentStatus(), cancelEscrow() methods
    - Handle payment-specific error responses
    - _Requirements: 8.2_

- [ ] 8. Add user UPI management
  - [ ] 8.1 Create UPI settings page
    - Create `frontend/src/pages/UpiSettingsPage.jsx`
    - Form to add/update UPI ID
    - Display current UPI ID if set
    - Validate UPI ID format
    - _Requirements: 3.1_

  - [ ] 8.2 Add UPI endpoints to user API
    - Create PUT `/users/me/upi` endpoint to update UPI ID
    - Create GET `/users/me/upi` endpoint to fetch UPI details
    - Validate UPI ID format on backend
    - _Requirements: 3.1_

  - [ ] 8.3 Update user profile to include UPI
    - Modify user profile page to show UPI ID
    - Add link to UPI settings
    - Show verification status
    - _Requirements: 3.1_

- [ ] 9. Implement error handling and logging
  - [ ] 9.1 Create payment error classes
    - Create `backend/app/core/exceptions.py` with payment-specific exceptions
    - Define PaymentError, OrderCreationError, PayoutError, WebhookVerificationError
    - _Requirements: 5.1, 5.2_

  - [ ] 9.2 Add error handler decorator
    - Write `handle_payment_errors` decorator
    - Catch Razorpay API errors and convert to custom exceptions
    - Log errors with full context
    - Update escrow with error details
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 9.3 Implement comprehensive logging
    - Add structured logging for all payment operations
    - Log payment order creation, webhook events, payout initiation
    - Include escrow_id, user_id, amounts in log context
    - Set up log rotation
    - _Requirements: 5.1_

  - [ ] 9.4 Add admin alert notifications
    - Create notification service for critical errors
    - Send alerts for payment failures, payout failures, webhook issues
    - Include error details and escrow information
    - _Requirements: 5.3_

- [ ] 10. Create reconciliation endpoint
  - [ ] 10.1 Implement reconciliation API
    - Create GET `/admin/reconciliation` endpoint
    - Accept date range parameters
    - Fetch all escrows with payments in date range
    - Compare with Razorpay transaction records
    - Identify mismatches
    - Return reconciliation report
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ] 10.2 Create reconciliation dashboard page
    - Create `frontend/src/pages/admin/ReconciliationPage.jsx`
    - Date range selector
    - Display reconciliation report
    - Highlight mismatches
    - Export to CSV functionality
    - _Requirements: 6.2, 6.3_

- [ ]* 11. Write integration tests
  - [ ]* 11.1 Test complete payment flow
    - Write test for create escrow → payment → held status
    - Mock Razorpay API responses
    - Verify database updates
    - Verify blockchain integration called
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 11.2 Test payout flow
    - Write test for confirm → payout → released status
    - Mock Razorpay payout API
    - Verify status transitions
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 11.3 Test refund flow
    - Write test for cancel → refund → refunded status
    - Mock Razorpay refund API
    - Verify notifications sent
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 11.4 Test webhook processing
    - Write tests for all webhook event types
    - Test signature verification
    - Test duplicate webhook handling
    - Test invalid webhook rejection
    - _Requirements: 2.1, 2.2, 5.4_

  - [ ]* 11.5 Test error scenarios
    - Test payment failure handling
    - Test payout retry logic
    - Test insufficient balance scenario
    - Test invalid UPI ID handling
    - _Requirements: 3.4, 3.5, 5.2, 5.3_

- [ ] 12. Update documentation and deployment
  - [ ] 12.1 Update API documentation
    - Document all new endpoints in OpenAPI/Swagger
    - Include request/response examples
    - Document webhook payload formats
    - _Requirements: All_

  - [ ] 12.2 Create deployment guide
    - Document Razorpay dashboard configuration steps
    - List required environment variables
    - Provide webhook setup instructions
    - Include testing checklist
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 12.3 Update README with payment setup
    - Add Razorpay setup section to main README
    - Link to detailed integration guide
    - Include troubleshooting tips
    - _Requirements: 7.1, 7.2_

---

## Implementation Notes

- Tasks should be executed in order as they build on each other
- Each task should be tested before moving to the next
- Use Razorpay test mode credentials during development
- Switch to live credentials only after thorough testing
- Monitor logs closely during initial deployment
- Set up alerts before going live with real payments
