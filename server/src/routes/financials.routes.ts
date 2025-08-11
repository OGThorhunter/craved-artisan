import { Router } from "express";
import { getPNL, getCashFlow, getBalanceSheet, downloadPNLcsv, downloadCashFlowCsv } from "../controllers/financials.controller";
import { zRange, zMethod, zAsOf } from "../validation/financials";
import { validateQuery } from "../validation/common";

const router = Router();

// GET /api/financials/vendor/:vendorId/pnl
router.get("/vendor/:vendorId/pnl", validateQuery(zRange), getPNL);

// GET /api/financials/vendor/:vendorId/cash-flow
router.get("/vendor/:vendorId/cash-flow", validateQuery(zRange.merge(zMethod)), getCashFlow);

// GET /api/financials/vendor/:vendorId/balance-sheet
router.get("/vendor/:vendorId/balance-sheet", validateQuery(zAsOf), getBalanceSheet);

// GET /api/financials/vendor/:vendorId/pnl.csv
router.get("/vendor/:vendorId/pnl.csv", validateQuery(zRange), downloadPNLcsv);

// GET /api/financials/vendor/:vendorId/cash-flow.csv
router.get("/vendor/:vendorId/cash-flow.csv", validateQuery(zRange.merge(zMethod)), downloadCashFlowCsv);

export default router;
