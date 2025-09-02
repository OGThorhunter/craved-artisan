"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_1 = __importDefault(require("../src/lib/prisma"));
const router = (0, express_1.Router)();
const QuerySchema = zod_1.z.object({
    vendorId: zod_1.z.string().min(1).optional(),
    page: zod_1.z.string().optional(),
    pageSize: zod_1.z.string().optional(),
});
router.get("/api/vendor/products", (0, express_async_handler_1.default)(async (req, res) => {
    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ code: "BAD_REQUEST", issues: parsed.error.issues });
    }
    const vendorIdFromSession = req.session?.user?.vendorId;
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
        const [items, total] = await Promise.all([
            prisma_1.default.product.findMany({
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
            prisma_1.default.product.count({ where: { vendorProfileId: vendorId } }),
        ]);
        res.json({ items, total, page, pageSize });
    }
    catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            code: "DATABASE_ERROR",
            message: "Failed to fetch products"
        });
    }
}));
exports.default = router;
//# sourceMappingURL=vendorProducts.js.map