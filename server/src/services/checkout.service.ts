import Stripe from "stripe";
import { prisma } from "../db/prisma";
import { env } from "../config/env";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function buildOrderFromCart(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } }
  });
  if (!cart) throw new Error("Cart not found");

  const items = cart.items.map(i => ({
    productId: i.productId,
    vendorId: i.vendorId,
    quantity: i.qty,
    unitPrice: Number(i.unitPrice),
    subtotal: +(Number(i.unitPrice) * i.qty).toFixed(2),
  }));
  const total = +items.reduce((a,i)=>a+i.subtotal, 0).toFixed(2);
  return { cart, items, total };
}

export async function ensurePendingOrder(cartId: string, customerId: string, zip?: string) {
  const { items, total } = await buildOrderFromCart(cartId);
  const order = await prisma.order.create({
    data: {
      customerId, 
      zip, 
      total,
      transferGroup: `order_${Date.now()}`,
      status: "pending",
      items: { create: items }
    },
    include: { items: true }
  });
  return order;
}

export async function createOrUpdatePaymentIntent(orderId: string, customerEmail?: string, billingZip?: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId }, 
    include: { items: true } 
  });
  if (!order) throw new Error("Order not found");
  const amount = Math.round(Number(order.total) * 100); // cents

  // Use the destination ZIP for tax calculation:
  // - pickup: the chosen vendor location zip
  // - delivery: the customer's zip
  const taxZip = billingZip || order.zip;

  const base = {
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: order.id },
    transfer_group: order.transferGroup || `order_${order.id}`,
    // Tax:
    automatic_tax: { enabled: process.env.ENABLE_STRIPE_TAX === "true" },
    customer_details: {
      email: customerEmail,
      address: { country: "US", postal_code: taxZip }
    }
  };

  // Create or update the PaymentIntent on the PLATFORM
  if (!order.paymentIntentId) {
    const pi = await stripe.paymentIntents.create(base);
    await prisma.order.update({ 
      where: { id: order.id }, 
      data: { 
        paymentIntentId: pi.id, 
        transferGroup: pi.transfer_group || undefined 
      } 
    });
    return pi;
  } else {
    const pi = await stripe.paymentIntents.update(order.paymentIntentId, base);
    return pi;
  }
}
