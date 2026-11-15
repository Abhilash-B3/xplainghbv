# Phase 8.7 — Hostinger VPS Deployment Orchestration Guide

## 1. Production Architecture on Hostinger VPS

```
                              [ HTTPS Requests ]
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    Nginx Reverse Proxy    │
                        │    (SSL / Let's Encrypt)  │
                        └─────────────┬─────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
   ┌──────────────────────┐                       ┌──────────────────────┐
   │   Static Frontend    │                       │     Backend API      │
   │   /dist (HTML/JS)    │                       │  Node.js / Express   │
   │                      │                       │  PM2 Process Manager │
   └──────────────────────┘                       └───────────┬──────────┘
                                                              │
                                      ┌───────────────────────┴───────────────────────┐
                                      ▼                                               ▼
                          ┌───────────────────────┐                       ┌───────────────────────┐
                          │   PostgreSQL Engine   │                       │  Redis & BullMQ Queue │
                          │ (Double-Entry Ledger) │                       │ (Payout/Referral/Cron)│
                          └───────────────────────┘                       └───────────────────────┘
```

---

## 2. 15-Step Hostinger Deployment Sequence

1. **Provision VPS**: Ubuntu 22.04 LTS on Hostinger KVM.
2. **Install Runtimes**: Node.js 20 LTS, PostgreSQL 16, Redis, PM2, Git, Nginx.
3. **Configure Environment**: Set up `.env` with strict permissions (`chmod 600 .env`).
4. **Configure Database**: Create PostgreSQL database `xplain_db` and restricted user.
5. **Run Migrations**: `npx prisma migrate deploy` to create schema and tables.
6. **Seed Initial Products**: `npm run seed:production` (Approved products and categories only).
7. **Build Frontend**: `npm run build` generates `/dist`.
8. **Build Backend**: `npm run backend:build` generates `/dist-backend`.
9. **Start API Process**: `pm2 start dist-backend/index.js --name xplain-api`.
10. **Start Queue Workers**: `pm2 start dist-backend/workers/payout.worker.js --name xplain-payouts`.
11. **Configure Nginx**: Proxy `/api/v1` to `localhost:5000` and serve `/dist` for client routes.
12. **Configure SSL**: `certbot --nginx -d xplainghbv.com`.
13. **Configure Stripe Webhooks**: Set endpoint URL to `https://xplainghbv.com/api/v1/webhooks/stripe`.
14. **Smoke Test Health Endpoint**: `curl https://xplainghbv.com/api/v1/health`.
15. **Enable Automated Daily Backups**: Daily PostgreSQL backup cron script.
