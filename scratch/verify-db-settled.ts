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
  const tx = await prisma.paymentTransaction.findUnique({
    where: { id: '359bdf9d-db6d-47ff-a28e-9f691d33d170' },
    include: {
      investment: {
        include: {
          batch: true,
          items: true
        }
      },
      partnerProfile: true
    }
  });

  console.log('Database Status for your 1 EUR Payment:');
  console.log('Transaction Status:', tx.status);
  console.log('Stripe Status:', tx.stripePaymentStatus);
  console.log('Paid At:', tx.paidAt);
  console.log('Investment Status:', tx.investment?.status);
  console.log('Investment Plan:', tx.investment?.resalePlan);
  console.log('Partner Name:', tx.partnerProfile?.fullName);
  console.log('Items:', tx.investment?.items?.map(i => i.productName));
}

main().catch(console.error).finally(() => prisma.$disconnect());
