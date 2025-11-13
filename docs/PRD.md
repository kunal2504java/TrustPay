TrustPay - Product Requirements Document (PRD)
 1. Document Purpose
 This PRD describes the TrustPay product: a UPI-based escrow platform that leverages blockchain for
 tamper-proof proof-of-transaction.  Scope: Deliver a market-ready MVP that allows users to create
 escrowed UPI payments, release funds on confirmation or automated triggers, and provide immutable
 proof on-chain. Audience: Founders, Engineers, Product Managers, Designers, Legal, Potential
 Partners and Investors.
 2. Problem Statement
 UPI payments in India are instant and irreversible. There is no built-in buyer protection for peer
to-peer or P2B flows. Consumers and merchants face fraud risks, chargebacks, and disputes. Small
 businesses and freelancers lack a simple, compliant escrow flow optimized for Indian rails.
 3. Objectives and Success Metrics
 Primary Objectives: - Reduce fraud-related disputed transactions for users adopting TrustPay. 
Provide an easy-to-integrate escrow API for marketplaces and platforms. - Achieve a seamless UX that
 requires no crypto knowledge from end users.  Success Metrics (12 months): - Transaction volume:
 100,000 escrow transactions processed. - GMV (gross merchandise value) through platform: Rs. 10
 crore/month. - Conversion: 20% of initiated escrow flows complete successfully. - Dispute rate: <1%
 of transactions. - NPS: >40 among early adopters. - Revenue: Rs. 5 lakh/month from fees by month 12.
 4. Target Users and Personas
 1) Freelancer Priya: Age 25-35, tech freelancer. Needs payment assurance before delivering work. 2)
 Small Merchant Ramesh: Runs an online D2C store; wants to accept pre-orders but avoid fraud. 3)
 Platform Owner Ankit: Marketplace owner who wants to offer escrow-backed payments to build trust. 4)
 NGO Finance Lead Sita: Needs verifiable receipts for donor transparency.  Primary behaviors: Use UPI
 for payments, mobile-first, low tolerance for extra steps.
 5. High Level Product Overview
 TrustPay provides:  - User-initiated escrow payments using UPI collect to TrustPay virtual accounts.- On-chain immutable recording of transaction proofs (hashes, metadata pointers). - Smart-contract
 driven release logic (release, refund, timeout, dispute). - Backend orchestration to call Setu APIs
 for collect/pay and virtual account management. - Dashboard for tracking, dispute resolution,
 analytics, and accounting. - Developer API for platform integration.
 6. Key Features (MVP and Roadmap)
 MVP (v0.1 - core): - UPI Collect creation and status tracking via Setu. - Create per-transaction
 escrow virtual account or reference. - Record transaction metadata hash on Polygon (on-chain proof).- Release funds via UPI Pay after dual confirmation or webhook trigger. - Refund flow on timeout or
 mutual agreement. - Simple user dashboard (create payment, view status, confirm release).  v0.2: 
