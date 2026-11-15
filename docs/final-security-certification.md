# Security, RBAC & IDOR Protection Certification

## Executive Summary
This document certifies that the security controls of Xplain GH BV protect against unauthorized data access, privilege escalation, cross-user horizontal traversal (IDOR), authentication bypass, and injection vectors.

---

## 1. Authentication & Session Management

- **Password Hashing**: Industry-standard **Argon2id** (`m=65536, t=3, p=4`).
- **Session Tokens**: Cryptographically random high-entropy UUID session tokens stored in PostgreSQL with cascading invalidation upon logout or password reset.
- **Cookie Security**:
  - `HttpOnly`: Protects against client-side JavaScript access / XSS theft.
  - `SameSite=Lax`: Defends against Cross-Site Request Forgery (CSRF).
  - `Secure`: Enforced in production TLS environments.
- **Rate Limiting**: Configured across authentication and sensitive financial endpoints (`express-rate-limit`).

---

## 2. Role-Based Access Control (RBAC)

The system enforces 4 strict user roles:

| Role | Permissions & Boundaries |
| :--- | :--- |
| **`INVESTOR`** | Manage own profile, browse products, fund investments via Stripe card, request withdrawals, view own notifications & referrals. Forbidden from `/api/v1/admin/*`. |
| **`SUPPORT`** | Read-only administrative inspection of partner profiles, investments, and audit records. |
| **`ADMIN`** | Approve/reject withdrawal requests, complete withdrawals with mandatory settlement proof, view platform reconciliation reports. |
| **`SUPERADMIN`**| Full system administration, role assignment, and platform configuration. |

---

## 3. Insecure Direct Object Reference (IDOR) Protections

Every user-scoped resource access verifies ownership against the session user's authenticated `partnerProfileId`:
- **Investments**: `GET /api/v1/investments/:id` checks ownership; unauthorized users receive `404 NOT_FOUND` or `403 FORBIDDEN`.
- **Withdrawals**: `GET /api/v1/withdrawals/:id` verifies ownership.
- **Bank / MoMo Accounts**: `DELETE /api/v1/bank-accounts/:id` prevents cross-user deletion.
- **Payments**: `GET /api/v1/payments/:id` prevents reading other users' Stripe PaymentIntent IDs.
- **Notifications**: Reading or updating notification read states is restricted strictly to the notification recipient.

---

## 4. HTTP Headers & Transport Security

- **Helmet**: Secures HTTP response headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`).
- **CORS**: Explicitly restricted to the authorized frontend origin (`FRONTEND_URL`); unauthorized origins are rejected with a CORS policy violation.
- **Audit Tracing**: `X-Request-Id` is generated or preserved across all requests and logged in structured JSON output.

---

## 5. Certification Verdict
- **Argon2id Password Security**: **PASS**
- **Session Cookie Protection**: **PASS**
- **RBAC Boundaries**: **PASS**
- **IDOR Traversal Defenses**: **PASS**
- **Security Headers & CORS**: **PASS**
- **Verdict**: **PASS — SECURITY CERTIFIED**
