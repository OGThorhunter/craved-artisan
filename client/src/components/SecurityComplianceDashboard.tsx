import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Key,
  Database,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

interface ASVSChecklist {
  id: string;
  category: string;
  requirement: string;
  description: string;
  level: 'L1' | 'L2' | 'L3';
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
  evidence?: string;
  notes?: string;
  lastChecked: Date;
  checkedBy?: string;
}

interface SecretItem {
  id: string;
  name: string;
  type: string;
  environment: 'development' | 'staging' | 'production';
  location: string;
  lastRotated?: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'compromised' | 'deprecated';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  accessCount: number;
  lastAccessed?: Date;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: string;
  affectedSystems: string[];
  reportedBy: string;
  assignedTo?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  rootCause?: string;
  resolution?: string;
  tags: string[];
}

interface Runbook {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: RunbookStep[];
  prerequisites: string[];
  estimatedDuration: number;
  lastExecuted?: Date;
  executedBy?: string;
  successRate: number;
  tags: string[];
  isActive: boolean;
}

interface RunbookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  command?: string;
  expectedOutcome: string;
  timeout?: number;
  retryCount?: number;
  isCritical: boolean;
}

interface SecurityMetrics {
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
    averageResolutionTime: number;
    mttr: number;
    mtbf: number;
  };
  runbooks: {
    totalRunbooks: number;
    activeRunbooks: number;
    executedThisMonth: number;
    averageSuccessRate: number;
  };
}

export default function SecurityComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<'asvs' | 'secrets' | 'incidents' | 'runbooks'>('asvs');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch security metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['admin', 'security-compliance', 'metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security-compliance/metrics');
      if (!response.ok) throw new Error('Failed to fetch security metrics');
      const result = await response.json();
      return result.data as SecurityMetrics;
    },
    refetchInterval: 300000,
  });

  // Fetch ASVS checklist
  const { data: asvsData, refetch: refetchASVS } = useQuery({
    queryKey: ['admin', 'security-compliance', 'asvs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security-compliance/asvs');
      if (!response.ok) throw new Error('Failed to fetch ASVS checklist');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch secrets inventory
  const { data: secretsData, refetch: refetchSecrets } = useQuery({
    queryKey: ['admin', 'security-compliance', 'secrets'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security-compliance/secrets');
      if (!response.ok) throw new Error('Failed to fetch secrets inventory');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch incidents
  const { data: incidentsData, refetch: refetchIncidents } = useQuery({
    queryKey: ['admin', 'security-compliance', 'incidents'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security-compliance/incidents');
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch runbooks
  const { data: runbooksData, refetch: refetchRunbooks } = useQuery({
    queryKey: ['admin', 'security-compliance', 'runbooks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security-compliance/runbooks');
      if (!response.ok) throw new Error('Failed to fetch runbooks');
      const result = await response.json();
      return result.data;
    },
  });

  // Update ASVS status mutation
  const updateASVSMutation = useMutation({
    mutationFn: async ({ itemId, status, evidence, notes }: { itemId: string; status: string; evidence?: string; notes?: string }) => {
      const response = await fetch(`/api/admin/security-compliance/asvs/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, evidence, notes }),
      });
      if (!response.ok) throw new Error('Failed to update ASVS status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'asvs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'metrics'] });
    },
  });

  // Rotate secret mutation
  const rotateSecretMutation = useMutation({
    mutationFn: async (secretId: string) => {
      const response = await fetch(`/api/admin/security-compliance/secrets/${secretId}/rotate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to rotate secret');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'secrets'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'metrics'] });
    },
  });

  // Update incident status mutation
  const updateIncidentMutation = useMutation({
    mutationFn: async ({ incidentId, status, resolution }: { incidentId: string; status: string; resolution?: string }) => {
      const response = await fetch(`/api/admin/security-compliance/incidents/${incidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution }),
      });
      if (!response.ok) throw new Error('Failed to update incident status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'metrics'] });
    },
  });

  // Execute runbook mutation
  const executeRunbookMutation = useMutation({
    mutationFn: async (runbookId: string) => {
      const response = await fetch(`/api/admin/security-compliance/runbooks/${runbookId}/execute`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to execute runbook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'runbooks'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'security-compliance', 'metrics'] });
    },
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'active': return 'success';
      case 'resolved': return 'success';
      case 'closed': return 'success';
      case 'non_compliant': return 'destructive';
      case 'expired': return 'destructive';
      case 'compromised': return 'destructive';
      case 'under_review': return 'warning';
      case 'investigating': return 'warning';
      case 'open': return 'warning';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const renderASVSTab = () => (
    <div className="space-y-6">
      {asvsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {asvsData.items.map((item: ASVSChecklist, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedItem?.id === item.id ? 'ring-2 ring-[#7F232E]' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{item.requirement}</h3>
                      <p className="text-sm text-[#4b4b4b] capitalize">{item.category.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(item.status) as any}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary">
                        {item.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#4b4b4b] mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-[#4b4b4b]">
                    <span>Last checked: {formatDate(item.lastChecked)}</span>
                    {item.checkedBy && <span>By: {item.checkedBy}</span>}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            {selectedItem ? (
              <Card className="p-6 sticky top-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2b2b2b]">ASVS Details</h3>
                    <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-[#2b2b2b]">{selectedItem.requirement}</h4>
                      <p className="text-sm text-[#4b4b4b]">{selectedItem.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#4b4b4b]">Category:</span>
                        <p className="font-medium capitalize">{selectedItem.category.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-[#4b4b4b]">Level:</span>
                        <p className="font-medium">{selectedItem.level}</p>
                      </div>
                    </div>
                    
                    {selectedItem.evidence && (
                      <div>
                        <span className="text-[#4b4b4b] text-sm">Evidence:</span>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedItem.evidence}</p>
                      </div>
                    )}
                    
                    {selectedItem.notes && (
                      <div>
                        <span className="text-[#4b4b4b] text-sm">Notes:</span>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-[#2b2b2b] mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => updateASVSMutation.mutate({
                          itemId: selectedItem.id,
                          status: 'compliant',
                          evidence: 'Verified compliance'
                        })}
                        disabled={updateASVSMutation.isPending}
                        className="text-sm"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compliant
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => updateASVSMutation.mutate({
                          itemId: selectedItem.id,
                          status: 'non_compliant',
                          notes: 'Non-compliance identified'
                        })}
                        disabled={updateASVSMutation.isPending}
                        className="text-sm"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Non-Compliant
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-[#4b4b4b]">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an ASVS item to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSecretsTab = () => (
    <div className="space-y-6">
      {secretsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {secretsData.secrets.map((secret: SecretItem, index: number) => (
              <motion.div
                key={secret.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{secret.name}</h3>
                      <p className="text-sm text-[#4b4b4b] capitalize">{secret.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(secret.status) as any}>
                        {secret.status}
                      </Badge>
                      <Badge variant={getRiskColor(secret.riskLevel) as any}>
                        {secret.riskLevel} risk
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-[#4b4b4b]">
                    <div className="flex items-center justify-between">
                      <span>Environment:</span>
                      <span className="font-medium capitalize">{secret.environment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{secret.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access Count:</span>
                      <span className="font-medium">{secret.accessCount}</span>
                    </div>
                    {secret.lastRotated && (
                      <div className="flex items-center justify-between">
                        <span>Last Rotated:</span>
                        <span className="font-medium">{formatDate(secret.lastRotated)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button
                      variant="secondary"
                      onClick={() => rotateSecretMutation.mutate(secret.id)}
                      disabled={rotateSecretMutation.isPending}
                      className="w-full text-sm"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Rotate Secret
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Secrets Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Secrets</span>
                  <span className="font-medium">{metrics?.secrets.totalSecrets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Active Secrets</span>
                  <span className="font-medium text-green-600">{metrics?.secrets.activeSecrets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Expired Secrets</span>
                  <span className="font-medium text-red-600">{metrics?.secrets.expiredSecrets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">High Risk</span>
                  <span className="font-medium text-orange-600">{metrics?.secrets.highRiskSecrets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Last Rotation</span>
                  <span className="font-medium">{metrics?.secrets.lastRotation ? formatDate(metrics.secrets.lastRotation) : 'Never'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderIncidentsTab = () => (
    <div className="space-y-6">
      {incidentsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {incidentsData.incidents.map((incident: Incident, index: number) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{incident.title}</h3>
                      <p className="text-sm text-[#4b4b4b] capitalize">{incident.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(incident.severity) as any}>
                        {incident.severity}
                      </Badge>
                      <Badge variant={getStatusColor(incident.status) as any}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#4b4b4b] mb-3">{incident.description}</p>
                  
                  <div className="space-y-2 text-sm text-[#4b4b4b]">
                    <div className="flex items-center justify-between">
                      <span>Detected:</span>
                      <span className="font-medium">{formatDate(incident.detectedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reported by:</span>
                      <span className="font-medium">{incident.reportedBy}</span>
                    </div>
                    {incident.assignedTo && (
                      <div className="flex items-center justify-between">
                        <span>Assigned to:</span>
                        <span className="font-medium">{incident.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Affected Systems:</span>
                      <span className="font-medium">{incident.affectedSystems.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => updateIncidentMutation.mutate({
                          incidentId: incident.id,
                          status: 'investigating'
                        })}
                        disabled={updateIncidentMutation.isPending}
                        className="text-sm flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Investigate
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => updateIncidentMutation.mutate({
                          incidentId: incident.id,
                          status: 'resolved',
                          resolution: 'Incident resolved'
                        })}
                        disabled={updateIncidentMutation.isPending}
                        className="text-sm flex-1"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Incidents Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Incidents</span>
                  <span className="font-medium">{metrics?.incidents.totalIncidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Open Incidents</span>
                  <span className="font-medium text-orange-600">{metrics?.incidents.openIncidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Critical Incidents</span>
                  <span className="font-medium text-red-600">{metrics?.incidents.criticalIncidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Avg Resolution</span>
                  <span className="font-medium">{metrics?.incidents.averageResolutionTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">MTTR</span>
                  <span className="font-medium">{metrics?.incidents.mttr}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">MTBF</span>
                  <span className="font-medium">{metrics?.incidents.mtbf}h</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderRunbooksTab = () => (
    <div className="space-y-6">
      {runbooksData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {runbooksData.runbooks.map((runbook: Runbook, index: number) => (
              <motion.div
                key={runbook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{runbook.title}</h3>
                      <p className="text-sm text-[#4b4b4b] capitalize">{runbook.category.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(runbook.severity) as any}>
                        {runbook.severity}
                      </Badge>
                      <Badge variant={runbook.isActive ? 'success' : 'secondary'}>
                        {runbook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#4b4b4b] mb-3">{runbook.description}</p>
                  
                  <div className="space-y-2 text-sm text-[#4b4b4b]">
                    <div className="flex items-center justify-between">
                      <span>Steps:</span>
                      <span className="font-medium">{runbook.steps.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{runbook.estimatedDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{runbook.successRate}%</span>
                    </div>
                    {runbook.lastExecuted && (
                      <div className="flex items-center justify-between">
                        <span>Last Executed:</span>
                        <span className="font-medium">{formatDate(runbook.lastExecuted)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button
                      variant="secondary"
                      onClick={() => executeRunbookMutation.mutate(runbook.id)}
                      disabled={executeRunbookMutation.isPending || !runbook.isActive}
                      className="w-full text-sm"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute Runbook
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Runbooks Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Runbooks</span>
                  <span className="font-medium">{metrics?.runbooks.totalRunbooks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Active Runbooks</span>
                  <span className="font-medium text-green-600">{metrics?.runbooks.activeRunbooks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Executed This Month</span>
                  <span className="font-medium">{metrics?.runbooks.executedThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Avg Success Rate</span>
                  <span className="font-medium">{metrics?.runbooks.averageSuccessRate}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Security & Compliance</h2>
          <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Security & Compliance</h2>
          <p className="text-[#4b4b4b] mt-1">ASVS compliance, secrets management, incident tracking, and runbooks</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            {(['asvs', 'secrets', 'incidents', 'runbooks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#7F232E] text-white'
                    : 'text-[#4b4b4b] hover:text-[#7F232E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              refetchMetrics();
              refetchASVS();
              refetchSecrets();
              refetchIncidents();
              refetchRunbooks();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">ASVS Compliance</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.asvs.complianceRate}%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Active Secrets</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.secrets.activeSecrets}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Open Incidents</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.incidents.openIncidents}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Active Runbooks</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.runbooks.activeRunbooks}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'asvs' && renderASVSTab()}
      {activeTab === 'secrets' && renderSecretsTab()}
      {activeTab === 'incidents' && renderIncidentsTab()}
      {activeTab === 'runbooks' && renderRunbooksTab()}
    </div>
  );
}

























