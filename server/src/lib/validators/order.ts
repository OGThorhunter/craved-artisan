import { z } from 'zod';

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
