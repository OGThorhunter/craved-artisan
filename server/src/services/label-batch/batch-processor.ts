import { LabelProfile, PrinterProfile } from '@prisma/client';
import { ResolvedLabelItem, LabelResolutionResult } from '../label-resolution/order-label-resolver';
import { logger } from '../../logger';

export interface BatchJob {
  id: string;
  printerProfile: PrinterProfile;
  labelProfile: LabelProfile;
  labels: BatchLabelItem[];
  estimatedPrintTime: number;
  priority: BatchPriority;
  status: BatchStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface BatchLabelItem {
  id: string;
  orderItemId: string;
  orderId: string;
  labelData: ResolvedLabelItem['labelData'];
  copies: number;
  sequenceNumber: number;
}

export enum BatchPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4
}

export enum BatchStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PRINTING = 'PRINTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface BatchOptimizationOptions {
  maxLabelsPerBatch?: number;
  maxBatchSizeBytes?: number;
  groupByPrinter?: boolean;
  groupByProfile?: boolean;
  prioritizeByOrderAge?: boolean;
  allowProfileMixing?: boolean;
  maxPrintTimeMinutes?: number;
}

export interface BatchOptimizationResult {
  batches: BatchJob[];
  statistics: {
    totalLabels: number;
    totalBatches: number;
    averageLabelsPerBatch: number;
    estimatedTotalPrintTime: number;
    optimizationScore: number;
  };
  warnings: string[];
}

export class BatchProcessor {
  private static readonly DEFAULT_MAX_LABELS_PER_BATCH = 100;
  private static readonly DEFAULT_MAX_BATCH_SIZE_BYTES = 1024 * 1024; // 1MB
  private static readonly DEFAULT_MAX_PRINT_TIME_MINUTES = 30;

  /**
   * Process label resolution results into optimized print batches
   */
  async createOptimizedBatches(
    labelResults: LabelResolutionResult[],
    availablePrinters: PrinterProfile[],
    options: BatchOptimizationOptions = {}
  ): Promise<BatchOptimizationResult> {
    logger.info('Starting batch optimization', {
      labelResultsCount: labelResults.length,
      availablePrinters: availablePrinters.length,
      options
    });

    try {
      // Flatten all label items from all orders
      const allLabelItems = this.flattenLabelItems(labelResults);
      
      // Validate printer compatibility
      this.validatePrinterCompatibility(allLabelItems, availablePrinters);
      
      // Group labels by compatibility and optimization criteria
      const labelGroups = this.groupLabelsForOptimization(allLabelItems, options);
      
      // Create batches from groups
      const batches = await this.createBatchesFromGroups(labelGroups, availablePrinters, options);
      
      // Optimize batch order and priority
      const optimizedBatches = this.optimizeBatchOrder(batches, options);
      
      // Calculate statistics and warnings
      const statistics = this.calculateBatchStatistics(optimizedBatches);
      const warnings = this.generateOptimizationWarnings(optimizedBatches, options);

      const result: BatchOptimizationResult = {
        batches: optimizedBatches,
        statistics,
        warnings
      };

      logger.info('Batch optimization completed', {
        totalBatches: result.batches.length,
        totalLabels: statistics.totalLabels,
        optimizationScore: statistics.optimizationScore
      });

      return result;

    } catch (error) {
      logger.error('Batch optimization failed', { error: error.message });
      throw new Error(`Batch optimization failed: ${error.message}`);
    }
  }

  /**
   * Flatten label resolution results into individual label items
   */
  private flattenLabelItems(labelResults: LabelResolutionResult[]): ResolvedLabelItem[] {
    const flatItems: ResolvedLabelItem[] = [];
    
    for (const result of labelResults) {
      for (const item of result.items) {
        // Create individual entries for each copy needed
        for (let copy = 1; copy <= item.labelsPerItem; copy++) {
          flatItems.push({
            ...item,
            labelsPerItem: 1 // Each flattened item represents 1 label
          });
        }
      }
    }

    logger.debug('Flattened label items', { 
      originalResults: labelResults.length,
      flattenedItems: flatItems.length 
    });

    return flatItems;
  }

  /**
   * Validate that printers can handle the required label profiles
   */
  private validatePrinterCompatibility(
    labelItems: ResolvedLabelItem[],
    availablePrinters: PrinterProfile[]
  ): void {
    const requiredProfiles = new Set(labelItems.map(item => item.labelProfile.id));
    const incompatibleProfiles: string[] = [];

    for (const profileId of requiredProfiles) {
      const labelProfile = labelItems.find(item => item.labelProfile.id === profileId)?.labelProfile;
      if (!labelProfile) continue;

      const compatiblePrinter = availablePrinters.find(printer => 
        this.isPrinterCompatibleWithProfile(printer, labelProfile)
      );

      if (!compatiblePrinter) {
        incompatibleProfiles.push(labelProfile.name);
      }
    }

    if (incompatibleProfiles.length > 0) {
      throw new Error(`No compatible printers found for profiles: ${incompatibleProfiles.join(', ')}`);
    }
  }