Webhook integrations for 3rd-party fulfillment platforms (logistics, file upload). - Auto-release
 timeouts using Chainlink keepers or internal scheduler. - Dispute initiation UI and admin dispute
 resolution panel.  v0.3: - B2B API and SDK for marketplaces. - Advanced analytics and reconciliation
 exports. - Premium insured escrow tier via insurance partner.  v1.0: - Merchant plugins (Shopify,
WooCommerce) and mobile SDKs. - KYC & onboarding automation for higher limits. - Fraud detection ML
 for risky transactions.
 7. User Flows and Wireframes (Textual)
 Flow: Create Escrow Payment (Payer): 1. Payer creates new Escrow in app: selects payee, amount,
 purpose, and condition (manual confirm / webhook / proof URL). 2. System creates escrow record and
 requests Setu UPI Collect to TrustPay virtual account. 3. Payer approves collect on their UPI app
 and funds move to virtual account. 4. Backend writes a hash of escrow metadata and Setu transaction
 ID on-chain (Polygon) via EscrowContract. 5. Escrow status: HELD.  Flow: Release Funds (Manual
 Confirm): 1. Payer and Payee both tap 'Confirm' in the app OR payee provides proof link. 2. Backend
 verifies both confirmations and executes smart contract release call. 3. Smart contract emits event;
 backend listens and triggers Setu UPI Pay from virtual account to payee VPA. 4. Update status:
 RELEASED; write final state on-chain.  Flow: Refund/Dispute: 1. If timeout or dispute, either party
 can raise a dispute. 2. Admin panel or arbitration workflow resolves and triggers Setu payout to the
 rightful party. 3. Final state logged on-chain.
 8. API Specification (Core Endpoints)
 Public REST API examples (JSON):  1) POST /api/v1/escrows/create Request: {   "payer_id":
 "user_123",   "payee_vpa": "freelancer@okaxis",   "amount": 5000,   "currency": "INR",
 "condition": "manual_confirm",   "metadata": { "order_id": "ORD123", "description": "UI design
 milestone 1" } } Response: {   "escrow_id": "esc_abc123",   "setu_collect_request_id":
 "setu_col_987",   "status": "INITIATED" }  2) GET /api/v1/escrows/{escrow_id} Response: escrow
 object with statuses, setu ids, blockchain tx hash, timestamps.  3) POST
 /api/v1/escrows/{escrow_id}/confirm Body: { "user_id": "user_123", "role": "payer|payee" } Action:
 record confirmation; if both confirmed, trigger release.  4) POST
 /api/v1/escrows/{escrow_id}/dispute Body: { "user_id":"...", "reason":"...", "evidence_urls": [...]
 } Action: create dispute ticket and notify admin.  5) Webhooks: /webhooks/setu/payment-status and
 /webhooks/external/fulfillment Action: update escrow state and write on-chain proof when necessary.
 9. Data Model and Database Schema (Simplified)
 Tables:  users - id, name, vpa, kyc_status, created_at  escrows - id, payer_id, payee_vpa, amount,
 currency, status (INITIATED, HELD, RELEASED, REFUNDED, DISPUTE), setu_collect_id,
 escrow_virtual_acc_id, blockchain_tx_hash, created_at, expires_at  confirmations - id, escrow_id,
 user_id or vpa, role, confirmed_at  disputes - id, escrow_id, raised_by, reason, evidence_links
 (json), admin_resolution, resolved_at  blockchain_logs - id, escrow_id, tx_hash, event_type,
 payload_json, created_at  audit_logs - id, user_id, action, details, created_at  indexing and
 retention notes: keep ledger data immutable; separate archival tables for old records.
 10. Smart Contract Design (Simplified)
 EscrowContract (Solidity) - responsibilities: - createEscrow(escrowId, metadataHash, setuTxnId,
 expiry) - markHeld(escrowId) - requestRelease(escrowId) - callable by backend upon dual confirmation- requestRefund(escrowId) - callable on timeout or dispute resolution - emit events: EscrowCreated,
 EscrowHeld, EscrowReleased, EscrowRefunded, EscrowDisputed  Security notes: - Use role-based access:
 only backend signer or multisig can call release/refund functions. - Keep logic minimal on-chain;
 custody remains in bank virtual accounts.
11. Integration with Setu (Technical)
 Key integration points with Setu: - UPI Collect to receive funds into TrustPay virtual account. 
Virtual Accounts creation for per-escrow isolation (recommended for clarity and reconciliation). 
UPI Pay for releasing funds to payee. - Webhook endpoints to receive asynchronous status updates
 from Setu.  Operational notes: - Idempotency keys for API calls. - Reconciliation jobs to match Setu
 transactions with escrows and blockchain logs. - Secure storage of Setu API keys and rotation
 policy.
 12. Security, Privacy, and Compliance
 Security: - Store sensitive keys in KMS (AWS KMS or HashiCorp Vault). - Use HSM or secure signer for
 blockchain transactions. - TLS for all network comms; strong input validation and rate limiting.
 Privacy: - Minimize PII on-chain; only store hashes and pointers. - GDPR-like principles: data
 deletion policy for non-essential data; retain transactional ledgers for audit per legal
 requirements.  Compliance: - Work with a regulated partner bank via Setu for virtual accounts. 
