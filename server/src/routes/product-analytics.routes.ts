import { Router } from "express";
import { getProductOverview } from "../controllers/product-analytics.controller";
import { zRange } from "../validation/analytics";
import { validateBody, validateQuery, validateParams } from '../validation/common';

const router = Router();

// GET /api/analytics/vendor/:vendorId/product/:productId/overview
router.get("/vendor/:vendorId/product/:productId/overview", validateQuery(zRange), getProductOverview);

export default router;
