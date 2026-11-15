import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { StripeService } from '../backend/src/services/stripe.service.js';
import { stripeClient } from '../backend/src/config/stripe.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/xplainghbv_db?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const pendingTxs = await prisma.paymentTransaction.findMany({
    where: {
      status: 'PENDING',
      stripePaymentIntentId: { not: null }
    },
    include: { investment: true }
  });

  console.log(`Found ${pendingTxs.length} pending transactions with Stripe PaymentIntent.`);

  for (const tx of pendingTxs) {
    console.log(`\nChecking Stripe status for Intent ${tx.stripePaymentIntentId} (Tx ${tx.id}, Partner ${tx.partnerProfileId})...`);
    try {
      const intent = await stripeClient.paymentIntents.retrieve(tx.stripePaymentIntentId);
      console.log(`Stripe Live Status: ${intent.status}, Amount: ${intent.amount / 100} ${intent.currency}`);

      if (intent.status === 'succeeded') {
        console.log(`Settling payment in PostgreSQL ledger for ${tx.id}...`);
        await StripeService.settleSuccessfulPayment(intent, `reconcile_${intent.id}`);
        console.log(`✅ Successfully settled! Investment is now ACTIVE and ledger accounts credited.`);
      } else {
        console.log(`PaymentIntent is in state "${intent.status}" (not succeeded yet).`);
      }
    } catch (err) {
      console.error(`Error checking intent ${tx.stripePaymentIntentId}:`, err.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
