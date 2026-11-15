# Phase 6 — Stripe Webhook Security & Idempotency

## 1. Raw Body Signature Verification
Stripe uses HMAC-SHA256 signatures over the exact byte payload received on the network. If Express parses the body with `express.json()` prior to verification, JSON normalization (key reordering, whitespace modifications) invalidates the signature.

### Implementation
In `backend/src/app.ts`:
```typescript
// Intercept raw body specifically on Stripe webhook route BEFORE global json parser
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));
```

In `backend/src/services/stripe.service.ts`:
```typescript
const event = stripeClient.webhooks.constructEvent(
  rawBody,
  signature,
  env.STRIPE_WEBHOOK_SECRET
);
```

## 2. Database-Enforced Webhook Idempotency
Stripe guarantees at-least-once delivery, meaning network retries can send the same event multiple times.
The `stripe_payment_events` table enforces uniqueness on `eventId`:
```prisma
model StripePaymentEvent {
  id              String   @id @default(uuid()) @db.Uuid
  eventId         String   @unique @db.VarChar(128)
  eventType       String   @db.VarChar(64)
  paymentIntentId String?  @db.VarChar(128)
  status          String   @default("PROCESSED") @db.VarChar(32)
  errorMessage    String?  @db.Text
  processedAt     DateTime @default(now()) @db.Timestamptz(6)
  createdAt       DateTime @default(now()) @db.Timestamptz(6)

  @@index([eventId])
  @@map("stripe_payment_events")
}
```

When an event arrives:
1. The service checks `findUnique({ where: { eventId: event.id } })`.
2. If found, it immediately responds with `{ received: true, duplicate: true }` without executing another database transaction.
3. If new, the transaction executes and records the `eventId` inside the atomic `$transaction`.

## 3. Strict Amount & Currency Validation
Before activating any investment or posting ledger entries:
- `paymentIntent.amount === toStripeAmount(paymentTx.amount, paymentTx.currency)`
- `paymentIntent.currency.toUpperCase() === paymentTx.currency`

Any mismatch immediately rejects settlement, writes a `SETTLEMENT_REJECTED` audit log, and marks the event `AMOUNT_MISMATCH_REJECTED` or `CURRENCY_MISMATCH_REJECTED`.
