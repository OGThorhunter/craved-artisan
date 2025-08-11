import { z } from 'zod';

// Product query validation
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  vendorId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

// Product ID parameter validation
export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type ProductIdParam = z.infer<typeof productIdParamSchema>;

// Product response validation
export const productSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  category: z.string(),
  stockQuantity: z.number().int().min(0),
  images: z.array(z.string().url()),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int(),
  createdAt: z.string().datetime(),
});

export type Product = z.infer<typeof productSchema>;

// Pagination meta validation
export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

// Product list response validation
export const productListResponseSchema = z.object({
  data: z.array(productSchema),
  meta: paginationMetaSchema,
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;
