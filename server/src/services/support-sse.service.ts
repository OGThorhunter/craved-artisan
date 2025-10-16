import { Response } from 'express';
import { logger } from '../logger';

interface SSEClient {
  userId: string;
  res: Response;
  connectedAt: Date;
}

/**
 * Server-Sent Events (SSE) service for real-time support ticket updates
 */
class SupportSSEService {
  private clients: Map<string, SSEClient> = new Map();
  
  /**
   * Add a new SSE client connection
   */
  addClient(userId: string, res: Response) {
    // Remove existing connection if any
    this.removeClient(userId);
    
    this.clients.set(userId, {
      userId,
      res,
      connectedAt: new Date(),
    });
    
    logger.info({
      userId,
      totalConnections: this.clients.size,
    }, '✅ SSE client connected');
    
    // Send initial connection message
    this.sendToClient(userId, {
      type: 'connected',
      message: 'Support updates stream connected',
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Remove an SSE client connection
   */
  removeClient(userId: string) {
    const client = this.clients.get(userId);
    if (client) {
      try {
        client.res.end();
      } catch (error) {
        // Connection might already be closed
      }
      
      this.clients.delete(userId);
      
      logger.info({
        userId,
        totalConnections: this.clients.size,
      }, '❌ SSE client disconnected');
    }
  }
  
  /**
   * Send event to a specific client
   */
  private sendToClient(userId: string, data: any) {
    const client = this.clients.get(userId);
    if (!client) return;
    
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      client.res.write(message);
    } catch (error) {
      logger.error({ error, userId }, '❌ Failed to send SSE message');
      this.removeClient(userId);
    }
  }
  
  /**
   * Broadcast ticket update to all connected clients
   */
  broadcastTicketUpdate(ticketId: string, event: {
    type: 'created' | 'updated' | 'message' | 'assigned' | 'closed';
    ticket?: any;
    message?: any;
  }) {
    const data = {
      type: 'ticket_update',
      ticketId,
      event: event.type,
      data: event.ticket || event.message,
      timestamp: new Date().toISOString(),
    };
    
    logger.info({
      ticketId,
      eventType: event.type,
      clients: this.clients.size,
    }, '📡 Broadcasting ticket update to all clients');
    
    // Send to all connected clients
    for (const [userId] of this.clients) {
      this.sendToClient(userId, data);
    }
  }
  
  /**
   * Notify specific assignee about ticket assignment
   */
  notifyAssignee(userId: string, event: {
    type: 'assigned' | 'mentioned';
    ticketId: string;
    ticket: any;
  }) {
    const data = {
      type: 'notification',
      notificationType: event.type,
      ticketId: event.ticketId,
      ticket: event.ticket,
      timestamp: new Date().toISOString(),
    };
    
    logger.info({
      userId,
      ticketId: event.ticketId,
      notificationType: event.type,
    }, '📧 Sending notification to assignee');
    
    this.sendToClient(userId, data);
  }
  
  /**
   * Send heartbeat to keep connections alive
   */
  sendHeartbeat() {
    const heartbeat = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      connections: this.clients.size,
    };
    
    for (const [userId] of this.clients) {
      this.sendToClient(userId, heartbeat);
    }
  }
  
  /**
   * Get number of active connections
   */
  getConnectionCount(): number {
    return this.clients.size;
  }
  
  /**
   * Get list of connected user IDs
   */
  getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }
  
  /**
   * Close all connections
   */
  closeAll() {
    logger.info(`Closing ${this.clients.size} SSE connections...`);
    
    for (const [userId] of this.clients) {
      this.removeClient(userId);
    }
  }
}

// Singleton instance
export const supportSSEService = new SupportSSEService();

// Send heartbeat every 30 seconds to keep connections alive
setInterval(() => {
  if (supportSSEService.getConnectionCount() > 0) {
    supportSSEService.sendHeartbeat();
  }
}, 30000);

