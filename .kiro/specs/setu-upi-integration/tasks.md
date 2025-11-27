# Implementation Plan: Setu UPI Payment Integration

This plan breaks down the Setu UPI integration into discrete, actionable coding tasks. Each task builds incrementally on previous work to integrate real UPI payment processing into TrustPay.

---

## Tasks

- [x] 1. Set up Setu SDK and configuration
  - Install httpx Python package in backend requirements
  - Add Setu environment variables to config.py (SETU_BASE_URL, SETU_CLIENT_ID, SETU_CLIENT_SECRET, SETU_MERCHANT_ID, SETU_MERCHANT_VPA, SETU_WEBHOOK_SECRET)
  - Update .env.example with Setu configuration template
  - Verify configuration loads correctly in different environments
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2. Implement SetuService core functionality
  - [x] 2.1 Create SetuService class with OAuth authentication
    - Write `backend/app/services/setu_service.py` with Setu client setup
    - Implement `_get_access_token()` method for OAuth token retrieval
    - Add token caching to avoid repeated auth calls
    - Add error handling for authentication failures
    - _Requirements: 7.1, 7.2_

  - [x] 2.2 Implement UPI collect request creation
    - Write `create_collect_request()` method to create Setu collect requests
    - Accept amount, customer_vpa, merchant_vpa, reference_id, transaction_note, metadata, expire_after parameters
    - Return collect request details including collect_id
    - Add error handling for API failures
    - _Requirements: 1.1, 1.2_

  - [ ] 2.3 Implement webhook signature verification
    - Write `verify_webhook_signature()` method using Setu signature verification
    - Accept webhook body and signature header
    - Return boolean indicating signature validity
    - Add logging for verification failures
    - _Requirements: 2.1, 2.2_

  - [x] 2.4 Implement collect status retrieval
    - Write `get_collect_status()` method to fetch collect request status
    - Accept collect_id parameter
    - Return payment status and details
    - Add caching to reduce API calls
    - _Requirements: 2.3, 2.4_

  - [ ] 2.5 Implement payout creation
    - Write `create_payout()` method for fund releases
    - Accept amount, payee_vpa, reference_id, and remarks parameters
    - Return payout details including payout_id
    - Add error handling for insufficient balance and invalid VPA
    - _Requirements: 3.1, 3.2_

  - [ ] 2.6 Implement refund processing
    - Write `create_refund()` method for payment refunds
    - Accept collect_id and optional amount for partial refunds
    - Return refund details including refund_id
    - Add error handling for refund failures
    - _Requirements: 4.1, 4.2_

- [x] 3. Update database models for payment tracking
  - [x] 3.1 Add Setu fields to Escrow model
    - Add columns: setu_collect_id, setu_payment_id, setu_payout_id, setu_refund_id
    - Add escrow code fields: escrow_code (6 chars, unique), escrow_name, is_code_active, expires_at
    - Add timestamp columns: payment_initiated_at, payment_completed_at, payout_initiated_at, payout_completed_at
    - Add error tracking columns: last_payment_error, payment_retry_count
    - _Requirements: 1.4, 3.3, 5.2, 9.1, 9.2, 9.5_

  - [x] 3.2 Ensure PaymentLog model exists for audit trail
    - Verify `backend/app/models/payment_log.py` exists with PaymentLog model
    - Ensure fields: id, escrow_id, event_type, event_status, razorpay_id (reused for Setu IDs), amount, webhook_payload, error_message, created_at
    - Verify relationship to Escrow model
    - _Requirements: 5.1, 5.2, 6.1_

  - [x] 3.3 Ensure Confirmation model exists
    - Verify `backend/app/models/confirmation.py` exists with Confirmation model
    - Ensure fields: id, escrow_id, user_id, role, confirmed_at
    - Verify relationship to Escrow and User models
    - _Requirements: 3.1_

  - [x] 3.4 Create database migration
    - Generate Alembic migration for all model changes
    - Test migration up and down
    - _Requirements: 6.1_

