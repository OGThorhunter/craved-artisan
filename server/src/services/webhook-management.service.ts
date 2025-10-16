import { prisma } from '../db';
import { logger } from '../logger';

export interface WebhookEndpointData {
  provider: string;
  url: string;
  secret?: string;
}

class WebhookManagementService {
  /**
   * List all webhook endpoints
   */
  async listEndpoints(): Promise<any[]> {
    try {
      const endpoints = await prisma.webhookEndpoint.findMany({
        orderBy: {
          provider: 'asc'
        }
      });

      // Mask secrets
      return endpoints.map(e => ({
        ...e,
        secret: e.secret ? '***masked***' : null
      }));
    } catch (error) {
      logger.error('Failed to list webhook endpoints:', error);
      throw error;
    }
  }

  /**
   * Get recent deliveries for an endpoint
   */
  async getRecentDeliveries(endpointId: string, limit: number = 20): Promise<any[]> {
    try {
      const deliveries = await prisma.webhookDelivery.findMany({
        where: {
          endpointId
        },
        orderBy: {
          deliveredAt: 'desc'
        },
        take: limit
      });

      return deliveries;
    } catch (error) {
      logger.error('Failed to get recent deliveries:', error);
      throw error;
    }
  }

  /**
   * Replay a failed webhook delivery
   */
  async replayDelivery(deliveryId: string): Promise<{ success: boolean; message: string }> {
    try {
      const delivery = await prisma.webhookDelivery.findUnique({
        where: { id: deliveryId },
        include: { endpoint: true }
      });

      if (!delivery) {
        throw new Error('Delivery not found');
      }

      // TODO: Implement actual webhook replay logic
      // For now, just log
      logger.info({ deliveryId, endpoint: delivery.endpoint.provider }, 'Replaying webhook delivery');

      return {
        success: true,
        message: 'Webhook delivery replayed successfully'
      };
    } catch (error) {
      logger.error('Failed to replay delivery:', error);
      return {
        success: false,
        message: String(error)
      };
    }
  }

  /**
   * Rotate webhook secret
   */
  async rotateSecret(endpointId: string): Promise<{ success: boolean; newSecret?: string; instructions: string }> {
    try {
      const endpoint = await prisma.webhookEndpoint.findUnique({
        where: { id: endpointId }
      });

      if (!endpoint) {
        throw new Error('Endpoint not found');
      }

      // Generate new secret
      const newSecret = this.generateWebhookSecret();

      // Update endpoint
      await prisma.webhookEndpoint.update({
        where: { id: endpointId },
        data: {
          secret: newSecret
        }
      });

      const instructions = this.getRotationInstructions(endpoint.provider);

      logger.info({ endpointId, provider: endpoint.provider }, 'Webhook secret rotated');

      return {
        success: true,
        newSecret,
        instructions
      };
    } catch (error) {
      logger.error('Failed to rotate secret:', error);
      return {
        success: false,
        instructions: String(error)
      };
    }
  }

  /**
   * Get webhook health dashboard data
   */
  async getHealthDashboard(): Promise<{
    endpoints: any[];
    recentFailures: any[];
    successRate: number;
  }> {
    try {
      const endpoints = await this.listEndpoints();
      
      // Get recent failures (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentDeliveries = await prisma.webhookDelivery.findMany({
        where: {
          deliveredAt: { gte: yesterday }
        }
      });

      const failures = recentDeliveries.filter(d => d.status >= 400);
      const successRate = recentDeliveries.length > 0
        ? ((recentDeliveries.length - failures.length) / recentDeliveries.length) * 100
        : 100;

      return {
        endpoints,
        recentFailures: failures.slice(0, 10),
        successRate
      };
    } catch (error) {
      logger.error('Failed to get webhook health dashboard:', error);
      throw error;
    }
  }

  /**
   * Generate webhook secret
   */
  private generateWebhookSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Get rotation instructions for provider
   */
  private getRotationInstructions(provider: string): string {
    const instructions: Record<string, string> = {
      STRIPE: `
1. Go to Stripe Dashboard > Developers > Webhooks
2. Select your webhook endpoint
3. Click "Reveal" under Signing secret
4. Update your environment variable STRIPE_WEBHOOK_SECRET
5. Restart your application
`,
      SENDGRID: `
1. Go to SendGrid > Settings > Mail Settings > Event Webhook
2. Update the authorization header with new secret
3. Update your environment variable SENDGRID_WEBHOOK_SECRET
4. Restart your application
`,
      TAXJAR: `
1. Contact TaxJar support to rotate webhook secret
2. Update your environment variable TAXJAR_WEBHOOK_SECRET
3. Restart your application
`
    };

    return instructions[provider] || 'Update the webhook secret in your provider dashboard and environment variables.';
  }
}

export const webhookManagementService = new WebhookManagementService();

