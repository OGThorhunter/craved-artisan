import { logger } from '../../logger';

export interface LabelUsageEvent {
  id: string;
  timestamp: Date;
  eventType: UsageEventType;
  vendorId: string;
  userId?: string;
  labelProfileId: string;
  printerId?: string;
  orderId?: string;
  metadata: LabelUsageMetadata;
}

export type UsageEventType =
  | 'label_compiled' | 'label_printed' | 'label_failed'
  | 'template_created' | 'template_modified' | 'template_deleted'
  | 'batch_created' | 'batch_processed' | 'batch_completed'
  | 'rule_executed' | 'rule_failed'
  | 'printer_assigned' | 'printer_error' | 'printer_maintenance';

export interface LabelUsageMetadata {
  labelCount?: number;
  processingTimeMs?: number;
  fileSize?: number;
  printEngine?: string;
  batchId?: string;
  errorCode?: string;
  errorMessage?: string;
  ruleCount?: number;
  templateComplexity?: number;
  printerModel?: string;
  mediaType?: string;
  costEstimate?: number;
  customFields?: Record<string, any>;
}

export interface UsageAnalytics {
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  totalLabels: number;
  totalBatches: number;
  totalOrders: number;
  averageLabelsPerOrder: number;
  averageProcessingTime: number;
  successRate: number;
  topLabelProfiles: UsageRanking[];
  topPrinters: UsageRanking[];
  errorAnalysis: ErrorAnalysis;
  performanceMetrics: PerformanceMetrics;
  costAnalysis: CostAnalysis;
  trends: TrendAnalysis;
}

export interface UsageRanking {
  id: string;
  name: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorRate: number;
  commonErrors: {
    code: string;
    message: string;
    count: number;
    percentage: number;
  }[];
  errorsByCategory: Record<string, number>;
}

export interface PerformanceMetrics {
  averageCompilationTime: number;
  averagePrintTime: number;
  throughputLabelsPerHour: number;
  peakUsageTime: string;
  systemUtilization: number;
  bottlenecks: string[];
}

export interface CostAnalysis {
  totalCost: number;
  costPerLabel: number;
  materialCosts: number;
  laborCosts: number;
  equipmentCosts: number;
  savings: {
    automationSavings: number;
    errorReductionSavings: number;
    efficiencySavings: number;
  };
}

export interface TrendAnalysis {
  labelVolumeGrowth: number; // percentage
  usagePatterns: {
    hourlyDistribution: Record<string, number>;
    dailyDistribution: Record<string, number>;
    seasonalTrends: Record<string, number>;
  };
  predictions: {
    nextMonthVolume: number;
    capacityRecommendations: string[];
    optimizationOpportunities: string[];
  };
}

export type AnalyticsPeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface AnalyticsFilter {
  vendorIds?: string[];
  labelProfileIds?: string[];
  printerIds?: string[];
  eventTypes?: UsageEventType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeErrors?: boolean;
  groupBy?: 'vendor' | 'profile' | 'printer' | 'day' | 'hour';
}

export class UsageTracker {
  private events: LabelUsageEvent[];
  private maxEvents: number;
  private aggregatedData: Map<string, any>;
  private lastAggregation: Date;

  constructor(maxEvents: number = 100000) {
    this.events = [];
    this.maxEvents = maxEvents;
    this.aggregatedData = new Map();
    this.lastAggregation = new Date();
  }

  /**
   * Track a label usage event
   */
  trackEvent(event: Omit<LabelUsageEvent, 'id' | 'timestamp'>): void {
    const fullEvent: LabelUsageEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.events.push(fullEvent);

    // Maintain maximum event limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log significant events
    if (this.isSignificantEvent(event.eventType)) {
      logger.info('Label usage event tracked', {
        eventType: event.eventType,
        vendorId: event.vendorId,
        labelProfileId: event.labelProfileId,
        metadata: event.metadata
      });
    }

    // Trigger real-time aggregation for critical events
    if (this.isCriticalEvent(event.eventType)) {
      this.updateRealTimeMetrics(fullEvent);
    }
  }

