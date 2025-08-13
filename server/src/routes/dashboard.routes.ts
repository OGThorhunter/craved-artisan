import { Router } from "express";
import { getVendorDashboard } from "../controllers/dashboard.controller";
const r = Router();
r.get("/vendor/:vendorId/overview", getVendorDashboard);
export default r;
