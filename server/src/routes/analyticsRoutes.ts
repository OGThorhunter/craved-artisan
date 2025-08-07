import express from 'express';
import { 
  getTrends, 
  getAnalyticsSummary, 
  getConversionFunnel, 
  getBestSellers, 
  getProfitLoss, 
  getPortfolio, 
  getCustomerInsights 
} from '../controllers/analyticsController';

const router = express.Router();

// GET /api/vendor/:vendorId/analytics/trends?range=daily|weekly|monthly
router.get('/vendor/:vendorId/analytics/trends', getTrends);

// GET /api/vendor/:vendorId/analytics/summary
router.get('/vendor/:vendorId/analytics/summary', getAnalyticsSummary);

// GET /api/vendor/:vendorId/analytics/conversion?range=daily|weekly|monthly
router.get('/vendor/:vendorId/analytics/conversion', getConversionFunnel);

// GET /api/vendor/:vendorId/analytics/bestsellers?range=weekly|monthly|quarterly&limit=10
router.get('/vendor/:vendorId/analytics/bestsellers', getBestSellers);

// GET /api/vendor/:vendorId/financials/profit-loss?range=monthly|quarterly|yearly
router.get('/vendor/:vendorId/financials/profit-loss', getProfitLoss);

// GET /api/vendor/:vendorId/analytics/portfolio
router.get('/vendor/:vendorId/analytics/portfolio', getPortfolio);

// GET /api/vendor/:vendorId/analytics/customers/by-zip?range=monthly|quarterly|yearly
router.get('/vendor/:vendorId/analytics/customers/by-zip', getCustomerInsights);

export default router; 