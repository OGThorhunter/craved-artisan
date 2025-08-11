import { Router } from "express";
import { quickCoupon } from "../controllers/discounts.controller";

const router = Router();

// POST /api/discounts/quick
router.post("/quick", quickCoupon);

export default router;
