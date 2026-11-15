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

async function cleanPending() {
  const pendingInv = await prisma.investment.findUnique({
    where: { id: 'b8e5c329-01b0-4933-be66-6aad5ba738fb' }
  });

  if (pendingInv && pendingInv.status === 'PAYMENT_PENDING') {
    await prisma.$transaction([
      prisma.paymentTransaction.deleteMany({ where: { investmentId: pendingInv.id } }),
      prisma.investmentItem.deleteMany({ where: { investmentId: pendingInv.id } }),
      prisma.investment.delete({ where: { id: pendingInv.id } })
    ]);
    console.log('Cleaned up pending draft investment.');
  }

  const finalUser = await prisma.user.findUnique({
    where: { email: 'abhilash1007.it@gmail.com' },
    include: {
      partnerProfile: {
        include: {
          investments: {
            include: {
              items: true,
              paymentTransactions: true
            }
          },
          financialAccounts: true,
        }
      }
    }
  });

  console.log('\nFinal User & Account State:');
  console.log({
    id: finalUser?.id,
    email: finalUser?.email,
    name: finalUser?.partnerProfile?.fullName,
    referralCode: finalUser?.partnerProfile?.referralCode,
    currency: finalUser?.partnerProfile?.preferredCurrency,
    financialAccountsCount: finalUser?.partnerProfile?.financialAccounts.length,
    activeInvestments: finalUser?.partnerProfile?.investments.map(i => ({
      id: i.id,
      plan: i.resalePlan,
      status: i.status,
      amountEUR: i.totalAmountEUR.toString(),
      item: i.items[0]?.productName,
      paymentStatus: i.paymentTransactions[0]?.status,
      paidAt: i.paymentTransactions[0]?.paidAt
    }))
  });
}

cleanPending().catch(console.error).finally(() => prisma.$disconnect());
