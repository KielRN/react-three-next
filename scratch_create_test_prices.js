require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  try {
    console.log('Creating Test Product...');
    const product = await stripe.products.create({
      name: 'Growth Platform (Test Sandbox)',
      description: 'Test mode product for Growth Platform funnel.',
    });
    console.log('Product created:', product.id);

    console.log('Creating Monthly Price ($99)...');
    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900,
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log('Monthly Price ID:', monthly.id);

    console.log('Creating Annual Price ($1,164)...');
    const annual = await stripe.prices.create({
      product: product.id,
      unit_amount: 116400,
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log('Annual Price ID:', annual.id);

    console.log('Creating Setup Fee Price ($500)...');
    const setupFee = await stripe.prices.create({
      product: product.id,
      unit_amount: 50000,
      currency: 'usd',
    });
    console.log('Setup Fee Price ID:', setupFee.id);

    console.log('\n--- SUCCESS ---');
    console.log(`NEXT_PUBLIC_GP_PRICE_MONTHLY=${monthly.id}`);
    console.log(`NEXT_PUBLIC_GP_PRICE_ANNUAL=${annual.id}`);
    console.log(`NEXT_PUBLIC_GP_PRICE_SETUP=${setupFee.id}`);
  } catch (error) {
    console.error('Error creating Stripe test items:', error);
  }
}

main();