KYC/AML flows for users above thresholds. - Consult legal for custody and money-handling rules; keep
 funds off-chain in bank accounts.
 13. Monitoring, Alerts and Observability
 Metrics to monitor: - Transactions per minute, success rate, mean time to release, dispute rate,
 refund rate. - Setu API latencies and error rates. - Blockchain tx confirmation times and failures.
 Alerts: - Failed payouts > threshold - Excessive disputes - Reconciliation mismatch  Tools: 
Prometheus + Grafana for metrics - Sentry for errors - ELK or Datadog for logs and tracing
 Reconciliation jobs: - Daily and hourly jobs to reconcile Setu statements vs escrows vs blockchain
 records.
 14. QA, Testing and Release Strategy
 Testing: - Unit tests for backend and smart contract tests (Foundry/Hardhat + Chai) - Integration
 tests with Setu sandbox environment - End-to-end tests covering payment flows, release, refund, and
 dispute - Load tests to simulate spikes  Release strategy: - Internal alpha with employees and close
 partners - Beta with selected freelancers and merchants - Public launch with merchant onboarding
 program  Rollback plan: - If Setu payout failures occur, pause new escrows and notify users; process
 manual settlements until resolved.
 15. Roadmap, Milestones and Timeline (Suggested)
 Week 0-2: Product design, core DB schema, contract skeleton, Setu integration test access Week 3-6:
 Implement UPI collect, virtual account creation, write on-chain EscrowCreated event Week 7-10:
 Implement manual confirm release + UPI Pay release flow + webhook handling Week 11-14: Dispute flow,
 admin panel, reconciliation Week 15-20: B2B API, analytics, onboarding docs, merchant pilot  Hiring
 / Roles needed: - 1 Backend Engineer (Python) - 1 Frontend Engineer (TypeScript/React) - 1 Solidity
 Engineer - 1 DevOps Engineer - 1 Product Designer - 1 Growth/BD person for merchant onboarding  Go
to-market: target freelance communities, small marketplaces, and merchant aggregators for pilots.
 16. Pricing and Unit Economics
 Pricing model: - Base escrow fee: 1% per transaction - Premium escrow: 1.5-2% with insurance and
 faster SLA - B2B subscription: monthly fee + per-transaction fees  Unit economics example: - Assume
avg escrow amount = Rs. 2000 - Fee 1% = Rs. 20 revenue per transaction - If infrastructure +
 operations cost = Rs. 5 per txn, gross margin ~75% - CAC targets: Rs. 500 per merchant; LTV depends
 on transaction frequency.
 17. Risks and Mitigations
 Risk: Regulatory scrutiny on funds handling. Mitigation: Partner with regulated banks; keep funds in
 bank virtual accounts; legal counsel.  Risk: Setu or bank outages. Mitigation: Multi-bank strategy
 and retries; graceful degradation to manual process.  Risk: Smart contract exploits. Mitigation:
 Minimal on-chain logic, audits, multisig controls, timelocks for critical actions.  Risk: Poor UX
 leading to low adoption. Mitigation: User testing with early adopters; mobile-first experience;
 minimal clicks.
 18. Appendix - Sample Sequence Diagram (Text)
 Create Escrow Sequence (simplified): 1. Payer -> TrustPay UI: create escrow 2. TrustPay Backend ->
 Setu: create virtual account, initiate UPI collect 3. Setu -> Payer UPI app: collect request 4.
 Payer approves -> Setu -> Bank -> funds moved to virtual account 5. Setu -> TrustPay webhook:
 payment success 6. TrustPay Backend -> Blockchain: write EscrowCreated and metadata hash 7. Escrow
 status HELD 8. On confirmation: TrustPay Backend -> SmartContract requestRelease 9. SmartContract
 emit event -> TrustPay listens -> TrustPay Backend -> Setu UPI Pay to payee 10. Final state written
 on-chain and in DB  Notes: use idempotency for all external calls, record all ids for
 reconciliation