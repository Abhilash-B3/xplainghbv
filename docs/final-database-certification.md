# Database Architecture & Migration Certification

## Executive Summary
This document certifies that the PostgreSQL database for Xplain GH BV is managed with formal, reproducible Prisma migrations, contains all required relational integrity constraints (foreign keys, cascading delete rules, unique compound indexes), and uses high-precision `Decimal(18, 4)` columns for all monetary quantities.

---

## 1. Migration & Baseline Verification

- **Schema Engine**: PostgreSQL 16
- **ORM & DDL**: Prisma ORM 7.x
- **Migration History**:
  - `20260912000000_init_production_baseline/migration.sql`
- **Migration Status**: `Database schema is up to date!` (Verified via `npx prisma migrate status`).
- **Reproducibility**: A fresh database instance can be fully constructed using `npx prisma migrate deploy`.

---

## 2. Relational Integrity & Schema Design

| Area | Tables / Models | Key Invariants | Status |
| :--- | :--- | :--- | :---: |
| **Authentication** | `users`, `sessions`, `password_reset_tokens`, `email_verification_tokens` | Argon2id hashes, unique emails, cascading session invalidation | ✅ Certified |
| **Profiles & RBAC** | `partner_profiles`, `addresses`, `user_terms_acceptances` | 1-to-1 User profile, immutable terms version linking | ✅ Certified |
| **Product Catalogue** | `product_categories`, `products`, `appliance_showcases` | Unique stock codes (`ref`), category foreign keys | ✅ Certified |
| **Investments & Payouts** | `investments`, `investment_items`, `investment_batches`, `payouts` | Server quotes frozen, unique `(batchId, payoutIndex)` | ✅ Certified |
| **Payments** | `payment_transactions`, `stripe_payment_events` | Idempotent event handling, raw webhook hash tracking | ✅ Certified |
| **Double-Entry Ledger** | `financial_accounts`, `ledger_transactions`, `ledger_entries` | Balance-less accounts, immutable ledger entries, $Debit = Credit$ | ✅ Certified |
| **Withdrawals** | `withdrawals`, `bank_accounts`, `momo_accounts` | Two-phase reservations, settlement reference enforcement | ✅ Certified |
| **Referral Engine** | `referrals`, `referral_commissions` | Deduplicated monthly commission keys, Decimal calculations | ✅ Certified |
| **Notifications & Audit** | `notifications`, `notification_preferences`, `audit_logs` | Event-driven triggers, actor-attributed audit logs | ✅ Certified |

---

## 3. Decimal Precision Standards

All monetary amounts in the database are strictly typed as `Decimal(18, 4)` to prevent floating-point rounding errors across EUR, GBP, and GHS:
- `products.priceEUR`: `Decimal(18, 4)`
- `investments.amountEUR`: `Decimal(18, 4)`
- `investment_batches.capitalEUR`: `Decimal(18, 4)`
- `payouts.amountEUR`: `Decimal(18, 4)`
- `withdrawals.amountEUR`: `Decimal(18, 4)`
- `referral_commissions.amountEUR`: `Decimal(18, 4)`
- `ledger_entries.amount`: `Decimal(18, 4)`

---

## 4. Certification Verdict
- **Migration Status**: **PASS (100% Synced)**
- **Schema Validation**: **PASS (`npx prisma validate`)**
- **Relational Constraints**: **PASS**
- **Verdict**: **PASS — DATABASE CERTIFIED**