  /**
   * Group labels for optimal batching
   */
  private groupLabelsForOptimization(
    labelItems: ResolvedLabelItem[],
    options: BatchOptimizationOptions
  ): Map<string, ResolvedLabelItem[]> {
    const groups = new Map<string, ResolvedLabelItem[]>();

    for (const item of labelItems) {
      // Create grouping key based on optimization strategy
      const groupKey = this.createGroupingKey(item, options);
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      
      groups.get(groupKey)!.push(item);
    }

    logger.debug('Created label groups', { 
      totalGroups: groups.size,
      groupSizes: Array.from(groups.values()).map(g => g.length)
    });

    return groups;
  }

  /**
   * Create a grouping key for batch optimization
   */
  private createGroupingKey(item: ResolvedLabelItem, options: BatchOptimizationOptions): string {
    const keyParts: string[] = [];

    // Always group by label profile unless explicitly disabled
    if (options.groupByProfile !== false) {
      keyParts.push(`profile:${item.labelProfile.id}`);
    }

    // Group by printer if enabled
    if (options.groupByPrinter) {
      keyParts.push(`printer:compatible`); // This would need actual printer assignment logic
    }

    // Add priority grouping if prioritizing by order age
    if (options.prioritizeByOrderAge) {
      // This would require order creation date - simplified for now
      keyParts.push(`priority:normal`);
    }

    return keyParts.join('|') || 'default';
  }

  /**
   * Create batch jobs from label groups
   */
  private async createBatchesFromGroups(
    labelGroups: Map<string, ResolvedLabelItem[]>,
    availablePrinters: PrinterProfile[],
    options: BatchOptimizationOptions
  ): Promise<BatchJob[]> {
    const batches: BatchJob[] = [];
    const maxLabelsPerBatch = options.maxLabelsPerBatch || BatchProcessor.DEFAULT_MAX_LABELS_PER_BATCH;
    const maxBatchSizeBytes = options.maxBatchSizeBytes || BatchProcessor.DEFAULT_MAX_BATCH_SIZE_BYTES;

    for (const [groupKey, labelItems] of labelGroups) {
      const labelProfile = labelItems[0].labelProfile;
      
      // Find compatible printer for this group
      const printer = this.findBestPrinterForProfile(labelProfile, availablePrinters);
      if (!printer) {
        logger.warn('No compatible printer found for profile', { 
          profileId: labelProfile.id,
          profileName: labelProfile.name 
        });
        continue;
      }

      // Split group into batches based on size limits
      const groupBatches = this.splitGroupIntoBatches(
        labelItems, 
        printer, 
        labelProfile, 
        maxLabelsPerBatch,
        maxBatchSizeBytes
      );

      batches.push(...groupBatches);
    }

    return batches;
  }

  /**
   * Split a group of labels into multiple batches based on size constraints
   */
  private splitGroupIntoBatches(
    labelItems: ResolvedLabelItem[],
    printer: PrinterProfile,
    labelProfile: LabelProfile,
    maxLabels: number,
    maxSizeBytes: number
  ): BatchJob[] {
    const batches: BatchJob[] = [];
    let currentBatch: BatchLabelItem[] = [];
    let currentSizeBytes = 0;
    let sequenceNumber = 1;

    for (const labelItem of labelItems) {
      // Estimate label size in bytes (rough calculation)
      const estimatedLabelSizeBytes = this.estimateLabelSizeBytes(labelItem, labelProfile, printer);

      // Check if adding this label would exceed limits
      if (currentBatch.length >= maxLabels || 
          currentSizeBytes + estimatedLabelSizeBytes > maxSizeBytes) {
        
        // Create batch from current items
        if (currentBatch.length > 0) {
          batches.push(this.createBatchJob(currentBatch, printer, labelProfile));
          currentBatch = [];
          currentSizeBytes = 0;
          sequenceNumber = 1;
        }
      }

      // Add item to current batch
      const batchItem: BatchLabelItem = {
        id: `${labelItem.orderItemId}-${Date.now()}-${sequenceNumber}`,
        orderItemId: labelItem.orderItemId,
        orderId: this.extractOrderIdFromItem(labelItem),
        labelData: labelItem.labelData,
        copies: 1,
        sequenceNumber: sequenceNumber++
      };

      currentBatch.push(batchItem);
      currentSizeBytes += estimatedLabelSizeBytes;
    }

    // Create final batch if there are remaining items
    if (currentBatch.length > 0) {
      batches.push(this.createBatchJob(currentBatch, printer, labelProfile));
    }

    return batches;
  }

