import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({ jsonTransport: true }); // dev: prints to console

export async function sendOrderConfirmation(to: string, order: any, fulfillments: any[]) {
  const subject = `Your Craved Artisan order ${order.id}`;
  const text = `Thanks! We'll see you:\n` + fulfillments.map(f => `• ${f.vendorId} — ${f.method} ${new Date(f.date).toLocaleString()}`).join("\n");
  await transport.sendMail({ to, from: "no-reply@cravedartisan.local", subject, text });
}
