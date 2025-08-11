import { Router } from "express";
import { getVendorOverview, getVendorBestSellers } from "../controllers/analytics.controller";
import { zRange, zLimit } from "../validation/analytics";
import { validateQuery } from "../validation/common";

const router = Router();

// GET /api/analytics/vendor/:vendorId/overview
router.get("/vendor/:vendorId/overview", validateQuery(zRange), getVendorOverview);

// GET /api/analytics/vendor/:vendorId/best-sellers
router.get("/vendor/:vendorId/best-sellers", validateQuery(zLimit.merge(zRange)), getVendorBestSellers);

export default router;
