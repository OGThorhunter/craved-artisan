import { Router } from "express";
import Stripe from "stripe";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { ensurePendingOrder, createOrUpdatePaymentIntent } from "../services/checkout.service";

const r = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// Create an order from cart and get client_secret for PaymentElement
r.post("/create-intent", async (req, res) => {
  const { cartId, customerId, zip, email } = req.body;
  const order = await ensurePendingOrder(cartId, customerId, zip);
  const pi = await createOrUpdatePaymentIntent(order.id, email);
  res.json({ clientSecret: pi.client_secret, orderId: order.id });
});

// Webhook: finalize order and create transfers per vendor
r.post("/webhook", async (req, res) => {
  let event: Stripe.Event;
  try {
    const sig = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderId = (pi.metadata as any)?.orderId;
    if (orderId) {
      const order = await prisma.order.findUnique({ 
        where: { id: orderId }, 
        include: { items: true } 
      });
      if (!order) return res.json({ ok: true });

      // compute amounts per vendor
      const byVendor = new Map<string, number>();
      for (const it of order.items) {
        const sub = Number(it.subtotal);
        byVendor.set(it.vendorId, (byVendor.get(it.vendorId) || 0) + sub);
      }

      const feePct = (Number(process.env.PLATFORM_FEE_BPS || "100")) / 10000; // e.g., 0.01
      for (const [vendorId, vendorSubtotal] of byVendor) {
        const acct = await prisma.vendorStripeAccount.findUnique({ where: { vendorId } });
        if (!acct) continue; // skip for now or hold

        const fee = +(vendorSubtotal * feePct).toFixed(2);
        const payout = Math.round((vendorSubtotal - fee) * 100);

        try {
          await stripe.transfers.create({
            amount: payout,
            currency: "usd",
            destination: acct.accountId,
            transfer_group: order.transferGroup || undefined,
            metadata: { orderId, vendorId, fee: fee.toString() }
          });
        } catch (e) {
          console.error("Transfer failed", vendorId, e);
        }
      }

      await prisma.order.update({ where: { id: orderId }, data: { status: "paid" } });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderId = (pi.metadata as any)?.orderId;
    if (orderId) await prisma.order.update({ where: { id: orderId }, data: { status: "failed" } });
  }

  res.json({ received: true });
});

export default r;
