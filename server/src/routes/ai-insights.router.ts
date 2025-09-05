import { Router } from 'express';

export const aiInsightsRouter = Router();

// Mock AI insights data
const mockInsights = {
  seasonalAlerts: [
    {
      id: 'seasonal-1',
      type: 'seasonal_demand',
      title: 'Holiday Season Preparation',
      message: 'Based on historical data, expect 40% increase in gift packaging demand during December.',
      priority: 'high',
      category: 'packaging',
      confidence: 0.85,
      recommendedAction: 'Increase gift box inventory by 200 units',
      timeframe: 'next_30_days',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seasonal-2',
      type: 'seasonal_demand',
      title: 'Summer BBQ Season',
      message: 'Grilling season typically increases wood plank demand by 60% in June-July.',
      priority: 'medium',
      category: 'raw_materials',
      confidence: 0.78,
      recommendedAction: 'Stock up on oak wood planks and charcoal',
      timeframe: 'next_60_days',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seasonal-3',
      type: 'weather_impact',
      title: 'Storm Season Alert',
      message: 'Hurricane season may disrupt supply chains for imported ingredients.',
      priority: 'high',
      category: 'food_grade',
      confidence: 0.92,
      recommendedAction: 'Build 30-day safety stock for imported items',
      timeframe: 'next_90_days',
      createdAt: new Date().toISOString(),
    },
  ],
  
  lowStockPredictions: [
    {
      id: 'prediction-1',
      itemId: 'inv-1',
      itemName: 'All-Purpose Flour',
      currentStock: 50,
      predictedDepletionDate: '2025-01-15',
      confidence: 0.88,
      factors: ['Increased holiday baking', 'Current consumption rate'],
      recommendedOrderQuantity: 100,
      urgency: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prediction-2',
      itemId: 'inv-6',
      itemName: 'Gift Boxes',
      currentStock: 100,
      predictedDepletionDate: '2025-01-08',
      confidence: 0.95,
      factors: ['Holiday season demand spike', 'Historical patterns'],
      recommendedOrderQuantity: 300,
      urgency: 'critical',
      createdAt: new Date().toISOString(),
    },
  ],
  
  marketTrends: [
    {
      id: 'trend-1',
      category: 'food_grade',
      trend: 'Organic ingredients demand up 25%',
      impact: 'positive',
      timeframe: 'next_quarter',
      confidence: 0.82,
      recommendation: 'Consider expanding organic ingredient line',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'trend-2',
      category: 'packaging',
      trend: 'Sustainable packaging preference increasing',
      impact: 'positive',
      timeframe: 'next_6_months',
      confidence: 0.76,
      recommendation: 'Source eco-friendly packaging alternatives',
      createdAt: new Date().toISOString(),
    },
  ],
  
  costOptimization: [
    {
      id: 'cost-1',
      type: 'bulk_purchase',
      itemId: 'inv-2',
      itemName: 'Active Dry Yeast',
      currentCost: 0.15,
      bulkCost: 0.12,
      savings: 0.03,
      minOrderQuantity: 1000,
      paybackPeriod: '2_months',
      confidence: 0.89,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cost-2',
      type: 'supplier_switch',
      itemId: 'inv-5',
      itemName: 'Steel Ingots',
      currentSupplier: 'Metal Works Inc.',
      alternativeSupplier: 'Steel Solutions Co.',
      currentCost: 8.50,
      alternativeCost: 7.80,
      savings: 0.70,
      confidence: 0.85,
      createdAt: new Date().toISOString(),
    },
  ],
  
  qualityInsights: [
    {
      id: 'quality-1',
      type: 'expiration_risk',
      itemId: 'inv-10',
      itemName: 'Olive Oil',
      expirationDate: '2025-08-15',
      riskLevel: 'medium',
      recommendation: 'Use in high-volume products first',
      confidence: 0.91,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'quality-2',
      type: 'storage_optimization',
      itemId: 'inv-4',
      itemName: 'Oak Wood Planks',
      currentLocation: 'C-3-1',
      recommendation: 'Move to climate-controlled area to prevent warping',
      confidence: 0.87,
      createdAt: new Date().toISOString(),
    },
  ],
};

