# Phase 7 — Withdrawals Engine Architecture & Invariants

## 1. Overview
The Phase 7 Withdrawal Engine provides a resilient, concurrency-safe, double-entry ledger-backed withdrawal system for investors on the **Xplain GH BV** platform.

---

## 2. Authoritative Withdrawable Balance Formula

Authoritative withdrawable balance is derived strictly from PostgreSQL ledger accounts without duplicate subtraction:

$$\text{Withdrawable Balance (EUR)} = \text{Balance}(\text{AVAILABLE\_RETURNS}) + \text{Balance}(\text{UNLOCKED\_CAPITAL})$$

### Invariant: Active Reservations Already Reflected
When a withdrawal is requested, funds are atomically reserved:
$$\text{DEBIT } \text{AVAILABLE\_RETURNS} \longrightarrow \text{CREDIT } \text{WITHDRAWAL\_RESERVED}$$

Because the amount immediately leaves `AVAILABLE_RETURNS`, no secondary subtraction is applied during balance checks.

---

## 3. Formal Withdrawal State Machine

```
   [ REQUESTED ]
         │ (validation: destination ownership, min €20, balance lock)
         ▼
   [ RESERVED (PENDING) ] ───────► [ CANCELLED ] (by investor)
         │                               │
         │ (admin review)                ▼ (Reservation released to AVAILABLE_RETURNS)
         ├───────────────────────► [ REJECTED ] (by admin with reason)
         │                               │
         ▼                               ▼ (Reservation released to AVAILABLE_RETURNS)
   [ APPROVED ]
         │ (dispatched to payment rail)
         ▼
   [ PROCESSING ] ───────────────► [ FAILED ] (provider failure code)
         │
         │ (genuine settlement proof: bank transfer reference / provider tx id)
         ▼
   [ COMPLETED ]
         │
         ▼ (Settlement posted: DEBIT WITHDRAWAL_RESERVED → CREDIT PLATFORM_ESCROW)
```

---

## 4. Double-Entry Financial Movements

| Operation | Debit Account | Credit Account | Purpose |
|---|---|---|---|
| **Withdrawal Request** | `AVAILABLE_RETURNS` | `WITHDRAWAL_RESERVED` | Atomic reservation of investor funds |
| **Withdrawal Cancellation** | `WITHDRAWAL_RESERVED` | `AVAILABLE_RETURNS` | Release reserved funds back to investor |
| **Admin Rejection** | `WITHDRAWAL_RESERVED` | `AVAILABLE_RETURNS` | Refund reserved balance upon rejection |
| **Settlement Completion** | `WITHDRAWAL_RESERVED` | `PLATFORM_ESCROW` | Terminal cash outflow (liability cleared, platform cash reduced) |

Total Debits strictly equal Total Credits on every transaction.

---

## 5. Settlement Proof Invariant
No administrator can transition a withdrawal to `COMPLETED` without providing a verified external settlement reference (e.g., `BARC-TRF-2026-9921`) and structured settlement metadata. No funds are assumed paid merely by clicking an administrative button.
