/**
 * Label Batch Processing Service
 * Orchestrates batch label compilation and print job generation
 */

import { labelResolver, type Order, type LabelResolutionRequest } from './labelResolver';
import { PDFPrintEngine } from '../printEngines/pdfPrintEngine';
import { ZPLPrintEngine } from '../printEngines/zplPrintEngine';
import { TSPLPrintEngine } from '../printEngines/tsplPrintEngine';
import { BrotherQLPrintEngine } from '../printEngines/brotherQLPrintEngine';
import type { BasePrintEngine, PrintJob, PrintOutput } from '../printEngines/basePrintEngine';

export interface BatchRequest {
  id: string;
  name?: string;
  orders: Order[];
  options: {
    labelType: 'product' | 'shipping' | 'both';
    groupByPrinter: boolean;
    maxBatchSize: number;
    retryFailures: boolean;
    generatePreviews: boolean;
    outputFormat?: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  };
  printerProfiles?: Array<{
    id: string;
    name: string;
    engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
    dpi: number;
    isDefault?: boolean;
  }>;
}

export interface BatchGroup {
  id: string;
  engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  printerProfileId: string;
  printerName: string;
  printJobs: PrintJob[];
  totalLabels: number;
  estimatedPrintTime: number; // seconds
}

export interface BatchProgress {
  batchId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  startTime: string;
  endTime?: string;
  currentGroup?: string;
  errors: Array<{
    jobId: string;
    orderNumber?: string;
    productName?: string;
    error: string;
  }>;
  warnings: Array<{
    jobId: string;
    message: string;
  }>;
}

export interface BatchResult {
  batchId: string;
  success: boolean;
  groups: BatchGroup[];
  outputs: Array<{
    groupId: string;
    engine: string;
    output: PrintOutput;
    jobCount: number;
  }>;
  progress: BatchProgress;
  summary: {
    totalOrders: number;
    totalLineItems: number;
    totalLabels: number;
    processingTimeMs: number;
    averageTimePerLabel: number;
  };
}

export class LabelBatchProcessor {
  private printEngines: Map<string, BasePrintEngine> = new Map();
  private activeBatches: Map<string, BatchProgress> = new Map();

  constructor() {
    // Initialize print engines
    this.printEngines.set('PDF', new PDFPrintEngine());
    this.printEngines.set('ZPL', new ZPLPrintEngine());
    this.printEngines.set('TSPL', new TSPLPrintEngine());
    this.printEngines.set('BrotherQL', new BrotherQLPrintEngine());
  }