  /**
   * Get usage analytics for specified period and filters
   */
  async getAnalytics(
    period: AnalyticsPeriod,
    filter: AnalyticsFilter = {}
  ): Promise<UsageAnalytics> {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    logger.debug('Generating usage analytics', {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      filter
    });

    try {
      // Filter events based on criteria
      const filteredEvents = this.filterEvents(this.events, {
        ...filter,
        dateRange: filter.dateRange || { start: startDate, end: endDate }
      });

      // Generate analytics
      const analytics: UsageAnalytics = {
        period,
        startDate,
        endDate,
        totalLabels: this.calculateTotalLabels(filteredEvents),
        totalBatches: this.calculateTotalBatches(filteredEvents),
        totalOrders: this.calculateTotalOrders(filteredEvents),
        averageLabelsPerOrder: 0, // Calculated below
        averageProcessingTime: this.calculateAverageProcessingTime(filteredEvents),
        successRate: this.calculateSuccessRate(filteredEvents),
        topLabelProfiles: this.getTopLabelProfiles(filteredEvents),
        topPrinters: this.getTopPrinters(filteredEvents),
        errorAnalysis: this.analyzeErrors(filteredEvents),
        performanceMetrics: this.calculatePerformanceMetrics(filteredEvents),
        costAnalysis: this.calculateCostAnalysis(filteredEvents),
        trends: this.analyzeTrends(filteredEvents, period)
      };

      // Calculate derived metrics
      analytics.averageLabelsPerOrder = analytics.totalOrders > 0 
        ? analytics.totalLabels / analytics.totalOrders 
        : 0;

      logger.info('Analytics generated successfully', {
        period,
        totalLabels: analytics.totalLabels,
        successRate: analytics.successRate,
        errorRate: analytics.errorAnalysis.errorRate
      });

      return analytics;

    } catch (error) {
      logger.error('Analytics generation failed', {
        period,
        error: error.message,
        filter
      });
      throw new Error(`Analytics generation failed: ${error.message}`);
    }
  }

  /**
   * Get real-time metrics dashboard data
   */
  getRealTimeMetrics(): {
    currentHourLabels: number;
    currentHourSuccess: number;
    activeJobs: number;
    queueLength: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    alerts: RealtimeAlert[];
  } {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp >= hourAgo);
    const labelEvents = recentEvents.filter(e => e.eventType === 'label_printed');
    const successEvents = labelEvents.filter(e => !e.metadata.errorCode);
    
    const currentHourLabels = labelEvents.reduce((sum, e) => sum + (e.metadata.labelCount || 1), 0);
    const currentHourSuccess = successEvents.length;
    
    // Calculate system health
    const errorRate = labelEvents.length > 0 ? 1 - (successEvents.length / labelEvents.length) : 0;
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (errorRate > 0.1) systemHealth = 'warning';
    if (errorRate > 0.2) systemHealth = 'critical';
    
