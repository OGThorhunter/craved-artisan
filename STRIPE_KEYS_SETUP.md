# Stripe Keys Setup Guide

## Overview
This guide will help you set up the necessary Stripe API keys for the Craved Artisan marketplace with Stripe Connect Standard integration.

## Prerequisites
- ✅ Stripe Connect Standard Account (already completed)
- 🔗 Access to your Stripe Dashboard: https://dashboard.stripe.com

## Step 1: Get Your Stripe API Keys

### 1.1 Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Sign in to your Stripe account
3. Make sure you're in the correct mode (Test or Live)

### 1.2 Find Your API Keys
1. In the left sidebar, click on **"Developers"**
2. Click on **"API keys"**
3. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Copy Your Keys
- **Publishable key**: Safe to share, used in frontend
- **Secret key**: Keep secure, used in backend only

## Step 2: Update Environment Variables

### 2.1 Backend Configuration (server/.env)
Update your `server/.env` file with your actual Stripe keys:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51ABC123...your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_1234567890...your_webhook_secret
```

### 2.2 Frontend Configuration (client/.env)
Update your `client/.env` file with your publishable key:

```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...your_actual_publishable_key
```

## Step 3: Set Up Webhook Endpoint (Optional for Testing)

### 3.1 Create Webhook Endpoint
1. In Stripe Dashboard, go to **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `account.updated`
   - `payment_intent.succeeded`
   - `transfer.created`
   - `transfer.failed`

### 3.2 Get Webhook Secret
1. After creating the webhook, click on it
2. Find the **"Signing secret"**
3. Copy the secret (starts with `whsec_`)
4. Add it to your `STRIPE_WEBHOOK_SECRET` in the backend `.env`

## Step 4: Test Your Configuration

### 4.1 Run the Test Script
Use the provided test script to verify your setup:

```powershell
.\test-stripe-integration.ps1
```

### 4.2 Verify Environment Variables
The test script will check:
- ✅ Stripe API connectivity
- ✅ Commission rate calculation
- ✅ Environment variable validation

## Step 5: Switch to Production (When Ready)

### 5.1 Get Live Keys
1. In Stripe Dashboard, switch to **"Live"** mode
2. Go to **"Developers"** → **"API keys"**
3. Copy your live keys (start with `pk_live_` and `sk_live_`)

### 5.2 Update Environment Variables
Replace test keys with live keys in your `.env` files:

```env
# Production Stripe Configuration
STRIPE_SECRET_KEY=sk_live_51ABC123...your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123...your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_1234567890...your_live_webhook_secret
```

## Security Best Practices

### 🔒 Keep Keys Secure
- Never commit `.env` files to version control
- Use different keys for test and production
- Rotate keys regularly
- Limit API key permissions

### 🔒 Environment-Specific Keys
- Use test keys for development
- Use live keys only in production
- Never mix test and live keys

### 🔒 Webhook Security
- Always verify webhook signatures
- Use HTTPS endpoints in production
- Monitor webhook delivery status

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- Check that you're using the correct key type (test vs live)
- Verify the key format (starts with `sk_test_` or `sk_live_`)
- Ensure no extra spaces or characters

#### 2. "Webhook signature verification failed"
- Verify your webhook secret is correct
- Check that the webhook URL is accessible
- Ensure you're using HTTPS in production

#### 3. "Publishable key not found"
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set in client `.env`
- Verify the key starts with `pk_test_` or `pk_live_`
- Restart your development server after changes

### Getting Help
- Check Stripe documentation: https://stripe.com/docs
- Review Stripe Connect guide: https://stripe.com/docs/connect
- Contact Stripe support if needed

## Next Steps

After setting up your Stripe keys:

1. **Run Database Migration**: Execute Prisma migration for new Stripe fields
2. **Test Integration**: Use the test script to verify everything works
3. **Configure Webhooks**: Set up webhook endpoints for production
4. **Go Live**: Switch to production keys when ready

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the `STRIPE_CONNECT_IMPLEMENTATION.md` documentation
3. Run the test script to identify specific problems
4. Check Stripe dashboard for any error messages 