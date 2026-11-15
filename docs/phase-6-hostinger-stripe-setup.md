# Phase 6 — Hostinger Deployment & Stripe Setup Guide

## 1. Production Requirements
- **Node.js**: v20.x or v22.x LTS
- **Database**: PostgreSQL 15+ with SSL enabled
- **Redis**: Redis 7+ for job queues
- **HTTPS Domain**: Valid SSL certificate (Stripe Webhooks strictly require HTTPS in production)

## 2. Environment Variables Configuration
In the Hostinger Cloud / VPS Environment Manager, configure:

```ini
# Production Environment
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://xplainghbv.com"
SESSION_SECRET="<generate_64_char_secure_random_hex>"
COOKIE_DOMAIN=".xplainghbv.com"

# Database Connections
DATABASE_URL="postgresql://user:password@host:5432/xplain_prod?schema=public&sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/xplain_prod?schema=public&sslmode=require"

# Stripe Live Mode Credentials (When Approved)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_API_VERSION="2025-02-24.acacia"
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

## 3. Stripe Dashboard Production Webhook Configuration
1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com).
2. Navigate to **Developers** → **Webhooks** → **Add an endpoint**.
3. Set Endpoint URL to: `https://api.xplainghbv.com/api/v1/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.processing`
   - `payment_intent.canceled`
5. Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in your Hostinger environment.

## 4. Build & Deployment Commands
```bash
# Install dependencies
npm ci

# Run Prisma migration
npx prisma migrate deploy
npx prisma generate

# Build frontend and backend
npm run build
npm run backend:build

# Start production server
npm run backend:start
```
