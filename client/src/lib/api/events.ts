import { z } from 'zod';

// API Response Types
export const EventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  venue: z.string(),
  address: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published', 'active', 'completed', 'cancelled']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number().optional(),
  tags: z.array(z.string()).optional(),
  rules: z.string().optional(),
  coverImage: z.string().optional(),
  imageUrl: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.string().optional(),
  recurrenceType: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  sessions: z.array(z.any()).optional(),
  applicationCount: z.number().optional(),
  // Enhanced fields
  eventType: z.string().optional(),
  vendorSignupDeadline: z.string().optional(),
  siteMap: z.any().optional(),
  venueInfo: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  setupInstructions: z.string().optional(),
  takedownInstructions: z.string().optional(),
  setupStartTime: z.string().optional(),
  takedownEndTime: z.string().optional(),
  venueType: z.string().optional(),
  weatherForecast: z.string().optional(),
  evacuationRoute: z.string().optional(),
  fireMarshalCapacity: z.string().optional(),
  fireMarshalSafetyItems: z.string().optional(),
  vendorContract: z.string().optional(),
  safetyRequirements: z.string().optional(),
});

export const EventSessionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  maxCapacity: z.number().optional(),
  overridePrice: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ApplicationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  businessName: z.string(),
  contactName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  category: z.string(),
  description: z.string().optional(),
  products: z.array(z.string()),
  status: z.enum(['PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN']),
  documents: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// TypeScript Types
export type Event = z.infer<typeof EventResponseSchema>;
export type EventSession = z.infer<typeof EventSessionSchema>;
export type Application = z.infer<typeof ApplicationSchema>;

// API Request Types
export interface CreateEventRequest {
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  maxCapacity?: number;
  categories?: string[];
  rules?: string;
  coverImage?: string;
  isRecurring?: boolean;
  recurrenceType?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  overridePrice?: number;
}

export interface SubmitApplicationRequest {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  category: string;
  description?: string;
  products?: string[];
}

export interface EventsListResponse {
  success: boolean;
  data: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApplicationsListResponse {
  success: boolean;
  data: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
