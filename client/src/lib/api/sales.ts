import { z } from 'zod';

// Sales Window Schema
export const SalesWindowSchema = z.object({
  id: z.string(),
  eventId: z.string().optional(),
  sessionId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  opensAt: z.string(),
  closesAt: z.string(),
  maxCapacity: z.number().optional(),
  perCustomerLimit: z.number().optional(),
  earlyBirdPrice: z.number().optional(),
  earlyBirdEnds: z.string().optional(),
  lastMinutePrice: z.number().optional(),
  lastMinuteStarts: z.string().optional(),
  isActive: z.boolean(),
  autoClose: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  orderCount: z.number().optional(),
  waitlistCount: z.number().optional(),
});

// Order Schema
export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  salesWindowId: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'REFUNDED']),
  subtotal: z.number(),
  tax: z.number(),
  fees: z.number(),
  total: z.number(),
  paymentIntentId: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED']),
  paymentMethod: z.string().optional(),
  expiresAt: z.string().optional(),
  paidAt: z.string().optional(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  orderItems: z.array(z.any()).optional(),
  tickets: z.array(z.any()).optional(),
});

// Order Item Schema
export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  stallId: z.string(),
  basePrice: z.number(),
  surcharges: z.number(),
  discounts: z.number(),
  finalPrice: z.number(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']),
  createdAt: z.string(),
  updatedAt: z.string(),
  stall: z.any().optional(),
});

// Ticket Schema
export const TicketSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  stallId: z.string(),
  ticketNumber: z.string(),
  qrCode: z.string(),
  qrCodeImage: z.string().optional(),
  status: z.enum(['ISSUED', 'CHECKED_IN', 'TRANSFERRED', 'CANCELLED']),
  checkedInAt: z.string().optional(),
  checkedInBy: z.string().optional(),
  customerName: z.string(),
  customerEmail: z.string(),
  stallNumber: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  stall: z.any().optional(),
});

// Waitlist Entry Schema
export const WaitlistEntrySchema = z.object({
  id: z.string(),
  salesWindowId: z.string(),
  userId: z.string(),
  position: z.number(),
  requestedStalls: z.array(z.string()),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string().optional(),
  notifiedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(['WAITING', 'NOTIFIED', 'CONVERTED', 'EXPIRED', 'CANCELLED']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Discount Schema
export const DiscountSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number(),
  maxUses: z.number().optional(),
  usedCount: z.number(),
  applicableTo: z.enum(['ALL', 'EVENT', 'ZONE', 'STALL']),
  minOrderAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// TypeScript Types
export type SalesWindow = z.infer<typeof SalesWindowSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;
export type Discount = z.infer<typeof DiscountSchema>;

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type TicketStatus = 'ISSUED' | 'CHECKED_IN' | 'TRANSFERRED' | 'CANCELLED';
export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// API Request Types
export interface CreateSalesWindowRequest {
  eventId?: string;
  sessionId?: string;
  name: string;
  description?: string;
  opensAt: string;
  closesAt: string;
  maxCapacity?: number;
  perCustomerLimit?: number;
  earlyBirdPrice?: number;
  earlyBirdEnds?: string;
  lastMinutePrice?: number;
  lastMinuteStarts?: string;
  autoClose?: boolean;
}

export interface CreateOrderRequest {
  salesWindowId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  stallIds: string[];
  discountCode?: string;
}

export interface CheckoutRequest {
  orderId: string;
  paymentMethodId: string;
}

export interface ApplyDiscountRequest {
  code: string;
  orderAmount: number;
}

export interface CreateWaitlistEntryRequest {
  salesWindowId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  requestedStalls: string[];
}

export interface CheckinTicketRequest {
  ticketId: string;
  checkedInBy: string;
}

// API Response Types
export interface SalesWindowsResponse {
  success: boolean;
  data: SalesWindow[];
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TicketsResponse {
  success: boolean;
  data: Ticket[];
}

export interface WaitlistResponse {
  success: boolean;
  data: WaitlistEntry[];
}

export interface DiscountValidationResponse {
  success: boolean;
  data: {
    valid: boolean;
    discount?: Discount;
    discountAmount: number;
    finalAmount: number;
  };
}

// Utility Types
export interface PricingBreakdown {
  basePrice: number;
  earlyBirdDiscount?: number;
  lastMinuteSurcharge?: number;
  surcharges: number;
  discounts: number;
  tax: number;
  fees: number;
  total: number;
}

export interface SalesWindowStats {
  totalCapacity: number;
  soldStalls: number;
  availableStalls: number;
  waitlistCount: number;
  revenue: number;
  occupancyRate: number;
}

export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  ticketCount: number;
  createdAt: string;
  paidAt?: string;
}

// Constants
export const ORDER_STATUS_COLORS = {
  PENDING: '#F59E0B',
  CONFIRMED: '#10B981',
  CANCELLED: '#EF4444',
  EXPIRED: '#6B7280',
  REFUNDED: '#8B5CF6',
} as const;

export const PAYMENT_STATUS_COLORS = {
  PENDING: '#F59E0B',
  PROCESSING: '#3B82F6',
  SUCCEEDED: '#10B981',
  FAILED: '#EF4444',
  CANCELLED: '#6B7280',
  REFUNDED: '#8B5CF6',
} as const;

export const TICKET_STATUS_COLORS = {
  ISSUED: '#3B82F6',
  CHECKED_IN: '#10B981',
  TRANSFERRED: '#8B5CF6',
  CANCELLED: '#EF4444',
} as const;

export const WAITLIST_STATUS_COLORS = {
  WAITING: '#F59E0B',
  NOTIFIED: '#3B82F6',
  CONVERTED: '#10B981',
  EXPIRED: '#6B7280',
  CANCELLED: '#EF4444',
} as const;

// Helper Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getSalesWindowStatus = (window: SalesWindow): 'upcoming' | 'open' | 'closed' => {
  const now = new Date();
  const opensAt = new Date(window.opensAt);
  const closesAt = new Date(window.closesAt);
  
  if (now < opensAt) return 'upcoming';
  if (now > closesAt || !window.isActive) return 'closed';
  return 'open';
};

export const calculatePricing = (
  basePrice: number,
  window: SalesWindow,
  surcharges: number = 0,
  discountAmount: number = 0
): PricingBreakdown => {
  const now = new Date();
  let finalPrice = basePrice;
  let earlyBirdDiscount = 0;
  let lastMinuteSurcharge = 0;
  
  // Early bird pricing
  if (window.earlyBirdPrice && window.earlyBirdEnds) {
    const earlyBirdEnds = new Date(window.earlyBirdEnds);
    if (now <= earlyBirdEnds) {
      finalPrice = window.earlyBirdPrice;
      earlyBirdDiscount = basePrice - window.earlyBirdPrice;
    }
  }
  
  // Last minute pricing
  if (window.lastMinutePrice && window.lastMinuteStarts) {
    const lastMinuteStarts = new Date(window.lastMinuteStarts);
    if (now >= lastMinuteStarts) {
      finalPrice = window.lastMinutePrice;
      lastMinuteSurcharge = window.lastMinutePrice - basePrice;
    }
  }
  
  const subtotal = finalPrice + surcharges - discountAmount;
  const tax = subtotal * 0.08; // 8% tax
  const fees = subtotal * 0.03; // 3% processing fee
  const total = subtotal + tax + fees;
  
  return {
    basePrice,
    earlyBirdDiscount,
    lastMinuteSurcharge,
    surcharges,
    discounts: discountAmount,
    tax,
    fees,
    total,
  };
};
