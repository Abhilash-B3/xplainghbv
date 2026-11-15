# Phase 7 — Hostinger VPS Deployment & Operational Guide

## 1. Environment Configuration

Ensure the following variables are configured in `.env` on Hostinger:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xplain_db?schema=public"

# Redis & Worker Queue
REDIS_URL="redis://127.0.0.1:6379"

# Stripe Test / Live Mode
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Application
PORT=5000
NODE_ENV="production"
FRONTEND_URL="https://xplainghbv.com"
```

---

## 2. Database Migration & Prisma Generation

```bash
# Generate Prisma Client with Phase 7 models
npx prisma generate

# Apply migrations to production PostgreSQL
npx prisma migrate deploy
```

---

## 3. Recurring Cron Jobs

On Hostinger VPS, schedule the following cron jobs via PM2 or system crontab:

```bash
# 1. Payouts Worker (Runs daily at midnight)
0 0 * * * node dist-backend/workers/payout.worker.js

# 2. Monthly Referral Commission Worker (Runs on 1st of every month at 01:00 UTC)
0 1 1 * * node dist-backend/workers/referral.worker.js
```
