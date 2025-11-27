# Requirements Document: Setu UPI Payment Integration

## Introduction

This document outlines the requirements for integrating Setu UPI payment gateway into TrustPay to enable real UPI payment collection and fund releases for escrow transactions. The integration replaces the Razorpay payment system with Setu's UPI collect and payout APIs.

## Glossary

- **TrustPay System**: The escrow platform backend and frontend application
- **Setu Gateway**: Third-party UPI payment processing service
- **Payer**: User who initiates and funds an escrow transaction
- **Payee**: User who receives funds after escrow conditions are met
- **Escrow Transaction**: A payment held in trust until conditions are satisfied
- **UPI Collect Request**: Setu's representation of a payment request sent to payer's UPI app
- **Merchant VPA**: Virtual Payment Address for receiving payments
- **Customer VPA**: Payer's UPI ID for initiating collect requests
- **Webhook**: HTTP callback from Setu to notify payment status changes

---

## Requirements

### Requirement 1: UPI Collect Payment Collection

**User Story**: As a Payer, I want to fund an escrow transaction using UPI collect through Setu, so that my payment is securely held until conditions are met.

#### Acceptance Criteria

1. WHEN the Payer creates an escrow transaction, THE TrustPay System SHALL create a Setu UPI collect request with the escrow amount, customer VPA, and metadata.

2. WHEN the Setu collect request is created successfully, THE TrustPay System SHALL return the collect request ID and payment details to the Payer.

3. WHEN the Payer approves the collect request in their UPI app, THE TrustPay System SHALL receive a webhook notification with payment status.

4. WHEN the payment webhook indicates success, THE TrustPay System SHALL update the Escrow Transaction status to HELD.

5. IF the payment webhook indicates failure, THEN THE TrustPay System SHALL update the Escrow Transaction status to FAILED and notify the Payer.

---

### Requirement 2: Payment Verification

**User Story**: As the TrustPay System, I want to verify all payment notifications from Setu, so that only legitimate payments update escrow status.

#### Acceptance Criteria

1. WHEN a webhook is received from Setu, THE TrustPay System SHALL verify the webhook signature using the Setu webhook secret.

2. IF the webhook signature is invalid, THEN THE TrustPay System SHALL reject the webhook and log a security alert.

3. WHEN the webhook signature is valid, THE TrustPay System SHALL extract the collect request ID and verify it against the Setu API.

4. WHEN payment verification succeeds, THE TrustPay System SHALL update the Escrow Transaction with the Setu collect request ID.

---

### Requirement 3: Fund Release via UPI Payout

**User Story**: As a Payee, I want to receive funds automatically when escrow conditions are met, so that I get paid promptly for delivered goods or services.

#### Acceptance Criteria

1. WHEN both Payer and Payee confirm the Escrow Transaction, THE TrustPay System SHALL initiate a Setu UPI payout to the Payee VPA.

2. WHEN the Setu payout is initiated, THE TrustPay System SHALL update the Escrow Transaction status to RELEASING.

3. WHEN the Setu payout succeeds, THE TrustPay System SHALL update the Escrow Transaction status to RELEASED and notify both parties.

4. IF the Setu payout fails, THEN THE TrustPay System SHALL retry up to three times with exponential backoff.

5. IF all payout retries fail, THEN THE TrustPay System SHALL update the Escrow Transaction status to RELEASE_FAILED and alert administrators.

---

### Requirement 4: Refund Processing

**User Story**: As a Payer, I want to receive a refund if the escrow is cancelled or disputed in my favor, so that my money is returned safely.

#### Acceptance Criteria

1. WHEN an Escrow Transaction is cancelled by mutual agreement, THE TrustPay System SHALL initiate a Setu UPI refund to the Payer VPA.

2. WHEN a dispute is resolved in favor of the Payer, THE TrustPay System SHALL initiate a full refund through Setu.

3. WHEN the Setu refund is processed successfully, THE TrustPay System SHALL update the Escrow Transaction status to REFUNDED.

4. WHEN a refund is initiated, THE TrustPay System SHALL notify the Payer via email with expected refund timeline.

---

### Requirement 5: Error Handling

**User Story**: As a TrustPay administrator, I want comprehensive error handling for payment operations, so that issues can be identified and resolved quickly.

#### Acceptance Criteria

1. WHEN any Setu API call fails, THE TrustPay System SHALL log the error with full context including escrow ID and error details.

2. WHEN a payment operation fails, THE TrustPay System SHALL store the error state in the database for audit purposes.

3. IF a critical payment operation fails, THEN THE TrustPay System SHALL send an alert notification to administrators.

4. WHEN a webhook delivery fails, THE TrustPay System SHALL implement retry logic with exponential backoff up to 24 hours.

---

### Requirement 6: Transaction Reconciliation

**User Story**: As a TrustPay administrator, I want to reconcile Setu transactions with escrow records, so that all payments are accurately tracked.

#### Acceptance Criteria

1. THE TrustPay System SHALL store all Setu collect request IDs, reference IDs, and payout IDs in the database.

2. THE TrustPay System SHALL provide an API endpoint to fetch reconciliation data for a given date range.

3. WHEN reconciliation is performed, THE TrustPay System SHALL identify any mismatches between Setu records and escrow records.

4. WHEN a mismatch is detected, THE TrustPay System SHALL create an alert for manual review.

---

### Requirement 7: Configuration Management

**User Story**: As a developer, I want to easily configure Setu credentials for different environments, so that I can test in UAT and deploy to production seamlessly.

#### Acceptance Criteria

1. THE TrustPay System SHALL load Setu API credentials from environment variables.

2. THE TrustPay System SHALL support separate configurations for UAT and production environments.

3. WHEN in development mode, THE TrustPay System SHALL use Setu UAT API endpoint.

4. WHEN in production mode, THE TrustPay System SHALL use Setu production API endpoint.

---

### Requirement 8: Payment Status Tracking

**User Story**: As a user, I want to see real-time payment status updates in the dashboard, so that I know when my payment is processed.

#### Acceptance Criteria

1. WHEN a collect request is initiated, THE TrustPay System SHALL display status as "Payment Pending" in the dashboard.

2. WHEN payment is successful, THE TrustPay System SHALL update the dashboard to show "Payment Received" within 5 seconds.

3. WHEN payment fails, THE TrustPay System SHALL display "Payment Failed" with retry option.

4. THE TrustPay System SHALL provide a payment receipt download option for completed payments.

---

### Requirement 9: Escrow Code Matching

**User Story**: As a user, I want to share a simple code with my transaction partner, so that we can easily match and link our escrow transaction.

#### Acceptance Criteria

1. WHEN an escrow is created, THE TrustPay System SHALL generate a unique 6-character alphanumeric code.

2. WHEN an escrow is created, THE TrustPay System SHALL assign a friendly name from a predefined list.

3. WHEN a user enters an escrow code, THE TrustPay System SHALL validate the code and display the escrow details.

4. WHEN both parties have joined using the code, THE TrustPay System SHALL activate the payment collection process.

5. WHEN an escrow code expires after 7 days, THE TrustPay System SHALL deactivate the code and prevent new joins.
