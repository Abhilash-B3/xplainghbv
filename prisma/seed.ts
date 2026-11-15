import {
  PrismaClient,
  Currency,
  UserRole,
  AccountStatus,
  AccountType,
  DocumentStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

import {
  XPLAIN_PRODUCTS,
  PRODUCT_CATEGORIES,
  APPLIANCES,
} from '../src/data/homeAppliances';

import { LEGAL_CONTENT } from '../src/constants/legalContent';

import {
  EUR_TO_GBP,
  EUR_TO_GHS,
  GBP_TO_GHS,
  GHS_TO_EUR,
  GHS_TO_GBP,
  GBP_TO_EUR,
} from '../src/utils/currency';

/**
 * Xplain GH BV
 * Production Database Seed
 *
 * IMPORTANT:
 * - This seed is designed to be safe for the production database.
 * - It does NOT create demo investor/partner accounts.
 * - It does NOT contain a default password or password hash.
 * - The production superadmin credentials MUST be supplied through
 *   environment variables.
 *
 * Required for the production admin:
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD_HASH
 *   SEED_ADMIN_PHONE
 *
 * Example:
 *   SEED_ADMIN_EMAIL=admin@xplainghbv.com
 *   SEED_ADMIN_PASSWORD_HASH=<argon2 hash>
 *   SEED_ADMIN_PHONE=+44...
 */

//
// Load local .env when running locally.
//
// Existing environment variables take precedence, so when DATABASE_URL
// is supplied through PowerShell/Hostinger it will not be replaced by .env.
//
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required. Refusing to run database seed without a database connection.'
  );
}

