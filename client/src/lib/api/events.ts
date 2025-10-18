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

// API Client Functions
const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

/**
 * Fetch coordinator's events
 */
export async function fetchCoordinatorEvents(): Promise<Event[]> {
  const response = await fetch(`${API_BASE}/events/coordinator`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch coordinator events: ${response.statusText}`);
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

/**
 * Fetch all events (paginated)
 */
export async function fetchEvents(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<EventsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  
  const response = await fetch(`${API_BASE}/events?${searchParams}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch single event by ID
 */
export async function fetchEvent(id: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.success ? data.data : data;
}

/**
 * Create a new event
 */
export async function createEvent(event: CreateEventRequest): Promise<Event> {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to create event');
  }
  
  const data = await response.json();
  return data.success ? data.data : data;
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, updates: Partial<CreateEventRequest>): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to update event');
  }
  
  const data = await response.json();
  return data.success ? data.data : data;
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to delete event');
  }
}

/**
 * Publish an event
 */
export async function publishEvent(id: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to publish event');
  }
  
  const data = await response.json();
  return data.success ? data.data : data;
}

/**
 * Unpublish an event
 */
export async function unpublishEvent(id: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}/unpublish`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to unpublish event');
  }
  
  const data = await response.json();
  return data.success ? data.data : data;
}

/**
 * Fetch vendor applications for coordinator's events
 */
export async function fetchApplications(eventId?: string): Promise<Application[]> {
  const url = eventId 
    ? `${API_BASE}/events/${eventId}/applications`
    : `${API_BASE}/events/applications`;
    
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch applications: ${response.statusText}`);
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

/**
 * Update vendor application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'WITHDRAWN',
  message?: string
): Promise<Application> {
  const response = await fetch(`${API_BASE}/events/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status, message }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to update application status');
  }
  
  return response.json();
}