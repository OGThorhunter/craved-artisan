import Stripe from 'stripe';
import { logger } from '../logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

async function setupVendorSubscription() {
  try {
    logger.info('Creating Stripe product for vendor subscriptions...');

    const product = await stripe.products.create({
      name: 'Vendor Platform Subscription',
      description: 'Monthly subscription for vendor marketplace access',
    });

    logger.info({ productId: product.id }, 'Product created');

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2500, // $25.00
      currency: 'usd',
      recurring: { interval: 'month' },
      nickname: 'Vendor Monthly',
    });

    logger.info({ priceId: price.id }, 'Price created');

    console.log('\n✅ Vendor subscription product created successfully!\n');
    console.log('Product ID:', product.id);
    console.log('Price ID:', price.id);
    console.log('\n📝 Add to your .env file:');
    console.log(`STRIPE_VENDOR_SUBSCRIPTION_PRICE_ID=${price.id}\n`);

  } catch (error) {
    logger.error({ error }, 'Failed to create vendor subscription product');
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the setup
setupVendorSubscription()
  .then(() => {
    console.log('✅ Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });

