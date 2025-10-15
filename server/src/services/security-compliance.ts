import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface ASVSChecklist {
  id: string;
  category: 'authentication' | 'session_management' | 'access_control' | 'input_validation' | 'output_encoding' | 'cryptography' | 'error_handling' | 'data_protection' | 'communications' | 'malicious_controls' | 'business_logic' | 'files_resources' | 'api' | 'configuration';
  requirement: string;
  description: string;
  level: 'L1' | 'L2' | 'L3';
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
  evidence?: string;
  notes?: string;
  lastChecked: Date;
  checkedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecretItem {
  id: string;
  name: string;
  type: 'api_key' | 'database_password' | 'jwt_secret' | 'encryption_key' | 'oauth_token' | 'ssh_key' | 'certificate' | 'other';
  environment: 'development' | 'staging' | 'production';
  location: string;
  lastRotated?: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'compromised' | 'deprecated';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  accessCount: number;
  lastAccessed?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'security' | 'performance' | 'availability' | 'data_loss' | 'compliance' | 'other';
  affectedSystems: string[];
  reportedBy: string;
  assignedTo?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  rootCause?: string;
  resolution?: string;
  lessonsLearned?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Runbook {
  id: string;
  title: string;
  description: string;
  category: 'incident_response' | 'maintenance' | 'deployment' | 'security' | 'backup' | 'monitoring' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: RunbookStep[];
  prerequisites: string[];
  estimatedDuration: number; // minutes
  lastExecuted?: Date;
  executedBy?: string;
  successRate: number; // percentage
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RunbookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  command?: string;
  expectedOutcome: string;
  timeout?: number; // seconds
  retryCount?: number;
  isCritical: boolean;
}

export interface SecurityMetrics {
  asvs: {
    totalRequirements: number;
    compliant: number;
    nonCompliant: number;
    underReview: number;
    complianceRate: number;
    criticalIssues: number;
  };
  secrets: {
    totalSecrets: number;
    activeSecrets: number;
    expiredSecrets: number;
    highRiskSecrets: number;
    lastRotation: Date;
  };
  incidents: {
    totalIncidents: number;
    openIncidents: number;
    criticalIncidents: number;
    averageResolutionTime: number; // hours
    mttr: number; // mean time to resolution
    mtbf: number; // mean time between failures
  };
  runbooks: {
    totalRunbooks: number;
    activeRunbooks: number;
    executedThisMonth: number;
    averageSuccessRate: number;
  };
}

export interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'privilege_escalation' | 'data_access' | 'system_change' | 'compliance_violation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  affectedResource?: string;
  userId?: string;
  ipAddress?: string;
  timestamp: Date;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SecurityComplianceService {
  private static instance: SecurityComplianceService;
  
  public static getInstance(): SecurityComplianceService {
    if (!SecurityComplianceService.instance) {
      SecurityComplianceService.instance = new SecurityComplianceService();
    }
    return SecurityComplianceService.instance;
  }

  // Get ASVS checklist
  async getASVSChecklist(filters: {
    category?: string;
    level?: 'L1' | 'L2' | 'L3';
    status?: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: ASVSChecklist[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }> {
    try {
      const {
        category,
        level,
        status,
        page = 1,
        pageSize = 20
      } = filters;

      const skip = (page - 1) * pageSize;

      // Mock ASVS checklist data
      const mockItems: ASVSChecklist[] = [
        {
          id: 'asvs-1',
          category: 'authentication',
          requirement: 'V2.1',
          description: 'Verify that all pages and resources require authentication except those specifically intended to be public',
          level: 'L1',
          status: 'compliant',
          evidence: 'Authentication middleware implemented on all protected routes',
          lastChecked: new Date('2024-07-15'),
          checkedBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-15')
        },
        {
          id: 'asvs-2',
          category: 'session_management',
          requirement: 'V3.1',
          description: 'Verify that the application uses a secure session management system',
          level: 'L1',
          status: 'compliant',
          evidence: 'Express-session with secure cookies and session store',
          lastChecked: new Date('2024-07-15'),
          checkedBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-15')
        },
        {
          id: 'asvs-3',
          category: 'access_control',
          requirement: 'V4.1',
          description: 'Verify that the application enforces access control rules on a trusted service layer',
          level: 'L1',
          status: 'non_compliant',
          evidence: 'Missing role-based access control on some endpoints',
          notes: 'Need to implement RBAC middleware for all admin endpoints',
          lastChecked: new Date('2024-07-10'),
          checkedBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-10')
        },
        {
          id: 'asvs-4',
          category: 'input_validation',
          requirement: 'V5.1',
          description: 'Verify that the application validates input from all data sources',
          level: 'L1',
          status: 'under_review',
          evidence: 'Zod validation implemented for most endpoints',
          notes: 'Reviewing remaining endpoints for validation coverage',
          lastChecked: new Date('2024-07-12'),
          checkedBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-12')
        },
        {
          id: 'asvs-5',
          category: 'cryptography',
          requirement: 'V7.1',
          description: 'Verify that the application uses approved cryptographic algorithms',
          level: 'L2',
          status: 'compliant',
          evidence: 'Using bcrypt for password hashing, JWT for tokens',
          lastChecked: new Date('2024-07-15'),
          checkedBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-15')
        }
      ];

      // Filter mock data
      let filteredItems = mockItems;
      if (category) filteredItems = filteredItems.filter(item => item.category === category);
      if (level) filteredItems = filteredItems.filter(item => item.level === level);
      if (status) filteredItems = filteredItems.filter(item => item.status === status);

      const total = filteredItems.length;
      const paginatedItems = filteredItems.slice(skip, skip + pageSize);

      return {
        items: paginatedItems,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to get ASVS checklist:', error);
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0
      };
    }
  }

  // Get secrets inventory
  async getSecretsInventory(filters: {
    type?: string;
    environment?: 'development' | 'staging' | 'production';
    status?: 'active' | 'expired' | 'compromised' | 'deprecated';
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    page?: number;
    pageSize?: number;
  }): Promise<{
    secrets: SecretItem[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }> {
    try {
      const {
        type,
        environment,
        status,
        riskLevel,
        page = 1,
        pageSize = 20
      } = filters;

      const skip = (page - 1) * pageSize;

      // Mock secrets inventory data
      const mockSecrets: SecretItem[] = [
        {
          id: 'secret-1',
          name: 'Database Password',
          type: 'database_password',
          environment: 'production',
          location: 'Environment Variable: DATABASE_URL',
          lastRotated: new Date('2024-06-01'),
          expiresAt: new Date('2024-12-01'),
          status: 'active',
          riskLevel: 'high',
          accessCount: 1250,
          lastAccessed: new Date('2024-07-15'),
          createdBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-15')
        },
        {
          id: 'secret-2',
          name: 'JWT Secret',
          type: 'jwt_secret',
          environment: 'production',
          location: 'Environment Variable: JWT_SECRET',
          lastRotated: new Date('2024-05-15'),
          status: 'active',
          riskLevel: 'critical',
          accessCount: 5600,
          lastAccessed: new Date('2024-07-15'),
          createdBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-15')
        },
        {
          id: 'secret-3',
          name: 'Stripe API Key',
          type: 'api_key',
          environment: 'production',
          location: 'Environment Variable: STRIPE_SECRET_KEY',
          lastRotated: new Date('2024-04-01'),
          status: 'active',
          riskLevel: 'high',
          accessCount: 890,
          lastAccessed: new Date('2024-07-14'),
          createdBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-14')
        },
        {
          id: 'secret-4',
          name: 'OAuth Client Secret',
          type: 'oauth_token',
          environment: 'production',
          location: 'Environment Variable: OAUTH_CLIENT_SECRET',
          lastRotated: new Date('2024-03-01'),
          expiresAt: new Date('2024-09-01'),
          status: 'expired',
          riskLevel: 'critical',
          accessCount: 0,
          createdBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-10')
        },
        {
          id: 'secret-5',
          name: 'Encryption Key',
          type: 'encryption_key',
          environment: 'production',
          location: 'Key Vault: encryption-key-v1',
          lastRotated: new Date('2024-07-01'),
          status: 'active',
          riskLevel: 'critical',
          accessCount: 234,
          lastAccessed: new Date('2024-07-15'),
          createdBy: 'admin-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-15')
        }
      ];

      // Filter mock data
      let filteredSecrets = mockSecrets;
      if (type) filteredSecrets = filteredSecrets.filter(secret => secret.type === type);
      if (environment) filteredSecrets = filteredSecrets.filter(secret => secret.environment === environment);
      if (status) filteredSecrets = filteredSecrets.filter(secret => secret.status === status);
      if (riskLevel) filteredSecrets = filteredSecrets.filter(secret => secret.riskLevel === riskLevel);

      const total = filteredSecrets.length;
      const paginatedSecrets = filteredSecrets.slice(skip, skip + pageSize);

      return {
        secrets: paginatedSecrets,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to get secrets inventory:', error);
      return {
        secrets: [],
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0
      };
    }
  }

  // Get incidents
  async getIncidents(filters: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'open' | 'investigating' | 'resolved' | 'closed';
    category?: 'security' | 'performance' | 'availability' | 'data_loss' | 'compliance' | 'other';
    page?: number;
    pageSize?: number;
  }): Promise<{
    incidents: Incident[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }> {
    try {
      const {
        severity,
        status,
        category,
        page = 1,
        pageSize = 20
      } = filters;

      const skip = (page - 1) * pageSize;

      // Mock incidents data
      const mockIncidents: Incident[] = [
        {
          id: 'inc-1',
          title: 'Database Connection Timeout',
          description: 'Multiple database connection timeouts detected during peak hours',
          severity: 'high',
          status: 'resolved',
          category: 'availability',
          affectedSystems: ['database', 'api'],
          reportedBy: 'monitoring-system',
          assignedTo: 'admin-123',
          detectedAt: new Date('2024-07-14T10:30:00Z'),
          resolvedAt: new Date('2024-07-14T12:45:00Z'),
          rootCause: 'Connection pool exhaustion due to unclosed connections',
          resolution: 'Increased connection pool size and implemented connection monitoring',
          lessonsLearned: 'Need better connection lifecycle management',
          tags: ['database', 'performance', 'connection-pool'],
          createdAt: new Date('2024-07-14T10:30:00Z'),
          updatedAt: new Date('2024-07-14T12:45:00Z')
        },
        {
          id: 'inc-2',
          title: 'Suspicious Login Attempts',
          description: 'Multiple failed login attempts from suspicious IP addresses',
          severity: 'medium',
          status: 'investigating',
          category: 'security',
          affectedSystems: ['authentication'],
          reportedBy: 'security-monitor',
          assignedTo: 'admin-456',
          detectedAt: new Date('2024-07-15T08:15:00Z'),
          tags: ['security', 'authentication', 'brute-force'],
          createdAt: new Date('2024-07-15T08:15:00Z'),
          updatedAt: new Date('2024-07-15T08:15:00Z')
        },
        {
          id: 'inc-3',
          title: 'API Rate Limit Exceeded',
          description: 'API rate limits exceeded causing service degradation',
          severity: 'low',
          status: 'open',
          category: 'performance',
          affectedSystems: ['api', 'rate-limiter'],
          reportedBy: 'api-monitor',
          detectedAt: new Date('2024-07-15T14:20:00Z'),
          tags: ['api', 'rate-limiting', 'performance'],
          createdAt: new Date('2024-07-15T14:20:00Z'),
          updatedAt: new Date('2024-07-15T14:20:00Z')
        }
      ];

      // Filter mock data
      let filteredIncidents = mockIncidents;
      if (severity) filteredIncidents = filteredIncidents.filter(incident => incident.severity === severity);
      if (status) filteredIncidents = filteredIncidents.filter(incident => incident.status === status);
      if (category) filteredIncidents = filteredIncidents.filter(incident => incident.category === category);

      const total = filteredIncidents.length;
      const paginatedIncidents = filteredIncidents.slice(skip, skip + pageSize);

      return {
        incidents: paginatedIncidents,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to get incidents:', error);
      return {
        incidents: [],
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0
      };
    }
  }

  // Get runbooks
  async getRunbooks(filters: {
    category?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{
    runbooks: Runbook[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }> {
    try {
      const {
        category,
        severity,
        isActive,
        page = 1,
        pageSize = 20
      } = filters;

      const skip = (page - 1) * pageSize;

      // Mock runbooks data
      const mockRunbooks: Runbook[] = [
        {
          id: 'rb-1',
          title: 'Database Connection Recovery',
          description: 'Steps to recover from database connection issues',
          category: 'incident_response',
          severity: 'high',
          steps: [
            {
              id: 'step-1',
              order: 1,
              title: 'Check Connection Pool',
              description: 'Verify connection pool status and available connections',
              command: 'SELECT * FROM pg_stat_activity;',
              expectedOutcome: 'Connection pool shows available connections',
              timeout: 30,
              retryCount: 3,
              isCritical: true
            },
            {
              id: 'step-2',
              order: 2,
              title: 'Restart Database Service',
              description: 'Restart the database service if connection pool is exhausted',
              command: 'sudo systemctl restart postgresql',
              expectedOutcome: 'Database service restarts successfully',
              timeout: 60,
              retryCount: 2,
              isCritical: true
            }
          ],
          prerequisites: ['Database access', 'System admin privileges'],
          estimatedDuration: 15,
          lastExecuted: new Date('2024-07-14T12:30:00Z'),
          executedBy: 'admin-123',
          successRate: 95,
          tags: ['database', 'recovery', 'incident'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-14')
        },
        {
          id: 'rb-2',
          title: 'Security Incident Response',
          description: 'Standard procedure for responding to security incidents',
          category: 'security',
          severity: 'critical',
          steps: [
            {
              id: 'step-3',
              order: 1,
              title: 'Assess Threat Level',
              description: 'Evaluate the severity and impact of the security incident',
              expectedOutcome: 'Threat level determined and documented',
              timeout: 15,
              isCritical: true
            },
            {
              id: 'step-4',
              order: 2,
              title: 'Isolate Affected Systems',
              description: 'Isolate compromised systems to prevent further damage',
              expectedOutcome: 'Affected systems are isolated and secured',
              timeout: 30,
              isCritical: true
            }
          ],
          prerequisites: ['Security team access', 'System isolation capabilities'],
          estimatedDuration: 45,
          successRate: 88,
          tags: ['security', 'incident', 'response'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-07-01')
        }
      ];

      // Filter mock data
      let filteredRunbooks = mockRunbooks;
      if (category) filteredRunbooks = filteredRunbooks.filter(runbook => runbook.category === category);
      if (severity) filteredRunbooks = filteredRunbooks.filter(runbook => runbook.severity === severity);
      if (isActive !== undefined) filteredRunbooks = filteredRunbooks.filter(runbook => runbook.isActive === isActive);

      const total = filteredRunbooks.length;
      const paginatedRunbooks = filteredRunbooks.slice(skip, skip + pageSize);

      return {
        runbooks: paginatedRunbooks,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to get runbooks:', error);
      return {
        runbooks: [],
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0
      };
    }
  }

  // Get security metrics
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      // Mock security metrics
      return {
        asvs: {
          totalRequirements: 156,
          compliant: 142,
          nonCompliant: 8,
          underReview: 6,
          complianceRate: 91.0,
          criticalIssues: 2
        },
        secrets: {
          totalSecrets: 24,
          activeSecrets: 20,
          expiredSecrets: 3,
          highRiskSecrets: 5,
          lastRotation: new Date('2024-07-01')
        },
        incidents: {
          totalIncidents: 45,
          openIncidents: 3,
          criticalIncidents: 1,
          averageResolutionTime: 2.5,
          mttr: 2.3,
          mtbf: 168.5
        },
        runbooks: {
          totalRunbooks: 12,
          activeRunbooks: 10,
          executedThisMonth: 8,
          averageSuccessRate: 92.5
        }
      };
    } catch (error) {
      logger.error('Failed to get security metrics:', error);
      return {
        asvs: {
          totalRequirements: 0,
          compliant: 0,
          nonCompliant: 0,
          underReview: 0,
          complianceRate: 0,
          criticalIssues: 0
        },
        secrets: {
          totalSecrets: 0,
          activeSecrets: 0,
          expiredSecrets: 0,
          highRiskSecrets: 0,
          lastRotation: new Date()
        },
        incidents: {
          totalIncidents: 0,
          openIncidents: 0,
          criticalIncidents: 0,
          averageResolutionTime: 0,
          mttr: 0,
          mtbf: 0
        },
        runbooks: {
          totalRunbooks: 0,
          activeRunbooks: 0,
          executedThisMonth: 0,
          averageSuccessRate: 0
        }
      };
    }
  }

  // Update ASVS compliance status
  async updateASVSStatus(
    itemId: string,
    status: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review',
    evidence?: string,
    notes?: string,
    checkedBy?: string
  ): Promise<boolean> {
    try {
      logger.info(`ASVS item ${itemId} status updated to ${status} by ${checkedBy}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update ASVS status for ${itemId}:`, error);
      return false;
    }
  }

  // Rotate secret
  async rotateSecret(secretId: string, rotatedBy: string): Promise<boolean> {
    try {
      logger.info(`Secret ${secretId} rotated by ${rotatedBy}`);
      return true;
    } catch (error) {
      logger.error(`Failed to rotate secret ${secretId}:`, error);
      return false;
    }
  }

  // Update incident status
  async updateIncidentStatus(
    incidentId: string,
    status: 'open' | 'investigating' | 'resolved' | 'closed',
    resolution?: string,
    updatedBy?: string
  ): Promise<boolean> {
    try {
      logger.info(`Incident ${incidentId} status updated to ${status} by ${updatedBy}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update incident ${incidentId}:`, error);
      return false;
    }
  }

  // Execute runbook
  async executeRunbook(runbookId: string, executedBy: string): Promise<boolean> {
    try {
      logger.info(`Runbook ${runbookId} executed by ${executedBy}`);
      return true;
    } catch (error) {
      logger.error(`Failed to execute runbook ${runbookId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const securityComplianceService = SecurityComplianceService.getInstance();
























