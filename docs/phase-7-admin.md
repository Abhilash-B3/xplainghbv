# Phase 7 — Admin Platform, RBAC & Financial Reconciliation

## 1. Role-Based Access Control (RBAC)
The administrative platform enforces strict 4-tier RBAC:

| Role | Access Level | Capabilities |
|---|---|---|
| `INVESTOR` | User | Personal profile, investments, withdrawals, referrals, notifications |
| `SUPPORT` | Operational Support | Read-only inspection of users, investments, transactions, withdrawals |
| `ADMIN` | Financial Operations | Approve/reject withdrawals, complete settlement with proof, update user status |
| `SUPERADMIN` | System Administrator | Role management, reconciliation triggers, platform configuration |

### Strict Invariant: No Arbitrary Balance Modification
No role (including `SUPERADMIN`) has access to arbitrary balance-mutation endpoints (`PATCH /balance` or `POST /add-money` are strictly prohibited). All financial changes must originate from real events or compensating double-entry ledger transactions with structured audit logs.

---

## 2. Automated Financial Reconciliation Service
The `ReconciliationService` executes automated audits checking:
1. **Global Debits vs Credits**: Verifies $\sum \text{Debits} == \sum \text{Credits}$ across all `LedgerEntry` records.
2. **Platform Escrow Balance**: Audits net platform cash position against total commitments.
3. **Locked Capital Reconciliation**: Reconciles total active investment batches against `LOCKED_CAPITAL` accounts.
4. **Withdrawal Reservation Integrity**: Reconciles `WITHDRAWAL_RESERVED` account balances against pending/approved/processing withdrawal amounts.