- [x] 4. Enhance EscrowService with Setu integration
  - [x] 4.1 Implement escrow code generation
    - Write `_generate_escrow_code()` method to create 6-character alphanumeric codes
    - Write `_get_unique_escrow_code()` method to ensure uniqueness
    - Write `_generate_escrow_name()` method to select from predefined list
    - _Requirements: 9.1, 9.2_

  - [x] 4.2 Update create_escrow to generate collect request
    - Modify `create_escrow()` method to call SetuService
    - Generate escrow code and name
    - Create Setu collect request after escrow creation
    - Store setu_collect_id in escrow record
    - Return both escrow and collect request details
    - _Requirements: 1.1, 1.2, 9.1, 9.2_

  - [x] 4.3 Implement escrow code lookup
    - Write `get_escrow_by_code()` method to find escrow by code
    - Write `join_escrow_by_code()` method to join existing escrow
    - Validate code format, expiration, and status
    - Prevent self-joining
    - _Requirements: 9.3, 9.4, 9.5_

  - [x] 4.4 Implement payment success handler
    - Write `handle_payment_success()` method
    - Update escrow status to HELD
    - Store setu_payment_id and payment_completed_at
    - Create PaymentLog entry
    - Trigger blockchain update
    - _Requirements: 1.4, 2.4, 5.1_

  - [ ] 4.5 Implement fund release logic
    - Write `release_funds()` method
    - Verify both parties confirmed
    - Call SetuService to create payout
    - Update escrow status to RELEASING
    - Store payout_initiated_at
    - _Requirements: 3.1, 3.2_

  - [ ] 4.6 Implement payout success handler
    - Write `handle_payout_success()` method
    - Update escrow status to RELEASED
    - Store setu_payout_id and payout_completed_at
    - Create PaymentLog entry
    - Trigger blockchain update
    - _Requirements: 3.3, 5.1_

  - [ ] 4.7 Implement refund processing
    - Write `process_refund()` method
    - Call SetuService to create refund
    - Update escrow status to REFUNDED
    - Store setu_refund_id
    - Create PaymentLog entry
    - Send notification to payer
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 4.8 Implement retry logic for failed operations
    - Write `retry_with_backoff()` utility function
    - Apply to payout operations with exponential backoff
    - Update payment_retry_count on each attempt
    - Store error details in last_payment_error
    - Alert admin after max retries exceeded
    - _Requirements: 3.4, 3.5, 5.3_

- [ ] 5. Create webhook endpoint and handlers
  - [x] 5.1 Create webhook router and main endpoint
    - Create `backend/app/api/v1/endpoints/webhooks.py` (or update existing)
    - Implement POST `/webhooks/setu` endpoint
    - Extract webhook body and signature from request
    - Verify signature using SetuService
    - Return 401 for invalid signatures
    - Parse webhook payload and route to appropriate handler
    - _Requirements: 2.1, 2.2, 5.4_

  - [x] 5.2 Implement collect.success handler
    - Write `handle_collect_success()` function
    - Extract escrow_id from webhook metadata
    - Call EscrowService.handle_payment_success()
    - Create PaymentLog entry with webhook payload
    - Return success response
    - _Requirements: 1.3, 1.4, 5.1_

  - [ ] 5.3 Implement collect.failed handler
    - Write `handle_collect_failed()` function
    - Extract escrow_id and error details
    - Update escrow with error message
    - Create PaymentLog entry
    - Send notification to payer
    - _Requirements: 1.5, 5.1_

  - [ ] 5.4 Implement payout.success handler
    - Write `handle_payout_success()` function
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
    - Update POST `/escrows` endpoint to return collect request details
    - Include escrow_code, escrow_name, setu_collect_id in response
    - Update EscrowResponse schema to include new fields
    - _Requirements: 1.1, 1.2, 9.1, 9.2_

  - [ ] 6.2 Add join escrow endpoint
    - Create POST `/escrows/join` endpoint
    - Accept escrow_code parameter
    - Call EscrowService.join_escrow_by_code()
    - Return escrow details if successful
    - _Requirements: 9.3, 9.4_

  - [ ] 6.3 Add payment status endpoint
    - Create GET `/escrows/{escrow_id}/payment-status` endpoint
    - Return current payment status and details
    - Include setu_payment_id if payment completed
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 6.4 Update confirm endpoint to trigger payout
    - Modify POST `/escrows/{escrow_id}/confirm` endpoint
    - Check if both parties confirmed
    - Call EscrowService.release_funds() if conditions met
    - Return payout status
    - _Requirements: 3.1, 3.2_

  - [ ] 6.5 Add cancel endpoint with refund
    - Create POST `/escrows/{escrow_id}/cancel` endpoint
    - Accept cancellation reason
    - Call EscrowService.process_refund()
    - Return refund status
    - _Requirements: 4.1, 4.2_

- [x] 7. Implement frontend waiting room and code matching
  - [x] 7.1 Create EscrowWaitingRoom component
    - Create `frontend/src/components/Dashboard/EscrowWaitingRoom.jsx`
    - Display escrow code and friendly name
    - Add copy-to-clipboard functionality for code
    - Poll for partner join status
    - Show "Waiting for partner" state
    - Trigger payment flow when both joined
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 7.2 Create JoinEscrowModal component
    - Create `frontend/src/components/Dashboard/JoinEscrowModal.jsx`
    - Input field for escrow code
    - Validate code format (6 alphanumeric characters)
    - Call join API endpoint
    - Display escrow details after successful join
    - Handle error states (invalid code, expired, etc.)
    - _Requirements: 9.3, 9.5_

  - [x] 7.3 Update CreateEscrowFormPage to show waiting room
    - Modify `frontend/src/components/Dashboard/CreateEscrowFormPage.jsx`
    - After successful escrow creation, extract code and name
    - Show EscrowWaitingRoom component
    - Handle payment activation after both parties join
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 7.4 Add join button to dashboard
    - Update `frontend/src/components/Dashboard/DashboardListPage.jsx`
    - Add "Join Escrow" button
    - Open JoinEscrowModal on click
    - Refresh escrow list after successful join
    - _Requirements: 9.3_

