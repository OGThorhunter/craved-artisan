import { prisma } from '../db';
import { logger } from '../logger';

export interface IncidentCreate {
  title: string;
  severity: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
  summary?: string;
  affected?: string[]; // List of affected services
  tags?: string[]; // List of tags
  ownerId?: string;
  runbookId?: string;
  slaMitigateMinutes?: number;
  slaCloseMinutes?: number;
}

export interface IncidentUpdate {
  status?: 'OPEN' | 'MITIGATED' | 'CLOSED';
  title?: string;
  severity?: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
  summary?: string;
  ownerId?: string;
  affected?: string[];
  tags?: string[];
  runbookId?: string;
  slaMitigateMinutes?: number;
  slaCloseMinutes?: number;
}

export interface TimelineEntry {
  type: string;
  message: string;
  timestamp: Date;
  actorId?: string;
}

export interface IncidentEventCreate {
  type: 'NOTE' | 'ACTION' | 'UPDATE' | 'MITIGATION' | 'IMPACT' | 'ROOT_CAUSE';
  summary: string;
  details?: string;
  attachments?: any[];
}

export interface PostmortemData {
  whatHappened?: string;
  rootCause?: string;
  contributingFactors?: string;
  lessonsLearned?: string;
  actionItems?: Array<{
    description: string;
    owner?: string;
    dueDate?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  }>;
}

export interface IncidentSearchFilters {
  status?: string[];
  severity?: string[];
  ownerId?: string;
  services?: string[];
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  hasPostmortem?: boolean;
}

class IncidentManagementService {
  /**
   * Create a new incident
   */
  async createIncident(data: IncidentCreate, createdById: string): Promise<any> {
    try {
      // Set default SLA targets based on severity if not provided
      const slaMitigateMinutes = data.slaMitigateMinutes ?? this.getDefaultSLAMitigate(data.severity);
      const slaCloseMinutes = data.slaCloseMinutes ?? this.getDefaultSLAClose(data.severity);

      const incident = await prisma.incident.create({
        data: {
          title: data.title,
          severity: data.severity,
          status: 'OPEN',
          summary: data.summary,
          affected: data.affected ? data.affected.join(',') : null,
          tags: data.tags ? data.tags.join(',') : null,
          ownerId: data.ownerId,
          runbookId: data.runbookId,
          slaMitigateMinutes,
          slaCloseMinutes,
          startedAt: new Date(),
          timeline: JSON.stringify([
            {
              type: 'CREATED',
              message: 'Incident created',
              timestamp: new Date(),
              actorId: createdById
            }
          ])
        },
        include: {
          owner: true,
          runbook: true
        }
      });

      // Create initial event
      await prisma.incidentEvent.create({
        data: {
          incidentId: incident.id,
          type: 'NOTE',
          summary: 'Incident created',
          createdById
        }
      });

      logger.info({ incidentId: incident.id, severity: data.severity, title: data.title }, 'Incident created');

      return incident;
    } catch (error) {
      logger.error({ error }, 'Failed to create incident');
      throw error;
    }
  }

  /**
   * Get default SLA mitigation time in minutes based on severity
   */
  private getDefaultSLAMitigate(severity: string): number {
    switch (severity) {
      case 'SEV1': return 15; // 15 minutes
      case 'SEV2': return 60; // 1 hour
      case 'SEV3': return 240; // 4 hours
      case 'SEV4': return 1440; // 24 hours
      default: return 240;
    }
  }

  /**
   * Get default SLA close time in minutes based on severity
   */
  private getDefaultSLAClose(severity: string): number {
    switch (severity) {
      case 'SEV1': return 120; // 2 hours
      case 'SEV2': return 480; // 8 hours
      case 'SEV3': return 1440; // 24 hours
      case 'SEV4': return 10080; // 7 days
      default: return 1440;
    }
  }

