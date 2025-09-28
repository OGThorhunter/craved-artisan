import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const CreateBroadcastMessageSchema = z.object({
  eventId: z.string(),
  messageType: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']).default('EMAIL'),
  subject: z.string().optional(),
  content: z.string().min(1),
  template: z.string().optional(),
  targetAudience: z.enum(['ALL_ATTENDEES', 'VENDORS_ONLY', 'CUSTOMERS_ONLY', 'SPECIFIC_GROUP', 'CUSTOM_CRITERIA']).default('ALL_ATTENDEES'),
  targetCriteria: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
});

const CreateMessageTemplateSchema = z.object({
  eventId: z.string(),
  templateName: z.string().min(1),
  templateType: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']).default('EMAIL'),
  subject: z.string().optional(),
  content: z.string().min(1),
  variables: z.array(z.string()).default([]),
});

const SetPaceGoalSchema = z.object({
  eventId: z.string(),
  salesGoal: z.number().positive(),
  ordersGoal: z.number().positive().int(),
  stallsGoal: z.number().positive().int(),
});

// GET /api/analytics-communications/analytics/:eventId - Get event analytics
router.get('/analytics/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { periodStart, periodEnd } = req.query;
    
    // Mock data - replace with Prisma
    const mockAnalytics = {
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
      calculatedAt: new Date().toISOString(),
      periodStart: periodStart || '2024-02-01T00:00:00Z',
      periodEnd: periodEnd || '2024-02-14T23:59:59Z',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    res.json({ success: true, data: mockAnalytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics-communications/zone-analytics/:eventId - Get zone performance
router.get('/zone-analytics/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Mock data - replace with Prisma
    const mockZoneAnalytics = [
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
        calculatedAt: new Date().toISOString(),
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
        calculatedAt: new Date().toISOString(),
        zone: {
          id: 'zone_2',
          name: 'Zone B - Standard',
          description: 'Standard stalls in middle area'
        }
      }
    ];
    
    res.json({ success: true, data: mockZoneAnalytics });
  } catch (error) {
    console.error('Error fetching zone analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch zone analytics' });
  }
});

// GET /api/analytics-communications/funnel/:eventId - Get funnel analysis
router.get('/funnel/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Mock data - replace with Prisma
    const mockFunnelSteps = [
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
        calculatedAt: new Date().toISOString(),
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
        calculatedAt: new Date().toISOString(),
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
        calculatedAt: new Date().toISOString(),
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
        calculatedAt: new Date().toISOString(),
      }
    ];
    
    res.json({ success: true, data: mockFunnelSteps });
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch funnel data' });
  }
});

// GET /api/analytics-communications/pace/:eventId - Get pace tracking
router.get('/pace/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Mock data - replace with Prisma
    const mockPaceTracking = {
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
      calculatedAt: new Date().toISOString(),
      goalSetAt: '2024-02-01T00:00:00Z',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    res.json({ success: true, data: mockPaceTracking });
  } catch (error) {
    console.error('Error fetching pace tracking:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pace tracking' });
  }
});

// POST /api/analytics-communications/pace/:eventId - Set pace goals
router.post('/pace/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const validatedData = SetPaceGoalSchema.parse(req.body);
    
    const mockPaceTracking = {
      id: 'pace_new',
      ...validatedData,
      currentRevenue: 0,
      currentOrders: 0,
      currentStalls: 0,
      revenueProgress: 0,
      ordersProgress: 0,
      stallsProgress: 0,
      daysRemaining: 30,
      avgDailyRevenue: 0,
      requiredDailyRevenue: validatedData.salesGoal / 30,
      paceStatus: 'ON_TRACK',
      projectedRevenue: validatedData.salesGoal,
      projectedOrders: validatedData.ordersGoal,
      projectedStalls: validatedData.stallsGoal,
      confidenceLevel: 0.5,
      calculatedAt: new Date().toISOString(),
      goalSetAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    res.status(201).json({ success: true, data: mockPaceTracking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error setting pace goals:', error);
    res.status(500).json({ success: false, message: 'Failed to set pace goals' });
  }
});

// GET /api/analytics-communications/utm/:eventId - Get UTM attribution
router.get('/utm/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Mock data - replace with Prisma
    const mockUTMAttribution = [
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    
    res.json({ success: true, data: mockUTMAttribution });
  } catch (error) {
    console.error('Error fetching UTM attribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch UTM attribution' });
  }
});

// GET /api/analytics-communications/broadcasts/:eventId - Get broadcast messages
router.get('/broadcasts/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;
    
    // Mock data - replace with Prisma
    const mockBroadcasts = [
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
    ];
    
    res.json({ success: true, data: mockBroadcasts });
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch broadcasts' });
  }
});

// POST /api/analytics-communications/broadcasts - Create broadcast message
router.post('/broadcasts', async (req, res) => {
  try {
    const validatedData = CreateBroadcastMessageSchema.parse(req.body);
    
    const mockBroadcast = {
      id: 'broadcast_new',
      ...validatedData,
      senderId: 'user_1',
      recipientCount: 0,
      sentAt: null,
      status: validatedData.scheduledFor ? 'SCHEDULED' : 'DRAFT',
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        name: 'Current User',
        email: 'user@example.com'
      }
    };
    
    res.status(201).json({ success: true, data: mockBroadcast });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating broadcast:', error);
    res.status(500).json({ success: false, message: 'Failed to create broadcast' });
  }
});

// GET /api/analytics-communications/templates/:eventId - Get message templates
router.get('/templates/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { templateType } = req.query;
    
    // Mock data - replace with Prisma
    const mockTemplates = [
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
    ];
    
    res.json({ success: true, data: mockTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// POST /api/analytics-communications/templates - Create message template
router.post('/templates', async (req, res) => {
  try {
    const validatedData = CreateMessageTemplateSchema.parse(req.body);
    
    const mockTemplate = {
      id: 'template_new',
      ...validatedData,
      usageCount: 0,
      lastUsedAt: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    res.status(201).json({ success: true, data: mockTemplate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

export default router;
