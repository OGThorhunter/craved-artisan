import { z } from 'zod';

// Customer Management
export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['lead', 'prospect', 'customer', 'vip', 'inactive']),
  source: z.enum(['organic', 'referral', 'advertisement', 'social', 'email', 'direct', 'event']),
  tags: z.array(z.string()),
  customFields: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastContactAt: z.string().optional(),
  totalOrders: z.number().default(0),
  totalSpent: z.number().default(0),
  averageOrderValue: z.number().default(0),
  lifetimeValue: z.number().default(0),
  preferredContactMethod: z.enum(['email', 'phone', 'sms', 'whatsapp']).optional(),
  timezone: z.string().optional(),
  language: z.string().default('en'),
  notes: z.string().optional(),
  assignedTo: z.string().optional(), // vendor ID
  leadScore: z.number().min(0).max(100).default(0),
  isVip: z.boolean().default(false),
  isBlacklisted: z.boolean().default(false),
});

export type Customer = z.infer<typeof CustomerSchema>;

// Contact Management
export const ContactSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  type: z.enum(['email', 'phone', 'meeting', 'note', 'task', 'support']),
  direction: z.enum(['inbound', 'outbound']),
  subject: z.string(),
  content: z.string(),
  outcome: z.enum(['positive', 'neutral', 'negative', 'follow_up_required']).optional(),
  scheduledAt: z.string().optional(),
  completedAt: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Contact = z.infer<typeof ContactSchema>;

// Sales Pipeline
export const OpportunitySchema = z.object({
  id: z.string(),
  customerId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  stage: z.enum(['lead', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  value: z.number().min(0),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string(),
  actualCloseDate: z.string().optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()),
  customFields: z.record(z.any()),
  status: z.enum(['active', 'on_hold', 'cancelled']).default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastActivityAt: z.string(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

// Task Management
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['call', 'email', 'meeting', 'follow_up', 'proposal', 'demo', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  assignedTo: z.string().optional(),
  customerId: z.string().optional(),
  opportunityId: z.string().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
  reminderAt: z.string().optional(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;

// Communication Templates
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['email', 'sms', 'whatsapp', 'letter']),
  category: z.enum(['welcome', 'follow_up', 'promotion', 'support', 'invoice', 'reminder']),
  subject: z.string().optional(),
  content: z.string(),
  variables: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Template = z.infer<typeof TemplateSchema>;

// Campaign Management
export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['email', 'sms', 'social', 'direct_mail', 'event']),
  status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled']),
  targetAudience: z.object({
    segments: z.array(z.string()),
    filters: z.record(z.any()),
    count: z.number(),
  }),
  content: z.object({
    subject: z.string().optional(),
    body: z.string(),
    attachments: z.array(z.string()),
  }),
  schedule: z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
    timezone: z.string(),
  }),
  metrics: z.object({
    sent: z.number().default(0),
    delivered: z.number().default(0),
    opened: z.number().default(0),
    clicked: z.number().default(0),
    converted: z.number().default(0),
    unsubscribed: z.number().default(0),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Analytics & Reporting
export const CRMAnalyticsSchema = z.object({
  period: z.string(),
  customers: z.object({
    total: z.number(),
    new: z.number(),
    active: z.number(),
    churned: z.number(),
    growth: z.number(),
  }),
  sales: z.object({
    totalRevenue: z.number(),
    averageOrderValue: z.number(),
    conversionRate: z.number(),
    pipelineValue: z.number(),
    closedWon: z.number(),
    closedLost: z.number(),
  }),
  activities: z.object({
    totalContacts: z.number(),
    emailsSent: z.number(),
    callsMade: z.number(),
    meetingsScheduled: z.number(),
    tasksCompleted: z.number(),
  }),
  performance: z.object({
    responseTime: z.number(),
    followUpRate: z.number(),
    customerSatisfaction: z.number(),
    leadConversionRate: z.number(),
  }),
});

export type CRMAnalytics = z.infer<typeof CRMAnalyticsSchema>;

// Export all schemas for runtime validation
export const CRMSchemas = {
  Customer: CustomerSchema,
  Contact: ContactSchema,
  Opportunity: OpportunitySchema,
  Task: TaskSchema,
  Template: TemplateSchema,
  Campaign: CampaignSchema,
  Analytics: CRMAnalyticsSchema,
} as const;
















