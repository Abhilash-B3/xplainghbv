# Phase 7 — Referral Engine & 3% Monthly Commission Economics

## 1. Economic Rule & Specification
The Xplain GH BV referral system rewards referrers with a recurring **3% monthly commission** on active referee investment capital under Option B (Sell-For-Me managed resale plan).

### Exact Definition of Capital
- **Canonical Currency**: EUR (`batch.capitalEUR`).
- **Eligible Investment**: Active Option B investments (`status = 'ACTIVE'`, `batch.status = 'ACTIVE'`).
- **Rate**: $0.0300$ ($3.00\%$ per month).
- **Calculation Formula**:
  $$\text{Commission Amount (EUR)} = \text{Qualifying Active Capital (EUR)} \times 0.0300$$
  Rounded half-up to 2 decimal places using `Prisma.Decimal`.

---

## 2. Server-Side Attribution & Anti-Self-Referral
- Attribution is stored in PostgreSQL `model Referral` linking `referrerProfileId` and `refereeProfileId`.
- **Anti-Self-Referral**: A user cannot use their own referral code (`referrerProfileId === refereeProfileId` is strictly rejected with 400 `BAD_REQUEST`).
- **Idempotent Attribution**: Once a referee is attributed, the attribution cannot be overwritten or double-credited.

---

## 3. Double-Entry Accounting Invariant
Referral commissions represent a legitimate platform marketing expense funded from Platform Revenue:
$$\text{DEBIT } \text{PLATFORM\_REVENUE} \longrightarrow \text{CREDIT } \text{AVAILABLE\_RETURNS}$$

No artificial money creation occurs. Referral commission credits are immediately withdrawable by the referrer.

---

## 4. Idempotent Monthly Worker
- Commission runs are indexed uniquely by `(referralId, periodMonth)`.
- Re-running the monthly commission worker for the same period (e.g. `2026-09`) skips already processed referrals without duplicate ledger postings.
