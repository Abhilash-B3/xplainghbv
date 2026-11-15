# HOSTINGER DEPLOYMENT GUIDE — PHASE 3 BACKEND FOUNDATION

**Project:** Xplain GH BV Investment Platform  
**Target Environment:** Hostinger Cloud / VPS or Hostinger Node.js Application Manager  
**Architecture:** Standalone Node.js / Express Server + Remote/Local PostgreSQL Database  
**Phase:** Phase 3 Foundation  
**Date:** September 2026

---

## 1. System Requirements

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node.js v18.18+ LTS | Node.js v20.x LTS |
| **Package Manager** | npm v9+ | npm v10+ |
| **PostgreSQL Database**| PostgreSQL 14+ | PostgreSQL 16+ (Hostinger VPS / Supabase / Neon / AWS RDS) |
| **Redis (Optional in Phase 3)** | Redis 6+ | Redis 7+ (Hostinger Redis / Upstash) |
| **RAM** | 1 GB | 2 GB+ |
| **SSL / HTTPS** | Let's Encrypt SSL | Forced HTTPS on all incoming traffic |

---

## 2. Production Environment Configuration (`.env`)

Configure the following environment variables in the Hostinger Node.js Application Settings or `.env` file on the VPS:

```env
# ─── RUNTIME ENVIRONMENT ──────────────────────────────────────────────
NODE_ENV="production"
PORT=5000

# ─── APPLICATION ORIGIN (CRITICAL FOR CORS) ──────────────────────────
# Set to the exact domain where the frontend is hosted (no trailing slash)
FRONTEND_URL="https://xplainghbv.com"

# ─── DATABASE CONNECTION ──────────────────────────────────────────────
# PostgreSQL connection string with connection pool parameters
DATABASE_URL="postgresql://db_user:db_secure_password@postgres_host:5432/xplainghbv_prod?schema=public&sslmode=prefer"
DIRECT_DATABASE_URL="postgresql://db_user:db_secure_password@postgres_host:5432/xplainghbv_prod?schema=public"

# ─── REDIS CONNECTION (Optional in Phase 3) ───────────────────────────
REDIS_URL="redis://default:redis_password@redis_host:6379"

# ─── SECURITY SECRETS ────────────────────────────────────────────────
# Must be generated with cryptographically secure random bytes (min 32 chars)
SESSION_SECRET="generate_a_secure_random_hex_or_base64_string_at_least_32_characters_long"
COOKIE_DOMAIN=".xplainghbv.com"

# ─── FUTURE INTEGRATIONS (Prepared for Phase 7 & 8) ───────────────────
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
MOBILE_MONEY_PROVIDER="MTN_MOMO"
MOBILE_MONEY_API_URL="https://proxy.momo.com"
MOBILE_MONEY_API_KEY=""
MOBILE_MONEY_API_SECRET=""
EMAIL_PROVIDER="POSTMARK"
EMAIL_API_KEY=""
EMAIL_FROM="Xplain GH BV <no-reply@xplainghbv.com>"
```

---

## 3. Build & Deployment Commands

Run the following build and migration steps during CI/CD or deployment via SSH:

### Step 1: Install Dependencies
```bash
npm ci --production=false
```

### Step 2: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 3: Run Database Migrations
```bash
npx prisma migrate deploy
```

### Step 4: Build Backend Application
```bash
npm run backend:build
```
*Artifacts will be compiled to `backend/dist/`.*

### Step 5: Build Frontend Application (if co-hosted)
```bash
npm run build
```
*Static files compiled to `dist/`.*

---

## 4. Starting the Server with PM2 (Process Manager)

For continuous uptime and zero-downtime restarts on Hostinger VPS:

```bash
# Start backend server with PM2
npx pm2 start backend/dist/server.js --name "xplain-backend" --time

# Configure PM2 to restart automatically on system reboot
npx pm2 save
npx pm2 startup
```

Alternatively, configure the Hostinger Node.js Application Manager:
- **Application root:** `/home/user/public_html` (or repository directory)
- **Application startup file:** `backend/dist/server.js`
- **Node.js version:** `20.x`
- **Application mode:** `Production`

---

## 5. Nginx Reverse Proxy Configuration (Hostinger VPS)

To route `/api/v1` traffic to the Express backend while serving static frontend assets:

```nginx
server {
    listen 80;
    server_name xplainghbv.com www.xplainghbv.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name xplainghbv.com www.xplainghbv.com;

    ssl_certificate /etc/letsencrypt/live/xplainghbv.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xplainghbv.com/privkey.pem;

    # Frontend Single Page Application
    location / {
        root /var/www/xplain-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend Express API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Production Health Monitoring

Hostinger uptime monitors and load balancers should poll:

```http
GET https://xplainghbv.com/api/v1/health
```

- **Expected Status:** `200 OK`
- **Response Format:** JSON containing database health and latency (`latencyMs`)
- **Unhealthy Behavior:** If PostgreSQL becomes unreachable, returns `503 Service Unavailable`.
