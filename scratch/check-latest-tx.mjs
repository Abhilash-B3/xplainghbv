import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/xplainghbv_db?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const latestTxs = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      investment: {
        include: {
          partnerProfile: true,
          batch: true
        }
      }
    }
  });

  console.log(`Found ${latestTxs.length} latest payment transactions:`);
  for (const tx of latestTxs) {
    console.log({
      id: tx.id,
      ref: tx.referenceNumber,
      status: tx.status,
      stripePaymentIntentId: tx.stripePaymentIntentId,
      amount: tx.amount.toString(),
      currency: tx.currency,
      investmentStatus: tx.investment?.status,
      partner: tx.investment?.partnerProfile?.fullName,
      batchExists: !!tx.investment?.batch
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
