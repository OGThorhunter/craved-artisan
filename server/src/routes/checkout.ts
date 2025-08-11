import express from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  createCheckoutSession,
  getCheckoutSession,
  confirmCheckout,
  cancelCheckout
} from '../controllers/checkout';

const router = express.Router();

// Cart management endpoints
router.post('/cart', requireAuth, addToCart);
router.get('/cart', requireAuth, getCart);
router.put('/cart/:itemId', requireAuth, updateCartItem);
router.delete('/cart/:itemId', requireAuth, removeFromCart);

// Checkout session endpoints
router.post('/checkout/session', requireAuth, createCheckoutSession);
router.get('/checkout/session/:sessionId', requireAuth, getCheckoutSession);
router.post('/checkout/session/:sessionId/confirm', requireAuth, confirmCheckout);
router.post('/checkout/session/:sessionId/cancel', requireAuth, cancelCheckout);

export default router; 