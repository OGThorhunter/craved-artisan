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
  vendorProfileId: string;
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
    name: v.storeName,
    city: v.bio ?? "", // Using description as city placeholder
    state: "", // Using category as state placeholder
    tagline: v.bio ?? undefined,
    verified: false // Default to false since we don't have this field
  };
}

/**
 * Map Prisma Product to API DTO
 */
export function mapProduct(p: Product): ProductDTO {
  return {
    id: p.id,
    vendorProfileId: p.vendorProfileId,
    title: p.name,
    price: Number(p.price),
    imageUrl: p.description ?? "", // Using description as imageUrl placeholder
    tags: p.tags,
    availability: p.stock > 10 ? "in_stock" : 
                  p.stock > 0 ? "low" : "out"
  };
}
