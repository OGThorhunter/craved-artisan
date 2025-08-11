import type { VendorProfile, Product } from '@prisma/client';

export interface VendorDTO {
  id: string;
  name: string;
  city: string;
  state: string;
  tagline?: string;
  verified?: boolean;
}

export interface ProductDTO {
  id: string;
  vendorId: string;
  title: string;
  price: number;
  imageUrl: string;
  tags: string[];
  availability: string;
}

/**
 * Map Prisma VendorProfile to API DTO
 */
export function mapVendor(v: VendorProfile & { user?: any }): VendorDTO {
  return {
    id: v.id,
    name: v.business_name,
    city: v.description ?? "", // Using description as city placeholder
    state: v.category ?? "", // Using category as state placeholder
    tagline: v.description,
    verified: false // Default to false since we don't have this field
  };
}

/**
 * Map Prisma Product to API DTO
 */
export function mapProduct(p: Product): ProductDTO {
  return {
    id: p.id,
    vendorId: p.vendor_id,
    title: p.name,
    price: Number(p.price),
    imageUrl: p.description ?? "", // Using description as imageUrl placeholder
    tags: p.category ? [p.category] : [],
    availability: p.stock_quantity > 10 ? "in_stock" : 
                  p.stock_quantity > 0 ? "low" : "out"
  };
}
