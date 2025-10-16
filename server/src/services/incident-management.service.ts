import { prisma } from '../db';
import { logger } from '../logger';

export interface IncidentCreate {
  title: string;
  severity: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
  summary?: string;
  affected?: string[]; // List of affected services
  ownerId?: string;
}

export interface IncidentUpdate {
  status?: 'OPEN' | 'MITIGATED' | 'CLOSED';
  summary?: string;
  ownerId?: string;
}

export interface TimelineEntry {
  type: string;
  message: string;
  timestamp: Date;
  actorId?: string;
}

class IncidentManagementService {
  /**
   * Create a new incident
   */
  async createIncident(data: IncidentCreate, createdById: string): Promise<any> {
    try {
      const incident = await prisma.incident.create({
        data: {
          title: data.title,
          severity: data.severity,
          status: 'OPEN',
          summary: data.summary,
          affected: data.affected ? data.affected.join(',') : null,
          ownerId: data.ownerId,
          startedAt: new Date(),
          timeline: JSON.stringify([
            {
              type: 'CREATED',
              message: 'Incident created',
              timestamp: new Date(),
              actorId: createdById
            }
          ])
        }
      });

      logger.info({ incidentId: incident.id, severity: data.severity, title: data.title }, 'Incident created');

      return incident;
    } catch (error) {
      logger.error('Failed to create incident:', error);
      throw error;
    }
  }

  /**
   * Update incident status
   */
  async updateIncident(incidentId: string, updates: IncidentUpdate, updatedById: string): Promise<any> {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId }
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      // Parse existing timeline
      const timeline = incident.timeline ? JSON.parse(incident.timeline as string) : [];

      // Add update to timeline
      if (updates.status) {
        timeline.push({
          type: 'STATUS_CHANGE',
          message: `Status changed to ${updates.status}`,
          timestamp: new Date(),
          actorId: updatedById
        });
      }

      // Prepare update data
      const updateData: any = {
        timeline: JSON.stringify(timeline)
      };

      if (updates.status) {
        updateData.status = updates.status;
        
        if (updates.status === 'MITIGATED') {
          updateData.mitigatedAt = new Date();
        } else if (updates.status === 'CLOSED') {
          updateData.closedAt = new Date();
        }
      }

      if (updates.summary !== undefined) {
        updateData.summary = updates.summary;
      }

      if (updates.ownerId !== undefined) {
        updateData.ownerId = updates.ownerId;
        timeline.push({
          type: 'OWNER_CHANGE',
          message: `Owner changed`,
          timestamp: new Date(),
          actorId: updatedById
        });
        updateData.timeline = JSON.stringify(timeline);
      }

      const updated = await prisma.incident.update({
        where: { id: incidentId },
        data: updateData
      });

      logger.info({ incidentId, updates }, 'Incident updated');

      return updated;
    } catch (error) {
      logger.error('Failed to update incident:', error);
      throw error;
    }
  }

  /**
   * Add timeline entry to incident
   */
  async addTimelineEntry(incidentId: string, entry: Omit<TimelineEntry, 'timestamp'>): Promise<void> {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId }
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      const timeline = incident.timeline ? JSON.parse(incident.timeline as string) : [];
      
      timeline.push({
        ...entry,
        timestamp: new Date()
      });

      await prisma.incident.update({
        where: { id: incidentId },
        data: {
          timeline: JSON.stringify(timeline)
        }
      });

      logger.info({ incidentId, entry }, 'Timeline entry added');
    } catch (error) {
      logger.error('Failed to add timeline entry:', error);
      throw error;
    }
  }

  /**
   * List active incidents
   */
  async listActiveIncidents(): Promise<any[]> {
    try {
      const incidents = await prisma.incident.findMany({
        where: {
          status: {
            in: ['OPEN', 'MITIGATED']
          }
        },
        orderBy: [
          { severity: 'asc' }, // SEV1 first
          { startedAt: 'desc' }
        ]
      });

      return incidents.map(i => ({
        ...i,
        timeline: i.timeline ? JSON.parse(i.timeline as string) : [],
        affected: i.affected ? i.affected.split(',') : []
      }));
    } catch (error) {
      logger.error('Failed to list active incidents:', error);
      throw error;
    }
  }

  /**
   * List recent incidents (last 30 days)
   */
  async listRecentIncidents(limit: number = 50): Promise<any[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const incidents = await prisma.incident.findMany({
        where: {
          startedAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          startedAt: 'desc'
        },
        take: limit
      });

      return incidents.map(i => ({
        ...i,
        timeline: i.timeline ? JSON.parse(i.timeline as string) : [],
        affected: i.affected ? i.affected.split(',') : []
      }));
    } catch (error) {
      logger.error('Failed to list recent incidents:', error);
      throw error;
    }
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<any> {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId }
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      return {
        ...incident,
        timeline: incident.timeline ? JSON.parse(incident.timeline as string) : [],
        affected: incident.affected ? incident.affected.split(',') : []
      };
    } catch (error) {
      logger.error('Failed to get incident:', error);
      throw error;
    }
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(): Promise<{
    openCount: number;
    mitigatedCount: number;
    closedLast30Days: number;
    mttr: number; // Mean Time To Resolution in minutes
    severity: {
      sev1: number;
      sev2: number;
      sev3: number;
      sev4: number;
    };
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [open, mitigated, closed, allRecent] = await Promise.all([
        prisma.incident.count({ where: { status: 'OPEN' } }),
        prisma.incident.count({ where: { status: 'MITIGATED' } }),
        prisma.incident.count({
          where: {
            status: 'CLOSED',
            closedAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.incident.findMany({
          where: {
            startedAt: { gte: thirtyDaysAgo }
          }
        })
      ]);

      // Calculate MTTR
      const resolvedIncidents = allRecent.filter(i => i.closedAt);
      const mttrMs = resolvedIncidents.length > 0
        ? resolvedIncidents.reduce((sum, i) => {
            const duration = i.closedAt!.getTime() - i.startedAt.getTime();
            return sum + duration;
          }, 0) / resolvedIncidents.length
        : 0;
      const mttr = Math.floor(mttrMs / 60000); // Convert to minutes

      // Count by severity
      const severity = {
        sev1: allRecent.filter(i => i.severity === 'SEV1').length,
        sev2: allRecent.filter(i => i.severity === 'SEV2').length,
        sev3: allRecent.filter(i => i.severity === 'SEV3').length,
        sev4: allRecent.filter(i => i.severity === 'SEV4').length
      };

      return {
        openCount: open,
        mitigatedCount: mitigated,
        closedLast30Days: closed,
        mttr,
        severity
      };
    } catch (error) {
      logger.error('Failed to get incident stats:', error);
      throw error;
    }
  }
}

export const incidentManagementService = new IncidentManagementService();

