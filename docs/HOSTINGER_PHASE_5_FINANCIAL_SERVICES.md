# Hostinger Deployment Guide: Phase 5 Financial & Product Engine

**Target Environment:** Hostinger VPS / Cloud Server (Ubuntu 24.04 LTS / Node.js 22 LTS / PostgreSQL 16)  
**Applicability:** Phase 5 Services Deployment

---

## 1. Environment Configurations (`.env`)

Add the following environment keys for Phase 5 services:

```env
# Currency & Treasury
BASE_CURRENCY=EUR
SUPPORTED_CURRENCIES=EUR,GBP,GHS
MINIMUM_INVESTMENT_GHS=1050.00
EXCHANGE_RATE_SOURCE=DATABASE_SNAPSHOT
EXCHANGE_RATE_TTL_SECONDS=900

# Financial Engine
LEDGER_PRECISION_DECIMALS=4
OPTION_B_DISCOUNT_PERCENT=14
OPTION_B_MONTHLY_RETURN_PERCENT=7
OPTION_B_LOCK_MONTHS=12
```

---

## 2. Database Indexes & Performance Verification

Ensure the following database indexes exist in PostgreSQL for high concurrency:

```sql
-- Product and Catalogue Indexes
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_ref ON products(ref);

-- Financial Ledger Indexes
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_ref ON ledger_transactions(reference_number);

-- Investment & Payout Indexes
CREATE INDEX IF NOT EXISTS idx_investments_partner_status ON investments(partner_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_payouts_batch_index ON payouts(batch_id, payout_index);
CREATE INDEX IF NOT EXISTS idx_payouts_due_status ON payouts(due_date, status);
```

---

## 3. Worker Architecture for Hostinger VPS

For background payout schedules and reconciliation jobs, use PM2 process configuration (`ecosystem.config.cjs`):

```javascript
module.exports = {
  apps: [
    {
      name: 'xplain-api',
      script: 'backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
```
