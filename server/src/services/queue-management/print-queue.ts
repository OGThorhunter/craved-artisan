import { EventEmitter } from 'events';
import { logger } from '../../logger';

export interface PrintJob {
  id: string;
  batchId: string;
  orderId?: string;
  vendorId: string;
  userId?: string;
  
  // Job Configuration
  printerId: string;
  labelProfileId: string;
  priority: JobPriority;
  scheduledAt?: Date;
  
  // Job Data
  labelData: LabelJobData[];
  compiledOutput?: CompiledOutput;
  
  // Status & Timing
  status: JobStatus;
  progress: JobProgress;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Error Handling
  errorDetails?: JobError;
  retryCount: number;
  maxRetries: number;
  
  // Dependencies & Relationships
  dependencies?: string[]; // Job IDs that must complete first
  childJobs?: string[]; // Sub-jobs created from this job
  parentJobId?: string;
  
  // Metadata
  estimatedDuration: number; // milliseconds
  actualDuration?: number;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface LabelJobData {
  id: string;
  orderItemId?: string;
  text: string;
  barcode?: string;
  qrCode?: string;
  imageData?: Buffer;
  customFields?: Record<string, any>;
}

export interface CompiledOutput {
  format: 'PDF' | 'ZPL' | 'TSPL' | 'ESC_POS';
  data: Buffer | string;
  fileSize: number;
  checksum: string;
  generatedAt: Date;
  printerInstructions?: Record<string, any>;
}

export enum JobStatus {
  PENDING = 'PENDING',           // Created but not queued
  QUEUED = 'QUEUED',            // In queue waiting for processing
  COMPILING = 'COMPILING',      // Generating print files
  COMPILED = 'COMPILED',        // Ready to print
  PRINTING = 'PRINTING',        // Currently printing
  COMPLETED = 'COMPLETED',      // Successfully completed
  FAILED = 'FAILED',            // Failed with error
  CANCELLED = 'CANCELLED',      // Manually cancelled
  PAUSED = 'PAUSED',           // Temporarily paused
  RETRYING = 'RETRYING'        // Attempting retry
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  IMMEDIATE = 5
}

export interface JobProgress {
  phase: 'queued' | 'compiling' | 'printing' | 'completed';
  percentage: number; // 0-100
  currentItem?: number;
  totalItems: number;
  estimatedTimeRemaining?: number; // milliseconds
  throughputRate?: number; // items per second
  message?: string;
}

export interface JobError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  suggestedAction?: string;
  printerStatus?: string;
}

export interface QueueStatistics {
  totalJobs: number;
  jobsByStatus: Record<JobStatus, number>;
  jobsByPriority: Record<JobPriority, number>;
  averageWaitTime: number;
  averageProcessingTime: number;
  throughputRate: number;
  errorRate: number;
  printerUtilization: Record<string, number>;
}

export interface PrinterStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error' | 'maintenance';
  currentJobId?: string;
  queueLength: number;
  lastHeartbeat: Date;
  capabilities: PrinterCapabilities;
  supplies: PrinterSupplies;
  performance: PrinterPerformance;
}

export interface PrinterCapabilities {
  supportedFormats: string[];
  maxLabelWidth: number;
  maxLabelHeight: number;
  dpi: number[];
  color: boolean;
  duplex: boolean;
  maxSpeed: number; // labels per minute
}

export interface PrinterSupplies {
  paper: SupplyLevel;
  ink?: SupplyLevel;
  ribbon?: SupplyLevel;
}

export interface SupplyLevel {
  level: number; // 0-100 percentage
  status: 'ok' | 'low' | 'empty' | 'unknown';
  estimatedPages?: number;
}

export interface PrinterPerformance {
  averageSpeed: number; // labels per minute
  errorRate: number;
  uptime: number; // percentage
  lastMaintenance?: Date;
  totalLabels: number;
}

export interface QueueConfiguration {
  maxConcurrentJobs: number;
  maxRetries: number;
  defaultTimeout: number; // milliseconds
  priorityWeights: Record<JobPriority, number>;
  loadBalancing: 'round_robin' | 'least_busy' | 'capabilities' | 'performance';
  errorHandling: 'immediate_retry' | 'delayed_retry' | 'manual_intervention';
}

