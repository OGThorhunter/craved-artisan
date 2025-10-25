import { z } from 'zod';

// Refund Request Schema
export const RefundRequestSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  orderId: z.string(),
  customerId: z.string(),
  refundType: z.enum(['FULL', 'PARTIAL', 'CREDIT', 'EXCHANGE']),
  requestedAmount: z.number(),
  approvedAmount: z.number().optional(),
  processedAmount: z.number().optional(),
  reason: z.string(),
  category: z.enum(['CUSTOMER_REQUEST', 'EVENT_CANCELLATION', 'VENDOR_ISSUE', 'TECHNICAL_PROBLEM', 'POLICY_APPLICATION', 'DISPUTE_RESOLUTION', 'OTHER']),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED', 'FAILED']),
  requestedAt: z.string(),
  reviewedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  processedAt: z.string().optional(),
  processedBy: z.string().optional(),
  refundMethod: z.enum(['ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'CHECK', 'CREDIT_ACCOUNT', 'PAYPAL', 'OTHER']),
  refundTo: z.string().optional(),
  policyApplied: z.string().optional(),
  termsAccepted: z.boolean(),
  termsAcceptedAt: z.string().optional(),
  supportingDocs: z.array(z.string()),
  notes: z.string().optional(),
  stripeRefundId: z.string().optional(),
  stripeChargeId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.any().optional(),
  customer: z.any().optional(),
  reviewer: z.any().optional(),
  processor: z.any().optional(),
});

// Credit Schema
export const CreditSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  customerId: z.string(),
  creditType: z.enum(['REFUND', 'BONUS', 'ADJUSTMENT', 'PROMOTIONAL', 'COMPENSATION']),
  amount: z.number(),
  balance: z.number(),
  currency: z.string(),
  sourceRefundId: z.string().optional(),
  sourceOrderId: z.string().optional(),
  sourcePayoutId: z.string().optional(),
  expiresAt: z.string().optional(),
  isExpired: z.boolean(),
  status: z.enum(['ACTIVE', 'USED', 'EXPIRED', 'CANCELLED', 'PENDING']),
  createdAt: z.string(),
  updatedAt: z.string(),
  customer: z.any().optional(),
  sourceRefund: z.any().optional(),
  sourceOrder: z.any().optional(),
});

// Payout Schema
export const PayoutSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  vendorId: z.string(),
  payoutType: z.enum(['REVENUE_SHARE', 'COMMISSION', 'FIXED_FEE', 'BONUS', 'ADJUSTMENT']),
  grossAmount: z.number(),
  platformFee: z.number(),
  processingFee: z.number(),
  taxWithheld: z.number(),
  netAmount: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED', 'PROCESSED']),
  requestedAt: z.string(),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  processedAt: z.string().optional(),
  completedAt: z.string().optional(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'STRIPE_CONNECT', 'PAYPAL', 'CHECK', 'WIRE_TRANSFER', 'OTHER']),
  bankAccount: z.string().optional(),
  paymentReference: z.string().optional(),
  stripeTransferId: z.string().optional(),
  stripeAccountId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  vendorNotes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  vendor: z.any().optional(),
  approver: z.any().optional(),
  payoutItems: z.array(z.any()).optional(),
});

// TypeScript Types
export type RefundRequest = z.infer<typeof RefundRequestSchema>;
export type Credit = z.infer<typeof CreditSchema>;
export type Payout = z.infer<typeof PayoutSchema>;

export type RefundType = 'FULL' | 'PARTIAL' | 'CREDIT' | 'EXCHANGE';
export type RefundCategory = 'CUSTOMER_REQUEST' | 'EVENT_CANCELLATION' | 'VENDOR_ISSUE' | 'TECHNICAL_PROBLEM' | 'POLICY_APPLICATION' | 'DISPUTE_RESOLUTION' | 'OTHER';
export type RefundStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'FAILED';
export type RefundMethod = 'ORIGINAL_PAYMENT' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_ACCOUNT' | 'PAYPAL' | 'OTHER';
export type CreditType = 'REFUND' | 'BONUS' | 'ADJUSTMENT' | 'PROMOTIONAL' | 'COMPENSATION';
export type CreditStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
export type PayoutType = 'REVENUE_SHARE' | 'COMMISSION' | 'FIXED_FEE' | 'BONUS' | 'ADJUSTMENT';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REJECTED' | 'PROCESSED';

// API Request Types
export interface CreateRefundRequest {
  eventId: string;
  orderId: string;
  customerId: string;
  refundType?: RefundType;
  requestedAmount: number;
  reason: string;
  category: RefundCategory;
  description?: string;
  refundMethod?: RefundMethod;
  refundTo?: string;
  supportingDocs?: string[];
  notes?: string;
}