const pool = new pg.Pool({
  connectionString,
  max: 10,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

/**
 * Seed product categories.
 */
async function seedProductCategories(): Promise<void> {
  console.log('📦 Seeding Product Categories...');

  const categoryMap = new Map<string, string>();

  for (let i = 0; i < PRODUCT_CATEGORIES.length; i++) {
    const catName = PRODUCT_CATEGORIES[i];

    // "All" is a frontend filter and should not be stored as a category.
    if (catName === 'All') {
      continue;
    }

    const slug = catName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = await prisma.productCategory.upsert({
      where: {
        slug,
      },

      update: {
        name: catName,
        displayOrder: i,
        isActive: true,
      },

      create: {
        name: catName,
        slug,
        displayOrder: i,
        isActive: true,
      },
    });

    categoryMap.set(catName, category.id);
  }

  // Deactivate categories that are no longer part of the official catalog.
  const activeSlugs = PRODUCT_CATEGORIES
    .filter((category) => category !== 'All')
    .map((category) =>
      category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );

  if (activeSlugs.length > 0) {
    await prisma.productCategory.updateMany({
      where: {
        slug: {
          notIn: activeSlugs,
        },
      },

      data: {
        isActive: false,
      },
    });
  }

  console.log(
    `✅ Product categories seeded: ${categoryMap.size}`
  );
}

/**
 * Seed official products.
 */
async function seedProducts(): Promise<void> {
  console.log('🛒 Seeding Authentic Figma Products...');

  const activeRefs = XPLAIN_PRODUCTS.map((product) => product.ref);

  let seededCount = 0;

  for (const product of XPLAIN_PRODUCTS) {
    const categoryId = await getProductCategoryId(product.category);

    if (!categoryId) {
      console.warn(
        `⚠️ Category "${product.category}" not found for product "${product.name}". Skipping product.`
      );

      continue;
    }

    await prisma.product.upsert({
      where: {
        ref: product.ref,
      },

      update: {
        name: product.name,
        categoryId,
        priceEUR: product.priceEUR,
        imageUrl: product.img,
        stockQuantity: product.stockQuantity || 50,
        isActive: true,
      },

      create: {
        ref: product.ref,
        name: product.name,
        categoryId,
        priceEUR: product.priceEUR,
        imageUrl: product.img,
        stockQuantity: product.stockQuantity || 50,
        isActive: true,
      },
    });

    seededCount++;
  }

  // Deactivate legacy products that are no longer part of the official catalog.
  if (activeRefs.length > 0) {
    await prisma.product.updateMany({
      where: {
        ref: {
          notIn: activeRefs,
        },
      },

      data: {
        isActive: false,
      },
    });
  }

  console.log(
    `✅ Products seeded/updated: ${seededCount}`
  );
}

/**
 * Resolve product category ID by its normalized slug.
 */
async function getProductCategoryId(
  categoryName: string
): Promise<string | null> {
  const category = await prisma.productCategory.findUnique({
    where: {
      slug: categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    },

    select: {
      id: true,
    },
  });

  return category?.id ?? null;
}

/**
 * Seed showcase appliances.
 */
async function seedShowcaseAppliances(): Promise<void> {
  console.log('✨ Seeding Showcase Appliances...');

  let seededCount = 0;

  for (let i = 0; i < APPLIANCES.length; i++) {
    const appliance = APPLIANCES[i];

    const existing = await prisma.showcaseAppliance.findFirst({
      where: {
        name: appliance.name,
      },
    });

    if (existing) {
      await prisma.showcaseAppliance.update({
        where: {
          id: existing.id,
        },

        data: {
          desc: appliance.desc,
          imageUrl: appliance.img,
          tag: appliance.tag,
          displayOrder: i,
          isActive: true,
        },
      });
    } else {
      await prisma.showcaseAppliance.create({
        data: {
          name: appliance.name,
          desc: appliance.desc,
          imageUrl: appliance.img,
          tag: appliance.tag,
          displayOrder: i,
          isActive: true,
        },
      });
    }

    seededCount++;
  }

  console.log(
    `✅ Showcase appliances seeded/updated: ${seededCount}`
  );
}

/**
 * Seed initial exchange rates.
 *
 * Existing exchange-rate snapshots are preserved.
 * This prevents repeated seed executions from creating duplicate
 * baseline snapshots for the same currency pair/source.
 */
async function seedExchangeRates(): Promise<void> {
  console.log('💱 Seeding Initial Exchange Rates...');

  const rates = [
    {
      base: Currency.EUR,
      quote: Currency.GBP,
      rate: EUR_TO_GBP,
    },

    {
      base: Currency.EUR,
      quote: Currency.GHS,
      rate: EUR_TO_GHS,
    },

    {
      base: Currency.GBP,
      quote: Currency.EUR,
      rate: GBP_TO_EUR,
    },

    {
      base: Currency.GBP,
      quote: Currency.GHS,
      rate: GBP_TO_GHS,
    },

    {
      base: Currency.GHS,
      quote: Currency.EUR,
      rate: GHS_TO_EUR,
    },

    {
      base: Currency.GHS,
      quote: Currency.GBP,
      rate: GHS_TO_GBP,
    },
  ];

  const source = 'PLATFORM_TREASURY_BASE';

  let createdCount = 0;
  let existingCount = 0;

  for (const rate of rates) {
    const existing = await prisma.exchangeRateSnapshot.findFirst({
      where: {
        baseCurrency: rate.base,
        quoteCurrency: rate.quote,
        source,
      },

      orderBy: {
        effectiveAt: 'desc',
      },
    });

    if (existing) {
      existingCount++;
      continue;
    }

    await prisma.exchangeRateSnapshot.create({
      data: {
        baseCurrency: rate.base,
        quoteCurrency: rate.quote,
        rate: rate.rate,
        source,
        effectiveAt: new Date(),
      },
    });

    createdCount++;
  }

  console.log(
    `✅ Exchange rates: ${createdCount} created, ${existingCount} already existed`
  );
}

/**
 * Seed legal documents and their initial versions.
 */
async function seedLegalDocuments(): Promise<void> {
  console.log('📜 Seeding Legal Documents...');

  let documentCount = 0;
  let versionCount = 0;

  for (const [slug, document] of Object.entries(LEGAL_CONTENT)) {
    const legalDocument = await prisma.legalDocument.upsert({
      where: {
        slug,
      },

      update: {
        title: document.title,
        status: DocumentStatus.PUBLISHED,
      },

      create: {
        slug,
        title: document.title,
        status: DocumentStatus.PUBLISHED,
      },
    });

    documentCount++;

    const existingVersion = await prisma.legalVersion.findUnique({
      where: {
        documentId_versionNumber: {
          documentId: legalDocument.id,
          versionNumber: 1,
        },
      },
    });

    if (existingVersion) {
      await prisma.legalVersion.update({
        where: {
          id: existingVersion.id,
        },

        data: {
          content: document.sections as any,
          isCurrent: true,
        },
      });
    } else {
      await prisma.legalVersion.create({
        data: {
          documentId: legalDocument.id,
          versionNumber: 1,
          content: document.sections as any,
          isCurrent: true,
          effectiveDate: new Date('2026-09-01'),
        },
      });

      versionCount++;
    }
  }

  console.log(
    `✅ Legal documents processed: ${documentCount}; new versions created: ${versionCount}`
  );
}

/**
 * Seed platform-level financial accounts.
 *
 * These accounts intentionally have no partnerProfileId because
 * they belong to the platform treasury/accounting layer.
 */
async function seedPlatformFinancialAccounts(): Promise<void> {
  console.log('🏦 Seeding Platform Financial Accounts...');

  const platformAccountTypes = [
    AccountType.PLATFORM_ESCROW,
    AccountType.PLATFORM_REVENUE,
    AccountType.REFERRAL_BONUS_PAYABLE,
  ];

  let createdCount = 0;
  let existingCount = 0;

  for (const accountType of platformAccountTypes) {
    const existing = await prisma.financialAccount.findFirst({
      where: {
        partnerProfileId: null,
        accountType,
      },
    });

    if (existing) {
      existingCount++;
      continue;
    }

    await prisma.financialAccount.create({
      data: {
        partnerProfileId: null,
        accountType,
        currency: Currency.EUR,
      },
    });

    createdCount++;
  }

  console.log(
    `✅ Platform financial accounts: ${createdCount} created, ${existingCount} already existed`
  );
}

/**
 * Configure the single production superadmin.
 *
 * IMPORTANT:
 * The User model requires phone, therefore SEED_ADMIN_PHONE
 * is mandatory.
 *
 * No default credentials are generated here.
 */
async function seedProductionSuperadmin(): Promise<void> {
  console.log('👤 Configuring Production Superadmin...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();

  const adminPasswordHash =
    process.env.SEED_ADMIN_PASSWORD_HASH?.trim();

  const adminPhone =
    process.env.SEED_ADMIN_PHONE?.trim();

  if (!adminEmail) {
    throw new Error(
      'SEED_ADMIN_EMAIL is required. Refusing to create a production superadmin without an explicit admin email.'
    );
  }

  if (!adminPasswordHash) {
    throw new Error(
      'SEED_ADMIN_PASSWORD_HASH is required. Refusing to create/update a production superadmin without an explicit Argon2 password hash.'
    );
  }

  if (!adminPhone) {
    throw new Error(
      'SEED_ADMIN_PHONE is required. The Prisma User model requires a phone number for every user.'
    );
  }

  if (!adminEmail.includes('@')) {
    throw new Error(
      'SEED_ADMIN_EMAIL does not appear to be a valid email address.'
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },

      data: {
        passwordHash: adminPasswordHash,
        role: UserRole.SUPERADMIN,
        status: AccountStatus.ACTIVE,
        phone: adminPhone,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    console.log(
      `✅ Existing production superadmin updated: ${adminEmail}`
    );
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: UserRole.SUPERADMIN,
        status: AccountStatus.ACTIVE,
        phone: adminPhone,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    console.log(
      `✅ Production superadmin created: ${adminEmail}`
    );
  }

  console.log(
    '🔒 Demo investor/partner accounts are intentionally NOT created.'
  );
}

/**
 * Verify that Prisma can communicate with the configured database.
 */
async function verifyDatabaseConnection(): Promise<void> {
  console.log('🔌 Verifying database connection...');

  await prisma.$queryRaw`SELECT 1`;

  console.log('✅ Database connection verified.');
}

/**
 * Main seed process.
 */
async function main(): Promise<void> {
  console.log('');
  console.log('======================================================');
  console.log(' Xplain GH BV - Production Database Seed');
  console.log('======================================================');
  console.log('');

  await verifyDatabaseConnection();

  console.log('');
  console.log('Starting production-safe database seed...');
  console.log('');

  // 1. Product categories
  await seedProductCategories();

  console.log('');

  // 2. Products
  await seedProducts();

  console.log('');

  // 3. Showcase appliances
  await seedShowcaseAppliances();

  console.log('');

  // 4. Initial exchange rates
  await seedExchangeRates();

  console.log('');

  // 5. Legal documents
  await seedLegalDocuments();

  console.log('');

  // 6. Platform financial accounts
  await seedPlatformFinancialAccounts();

  console.log('');

  // 7. Production superadmin
  await seedProductionSuperadmin();

  console.log('');
  console.log('======================================================');
  console.log(' ✅ DATABASE SEED COMPLETED SUCCESSFULLY');
  console.log('======================================================');
  console.log('');
  console.log('Production baseline data has been seeded.');
  console.log('Demo investor/partner data was NOT created.');
  console.log('');
}

main()
  .catch((error) => {
    console.error('');
    console.error('======================================================');
    console.error(' ❌ DATABASE SEED FAILED');
    console.error('======================================================');
    console.error('');
    console.error(error);
    console.error('');

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });