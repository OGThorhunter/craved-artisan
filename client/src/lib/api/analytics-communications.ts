import { z } from 'zod';

// Event Analytics Schema
export const EventAnalyticsSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  totalViews: z.number(),
  uniqueVisitors: z.number(),
  holdsCreated: z.number(),
  cartsCreated: z.number(),
  ordersCompleted: z.number(),
  totalRevenue: z.number(),
  viewToHoldRate: z.number(),
  holdToCartRate: z.number(),
  cartToOrderRate: z.number(),
  overallConversionRate: z.number(),
  dropoffViews: z.number(),
  dropoffHolds: z.number(),
  dropoffCarts: z.number(),
  avgSessionDuration: z.number(),
  avgTimeToPurchase: z.number(),
  peakTrafficHour: z.number().optional(),
  mobileTraffic: z.number(),
  desktopTraffic: z.number(),
  tabletTraffic: z.number(),
  topCountries: z.array(z.string()),
  topCities: z.array(z.string()),
  utmSources: z.array(z.string()),
  utmMediums: z.array(z.string()),
  utmCampaigns: z.array(z.string()),
  calculatedAt: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Zone Analytics Schema
export const ZoneAnalyticsSchema = z.object({
  id: z.string(),
  eventAnalyticsId: z.string(),
  zoneId: z.string(),
  totalViews: z.number(),
  uniqueVisitors: z.number(),
  holdsCreated: z.number(),
  ordersCompleted: z.number(),
  revenue: z.number(),
  conversionRate: z.number(),
  avgOrderValue: z.number(),
  sellThroughRate: z.number(),
  timeToSell: z.number(),
  avgPrice: z.number(),
  priceRange: z.string().optional(),
  dynamicPricingChanges: z.number(),
  totalStalls: z.number(),
  occupiedStalls: z.number(),
  occupancyRate: z.number(),
  heatmapData: z.string().optional(),
  calculatedAt: z.string(),
  zone: z.any().optional(),
});

// Funnel Step Schema
export const FunnelStepSchema = z.object({
  id: z.string(),
  eventAnalyticsId: z.string(),
  stepName: z.string(),
  stepOrder: z.number(),
  totalVisitors: z.number(),
  completedStep: z.number(),
  droppedOff: z.number(),
  conversionRate: z.number(),
  avgTimeOnStep: z.number(),
  medianTimeOnStep: z.number(),
  mobileCompletions: z.number(),
  desktopCompletions: z.number(),
  tabletCompletions: z.number(),
  calculatedAt: z.string(),
});

// Pace Tracking Schema
export const PaceTrackingSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  salesGoal: z.number(),
  ordersGoal: z.number(),
  stallsGoal: z.number(),
  currentRevenue: z.number(),
  currentOrders: z.number(),
  currentStalls: z.number(),
  revenueProgress: z.number(),
  ordersProgress: z.number(),
  stallsProgress: z.number(),
  daysRemaining: z.number(),
  avgDailyRevenue: z.number(),
  requiredDailyRevenue: z.number(),
  paceStatus: z.enum(['ON_TRACK', 'AHEAD', 'BEHIND', 'AT_RISK']),
  projectedRevenue: z.number(),
  projectedOrders: z.number(),
  projectedStalls: z.number(),
  confidenceLevel: z.number(),
  calculatedAt: z.string(),
  goalSetAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// UTM Attribution Schema
export const UTMAttributionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  utmSource: z.string(),
  utmMedium: z.string(),
  utmCampaign: z.string(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  totalClicks: z.number(),
  totalViews: z.number(),
  totalOrders: z.number(),
  totalRevenue: z.number(),
  clickThroughRate: z.number(),
  conversionRate: z.number(),
  costPerClick: z.number().optional(),
  returnOnAdSpend: z.number().optional(),
  adSpend: z.number().optional(),
  costPerOrder: z.number().optional(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Broadcast Message Schema
export const BroadcastMessageSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  senderId: z.string(),
  messageType: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
  subject: z.string().optional(),
  content: z.string(),
  template: z.string().optional(),
  targetAudience: z.enum(['ALL_ATTENDEES', 'VENDORS_ONLY', 'CUSTOMERS_ONLY', 'SPECIFIC_GROUP', 'CUSTOM_CRITERIA']),
  targetCriteria: z.string().optional(),
  recipientCount: z.number(),
  scheduledFor: z.string().optional(),
  sentAt: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED']),
  deliveredCount: z.number(),
  openedCount: z.number(),
  clickedCount: z.number(),
  bouncedCount: z.number(),
  unsubscribedCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sender: z.any().optional(),
});

// Message Template Schema
export const MessageTemplateSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  templateName: z.string(),
  templateType: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
  subject: z.string().optional(),
  content: z.string(),
  variables: z.array(z.string()),
  usageCount: z.number(),
  lastUsedAt: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// TypeScript Types
export type EventAnalytics = z.infer<typeof EventAnalyticsSchema>;
export type ZoneAnalytics = z.infer<typeof ZoneAnalyticsSchema>;
export type FunnelStep = z.infer<typeof FunnelStepSchema>;
export type PaceTracking = z.infer<typeof PaceTrackingSchema>;
export type UTMAttribution = z.infer<typeof UTMAttributionSchema>;
export type BroadcastMessage = z.infer<typeof BroadcastMessageSchema>;
export type MessageTemplate = z.infer<typeof MessageTemplateSchema>;

export type PaceStatus = 'ON_TRACK' | 'AHEAD' | 'BEHIND' | 'AT_RISK';
export type MessageType = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type TargetAudience = 'ALL_ATTENDEES' | 'VENDORS_ONLY' | 'CUSTOMERS_ONLY' | 'SPECIFIC_GROUP' | 'CUSTOM_CRITERIA';
export type MessageStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

// API Request Types
export interface CreateBroadcastMessageRequest {
  eventId: string;
  messageType?: MessageType;
  subject?: string;
  content: string;
  template?: string;
  targetAudience?: TargetAudience;
  targetCriteria?: string;
  scheduledFor?: string;
}

export interface CreateMessageTemplateRequest {
  eventId: string;
  templateName: string;
  templateType?: MessageType;
  subject?: string;
  content: string;
  variables?: string[];
}

export interface SetPaceGoalRequest {
  eventId: string;
  salesGoal: number;
  ordersGoal: number;
  stallsGoal: number;
}

// Constants
export const PACE_STATUS_COLORS = {
  ON_TRACK: '#10B981',
  AHEAD: '#3B82F6',
  BEHIND: '#F59E0B',
  AT_RISK: '#EF4444',
} as const;

export const MESSAGE_STATUS_COLORS = {
  DRAFT: '#6B7280',
  SCHEDULED: '#F59E0B',
  SENDING: '#3B82F6',
  SENT: '#10B981',
  FAILED: '#EF4444',
  CANCELLED: '#8B5CF6',
} as const;

export const MESSAGE_TYPE_ICONS = {
  EMAIL: '📧',
  SMS: '📱',
  PUSH: '🔔',
  IN_APP: '💬',
} as const;

export const TARGET_AUDIENCE_ICONS = {
  ALL_ATTENDEES: '👥',
  VENDORS_ONLY: '🏪',
  CUSTOMERS_ONLY: '👤',
  SPECIFIC_GROUP: '🎯',
  CUSTOM_CRITERIA: '⚙️',
} as const;

// Helper Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateString: string): string => {
  // Format date for display
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const getPaceStatusColor = (status: PaceStatus): string => {
  return PACE_STATUS_COLORS[status];
};

export const getPaceStatusText = (status: PaceStatus): string => {
  const texts = {
    ON_TRACK: 'On Track',
    AHEAD: 'Ahead of Goal',
    BEHIND: 'Behind Goal',
    AT_RISK: 'At Risk',
  };
  return texts[status];
};

export const getMessageStatusColor = (status: MessageStatus): string => {
  return MESSAGE_STATUS_COLORS[status];
};

export const getMessageStatusText = (status: MessageStatus): string => {
  const texts = {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    SENDING: 'Sending',
    SENT: 'Sent',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  };
  return texts[status];
};

export const getMessageTypeIcon = (type: MessageType): string => {
  return MESSAGE_TYPE_ICONS[type];
};

export const getTargetAudienceIcon = (audience: TargetAudience): string => {
  return TARGET_AUDIENCE_ICONS[audience];
};

export const calculateConversionRate = (converted: number, total: number): number => {
  return total > 0 ? (converted / total) * 100 : 0;
};

