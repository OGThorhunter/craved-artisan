import { Request, Response } from 'express';
import prisma from '/prisma';

export async function quickCoupon(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const { vendorId, type, amount, ttlHours = 168, maxUses } = req.body;

  try {
    // Enforce access control
    if (vendorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate unique code
    const code = `APOL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    // Create discount code
    const discountCode = await prisma.discountCode.create({
      data: {
        vendorId,
        code,
        amountType: type,
        amount,
        expiresAt,
        maxUses: maxUses || null
      }
    });

    res.status(201).json({
      code,
      display: `${type === 'percent' ? amount + '%' : '$' + amount} off`,
      expiresAt,
      maxUses
    });
  } catch (error) {
    console.error('Error creating quick coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
}
