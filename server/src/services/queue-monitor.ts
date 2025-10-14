import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  processingRate: number; // jobs per minute
  avgWaitTime: number; // seconds
  oldestJob?: Date;
  newestJob?: Date;
}

export interface JobDetails {
  id: string;
  name: string;
  data: any;
  opts: any;
  progress: number;
  delay: number;
  attemptsMade: number;
  processedOn?: Date;
  finishedOn?: Date;
  failedReason?: string;
  returnvalue?: any;
  stacktrace?: string[];
}

export class QueueMonitor {
  private static instance: QueueMonitor;
  
  public static getInstance(): QueueMonitor {
    if (!QueueMonitor.instance) {
      QueueMonitor.instance = new QueueMonitor();
    }
    return QueueMonitor.instance;
  }

  // Get queue statistics (mock implementation for now)
  async getQueueStats(): Promise<QueueStats[]> {
    try {
      // In production, this would connect to Redis/BullMQ
      // For now, return mock data
      const mockQueues: QueueStats[] = [
        {
          name: 'email',
          waiting: 12,
          active: 3,
          completed: 15420,
          failed: 45,
          delayed: 2,
          paused: false,
          processingRate: 25.5,
          avgWaitTime: 15.2,
          oldestJob: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          newestJob: new Date(Date.now() - 30 * 1000) // 30 seconds ago
        },
        {
          name: 'labels',
          waiting: 8,
          active: 2,
          completed: 8920,
          failed: 12,
          delayed: 0,
          paused: false,
          processingRate: 18.3,
          avgWaitTime: 8.7,
          oldestJob: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          newestJob: new Date(Date.now() - 45 * 1000) // 45 seconds ago
        },
        {
          name: 'analytics',
          waiting: 0,
          active: 0,
          completed: 2450,
          failed: 3,
          delayed: 0,
          paused: false,
          processingRate: 5.2,
          avgWaitTime: 0,
          oldestJob: undefined,
          newestJob: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
        },
        {
          name: 'notifications',
          waiting: 25,
          active: 5,
          completed: 3210,
          failed: 8,
          delayed: 1,
          paused: false,
          processingRate: 12.8,
          avgWaitTime: 22.1,
          oldestJob: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
          newestJob: new Date(Date.now() - 20 * 1000) // 20 seconds ago
        }
      ];

      return mockQueues;
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      return [];
    }
  }

  // Get failed jobs for a queue
  async getFailedJobs(queueName: string, limit: number = 50): Promise<JobDetails[]> {
    try {
      // Mock failed jobs data
      const mockFailedJobs: JobDetails[] = [
        {
          id: 'job-123',
          name: 'send-welcome-email',
          data: { userId: 'user-456', email: 'user@example.com' },
          opts: { attempts: 3, backoff: 'exponential' },
          progress: 100,
          delay: 0,
          attemptsMade: 3,
          processedOn: new Date(Date.now() - 30 * 60 * 1000),
          finishedOn: new Date(Date.now() - 25 * 60 * 1000),
          failedReason: 'SMTP server timeout',
          stacktrace: [
            'Error: SMTP server timeout',
            '    at SMTPClient.send (/app/node_modules/nodemailer/lib/smtp-transport/index.js:123:45)',
            '    at processTicksAndRejections (node:internal/process/task_queues:105:5)'
          ]
        },
        {
          id: 'job-124',
          name: 'process-label-print',
          data: { orderId: 'order-789', labelTemplate: 'shipping-label' },
          opts: { attempts: 2, backoff: 'fixed' },
          progress: 75,
          delay: 0,
          attemptsMade: 2,
          processedOn: new Date(Date.now() - 15 * 60 * 1000),
          finishedOn: new Date(Date.now() - 10 * 60 * 1000),
          failedReason: 'Printer offline',
          stacktrace: [
            'Error: Printer offline',
            '    at PrinterService.print (/app/services/printer.ts:45:12)',
            '    at processTicksAndRejections (node:internal/process/task_queues:105:5)'
          ]
        }
      ];

      return mockFailedJobs.slice(0, limit);
    } catch (error) {
      logger.error(`Failed to get failed jobs for queue ${queueName}:`, error);
      return [];
    }
  }

  // Retry a failed job
  async retryJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      // In production, this would call BullMQ's retry functionality
      logger.info(`Retrying job ${jobId} in queue ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to retry job ${jobId} in queue ${queueName}:`, error);
      return false;
    }
  }

  // Remove a job
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      // In production, this would call BullMQ's remove functionality
      logger.info(`Removing job ${jobId} from queue ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove job ${jobId} from queue ${queueName}:`, error);
      return false;
    }
  }

  // Pause/Resume a queue
  async toggleQueuePause(queueName: string, paused: boolean): Promise<boolean> {
    try {
      // In production, this would call BullMQ's pause/resume functionality
      logger.info(`${paused ? 'Pausing' : 'Resuming'} queue ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to ${paused ? 'pause' : 'resume'} queue ${queueName}:`, error);
      return false;
    }
  }

  // Get queue performance metrics over time
  async getQueuePerformance(queueName: string, hours: number = 24): Promise<{
    timestamp: Date;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }[]> {
    try {
      // Mock performance data
      const data = [];
      const now = new Date();
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          timestamp,
          waiting: Math.floor(Math.random() * 50) + 5,
          active: Math.floor(Math.random() * 10) + 1,
          completed: Math.floor(Math.random() * 100) + 10,
          failed: Math.floor(Math.random() * 5)
        });
      }
      
      return data;
    } catch (error) {
      logger.error(`Failed to get performance data for queue ${queueName}:`, error);
      return [];
    }
  }

  // Get overall queue health status
  async getQueueHealth(): Promise<{
    status: 'OK' | 'WARN' | 'CRIT';
    totalQueues: number;
    healthyQueues: number;
    warningQueues: number;
    criticalQueues: number;
    totalJobs: number;
    failedJobs: number;
    avgWaitTime: number;
  }> {
    try {
      const queues = await this.getQueueStats();
      
      let healthyQueues = 0;
      let warningQueues = 0;
      let criticalQueues = 0;
      let totalJobs = 0;
      let failedJobs = 0;
      let totalWaitTime = 0;
      let queueCount = 0;
      
      for (const queue of queues) {
        totalJobs += queue.waiting + queue.active + queue.completed + queue.failed;
        failedJobs += queue.failed;
        
        if (queue.avgWaitTime > 0) {
          totalWaitTime += queue.avgWaitTime;
          queueCount++;
        }
        
        // Determine queue health
        if (queue.waiting > 100 || queue.failed > 20 || queue.avgWaitTime > 300) {
          criticalQueues++;
        } else if (queue.waiting > 50 || queue.failed > 10 || queue.avgWaitTime > 120) {
          warningQueues++;
        } else {
          healthyQueues++;
        }
      }
      
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (criticalQueues > 0) {
        status = 'CRIT';
      } else if (warningQueues > 0) {
        status = 'WARN';
      }
      
      return {
        status,
        totalQueues: queues.length,
        healthyQueues,
        warningQueues,
        criticalQueues,
        totalJobs,
        failedJobs,
        avgWaitTime: queueCount > 0 ? totalWaitTime / queueCount : 0
      };
    } catch (error) {
      logger.error('Failed to get queue health:', error);
      return {
        status: 'CRIT',
        totalQueues: 0,
        healthyQueues: 0,
        warningQueues: 0,
        criticalQueues: 0,
        totalJobs: 0,
        failedJobs: 0,
        avgWaitTime: 0
      };
    }
  }
}

// Export singleton instance
export const queueMonitor = QueueMonitor.getInstance();























