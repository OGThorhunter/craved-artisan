import { Router } from "express";
import Stripe from "stripe";
import prisma from '../lib/prisma';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const r = Router();

r.post("/quote", async (req, res) => {
  if (process.env.ENABLE_STRIPE_TAX !== "true") return res.json({ amountTax: 0, amountTotal: 0, amountSubtotal: 0 });

  const { customer, items } = req.body as {
    customer: { address?: { country?: string; postal_code?: string; state?: string } };
    items: Array<{ productId: string; quantity: number }>;
  };

  const line_items = [];
  for (const li of items) {
    const p = await prisma.product.findUnique({ 
      where: { id: li.productId }
    });
    if (!p) continue;
    line_items.push({
      amount: Math.round(Number(p.price) * li.quantity * 100),
      tax_code: undefined,
      reference: p.id,
    });
  }

  const calc = await stripe.tax.calculations.create({
    currency: "usd",
    customer_details: { address: { country: customer?.address?.country || "US", postal_code: customer?.address?.postal_code, state: customer?.address?.state } },
    line_items,
  });

  return res.json({ amountSubtotal: calc.amount_total, amountTax: calc.amount_total, amountTotal: calc.amount_total, breakdown: calc.tax_breakdown });
});

export default r;