export class PrintQueue extends EventEmitter {
  private jobs: Map<string, PrintJob>;
  private printers: Map<string, PrinterStatus>;
  private processingJobs: Set<string>;
  private configuration: QueueConfiguration;
  private statistics: QueueStatistics;
  private heartbeatInterval?: NodeJS.Timeout;
  
  constructor(config: Partial<QueueConfiguration> = {}) {
    super();
    
    this.jobs = new Map();
    this.printers = new Map();
    this.processingJobs = new Set();
    
    this.configuration = {
      maxConcurrentJobs: config.maxConcurrentJobs || 10,
      maxRetries: config.maxRetries || 3,
      defaultTimeout: config.defaultTimeout || 300000, // 5 minutes
      priorityWeights: config.priorityWeights || {
        [JobPriority.LOW]: 1,
        [JobPriority.NORMAL]: 2,
        [JobPriority.HIGH]: 4,
        [JobPriority.URGENT]: 8,
        [JobPriority.IMMEDIATE]: 16
      },
      loadBalancing: config.loadBalancing || 'least_busy',
      errorHandling: config.errorHandling || 'delayed_retry'
    };
    
    this.statistics = this.initializeStatistics();
    this.startHeartbeatMonitoring();
    
    logger.info('Print queue initialized', {
      maxConcurrentJobs: this.configuration.maxConcurrentJobs,
      loadBalancing: this.configuration.loadBalancing
    });
  }

  /**
   * Add a job to the queue
   */
  async addJob(job: Omit<PrintJob, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress' | 'retryCount'>): Promise<string> {
    const jobId = this.generateJobId();
    
    const fullJob: PrintJob = {
      ...job,
      id: jobId,
      status: JobStatus.PENDING,
      progress: {
        phase: 'queued',
        percentage: 0,
        currentItem: 0,
        totalItems: job.labelData.length
      },
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validate job
    this.validateJob(fullJob);
    
    // Check printer availability
    const printer = this.printers.get(job.printerId);
    if (!printer) {
      throw new Error(`Printer ${job.printerId} not found`);
    }
    
    if (printer.status === 'offline' || printer.status === 'error') {
      throw new Error(`Printer ${job.printerId} is not available (${printer.status})`);
    }
    
    this.jobs.set(jobId, fullJob);
    this.updateJobStatus(jobId, JobStatus.QUEUED);
    
    logger.info('Job added to queue', {
      jobId,
      printerId: job.printerId,
      priority: job.priority,
      labelCount: job.labelData.length,
      estimatedDuration: job.estimatedDuration
    });
    
    this.emit('jobAdded', fullJob);
    
    // Try to process immediately if capacity allows
    this.processNextJobs();
    
    return jobId;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string, reason?: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }
    
    // Can only cancel jobs that aren't completed
    if ([JobStatus.COMPLETED, JobStatus.FAILED].includes(job.status)) {
      return false;
    }
    
    // If job is currently processing, handle gracefully
    if (job.status === JobStatus.PRINTING && this.processingJobs.has(jobId)) {
      // Signal printer to stop (implementation specific)
      await this.signalPrinterStop(job.printerId, jobId);
    }
    
    this.updateJobStatus(jobId, JobStatus.CANCELLED);
    this.processingJobs.delete(jobId);
    
    job.errorDetails = {
      code: 'USER_CANCELLED',
      message: reason || 'Job cancelled by user',
      timestamp: new Date(),
      recoverable: false
    };
    
    logger.info('Job cancelled', { jobId, reason });
    this.emit('jobCancelled', job);
    
    // Process next jobs in queue
    this.processNextJobs();
    
    return true;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== JobStatus.FAILED) {
      return false;
    }
    
    if (job.retryCount >= job.maxRetries) {
      logger.warn('Job retry limit exceeded', { jobId, retryCount: job.retryCount });
      return false;
    }
    
    job.retryCount++;
    job.errorDetails = undefined;
    this.updateJobStatus(jobId, JobStatus.QUEUED);
    
