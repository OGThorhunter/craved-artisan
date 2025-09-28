import { z } from 'zod';

// Check-in Session Schema
export const CheckinSessionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  staffId: z.string(),
  sessionName: z.string(),
  location: z.string().optional(),
  deviceInfo: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ENDED', 'OFFLINE']),
  isOffline: z.boolean(),
  lastSyncAt: z.string().optional(),
  pendingCheckins: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  staff: z.any().optional(),
});

// Check-in Schema
export const CheckinSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  ticketId: z.string(),
  customerId: z.string(),
  checkinTime: z.string(),
  method: z.enum(['QR_SCAN', 'MANUAL', 'PHONE', 'EMAIL', 'ID_SCAN']),
  deviceType: z.string().optional(),
  location: z.string().optional(),
  coordinates: z.string().optional(),
  status: z.enum(['COMPLETED', 'FAILED', 'VERIFIED', 'DISPUTED', 'CANCELLED']),
  notes: z.string().optional(),
  isOffline: z.boolean(),
  syncedAt: z.string().optional(),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  ticket: z.any().optional(),
  customer: z.any().optional(),
  verifier: z.any().optional(),
});

// Incident Schema
export const IncidentSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  sessionId: z.string().optional(),
  incidentType: z.enum(['TECHNICAL', 'SECURITY', 'CUSTOMER', 'VENDOR', 'FACILITY', 'MEDICAL', 'SAFETY', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  coordinates: z.string().optional(),
  stallId: z.string().optional(),
  reportedBy: z.string(),
  reportedAt: z.string(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']),
  assignedTo: z.string().optional(),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
  resolution: z.string().optional(),
  followUpRequired: z.boolean(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  isOffline: z.boolean(),
  syncedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reporter: z.any().optional(),
  assignee: z.any().optional(),
  resolver: z.any().optional(),
});

// Lost & Found Item Schema
export const LostFoundItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  itemType: z.enum(['ELECTRONICS', 'CLOTHING', 'ACCESSORIES', 'DOCUMENTS', 'FOOD', 'PERSONAL', 'OTHER']),
  description: z.string(),
  location: z.string().optional(),
  status: z.enum(['FOUND', 'CLAIMED', 'DISPOSED', 'TRANSFERRED']),
  foundBy: z.string().optional(),
  foundAt: z.string().optional(),
  foundLocation: z.string().optional(),
  claimedBy: z.string().optional(),
  claimedAt: z.string().optional(),
  claimerContact: z.string().optional(),
  storageLocation: z.string().optional(),
  storageNotes: z.string().optional(),
  isOffline: z.boolean(),
  syncedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  finder: z.any().optional(),
  claimer: z.any().optional(),
});

// TypeScript Types
export type CheckinSession = z.infer<typeof CheckinSessionSchema>;
export type Checkin = z.infer<typeof CheckinSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type LostFoundItem = z.infer<typeof LostFoundItemSchema>;

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'ENDED' | 'OFFLINE';
export type CheckinMethod = 'QR_SCAN' | 'MANUAL' | 'PHONE' | 'EMAIL' | 'ID_SCAN';
export type CheckinStatus = 'COMPLETED' | 'FAILED' | 'VERIFIED' | 'DISPUTED' | 'CANCELLED';
export type IncidentType = 'TECHNICAL' | 'SECURITY' | 'CUSTOMER' | 'VENDOR' | 'FACILITY' | 'MEDICAL' | 'SAFETY' | 'OTHER';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type LostFoundType = 'ELECTRONICS' | 'CLOTHING' | 'ACCESSORIES' | 'DOCUMENTS' | 'FOOD' | 'PERSONAL' | 'OTHER';
export type LostFoundStatus = 'FOUND' | 'CLAIMED' | 'DISPOSED' | 'TRANSFERRED';
export type ScanResult = 'SUCCESS' | 'INVALID' | 'ALREADY_USED' | 'EXPIRED' | 'NOT_FOUND' | 'ERROR';

// API Request Types
export interface CreateCheckinSessionRequest {
  eventId: string;
  sessionName: string;
  location?: string;
  deviceInfo?: string;
}

