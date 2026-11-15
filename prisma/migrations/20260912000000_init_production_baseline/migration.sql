-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INVESTOR', 'ADMIN', 'SUPPORT', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'GBP', 'GHS');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MOMO', 'VISA');

-- CreateEnum
CREATE TYPE "ResalePlan" AS ENUM ('DIRECT', 'SELLFOR');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('INTENT_CREATED', 'PAYMENT_PENDING', 'ACTIVE', 'FULFILLED', 'MATURED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'MATURED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('SCHEDULED', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "WithdrawalType" AS ENUM ('RETURNS', 'CAPITAL');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('MOMO', 'BANK');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MTN_MOMO', 'VODAFONE_CASH', 'AIRTELTIGO_MONEY', 'MANUAL_BANK');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'PAYOUT', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIALIZED', 'PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('REGISTERED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('CALCULATED', 'PENDING_PAYOUT', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('AVAILABLE_RETURNS', 'LOCKED_CAPITAL', 'UNLOCKED_CAPITAL', 'WITHDRAWAL_RESERVED', 'PLATFORM_ESCROW', 'PLATFORM_REVENUE', 'REFERRAL_BONUS_PAYABLE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'SECURITY', 'INVESTMENT', 'PAYOUT', 'WITHDRAWAL', 'REFERRAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'INVESTOR',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" VARCHAR(128) NOT NULL,
    "preferredCurrency" "Currency" NOT NULL DEFAULT 'EUR',
    "defaultPaymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MOMO',
    "resalePlan" "ResalePlan",
    "referralCode" VARCHAR(16) NOT NULL,
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "fullName" VARCHAR(128) NOT NULL,
    "line1" VARCHAR(255) NOT NULL,
    "line2" VARCHAR(255),
    "city" VARCHAR(128) NOT NULL,
    "postcode" VARCHAR(32) NOT NULL,
    "country" VARCHAR(128) NOT NULL,
    "phone" VARCHAR(32),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "ref" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "priceEUR" DECIMAL(12,2) NOT NULL,
    "imageUrl" VARCHAR(512) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showcase_appliances" (
    "id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "desc" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(512) NOT NULL,
    "tag" VARCHAR(32) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "showcase_appliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "resalePlan" "ResalePlan" NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'INTENT_CREATED',
    "currency" "Currency" NOT NULL,
    "subtotalInCurrency" DECIMAL(14,2) NOT NULL,
    "discountAmountInCurrency" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmountInCurrency" DECIMAL(14,2) NOT NULL,
    "totalAmountEUR" DECIMAL(14,2) NOT NULL,
    "exchangeRateToEUR" DECIMAL(18,8) NOT NULL,
    "deliveryAddressId" UUID,
    "idempotencyKey" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_items" (
    "id" UUID NOT NULL,
    "investmentId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productRef" VARCHAR(32) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "unitPriceEUR" DECIMAL(12,2) NOT NULL,
    "discountMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "lineTotalEUR" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_batches" (
    "id" UUID NOT NULL,
    "investmentId" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "batchNumber" INTEGER NOT NULL DEFAULT 1,
    "capitalEUR" DECIMAL(14,2) NOT NULL,
    "monthlyReturnRate" DECIMAL(5,4) NOT NULL DEFAULT 0.0700,
    "discountMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 0.86,
    "lockDurationMonths" INTEGER NOT NULL DEFAULT 12,
    "startDate" DATE NOT NULL,
    "firstPayoutDate" DATE NOT NULL,
    "capitalUnlockDate" DATE NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "investment_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "payoutIndex" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "amountEUR" DECIMAL(14,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'SCHEDULED',
    "paidAt" TIMESTAMPTZ(6),
    "paymentTransactionId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "referenceNumber" VARCHAR(64) NOT NULL,
    "investmentId" UUID,
    "partnerProfileId" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerTransactionId" VARCHAR(128),
    "stripePaymentIntentId" VARCHAR(128),
    "stripeCustomerId" VARCHAR(128),
    "stripePaymentStatus" VARCHAR(64),
    "stripeLatestEventId" VARCHAR(128),
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "canonicalAmountEUR" DECIMAL(14,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INITIALIZED',
    "paidAt" TIMESTAMPTZ(6),
    "failureCode" VARCHAR(64),
    "failureMessage" TEXT,
    "idempotencyKey" VARCHAR(64),
    "providerMetadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_payment_events" (
    "id" UUID NOT NULL,
    "eventId" VARCHAR(128) NOT NULL,
    "eventType" VARCHAR(64) NOT NULL,
    "paymentIntentId" VARCHAR(128),
    "status" VARCHAR(32) NOT NULL DEFAULT 'PROCESSED',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "withdrawalType" "WithdrawalType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amountEUR" DECIMAL(14,2) NOT NULL,
    "destinationType" "DestinationType" NOT NULL,
    "bankAccountId" UUID,
    "moMoAccountId" UUID,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedByUserId" UUID,
    "settlementReference" VARCHAR(128),
    "settlementProof" JSONB,
    "failureCode" VARCHAR(64),
    "processedAt" TIMESTAMPTZ(6),
    "idempotencyKey" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(128) NOT NULL,
    "message" TEXT NOT NULL,
    "eventKey" VARCHAR(128),
    "readAt" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "emailInvestments" BOOLEAN NOT NULL DEFAULT true,
    "emailPayouts" BOOLEAN NOT NULL DEFAULT true,
    "emailWithdrawals" BOOLEAN NOT NULL DEFAULT true,
    "emailReferrals" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "inAppSecurity" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "bankName" VARCHAR(128) NOT NULL,
    "accountNumberMasked" VARCHAR(32) NOT NULL,
    "accountNumberEncrypted" TEXT NOT NULL,
    "sortCodeOrSwift" VARCHAR(32) NOT NULL,
    "accountHolderName" VARCHAR(128) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "country" VARCHAR(64) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "momo_accounts" (
    "id" UUID NOT NULL,
    "partnerProfileId" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MTN_MOMO',
    "phoneNumberMasked" VARCHAR(32) NOT NULL,
    "phoneNumberEncrypted" TEXT NOT NULL,
    "accountHolderName" VARCHAR(128) NOT NULL,
    "country" VARCHAR(64) NOT NULL DEFAULT 'GH',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "momo_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "referrerProfileId" UUID NOT NULL,
    "refereeProfileId" UUID NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'REGISTERED',
    "attributionDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_commissions" (
    "id" UUID NOT NULL,
    "referralId" UUID NOT NULL,
    "referrerProfileId" UUID NOT NULL,
    "refereeProfileId" UUID NOT NULL,
    "periodMonth" VARCHAR(7) NOT NULL,
    "refereeCapitalEUR" DECIMAL(14,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.0300,
    "commissionAmountEUR" DECIMAL(14,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'CALCULATED',
    "paidAt" TIMESTAMPTZ(6),
    "paymentTransactionId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "referral_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" UUID NOT NULL,
    "partnerProfileId" UUID,
    "accountType" "AccountType" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_transactions" (
    "id" UUID NOT NULL,
    "referenceNumber" VARCHAR(64) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "sourceEntity" VARCHAR(64) NOT NULL,
    "sourceEntityId" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "amount" DECIMAL(14,4) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amountEUR" DECIMAL(14,4) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rate_snapshots" (
    "id" UUID NOT NULL,
    "baseCurrency" "Currency" NOT NULL DEFAULT 'EUR',
    "quoteCurrency" "Currency" NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "source" VARCHAR(64) NOT NULL DEFAULT 'PLATFORM_TREASURY',
    "effectiveAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rate_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_versions" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "effectiveDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_terms_acceptances" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "legalVersionId" UUID NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "acceptedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_terms_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" VARCHAR(64) NOT NULL,
    "entityType" VARCHAR(64) NOT NULL,
    "entityId" VARCHAR(64) NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_userId_key" ON "partner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_referralCode_key" ON "partner_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "partner_profiles_referralCode_idx" ON "partner_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "partner_profiles_preferredCurrency_idx" ON "partner_profiles"("preferredCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_tokenHash_idx" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_tokenHash_idx" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_tokenHash_key" ON "email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "email_verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "email_verification_tokens_tokenHash_idx" ON "email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_expiresAt_idx" ON "email_verification_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "addresses_partnerProfileId_idx" ON "addresses"("partnerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "product_categories_slug_idx" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "product_categories_isActive_idx" ON "product_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_ref_key" ON "products"("ref");

-- CreateIndex
CREATE INDEX "products_ref_idx" ON "products"("ref");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- CreateIndex
CREATE INDEX "showcase_appliances_isActive_displayOrder_idx" ON "showcase_appliances"("isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "investments_idempotencyKey_key" ON "investments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "investments_partnerProfileId_idx" ON "investments"("partnerProfileId");

-- CreateIndex
CREATE INDEX "investments_status_idx" ON "investments"("status");

-- CreateIndex
CREATE INDEX "investments_createdAt_idx" ON "investments"("createdAt");

-- CreateIndex
CREATE INDEX "investment_items_investmentId_idx" ON "investment_items"("investmentId");

-- CreateIndex
CREATE INDEX "investment_items_productId_idx" ON "investment_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "investment_batches_investmentId_key" ON "investment_batches"("investmentId");

-- CreateIndex
CREATE INDEX "investment_batches_partnerProfileId_idx" ON "investment_batches"("partnerProfileId");

-- CreateIndex
CREATE INDEX "investment_batches_status_idx" ON "investment_batches"("status");

-- CreateIndex
CREATE INDEX "investment_batches_capitalUnlockDate_idx" ON "investment_batches"("capitalUnlockDate");

-- CreateIndex
CREATE INDEX "payouts_partnerProfileId_idx" ON "payouts"("partnerProfileId");

-- CreateIndex
CREATE INDEX "payouts_dueDate_status_idx" ON "payouts"("dueDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_batchId_payoutIndex_key" ON "payouts"("batchId", "payoutIndex");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_referenceNumber_key" ON "payment_transactions"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_providerTransactionId_key" ON "payment_transactions"("providerTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_stripePaymentIntentId_key" ON "payment_transactions"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_idempotencyKey_key" ON "payment_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payment_transactions_partnerProfileId_idx" ON "payment_transactions"("partnerProfileId");

-- CreateIndex
CREATE INDEX "payment_transactions_referenceNumber_idx" ON "payment_transactions"("referenceNumber");

-- CreateIndex
CREATE INDEX "payment_transactions_stripePaymentIntentId_idx" ON "payment_transactions"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_createdAt_idx" ON "payment_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payment_events_eventId_key" ON "stripe_payment_events"("eventId");

-- CreateIndex
CREATE INDEX "stripe_payment_events_eventId_idx" ON "stripe_payment_events"("eventId");

-- CreateIndex
CREATE INDEX "stripe_payment_events_eventType_idx" ON "stripe_payment_events"("eventType");

-- CreateIndex
CREATE INDEX "stripe_payment_events_paymentIntentId_idx" ON "stripe_payment_events"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_idempotencyKey_key" ON "withdrawals"("idempotencyKey");

-- CreateIndex
CREATE INDEX "withdrawals_partnerProfileId_idx" ON "withdrawals"("partnerProfileId");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "withdrawals_createdAt_idx" ON "withdrawals"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_eventKey_key" ON "notifications"("eventKey");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "bank_accounts_partnerProfileId_idx" ON "bank_accounts"("partnerProfileId");

-- CreateIndex
CREATE INDEX "momo_accounts_partnerProfileId_idx" ON "momo_accounts"("partnerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_refereeProfileId_key" ON "referrals"("refereeProfileId");

-- CreateIndex
CREATE INDEX "referrals_referrerProfileId_idx" ON "referrals"("referrerProfileId");

-- CreateIndex
CREATE INDEX "referrals_refereeProfileId_idx" ON "referrals"("refereeProfileId");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referral_commissions_referrerProfileId_idx" ON "referral_commissions"("referrerProfileId");

-- CreateIndex
CREATE INDEX "referral_commissions_status_idx" ON "referral_commissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referral_commissions_referralId_periodMonth_key" ON "referral_commissions"("referralId", "periodMonth");

-- CreateIndex
CREATE INDEX "financial_accounts_partnerProfileId_idx" ON "financial_accounts"("partnerProfileId");

-- CreateIndex
CREATE INDEX "financial_accounts_accountType_idx" ON "financial_accounts"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "financial_accounts_partnerProfileId_accountType_key" ON "financial_accounts"("partnerProfileId", "accountType");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_transactions_referenceNumber_key" ON "ledger_transactions"("referenceNumber");

-- CreateIndex
CREATE INDEX "ledger_transactions_sourceEntity_sourceEntityId_idx" ON "ledger_transactions"("sourceEntity", "sourceEntityId");

-- CreateIndex
CREATE INDEX "ledger_transactions_referenceNumber_idx" ON "ledger_transactions"("referenceNumber");

-- CreateIndex
CREATE INDEX "ledger_transactions_createdAt_idx" ON "ledger_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "ledger_entries_transactionId_idx" ON "ledger_entries"("transactionId");

-- CreateIndex
CREATE INDEX "ledger_entries_accountId_idx" ON "ledger_entries"("accountId");

-- CreateIndex
CREATE INDEX "ledger_entries_createdAt_idx" ON "ledger_entries"("createdAt");

-- CreateIndex
CREATE INDEX "exchange_rate_snapshots_baseCurrency_quoteCurrency_effectiv_idx" ON "exchange_rate_snapshots"("baseCurrency", "quoteCurrency", "effectiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_slug_key" ON "legal_documents"("slug");

-- CreateIndex
CREATE INDEX "legal_documents_slug_idx" ON "legal_documents"("slug");

-- CreateIndex
CREATE INDEX "legal_versions_documentId_isCurrent_idx" ON "legal_versions"("documentId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "legal_versions_documentId_versionNumber_key" ON "legal_versions"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "user_terms_acceptances_userId_idx" ON "user_terms_acceptances"("userId");

-- CreateIndex
CREATE INDEX "user_terms_acceptances_legalVersionId_idx" ON "user_terms_acceptances"("legalVersionId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_items" ADD CONSTRAINT "investment_items_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_items" ADD CONSTRAINT "investment_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_batches" ADD CONSTRAINT "investment_batches_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_batches" ADD CONSTRAINT "investment_batches_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "investment_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_moMoAccountId_fkey" FOREIGN KEY ("moMoAccountId") REFERENCES "momo_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "momo_accounts" ADD CONSTRAINT "momo_accounts_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerProfileId_fkey" FOREIGN KEY ("referrerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_refereeProfileId_fkey" FOREIGN KEY ("refereeProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referrerProfileId_fkey" FOREIGN KEY ("referrerProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_refereeProfileId_fkey" FOREIGN KEY ("refereeProfileId") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "ledger_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_versions" ADD CONSTRAINT "legal_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_terms_acceptances" ADD CONSTRAINT "user_terms_acceptances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_terms_acceptances" ADD CONSTRAINT "user_terms_acceptances_legalVersionId_fkey" FOREIGN KEY ("legalVersionId") REFERENCES "legal_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

