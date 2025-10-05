import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { stripeService } from '../services/stripe-service';
import { z } from 'zod';

const router = Router();

// Validation schemas
const periodSchema = z.object({
  period: z.enum(['today', '7d', '30d', '90d']).default('30d')
});

const limitSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50)
});

// GET /api/admin/stripe/summary - Get Stripe revenue summary
router.get('/stripe/summary', requireAdmin, async (req, res) => {
  try {
    const { period } = periodSchema.parse(req.query);
    
    const [revenue, payouts, riskAnalytics] = await Promise.all([
      stripeService.getRevenueSummary(period),
      stripeService.getPayouts(10),
      stripeService.getRiskAnalytics()
    ]);
    
    return res.json({
      success: true,
      data: {
        revenue,
        payouts,
        riskAnalytics,
        period
      }
    });
  } catch (error) {
    console.error('Stripe summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Stripe summary'
    });
  }
});

// GET /api/admin/stripe/revenue - Get detailed revenue data
router.get('/stripe/revenue', requireAdmin, async (req, res) => {
  try {
    const { period } = periodSchema.parse(req.query);
    
    const [revenue, paymentMethods] = await Promise.all([
      stripeService.getRevenueSummary(period),
      stripeService.getPaymentMethodAnalytics(period)
    ]);
    
    return res.json({
      success: true,
      data: {
        revenue,
        paymentMethods,
        period
      }
    });
  } catch (error) {
    console.error('Stripe revenue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue data'
    });
  }
});

// GET /api/admin/stripe/disputes - Get disputes
router.get('/stripe/disputes', requireAdmin, async (req, res) => {
  try {
    const { limit } = limitSchema.parse(req.query);
    
    const disputes = await stripeService.getDisputes(limit);
    
    return res.json({
      success: true,
      data: { disputes }
    });
  } catch (error) {
    console.error('Stripe disputes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes'
    });
  }
});

// GET /api/admin/stripe/payouts - Get payouts
router.get('/stripe/payouts', requireAdmin, async (req, res) => {
  try {
    const { limit } = limitSchema.parse(req.query);
    
    const payouts = await stripeService.getPayouts(limit);
    
    return res.json({
      success: true,
      data: { payouts }
    });
  } catch (error) {
    console.error('Stripe payouts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payouts'
    });
  }
});

// GET /api/admin/stripe/radar/reviews - Get Radar reviews
router.get('/stripe/radar/reviews', requireAdmin, async (req, res) => {
  try {
    const { limit } = limitSchema.parse(req.query);
    
    const reviews = await stripeService.getRadarReviews(limit);
    
    return res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Radar reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Radar reviews'
    });
  }
});

// POST /api/admin/stripe/radar/reviews/:id/approve - Approve Radar review
router.post('/stripe/radar/reviews/:id/approve', requireAdmin, auditAdminAction('stripe.radar.approve'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await stripeService.approveRadarReview(id);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Radar review approved successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to approve Radar review'
      });
    }
  } catch (error) {
    console.error('Approve Radar review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve Radar review'
    });
  }
});

// POST /api/admin/stripe/charges/:id/approve - Approve charge
router.post('/stripe/charges/:id/approve', requireAdmin, auditAdminAction('stripe.charge.approve'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await stripeService.approveCharge(id);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Charge approved successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to approve charge'
      });
    }
  } catch (error) {
    console.error('Approve charge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve charge'
    });
  }
});

// GET /api/admin/stripe/analytics/payment-methods - Get payment method analytics
router.get('/stripe/analytics/payment-methods', requireAdmin, async (req, res) => {
  try {
    const { period } = periodSchema.parse(req.query);
    
    const paymentMethods = await stripeService.getPaymentMethodAnalytics(period === 'today' ? '7d' : period);
    
    return res.json({
      success: true,
      data: { paymentMethods, period }
    });
  } catch (error) {
    console.error('Payment methods analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment method analytics'
    });
  }
});

// GET /api/admin/stripe/analytics/conversion - Get conversion funnel
router.get('/stripe/analytics/conversion', requireAdmin, async (req, res) => {
  try {
    const { period } = periodSchema.parse(req.query);
    
    const funnel = await stripeService.getConversionFunnel(period === 'today' ? '7d' : period);
    
    return res.json({
      success: true,
      data: { funnel, period }
    });
  } catch (error) {
    console.error('Conversion funnel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion funnel'
    });
  }
});

// GET /api/admin/stripe/analytics/risk - Get risk analytics
router.get('/stripe/analytics/risk', requireAdmin, async (req, res) => {
  try {
    const riskAnalytics = await stripeService.getRiskAnalytics();
    
    return res.json({
      success: true,
      data: { riskAnalytics }
    });
  } catch (error) {
    console.error('Risk analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch risk analytics'
    });
  }
});

export default router;