  /**
   * Create a batch job from batch items
   */
  private createBatchJob(
    batchItems: BatchLabelItem[],
    printer: PrinterProfile,
    labelProfile: LabelProfile
  ): BatchJob {
    const estimatedPrintTime = this.estimatePrintTime(batchItems, printer, labelProfile);
    const priority = this.determineBatchPriority(batchItems);

    return {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      printerProfile: printer,
      labelProfile: labelProfile,
      labels: batchItems,
      estimatedPrintTime,
      priority,
      status: BatchStatus.PENDING,
      createdAt: new Date()
    };
  }

  /**
   * Optimize the order of batches for printing
   */
  private optimizeBatchOrder(
    batches: BatchJob[],
    options: BatchOptimizationOptions
  ): BatchJob[] {
    // Sort by priority (highest first), then by estimated print time (shortest first)
    return batches.sort((a, b) => {
      // Priority comparison (higher priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Print time comparison (shorter jobs first for faster turnaround)
      return a.estimatedPrintTime - b.estimatedPrintTime;
    });
  }

  /**
   * Find the best printer for a given label profile
   */
  private findBestPrinterForProfile(
    labelProfile: LabelProfile,
    availablePrinters: PrinterProfile[]
  ): PrinterProfile | undefined {
    // Filter compatible printers
    const compatiblePrinters = availablePrinters.filter(printer =>
      this.isPrinterCompatibleWithProfile(printer, labelProfile)
    );

    if (compatiblePrinters.length === 0) {
      return undefined;
    }

    // Prefer printers with matching print engine
    const exactMatches = compatiblePrinters.filter(printer =>
      printer.printEngine === labelProfile.printEngine
    );

    if (exactMatches.length > 0) {
      // Sort by capabilities/priority and return the best
      return exactMatches.sort((a, b) => {
        // Prefer printers with higher DPI for better quality
        const aDpi = parseInt(a.capabilities || '203');
        const bDpi = parseInt(b.capabilities || '203');
        return bDpi - aDpi;
      })[0];
    }

    // Return any compatible printer
    return compatiblePrinters[0];
  }

  /**
   * Check if a printer is compatible with a label profile
   */
  private isPrinterCompatibleWithProfile(
    printer: PrinterProfile,
    labelProfile: LabelProfile
  ): boolean {
    // Check print engine compatibility
    const engineCompatible = printer.printEngine === labelProfile.printEngine ||
                            printer.printEngine === 'PDF'; // PDF is universal

    // Check media size compatibility
    const mediaCompatible = this.isMediaSizeCompatible(printer, labelProfile);

    // Check if printer is active
    const printerActive = printer.isActive;

    return engineCompatible && mediaCompatible && printerActive;
  }

  /**
   * Check if printer supports the required media size
   */
  private isMediaSizeCompatible(
    printer: PrinterProfile,
    labelProfile: LabelProfile
  ): boolean {
    try {
      const printerMedia = printer.supportedMedia ? JSON.parse(printer.supportedMedia) : [];
      
      // Find matching media size
      return printerMedia.some((media: any) => {
        const widthMatch = Math.abs(media.width - labelProfile.width) < 0.1;
        const heightMatch = Math.abs(media.height - labelProfile.height) < 0.1;
        return widthMatch && heightMatch;
      });
    } catch (error) {
      // If media parsing fails, assume compatibility
      logger.warn('Failed to parse printer media', { 
        printerId: printer.id, 
        error: error.message 
      });
      return true;
    }
  }

  /**
   * Estimate label size in bytes
   */
  private estimateLabelSizeBytes(
    labelItem: ResolvedLabelItem,
    labelProfile: LabelProfile,
    printer: PrinterProfile
  ): number {
    // Base size for label metadata
    let sizeBytes = 1024; // 1KB base

    // Add text content size
    sizeBytes += Buffer.byteLength(labelItem.labelData.text || '', 'utf8');

    // Add barcode data size
    if (labelItem.labelData.barcode) {
      sizeBytes += Buffer.byteLength(labelItem.labelData.barcode, 'utf8') * 2; // Barcode overhead
    }

    // Add QR code data size
    if (labelItem.labelData.qrCode) {
      sizeBytes += Buffer.byteLength(labelItem.labelData.qrCode, 'utf8') * 3; // QR code overhead
    }

    // Add custom fields size
    sizeBytes += Buffer.byteLength(JSON.stringify(labelItem.labelData.customFields), 'utf8');

    // Multiply by engine-specific overhead
    switch (printer.printEngine) {
      case 'ZPL':
        sizeBytes *= 1.5; // ZPL is relatively compact
        break;
      case 'PDF':
        sizeBytes *= 3; // PDF has significant overhead
        break;
      default:
        sizeBytes *= 2; // Default overhead
    }

    return Math.round(sizeBytes);
  }

