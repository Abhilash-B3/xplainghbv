# Phase 8.7 — Environment Configuration & Secrets Management

## 1. Secret Audit & Environment Separation

| Environment Variable | Scope | Description | Development / Test | Production (Hostinger) |
|---|---|---|---|---|
| `DATABASE_URL` | Backend Only | PostgreSQL connection string | `postgresql://...localhost:5432/...` | Secure remote connection string |
| `REDIS_URL` | Backend Only | Redis instance URI | `redis://127.0.0.1:6379` | Protected Redis socket / host |
| `STRIPE_SECRET_KEY` | Backend Only | Stripe API secret key | `sk_test_...` | Secure server environment variable |
| `STRIPE_WEBHOOK_SECRET` | Backend Only | Webhook signing secret | `whsec_...` | Hostinger webhook endpoint secret |
| `SESSION_SECRET` | Backend Only | Session cookie encryption secret | 32+ char random string | High-entropy crypto random secret |
| `VITE_STRIPE_PUBLISHABLE_KEY`| Client Public | Stripe Elements publishable key | `pk_test_...` | Injected at build time (`pk_test_...`) |
| `VITE_API_URL` | Client Public | Backend API endpoint URI | `http://localhost:5000/api/v1` | `https://xplainghbv.com/api/v1` |

---

## 2. Secrets Protection Rules
- `.env` is permanently excluded via `.gitignore`.
- `.env.example` contains only non-sensitive placeholder templates.
- Backend secrets are never bundled or transmitted to the browser client.
