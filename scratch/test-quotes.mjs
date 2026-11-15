async function main() {
  const prodRes = await fetch('http://localhost:5000/api/v1/products');
  const prodJson = await prodRes.json();
  console.log('Total products retrieved:', prodJson.data.products.length);
  
  const product = prodJson.data.products[0];
  console.log('Selected Product:', {
    name: product.name,
    ref: product.ref,
    category: product.category,
    priceEUR: product.priceEUR
  });

  // Test Option A (DIRECT)
  const quoteARes = await fetch('http://localhost:5000/api/v1/investments/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resalePlan: 'DIRECT',
      currency: 'EUR',
      items: [{ productId: product.id, quantity: 2 }]
    })
  });
  const quoteA = await quoteARes.json();
  console.log('\n--- Option A (Direct Shipment) Quote ---');
  console.log('Plan:', quoteA.data.resalePlan);
  console.log('Subtotal EUR:', quoteA.data.subtotalEUR);
  console.log('Discount Multiplier:', quoteA.data.discountMultiplier);
  console.log('Total EUR:', quoteA.data.totalAmountEUR);
  console.log('Monthly Return EUR:', quoteA.data.estimatedMonthlyReturnEUR);
  console.log('Lock Duration:', quoteA.data.lockDurationMonths, 'months');

  // Test Option B (SELLFOR)
  const quoteBRes = await fetch('http://localhost:5000/api/v1/investments/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resalePlan: 'SELLFOR',
      currency: 'EUR',
      items: [{ productId: product.id, quantity: 2 }]
    })
  });
  const quoteB = await quoteBRes.json();
  console.log('\n--- Option B (Sell On Your Behalf) Quote ---');
  console.log('Plan:', quoteB.data.resalePlan);
  console.log('Subtotal EUR:', quoteB.data.subtotalEUR);
  console.log('Discount Multiplier:', quoteB.data.discountMultiplier);
  console.log('Discount Amount EUR:', quoteB.data.discountAmountEUR);
  console.log('Total EUR:', quoteB.data.totalAmountEUR);
  console.log('Monthly Return Rate:', quoteB.data.monthlyReturnRate);
  console.log('Estimated Monthly Return EUR:', quoteB.data.estimatedMonthlyReturnEUR);
  console.log('Lock Duration:', quoteB.data.lockDurationMonths, 'months');
}

main().catch(console.error);