  /**
   * Estimate print time for a batch
   */
  private estimatePrintTime(
    batchItems: BatchLabelItem[],
    printer: PrinterProfile,
    labelProfile: LabelProfile
  ): number {
    const labelCount = batchItems.length;
    
    // Base time per label in seconds (varies by printer type)
    let baseTimePerLabel = 3; // 3 seconds default
    
    if (printer.printEngine === 'ZPL') {
      baseTimePerLabel = 2; // Thermal printers are faster
    } else if (printer.printEngine === 'PDF') {
      baseTimePerLabel = 5; // PDF processing is slower
    }

    // Adjust for label complexity
    const complexity = this.calculateLabelComplexity(labelProfile);
    const adjustedTimePerLabel = baseTimePerLabel * complexity;

    // Add setup time
    const setupTime = 10; // 10 seconds setup per batch

    return setupTime + (labelCount * adjustedTimePerLabel);
  }

  /**
   * Calculate label complexity factor
   */
  private calculateLabelComplexity(labelProfile: LabelProfile): number {
    let complexity = 1;

    try {
      if (labelProfile.templateData) {
        const template = JSON.parse(labelProfile.templateData);
        const elements = template.elements || [];
        
        // More elements = more complex
        complexity += elements.length * 0.1;
        
        // Certain element types add complexity
        for (const element of elements) {
          if (element.type === 'barcode' || element.type === 'qrcode') {
            complexity += 0.5;
          }
          if (element.type === 'image') {
            complexity += 1;
          }
        }
      }
    } catch (error) {
      // If template parsing fails, assume medium complexity
      complexity = 1.5;
    }

    return Math.min(complexity, 3); // Cap at 3x base complexity
  }

  /**
   * Determine batch priority based on order characteristics
   */
  private determineBatchPriority(batchItems: BatchLabelItem[]): BatchPriority {
    // For now, return normal priority
    // In a full implementation, this could consider:
    // - Order urgency
    // - Customer priority levels
    // - SLA requirements
    // - Order age
    
    return BatchPriority.NORMAL;
  }

  /**
   * Extract order ID from label item
   */
  private extractOrderIdFromItem(labelItem: ResolvedLabelItem): string {
    // This would need to be implemented based on your data structure
    // For now, return a placeholder
    return 'order-unknown';
  }

  /**
   * Calculate batch statistics
   */
  private calculateBatchStatistics(batches: BatchJob[]): BatchOptimizationResult['statistics'] {
    const totalLabels = batches.reduce((sum, batch) => sum + batch.labels.length, 0);
    const totalBatches = batches.length;
    const averageLabelsPerBatch = totalLabels / totalBatches;
    const estimatedTotalPrintTime = batches.reduce((sum, batch) => sum + batch.estimatedPrintTime, 0);
    
    // Calculate optimization score (0-100, higher is better)
    const idealBatchSize = 50; // Assume ideal batch size
    const batchSizeScore = Math.max(0, 100 - Math.abs(averageLabelsPerBatch - idealBatchSize));
    const utilizationScore = (totalLabels / (totalBatches * 100)) * 100; // Utilization efficiency
    const optimizationScore = (batchSizeScore + utilizationScore) / 2;

    return {
      totalLabels,
      totalBatches,
      averageLabelsPerBatch,
      estimatedTotalPrintTime,
      optimizationScore: Math.round(optimizationScore * 100) / 100
    };
  }

  /**
   * Generate optimization warnings
   */
  private generateOptimizationWarnings(
    batches: BatchJob[],
    options: BatchOptimizationOptions
  ): string[] {
    const warnings: string[] = [];
    
    const maxPrintTime = options.maxPrintTimeMinutes || BatchProcessor.DEFAULT_MAX_PRINT_TIME_MINUTES;
    
    // Check for long-running batches
    const longBatches = batches.filter(batch => batch.estimatedPrintTime > maxPrintTime * 60);
    if (longBatches.length > 0) {
      warnings.push(`${longBatches.length} batches exceed maximum print time of ${maxPrintTime} minutes`);
    }
    
    // Check for very small batches (inefficient)
    const smallBatches = batches.filter(batch => batch.labels.length < 5);
    if (smallBatches.length > 0) {
      warnings.push(`${smallBatches.length} batches have fewer than 5 labels (may be inefficient)`);
    }
    
    // Check for printer distribution
    const printerUsage = new Map<string, number>();
    for (const batch of batches) {
      const printerId = batch.printerProfile.id;
      printerUsage.set(printerId, (printerUsage.get(printerId) || 0) + 1);
    }
    
    if (printerUsage.size === 1 && batches.length > 5) {
      warnings.push('All batches assigned to single printer - consider load balancing');
    }

    return warnings;
  }
}
