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

async function inspectAndClean() {
  console.log('🔍 Inspecting current database users...');
  const users = await prisma.user.findMany({
    include: {
      partnerProfile: {
        include: {
          investments: true,
          investmentBatches: true,
          financialAccounts: true,
        }
      }
    }
  });

  console.log(`Found ${users.length} users in database:`);
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      fullName: u.partnerProfile?.fullName,
      investmentsCount: u.partnerProfile?.investments.length || 0,
      batchesCount: u.partnerProfile?.investmentBatches.length || 0
    });
  }

  const keepEmail = 'abhilash1007.it@gmail.com';
  const userToKeep = users.find(u => u.email.toLowerCase() === keepEmail.toLowerCase());

  if (!userToKeep) {
    console.error(`❌ User ${keepEmail} not found in database! Aborting cleanup.`);
    return;
  }

  console.log(`\nTarget user to keep: ${userToKeep.email} (${userToKeep.partnerProfile?.fullName}) ID: ${userToKeep.id}`);

  const deleteUserIds = users.filter(u => u.email.toLowerCase() !== keepEmail.toLowerCase()).map(u => u.id);
  const deleteProfileIds = users.filter(u => u.email.toLowerCase() !== keepEmail.toLowerCase()).map(u => u.partnerProfile?.id).filter(Boolean) as string[];

  console.log(`Users to delete (${deleteUserIds.length}):`, users.filter(u => u.email.toLowerCase() !== keepEmail.toLowerCase()).map(u => u.email));

  // Perform clean deletion in transactional order
  await prisma.$transaction(async (tx) => {
    // 1. Delete Payouts for other users
    const deletedPayouts = await tx.payout.deleteMany({
      where: { partnerProfileId: { in: deleteProfileIds } }
    });
    console.log(`Deleted ${deletedPayouts.count} test payouts.`);

    // 2. Delete Batches for other users
    const deletedBatches = await tx.investmentBatch.deleteMany({
      where: { partnerProfileId: { in: deleteProfileIds } }
    });
    console.log(`Deleted ${deletedBatches.count} test batches.`);

    // 3. Delete Payment Transactions for other users
    const deletedPaymentTxs = await tx.paymentTransaction.deleteMany({
      where: { partnerProfileId: { in: deleteProfileIds } }
    });
    console.log(`Deleted ${deletedPaymentTxs.count} test payment transactions.`);

    // 4. Delete Investment Items for other users
    const otherInvestments = await tx.investment.findMany({
      where: { partnerProfileId: { in: deleteProfileIds } },
      select: { id: true }
    });
    const otherInvestmentIds = otherInvestments.map(i => i.id);

    const deletedItems = await tx.investmentItem.deleteMany({
      where: { investmentId: { in: otherInvestmentIds } }
    });
    console.log(`Deleted ${deletedItems.count} test investment items.`);

    // 5. Delete Investments for other users
    const deletedInvestments = await tx.investment.deleteMany({
      where: { partnerProfileId: { in: deleteProfileIds } }
    });
    console.log(`Deleted ${deletedInvestments.count} test investments.`);

    // 6. Delete Ledger entries for test accounts
    const testAccounts = await tx.financialAccount.findMany({
      where: { partnerProfileId: { in: deleteProfileIds } },
      select: { id: true }
    });
    const testAccountIds = testAccounts.map(a => a.id);

    const deletedLedgerEntries = await tx.ledgerEntry.deleteMany({
      where: { accountId: { in: testAccountIds } }
    });
    console.log(`Deleted ${deletedLedgerEntries.count} test ledger entries.`);

    // 7. Delete Financial Accounts for other users
    const deletedFinancialAccounts = await tx.financialAccount.deleteMany({
      where: { partnerProfileId: { in: deleteProfileIds } }
    });
    console.log(`Deleted ${deletedFinancialAccounts.count} test financial accounts.`);

    // 8. Delete Referrals & Commissions for other users
    await tx.referralCommission.deleteMany({
      where: {
        OR: [
          { referrerProfileId: { in: deleteProfileIds } },
          { refereeProfileId: { in: deleteProfileIds } }
        ]
      }
    });

    await tx.referral.deleteMany({
      where: {
        OR: [
          { referrerProfileId: { in: deleteProfileIds } },
          { refereeProfileId: { in: deleteProfileIds } }
        ]
      }
    });

    // 9. Delete Bank & MoMo accounts for other users
    await tx.bankAccount.deleteMany({ where: { partnerProfileId: { in: deleteProfileIds } } });
    await tx.moMoAccount.deleteMany({ where: { partnerProfileId: { in: deleteProfileIds } } });
    await tx.address.deleteMany({ where: { partnerProfileId: { in: deleteProfileIds } } });

    // 10. Delete Notifications & Preferences for other users
    await tx.notification.deleteMany({ where: { userId: { in: deleteUserIds } } });
    await tx.notificationPreference.deleteMany({ where: { userId: { in: deleteUserIds } } });
    await tx.auditLog.deleteMany({ where: { userId: { in: deleteUserIds } } });
    await tx.session.deleteMany({ where: { userId: { in: deleteUserIds } } });
    await tx.passwordResetToken.deleteMany({ where: { userId: { in: deleteUserIds } } });
    await tx.emailVerificationToken.deleteMany({ where: { userId: { in: deleteUserIds } } });

    // 11. Delete Partner Profiles
    const deletedProfiles = await tx.partnerProfile.deleteMany({
      where: { id: { in: deleteProfileIds } }
    });
    console.log(`Deleted ${deletedProfiles.count} test partner profiles.`);

    // 12. Delete Users
    const deletedUsers = await tx.user.deleteMany({
      where: { id: { in: deleteUserIds } }
    });
    console.log(`Deleted ${deletedUsers.count} test users.`);
  });

  console.log('\n✨ Database cleaned successfully!');

  // Verify remaining users
  const remaining = await prisma.user.findMany({
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

  console.log(`\nFinal Users remaining in Database (${remaining.length}):`);
  for (const u of remaining) {
    console.log({
      id: u.id,
      email: u.email,
      fullName: u.partnerProfile?.fullName,
      role: u.role,
      investments: u.partnerProfile?.investments.map(i => ({
        id: i.id,
        plan: i.resalePlan,
        status: i.status,
        amountEUR: i.totalAmountEUR.toString(),
        items: i.items.map(it => it.productName),
        paymentStatus: i.paymentTransactions.map(p => p.status)
      }))
    });
  }
}

inspectAndClean().catch(console.error).finally(() => prisma.$disconnect());