export interface ScanQRCodeRequest {
  qrCode: string;
  sessionId: string;
  location?: string;
  coordinates?: string;
  deviceType?: string;
}

export interface CreateIncidentRequest {
  eventId: string;
  sessionId?: string;
  incidentType: IncidentType;
  severity?: IncidentSeverity;
  title: string;
  description: string;
  location?: string;
  coordinates?: string;
  stallId?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface CreateLostFoundRequest {
  eventId: string;
  itemType: LostFoundType;
  description: string;
  location?: string;
  foundLocation?: string;
  storageLocation?: string;
  storageNotes?: string;
}

// Constants
export const SESSION_STATUS_COLORS = {
  ACTIVE: '#10B981',
  PAUSED: '#F59E0B',
  ENDED: '#6B7280',
  OFFLINE: '#EF4444',
} as const;

export const CHECKIN_STATUS_COLORS = {
  COMPLETED: '#10B981',
  FAILED: '#EF4444',
  VERIFIED: '#3B82F6',
  DISPUTED: '#F59E0B',
  CANCELLED: '#6B7280',
} as const;

export const INCIDENT_SEVERITY_COLORS = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626',
} as const;

export const INCIDENT_STATUS_COLORS = {
  OPEN: '#EF4444',
  IN_PROGRESS: '#F59E0B',
  RESOLVED: '#10B981',
  CLOSED: '#6B7280',
  CANCELLED: '#8B5CF6',
} as const;

export const INCIDENT_TYPE_ICONS = {
  TECHNICAL: '🔧',
  SECURITY: '🛡️',
  CUSTOMER: '👤',
  VENDOR: '🏪',
  FACILITY: '🏢',
  MEDICAL: '🏥',
  SAFETY: '⚠️',
  OTHER: '📋',
} as const;

export const LOST_FOUND_TYPE_ICONS = {
  ELECTRONICS: '📱',
  CLOTHING: '👕',
  ACCESSORIES: '💍',
  DOCUMENTS: '📄',
  FOOD: '🍔',
  PERSONAL: '🎒',
  OTHER: '📦',
} as const;

// Helper Functions
export const formatCheckinTime = (checkinTime: string): string => {
  return new Date(checkinTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatIncidentTime = (reportedAt: string): string => {
  const date = new Date(reportedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

export const getIncidentPriority = (severity: IncidentSeverity): number => {
  const priorities = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };
  return priorities[severity];
};

export const isIncidentUrgent = (incident: Incident): boolean => {
  return incident.severity === 'CRITICAL' || 
         (incident.severity === 'HIGH' && incident.status === 'OPEN');
};

export const getCheckinStats = (checkins: Checkin[]) => {
  return {
    total: checkins.length,
    completed: checkins.filter(c => c.status === 'COMPLETED').length,
    failed: checkins.filter(c => c.status === 'FAILED').length,
    verified: checkins.filter(c => c.status === 'VERIFIED').length,
    disputed: checkins.filter(c => c.status === 'DISPUTED').length,
  };
};

export const getIncidentStats = (incidents: Incident[]) => {
  return {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'OPEN').length,
    inProgress: incidents.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    critical: incidents.filter(i => i.severity === 'CRITICAL').length,
    high: incidents.filter(i => i.severity === 'HIGH').length,
  };
};

// QR Code Generation
export const generateQRCode = (ticketId: string): string => {
  // In a real implementation, this would generate a proper QR code
  return `QR:${ticketId}:${Date.now()}`;
};

// Offline Support
export interface OfflineCache {
  tickets: any[];
  stalls: any[];
  customers: any[];
  staff: any[];
  incidents: Incident[];
  settings: Record<string, any>;
}

export const createOfflineCache = (): OfflineCache => ({
  tickets: [],
  stalls: [],
  customers: [],
  staff: [],
  incidents: [],
  settings: {},
});

export const isOfflineMode = (): boolean => {
  return !navigator.onLine;
};

export const syncOfflineData = async (cacheData: OfflineCache): Promise<boolean> => {
  try {
    // In a real implementation, this would sync with the server
    console.log('Syncing offline data:', cacheData);
    return true;
  } catch (error) {
    console.error('Failed to sync offline data:', error);
    return false;
  }
};