export const calculatePaceStatus = (
  current: number,
  goal: number,
  daysRemaining: number,
  totalDays: number
): PaceStatus => {
  const progress = current / goal;
  const timeProgress = (totalDays - daysRemaining) / totalDays;
  
  if (progress >= 1.1) return 'AHEAD';
  if (progress >= 0.9 && progress <= 1.1) return 'ON_TRACK';
  if (progress >= 0.7) return 'BEHIND';
  return 'AT_RISK';
};

export const getHeatmapData = (heatmapJson: string | null): any => {
  if (!heatmapJson) return { hot: [], warm: [], cold: [] };
  try {
    return JSON.parse(heatmapJson);
  } catch {
    return { hot: [], warm: [], cold: [] };
  }
};

export const getUTMSourceIcon = (source: string): string => {
  const icons: Record<string, string> = {
    google: '🔍',
    facebook: '📘',
    instagram: '📷',
    twitter: '🐦',
    linkedin: '💼',
    email: '📧',
    direct: '🔗',
    organic: '🌱',
    referral: '🔗',
  };
  return icons[source.toLowerCase()] || '📊';
};

export const getUTMMediumIcon = (medium: string): string => {
  const icons: Record<string, string> = {
    cpc: '💰',
    social: '📱',
    email: '📧',
    organic: '🌱',
    referral: '🔗',
    display: '🖼️',
    video: '🎥',
    audio: '🎵',
  };
  return icons[medium.toLowerCase()] || '📊';
};

export const formatUTMCampaign = (campaign: string): string => {
  return campaign.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getFunnelDropoffRate = (step: FunnelStep, previousStep?: FunnelStep): number => {
  if (!previousStep) return 0;
  return ((previousStep.completedStep - step.completedStep) / previousStep.completedStep) * 100;
};

export const getRevenuePerVisitor = (analytics: EventAnalytics): number => {
  return analytics.uniqueVisitors > 0 ? analytics.totalRevenue / analytics.uniqueVisitors : 0;
};

export const getRevenuePerOrder = (analytics: EventAnalytics): number => {
  return analytics.ordersCompleted > 0 ? analytics.totalRevenue / analytics.ordersCompleted : 0;
};

export const getTrafficSourceBreakdown = (analytics: EventAnalytics) => {
  const total = analytics.mobileTraffic + analytics.desktopTraffic + analytics.tabletTraffic;
  return {
    mobile: analytics.mobileTraffic / total * 100,
    desktop: analytics.desktopTraffic / total * 100,
    tablet: analytics.tabletTraffic / total * 100,
  };
};

export const getTopTrafficSources = (utmData: UTMAttribution[]): UTMAttribution[] => {
  return [...utmData].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
};

export const getBestPerformingCampaigns = (utmData: UTMAttribution[]): UTMAttribution[] => {
  return [...utmData].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 5);
};

export const getROASLeaders = (utmData: UTMAttribution[]): UTMAttribution[] => {
  return [...utmData]
    .filter(utm => utm.returnOnAdSpend && utm.returnOnAdSpend > 0)
    .sort((a, b) => (b.returnOnAdSpend || 0) - (a.returnOnAdSpend || 0))
    .slice(0, 5);
};

export const getZonePerformanceRanking = (zones: ZoneAnalytics[]): ZoneAnalytics[] => {
  return [...zones].sort((a, b) => b.revenue - a.revenue);
};

export const getZoneConversionRanking = (zones: ZoneAnalytics[]): ZoneAnalytics[] => {
  return [...zones].sort((a, b) => b.conversionRate - a.conversionRate);
};

export const getZoneOccupancyRanking = (zones: ZoneAnalytics[]): ZoneAnalytics[] => {
  return [...zones].sort((a, b) => b.occupancyRate - a.occupancyRate);
};

export const calculateProjectedGoal = (
  current: number,
  goal: number,
  daysRemaining: number,
  totalDays: number
): number => {
  const timeProgress = (totalDays - daysRemaining) / totalDays;
  if (timeProgress <= 0) return current;
  
  const currentDailyRate = current / (totalDays - daysRemaining);
  return current + (currentDailyRate * daysRemaining);
};

export const getConfidenceLevel = (paceTracking: PaceTracking): string => {
  const level = paceTracking.confidenceLevel;
  if (level >= 0.8) return 'High';
  if (level >= 0.6) return 'Medium';
  return 'Low';
};

export const getConfidenceColor = (level: number): string => {
  if (level >= 0.8) return '#10B981';
  if (level >= 0.6) return '#F59E0B';
  return '#EF4444';
};
