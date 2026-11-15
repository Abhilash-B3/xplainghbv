# Phase 7 — Security & Access Control Audit

## 1. Security Invariants Verified

### 1. Insecure Direct Object References (IDOR)
- **Bank & MoMo Destinations**: Deleting, modifying, or withdrawing to a destination verifies that `destination.partnerProfileId === user.partnerProfile.id`.
- **Withdrawal Inspection & Cancellation**: Users can only view or cancel withdrawals belonging to their own partner profile.
- **Notifications**: Users can only read or mark as read notifications where `notification.userId === user.id`.

### 2. Role-Based Access Control (RBAC)
- All `/api/v1/admin/*` endpoints strictly require `UserRole.ADMIN`, `UserRole.SUPERADMIN`, or `UserRole.SUPPORT`.
- `INVESTOR` role attempts return `403 FORBIDDEN`.
- Unauthenticated requests return `401 UNAUTHORIZED`.

### 3. Sensitive Data Masking
- Bank account numbers are stored and returned in masked format (e.g. `•••• 7890`).
- MoMo phone numbers are stored and returned in masked format (e.g. `•••• 5678`).

### 4. Zero-Mock Audit
- No mock data or simulated responses remain in any user, withdrawal, referral, notification, or admin flows.