// GET /api/ai-insights - Get all AI insights
aiInsightsRouter.get('/ai-insights', (req, res) => {
  try {
    const { type, priority, category } = req.query;
    
    let filteredInsights = { ...mockInsights };
    
    // Filter seasonal alerts
    if (type === 'seasonal' || !type) {
      if (priority) {
        filteredInsights.seasonalAlerts = filteredInsights.seasonalAlerts.filter(
          alert => alert.priority === priority
        );
      }
      if (category) {
        filteredInsights.seasonalAlerts = filteredInsights.seasonalAlerts.filter(
          alert => alert.category === category
        );
      }
    } else {
      filteredInsights.seasonalAlerts = [];
    }
    
    // Filter low stock predictions
    if (type === 'predictions' || !type) {
      if (priority) {
        const urgencyMap = { high: 'high', medium: 'medium', low: 'low', critical: 'critical' };
        filteredInsights.lowStockPredictions = filteredInsights.lowStockPredictions.filter(
          prediction => prediction.urgency === urgencyMap[priority as string]
        );
      }
    } else {
      filteredInsights.lowStockPredictions = [];
    }
    
    res.json({
      insights: filteredInsights,
      summary: {
        totalAlerts: filteredInsights.seasonalAlerts.length,
        criticalPredictions: filteredInsights.lowStockPredictions.filter(p => p.urgency === 'critical').length,
        highPriorityAlerts: filteredInsights.seasonalAlerts.filter(a => a.priority === 'high').length,
        costSavings: filteredInsights.costOptimization.reduce((sum, opt) => sum + opt.savings, 0),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// GET /api/ai-insights/seasonal - Get seasonal insights only
aiInsightsRouter.get('/ai-insights/seasonal', (req, res) => {
  try {
    const { priority, category } = req.query;
    
    let alerts = [...mockInsights.seasonalAlerts];
    
    if (priority) {
      alerts = alerts.filter(alert => alert.priority === priority);
    }
    
    if (category) {
      alerts = alerts.filter(alert => alert.category === category);
    }
    
    res.json({
      alerts,
      summary: {
        total: alerts.length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length,
      },
    });
  } catch (error) {
    console.error('Error fetching seasonal insights:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal insights' });
  }
});

// GET /api/ai-insights/predictions - Get stock predictions only
aiInsightsRouter.get('/ai-insights/predictions', (req, res) => {
  try {
    const { urgency } = req.query;
    
    let predictions = [...mockInsights.lowStockPredictions];
    
    if (urgency) {
      predictions = predictions.filter(prediction => prediction.urgency === urgency);
    }
    
    res.json({
      predictions,
      summary: {
        total: predictions.length,
        critical: predictions.filter(p => p.urgency === 'critical').length,
        high: predictions.filter(p => p.urgency === 'high').length,
        medium: predictions.filter(p => p.urgency === 'medium').length,
      },
    });
  } catch (error) {
    console.error('Error fetching stock predictions:', error);
    res.status(500).json({ error: 'Failed to fetch stock predictions' });
  }
});

// GET /api/ai-insights/trends - Get market trends
aiInsightsRouter.get('/ai-insights/trends', (req, res) => {
  try {
    const { category, impact } = req.query;
    
    let trends = [...mockInsights.marketTrends];
    
    if (category) {
      trends = trends.filter(trend => trend.category === category);
    }
    
    if (impact) {
      trends = trends.filter(trend => trend.impact === impact);
    }
    
    res.json({
      trends,
      summary: {
        total: trends.length,
        positive: trends.filter(t => t.impact === 'positive').length,
        negative: trends.filter(t => t.impact === 'negative').length,
        neutral: trends.filter(t => t.impact === 'neutral').length,
      },
    });
  } catch (error) {
    console.error('Error fetching market trends:', error);
    res.status(500).json({ error: 'Failed to fetch market trends' });
  }
});

// GET /api/ai-insights/optimization - Get cost optimization suggestions
aiInsightsRouter.get('/ai-insights/optimization', (req, res) => {
  try {
    const { type } = req.query;
    
    let optimizations = [...mockInsights.costOptimization];
    
    if (type) {
      optimizations = optimizations.filter(opt => opt.type === type);
    }
    
    const totalSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0);
    
    res.json({
      optimizations,
      summary: {
        total: optimizations.length,
        totalSavings,
        bulkPurchases: optimizations.filter(o => o.type === 'bulk_purchase').length,
        supplierSwitches: optimizations.filter(o => o.type === 'supplier_switch').length,
      },
    });
  } catch (error) {
    console.error('Error fetching optimization insights:', error);
    res.status(500).json({ error: 'Failed to fetch optimization insights' });
  }
});

// POST /api/ai-insights/analyze - Trigger AI analysis
aiInsightsRouter.post('/ai-insights/analyze', (req, res) => {
  try {
    const { analysisType, parameters } = req.body;
    
    // Simulate AI analysis processing
    const analysisId = `analysis-${Date.now()}`;
    
    // Mock analysis results based on type
    let results = {};
    
    switch (analysisType) {
      case 'seasonal_forecast':
        results = {
          analysisId,
          type: 'seasonal_forecast',
          insights: mockInsights.seasonalAlerts.slice(0, 2),
          confidence: 0.87,
          processingTime: '2.3s',
        };
        break;
      case 'demand_prediction':
        results = {
          analysisId,
          type: 'demand_prediction',
          insights: mockInsights.lowStockPredictions,
          confidence: 0.91,
          processingTime: '1.8s',
        };
        break;
      case 'cost_optimization':
        results = {
          analysisId,
          type: 'cost_optimization',
          insights: mockInsights.costOptimization,
          confidence: 0.84,
          processingTime: '3.1s',
        };
        break;
      default:
        results = {
          analysisId,
          type: 'general_analysis',
          insights: mockInsights,
          confidence: 0.79,
          processingTime: '4.2s',
        };
    }
    
    res.json({
      success: true,
      analysisId,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: 'Failed to run AI analysis' });
  }
});

// GET /api/ai-insights/health - Check AI service health
aiInsightsRouter.get('/ai-insights/health', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      service: 'AI Insights Engine',
      version: '1.0.0',
      uptime: process.uptime(),
      lastAnalysis: new Date().toISOString(),
      capabilities: [
        'seasonal_forecasting',
        'demand_prediction',
        'cost_optimization',
        'market_trend_analysis',
        'quality_insights',
      ],
    });
  } catch (error) {
    console.error('Error checking AI service health:', error);
    res.status(500).json({ error: 'Failed to check AI service health' });
  }
});
