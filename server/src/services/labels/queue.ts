import { PrismaClient } from '@prisma/client';
import { resolveLabelData } from './dataResolver';
import { getRenderer, RenderConfig } from './renderers';
import { logger } from '../../logger';

const prisma = new PrismaClient();

export interface QueueConfig {
  maxConcurrentJobs?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class LabelJobQueue {
  private isProcessing = false;
  private config: Required<QueueConfig>;
  
  constructor(config: QueueConfig = {}) {
    this.config = {
      maxConcurrentJobs: config.maxConcurrentJobs || 3,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 5000
    };
  }
  
  /**
   * Start processing the queue
   */
  async start(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    logger.info('Label job queue started');
    
    // Process jobs continuously
    this.processJobs();
  }
  
  /**
   * Stop processing the queue
   */
  stop(): void {
    this.isProcessing = false;
    logger.info('Label job queue stopped');
  }
  
  /**
   * Add a job to the queue
   */
  async enqueueJob(jobId: string): Promise<void> {
    // Job is already created in the database with QUEUED status
    // This method is for future use if we implement a separate queue system
    logger.info(`Job ${jobId} enqueued`);
  }
  
  /**
   * Process jobs from the queue
   */
  private async processJobs(): Promise<void> {
    while (this.isProcessing) {
      try {
        await this.processNextJob();
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Error processing job queue:', error);
        // Wait longer on error to prevent rapid retries
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  /**
   * Process the next available job
   */
  private async processNextJob(): Promise<void> {
    const job = await prisma.labelJob.findFirst({
      where: { status: 'QUEUED' },
      include: {
        labelProfile: {
          include: {
            template: true,
            printerProfile: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (!job) {
      return; // No jobs to process
    }
    
    logger.info(`Processing job ${job.id}`);
    
    try {
      // Update job status to rendering
      await prisma.labelJob.update({
        where: { id: job.id },
        data: { status: 'RENDERING' }
      });
      
      // Resolve data
      const resolvedData = await resolveLabelData({
        source: job.source.toLowerCase() as 'order' | 'product' | 'manual',
        sourceId: job.sourceId,
        vendorProfileId: job.vendorProfileId
      });
      
      // Render label
      const renderResult = await this.renderLabel(job, resolvedData);
      
      // Update job with render result
      await prisma.labelJob.update({
        where: { id: job.id },
        data: {
          status: 'PRINTING',
          payload: JSON.stringify(resolvedData),
          renderOutputUrl: renderResult.url
        }
      });
      
      // Send to printer or save for download
      await this.sendToPrinter(job, renderResult);
      
      // Mark job as completed
      await prisma.labelJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
      
      logger.info(`Job ${job.id} completed successfully`);
      
    } catch (error) {
      logger.error(`Job ${job.id} failed:`, error);
      
      // Mark job as failed
      await prisma.labelJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
  
  /**
   * Render the label
   */
  private async renderLabel(job: any, resolvedData: any): Promise<{ url?: string; buffer: Buffer }> {
    const { labelProfile } = job;
    const template = labelProfile.template;
    
    if (!template) {
      throw new Error('No template attached to label profile');
    }
    
    // Parse template schema
    let templateSchema;
    try {
      templateSchema = JSON.parse(template.schema);
    } catch (error) {
      throw new Error('Invalid template schema');
    }
    
    // Create render config
    const renderConfig: RenderConfig = {
      template: templateSchema,
      payload: resolvedData,
      dpi: labelProfile.printerProfile.dpi,
      widthIn: labelProfile.widthIn,
      heightIn: labelProfile.heightIn
    };
    
    // Get renderer
    const RendererClass = getRenderer(labelProfile.engine);
    const renderer = new RendererClass();
    
    // Render
    const result = await renderer.render(renderConfig);
    
    // Save file if needed
    if (result.mime === 'application/pdf') {
      const filename = `label-${job.id}.pdf`;
      const filepath = `./static/labels/${filename}`;
      
      // Ensure directory exists
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(filepath, result.buffer);
      
      return {
        url: `/static/labels/${filename}`,
        buffer: result.buffer
      };
    }
    
    return {
      buffer: result.buffer
    };
  }
  
  /**
   * Send to printer or prepare for download
   */
  private async sendToPrinter(job: any, renderResult: { url?: string; buffer: Buffer }): Promise<void> {
    const { printerProfile } = job.labelProfile;
    
    if (printerProfile.driver === 'PDF') {
      // PDF jobs are already saved to file, nothing more to do
      logger.info(`PDF label saved for job ${job.id}`);
      return;
    }
    
    if (printerProfile.driver === 'ZPL' && printerProfile.networkAddress) {
      // Send ZPL to network printer
      await this.sendToNetworkPrinter(printerProfile.networkAddress, renderResult.buffer);
      logger.info(`ZPL sent to printer ${printerProfile.networkAddress} for job ${job.id}`);
      return;
    }
    
    if (printerProfile.driver === 'BROTHER_QL' && printerProfile.networkAddress) {
      // Brother QL network printing (simplified for MVP)
      logger.info(`Brother QL printing not implemented for job ${job.id}, saved as PDF instead`);
      return;
    }
    
    // No network address or unsupported driver - save as file for manual printing
    logger.info(`Label saved as file for job ${job.id} (no network printer configured)`);
  }
  
  /**
   * Send data to network printer
   */
  private async sendToNetworkPrinter(address: string, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const net = require('net');
      
      // Parse address (could be IP:port or just IP)
      const [host, port] = address.includes(':') 
        ? address.split(':') 
        : [address, '9100']; // Default ZPL port
      
      const socket = net.createConnection(parseInt(port), host);
      
      socket.on('connect', () => {
        socket.write(data);
        socket.end();
      });
      
      socket.on('end', () => {
        resolve();
      });
      
      socket.on('error', (error: Error) => {
        reject(new Error(`Failed to send to printer ${address}: ${error.message}`));
      });
      
      // Timeout after 10 seconds
      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error(`Timeout sending to printer ${address}`));
      });
    });
  }
  
  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    queued: number;
    rendering: number;
    printing: number;
    completed: number;
    failed: number;
  }> {
    const stats = await prisma.labelJob.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const result = {
      queued: 0,
      rendering: 0,
      printing: 0,
      completed: 0,
      failed: 0
    };
    
    for (const stat of stats) {
      const status = stat.status.toLowerCase() as keyof typeof result;
      if (status in result) {
        result[status] = stat._count.status;
      }
    }
    
    return result;
  }
}

// Global queue instance
export const labelQueue = new LabelJobQueue();

// Auto-start queue when module is imported
labelQueue.start().catch(error => {
  logger.error('Failed to start label queue:', error);
});
