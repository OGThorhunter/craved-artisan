import { Router } from "express";
import { z } from "zod";
import asyncHandler from "express-async-handler";
import prisma from "../src/lib/prisma";

const router = Router();

const QuerySchema = z.object({
  vendorId: z.string().min(1).optional(), // allow query override in dev
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

router.get(
  "/api/vendor/products",
  asyncHandler(async (req, res) => {
    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ code: "BAD_REQUEST", issues: parsed.error.issues });
    }

    // Resolve vendorId from session first, then query param
    const vendorIdFromSession = (req as any).session?.user?.vendorId;
    
    if (!vendorIdFromSession) {
      return res.status(401).json({ 
        code: "NO_SESSION", 
        message: "No vendor session. Please log in." 
      });
    }
    
    const vendorId = parsed.data.vendorId || vendorIdFromSession;

    const page = Number(parsed.data.page ?? 1);
    const pageSize = Math.min(Number(parsed.data.pageSize ?? 20), 100);

    try {
      // Minimal fields to start; expand as needed
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where: { vendorProfileId: vendorId },
          orderBy: { updatedAt: "desc" },
          take: pageSize,
          skip: (page - 1) * pageSize,
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            tags: true,
            stock: true,
            isAvailable: true,
            updatedAt: true,
            createdAt: true,
          },
        }),
        prisma.product.count({ where: { vendorProfileId: vendorId } }),
      ]);

      res.json({ items, total, page, pageSize });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ 
        code: "DATABASE_ERROR", 
        message: "Failed to fetch products" 
      });
    }
  })
);

export default router;
