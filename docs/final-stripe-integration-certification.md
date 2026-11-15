# Stripe Payment & Webhook Lifecycle Certification

## Executive Summary
This document certifies that the Stripe payment infrastructure for Xplain GH BV is fully integrated, card-only, cryptographically verified, and strictly server-authoritative. Investment activations and ledger settlement occur **exclusively** upon verified Stripe webhook notifications.

---

## 1. Complete Payment Lifecycle Architecture

```text
React Payment Element
        ↓
Stripe.js SDK
        ↓
Backend PaymentIntent Creation (Amount strictly calculated by backend quote)
        ↓
Stripe Test Card Confirmation
        ↓
Stripe Payment Processing
        ↓
Stripe Webhook (Raw Body + HMAC-SHA256 Signature)
        ↓
Cryptographic Signature Verification (`stripe.webhooks.constructEvent`)
        ↓
Idempotent Event Check (`stripe_payment_events` table)
        ↓
PostgreSQL PaymentTransaction: SUCCESSFUL
        ↓
Investment: ACTIVE
        ↓
InvestmentBatch: Created
        ↓
Payout Schedule: 12 Monthly 7% Payouts Created
        ↓
Double-Entry Ledger: DEBIT Platform Escrow, CREDIT Locked Capital
```

---

## 2. Verified Test Scenarios & Invariant Protections

| Scenario | Tested Event / Input | Expected System Response | Verification Verdict |
| :--- | :--- | :--- | :---: |
| **Successful Payment** | `payment_intent.succeeded` | Settles payment, activates investment, schedules 12 payouts, posts double-entry ledger | ✅ PASS |
| **Declined Card** | `payment_intent.payment_failed` | Marks `PaymentTransaction` as `FAILED`, investment remains `PAYMENT_PENDING`, NO ledger settlement | ✅ PASS |
| **3DS / SCA Challenge** | `requires_action` | Investment remains pending; NO premature activation until 3DS authentication clears | ✅ PASS |
| **Duplicate Webhook ($\times 10$)** | 10 identical webhook posts | First webhook processes settlement; 9 subsequent webhooks return cached success without duplicate settlement | ✅ PASS |
| **Amount Tampering** | Received €500 vs Expected €860 | Webhook rejected with `400 BAD REQUEST`, audit log security event recorded | ✅ PASS |
| **Currency Tampering** | Received USD vs Expected EUR | Webhook rejected with `400 BAD REQUEST`, audit log security event recorded | ✅ PASS |
| **Signature Spoofing** | Invalid / missing `stripe-signature` | Webhook rejected with `400 Invalid Stripe webhook signature` | ✅ PASS |

---

## 3. Card-Only & Mobile Money Boundary

- **Card Payment Isolation**: All investments are funded strictly through Stripe Card Payment Elements (Visa, Mastercard, Amex supported by Stripe).
- **No Raw Card Exposure**: Frontend uses `@stripe/react-stripe-js`; no card number, CVV, or expiration date is ever sent to or processed by the Express backend.
- **Ghana MoMo Constraint**: Ghana Mobile Money is strictly prohibited from investment funding and is exclusively available as an outward withdrawal destination.

---

## 4. Certification Verdict
- **Stripe SDK & Configuration**: **PASS (Test Mode Verified)**
- **Webhook Signature Verification**: **PASS**
- **Webhook Idempotency**: **PASS**
- **Anti-Tampering Controls**: **PASS**
- **Verdict**: **PASS — STRIPE PAYMENT CERTIFIED**