  /**
   * Update incident
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

      // Prepare update data
      const updateData: any = {};

      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }

      if (updates.severity !== undefined) {
        updateData.severity = updates.severity;
        // Create event for severity change
        await prisma.incidentEvent.create({
          data: {
            incidentId,
            type: 'UPDATE',
            summary: `Severity changed to ${updates.severity}`,
            createdById: updatedById
          }
        });
      }

      if (updates.status) {
        updateData.status = updates.status;
        
        if (updates.status === 'MITIGATED' && !incident.mitigatedAt) {
          updateData.mitigatedAt = new Date();
        } else if (updates.status === 'CLOSED' && !incident.closedAt) {
          updateData.closedAt = new Date();
        }

        // Add status change to legacy timeline
        timeline.push({
          type: 'STATUS_CHANGE',
          message: `Status changed to ${updates.status}`,
          timestamp: new Date(),
          actorId: updatedById
        });

        // Create event for status change
        await prisma.incidentEvent.create({
          data: {
            incidentId,
            type: updates.status === 'MITIGATED' ? 'MITIGATION' : 'UPDATE',
            summary: `Status changed to ${updates.status}`,
            createdById: updatedById
          }
        });
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

        // Create event for owner change
        await prisma.incidentEvent.create({
          data: {
            incidentId,
            type: 'UPDATE',
            summary: 'Owner assigned',
            createdById: updatedById
          }
        });
      }

      if (updates.affected !== undefined) {
        updateData.affected = updates.affected.join(',');
      }

      if (updates.tags !== undefined) {
        updateData.tags = updates.tags.join(',');
      }

      if (updates.runbookId !== undefined) {
        updateData.runbookId = updates.runbookId;
      }

      if (updates.slaMitigateMinutes !== undefined) {
        updateData.slaMitigateMinutes = updates.slaMitigateMinutes;
      }

      if (updates.slaCloseMinutes !== undefined) {
        updateData.slaCloseMinutes = updates.slaCloseMinutes;
      }

      updateData.timeline = JSON.stringify(timeline);

      const updated = await prisma.incident.update({
        where: { id: incidentId },
        data: updateData,
        include: {
          owner: true,
          runbook: true,
          events: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { createdBy: true }
          },
          postmortem: true
        }
      });

      logger.info({ incidentId, updates }, 'Incident updated');

      return updated;
    } catch (error) {
      logger.error({ error }, 'Failed to update incident');
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
      logger.error({ error }, 'Failed to add timeline entry');
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
      logger.error({ error }, 'Failed to list active incidents:', error);
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
      logger.error({ error }, 'Failed to list recent incidents:', error);
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
      logger.error({ error }, 'Failed to get incident:', error);
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
      logger.error({ error }, 'Failed to get incident stats:', error);
      throw error;
    }
  }

  /**
   * Add event to incident
   */
  async addEvent(incidentId: string, eventData: IncidentEventCreate, createdById: string): Promise<any> {
    try {
      const event = await prisma.incidentEvent.create({
        data: {
          incidentId,
          type: eventData.type,
          summary: eventData.summary,
          details: eventData.details,
          attachments: eventData.attachments ? JSON.stringify(eventData.attachments) : null,
          createdById
        },
        include: {
          createdBy: true
        }
      });

      logger.info({ incidentId, eventType: eventData.type, summary: eventData.summary }, 'Incident event added');

      return event;
    } catch (error) {
      logger.error({ error }, 'Failed to add incident event');
      throw error;
    }
  }

