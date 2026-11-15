# Phase 6 — Testing & Verification Report

## 1. Test Suite Coverage
Automated test suites verify all layers of the Stripe integration, from Intent creation to cryptographic webhook verification, amount mismatch rejection, and double-entry ledger balancing.

### Backend Test Suites (16 Suites, 85 Tests Passing)
- **`backend/tests/stripe.test.ts`** (8 tests):
  - Server-authoritative amount & currency derivation.
  - Ownership validation & IDOR prevention (cannot pay for another user's investment).
  - Rejection of already-active investments (`409 Conflict`).
  - Active PaymentIntent reuse (idempotency).
  - Authenticated payment status retrieval with ownership checks.
- **`backend/tests/webhook.test.ts`** (9 tests):
  - Rejection of requests with missing signature header (`400 Bad Request`).
  - Rejection of requests with invalid cryptographic signature (`400 Bad Request`).
  - `payment_intent.succeeded` atomic settlement and investment activation.
  - Option B batch activation and 12 scheduled payouts.
  - Double-entry balanced ledger posting (`DEBIT PLATFORM_ESCROW`, `CREDIT LOCKED_CAPITAL`).
  - Webhook deduplication / duplicate delivery idempotency.
  - Amount mismatch rejection & security audit logging.
  - Currency mismatch rejection & security audit logging.
  - `payment_intent.payment_failed`, `processing`, and `canceled` state transitions.
- **Existing Backend Suites** (68 tests across Auth, Investments, Products, RBAC, Concurrency, Financial, Health, Security, Token, User).

## 2. Stripe Test Mode Cards Tested
- **Standard Successful Visa**: `4242 4242 4242 4242` (Any future expiration date, any 3-digit CVC).
- **3D Secure / SCA Required**: `4000 0025 0000 3155` (Triggers Stripe authentication modal).
- **Card Declined**: `4000 0000 0000 9995` (Produces `card_declined` error).

## 3. Local Stripe CLI Webhook Forwarding
For live development testing with the Stripe CLI:
```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
```
Copy the webhook signing secret printed by the CLI (`whsec_...`) into `.env` as `STRIPE_WEBHOOK_SECRET`.
