import { Router } from "express";
import Stripe from "stripe";
import env from "../config/env";
import prisma from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

const r = Router();

// Create or refresh onboarding link
r.post("/connect/onboard", async (req, res) => {
  const vendorId = req.body.vendorId || req.session?.userId;
  if (!vendorId) return res.status(400).json({ error: "vendorId required" });

  // TODO: Implement vendorStripeAccount model
  const account = await stripe.accounts.create({ 
    type: "express", 
    capabilities: { 
      card_payments: {requested:true}, 
      transfers: {requested:true} 
    } 
  });
  const acct = { accountId: account.id };

  const link = await stripe.accountLinks.create({
    account: acct.accountId,
    refresh_url: `${process.env.FRONTEND_URL}/dashboard/vendor/settings/payments?refresh=1`,
    return_url:  `${process.env.FRONTEND_URL}/dashboard/vendor/settings/payments?return=1`,
    type: "account_onboarding",
  });

  return res.json({ url: link.url });
});

// Read account status
r.get("/connect/status/:vendorId", async (req,res) => {
  // TODO: Implement vendorStripeAccount model
  return res.json({ connected: false, message: "Not implemented" });
});

export default r;
