async function main() {
  const emailB = `test-opt-b-${Date.now()}@xplain.com`;
  const regBRes = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailB,
      password: 'StrongPassword123!',
      phone: `+447${Date.now().toString().slice(-9)}`,
      fullName: 'Option B Resale Investor',
      preferredCurrency: 'EUR',
      resalePlan: 'SELLFOR'
    })
  });
  
  const rawCookie = regBRes.headers.get('set-cookie');
  console.log('Set-Cookie raw:', rawCookie);
  // Extract xplain_session token
  const match = rawCookie.match(/xplain_session=([^;]+)/);
  const sessionToken = match ? match[1] : '';
  console.log('Extracted sessionToken:', sessionToken.slice(0, 16) + '...');

  const finBRes = await fetch('http://localhost:5000/api/v1/financial/me/summary', {
    headers: { 'Cookie': `xplain_session=${sessionToken}` }
  });
  console.log('Financial summary status:', finBRes.status);
  const finB = await finBRes.json();
  console.log('Financial summary response:', JSON.stringify(finB, null, 2));
}

main().catch(console.error);
