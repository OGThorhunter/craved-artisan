import { z } from 'zod';

// Analytics query validation
export const analyticsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

// Best sellers query validation
export const bestSellersQuerySchema = z.object({
  period: z.enum(['weekly', 'monthly', 'quarterly']).default('monthly'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  vendorId: z.string().min(1, 'Vendor ID is required'),
});

export type BestSellersQuery = z.infer<typeof bestSellersQuerySchema>;

// Vendor overview response validation
export const vendorOverviewSchema = z.object({
  vendorId: z.string(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  revenue: z.object({
    current: z.number(),
    previous: z.number(),
    change: z.number(),
    changeType: z.enum(['increase', 'decrease']),
  }),
  orders: z.object({
    current: z.number().int(),
    previous: z.number().int(),
    change: z.number(),
  }),
  customers: z.object({
    new: z.number().int(),
    returning: z.number().int(),
    total: z.number().int(),
  }),
  topCategories: z.array(z.object({
    category: z.string(),
    revenue: z.number(),
    percentage: z.number(),
  })),
});

export type VendorOverview = z.infer<typeof vendorOverviewSchema>;

// Best seller validation
export const bestSellerSchema = z.object({
  productId: z.string(),
  name: z.string(),
  revenue: z.number(),
  units: z.number().int(),
  reorderRate: z.number().min(0).max(1),
  rating: z.number().min(0).max(5),
  stock: z.number().int(),
  category: z.string(),
});

export type BestSeller = z.infer<typeof bestSellerSchema>;

// Best sellers response validation
export const bestSellersResponseSchema = z.object({
  data: z.array(bestSellerSchema),
  meta: z.object({
    period: z.enum(['weekly', 'monthly', 'quarterly']),
    limit: z.number().int(),
    totalProducts: z.number().int(),
  }),
});

export type BestSellersResponse = z.infer<typeof bestSellersResponseSchema>;
