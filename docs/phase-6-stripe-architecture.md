# Phase 6 — Stripe Payment Architecture

## 1. End-to-End System Flow

```
┌─────────────────────────┐
│ React Customer Frontend │
└───────────┬─────────────┘
            │
            │ 1. POST /api/v1/payments/create-intent { investmentId }
            ▼
┌─────────────────────────┐
│   Express Backend API   │
│ (Ownership & DB Quote)  │
└───────────┬─────────────┘
            │
            │ 2. stripeClient.paymentIntents.create({ amount, currency, payment_method_types: ['card'] })
            ▼
┌─────────────────────────┐
│     Stripe Gateway      │
└───────────┬─────────────┘
            │
            │ 3. Returns clientSecret & publishableKey
            ▼
┌─────────────────────────┐
│ React Stripe Elements   │
│ (<PaymentElement />)    │
└───────────┬─────────────┘
            │
            │ 4. Customer enters card -> elements.submit() -> stripe.confirmPayment()
            │    (Handles 3DS / SCA modal directly if required)
            ▼
┌─────────────────────────┐
│ Stripe Processing Core  │
└───────────┬─────────────┘
            │
            │ 5. POST /api/v1/webhooks/stripe (Stripe-Signature header + raw byte body)
            ▼
┌─────────────────────────┐
│ Express Webhook Handler │
│  (Signature & Dedup)    │
└───────────┬─────────────┘
            │
            │ 6. Atomic PostgreSQL $transaction:
            │    • PaymentTransaction -> SUCCESSFUL
            │    • Investment -> ACTIVE
            │    • InvestmentBatch created + 12 Payouts (Option B)
            │    • Double-Entry Ledger: DEBIT PLATFORM_ESCROW, CREDIT LOCKED_CAPITAL
            │    • AuditLog recorded & StripePaymentEvent -> PROCESSED
            ▼
┌─────────────────────────┐
│   PostgreSQL Database   │
└─────────────────────────┘
```

## 2. Component Boundaries
- **`src/services/paymentService.ts`**: Frontend client communicating with authenticated Express backend endpoints.
- **`src/components/payments/StripePaymentElement.tsx`**: Custom dark-gold themed Stripe Elements provider and card form.
- **`backend/src/config/stripe.ts`**: Centralized Stripe SDK client with API version pinning and currency capability checks.
- **`backend/src/services/stripe.service.ts`**: Authoritative PaymentIntent creation, webhook verification, amount/currency validation, and atomic financial ledger settlement.
- **`backend/src/controllers/payment.controller.ts` & `webhook.controller.ts`**: HTTP controllers with strict Zod validation and raw buffer processing.
