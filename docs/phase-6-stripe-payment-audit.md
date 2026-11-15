# Phase 6 — Stripe Payment Architecture & Audit

## 1. Executive Summary
Phase 6 establishes a zero-mock, PCI-compliant **Stripe Card Payment Architecture** for the Xplain GH BV investment platform. All simulated card payments, fake timers, and Ghana Mobile Money funding options have been eliminated from the active investment checkout workflow.

## 2. Audit of Existing Payment & Ledger Architecture
Prior to Phase 6 implementation, an internal audit was performed across Phases 1.5, 3, 4, and 5:
- **Phase 5 Foundation**: Established PostgreSQL models for `Investment`, `InvestmentItem`, `InvestmentBatch`, `Payout`, and `PaymentTransaction`.
- **Double-Entry Financial Ledger**: `LedgerService` enforces strict balanced journal entries (`SUM(Debits) === SUM(Credits)`) in canonical EUR with `AccountType.PLATFORM_ESCROW`, `AccountType.LOCKED_CAPITAL`, and `AccountType.PLATFORM_REVENUE`.
- **Authoritative Frozen Pricing**: Server quotes compute historical exchange-rate snapshots and wholesale discounts (14% discount and 7% monthly return for Option B) which remain immutable once the investment intent is registered.
- **Legacy Payment State**: Simulated timeouts and MoMo network selectors in `PaymentStep.tsx` and `AuthForm.tsx` were identified and removed.

## 3. Key Architectural Decisions
1. **Stripe Only**: Supported cards include Visa, Mastercard, American Express, and all major international credit/debit cards.
2. **Stripe Payment Elements + PaymentIntents**: Browser handles sensitive PAN and CVC directly inside Stripe-hosted iframes; raw card data never touches the Xplain GH BV Express backend.
3. **Cryptographic Webhook Settlement**: The frontend never activates an investment directly. Settlement occurs exclusively via signed `payment_intent.succeeded` webhooks processed atomically in PostgreSQL.
4. **Database-Enforced Deduplication**: `StripePaymentEvent` model guarantees idempotency and protects against duplicate ledger settlements during concurrent webhook retries.
