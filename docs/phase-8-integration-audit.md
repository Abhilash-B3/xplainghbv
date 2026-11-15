# Phase 8.2 — Frontend $\leftrightarrow$ Backend Integration Audit

## 1. End-to-End API Route & Service Mapping

Every user-facing and administrative interface in the frontend communicates strictly with real backend endpoints via `apiClient`:

| Domain | Frontend Service | HTTP Method & Endpoint | Backend Controller & Service | Invariants Verified |
|---|---|---|---|---|
| **Auth** | `authService.register` | `POST /api/v1/auth/register` | `AuthController.register` | Password hashed with Argon2id, atomic PartnerProfile & referral check. |
| **Auth** | `authService.login` | `POST /api/v1/auth/login` | `AuthController.login` | Server session cookie `xplain_session` issued (HttpOnly). |
| **Auth** | `authService.logout` | `POST /api/v1/auth/logout` | `AuthController.logout` | Server session invalidated, cookie cleared. |
| **Products** | `productService.getAllProducts` | `GET /api/v1/products` | `ProductController.list` | Real PostgreSQL product catalog returned. |
| **Products** | `productService.getCategories` | `GET /api/v1/products/categories` | `ProductController.categories` | Real category list. |
| **Investments** | `investmentService.getQuote` | `POST /api/v1/investments/quote` | `InvestmentController.quote` | Server-authoritative quote, frozen pricing, 15-min TTL. |
| **Investments** | `investmentService.createInvestment` | `POST /api/v1/investments` | `InvestmentController.create` | Atomic PostgreSQL transaction, stock decrement, pending status. |
| **Payments** | `StripePaymentElement` | `POST /api/v1/payments/create-intent` | `StripeController.createPaymentIntent` | Real Stripe PaymentIntent created with frozen EUR amount. |
| **Payments** | `webhook.routes` | `POST /api/v1/webhooks/stripe` | `WebhookController.handleStripe` | Cryptographic signature verification, idempotent activation. |
| **Financials** | `investmentService.getMyFinancialSummary` | `GET /api/v1/users/me/financial-summary` | `UserController.getFinancialSummary` | Authoritative summary derived from double-entry ledger. |
| **Withdrawals** | `withdrawalService.getBalance` | `GET /api/v1/withdrawals/balance` | `WithdrawalController.getBalance` | `AVAILABLE_RETURNS + UNLOCKED_CAPITAL` without double-subtraction. |
| **Withdrawals** | `withdrawalService.requestWithdrawal` | `POST /api/v1/withdrawals` | `WithdrawalController.request` | Atomic reservation `AVAILABLE_RETURNS` $\rightarrow$ `WITHDRAWAL_RESERVED`. |
| **Withdrawals** | `withdrawalService.cancelWithdrawal` | `POST /api/v1/withdrawals/:id/cancel` | `WithdrawalController.cancel` | Releases reservation back to `AVAILABLE_RETURNS`. |
| **Destinations** | `destinationService.listBankAccounts` | `GET /api/v1/bank-accounts` | `DestinationController.listBanks` | Masked bank accounts (`•••• 7890`). |
| **Destinations** | `destinationService.listMoMoAccounts` | `GET /api/v1/momo-accounts` | `DestinationController.listMoMo` | Masked MoMo phone numbers (`•••• 5678`). |
| **Referrals** | `referralService.getSummary` | `GET /api/v1/referrals/summary` | `ReferralController.getSummary` | Active referee counts, 3% monthly bonus projection. |
| **Notifications**| `notificationService.getNotifications` | `GET /api/v1/notifications` | `NotificationController.list` | Paginated in-app notifications. |
| **Notifications**| `notificationService.getUnreadCount` | `GET /api/v1/notifications/unread-count` | `NotificationController.unreadCount`| Navbar badge count. |
| **Admin** | `adminService.getUsers` | `GET /api/v1/admin/users` | `AdminController.getUsers` | RBAC gated (`ADMIN`/`SUPERADMIN`/`SUPPORT`). |
| **Admin** | `adminService.completeWithdrawal` | `POST /api/v1/admin/withdrawals/:id/complete` | `AdminController.completeWithdrawal` | Requires verified settlement reference & proof. |
| **Admin** | `adminService.getReconciliationReport` | `GET /api/v1/admin/reconciliation/report` | `AdminController.getReconciliationReport`| Automated ledger reconciliation audit. |

---

## 2. Error, Loading & Empty State Handling
- All frontend components display dedicated loading spinners, honest empty states, and descriptive error messages upon API failure.
- No frontend fallback manufactures fake financial data when an API call fails.
