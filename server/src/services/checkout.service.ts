import Stripe from "stripe";
import prisma, { OrderStatus, Role } from '../lib/prisma';
import env from "../config/env";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function buildOrderFromCart(cartId: string) {
  // Cart functionality temporarily disabled - model not in current schema
  throw new Error("Cart functionality not available in current schema");
  
  // TODO: Restore when Cart model is properly implemented
  /*
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } }
  });
  if (!cart) throw new Error("Cart not found");

  const items = cart.items.map((i: any) => ({
    productId: i.productId,
    vendorProfileId: i.vendorProfileId,
    quantity: i.qty,
    unitPrice: Number(i.unitPrice),
    subtotal: +(Number(i.unitPrice) * i.qty).toFixed(2),
  }));
  const total = +items.reduce((a,i)=>a+i.subtotal, 0).toFixed(2);
  return { cart, items, total };
  */
}

export async function ensurePendingOrder(cartId: string, userId: string, zip?: string) {
  // Cart functionality temporarily disabled
  throw new Error("Cart functionality not available in current schema");
  
  // TODO: Restore when Cart model is properly implemented
  /*
  const { items, total } = await buildOrderFromCart(cartId);
  const order = await prisma.order.create({
    data: {
      userId, 
      total,
      transferGroup: `order_${Date.now()}`,
      status: OrderStatus.PENDING,
      items: { create: items }
    },
    include: { orderItems: { include: { product: true } }, user: true, shippingAddress: true, fulfillments: true }
  });
  return order;
  */
}

export async function createOrUpdatePaymentIntent(orderId: string, customerEmail?: string, billingZip?: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId }, 
    include: { orderItems: { include: { product: true } }, user: true, shippingAddress: true, fulfillments: true } 
  });
  if (!order) throw new Error("Order not found");
  const amount = Math.round(Number(order.total) * 100); // cents

  // Use the destination ZIP for tax calculation:
  // - pickup: the chosen vendor location zip
  // - delivery: the customer's zip
  const taxZip = billingZip || undefined;

  const base = {
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: order.id },
    transfer_group: `order_${order.id}`,
    // Tax:
    automatic_tax: { enabled: process.env.ENABLE_STRIPE_TAX === "true" },
    customer_details: {
      email: customerEmail,
      address: { country: "US", postal_code: taxZip }
    }
  };

  // Create or update the PaymentIntent on the PLATFORM
  const existingPaymentIntent = undefined;
  if (!existingPaymentIntent) {
    const pi = await stripe.paymentIntents.create(base);
    await prisma.order.update({ 
      where: { id: order.id }, 
      data: { 
        
      } 
    });
    return pi;
  } else {
    const pi = await stripe.paymentIntents.update(existingPaymentIntent, base);
    return pi;
  }
}
