# Phase 7 — Decoupled In-App & Asynchronous Notification Architecture

## 1. Architectural Invariant: Notifications Are Not Financial Authority
Notifications are strictly decoupled from transactional financial authority:
1. Financial transactions execute and commit to PostgreSQL double-entry ledger first.
2. Only after database commit, a notification event is recorded and queued for delivery.
3. Notification delivery failures or retries never impact or reverse the underlying financial transaction.

---

## 2. In-App Notification Store
- Stored in PostgreSQL `model Notification` with indexed `userId`, `type`, and `readAt`.
- Types: `SYSTEM`, `SECURITY`, `INVESTMENT`, `PAYOUT`, `WITHDRAWAL`, `REFERRAL`, `ADMIN`.
- Endpoints:
  - `GET /api/v1/notifications`: Paginated list of notifications with unread filter.
  - `GET /api/v1/notifications/unread-count`: Fast badge count for navbar.
  - `PATCH /api/v1/notifications/:id/read`: Mark single notification as read (with IDOR ownership check).
  - `PATCH /api/v1/notifications/read-all`: Mark all unread notifications as read.

---

## 3. Asynchronous Worker Queue (BullMQ / Inline Fallback)
- Backed by Redis BullMQ (`QueueService`), gracefully falling back to inline async dispatch when Redis is unreachable.
- Idempotency ensured via unique `eventKey` on each notification trigger (e.g. `withdrawal-comp-UUID`).
