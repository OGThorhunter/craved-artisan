import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Server,
  Zap,
  Mail,
  Siren,
  Code,
  Network,
  FileText,
  DollarSign,
  BookOpen
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';
import HealthIncidentsView from './ops/HealthIncidentsView';
import DeploysConfigView from './ops/DeploysConfigView';
import JobsQueuesView from './ops/JobsQueuesView';
import WebhooksIntegrationsView from './ops/WebhooksIntegrationsView';
import CacheSearchView from './ops/CacheSearchView';
import DatabaseBackupsView from './ops/DatabaseBackupsView';
import LogsTracesView from './ops/LogsTracesView';
import CostUsageView from './ops/CostUsageView';
import RunbooksToolsView from './ops/RunbooksToolsView';

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  processingRate: number;
  avgWaitTime: number;
  oldestJob?: Date;
  newestJob?: Date;
}

interface QueueHealth {
  status: 'OK' | 'WARN' | 'CRIT';
  totalQueues: number;
  healthyQueues: number;
  warningQueues: number;
  criticalQueues: number;
  totalJobs: number;
  failedJobs: number;
  avgWaitTime: number;
}

interface DatabaseStats {
  connectionCount: number;
  activeConnections: number;
  idleConnections: number;
  cacheHitRatio: number;
  indexHitRatio: number;
  deadlocks: number;
  slowQueries: number;
  tableStats: TableStats[];
  indexStats: IndexStats[];
  slowestQueries: SlowQuery[];
}

interface TableStats {
  tableName: string;
  rowCount: number;
  size: number;
  indexSize: number;
  lastVacuum?: Date;
  lastAnalyze?: Date;
  bloatEstimate: number;
}

interface IndexStats {
  tableName: string;
  indexName: string;
  size: number;
  usageCount: number;
  lastUsed?: Date;
  isUnused: boolean;
}

interface SlowQuery {
  query: string;
  avgTime: number;
  calls: number;
  totalTime: number;
  meanTime: number;
}

interface VectorStats {
  totalVectors: number;
  staleVectors: number;
  indexType: string;
  indexSize: number;
  lastAnalyze?: Date;
  recallTest: number;
  embeddingBacklog: number;
}

interface DatabaseHealth {
  status: 'OK' | 'WARN' | 'CRIT';
  connectionHealth: 'OK' | 'WARN' | 'CRIT';
  cacheHealth: 'OK' | 'WARN' | 'CRIT';
  queryHealth: 'OK' | 'WARN' | 'CRIT';
  summary: {
    connections: number;
    cacheHitRatio: number;
    slowQueries: number;
    deadlocks: number;
  };
}

type OpsSubView = 'health' | 'deploys' | 'jobs' | 'webhooks' | 'cache' | 'database' | 'logs' | 'costs' | 'runbooks';

