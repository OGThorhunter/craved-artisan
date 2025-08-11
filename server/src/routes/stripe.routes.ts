import { Router } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { prisma } from "../db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const r = Router();

// Create or refresh onboarding link
r.post("/connect/onboard", async (req, res) => {
  const vendorId = req.body.vendorId || req.session?.user?.vendorId;
  if (!vendorId) return res.status(400).json({ error: "vendorId required" });

  let acct = await prisma.vendorStripeAccount.findUnique({ where: { vendorId } });
  if (!acct) {
    const account = await stripe.accounts.create({ 
      type: "express", 
      capabilities: { 
        card_payments: {requested:true}, 
        transfers: {requested:true} 
      } 
    });
    acct = await prisma.vendorStripeAccount.create({ 
      data: { vendorId, accountId: account.id } 
    });
  }

  const link = await stripe.accountLinks.create({
    account: acct.accountId,
    refresh_url: `${process.env.FRONTEND_URL}/dashboard/vendor/settings/payments?refresh=1`,
    return_url:  `${process.env.FRONTEND_URL}/dashboard/vendor/settings/payments?return=1`,
    type: "account_onboarding",
  });

  res.json({ url: link.url });
});

// Read account status
r.get("/connect/status/:vendorId", async (req,res) => {
  const acct = await prisma.vendorStripeAccount.findUnique({ 
    where: { vendorId: req.params.vendorId } 
  });
  if (!acct) return res.json({ connected: false });
  
  const account = await stripe.accounts.retrieve(acct.accountId);
  // persist
  await prisma.vendorStripeAccount.update({ 
    where: { vendorId: req.params.vendorId }, 
    data: {
      chargesEnabled: !!account.charges_enabled, 
      payoutsEnabled: !!account.payouts_enabled, 
      detailsSubmitted: !!account.details_submitted
    }
  });
  res.json({ connected: true, ...account });
});

export default r;
