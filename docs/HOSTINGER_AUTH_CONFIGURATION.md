# HOSTINGER AUTHENTICATION DEPLOYMENT GUIDE

**Project:** Xplain GH BV Investment Platform  
**Target Environment:** Hostinger Cloud / VPS / Node.js Application Manager  
**Topic:** Production Authentication, Cookies, SSL & Reverse Proxy Setup  
**Date:** September 2026

---

## 1. Prerequisites & Hostinger Environment

| Requirement | Setting / Value | Explanation |
| :--- | :--- | :--- |
| **Node.js Version** | Node.js 20.x LTS | Full native support for modern crypto and ESM |
| **SSL Certificate** | Let's Encrypt SSL (Forced HTTPS) | **Mandatory:** `Secure` cookie flag requires HTTPS in production |
| **Nginx Proxy Protocol**| `proxy_set_header X-Forwarded-Proto $scheme;` | Informs Express that requests are secured via SSL termination |
| **Trust Proxy in Express**| `app.set('trust proxy', 1);` (if behind Nginx) | Ensures `req.secure` and `req.ip` correctly reflect client details |

---

## 2. Production Environment Variables (`.env`)

Configure the following authentication variables in Hostinger:

```env
# Production Node Environment
NODE_ENV="production"
PORT=5000

# Canonical Frontend URL (No trailing slash)
FRONTEND_URL="https://xplainghbv.com"

# Cookie Domain (Leave empty for same host, or set to root domain for subdomains)
COOKIE_DOMAIN=".xplainghbv.com"

# Cryptographically Secure Session Secret (Generate using crypto.randomBytes(32).toString('hex'))
SESSION_SECRET="d8c47f9e1b2a3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f"

# PostgreSQL Database
DATABASE_URL="postgresql://db_user:strong_password@postgres_host:5432/xplainghbv_prod?schema=public&sslmode=prefer"
```

---

## 3. Cookie Transmission Matrix

| Environment | `secure` | `sameSite` | `httpOnly` | Accessible by React? |
| :--- | :--- | :--- | :--- | :--- |
| **Development** (`localhost`) | `false` | `'lax'` | `true` | **No** (Protected against XSS) |
| **Production** (`xplainghbv.com`) | `true` | `'lax'` | `true` | **No** (Protected against XSS & MitM) |

---

## 4. Nginx Reverse Proxy Configuration for Session Cookies

When deploying on a Hostinger VPS with Nginx forwarding to Express on `localhost:5000`:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Pass Set-Cookie and Cookie headers without stripping
    proxy_pass_header Set-Cookie;
    proxy_pass_header Cookie;
}
```

---

## 5. Session Revocation & Security Verification

To verify authentication behavior on Hostinger after deployment:
1. `POST /api/v1/auth/login` -> Verify `Set-Cookie` contains `xplain_session=...; Path=/; HttpOnly; Secure; SameSite=Lax`.
2. `GET /api/v1/auth/me` with cookie -> Returns `200 OK` with user profile.
3. `POST /api/v1/auth/logout` -> Verify cookie is expired/cleared and PostgreSQL `sessions.revokedAt` is populated.
4. `GET /api/v1/auth/me` -> Returns `401 UNAUTHORIZED`.