export default function OperationsDashboard() {
  const [selectedView, setSelectedView] = useState<OpsSubView>('health');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch health KPI data for top bar
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['admin', 'ops', 'health'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 15000, // Refresh every 15 seconds for KPIs
  });

  // Fetch queue data
  const { data: queueData, isLoading: queueLoading, refetch: refetchQueues } = useQuery({
    queryKey: ['admin', 'ops', 'queues'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/queues');
      if (!response.ok) throw new Error('Failed to fetch queue data');
      const result = await response.json();
      return {
        queues: result.data.queues as QueueStats[],
        health: result.data.health as QueueHealth
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch database data
  const { data: dbData, isLoading: dbLoading, refetch: refetchDB } = useQuery({
    queryKey: ['admin', 'ops', 'database'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/db/health');
      if (!response.ok) throw new Error('Failed to fetch database data');
      const result = await response.json();
      return {
        stats: result.data.stats as DatabaseStats,
        health: result.data.health as DatabaseHealth,
        vector: result.data.vector as VectorStats
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch failed jobs for selected queue
  const { data: failedJobsData } = useQuery({
    queryKey: ['admin', 'ops', 'queues', selectedQueue, 'failed'],
    queryFn: async () => {
      if (!selectedQueue) return { failedJobs: [] };
      const response = await fetch(`/api/admin/ops/queues/${selectedQueue}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch failed jobs');
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedQueue,
  });

  // Queue action mutations
  const queueActionMutation = useMutation({
    mutationFn: async ({ queueName, action, jobId }: { queueName: string; action: string; jobId?: string }) => {
      const response = await fetch('/api/admin/ops/queues/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueName, action, jobId }),
      });
      if (!response.ok) throw new Error('Failed to perform queue action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'queues'] });
    },
  });

  // Database maintenance mutation
  const dbMaintenanceMutation = useMutation({
    mutationFn: async ({ action, tableName }: { action: string; tableName?: string }) => {
      const response = await fetch('/api/admin/ops/db/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tableName }),
      });
      if (!response.ok) throw new Error('Failed to perform maintenance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'database'] });
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'WARN': return 'text-yellow-600 bg-yellow-100';
      case 'CRIT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefresh = () => {
    refetchHealth();
    refetchQueues();
    refetchDB();
    setLastRefresh(new Date());
  };

  /* Old rendering functions removed - replaced by sub-view components */

  if (healthLoading || queueLoading || dbLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Operations Control Center</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Operations Control Center</h2>
          <p className="text-[#4b4b4b] mt-1">Live monitoring, health checks, and operational tools</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#4b4b4b]">
            cached @ {formatTime(lastRefresh)}
          </span>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* API Health */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-[#4b4b4b]" />
            <span className="text-sm font-medium text-[#2b2b2b]">API Health</span>
          </div>
          {healthData?.api && (
            <div>
              <Badge className={getStatusColor(healthData.api.status)}>
                {healthData.api.status}
              </Badge>
              <p className="text-xs text-[#4b4b4b] mt-2">
                p95: {healthData.api.latencyP95}ms
              </p>
            </div>
          )}
        </Card>

        {/* Queue Health */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-[#4b4b4b]" />
            <span className="text-sm font-medium text-[#2b2b2b]">Queues</span>
          </div>
          {healthData?.queue && (
            <div>
              <Badge className={getStatusColor(healthData.queue.status)}>
                {healthData.queue.status}
              </Badge>
              <p className="text-xs text-[#4b4b4b] mt-2">
                {healthData.queue.totalJobs} jobs
              </p>
            </div>
          )}
        </Card>

        {/* Database Health */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-[#4b4b4b]" />
            <span className="text-sm font-medium text-[#2b2b2b]">Database</span>
          </div>
          {healthData?.database && (
            <div>
              <Badge className={getStatusColor(healthData.database.status)}>
                {healthData.database.status}
              </Badge>
              <p className="text-xs text-[#4b4b4b] mt-2">
                {healthData.database.summary?.connections} conns
              </p>
            </div>
          )}
        </Card>

        {/* Cache Health */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-[#4b4b4b]" />
            <span className="text-sm font-medium text-[#2b2b2b]">Cache</span>
          </div>
          {healthData?.cache && (
            <div>
              <Badge className={getStatusColor(healthData.cache.status)}>
                {healthData.cache.status}
              </Badge>
              <p className="text-xs text-[#4b4b4b] mt-2">
                {healthData.cache.hitRate.toFixed(1)}% hits
              </p>
            </div>
          )}
        </Card>

        {/* Email Health */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-[#4b4b4b]" />
            <span className="text-sm font-medium text-[#2b2b2b]">Email</span>
          </div>
          {healthData?.email && (
            <div>
              <Badge className={getStatusColor(healthData.email.status)}>
                {healthData.email.status}
              </Badge>
              <p className="text-xs text-[#4b4b4b] mt-2">
                {healthData.email.providers?.[0]?.successRate.toFixed(1)}% OK
              </p>
            </div>
          )}
        </Card>

        {/* Incidents */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Siren className="h-4 w-4 text-[#4b4b4b]" />
            <span className="text-sm font-medium text-[#2b2b2b]">Incidents</span>
          </div>
          {healthData?.incidents && (
            <div>
              <Badge className={healthData.incidents.open > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}>
                {healthData.incidents.open} open
              </Badge>
              <p className="text-xs text-[#4b4b4b] mt-2">
                MTTR: {healthData.incidents.mttr}m
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Sub-View Tabs */}
      <div className="border-b border-[#7F232E]/20">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'health', label: 'Health & Incidents', icon: CheckCircle },
            { id: 'deploys', label: 'Deploys & Config', icon: Code },
            { id: 'jobs', label: 'Jobs & Queues', icon: Activity },
            { id: 'webhooks', label: 'Webhooks', icon: Network },
            { id: 'cache', label: 'Cache & Search', icon: Zap },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'logs', label: 'Logs & Traces', icon: FileText },
            { id: 'costs', label: 'Costs & Usage', icon: DollarSign },
            { id: 'runbooks', label: 'Runbooks & Tools', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as OpsSubView)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  selectedView === tab.id
                    ? 'border-[#7F232E] text-[#7F232E] font-medium'
                    : 'border-transparent text-[#4b4b4b] hover:text-[#7F232E]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-View Content */}
      <div className="min-h-[600px]">
        {selectedView === 'health' && <HealthIncidentsView />}
        {selectedView === 'deploys' && <DeploysConfigView />}
        {selectedView === 'jobs' && <JobsQueuesView />}
        {selectedView === 'webhooks' && <WebhooksIntegrationsView />}
        {selectedView === 'cache' && <CacheSearchView />}
        {selectedView === 'database' && <DatabaseBackupsView />}
        {selectedView === 'logs' && <LogsTracesView />}
        {selectedView === 'costs' && <CostUsageView />}
        {selectedView === 'runbooks' && <RunbooksToolsView />}
      </div>
    </div>
  );
}
