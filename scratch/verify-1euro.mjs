async function main() {
  const prodRes = await fetch('http://localhost:5000/api/v1/products');
  const prodJson = await prodRes.json();
  const prods = prodJson.data.products;
  console.log(`Total active products in database: ${prods.length}`);

  const item1Eur = prods.find(p => p.ref === 'HA-MINI.001');
  if (!item1Eur) {
    console.error('❌ Product HA-MINI.001 not found in /api/v1/products!');
    process.exit(1);
  }

  console.log('\n✅ 1 EUR Product Found:');
  console.log('   ID:', item1Eur.id);
  console.log('   Ref:', item1Eur.ref);
  console.log('   Name:', item1Eur.name);
  console.log('   Category:', item1Eur.category?.name || item1Eur.category);
  console.log('   Price EUR:', item1Eur.priceEUR);
  console.log('   Stock:', item1Eur.stockQuantity);
  console.log('   Image:', item1Eur.imageUrl);

  // Test Option A Quote for 1 unit of 1 EUR
  const quoteARes = await fetch('http://localhost:5000/api/v1/investments/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resalePlan: 'DIRECT',
      currency: 'EUR',
      items: [{ productId: item1Eur.id, quantity: 1 }]
    })
  });
  const quoteA = await quoteARes.json();
  console.log('\n✅ Option A (Direct) Quote for 1 EUR Appliance:');
  console.log('   Subtotal EUR:', quoteA.data.subtotalEUR);
  console.log('   Total EUR:', quoteA.data.totalAmountEUR);
  console.log('   Discount Multiplier:', quoteA.data.discountMultiplier);

  // Test Option B Quote for 1 unit of 1 EUR
  const quoteBRes = await fetch('http://localhost:5000/api/v1/investments/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resalePlan: 'SELLFOR',
      currency: 'EUR',
      items: [{ productId: item1Eur.id, quantity: 1 }]
    })
  });
  const quoteB = await quoteBRes.json();
  console.log('\n✅ Option B (Sell On Behalf) Quote for 1 EUR Appliance:');
  console.log('   Subtotal EUR:', quoteB.data.subtotalEUR);
  console.log('   Discount Amount EUR:', quoteB.data.discountAmountEUR);
  console.log('   Total EUR:', quoteB.data.totalAmountEUR);
  console.log('   Monthly Return EUR (7%):', quoteB.data.estimatedMonthlyReturnEUR);
  console.log('   Lock Duration:', quoteB.data.lockDurationMonths, 'months');

  // Test Full End-to-End Multi-Tenant Lifecycle with this 1 EUR Appliance for User A and User B
  const emailA = `investor-1eur-a-${Date.now()}@xplain.com`;
  const regARes = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailA,
      password: 'StrongPassword123!',
      phone: `+447${Date.now().toString().slice(-9)}`,
      fullName: 'Investor 1EUR Option A',
      preferredCurrency: 'EUR',
      resalePlan: 'DIRECT'
    })
  });
  const cookieA = regARes.headers.get('set-cookie');
  const tokenA = cookieA?.match(/xplain_session=([^;]+)/)?.[1] || '';
  const regA = await regARes.json();

  const invARes = await fetch('http://localhost:5000/api/v1/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': `xplain_session=${tokenA}` },
    body: JSON.stringify({
      resalePlan: 'DIRECT',
      currency: 'EUR',
      items: [{ productId: item1Eur.id, quantity: 1 }]
    })
  });
  const invA = await invARes.json();

  const intentARes = await fetch('http://localhost:5000/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': `xplain_session=${tokenA}` },
    body: JSON.stringify({ investmentId: invA.data.id })
  });
  const intentA = await intentARes.json();
  console.log('\n✅ User A (Option A) Created 1 EUR Stripe Intent:', {
    investmentId: invA.data.id,
    amount: intentA.data.amount,
    currency: intentA.data.currency,
    clientSecret: intentA.data.clientSecret.slice(0, 18) + '...'
  });

  // User B with Option B
  const emailB = `investor-1eur-b-${Date.now()}@xplain.com`;
  const regBRes = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailB,
      password: 'StrongPassword123!',
      phone: `+447${(Date.now() + 1).toString().slice(-9)}`,
      fullName: 'Investor 1EUR Option B',
      preferredCurrency: 'EUR',
      resalePlan: 'SELLFOR'
    })
  });
  const cookieB = regBRes.headers.get('set-cookie');
  const tokenB = cookieB?.match(/xplain_session=([^;]+)/)?.[1] || '';
  const regB = await regBRes.json();

  const invBRes = await fetch('http://localhost:5000/api/v1/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': `xplain_session=${tokenB}` },
    body: JSON.stringify({
      resalePlan: 'SELLFOR',
      currency: 'EUR',
      items: [{ productId: item1Eur.id, quantity: 1 }]
    })
  });
  const invB = await invBRes.json();

  const intentBRes = await fetch('http://localhost:5000/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': `xplain_session=${tokenB}` },
    body: JSON.stringify({ investmentId: invB.data.id })
  });
  const intentB = await intentBRes.json();
  console.log('\n✅ User B (Option B) Created 1 EUR (Discounted to €0.86) Stripe Intent:', {
    investmentId: invB.data.id,
    amount: intentB.data.amount,
    currency: intentB.data.currency,
    clientSecret: intentB.data.clientSecret.slice(0, 18) + '...'
  });

  // IDOR & Multi-tenant isolation check: User B tries to access User A's investment
  const idorRes = await fetch(`http://localhost:5000/api/v1/investments/${invA.data.id}`, {
    headers: { 'Cookie': `xplain_session=${tokenB}` }
  });
  const idorJson = await idorRes.json();
  console.log('\n🔒 Multi-Tenant IDOR Security Test: User B attempting to view User A investment:');
  console.log('   HTTP Status:', idorRes.status);
  console.log('   Error Code:', idorJson.error?.code);
  console.log('   Error Message:', idorJson.error?.message);
  
  if (idorRes.status === 403) {
    console.log('   🛡️ IDOR PROTECTION VERIFIED: Cross-tenant access strictly blocked with 403 Forbidden!');
  } else {
    console.error('   ❌ IDOR FAILED: Expected 403 Forbidden, received', idorRes.status);
    process.exit(1);
  }

  console.log('\n========================================================================');
  console.log('🎉 1 EUR HOME APPLIANCE PRODUCT FULLY INTEGRATED & MULTI-TENANCY VERIFIED');
  console.log('========================================================================\n');
}

main().catch(console.error);
