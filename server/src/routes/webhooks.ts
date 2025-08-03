import express from 'express';
import { handleStripeWebhook, webhookHealthCheck } from '../webhooks/stripe';

const router = express.Router();

// Stripe webhook endpoint - must use raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Webhook health check
router.get('/health', webhookHealthCheck);

export default router; 