    return {
      currentHourLabels,
      currentHourSuccess,
      activeJobs: this.countActiveJobs(),
      queueLength: this.getQueueLength(),
      systemHealth,
      alerts: this.generateAlerts(recentEvents)
    };
  }

  /**
   * Export analytics data for reporting
   */
  async exportAnalytics(
    format: 'json' | 'csv' | 'xlsx',
    filter: AnalyticsFilter = {}
  ): Promise<{
    data: any;
    filename: string;
    mimeType: string;
  }> {
    const analytics = await this.getAnalytics('month', filter);
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(analytics, null, 2),
          filename: `label-analytics-${timestamp}.json`,
          mimeType: 'application/json'
        };
      
      case 'csv':
        const csvData = this.convertToCsv(analytics);
        return {
          data: csvData,
          filename: `label-analytics-${timestamp}.csv`,
          mimeType: 'text/csv'
        };
      
      case 'xlsx':
        // In a real implementation, this would generate an Excel file
        return {
          data: 'Excel export not implemented',
          filename: `label-analytics-${timestamp}.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Filter events based on criteria
   */
  private filterEvents(events: LabelUsageEvent[], filter: AnalyticsFilter): LabelUsageEvent[] {
    return events.filter(event => {
      // Date range filter
      if (filter.dateRange) {
        if (event.timestamp < filter.dateRange.start || event.timestamp > filter.dateRange.end) {
          return false;
        }
      }

      // Vendor filter
      if (filter.vendorIds && !filter.vendorIds.includes(event.vendorId)) {
        return false;
      }

      // Label profile filter
      if (filter.labelProfileIds && !filter.labelProfileIds.includes(event.labelProfileId)) {
        return false;
      }

      // Printer filter
      if (filter.printerIds && event.printerId && !filter.printerIds.includes(event.printerId)) {
        return false;
      }

      // Event type filter
      if (filter.eventTypes && !filter.eventTypes.includes(event.eventType)) {
        return false;
      }

      // Error filter
      if (filter.includeErrors === false && event.metadata.errorCode) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate total labels from events
   */
  private calculateTotalLabels(events: LabelUsageEvent[]): number {
    return events
      .filter(e => e.eventType === 'label_printed' || e.eventType === 'label_compiled')
      .reduce((sum, e) => sum + (e.metadata.labelCount || 1), 0);
  }

  /**
   * Calculate total batches from events
   */
  private calculateTotalBatches(events: LabelUsageEvent[]): number {
    const batchIds = new Set(
      events
        .filter(e => e.eventType === 'batch_completed')
        .map(e => e.metadata.batchId)
        .filter(id => id)
    );
    return batchIds.size;
  }

  /**
   * Calculate total orders from events
   */
  private calculateTotalOrders(events: LabelUsageEvent[]): number {
    const orderIds = new Set(
      events
        .filter(e => e.orderId)
        .map(e => e.orderId)
    );
    return orderIds.size;
  }

  /**
   * Calculate average processing time
   */
  private calculateAverageProcessingTime(events: LabelUsageEvent[]): number {
    const processingEvents = events.filter(e => 
      e.metadata.processingTimeMs && e.metadata.processingTimeMs > 0
    );
    
    if (processingEvents.length === 0) return 0;
    
    const totalTime = processingEvents.reduce((sum, e) => sum + e.metadata.processingTimeMs!, 0);
    return totalTime / processingEvents.length;
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(events: LabelUsageEvent[]): number {
    const actionableEvents = events.filter(e => 
      e.eventType === 'label_printed' || 
      e.eventType === 'label_failed' ||
      e.eventType === 'batch_completed'
    );
    
    if (actionableEvents.length === 0) return 1;
    
    const successEvents = actionableEvents.filter(e => !e.metadata.errorCode);
    return successEvents.length / actionableEvents.length;
  }

  /**
   * Get top label profiles by usage
   */
  private getTopLabelProfiles(events: LabelUsageEvent[]): UsageRanking[] {
    const profileCounts = new Map<string, number>();
    
    events
      .filter(e => e.eventType === 'label_printed')
      .forEach(e => {
        const count = e.metadata.labelCount || 1;
        profileCounts.set(e.labelProfileId, (profileCounts.get(e.labelProfileId) || 0) + count);
      });
    
    const totalLabels = Array.from(profileCounts.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(profileCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({
        id,
        name: `Profile ${id}`, // In real implementation, lookup profile name
        count,
        percentage: (count / totalLabels) * 100,
        trend: 'stable' as const // Calculate actual trend
      }));
  }

  /**
   * Get top printers by usage
   */
  private getTopPrinters(events: LabelUsageEvent[]): UsageRanking[] {
    const printerCounts = new Map<string, number>();
    
    events
      .filter(e => e.eventType === 'label_printed' && e.printerId)
      .forEach(e => {
        const count = e.metadata.labelCount || 1;
        printerCounts.set(e.printerId!, (printerCounts.get(e.printerId!) || 0) + count);
      });
    
    const totalLabels = Array.from(printerCounts.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(printerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({
        id,
        name: `Printer ${id}`, // In real implementation, lookup printer name
        count,
        percentage: totalLabels > 0 ? (count / totalLabels) * 100 : 0,
        trend: 'stable' as const
      }));
  }

  /**
   * Analyze errors from events
   */
  private analyzeErrors(events: LabelUsageEvent[]): ErrorAnalysis {
    const errorEvents = events.filter(e => e.metadata.errorCode);
    const totalEvents = events.length;
    
    const errorCounts = new Map<string, { count: number; message: string }>();
    
    errorEvents.forEach(e => {
      const key = e.metadata.errorCode!;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        errorCounts.set(key, {
          count: 1,
          message: e.metadata.errorMessage || 'Unknown error'
        });
      }
    });
    
    const commonErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([code, { count, message }]) => ({
        code,
        message,
        count,
        percentage: (count / errorEvents.length) * 100
      }));
    
    return {
      totalErrors: errorEvents.length,
      errorRate: totalEvents > 0 ? errorEvents.length / totalEvents : 0,
      commonErrors,
      errorsByCategory: this.categorizeErrors(errorEvents)
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(events: LabelUsageEvent[]): PerformanceMetrics {
    const compilationEvents = events.filter(e => e.eventType === 'label_compiled');
    const printEvents = events.filter(e => e.eventType === 'label_printed');
    
    const avgCompilation = compilationEvents.length > 0
      ? compilationEvents.reduce((sum, e) => sum + (e.metadata.processingTimeMs || 0), 0) / compilationEvents.length
      : 0;
    
    const avgPrint = printEvents.length > 0
      ? printEvents.reduce((sum, e) => sum + (e.metadata.processingTimeMs || 0), 0) / printEvents.length
      : 0;
    
    const totalLabels = this.calculateTotalLabels(events);
    const hours = this.getHoursInPeriod(events);
    const throughput = hours > 0 ? totalLabels / hours : 0;
    
    return {
      averageCompilationTime: avgCompilation,
      averagePrintTime: avgPrint,
      throughputLabelsPerHour: throughput,
      peakUsageTime: this.findPeakUsageTime(events),
      systemUtilization: this.calculateSystemUtilization(events),
      bottlenecks: this.identifyBottlenecks(events)
    };
  }

  /**
   * Calculate cost analysis
   */
  private calculateCostAnalysis(events: LabelUsageEvent[]): CostAnalysis {
    const totalLabels = this.calculateTotalLabels(events);
    
    // Mock cost calculations (in real implementation, use actual cost data)
    const materialCost = totalLabels * 0.05; // $0.05 per label
    const laborCost = totalLabels * 0.02; // $0.02 per label labor
    const equipmentCost = totalLabels * 0.01; // $0.01 per label equipment
    
    return {
      totalCost: materialCost + laborCost + equipmentCost,
      costPerLabel: totalLabels > 0 ? (materialCost + laborCost + equipmentCost) / totalLabels : 0,
      materialCosts: materialCost,
      laborCosts: laborCost,
      equipmentCosts: equipmentCost,
      savings: {
        automationSavings: totalLabels * 0.10, // Automation saves $0.10 per label
        errorReductionSavings: totalLabels * 0.03, // Error reduction saves $0.03 per label
        efficiencySavings: totalLabels * 0.05 // Efficiency gains save $0.05 per label
      }
    };
  }

  /**
   * Analyze trends in usage data
   */
  private analyzeTrends(events: LabelUsageEvent[], period: AnalyticsPeriod): TrendAnalysis {
    const labelEvents = events.filter(e => e.eventType === 'label_printed');
    const totalLabels = this.calculateTotalLabels(labelEvents);
    
    // Calculate growth (mock implementation)
    const growth = Math.random() * 20 - 10; // -10% to +10% random growth
    
    return {
      labelVolumeGrowth: growth,
      usagePatterns: {
        hourlyDistribution: this.getHourlyDistribution(labelEvents),
        dailyDistribution: this.getDailyDistribution(labelEvents),
        seasonalTrends: this.getSeasonalTrends(labelEvents)
      },
      predictions: {
        nextMonthVolume: Math.round(totalLabels * (1 + growth / 100)),
        capacityRecommendations: this.generateCapacityRecommendations(events),
        optimizationOpportunities: this.generateOptimizationOpportunities(events)
      }
    };
  }

  // Helper methods

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isSignificantEvent(eventType: UsageEventType): boolean {
    return ['batch_completed', 'label_failed', 'printer_error'].includes(eventType);
  }

  private isCriticalEvent(eventType: UsageEventType): boolean {
    return ['label_failed', 'printer_error', 'rule_failed'].includes(eventType);
  }

  private updateRealTimeMetrics(event: LabelUsageEvent): void {
    // Update real-time metrics for dashboard
    // Implementation depends on caching/database layer
  }

  private getPeriodDates(period: AnalyticsPeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;
    
    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return { startDate, endDate };
  }

  private countActiveJobs(): number {
    // Count currently active print jobs
    return 3; // Mock implementation
  }

  private getQueueLength(): number {
    // Get current queue length
    return 12; // Mock implementation
  }

  private generateAlerts(events: LabelUsageEvent[]): RealtimeAlert[] {
    const alerts: RealtimeAlert[] = [];
    
    const errorEvents = events.filter(e => e.metadata.errorCode);
    if (errorEvents.length > 5) {
      alerts.push({
        id: 'high_error_rate',
        type: 'warning',
        message: `High error rate detected: ${errorEvents.length} errors in the last hour`,
        timestamp: new Date()
      });
    }
    
    return alerts;
  }

  private convertToCsv(analytics: UsageAnalytics): string {
    const headers = [
      'Metric', 'Value', 'Period', 'Start Date', 'End Date'
    ];
    
    const rows = [
      ['Total Labels', analytics.totalLabels.toString()],
      ['Total Batches', analytics.totalBatches.toString()],
      ['Success Rate', (analytics.successRate * 100).toFixed(2) + '%'],
      ['Average Processing Time', analytics.averageProcessingTime.toFixed(2) + 'ms']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => [
        row[0], row[1], 
        analytics.period,
        analytics.startDate.toISOString(),
        analytics.endDate.toISOString()
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  private categorizeErrors(errorEvents: LabelUsageEvent[]): Record<string, number> {
    const categories: Record<string, number> = {
      'compilation': 0,
      'printing': 0,
      'validation': 0,
      'network': 0,
      'other': 0
    };
    
    errorEvents.forEach(e => {
      const errorCode = e.metadata.errorCode || '';
      if (errorCode.includes('compile')) categories.compilation++;
      else if (errorCode.includes('print')) categories.printing++;
      else if (errorCode.includes('validation')) categories.validation++;
      else if (errorCode.includes('network')) categories.network++;
      else categories.other++;
    });
    
    return categories;
  }

  private getHoursInPeriod(events: LabelUsageEvent[]): number {
    if (events.length === 0) return 0;
    
    const timestamps = events.map(e => e.timestamp.getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return (maxTime - minTime) / (1000 * 60 * 60); // Convert to hours
  }

  private findPeakUsageTime(events: LabelUsageEvent[]): string {
    const hourCounts = new Map<number, number>();
    
    events.forEach(e => {
      const hour = e.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    let peakHour = 0;
    let maxCount = 0;
    
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    });
    
    return `${peakHour}:00`;
  }

  private calculateSystemUtilization(events: LabelUsageEvent[]): number {
    // Mock calculation - in real implementation, consider printer capacity, processing power, etc.
    const totalCapacity = 10000; // labels per hour
    const actualThroughput = this.calculateTotalLabels(events);
    const hours = this.getHoursInPeriod(events) || 1;
    
    return Math.min((actualThroughput / hours) / totalCapacity, 1) * 100;
  }

  private identifyBottlenecks(events: LabelUsageEvent[]): string[] {
    const bottlenecks: string[] = [];
    
    const avgCompilationTime = this.calculateAverageProcessingTime(
      events.filter(e => e.eventType === 'label_compiled')
    );
    
    if (avgCompilationTime > 5000) {
      bottlenecks.push('Label compilation performance');
    }
    
    const errorRate = this.calculateSuccessRate(events);
    if (errorRate < 0.9) {
      bottlenecks.push('High error rate affecting throughput');
    }
    
    return bottlenecks;
  }

  private getHourlyDistribution(events: LabelUsageEvent[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (let i = 0; i < 24; i++) {
      distribution[i.toString()] = 0;
    }
    
    events.forEach(e => {
      const hour = e.timestamp.getHours().toString();
      distribution[hour] += e.metadata.labelCount || 1;
    });
    
    return distribution;
  }

  private getDailyDistribution(events: LabelUsageEvent[]): Record<string, number> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const distribution: Record<string, number> = {};
    
    days.forEach(day => distribution[day] = 0);
    
    events.forEach(e => {
      const day = days[e.timestamp.getDay()];
      distribution[day] += e.metadata.labelCount || 1;
    });
    
    return distribution;
  }

  private getSeasonalTrends(events: LabelUsageEvent[]): Record<string, number> {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const distribution: Record<string, number> = {};
    
    seasons.forEach(season => distribution[season] = 0);
    
    events.forEach(e => {
      const month = e.timestamp.getMonth();
      let season: string;
      
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Fall';
      else season = 'Winter';
      
      distribution[season] += e.metadata.labelCount || 1;
    });
    
    return distribution;
  }

  private generateCapacityRecommendations(events: LabelUsageEvent[]): string[] {
    const recommendations: string[] = [];
    
    const utilization = this.calculateSystemUtilization(events);
    if (utilization > 80) {
      recommendations.push('Consider adding additional printers to handle peak load');
    }
    
    const errorRate = 1 - this.calculateSuccessRate(events);
    if (errorRate > 0.1) {
      recommendations.push('Review and optimize label templates to reduce errors');
    }
    
    return recommendations;
  }

  private generateOptimizationOpportunities(events: LabelUsageEvent[]): string[] {
    const opportunities: string[] = [];
    
    const avgProcessingTime = this.calculateAverageProcessingTime(events);
    if (avgProcessingTime > 3000) {
      opportunities.push('Optimize label compilation algorithms for better performance');
    }
    
    opportunities.push('Implement intelligent batching to reduce processing overhead');
    opportunities.push('Consider caching frequently used templates');
    
    return opportunities;
  }
}

interface RealtimeAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}
