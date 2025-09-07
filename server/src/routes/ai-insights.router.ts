import { Router } from 'express';
import { logger } from '../logger';

export const aiInsightsRouter = Router();

// Mock AI insights data
const mockAIInsights = [
  {
    id: 'insight-1',
    itemId: 'inv-1',
    type: 'reorder_suggestion',
    title: 'Bulk Purchase Opportunity',
    message: 'AI suggests purchasing flour in bulk (50kg+) to save 15% on unit costs. Current supplier offers volume discounts.',
    confidence: 92,
    actionable: true,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'insight-2',
    itemId: 'inv-2',
    type: 'demand_forecast',
    title: 'Demand Increase Expected',
    message: 'Based on seasonal patterns, yeast demand is expected to increase 25% in the next 2 weeks. Consider increasing stock.',
    confidence: 87,
    actionable: true,
    priority: 'high',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'insight-3',
    type: 'price_alert',
    title: 'Supplier Price Increase',
    message: 'Steel ingots supplier announced 8% price increase effective next month. Consider pre-purchasing current stock.',
    confidence: 95,
    actionable: true,
    priority: 'high',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'insight-4',
    type: 'seasonal_trend',
    title: 'Seasonal Usage Pattern',
    message: 'Historical data shows 40% increase in packaging materials usage during holiday season. Plan inventory accordingly.',
    confidence: 89,
    actionable: true,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'insight-5',
    itemId: 'inv-3',
    type: 'supplier_alert',
    title: 'Alternative Supplier Available',
    message: 'New supplier offers sea salt at 12% lower cost with same quality. Consider switching for cost optimization.',
    confidence: 78,
    actionable: true,
    priority: 'low',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Get all AI insights
aiInsightsRouter.get('/ai-insights', (req, res) => {
  try {
    logger.info('Fetching AI insights');
    
    // Filter out expired insights
    const activeInsights = mockAIInsights.filter(insight => 
      !insight.expiresAt || new Date(insight.expiresAt) > new Date()
    );

    res.json({
      success: true,
      data: activeInsights,
      total: activeInsights.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching AI insights');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI insights'
    });
  }
});

// Get AI insights for a specific item
aiInsightsRouter.get('/ai-insights/item/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    logger.info({ itemId }, 'Fetching AI insights for item');
    
    const itemInsights = mockAIInsights.filter(insight => 
      insight.itemId === itemId && 
      (!insight.expiresAt || new Date(insight.expiresAt) > new Date())
    );

    res.json({
      success: true,
      data: itemInsights,
      total: itemInsights.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching item AI insights');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item AI insights'
    });
  }
});

// Get inventory-specific AI insights
aiInsightsRouter.get('/ai-insights/inventory', (req, res) => {
  try {
    logger.info('Fetching inventory AI insights');
    
    // Filter insights that are relevant to inventory management
    const inventoryInsights = mockAIInsights.filter(insight => 
      ['reorder_suggestion', 'demand_forecast', 'price_alert', 'supplier_alert', 'seasonal_trend'].includes(insight.type) &&
      (!insight.expiresAt || new Date(insight.expiresAt) > new Date())
    );

    // Group insights by type
    const insightsByType = inventoryInsights.reduce((acc, insight) => {
      if (!acc[insight.type]) {
        acc[insight.type] = [];
      }
      acc[insight.type].push(insight);
      return acc;
    }, {} as Record<string, typeof inventoryInsights>);

    // Calculate summary statistics
    const summary = {
      total: inventoryInsights.length,
      highPriority: inventoryInsights.filter(i => i.priority === 'high').length,
      mediumPriority: inventoryInsights.filter(i => i.priority === 'medium').length,
      lowPriority: inventoryInsights.filter(i => i.priority === 'low').length,
      actionable: inventoryInsights.filter(i => i.actionable).length,
      averageConfidence: Math.round(
        inventoryInsights.reduce((sum, i) => sum + i.confidence, 0) / inventoryInsights.length
      )
    };

    res.json({
      success: true,
      data: inventoryInsights,
      summary,
      insightsByType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching inventory AI insights');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory AI insights'
    });
  }
});

// Dismiss an AI insight
aiInsightsRouter.post('/ai-insights/:insightId/dismiss', (req, res) => {
  try {
    const { insightId } = req.params;
    logger.info({ insightId }, 'Dismissing AI insight');
    
    // In a real implementation, this would mark the insight as dismissed in the database
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Insight dismissed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error dismissing AI insight');
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss AI insight'
    });
  }
});

// Take action on an AI insight
aiInsightsRouter.post('/ai-insights/:insightId/action', (req, res) => {
  try {
    const { insightId } = req.params;
    const { action, notes } = req.body;
    
    logger.info({ insightId, action, notes }, 'Taking action on AI insight');
    
    // In a real implementation, this would log the action taken and potentially trigger workflows
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Action taken successfully',
      action,
      notes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error taking action on AI insight');
    res.status(500).json({
      success: false,
      error: 'Failed to take action on AI insight'
    });
  }
});

// Generate new AI insights (simulate AI processing)
aiInsightsRouter.post('/ai-insights/generate', (req, res) => {
  try {
    logger.info('Generating new AI insights');
    
    // In a real implementation, this would trigger AI analysis of inventory data
    // For now, we'll simulate generating new insights
    
    const newInsights = [
      {
        id: `insight-${Date.now()}`,
        type: 'demand_forecast',
        title: 'Weekly Usage Pattern Detected',
        message: 'AI detected a 15% increase in weekly usage for packaging materials. Consider adjusting reorder points.',
        confidence: 82,
        actionable: true,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: newInsights,
      message: 'New insights generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error generating AI insights');
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI insights'
    });
  }
});

// Get AI insights analytics
aiInsightsRouter.get('/ai-insights/analytics', (req, res) => {
  try {
    logger.info('Fetching AI insights analytics');
    
    const analytics = {
      totalInsights: mockAIInsights.length,
      activeInsights: mockAIInsights.filter(i => !i.expiresAt || new Date(i.expiresAt) > new Date()).length,
      insightsByType: {
        reorder_suggestion: mockAIInsights.filter(i => i.type === 'reorder_suggestion').length,
        price_alert: mockAIInsights.filter(i => i.type === 'price_alert').length,
        demand_forecast: mockAIInsights.filter(i => i.type === 'demand_forecast').length,
        supplier_alert: mockAIInsights.filter(i => i.type === 'supplier_alert').length,
        seasonal_trend: mockAIInsights.filter(i => i.type === 'seasonal_trend').length
      },
      insightsByPriority: {
        high: mockAIInsights.filter(i => i.priority === 'high').length,
        medium: mockAIInsights.filter(i => i.priority === 'medium').length,
        low: mockAIInsights.filter(i => i.priority === 'low').length
      },
      averageConfidence: Math.round(
        mockAIInsights.reduce((sum, i) => sum + i.confidence, 0) / mockAIInsights.length
      ),
      actionableInsights: mockAIInsights.filter(i => i.actionable).length
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching AI insights analytics');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI insights analytics'
    });
  }
});