import { prisma } from '../db';
import { logger } from '../logger';
import { execSync } from 'child_process';

export interface DeploymentInfo {
  gitSha: string;
  gitBranch: string;
  gitAuthor: string;
  environment: string;
  deployedAt: Date;
  deployedBy: string;
}

class DeploymentTrackingService {
  /**
   * Get current deployment information
   */
  async getCurrentDeployment(): Promise<DeploymentInfo> {
    try {
      // Try to get git info from environment or git commands
      const gitSha = this.getGitSha();
      const gitBranch = this.getGitBranch();
      const gitAuthor = this.getGitAuthor();
      const environment = process.env.NODE_ENV || 'development';

      // Get most recent deployment from database
      const latest = await prisma.deploymentRecord.findFirst({
        where: {
          environment
        },
        orderBy: {
          deployedAt: 'desc'
        }
      });

      if (latest && latest.gitSha === gitSha) {
        return {
          gitSha: latest.gitSha,
          gitBranch: latest.gitBranch,
          gitAuthor: latest.gitAuthor || gitAuthor,
          environment: latest.environment,
          deployedAt: latest.deployedAt,
          deployedBy: latest.deployedBy || 'system'
        };
      }

      // Return current git info
      return {
        gitSha,
        gitBranch,
        gitAuthor,
        environment,
        deployedAt: new Date(),
        deployedBy: 'system'
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get current deployment');
      throw error;
    }
  }

  /**
   * Record a new deployment
   */
  async recordDeployment(
    deployedBy?: string,
    notes?: string
  ): Promise<any> {
    try {
      const gitSha = this.getGitSha();
      const gitBranch = this.getGitBranch();
      const gitAuthor = this.getGitAuthor();
      const environment = process.env.NODE_ENV || 'development';

      const deployment = await prisma.deploymentRecord.create({
        data: {
          gitSha,
          gitBranch,
          gitAuthor,
          environment,
          deployedBy,
          notes,
          deployedAt: new Date()
        }
      });

      logger.info({ 
        gitSha: gitSha.substring(0, 7), 
        gitBranch, 
        environment 
      }, 'Deployment recorded');

      return deployment;
    } catch (error) {
      logger.error({ error }, 'Failed to record deployment');
      throw error;
    }
  }

  /**
   * Get deployment history
   */
  async getDeploymentHistory(limit: number = 20): Promise<any[]> {
    try {
      const deployments = await prisma.deploymentRecord.findMany({
        orderBy: {
          deployedAt: 'desc'
        },
        take: limit
      });

      return deployments;
    } catch (error) {
      logger.error({ error }, 'Failed to get deployment history');
      throw error;
    }
  }

  /**
   * Get git SHA from environment or git command
   */
  private getGitSha(): string {
    try {
      // Try environment variables first (common in CI/CD)
      if (process.env.GIT_SHA) {
        return process.env.GIT_SHA;
      }
      if (process.env.RENDER_GIT_COMMIT) {
        return process.env.RENDER_GIT_COMMIT;
      }
      if (process.env.VERCEL_GIT_COMMIT_SHA) {
        return process.env.VERCEL_GIT_COMMIT_SHA;
      }

      // Try git command
      try {
        const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        return sha;
      } catch {
        return 'unknown';
      }
    } catch (error) {
      logger.warn('Failed to get git SHA:', error);
      return 'unknown';
    }
  }

  /**
   * Get git branch from environment or git command
   */
  private getGitBranch(): string {
    try {
      // Try environment variables first
      if (process.env.GIT_BRANCH) {
        return process.env.GIT_BRANCH;
      }
      if (process.env.RENDER_GIT_BRANCH) {
        return process.env.RENDER_GIT_BRANCH;
      }
      if (process.env.VERCEL_GIT_COMMIT_REF) {
        return process.env.VERCEL_GIT_COMMIT_REF;
      }

      // Try git command
      try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        return branch;
      } catch {
        return 'main';
      }
    } catch (error) {
      logger.warn('Failed to get git branch:', error);
      return 'main';
    }
  }

  /**
   * Get git author from git command
   */
  private getGitAuthor(): string {
    try {
      try {
        const author = execSync('git log -1 --pretty=format:"%an <%ae>"', { encoding: 'utf-8' }).trim();
        return author;
      } catch {
        return 'unknown';
      }
    } catch (error) {
      logger.warn('Failed to get git author:', error);
      return 'unknown';
    }
  }
}

export const deploymentTrackingService = new DeploymentTrackingService();

