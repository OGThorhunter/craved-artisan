#!/usr/bin/env tsx

import { generateZodClientFromOpenAPI } from 'openapi-zod-client';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

async function generateValidators() {
  try {
    console.log('🔧 Generating Zod validators from OpenAPI spec...');
    
    // Read the OpenAPI spec
    const spec = readFileSync('openapi.yaml', 'utf-8');
    
    // Generate validators for each endpoint group
    const validators = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      options: {
        withAlias: false,
        zod: true,
        validation: true,
      },
    });
    
    // Create the validators directory
    const validatorsDir = join('server', 'src', 'lib', 'validators');
    mkdirSync(validatorsDir, { recursive: true });
    
    // Write the main validators file
    const validatorsPath = join(validatorsDir, 'index.ts');
    writeFileSync(validatorsPath, validators);
    
    // Create individual validator files for better organization
    createAuthValidators(validatorsDir);
    createVendorValidators(validatorsDir);
    createProductValidators(validatorsDir);
    createAnalyticsValidators(validatorsDir);
    createOrderValidators(validatorsDir);
    
    console.log('✅ Validators generated successfully!');
    console.log(`📁 Location: ${validatorsPath}`);
    
  } catch (error) {
    console.error('❌ Error generating validators:', error);
    process.exit(1);
  }
}

function createAuthValidators(validatorsDir: string) {
  const authValidators = `import { z } from 'zod';

// Login request validation
export const loginRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Register request validation
export const registerRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN', 'SUPPLIER', 'EVENT_COORDINATOR', 'DROPOFF']).default('CUSTOMER'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Please provide a valid URL').optional().or(z.literal('')),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// Session response validation
export const sessionResponseSchema = z.object({
  authenticated: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN', 'SUPPLIER', 'EVENT_COORDINATOR', 'DROPOFF']),
    profile: z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      website: z.string().optional(),
    }).optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
`;

  writeFileSync(join(validatorsDir, 'auth.ts'), authValidators);
}

function createVendorValidators(validatorsDir: string) {
  const vendorValidators = `import { z } from 'zod';

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
`;

  writeFileSync(join(validatorsDir, 'vendor.ts'), vendorValidators);
}

function createProductValidators(validatorsDir: string) {
  const productValidators = `import { z } from 'zod';

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
`;

  writeFileSync(join(validatorsDir, 'product.ts'), productValidators);
}

function createAnalyticsValidators(validatorsDir: string) {
  const analyticsValidators = `import { z } from 'zod';

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
`;

  writeFileSync(join(validatorsDir, 'analytics.ts'), analyticsValidators);
}

function createOrderValidators(validatorsDir: string) {
  const orderValidators = `import { z } from 'zod';

// Cart item validation
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be non-negative'),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Cart request validation
export const cartRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'At least one item is required'),
});

export type CartRequest = z.infer<typeof cartRequestSchema>;

// Cart response validation
export const cartResponseSchema = z.object({
  cartId: z.string(),
  items: z.array(cartItemSchema),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  expiresAt: z.string().datetime(),
});

export type CartResponse = z.infer<typeof cartResponseSchema>;

// Shipping address validation
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// Checkout session request validation
export const checkoutSessionRequestSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required'),
  shippingAddress: shippingAddressSchema,
  deliveryMethod: z.enum(['pickup', 'delivery']),
  pickupLocation: z.string().optional(),
  pickupTime: z.string().datetime().optional(),
});

export type CheckoutSessionRequest = z.infer<typeof checkoutSessionRequestSchema>;

// Checkout session response validation
export const checkoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['pending', 'completed', 'expired']),
  amount: z.number().min(0),
  currency: z.string(),
  expiresAt: z.string().datetime(),
  paymentIntent: z.string(),
});

export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;
`;

  writeFileSync(join(validatorsDir, 'order.ts'), orderValidators);
}

// Run the generator
generateValidators();
