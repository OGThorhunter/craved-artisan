import { PrismaClient, PrinterProfile } from '@prisma/client';
import { OrderLabelResolver, LabelResolutionOptions } from '../label-resolution/order-label-resolver';
import { BatchProcessor, BatchOptimizationOptions, BatchJob, BatchStatus } from '../label-batch/batch-processor';
import { PDFPrintEngine, LabelData, PrintJobRequest } from '../print-engines/pdf-print-engine';
import { ZPLPrintEngine } from '../print-engines/zpl-print-engine';
import { logger } from '../../logger';

export interface CompileLabelRequest {
  orderIds: string[];
  printerIds?: string[];
  labelResolutionOptions?: LabelResolutionOptions;
  batchOptimizationOptions?: BatchOptimizationOptions;
  outputFormat?: 'PDF' | 'ZPL' | 'AUTO';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface CompileLabelResponse {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  batches: BatchJobSummary[];
  summary: {
    totalOrders: number;
    totalLabels: number;
    totalBatches: number;
    estimatedCompletionTime: number;
  };
  downloadUrls?: {
    batchId: string;
    format: string;
    url: string;
    sizeBytes: number;
  }[];
  errors?: string[];
}

export interface BatchJobSummary {
  batchId: string;
  printerName: string;
  labelProfileName: string;
  labelCount: number;
  estimatedPrintTime: number;
  status: BatchStatus;
  downloadUrl?: string;
}

export interface CompilationJobStatus {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: {
    currentStep: string;
    completedSteps: number;
    totalSteps: number;
    percentage: number;
  };
  batches: BatchJobSummary[];
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export class LabelCompilationService {
  private prisma: PrismaClient;
  private orderResolver: OrderLabelResolver;
  private batchProcessor: BatchProcessor;
  private pdfEngine: PDFPrintEngine;
  private zplEngine: ZPLPrintEngine;
  private activeJobs: Map<string, CompilationJobStatus>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.orderResolver = new OrderLabelResolver(prisma);
    this.batchProcessor = new BatchProcessor();
    this.pdfEngine = new PDFPrintEngine();
    this.zplEngine = new ZPLPrintEngine();
    this.activeJobs = new Map();
  }

  /**
   * Compile labels for multiple orders
   */
  async compileLabels(request: CompileLabelRequest): Promise<CompileLabelResponse> {
    const jobId = this.generateJobId();
    
    logger.info('Starting label compilation', {
      jobId,
      orderCount: request.orderIds.length,
      options: request
    });

    try {
      // Initialize job status
      const jobStatus: CompilationJobStatus = {
        jobId,
        status: 'PENDING',
        progress: {
          currentStep: 'Initializing',
          completedSteps: 0,
          totalSteps: 5,
          percentage: 0
        },
        batches: [],
        startedAt: new Date()
      };
      
      this.activeJobs.set(jobId, jobStatus);

      // Step 1: Resolve label requirements
      this.updateJobProgress(jobId, 'Resolving label requirements', 1);
      const labelResolutions = await this.orderResolver.resolveOrdersLabels(
        request.orderIds,
        request.labelResolutionOptions || {}
      );

      // Step 2: Get available printers
      this.updateJobProgress(jobId, 'Loading printer configurations', 2);
      const availablePrinters = await this.getAvailablePrinters(request.printerIds);

      // Step 3: Create optimized batches
      this.updateJobProgress(jobId, 'Optimizing print batches', 3);
      const batchResult = await this.batchProcessor.createOptimizedBatches(
        labelResolutions,
        availablePrinters,
        request.batchOptimizationOptions || {}
      );

      // Step 4: Generate print files for each batch
      this.updateJobProgress(jobId, 'Generating print files', 4);
      const batchSummaries = await this.generateBatchFiles(batchResult.batches, request.outputFormat);

      // Step 5: Finalize and prepare response
      this.updateJobProgress(jobId, 'Finalizing', 5);
      
      const response: CompileLabelResponse = {
        jobId,
        status: 'COMPLETED',
        batches: batchSummaries,
        summary: {
          totalOrders: request.orderIds.length,
          totalLabels: batchResult.statistics.totalLabels,
          totalBatches: batchResult.batches.length,
          estimatedCompletionTime: batchResult.statistics.estimatedTotalPrintTime
        },
        downloadUrls: batchSummaries
          .filter(b => b.downloadUrl)
          .map(b => ({
            batchId: b.batchId,
            format: this.determineOutputFormat(request.outputFormat, b.printerName),
            url: b.downloadUrl!,
            sizeBytes: 0 // Would be calculated in real implementation
          }))
      };

      // Update final job status
      jobStatus.status = 'COMPLETED';
      jobStatus.completedAt = new Date();
      jobStatus.batches = batchSummaries;

      logger.info('Label compilation completed', {
        jobId,
        totalBatches: response.batches.length,
        totalLabels: response.summary.totalLabels
      });

      return response;

    } catch (error) {
      logger.error('Label compilation failed', { 
        jobId, 
        error: error.message 
      });

      // Update job status with error
      const jobStatus = this.activeJobs.get(jobId);
      if (jobStatus) {
        jobStatus.status = 'FAILED';
        jobStatus.errorMessage = error.message;
        jobStatus.completedAt = new Date();
      }

      throw new Error(`Label compilation failed: ${error.message}`);
    }
  }

