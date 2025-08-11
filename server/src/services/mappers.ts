import { VendorProfile, Product } from '@prisma/client';

// Map Prisma VendorProfile to API Vendor DTO
export function mapVendor(prismaVendor: VendorProfile) {
  return {
    id: prismaVendor.id,
    name: prismaVendor.businessName,
    city: prismaVendor.city || '',
    state: prismaVendor.state || '',
    tagline: prismaVendor.description || undefined,
    verified: prismaVendor.verified || false
  };
}

// Map Prisma Product to API Product DTO
export function mapProduct(prismaProduct: Product) {
  return {
    id: prismaProduct.id,
    vendorId: prismaProduct.vendorId,
    title: prismaProduct.name,
    price: prismaProduct.price,
    imageUrl: prismaProduct.images?.[0] || '/img/placeholder.jpg',
    tags: prismaProduct.category ? [prismaProduct.category] : [],
    availability: prismaProduct.stockQuantity > 10 ? 'in_stock' : 
                  prismaProduct.stockQuantity > 0 ? 'low' : 'out'
  };
}
