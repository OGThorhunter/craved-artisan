import { Router } from "express";
import { getVendorAvailability, scheduleOrderForVendors } from "../services/fulfillment.service";
import prisma from '../lib/prisma';
const r = Router();

// List upcoming windows for a vendor (zip-aware)
r.get("/vendor/:vendorId/windows", async (req,res) => {
  const data = await getVendorAvailability(req.params.vendorId, { days: Number(req.query.days||21), zip: req.query.zip as string|undefined });
  return res.json({ windows: data });
});

// Attach vendor-specific selections to an order (called BEFORE payment OR immediately after if you prefer)
r.post("/order/:orderId/schedule", async (req,res) => {
  const { selections } = req.body; // array of { vendorId, method, date, locationId?, fee?, notes? }
  await scheduleOrderForVendors(req.params.orderId, selections);
  return res.json({ ok: true });
});

// Vendor updates fulfillment status (ready/picked_up/delivered)
r.post("/order/:orderId/vendor/:vendorId/status", async (req,res) => {
  const { status, message } = req.body;
  await prisma.orderEvent.create({ data: { orderId: req.params.orderId, actorRole: "vendor", type: status, message }});
  return res.json({ ok: true });
});

export default r;