  /**
   * Get compilation job status
   */
  getJobStatus(jobId: string): CompilationJobStatus | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Cancel a compilation job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const jobStatus = this.activeJobs.get(jobId);
    
    if (!jobStatus) {
      return false;
    }

    if (jobStatus.status === 'COMPLETED' || jobStatus.status === 'FAILED') {
      return false; // Cannot cancel completed/failed jobs
    }

    jobStatus.status = 'FAILED';
    jobStatus.errorMessage = 'Cancelled by user';
    jobStatus.completedAt = new Date();

    logger.info('Label compilation job cancelled', { jobId });
    return true;
  }

  /**
   * Generate print files for all batches
   */
  private async generateBatchFiles(
    batches: BatchJob[],
    outputFormat?: string
  ): Promise<BatchJobSummary[]> {
    const batchSummaries: BatchJobSummary[] = [];

    for (const batch of batches) {
      try {
        const format = this.determineOutputFormat(outputFormat, batch.printerProfile.name);
        const downloadUrl = await this.generateBatchFile(batch, format);

        const summary: BatchJobSummary = {
          batchId: batch.id,
          printerName: batch.printerProfile.name,
          labelProfileName: batch.labelProfile.name,
          labelCount: batch.labels.length,
          estimatedPrintTime: batch.estimatedPrintTime,
          status: BatchStatus.COMPLETED,
          downloadUrl
        };

        batchSummaries.push(summary);

      } catch (error) {
        logger.error('Batch file generation failed', {
          batchId: batch.id,
          error: error.message
        });

        const summary: BatchJobSummary = {
          batchId: batch.id,
          printerName: batch.printerProfile.name,
          labelProfileName: batch.labelProfile.name,
          labelCount: batch.labels.length,
          estimatedPrintTime: batch.estimatedPrintTime,
          status: BatchStatus.FAILED
        };

        batchSummaries.push(summary);
      }
    }

    return batchSummaries;
  }

  /**
   * Generate print file for a single batch
   */
  private async generateBatchFile(batch: BatchJob, format: string): Promise<string> {
    const labelData: LabelData[] = batch.labels.map(label => ({
      id: label.id,
      text: label.labelData.text,
      barcode: label.labelData.barcode,
      qrCode: label.labelData.qrCode,
      customFields: label.labelData.customFields
    }));

    let fileContent: Buffer | string;
    let fileName: string;
    let mimeType: string;

    switch (format) {
      case 'PDF':
        const pdfRequest: PrintJobRequest = {
          labelProfile: batch.labelProfile,
          labelData,
          printerSettings: {
            dpi: 300,
            copies: 1
          }
        };
        fileContent = await this.pdfEngine.generatePDF(pdfRequest);
        fileName = `batch-${batch.id}.pdf`;
        mimeType = 'application/pdf';
        break;

      case 'ZPL':
        fileContent = await this.zplEngine.generateZPL(
          batch.labelProfile,
          labelData,
          { dpi: 203, printSpeed: 6, printDensity: 8, labelTop: 0, labelLength: 0 }
        );
        fileName = `batch-${batch.id}.zpl`;
        mimeType = 'text/plain';
        break;

      default:
        throw new Error(`Unsupported output format: ${format}`);
    }

    // In a real implementation, save file to storage and return URL
    const downloadUrl = await this.saveFileToStorage(fileName, fileContent, mimeType);
    
    logger.debug('Batch file generated', {
      batchId: batch.id,
      format,
      fileName,
      size: fileContent.length
    });

    return downloadUrl;
  }

