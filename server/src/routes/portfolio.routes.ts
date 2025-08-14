import { Router } from "express";
import { 
  getVendorPortfolioSummary, 
  createPortfolioShare, 
  readPortfolioShare, 
  generatePortfolioPDF 
} from "../controllers/portfolio.controller";
// import { z.object({ vendorId: z.string() }), z.object({ email: z.string().email() }), z.object({ format: z.string().optional() }) } from "../validation/portfolio";
import { validateBody, validateQuery, validateParams } from '../validation/common';

const router = Router();

// GET /api/portfolio/vendor/:vendorId/summary
router.get("/vendor/:vendorId/summary", validateQuery(z.object({ vendorId: z.string() })), getVendorPortfolioSummary);

// POST /api/portfolio/vendor/:vendorId/pdf
router.post("/vendor/:vendorId/pdf", validateBody(z.object({ format: z.string().optional() })), generatePortfolioPDF);

// GET /api/portfolio/share/:token
router.get("/share/:token", readPortfolioShare);

// POST /api/portfolio/vendor/:vendorId/share
router.post("/vendor/:vendorId/share", validateBody(z.object({ email: z.string().email() })), createPortfolioShare);

export default router;