- [ ] 8. Implement frontend payment status tracking
  - [ ] 8.1 Create PaymentStatus component
    - Create `frontend/src/components/Dashboard/PaymentStatus.jsx`
    - Accept escrowId prop
    - Poll payment status API every 5 seconds
    - Display status: Pending, Success, Failed
    - Show payment details when completed
    - Provide retry option on failure
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 8.2 Update EscrowDetailPage component
    - Update `frontend/src/pages/EscrowDetailPage.jsx`
    - Display escrow details and current status
    - Show PaymentStatus component for payment tracking
    - Show confirm button when payment is held
    - Show payout status when releasing/released
    - Display payment receipt download option
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ] 8.3 Update API client with payment endpoints
    - Add payment-related API calls to `frontend/src/services/api.js`
    - Add getPaymentStatus(), joinEscrow(), cancelEscrow() methods
    - Handle payment-specific error responses
    - _Requirements: 8.2, 9.3_

- [ ] 9. Implement error handling and logging
  - [ ] 9.1 Create payment error classes
    - Create `backend/app/core/exceptions.py` with payment-specific exceptions
    - Define PaymentError, CollectRequestError, PayoutError, WebhookVerificationError, EscrowCodeError
    - _Requirements: 5.1, 5.2_

  - [ ] 9.2 Add error handler decorator
    - Write `handle_payment_errors` decorator
    - Catch Setu API errors and convert to custom exceptions
    - Log errors with full context
    - Update escrow with error details
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 9.3 Implement comprehensive logging
    - Add structured logging for all payment operations
    - Log collect request creation, webhook events, payout initiation
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
    - Compare with Setu transaction records
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

- [ ]* 11. Write property-based tests
  - [ ]* 11.1 Write property test for collect request creation
    - **Property 1: Collect Request Creation**
    - **Validates: Requirements 1.1**
    - Generate random escrow data
    - Verify collect request created with matching parameters
    - Use hypothesis library for property testing

  - [ ]* 11.2 Write property test for payment success handling
    - **Property 3: Payment Success Status Update**
    - **Validates: Requirements 1.4**
    - Generate random payment webhooks
    - Verify status updates to HELD

  - [ ]* 11.3 Write property test for webhook signature verification
    - **Property 5: Webhook Signature Verification**
    - **Validates: Requirements 2.1, 2.2**
    - Generate random webhooks with valid/invalid signatures
    - Verify rejection of invalid signatures

  - [ ]* 11.4 Write property test for payout trigger
    - **Property 8: Payout Trigger on Dual Confirmation**
    - **Validates: Requirements 3.1**
    - Generate random escrows with confirmations
    - Verify payout initiated when both confirmed

  - [ ]* 11.5 Write property test for escrow code uniqueness
    - **Property 22: Escrow Code Uniqueness**
    - **Validates: Requirements 9.1**
    - Generate multiple escrows
    - Verify all codes are unique

  - [ ]* 11.6 Write property test for code expiration
    - **Property 26: Code Expiration**
    - **Validates: Requirements 9.5**
    - Generate escrows with various ages
    - Verify codes older than 7 days are deactivated

- [ ]* 12. Write integration tests
  - [ ]* 12.1 Test complete payment flow
    - Write test for create escrow → collect → confirm → payout
    - Mock Setu API responses
    - Verify database updates
    - Verify blockchain integration called
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 12.2 Test code matching flow
    - Write test for create → generate code → join → activate payment
    - Verify both parties can see escrow
    - Verify payment activates after join
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 12.3 Test payout flow
    - Write test for confirm → payout → released status
    - Mock Setu payout API
    - Verify status transitions
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 12.4 Test refund flow
    - Write test for cancel → refund → refunded status
    - Mock Setu refund API
    - Verify notifications sent
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 12.5 Test webhook processing
    - Write tests for all webhook event types
    - Test signature verification
    - Test duplicate webhook handling
    - Test invalid webhook rejection
    - _Requirements: 2.1, 2.2, 5.4_

  - [ ]* 12.6 Test error scenarios
    - Test payment failure handling
    - Test payout retry logic
    - Test invalid VPA handling
    - Test expired code handling
    - _Requirements: 3.4, 3.5, 5.2, 5.3, 9.5_

- [ ] 13. Update documentation and deployment
  - [ ] 13.1 Update API documentation
    - Document all new endpoints in OpenAPI/Swagger
    - Include request/response examples
    - Document webhook payload formats
    - _Requirements: All_

  - [ ] 13.2 Create deployment guide
    - Document Setu dashboard configuration steps
    - List required environment variables
    - Provide webhook setup instructions
    - Include testing checklist
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 13.3 Update README with Setu setup
    - Add Setu setup section to main README
    - Link to detailed integration guide
    - Include troubleshooting tips
    - _Requirements: 7.1, 7.2_

---

## Implementation Notes

- Tasks should be executed in order as they build on each other
- Each task should be tested before moving to the next
- Use Setu UAT credentials during development
- Switch to production endpoint only after thorough testing
- Monitor logs closely during initial deployment
- Set up alerts before going live with real payments
- Test escrow code matching thoroughly before deployment
