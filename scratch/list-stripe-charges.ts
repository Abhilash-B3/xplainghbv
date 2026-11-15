import { stripeClient } from '../backend/src/config/stripe.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  console.log('Fetching latest 10 PaymentIntents directly from Stripe API...');
  const intents = await stripeClient.paymentIntents.list({ limit: 10 });
  console.log(`Found ${intents.data.length} PaymentIntents:`);
  for (const pi of intents.data) {
    console.log({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      created: new Date(pi.created * 1000).toISOString(),
      metadata: pi.metadata,
      description: pi.description,
      clientSecret: pi.client_secret?.slice(0, 15) + '...'
    });
  }
}

main().catch(console.error);