  /**
   * Determine output format based on request and printer capabilities
   */
  private determineOutputFormat(requestedFormat?: string, printerName?: string): string {
    if (requestedFormat && requestedFormat !== 'AUTO') {
      return requestedFormat;
    }

    // Auto-detect based on printer type
    if (printerName?.toLowerCase().includes('zebra') || printerName?.toLowerCase().includes('zpl')) {
      return 'ZPL';
    }

    // Default to PDF for universal compatibility
    return 'PDF';
  }

  /**
   * Get available printers (filtered by IDs if provided)
   */
  private async getAvailablePrinters(printerIds?: string[]): Promise<PrinterProfile[]> {
    const whereClause: any = { isActive: true };
    
    if (printerIds && printerIds.length > 0) {
      whereClause.id = { in: printerIds };
    }

    const printers = await this.prisma.printerProfile.findMany({
      where: whereClause
    });

    if (printers.length === 0) {
      throw new Error('No available printers found');
    }

    return printers;
  }

  /**
   * Update job progress
   */
  private updateJobProgress(jobId: string, currentStep: string, completedSteps: number): void {
    const jobStatus = this.activeJobs.get(jobId);
    if (!jobStatus) return;

    jobStatus.status = 'PROCESSING';
    jobStatus.progress.currentStep = currentStep;
    jobStatus.progress.completedSteps = completedSteps;
    jobStatus.progress.percentage = Math.round((completedSteps / jobStatus.progress.totalSteps) * 100);

    logger.debug('Job progress updated', {
      jobId,
      step: currentStep,
      percentage: jobStatus.progress.percentage
    });
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `label-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save file to storage (mock implementation)
   */
  private async saveFileToStorage(
    fileName: string, 
    content: Buffer | string, 
    mimeType: string
  ): Promise<string> {
    // In a real implementation, this would:
    // 1. Save to cloud storage (AWS S3, Azure Blob, etc.)
    // 2. Generate signed URL for download
    // 3. Set appropriate expiration time
    // 4. Handle file cleanup

    // Mock URL for demonstration
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/api/labels/download/${encodeURIComponent(fileName)}?expires=${Date.now() + 3600000}`;
  }

  /**
   * Clean up expired jobs and files
   */
  async cleanupExpiredJobs(maxAgeHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    let cleanedCount = 0;

    for (const [jobId, jobStatus] of this.activeJobs.entries()) {
      if (jobStatus.startedAt && jobStatus.startedAt < cutoffTime) {
        this.activeJobs.delete(jobId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up expired compilation jobs', { 
        cleanedCount, 
        maxAgeHours 
      });
    }

    return cleanedCount;
  }

  /**
   * Get compilation statistics
   */
  getCompilationStatistics(): {
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalJobsProcessed: number;
  } {
    let activeJobs = 0;
    let completedJobs = 0;
    let failedJobs = 0;

    for (const jobStatus of this.activeJobs.values()) {
      switch (jobStatus.status) {
        case 'PENDING':
        case 'PROCESSING':
          activeJobs++;
          break;
        case 'COMPLETED':
          completedJobs++;
          break;
        case 'FAILED':
          failedJobs++;
          break;
      }
    }

    return {
      activeJobs,
      completedJobs,
      failedJobs,
      totalJobsProcessed: activeJobs + completedJobs + failedJobs
    };
  }

  /**
   * Validate compilation request
   */
  static validateCompileRequest(request: CompileLabelRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate order IDs
    if (!request.orderIds || request.orderIds.length === 0) {
      errors.push('At least one order ID is required');
    }

    if (request.orderIds && request.orderIds.length > 100) {
      errors.push('Maximum 100 orders can be processed in a single request');
    }

    // Validate printer IDs
    if (request.printerIds && request.printerIds.length > 20) {
      errors.push('Maximum 20 printers can be specified');
    }

    // Validate output format
    if (request.outputFormat && !['PDF', 'ZPL', 'AUTO'].includes(request.outputFormat)) {
      errors.push('Output format must be PDF, ZPL, or AUTO');
    }

    // Validate priority
    if (request.priority && !['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(request.priority)) {
      errors.push('Priority must be LOW, NORMAL, HIGH, or URGENT');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