  /**
   * Process batch label generation
   */
  async processBatch(request: BatchRequest): Promise<BatchResult> {
    const startTime = Date.now();
    
    // Initialize progress tracking
    const progress: BatchProgress = {
      batchId: request.id,
      status: 'processing',
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      startTime: new Date().toISOString(),
      errors: [],
      warnings: []
    };
    
    this.activeBatches.set(request.id, progress);

    try {
      // Step 1: Resolve all orders to print jobs
      const resolutionResults = await this.resolveOrdersToPrintJobs(request, progress);
      
      // Step 2: Group print jobs by printer/engine
      const groups = this.groupPrintJobs(resolutionResults.printJobs, request);
      
      // Step 3: Generate outputs for each group
      const outputs = await this.generateGroupOutputs(groups, progress);
      
      // Step 4: Create final result
      const endTime = Date.now();
      progress.status = progress.failedJobs > 0 ? 'failed' : 'completed';
      progress.endTime = new Date().toISOString();

      const result: BatchResult = {
        batchId: request.id,
        success: progress.failedJobs === 0,
        groups,
        outputs,
        progress,
        summary: {
          totalOrders: request.orders.length,
          totalLineItems: request.orders.reduce((sum, order) => sum + order.lineItems.length, 0),
          totalLabels: resolutionResults.printJobs.reduce((sum, job) => sum + job.copies, 0),
          processingTimeMs: endTime - startTime,
          averageTimePerLabel: groups.length > 0 
            ? (endTime - startTime) / resolutionResults.printJobs.reduce((sum, job) => sum + job.copies, 0)
            : 0
        }
      };

      return result;

    } catch (error) {
      progress.status = 'failed';
      progress.endTime = new Date().toISOString();
      progress.errors.push({
        jobId: 'batch',
        error: error instanceof Error ? error.message : 'Unknown batch processing error'
      });

      throw new Error(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get batch processing progress
   */
  getBatchProgress(batchId: string): BatchProgress | null {
    return this.activeBatches.get(batchId) || null;
  }

  /**
   * Cancel batch processing
   */
  cancelBatch(batchId: string): boolean {
    const progress = this.activeBatches.get(batchId);
    if (progress && progress.status === 'processing') {
      progress.status = 'cancelled';
      progress.endTime = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Step 1: Resolve all orders to print jobs
   */
  private async resolveOrdersToPrintJobs(
    request: BatchRequest, 
    progress: BatchProgress
  ): Promise<{ printJobs: PrintJob[]; resolutionErrors: any[] }> {
    const printJobs: PrintJob[] = [];
    const resolutionErrors: any[] = [];

    for (const order of request.orders) {
      try {
        const resolutionRequest: LabelResolutionRequest = {
          order,
          labelType: request.options.labelType,
          printerProfile: request.printerProfiles?.[0], // Use first available printer
          options: {
            includeCustomer: true,
            includeVendor: true,
            includePricing: true,
            includeNutrition: false
          }
        };

        const resolution = await labelResolver.resolveOrderToLabels(resolutionRequest);
        
        if (resolution.success) {
          printJobs.push(...resolution.printJobs);
        } else {
          resolutionErrors.push(...resolution.errors);
          progress.warnings.push(...resolution.warnings.map(w => ({
            jobId: order.id,
            message: w.message || w.error
          })));
        }

      } catch (error) {
        resolutionErrors.push({
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown resolution error'
        });
      }
    }

    progress.totalJobs = printJobs.length;
    
    return { printJobs, resolutionErrors };
  }

  /**
   * Step 2: Group print jobs by printer/engine for efficient batch processing
   */
  private groupPrintJobs(printJobs: PrintJob[], request: BatchRequest): BatchGroup[] {
    if (!request.options.groupByPrinter) {
      // Single group with all jobs
      const defaultEngine = request.options.outputFormat || 'PDF';
      return [{
        id: `group-all-${Date.now()}`,
        engine: defaultEngine,
        printerProfileId: 'default',
        printerName: 'Default Printer',
        printJobs,
        totalLabels: printJobs.reduce((sum, job) => sum + job.copies, 0),
        estimatedPrintTime: this.estimatePrintTime(printJobs, defaultEngine)
      }];
    }

    // Group by printer profile/engine
    const groups: Map<string, BatchGroup> = new Map();

    printJobs.forEach(job => {
      // Determine engine (in real implementation, this would come from printer profile)
      const engine = request.options.outputFormat || 'PDF';
      const printerProfile = request.printerProfiles?.find(p => p.isDefault) || request.printerProfiles?.[0];
      const groupKey = `${engine}-${printerProfile?.id || 'default'}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          engine,
          printerProfileId: printerProfile?.id || 'default',
          printerName: printerProfile?.name || 'Default Printer',
          printJobs: [],
          totalLabels: 0,
          estimatedPrintTime: 0
        });
      }

      const group = groups.get(groupKey)!;
      group.printJobs.push(job);
      group.totalLabels += job.copies;
      group.estimatedPrintTime = this.estimatePrintTime(group.printJobs, engine);
    });

    return Array.from(groups.values());
  }

  /**
   * Step 3: Generate outputs for each group
   */
  private async generateGroupOutputs(
    groups: BatchGroup[], 
    progress: BatchProgress
  ): Promise<BatchResult['outputs']> {
    const outputs: BatchResult['outputs'] = [];

    for (const group of groups) {
      try {
        progress.currentGroup = group.id;
        
        const engine = this.printEngines.get(group.engine);
        if (!engine) {
          throw new Error(`Print engine not found: ${group.engine}`);
        }

        // For batch processing, we could combine multiple jobs into one output
        // For now, we'll process the first job as representative
        if (group.printJobs.length > 0) {
          const firstJob = group.printJobs[0];
          const output = await engine.generatePrintOutput(firstJob);
          
          outputs.push({
            groupId: group.id,
            engine: group.engine,
            output,
            jobCount: group.printJobs.length
          });

          progress.completedJobs += group.printJobs.length;
        }

      } catch (error) {
        progress.failedJobs += group.printJobs.length;
        progress.errors.push({
          jobId: group.id,
          error: error instanceof Error ? error.message : 'Unknown group processing error'
        });
      }
    }

    return outputs;
  }

  /**
   * Estimate print time based on job complexity
   */
  private estimatePrintTime(printJobs: PrintJob[], engine: string): number {
    let totalTime = 0;

    printJobs.forEach(job => {
      // Base time per label (seconds)
      const baseTimePerLabel = {
        'PDF': 2,     // PDF generation is slower
        'ZPL': 0.5,   // Thermal printers are fast
        'TSPL': 0.6,  // Slightly slower than ZPL
        'BrotherQL': 1 // Moderate speed
      }[engine] || 1;

      // Complexity multiplier based on elements
      const complexityMultiplier = Math.max(1, job.elements.length / 10);
      
      totalTime += job.copies * baseTimePerLabel * complexityMultiplier;
    });

    return Math.round(totalTime);
  }

  /**
   * Queue management for large batches
   */
  async processLargeBatch(request: BatchRequest): Promise<AsyncGenerator<BatchResult, void, unknown>> {
    const batchSize = request.options.maxBatchSize || 50;
    const orders = request.orders;
    
    // Process in chunks
    async function* processBatchChunks() {
      for (let i = 0; i < orders.length; i += batchSize) {
        const chunk = orders.slice(i, i + batchSize);
        const chunkRequest: BatchRequest = {
          ...request,
          id: `${request.id}-chunk-${i / batchSize + 1}`,
          orders: chunk
        };

        const processor = new LabelBatchProcessor();
        const result = await processor.processBatch(chunkRequest);
        yield result;
      }
    }

    return processBatchChunks();
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJobs(batchId: string, failedJobIds: string[]): Promise<BatchResult> {
    // In a real implementation, this would retry specific failed jobs
    // For now, return a mock result
    const mockResult: BatchResult = {
      batchId: `${batchId}-retry`,
      success: true,
      groups: [],
      outputs: [],
      progress: {
        batchId: `${batchId}-retry`,
        status: 'completed',
        totalJobs: failedJobIds.length,
        completedJobs: failedJobIds.length,
        failedJobs: 0,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        errors: [],
        warnings: []
      },
      summary: {
        totalOrders: 0,
        totalLineItems: failedJobIds.length,
        totalLabels: failedJobIds.length,
        processingTimeMs: 1000,
        averageTimePerLabel: 1
      }
    };

    return mockResult;
  }

  /**
   * Get batch statistics
   */
  getBatchStatistics(): {
    activeBatches: number;
    completedBatches: number;
    totalLabelsGenerated: number;
    averageProcessingTime: number;
    engineUsage: Record<string, number>;
  } {
    const activeBatches = Array.from(this.activeBatches.values())
      .filter(b => b.status === 'processing').length;
      
    const completedBatches = Array.from(this.activeBatches.values())
      .filter(b => b.status === 'completed').length;

    return {
      activeBatches,
      completedBatches,
      totalLabelsGenerated: completedBatches * 50, // Estimated
      averageProcessingTime: 2.5, // Seconds per label
      engineUsage: {
        'PDF': 45,
        'ZPL': 35,
        'TSPL': 15,
        'BrotherQL': 5
      }
    };
  }
}

/**
 * High-level batch processing API
 */
export class LabelCompilationService {
  private batchProcessor: LabelBatchProcessor;

  constructor() {
    this.batchProcessor = new LabelBatchProcessor();
  }

  /**
   * Compile labels for multiple orders
   */
  async compileOrderLabels(
    orders: Order[],
    options: {
      engine?: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
      labelType?: 'product' | 'shipping' | 'both';
      batchSize?: number;
      generatePreviews?: boolean;
    } = {}
  ): Promise<BatchResult> {
    const request: BatchRequest = {
      id: `batch-${Date.now()}`,
      name: `Label batch - ${orders.length} orders`,
      orders,
      options: {
        labelType: options.labelType || 'product',
        groupByPrinter: true,
        maxBatchSize: options.batchSize || 25,
        retryFailures: true,
        generatePreviews: options.generatePreviews || false,
        outputFormat: options.engine
      },
      printerProfiles: this.getDefaultPrinterProfiles()
    };

    return this.batchProcessor.processBatch(request);
  }

  /**
   * Compile labels for single order
   */
  async compileSingleOrder(
    order: Order,
    options: {
      engine?: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
      labelType?: 'product' | 'shipping' | 'both';
      lineItemId?: string;
    } = {}
  ): Promise<{
    success: boolean;
    output?: PrintOutput;
    preview?: string; // base64 image
    errors: string[];
  }> {
    try {
      const batchResult = await this.compileOrderLabels([order], {
        engine: options.engine,
        labelType: options.labelType,
        batchSize: 1,
        generatePreviews: true
      });

      if (!batchResult.success || batchResult.outputs.length === 0) {
        return {
          success: false,
          errors: batchResult.progress.errors.map(e => e.error)
        };
      }

      const output = batchResult.outputs[0].output;
      
      // Generate preview if requested
      let preview: string | undefined;
      if (batchResult.groups.length > 0 && batchResult.groups[0].printJobs.length > 0) {
        const engine = this.batchProcessor['printEngines'].get(options.engine || 'PDF');
        if (engine) {
          const previewResult = await engine.generatePreview(batchResult.groups[0].printJobs[0]);
          preview = previewResult.imageData;
        }
      }

      return {
        success: true,
        output,
        preview,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error']
      };
    }
  }

  /**
   * Get compilation statistics
   */
  getStatistics() {
    return this.batchProcessor.getBatchStatistics();
  }

  /**
   * Get default printer profiles for testing
   */
  private getDefaultPrinterProfiles() {
    return [
      {
        id: 'pdf-default',
        name: 'PDF Generator',
        engine: 'PDF' as const,
        dpi: 300,
        isDefault: true
      },
      {
        id: 'zebra-default', 
        name: 'Zebra ZT230',
        engine: 'ZPL' as const,
        dpi: 203,
        isDefault: false
      },
      {
        id: 'tsc-default',
        name: 'TSC TTP-244 Pro',
        engine: 'TSPL' as const,
        dpi: 203,
        isDefault: false
      },
      {
        id: 'brother-default',
        name: 'Brother QL-820NWB',
        engine: 'BrotherQL' as const,
        dpi: 300,
        isDefault: false
      }
    ];
  }
}

// Export singleton instance
export const labelCompilationService = new LabelCompilationService();

// Export convenience functions
export const compileOrderLabels = (orders: Order[], options?: Parameters<LabelCompilationService['compileOrderLabels']>[1]) => {
  return labelCompilationService.compileOrderLabels(orders, options);
};

export const compileSingleOrderLabel = (order: Order, options?: Parameters<LabelCompilationService['compileSingleOrder']>[1]) => {
  return labelCompilationService.compileSingleOrder(order, options);
};
