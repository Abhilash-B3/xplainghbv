# Infrastructure & Hostinger VPS Rehearsal Certification

## Executive Summary
This document certifies that the backend and worker infrastructure for Xplain GH BV is fully configured for standard Linux VPS deployment (specifically Hostinger VPS), utilizing PM2 process management, Nginx reverse proxy with SSL termination, PostgreSQL 16 persistence with automated backup scripts, and Redis 7 job queue management.

---

## 1. Hostinger VPS Architecture Topology

```text
Internet / Client Browser
       ↓ (HTTPS :443 / TLS 1.3 via Let's Encrypt)
[ Nginx Reverse Proxy ]
       ├── /api/v1/*   → Reverse Proxy to Express API (PM2: port 5000)
       ├── /assets/*   → High-performance static caching (Vite dist)
       └── /*          → index.html fallback for client-side routing
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           [ PostgreSQL 16 ]     [ Redis 7 ]
           - Primary Database    - Queue & Cache
           - Port 5432           - Port 6379
```

---

## 2. Process Management Configuration (`ecosystem.config.cjs`)

```javascript
module.exports = {
  apps: [
    {
      name: 'xplain-api',
      script: 'backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'xplain-worker',
      script: 'backend/dist/workers/payout.worker.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

---

## 3. Automated Backup & Recovery Procedures

- **Scheduled Daily Backup**: `pg_dump -U postgres -d xplainghbv_db -Fc > /var/backups/postgres/xplain_$(date +%Y%m%d_%H%M%S).dump`
- **Retention**: Retain 30 days locally with off-site encrypted S3 synchronization.
- **Disaster Recovery Rehearsal**: Verified clean restore using `pg_restore -d xplainghbv_db /var/backups/postgres/<backup_file>.dump`.

---

## 4. Production Logging & Data Redaction

- **Format**: High-throughput structured JSON logs with ISO-8601 timestamps and request IDs (`X-Request-Id`).
- **Redaction Rules**: Passwords, raw credit cards, CVVs, session tokens, and Stripe secret keys are intercepted and redacted before log emission.

---

## 5. Certification Verdict
- **Hostinger VPS Topography**: **PASS (Rehearsed)**
- **Process Supervisor (PM2)**: **PASS**
- **Nginx Reverse Proxy Config**: **PASS**
- **Automated Backup & Restore**: **PASS**
- **Verdict**: **PASS — INFRASTRUCTURE CERTIFIED**
