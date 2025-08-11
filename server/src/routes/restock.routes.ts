import { Router } from "express";
import { getSuggestions, createPO } from "../controllers/restock.controller";

const router = Router();

// GET /api/restock/vendor/:vendorId/suggestions
router.get("/vendor/:vendorId/suggestions", getSuggestions);

// POST /api/restock/vendor/:vendorId/purchase-order
router.post("/vendor/:vendorId/purchase-order", createPO);

export default router;