  /**
   * Get events for incident
   */
  async getEvents(incidentId: string): Promise<any[]> {
    try {
      const events = await prisma.incidentEvent.findMany({
        where: { incidentId },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        }
      });

      return events.map(e => ({
        ...e,
        attachments: e.attachments ? JSON.parse(e.attachments as string) : []
      }));
    } catch (error) {
      logger.error({ error, incidentId }, 'Failed to get incident events');
      throw error;
    }
  }

  /**
   * Reopen closed incident
   */
  async reopenIncident(incidentId: string, reason: string, reopenedById: string): Promise<any> {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId }
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      if (incident.status !== 'CLOSED') {
        throw new Error('Can only reopen closed incidents');
      }

      const updated = await prisma.incident.update({
        where: { id: incidentId },
        data: {
          status: 'OPEN',
          closedAt: null
        },
        include: {
          owner: true,
          runbook: true
        }
      });

      // Create reopened event
      await prisma.incidentEvent.create({
        data: {
          incidentId,
          type: 'UPDATE',
          summary: 'Incident reopened',
          details: reason,
          createdById: reopenedById
        }
      });

      logger.info({ incidentId, reason }, 'Incident reopened');

      return updated;
    } catch (error) {
      logger.error({ error }, 'Failed to reopen incident');
      throw error;
    }
  }

  /**
   * Save postmortem for incident
   */
  async savePostmortem(incidentId: string, data: PostmortemData, createdById: string): Promise<any> {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId }
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      // Check if postmortem exists
      const existing = await prisma.postmortem.findUnique({
        where: { incidentId }
      });

      let postmortem;
      if (existing) {
        // Update existing
        postmortem = await prisma.postmortem.update({
          where: { incidentId },
          data: {
            whatHappened: data.whatHappened,
            rootCause: data.rootCause,
            contributingFactors: data.contributingFactors,
            lessonsLearned: data.lessonsLearned,
            actionItems: data.actionItems ? JSON.stringify(data.actionItems) : null
          }
        });
      } else {
        // Create new
        postmortem = await prisma.postmortem.create({
          data: {
            incidentId,
            whatHappened: data.whatHappened,
            rootCause: data.rootCause,
            contributingFactors: data.contributingFactors,
            lessonsLearned: data.lessonsLearned,
            actionItems: data.actionItems ? JSON.stringify(data.actionItems) : null,
            createdById
          }
        });
      }

      // Create event for postmortem
      await prisma.incidentEvent.create({
        data: {
          incidentId,
          type: 'ROOT_CAUSE',
          summary: existing ? 'Post-mortem updated' : 'Post-mortem completed',
          createdById
        }
      });

      logger.info({ incidentId, postmortemId: postmortem.id }, 'Postmortem saved');

      return {
        ...postmortem,
        actionItems: postmortem.actionItems ? JSON.parse(postmortem.actionItems as string) : []
      };
    } catch (error) {
      logger.error({ error }, 'Failed to save postmortem');
      throw error;
    }
  }

  /**
   * Get incident KPIs for header
   */
  async getIncidentKPIs(): Promise<any> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.setHours(0, 0, 0, 0));

      // Get all recent incidents
      const allIncidents = await prisma.incident.findMany({
        where: {
          startedAt: { gte: thirtyDaysAgo }
        }
      });

      // Open incidents by severity
      const openIncidents = allIncidents.filter(i => i.status === 'OPEN');
      const openBySeverity = {
        SEV1: openIncidents.filter(i => i.severity === 'SEV1').length,
        SEV2: openIncidents.filter(i => i.severity === 'SEV2').length,
        SEV3: openIncidents.filter(i => i.severity === 'SEV3').length,
        SEV4: openIncidents.filter(i => i.severity === 'SEV4').length
      };

      // Calculate MTTM (Mean Time To Mitigate)
      const mitigatedIncidents = allIncidents.filter(i => i.mitigatedAt);
      const mttmMinutes = mitigatedIncidents.length > 0
        ? mitigatedIncidents.reduce((sum, i) => {
            const duration = i.mitigatedAt!.getTime() - i.startedAt.getTime();
            return sum + duration;
          }, 0) / mitigatedIncidents.length / 60000
        : 0;

      // Calculate MTTR (Mean Time To Resolve)
      const resolvedIncidents = allIncidents.filter(i => i.closedAt);
      const mttrMinutes = resolvedIncidents.length > 0
        ? resolvedIncidents.reduce((sum, i) => {
            const duration = i.closedAt!.getTime() - i.startedAt.getTime();
            return sum + duration;
          }, 0) / resolvedIncidents.length / 60000
        : 0;

      // SLA breaches today
      const todayIncidents = allIncidents.filter(i => i.startedAt >= todayStart);
      const slaBreaches = todayIncidents.filter(i => {
        const minutesSinceStart = (now.getTime() - i.startedAt.getTime()) / 60000;
        if (i.status === 'OPEN' && i.slaMitigateMinutes) {
          return minutesSinceStart > i.slaMitigateMinutes;
        }
        if (i.status === 'MITIGATED' && i.slaCloseMinutes) {
          return minutesSinceStart > i.slaCloseMinutes;
        }
        return false;
      }).length;

      // TODO: Get actual on-call person from schedule
      const onCall = {
        name: 'On-Call Engineer',
        contact: 'ops@craved.com'
      };

      return {
        openBySeverity,
        mttm: Math.round(mttmMinutes),
        mttr: Math.round(mttrMinutes),
        slaBreaches,
        onCall,
        cachedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get incident KPIs');
      throw error;
    }
  }

  /**
   * Search incidents with filters
   */
  async searchIncidents(filters: IncidentSearchFilters): Promise<any[]> {
    try {
      const where: any = {};

      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status };
      }

      if (filters.severity && filters.severity.length > 0) {
        where.severity = { in: filters.severity };
      }

      if (filters.ownerId) {
        where.ownerId = filters.ownerId;
      }

      if (filters.startDate || filters.endDate) {
        where.startedAt = {};
        if (filters.startDate) where.startedAt.gte = filters.startDate;
        if (filters.endDate) where.startedAt.lte = filters.endDate;
      }

      const incidents = await prisma.incident.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          runbook: true,
          postmortem: true,
          events: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: [
          { severity: 'asc' },
          { startedAt: 'desc' }
        ]
      });

      // Filter by services
      let filtered = incidents;
      if (filters.services && filters.services.length > 0) {
        filtered = filtered.filter(i => {
          if (!i.affected) return false;
          const services = i.affected.split(',');
          return filters.services!.some(s => services.includes(s));
        });
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(i => {
          if (!i.tags) return false;
          const tags = i.tags.split(',');
          return filters.tags!.some(t => tags.includes(t));
        });
      }

      // Filter by hasPostmortem
      if (filters.hasPostmortem !== undefined) {
        filtered = filtered.filter(i => 
          filters.hasPostmortem ? !!i.postmortem : !i.postmortem
        );
      }

      return filtered.map(i => ({
        ...i,
        affected: i.affected ? i.affected.split(',') : [],
        tags: i.tags ? i.tags.split(',') : [],
        timeline: i.timeline ? JSON.parse(i.timeline as string) : []
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to search incidents');
      throw error;
    }
  }
}

export const incidentManagementService = new IncidentManagementService();

