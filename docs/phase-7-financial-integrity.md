# Phase 7 — Financial Integrity & Double-Entry Ledger Invariants

## 1. Zero-Money Creation Rule
No money is manufactured or destroyed in any Phase 7 workflow. Every balance mutation is represented by balanced double-entry ledger entries where:
$$\sum \text{Debits} = \sum \text{Credits}$$

---

## 2. Complete Phase 7 Ledger Movement Matrix

| Event | Debit Account | Credit Account | Economic Meaning |
|---|---|---|---|
| **Withdrawal Requested** | `AVAILABLE_RETURNS` (or `UNLOCKED_CAPITAL`) | `WITHDRAWAL_RESERVED` | Encumbers available balance into reserved liability |
| **Withdrawal Cancelled / Rejected** | `WITHDRAWAL_RESERVED` | `AVAILABLE_RETURNS` (or `UNLOCKED_CAPITAL`) | Reverses reservation; restores investor spendable balance |
| **Withdrawal Completed** | `WITHDRAWAL_RESERVED` | `PLATFORM_ESCROW` | Clears partner reserved liability and reduces platform cash asset |
| **Monthly Referral Commission** | `PLATFORM_REVENUE` | `AVAILABLE_RETURNS` | Records marketing expense and credits referrer withdrawable returns |

---

## 3. Decimal Precision & Concurrency Safety
- All balances, commissions, and amounts are calculated using arbitrary-precision `Prisma.Decimal` (mapped to PostgreSQL `DECIMAL(18, 4)` and `DECIMAL(12, 2)`).
- Concurrency protection is enforced via atomic `prisma.$transaction` interactive locks.
- Idempotency keys prevent duplicate withdrawal requests or double-posting of commissions.
