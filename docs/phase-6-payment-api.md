# Phase 6 — Payment API Specification

## 1. Create / Retrieve PaymentIntent
**Endpoint:** `POST /api/v1/payments/create-intent`  
**Authentication:** Required (HttpOnly Session Cookie or Bearer Token)  
**Idempotency:** Supported via `Idempotency-Key` header or `idempotencyKey` in request body.

### Request Body
```json
{
  "investmentId": "55555555-5555-4555-8555-555555555555",
  "idempotencyKey": "opt-key-12345"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJ...",
    "paymentTransactionId": "66666666-6666-4666-8666-666666666666",
    "publishableKey": "pk_test_...",
    "amount": "860",
    "currency": "EUR",
    "status": "requires_payment_method"
  }
}
```

---

## 2. Get Payment Status
**Endpoint:** `GET /api/v1/payments/:paymentTransactionId`  
**Authentication:** Required  
**Ownership Enforcement:** Enforces IDOR protection. Returns `403 Forbidden` if caller does not own the transaction (unless admin).

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "66666666-6666-4666-8666-666666666666",
    "referenceNumber": "TX-INV-M1A2B3C4-1001",
    "status": "SUCCESSFUL",
    "stripePaymentStatus": "succeeded",
    "amount": "860.00",
    "currency": "EUR",
    "canonicalAmountEUR": "860.00",
    "paidAt": "2026-09-12T15:20:00.000Z",
    "failureCode": null,
    "failureMessage": null,
    "investment": {
      "id": "55555555-5555-4555-8555-555555555555",
      "status": "ACTIVE",
      "resalePlan": "SELLFOR",
      "totalAmountEUR": "860.00"
    },
    "createdAt": "2026-09-12T15:18:00.000Z"
  }
}
```

---

## 3. Stripe Webhook Listener
**Endpoint:** `POST /api/v1/webhooks/stripe`  
**Authentication:** Verified cryptographically using `Stripe-Signature` header and `STRIPE_WEBHOOK_SECRET`.  
**Body Format:** Raw application/json buffer.

### Events Handled
- `payment_intent.succeeded`: Executes atomic financial settlement in PostgreSQL.
- `payment_intent.payment_failed`: Marks payment transaction FAILED and logs failure code.
- `payment_intent.processing`: Updates payment transaction to processing state.
- `payment_intent.canceled`: Marks transaction CANCELLED.
