import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, BarChart3, MessageSquare, TrendingUp, Target, Clock } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/analytics-communications/AnalyticsDashboard';
import { CommunicationsManager } from '@/components/analytics-communications/CommunicationsManager';
import type { EventAnalytics, ZoneAnalytics, FunnelStep, PaceTracking, UTMAttribution, BroadcastMessage, MessageTemplate } from '@/lib/api/analytics-communications';

interface AnalyticsCommunicationsPageProps {
  eventId: string;
}

export default function AnalyticsCommunicationsPage({ eventId }: AnalyticsCommunicationsPageProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'communications'>('analytics');

  // Mock data - replace with React Query
  const [analytics] = useState<EventAnalytics>({
    id: 'analytics_1',
    eventId,
    totalViews: 5420,
    uniqueVisitors: 3420,
    holdsCreated: 1250,
    cartsCreated: 890,
    ordersCompleted: 756,
    totalRevenue: 125400.00,
    viewToHoldRate: 23.06,
    holdToCartRate: 71.20,
    cartToOrderRate: 84.94,
    overallConversionRate: 13.93,
    dropoffViews: 4170,
    dropoffHolds: 360,
    dropoffCarts: 134,
    avgSessionDuration: 342.5,
    avgTimeToPurchase: 1245.8,
    peakTrafficHour: 14,
    mobileTraffic: 3240,
    desktopTraffic: 1800,
    tabletTraffic: 380,
    topCountries: ['US', 'CA', 'MX'],
    topCities: ['New York', 'Los Angeles', 'Toronto'],
    utmSources: ['google', 'facebook', 'email'],
    utmMediums: ['cpc', 'social', 'email'],
    utmCampaigns: ['summer_sale', 'early_bird', 'newsletter'],
    calculatedAt: '2024-02-15T10:00:00Z',
    periodStart: '2024-02-01T00:00:00Z',
    periodEnd: '2024-02-14T23:59:59Z',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  });

  const [zoneAnalytics] = useState<ZoneAnalytics[]>([
    {
      id: 'zone_analytics_1',
      eventAnalyticsId: 'analytics_1',
      zoneId: 'zone_1',
      totalViews: 2100,
      uniqueVisitors: 1890,
      holdsCreated: 450,
      ordersCompleted: 380,
      revenue: 45600.00,
      conversionRate: 18.10,
      avgOrderValue: 120.00,
      sellThroughRate: 84.44,
      timeToSell: 2.5,
      avgPrice: 120.00,
      priceRange: '$100-$150',
      dynamicPricingChanges: 3,
      totalStalls: 50,
      occupiedStalls: 38,
      occupancyRate: 76.0,
      heatmapData: JSON.stringify({
        hot: ['A1', 'A2', 'A3', 'B1', 'B2'],
        warm: ['A4', 'A5', 'B3', 'B4', 'C1'],
        cold: ['C2', 'C3', 'C4', 'C5', 'D1']
      }),
      calculatedAt: '2024-02-15T10:00:00Z',
      zone: {
        id: 'zone_1',
        name: 'Zone A - Premium',
        description: 'Premium stalls near entrance'
      }
    },
    {
      id: 'zone_analytics_2',
      eventAnalyticsId: 'analytics_1',
      zoneId: 'zone_2',
      totalViews: 1800,
      uniqueVisitors: 1620,
      holdsCreated: 380,
      ordersCompleted: 320,
      revenue: 38400.00,
      conversionRate: 17.78,
      avgOrderValue: 120.00,
      sellThroughRate: 84.21,
      timeToSell: 3.2,
      avgPrice: 120.00,
      priceRange: '$100-$150',
      dynamicPricingChanges: 2,
      totalStalls: 45,
      occupiedStalls: 32,
      occupancyRate: 71.1,
      heatmapData: JSON.stringify({
        hot: ['E1', 'E2', 'F1'],
        warm: ['E3', 'E4', 'F2', 'F3'],
        cold: ['F4', 'F5', 'G1', 'G2']
      }),
      calculatedAt: '2024-02-15T10:00:00Z',
      zone: {
        id: 'zone_2',
        name: 'Zone B - Standard',
        description: 'Standard stalls in middle area'
      }
    }
  ]);

  const [funnelSteps] = useState<FunnelStep[]>([
    {
      id: 'funnel_1',
      eventAnalyticsId: 'analytics_1',
      stepName: 'View Event Page',
      stepOrder: 1,
      totalVisitors: 5420,
      completedStep: 5420,
      droppedOff: 0,
      conversionRate: 100.0,
      avgTimeOnStep: 45.2,
      medianTimeOnStep: 38.0,
      mobileCompletions: 3240,
      desktopCompletions: 1800,
      tabletCompletions: 380,
      calculatedAt: '2024-02-15T10:00:00Z',
    },
    {
      id: 'funnel_2',
      eventAnalyticsId: 'analytics_1',
      stepName: 'Create Hold',
      stepOrder: 2,
      totalVisitors: 5420,
      completedStep: 1250,
      droppedOff: 4170,
      conversionRate: 23.06,
      avgTimeOnStep: 180.5,
      medianTimeOnStep: 165.0,
      mobileCompletions: 750,
      desktopCompletions: 420,
      tabletCompletions: 80,
      calculatedAt: '2024-02-15T10:00:00Z',
    },
    {
      id: 'funnel_3',
      eventAnalyticsId: 'analytics_1',
      stepName: 'Add to Cart',
      stepOrder: 3,
      totalVisitors: 1250,
      completedStep: 890,
      droppedOff: 360,
      conversionRate: 71.20,
      avgTimeOnStep: 120.3,
      medianTimeOnStep: 105.0,
      mobileCompletions: 534,
      desktopCompletions: 298,
      tabletCompletions: 58,
      calculatedAt: '2024-02-15T10:00:00Z',
    },
    {
      id: 'funnel_4',
      eventAnalyticsId: 'analytics_1',
      stepName: 'Complete Purchase',
      stepOrder: 4,
      totalVisitors: 890,
      completedStep: 756,
      droppedOff: 134,
      conversionRate: 84.94,
      avgTimeOnStep: 240.8,
      medianTimeOnStep: 210.0,
      mobileCompletions: 453,
      desktopCompletions: 253,
      tabletCompletions: 50,
      calculatedAt: '2024-02-15T10:00:00Z',
    }
  ]);

  const [paceTracking] = useState<PaceTracking>({
    id: 'pace_1',
    eventId,
    salesGoal: 150000.00,
    ordersGoal: 1000,
    stallsGoal: 500,
    currentRevenue: 125400.00,
    currentOrders: 756,
    currentStalls: 380,
    revenueProgress: 83.60,
    ordersProgress: 75.60,
    stallsProgress: 76.00,
    daysRemaining: 5,
    avgDailyRevenue: 8964.29,
    requiredDailyRevenue: 4920.00,
    paceStatus: 'ON_TRACK',
    projectedRevenue: 144821.45,
    projectedOrders: 907,
    projectedStalls: 456,
    confidenceLevel: 0.85,
    calculatedAt: '2024-02-15T10:00:00Z',
    goalSetAt: '2024-02-01T00:00:00Z',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  });

  const [utmAttribution] = useState<UTMAttribution[]>([
    {
      id: 'utm_1',
      eventId,
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'summer_sale',
      utmTerm: 'food_truck_event',
      utmContent: 'banner_ad',
      totalClicks: 1250,
      totalViews: 2100,
      totalOrders: 180,
      totalRevenue: 21600.00,
      clickThroughRate: 59.52,
      conversionRate: 14.40,
      costPerClick: 2.50,
      returnOnAdSpend: 3.45,
      adSpend: 3125.00,
      costPerOrder: 17.36,
      firstSeen: '2024-02-01T00:00:00Z',
      lastSeen: '2024-02-14T23:59:59Z',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z',
    },
    {
      id: 'utm_2',
      eventId,
      utmSource: 'facebook',
      utmMedium: 'social',
      utmCampaign: 'early_bird',
      utmTerm: null,
      utmContent: 'video_ad',
      totalClicks: 890,
      totalViews: 1500,
      totalOrders: 120,
      totalRevenue: 14400.00,
      clickThroughRate: 59.33,
      conversionRate: 13.48,
      costPerClick: 1.80,
      returnOnAdSpend: 4.61,
      adSpend: 1602.00,
      costPerOrder: 13.35,
      firstSeen: '2024-02-01T00:00:00Z',
      lastSeen: '2024-02-14T23:59:59Z',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z',
    }
  ]);

  const [messages, setMessages] = useState<BroadcastMessage[]>([
    {
      id: 'broadcast_1',
      eventId,
      senderId: 'user_1',
      messageType: 'EMAIL',
      subject: 'Welcome to Food Truck Festival 2024!',
      content: 'Welcome to our annual food truck festival...',
      template: 'welcome_template',
      targetAudience: 'ALL_ATTENDEES',
      targetCriteria: null,
      recipientCount: 1500,
      scheduledFor: null,
      sentAt: '2024-02-01T10:00:00Z',
      status: 'SENT',
      deliveredCount: 1480,
      openedCount: 1184,
      clickedCount: 296,
      bouncedCount: 15,
      unsubscribedCount: 5,
      createdAt: '2024-02-01T09:30:00Z',
      updatedAt: '2024-02-01T10:15:00Z',
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    },
    {
      id: 'broadcast_2',
      eventId,
      senderId: 'user_1',
      messageType: 'EMAIL',
      subject: 'Reminder: Event starts in 2 days!',
      content: 'Don\'t forget, our food truck festival starts in 2 days...',
      template: 'reminder_template',
      targetAudience: 'CUSTOMERS_ONLY',
      targetCriteria: '{"hasPurchased": true}',
      recipientCount: 756,
      scheduledFor: '2024-02-13T09:00:00Z',
      sentAt: null,
      status: 'SCHEDULED',
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdAt: '2024-02-10T14:00:00Z',
      updatedAt: '2024-02-10T14:00:00Z',
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    }
  ]);

  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: 'template_1',
      eventId,
      templateName: 'Welcome Email',
      templateType: 'EMAIL',
      subject: 'Welcome to {{eventName}}!',
      content: 'Hi {{customerName}},\n\nWelcome to {{eventName}}! We\'re excited to have you join us...',
      variables: ['eventName', 'customerName', 'eventDate', 'eventLocation'],
      usageCount: 15,
      lastUsedAt: '2024-02-01T10:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
    },
    {
      id: 'template_2',
      eventId,
      templateName: 'Event Reminder',
      templateType: 'EMAIL',
      subject: 'Reminder: {{eventName}} starts {{daysUntil}} days!',
      content: 'Hi {{customerName}},\n\nThis is a friendly reminder that {{eventName}} starts in {{daysUntil}} days...',
      variables: ['eventName', 'customerName', 'daysUntil', 'eventDate', 'eventLocation'],
      usageCount: 8,
      lastUsedAt: '2024-02-10T14:00:00Z',
      isActive: true,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-02-10T14:00:00Z',
    }
  ]);

  const handleSetPaceGoals = (goals: any) => {
    console.log('Setting pace goals:', goals);
    // TODO: Implement API call
  };

  const handleCreateMessage = (messageData: any) => {
    console.log('Creating message:', messageData);
    // TODO: Implement API call
  };

  const handleSendMessage = (messageId: string) => {
    console.log('Sending message:', messageId);
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'SENDING' as const } : m
    ));
  };

  const handleScheduleMessage = (messageId: string, scheduledFor: string) => {
    console.log('Scheduling message:', messageId, scheduledFor);
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'SCHEDULED' as const, scheduledFor } : m
    ));
  };

  const handleCreateTemplate = (templateData: any) => {
    console.log('Creating template:', templateData);
    // TODO: Implement API call
  };

  const handleEditTemplate = (templateId: string, updates: any) => {
    console.log('Editing template:', templateId, updates);
    // TODO: Implement API call
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/event-coordinator/events/${eventId}/refunds-payouts`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Refunds & Payouts
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Communications</h1>
              <p className="text-gray-600">Event analytics, performance insights, and communication management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'communications', label: 'Communications', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            analytics={analytics}
            zoneAnalytics={zoneAnalytics}
            funnelSteps={funnelSteps}
            paceTracking={paceTracking}
            utmAttribution={utmAttribution}
            onSetPaceGoals={handleSetPaceGoals}
          />
        )}

        {activeTab === 'communications' && (
          <CommunicationsManager
            messages={messages}
            templates={templates}
            onCreateMessage={handleCreateMessage}
            onSendMessage={handleSendMessage}
            onScheduleMessage={handleScheduleMessage}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
          />
        )}
      </div>
    </div>
  );
}