    logger.info('Job retry initiated', { jobId, retryCount: job.retryCount });
    this.emit('jobRetried', job);
    
    this.processNextJobs();
    return true;
  }

  /**
   * Get job status and details
   */
  getJob(jobId: string): PrintJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): PrintJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  /**
   * Get jobs for a specific printer
   */
  getJobsByPrinter(printerId: string): PrintJob[] {
    return Array.from(this.jobs.values()).filter(job => job.printerId === printerId);
  }

  /**
   * Register a printer with the queue
   */
  registerPrinter(printer: PrinterStatus): void {
    this.printers.set(printer.id, {
      ...printer,
      lastHeartbeat: new Date()
    });
    
    logger.info('Printer registered', {
      printerId: printer.id,
      name: printer.name,
      status: printer.status
    });
    
    this.emit('printerRegistered', printer);
    
    // Try to process queued jobs for this printer
    this.processNextJobs();
  }

  /**
   * Update printer status
   */
  updatePrinterStatus(printerId: string, updates: Partial<PrinterStatus>): void {
    const printer = this.printers.get(printerId);
    if (!printer) {
      logger.warn('Attempted to update unknown printer', { printerId });
      return;
    }
    
    const updatedPrinter = {
      ...printer,
      ...updates,
      lastHeartbeat: new Date()
    };
    
    this.printers.set(printerId, updatedPrinter);
    
    logger.debug('Printer status updated', {
      printerId,
      status: updatedPrinter.status,
      updates: Object.keys(updates)
    });
    
    this.emit('printerStatusUpdated', updatedPrinter);
    
    // If printer came online, try to process jobs
    if (updates.status === 'online') {
      this.processNextJobs();
    }
  }

  /**
   * Get queue statistics
   */
  getStatistics(): QueueStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    totalJobs: number;
    activeJobs: number;
    queuedJobs: number;
    availablePrinters: number;
    busyPrinters: number;
    estimation: {
      averageWaitTime: number;
      nextJobEta: Date | null;
    };
  } {
    const totalJobs = this.jobs.size;
    const activeJobs = this.processingJobs.size;
    const queuedJobs = this.getJobsByStatus(JobStatus.QUEUED).length;
    
    const availablePrinters = Array.from(this.printers.values())
      .filter(p => p.status === 'online').length;
    const busyPrinters = Array.from(this.printers.values())
      .filter(p => p.status === 'busy').length;
    
    const averageWaitTime = this.calculateAverageWaitTime();
    const nextJobEta = this.estimateNextJobCompletion();
    
    return {
      totalJobs,
      activeJobs,
      queuedJobs,
      availablePrinters,
      busyPrinters,
      estimation: {
        averageWaitTime,
        nextJobEta
      }
    };
  }

  /**
   * Process next jobs in the queue
   */
  private async processNextJobs(): Promise<void> {
    if (this.processingJobs.size >= this.configuration.maxConcurrentJobs) {
      return; // At capacity
    }
    
    // Get available printers
    const availablePrinters = Array.from(this.printers.values())
      .filter(p => p.status === 'online');
    
    if (availablePrinters.length === 0) {
      return; // No printers available
    }
    
    // Get queued jobs sorted by priority and creation time
    const queuedJobs = this.getJobsByStatus(JobStatus.QUEUED)
      .filter(job => !job.scheduledAt || job.scheduledAt <= new Date())
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityDiff = this.configuration.priorityWeights[b.priority] - 
                           this.configuration.priorityWeights[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    
    // Process jobs based on available printers
    for (const job of queuedJobs) {
      if (this.processingJobs.size >= this.configuration.maxConcurrentJobs) {
        break;
      }
      
      // Check if specific printer is required
      let targetPrinter = availablePrinters.find(p => p.id === job.printerId);
      
      if (!targetPrinter) {
        // Try load balancing if original printer not available
        targetPrinter = this.selectPrinterForJob(job, availablePrinters);
      }
      
      if (targetPrinter) {
        await this.processJob(job.id, targetPrinter.id);
        
        // Remove from available printers for this round
        const index = availablePrinters.indexOf(targetPrinter);
        if (index > -1) {
          availablePrinters.splice(index, 1);
        }
      }
    }
  }

  /**
   * Process a single job
   */
  private async processJob(jobId: string, printerId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    this.processingJobs.add(jobId);
    
    try {
      // Update job status to compiling
      this.updateJobStatus(jobId, JobStatus.COMPILING);
      job.startedAt = new Date();
      
      // Mark printer as busy
      this.updatePrinterStatus(printerId, { status: 'busy', currentJobId: jobId });
      
      logger.info('Starting job processing', {
        jobId,
        printerId,
        labelCount: job.labelData.length
      });
      
      // Compile the job (this would call the compilation service from Phase 3)
      await this.compileJob(job);
      
      // Update to printing status
      this.updateJobStatus(jobId, JobStatus.PRINTING);
      
      // Send to printer (mock implementation)
      await this.sendToPrinter(job, printerId);
      
      // Mark as completed
      job.completedAt = new Date();
      job.actualDuration = job.completedAt.getTime() - job.startedAt!.getTime();
      this.updateJobStatus(jobId, JobStatus.COMPLETED);
      
      logger.info('Job completed successfully', {
        jobId,
        printerId,
        actualDuration: job.actualDuration,
        labelCount: job.labelData.length
      });
      
      this.emit('jobCompleted', job);
      
    } catch (error) {
      logger.error('Job processing failed', {
        jobId,
        printerId,
        error: error.message
      });
      
      job.errorDetails = {
        code: 'PROCESSING_FAILED',
        message: error.message,
        timestamp: new Date(),
        recoverable: this.isRecoverableError(error)
      };
      
      this.updateJobStatus(jobId, JobStatus.FAILED);
      this.emit('jobFailed', job);
      
      // Attempt automatic retry if configured
      if (this.configuration.errorHandling === 'immediate_retry' && 
          job.retryCount < job.maxRetries) {
        setTimeout(() => this.retryJob(jobId), 5000); // Retry after 5 seconds
      }
      
    } finally {
      this.processingJobs.delete(jobId);
      
      // Mark printer as available
      this.updatePrinterStatus(printerId, { 
        status: 'online', 
        currentJobId: undefined 
      });
      
      // Process next jobs
      setTimeout(() => this.processNextJobs(), 1000);
    }
  }

  /**
   * Compile a job using Phase 3 compilation service
   */
  private async compileJob(job: PrintJob): Promise<void> {
    // Mock compilation - in real implementation, this would use the
    // LabelCompilationService from Phase 3
    
    const startTime = Date.now();
    
    // Simulate compilation time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock compiled output
    const mockOutput = `Mock compiled output for job ${job.id}`;
    
    job.compiledOutput = {
      format: 'ZPL',
      data: mockOutput,
      fileSize: mockOutput.length,
      checksum: 'mock_checksum',
      generatedAt: new Date()
    };
    
    // Update progress
    job.progress.phase = 'printing';
    job.progress.percentage = 50;
    job.progress.estimatedTimeRemaining = job.estimatedDuration - (Date.now() - startTime);
    
    this.updateJobStatus(job.id, JobStatus.COMPILED);
    
    logger.debug('Job compiled', {
      jobId: job.id,
      format: job.compiledOutput.format,
      fileSize: job.compiledOutput.fileSize
    });
  }

  /**
   * Send compiled job to printer
   */
  private async sendToPrinter(job: PrintJob, printerId: string): Promise<void> {
    if (!job.compiledOutput) {
      throw new Error('Job not compiled');
    }
    
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error(`Printer ${printerId} not found`);
    }
    
    logger.debug('Sending job to printer', {
      jobId: job.id,
      printerId,
      format: job.compiledOutput.format,
      fileSize: job.compiledOutput.fileSize
    });
    
    // Mock printing process with progress updates
    const totalItems = job.labelData.length;
    const printTimePerLabel = job.estimatedDuration / totalItems;
    
    for (let i = 0; i < totalItems; i++) {
      // Simulate printing each label
      await new Promise(resolve => setTimeout(resolve, printTimePerLabel));
      
      // Update progress
      job.progress.currentItem = i + 1;
      job.progress.percentage = 50 + ((i + 1) / totalItems) * 50; // 50-100%
      job.progress.estimatedTimeRemaining = (totalItems - i - 1) * printTimePerLabel;
      
      this.emit('jobProgress', job);
    }
    
    // Final progress update
    job.progress.percentage = 100;
    job.progress.phase = 'completed';
    job.progress.estimatedTimeRemaining = 0;
    
    logger.debug('Job sent to printer successfully', {
      jobId: job.id,
      printerId,
      labelsProcessed: totalItems
    });
  }

  /**
   * Select best printer for a job using load balancing strategy
   */
  private selectPrinterForJob(job: PrintJob, availablePrinters: PrinterStatus[]): PrinterStatus | undefined {
    if (availablePrinters.length === 0) return undefined;
    
    switch (this.configuration.loadBalancing) {
      case 'round_robin':
        // Simple round-robin selection
        const index = this.jobs.size % availablePrinters.length;
        return availablePrinters[index];
      
      case 'least_busy':
        // Select printer with lowest queue length
        return availablePrinters.reduce((best, printer) =>
          printer.queueLength < best.queueLength ? printer : best
        );
      
      case 'capabilities':
        // Select printer with best capabilities for this job
        return availablePrinters.find(printer => 
          this.isPrinterCapableForJob(printer, job)
        ) || availablePrinters[0];
      
      case 'performance':
        // Select printer with best performance metrics
        return availablePrinters.reduce((best, printer) =>
          printer.performance.averageSpeed > best.performance.averageSpeed ? printer : best
        );
      
      default:
        return availablePrinters[0];
    }
  }

  /**
   * Check if printer is capable of handling the job
   */
  private isPrinterCapableForJob(printer: PrinterStatus, job: PrintJob): boolean {
    // Mock capability checking
    // In real implementation, check label dimensions, format support, etc.
    return printer.status === 'online';
  }

  /**
   * Update job status and emit event
   */
  private updateJobStatus(jobId: string, status: JobStatus): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    const oldStatus = job.status;
    job.status = status;
    job.updatedAt = new Date();
    
    logger.debug('Job status updated', {
      jobId,
      oldStatus,
      newStatus: status
    });
    
    this.emit('jobStatusChanged', job, oldStatus);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `pj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate job before adding to queue
   */
  private validateJob(job: PrintJob): void {
    if (!job.printerId) {
      throw new Error('Printer ID is required');
    }
    
    if (!job.labelProfileId) {
      throw new Error('Label profile ID is required');
    }
    
    if (!job.labelData || job.labelData.length === 0) {
      throw new Error('Job must contain at least one label');
    }
    
    if (job.estimatedDuration <= 0) {
      throw new Error('Estimated duration must be positive');
    }
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error: any): boolean {
    // Define recoverable error conditions
    const recoverableErrors = [
      'NETWORK_TIMEOUT',
      'PRINTER_BUSY',
      'TEMPORARY_FILE_ERROR'
    ];
    
    return recoverableErrors.some(code => error.message.includes(code));
  }

  /**
   * Signal printer to stop current job
   */
  private async signalPrinterStop(printerId: string, jobId: string): Promise<void> {
    // Mock implementation - in reality, this would send stop command to printer
    logger.info('Signaling printer to stop job', { printerId, jobId });
  }

  /**
   * Initialize statistics object
   */
  private initializeStatistics(): QueueStatistics {
    return {
      totalJobs: 0,
      jobsByStatus: Object.values(JobStatus).reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<JobStatus, number>),
      jobsByPriority: Object.values(JobPriority).reduce((acc, priority) => {
        acc[priority] = 0;
        return acc;
      }, {} as Record<JobPriority, number>),
      averageWaitTime: 0,
      averageProcessingTime: 0,
      throughputRate: 0,
      errorRate: 0,
      printerUtilization: {}
    };
  }

  /**
   * Update statistics based on current state
   */
  private updateStatistics(): void {
    const jobs = Array.from(this.jobs.values());
    
    this.statistics.totalJobs = jobs.length;
    
    // Update job counts by status
    for (const status of Object.values(JobStatus)) {
      this.statistics.jobsByStatus[status] = jobs.filter(j => j.status === status).length;
    }
    
    // Update job counts by priority
    for (const priority of Object.values(JobPriority)) {
      this.statistics.jobsByPriority[priority] = jobs.filter(j => j.priority === priority).length;
    }
    
    // Calculate averages and rates
    const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED);
    const failedJobs = jobs.filter(j => j.status === JobStatus.FAILED);
    
    if (completedJobs.length > 0) {
      const waitTimes = completedJobs
        .filter(j => j.startedAt)
        .map(j => j.startedAt!.getTime() - j.createdAt.getTime());
      this.statistics.averageWaitTime = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
      
      const processingTimes = completedJobs
        .filter(j => j.actualDuration)
        .map(j => j.actualDuration!);
      this.statistics.averageProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
    }
    
    // Calculate error rate
    const totalActionableJobs = completedJobs.length + failedJobs.length;
    this.statistics.errorRate = totalActionableJobs > 0 ? failedJobs.length / totalActionableJobs : 0;
    
    // Calculate throughput (jobs per hour)
    const hoursAgo24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24hJobs = completedJobs.filter(j => j.completedAt! >= hoursAgo24);
    this.statistics.throughputRate = recent24hJobs.length / 24;
    
    // Update printer utilization
    for (const printer of this.printers.values()) {
      const printerJobs = jobs.filter(j => j.printerId === printer.id);
      const busyTime = printerJobs
        .filter(j => j.actualDuration)
        .reduce((sum, j) => sum + j.actualDuration!, 0);
      
      // Calculate utilization as percentage of time busy in last 24 hours
      const totalTime = 24 * 60 * 60 * 1000; // 24 hours in ms
      this.statistics.printerUtilization[printer.id] = Math.min((busyTime / totalTime) * 100, 100);
    }
  }

  /**
   * Calculate average wait time for new jobs
   */
  private calculateAverageWaitTime(): number {
    const queuedJobs = this.getJobsByStatus(JobStatus.QUEUED).length;
    const processingJobs = this.processingJobs.size;
    const availablePrinters = Array.from(this.printers.values())
      .filter(p => p.status === 'online').length;
    
    if (availablePrinters === 0) return Infinity;
    
    // Estimate based on current queue and average processing time
    const avgProcessingTime = this.statistics.averageProcessingTime || 60000; // Default 1 minute
    const jobsAhead = Math.max(0, queuedJobs + processingJobs - availablePrinters);
    
    return jobsAhead * (avgProcessingTime / availablePrinters);
  }

  /**
   * Estimate when next job will complete
   */
  private estimateNextJobCompletion(): Date | null {
    if (this.processingJobs.size === 0) return null;
    
    const processingJobsList = Array.from(this.processingJobs)
      .map(id => this.jobs.get(id))
      .filter(job => job && job.startedAt) as PrintJob[];
    
    if (processingJobsList.length === 0) return null;
    
    // Find job that will complete soonest
    const estimates = processingJobsList.map(job => {
      const elapsed = Date.now() - job.startedAt!.getTime();
      const remaining = Math.max(0, job.estimatedDuration - elapsed);
      return new Date(Date.now() + remaining);
    });
    
    return estimates.reduce((earliest, current) => 
      current < earliest ? current : earliest
    );
  }

  /**
   * Start heartbeat monitoring for printers
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeoutThreshold = 60000; // 1 minute
      
      for (const [printerId, printer] of this.printers.entries()) {
        const timeSinceHeartbeat = now.getTime() - printer.lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat > timeoutThreshold && printer.status !== 'offline') {
          logger.warn('Printer heartbeat timeout', {
            printerId,
            timeSinceHeartbeat,
            lastHeartbeat: printer.lastHeartbeat
          });
          
          this.updatePrinterStatus(printerId, { status: 'offline' });
          this.emit('printerTimeout', printer);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Cancel all processing jobs gracefully
    for (const jobId of this.processingJobs) {
      this.cancelJob(jobId, 'System shutdown');
    }
    
    logger.info('Print queue shutdown complete');
    this.emit('shutdown');
  }
}