export interface ProcessRefundRequest {
  refundId: string;
  approvedAmount: number;
  refundMethod: RefundMethod;
  refundTo?: string;
  notes?: string;
}

export interface CreateCreditRequest {
  eventId: string;
  customerId: string;
  creditType?: CreditType;
  amount: number;
  sourceRefundId?: string;
  sourceOrderId?: string;
  expiresAt?: string;
  description?: string;
}

export interface CreatePayoutRequest {
  eventId: string;
  vendorId: string;
  payoutType?: PayoutType;
  periodStart: string;
  periodEnd: string;
  paymentMethod?: 'BANK_TRANSFER' | 'STRIPE_CONNECT' | 'PAYPAL' | 'CHECK' | 'WIRE_TRANSFER' | 'OTHER';
  bankAccount?: string;
  notes?: string;
}

// Constants
export const REFUND_STATUS_COLORS = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  PROCESSING: '#3B82F6',
  COMPLETED: '#10B981',
  REJECTED: '#EF4444',
  CANCELLED: '#6B7280',
  FAILED: '#EF4444',
} as const;

export const REFUND_CATEGORY_COLORS = {
  CUSTOMER_REQUEST: '#3B82F6',
  EVENT_CANCELLATION: '#EF4444',
  VENDOR_ISSUE: '#F59E0B',
  TECHNICAL_PROBLEM: '#8B5CF6',
  POLICY_APPLICATION: '#10B981',
  DISPUTE_RESOLUTION: '#F97316',
  OTHER: '#6B7280',
} as const;

export const CREDIT_STATUS_COLORS = {
  ACTIVE: '#10B981',
  USED: '#3B82F6',
  EXPIRED: '#6B7280',
  CANCELLED: '#EF4444',
  PENDING: '#F59E0B',
} as const;

export const PAYOUT_STATUS_COLORS = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  PROCESSING: '#3B82F6',
  COMPLETED: '#10B981',
  FAILED: '#EF4444',
  CANCELLED: '#6B7280',
  REJECTED: '#EF4444',
} as const;

export const REFUND_CATEGORY_ICONS = {
  CUSTOMER_REQUEST: '👤',
  EVENT_CANCELLATION: '❌',
  VENDOR_ISSUE: '🏪',
  TECHNICAL_PROBLEM: '🔧',
  POLICY_APPLICATION: '📋',
  DISPUTE_RESOLUTION: '⚖️',
  OTHER: '❓',
} as const;

export const CREDIT_TYPE_ICONS = {
  REFUND: '💰',
  BONUS: '🎁',
  ADJUSTMENT: '⚖️',
  PROMOTIONAL: '🎉',
  COMPENSATION: '💸',
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

export const getRefundStats = (refunds: RefundRequest[]) => {
  return {
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'PENDING').length,
    approved: refunds.filter(r => r.status === 'APPROVED').length,
    completed: refunds.filter(r => r.status === 'COMPLETED').length,
    rejected: refunds.filter(r => r.status === 'REJECTED').length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.processedAmount || r.approvedAmount || r.requestedAmount), 0),
  };
};

export const getCreditStats = (credits: Credit[]) => {
  return {
    total: credits.length,
    active: credits.filter(c => c.status === 'ACTIVE').length,
    used: credits.filter(c => c.status === 'USED').length,
    expired: credits.filter(c => c.status === 'EXPIRED').length,
    totalBalance: credits.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + c.balance, 0),
  };
};

export const getPayoutStats = (payouts: Payout[]) => {
  return {
    total: payouts.length,
    pending: payouts.filter(p => p.status === 'PENDING').length,
    approved: payouts.filter(p => p.status === 'APPROVED').length,
    completed: payouts.filter(p => p.status === 'COMPLETED').length,
    failed: payouts.filter(p => p.status === 'FAILED').length,
    totalAmount: payouts.reduce((sum, p) => sum + p.netAmount, 0),
  };
};

export const calculateRefundAmount = (
  originalAmount: number,
  refundType: RefundType,
  policyPercentage?: number
): number => {
  if (refundType === 'FULL') return originalAmount;
  if (refundType === 'PARTIAL' && policyPercentage) {
    return originalAmount * (policyPercentage / 100);
  }
  return originalAmount;
};

export const isRefundEligible = (
  refund: RefundRequest,
  eventDate: string,
  cancellationPolicy: any
): boolean => {
  const now = new Date();
  const event = new Date(eventDate);
  const daysUntilEvent = Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (cancellationPolicy) {
    return daysUntilEvent >= cancellationPolicy.daysBeforeEvent;
  }
  
  return true;
};

export const getRefundPolicyText = (policy: any): string => {
  if (!policy) return 'No refund policy specified';
  
  const days = policy.daysBeforeEvent;
  const percentage = policy.refundPercentage;
  
  return `Full refund if cancelled ${days}+ days before event, ${percentage}% refund otherwise`;
};
