import { z } from 'zod';

// Hold Schema
export const HoldSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  stallId: z.string(),
  userId: z.string(),
  holdType: z.enum(['TEMPORARY', 'MANUAL', 'PAYMENT', 'REVIEW']),
  reason: z.string().optional(),
  notes: z.string().optional(),
  placedAt: z.string(),
  expiresAt: z.string(),
  releasedAt: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'RELEASED', 'CONVERTED']),
  createdAt: z.string(),
  updatedAt: z.string(),
  stall: z.any().optional(),
  user: z.any().optional(),
});

// Document Schema
export const DocumentSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  uploadedBy: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  filePath: z.string(),
  documentType: z.enum(['COI', 'PERMIT', 'LICENSE', 'CONTRACT', 'AGREEMENT', 'OTHER']),
  category: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  accessLevel: z.enum(['PUBLIC', 'VENDOR', 'COORDINATOR', 'ADMIN']),
  uploadedAt: z.string(),
  updatedAt: z.string(),
  user: z.any().optional(),
});

// Bulk Operation Schema
export const BulkOperationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  operatorId: z.string(),
  operationType: z.enum(['PRICE_UPDATE', 'STATUS_CHANGE', 'ZONE_ASSIGNMENT', 'HOLD_PLACEMENT', 'HOLD_RELEASE']),
  description: z.string(),
  targetType: z.string(),
  targetIds: z.array(z.string()),
  operationData: z.record(z.any()),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  successCount: z.number(),
  failureCount: z.number(),
  totalCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Assignment Schema
export const AssignmentSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  stallId: z.string(),
  vendorId: z.string(),
  assignmentType: z.enum(['MANUAL', 'AUTO', 'WAITLIST', 'REASSIGNMENT']),
  assignedBy: z.string(),
  assignedAt: z.string(),
  status: z.enum(['ACTIVE', 'PENDING', 'CONFIRMED', 'CANCELLED', 'TRANSFERRED']),
  priceOverride: z.number().optional(),
  specialNotes: z.string().optional(),
  notifiedAt: z.string().optional(),
  acknowledgedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  stall: z.any().optional(),
  vendor: z.any().optional(),
  assigner: z.any().optional(),
});

// TypeScript Types
export type Hold = z.infer<typeof HoldSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type BulkOperation = z.infer<typeof BulkOperationSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;

export type HoldType = 'TEMPORARY' | 'MANUAL' | 'PAYMENT' | 'REVIEW';
export type HoldStatus = 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'CONVERTED';
export type DocumentType = 'COI' | 'PERMIT' | 'LICENSE' | 'CONTRACT' | 'AGREEMENT' | 'OTHER';
export type BulkOperationType = 'PRICE_UPDATE' | 'STATUS_CHANGE' | 'ZONE_ASSIGNMENT' | 'HOLD_PLACEMENT' | 'HOLD_RELEASE';
export type OperationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type AssignmentStatus = 'ACTIVE' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'TRANSFERRED';

// API Request Types
export interface CreateHoldRequest {
  eventId: string;
  stallId: string;
  userId: string;
  holdType?: HoldType;
  reason?: string;
  notes?: string;
  expiresAt: string;
}

export interface UpdateHoldRequest {
  status?: HoldStatus;
  reason?: string;
  notes?: string;
  expiresAt?: string;
}

export interface BulkOperationRequest {
  eventId: string;
  operationType: BulkOperationType;
  description: string;
  targetType: string;
  targetIds: string[];
  operationData: Record<string, any>;
}

export interface CreateAssignmentRequest {
  eventId: string;
  stallId: string;
  vendorId: string;
  assignmentType?: 'MANUAL' | 'AUTO' | 'WAITLIST' | 'REASSIGNMENT';
  priceOverride?: number;
  specialNotes?: string;
}

// Constants
export const HOLD_STATUS_COLORS = {
  ACTIVE: '#F59E0B',
  EXPIRED: '#6B7280',
  RELEASED: '#10B981',
  CONVERTED: '#3B82F6',
} as const;

export const HOLD_TYPE_COLORS = {
  TEMPORARY: '#F59E0B',
  MANUAL: '#EF4444',
  PAYMENT: '#3B82F6',
  REVIEW: '#8B5CF6',
} as const;

export const OPERATION_STATUS_COLORS = {
  PENDING: '#F59E0B',
  RUNNING: '#3B82F6',
  COMPLETED: '#10B981',
  FAILED: '#EF4444',
  CANCELLED: '#6B7280',
} as const;

export const DOCUMENT_TYPE_ICONS = {
  COI: '📄',
  PERMIT: '📋',
  LICENSE: '🏷️',
  CONTRACT: '📝',
  AGREEMENT: '🤝',
  OTHER: '📁',
} as const;

// Helper Functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getHoldExpiryStatus = (expiresAt: string): 'expired' | 'expiring-soon' | 'active' => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 0) return 'expired';
  if (diffHours < 24) return 'expiring-soon';
  return 'active';
};

export const getOperationProgress = (operation: BulkOperation): number => {
  if (operation.totalCount === 0) return 0;
  return Math.round(((operation.successCount + operation.failureCount) / operation.totalCount) * 100);
};
