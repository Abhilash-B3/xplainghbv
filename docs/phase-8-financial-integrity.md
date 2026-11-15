# Phase 8.4 — Financial Integrity, Double-Entry Ledger & Stripe Audit

## 1. Frozen Investment Pricing & Snapshot Invariants

Every investment created in PostgreSQL permanently freezes:
- `canonicalAmountEUR`: Authoritative base EUR amount.
- `unitPriceEUR`: Exact product unit price at quote confirmation time.
- `discountMultiplier`: `0.8600` for Option B (14% discount), `1.0000` for Option A.
- `monthlyReturnRate`: `0.0700` for Option B (7% monthly return), `0.0000` for Option A.
- `exchangeRateToEUR`: Frozen exchange rate snapshot from PostgreSQL `ExchangeRateSnapshot`.
- `lockDurationMonths`: `12` months for Option B, `0` months for Option A.
- `startDate` and `endDate`: Immutable contract duration.

No frontend input can alter, override, or tamper with these values once confirmed.

---

## 2. Complete Phase 1–7 Double-Entry Financial Movement Matrix

| Financial Event | Debit Account | Credit Account | Economic Meaning |
|---|---|---|---|
| **Stripe Investment Settlement** | `PLATFORM_ESCROW` | `LOCKED_CAPITAL` | Platform receives external cash; records investor locked capital liability. |
| **Option B Monthly Payout (1–12)** | `PLATFORM_ESCROW` | `AVAILABLE_RETURNS` | Platform cash allocated to investor withdrawable return. |
| **Option B Capital Maturity (Month 12)** | `LOCKED_CAPITAL` | `UNLOCKED_CAPITAL` | Unlocks matured capital for withdrawal or reinvestment. |
| **Withdrawal Requested** | `AVAILABLE_RETURNS` | `WITHDRAWAL_RESERVED` | Atomically encumbers available balance into reserved liability. |
| **Withdrawal Cancelled / Rejected** | `WITHDRAWAL_RESERVED` | `AVAILABLE_RETURNS` | Reverses reservation; returns funds to investor available returns. |
| **Withdrawal Completed (Settled)** | `WITHDRAWAL_RESERVED` | `PLATFORM_ESCROW` | Clears partner reserved liability and reduces platform cash asset. |
| **3% Referral Commission** | `PLATFORM_REVENUE` | `AVAILABLE_RETURNS` | Records marketing expense; credits referrer withdrawable returns. |

---

## 3. Stripe Test Mode Integration & Webhook Security
- **Payment Method**: Card-only (Visa, Mastercard, etc.). No Ghana Mobile Money funding.
- **Test Mode**: Enforced in Phase 8 (`sk_test_...` / `pk_test_...`). Live mode is strictly deactivated.
- **Webhook Signature Verification**: Handled with `stripe.webhooks.constructEvent(payload, signature, secret)`.
- **Webhook Idempotency**: Stored in `StripePaymentEvent(eventId)`. Replayed webhooks are acknowledged without duplicate ledger postings or duplicate investment activations.
- **Tampering Protection**: Amount and currency are locked to the server quote and verified against `PaymentIntent.amount`.

---

## 4. Automated Ledger Reconciliation Report

The automated reconciliation engine (`ReconciliationService.runReconciliation()`) performs real-time continuous audits across 4 dimensions:
1. **Global Debits == Global Credits**: Confirms total debits equal total credits across all `LedgerEntry` records.
2. **Escrow Cash Audit**: Audits `PLATFORM_ESCROW` net balance against platform obligations.
3. **Locked Capital Integrity**: Verifies sum of `LOCKED_CAPITAL` accounts matches sum of active investment batches.
4. **Withdrawal Reservation Integrity**: Reconciles `WITHDRAWAL_RESERVED` account balances against pending/approved/processing withdrawal amounts.
