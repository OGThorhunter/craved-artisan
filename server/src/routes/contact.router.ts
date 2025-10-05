import { Router } from "express";
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Creates a lightweight contact ticket and a System Message (no email).
 * Note: wire your auth to capture userId/vendorId if logged in.
 */
router.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message, consentSms } = req.body ?? {};
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Optional: persist a dedicated ContactTicket model; here we just message.
    const vendorId = (req as any).user?.vendorProfileId ?? "public"; // adapt to your auth/session
    const msg = await prisma.systemMessage.create({
      data: {
        vendorProfileId: vendorId,
        scope: "support",
        type: "contact_ticket",
        title: `New contact: ${subject}`,
        body: `${name} (${email}) says:\n\n${message}`,
        data: JSON.stringify({ name, email, subject, consentSms: !!consentSms }),
      },
    });

    // (Reminder) Later, if user has SMS opt-in, mirror to SMS gateway.
    return res.json({ ok: true, messageId: msg.id });
  } catch (error) {
    console.error('Error creating contact ticket:', error);
    return res.status(500).json({ error: 'Failed to create contact ticket' });
  }
});

export default router;
