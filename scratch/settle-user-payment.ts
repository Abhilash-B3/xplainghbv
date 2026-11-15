import { StripeService } from '../backend/src/services/stripe.service.js';
import { stripeClient } from '../backend/src/config/stripe.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const intentId = 'pi_3UFG9eGTjQWK7eQM3V73QtFM';
  console.log(`Retrieving Stripe PaymentIntent ${intentId}...`);
  const intent = await stripeClient.paymentIntents.retrieve(intentId);
  console.log('Intent details:', {
    id: intent.id,
    status: intent.status,
    amount: intent.amount / 100,
    currency: intent.currency,
    metadata: intent.metadata
  });

  console.log('\nSettling payment in PostgreSQL ledger & activating investment...');
  await StripeService.settleSuccessfulPayment(intent, `manual_settle_${intent.id}`);
  console.log('🎉 Succeeded! Payment is settled, investment is active, and ledger/payouts are posted.');
}

main().catch(console.error);
