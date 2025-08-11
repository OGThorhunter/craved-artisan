import { Router } from "express";
import { 
  getVendorPortfolioSummary, 
  createPortfolioShare, 
  readPortfolioShare, 
  generatePortfolioPDF 
} from "../controllers/portfolio.controller";
import { zPortfolioQuery, zShareBody, zPdfBody } from "../validation/portfolio";
import { validateQuery, validateBody } from "../validation/common";

const router = Router();

// GET /api/portfolio/vendor/:vendorId/summary
router.get("/vendor/:vendorId/summary", validateQuery(zPortfolioQuery), getVendorPortfolioSummary);

// POST /api/portfolio/vendor/:vendorId/pdf
router.post("/vendor/:vendorId/pdf", validateBody(zPdfBody), generatePortfolioPDF);

// GET /api/portfolio/share/:token
router.get("/share/:token", readPortfolioShare);

// POST /api/portfolio/vendor/:vendorId/share
router.post("/vendor/:vendorId/share", validateBody(zShareBody), createPortfolioShare);

export default router;
