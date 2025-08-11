import { z } from 'zod';

// Vendor ID parameter validation
export const vendorIdParamSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
});

export type VendorIdParam = z.infer<typeof vendorIdParamSchema>;

// Vendor products query validation
export const vendorProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
});

export type VendorProductsQuery = z.infer<typeof vendorProductsQuerySchema>;

// Vendor response validation
export const vendorSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  description: z.string(),
  category: z.string(),
  rating: z.number().min(0).max(5),
  totalOrders: z.number().int(),
  createdAt: z.string().datetime(),
});

export type Vendor = z.infer<typeof vendorSchema>;
