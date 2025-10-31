import { api } from '../http';
import { z } from 'zod';

// Type definitions based on existing patterns
export const VendorSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  description: z.string().optional(),
  tagline: z.string().optional(),
  category: z.string().optional(),
  avatarUrl: z.string().optional(),
  coverImage: z.string().optional(),
  isVerified: z.boolean().optional(),
  isOnVacation: z.boolean().optional(),
  vacationMessage: z.string().optional(),
  rating: z.number().optional(),
  totalProducts: z.number().optional(),
  totalOrders: z.number().optional(),
  location: z.string().optional(),
  joinedDate: z.string().optional(),
  followers: z.number().optional(),
  contact: z.object({
    email: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  social: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
  values: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  businessHours: z.string().optional(),
  fulfillmentOptions: z.object({
    pickup: z.boolean(),
    delivery: z.boolean(),
    shipping: z.boolean(),
  }).optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  originalPrice: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  inStock: z.boolean(),
  featured: z.boolean().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  isBestseller: z.boolean().optional(),
  isLowStock: z.boolean().optional(),
  isNew: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
  weight: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Vendor = z.infer<typeof VendorSchema>;
export type Product = z.infer<typeof ProductSchema>;

/**
 * Get vendor details by ID
 */
export async function getVendorById(vendorId: string): Promise<Vendor> {
  const response = await api.get(`/vendors/${vendorId}`);
  return VendorSchema.parse(response.data);
}

/**
 * Get vendor products
 */
export async function getVendorProducts(vendorId: string, options?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{ data: Product[]; meta?: any }> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.category) params.append('category', options.category);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/vendors/${vendorId}/products${query}`);
  return response.data;
}

