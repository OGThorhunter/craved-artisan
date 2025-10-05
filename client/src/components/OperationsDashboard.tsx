import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Cpu,
  Network,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

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

export default function OperationsDashboard() {
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'queues' | 'database' | 'vector'>('queues');
  const queryClient = useQueryClient();

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'success';
      case 'WARN': return 'warning';
      case 'CRIT': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'CRIT': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderQueuesTab = () => (
    <div className="space-y-6">
      {/* Queue Health Overview */}
      {queueData?.health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                queueData.health.status === 'OK' ? 'bg-green-100' :
                queueData.health.status === 'WARN' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {getStatusIcon(queueData.health.status)}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b2b2b]">{queueData.health.status}</p>
                <p className="text-sm text-[#4b4b4b]">Queue Health</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{queueData.health.totalJobs}</p>
              <p className="text-sm text-[#4b4b4b]">Total Jobs</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{queueData.health.failedJobs}</p>
              <p className="text-sm text-[#4b4b4b]">Failed Jobs</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{formatTime(queueData.health.avgWaitTime)}</p>
              <p className="text-sm text-[#4b4b4b]">Avg Wait Time</p>
            </div>
          </Card>
        </div>
      )}

      {/* Queue Details */}
      {queueData?.queues && (
        <div>
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Queue Details</h3>
          <div className="space-y-4">
            {queueData.queues.map((queue, index) => (
              <motion.div
                key={queue.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-[#2b2b2b] capitalize">{queue.name}</h4>
                      {queue.paused && (
                        <Badge variant="warning">Paused</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedQueue(selectedQueue === queue.name ? '' : queue.name);
                        }}
                        className="text-sm"
                      >
                        {selectedQueue === queue.name ? 'Hide' : 'Show'} Jobs
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={() => queueActionMutation.mutate({
                          queueName: queue.name,
                          action: queue.paused ? 'resume' : 'pause'
                        })}
                        disabled={queueActionMutation.isPending}
                        className="text-sm"
                      >
                        {queue.paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{queue.waiting}</p>
                      <p className="text-sm text-[#4b4b4b]">Waiting</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{queue.active}</p>
                      <p className="text-sm text-[#4b4b4b]">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">{queue.completed}</p>
                      <p className="text-sm text-[#4b4b4b]">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{queue.failed}</p>
                      <p className="text-sm text-[#4b4b4b]">Failed</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[#4b4b4b]">Processing Rate:</span>
                      <span className="font-medium ml-1">{queue.processingRate.toFixed(1)}/min</span>
                    </div>
                    <div>
                      <span className="text-[#4b4b4b]">Avg Wait:</span>
                      <span className="font-medium ml-1">{formatTime(queue.avgWaitTime)}</span>
                    </div>
                    <div>
                      <span className="text-[#4b4b4b]">Delayed:</span>
                      <span className="font-medium ml-1">{queue.delayed}</span>
                    </div>
                    <div>
                      <span className="text-[#4b4b4b]">Oldest Job:</span>
                      <span className="font-medium ml-1">
                        {queue.oldestJob ? formatTime((Date.now() - queue.oldestJob.getTime()) / 1000) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Failed Jobs */}
      {selectedQueue && failedJobsData?.failedJobs && (
        <div>
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Failed Jobs - {selectedQueue}</h3>
          <div className="space-y-3">
            {failedJobsData.failedJobs.map((job: any) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2b2b2b]">{job.name}</p>
                    <p className="text-sm text-[#4b4b4b]">
                      {job.failedReason} • Attempts: {job.attemptsMade}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => queueActionMutation.mutate({
                        queueName: selectedQueue,
                        action: 'retry',
                        jobId: job.id
                      })}
                      disabled={queueActionMutation.isPending}
                      className="text-sm"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => queueActionMutation.mutate({
                        queueName: selectedQueue,
                        action: 'remove',
                        jobId: job.id
                      })}
                      disabled={queueActionMutation.isPending}
                      className="text-sm text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDatabaseTab = () => (
    <div className="space-y-6">
      {/* Database Health Overview */}
      {dbData?.health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dbData.health.status === 'OK' ? 'bg-green-100' :
                dbData.health.status === 'WARN' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {getStatusIcon(dbData.health.status)}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.health.status}</p>
                <p className="text-sm text-[#4b4b4b]">DB Health</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.health.summary.connections}</p>
              <p className="text-sm text-[#4b4b4b]">Connections</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.health.summary.cacheHitRatio.toFixed(1)}%</p>
              <p className="text-sm text-[#4b4b4b]">Cache Hit Ratio</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{dbData.health.summary.slowQueries}</p>
              <p className="text-sm text-[#4b4b4b]">Slow Queries</p>
            </div>
          </Card>
        </div>
      )}

      {/* Database Statistics */}
      {dbData?.stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Table Statistics</h3>
            <div className="space-y-3">
              {dbData.stats.tableStats.slice(0, 10).map((table, index) => (
                <motion.div
                  key={table.tableName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#2b2b2b]">{table.tableName}</p>
                        <p className="text-sm text-[#4b4b4b]">
                          {table.rowCount.toLocaleString()} rows • {formatBytes(table.size)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#2b2b2b]">
                          {table.bloatEstimate.toFixed(1)}% bloat
                        </p>
                        <Badge variant={table.bloatEstimate > 20 ? 'destructive' : table.bloatEstimate > 10 ? 'warning' : 'success'}>
                          {table.bloatEstimate > 20 ? 'High' : table.bloatEstimate > 10 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Slow Queries */}
          <div>
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Slow Queries</h3>
            <div className="space-y-3">
              {dbData.stats.slowestQueries.slice(0, 5).map((query, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="warning">{query.avgTime.toFixed(0)}ms avg</Badge>
                      <span className="text-sm text-[#4b4b4b]">{query.calls} calls</span>
                    </div>
                    <p className="text-sm text-[#4b4b4b] font-mono break-all">
                      {query.query.length > 100 ? `${query.query.substring(0, 100)}...` : query.query}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Database Maintenance */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Database Maintenance</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => dbMaintenanceMutation.mutate({ action: 'vacuum' })}
            disabled={dbMaintenanceMutation.isPending}
          >
            <HardDrive className="h-4 w-4 mr-2" />
            Vacuum
          </Button>
          <Button
            variant="secondary"
            onClick={() => dbMaintenanceMutation.mutate({ action: 'analyze' })}
            disabled={dbMaintenanceMutation.isPending}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>
      </div>
    </div>
  );

  const renderVectorTab = () => (
    <div className="space-y-6">
      {/* Vector Health Overview */}
      {dbData?.vector && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.vector.totalVectors}</p>
              <p className="text-sm text-[#4b4b4b]">Total Vectors</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.vector.indexType}</p>
              <p className="text-sm text-[#4b4b4b]">Index Type</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.vector.recallTest.toFixed(1)}%</p>
              <p className="text-sm text-[#4b4b4b]">Recall Test</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b2b2b]">{dbData.vector.staleVectors}</p>
              <p className="text-sm text-[#4b4b4b]">Stale Vectors</p>
            </div>
          </Card>
        </div>
      )}

      {/* Vector Statistics */}
      {dbData?.vector && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Vector Database Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#4b4b4b]">Index Size:</span>
                  <span className="font-medium">{formatBytes(dbData.vector.indexSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4b4b4b]">Embedding Backlog:</span>
                  <span className="font-medium">{dbData.vector.embeddingBacklog}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4b4b4b]">Last Analyze:</span>
                  <span className="font-medium">
                    {dbData.vector.lastAnalyze ? new Date(dbData.vector.lastAnalyze).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  dbData.vector.recallTest > 95 ? 'bg-green-100' :
                  dbData.vector.recallTest > 90 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Zap className={`h-8 w-8 ${
                    dbData.vector.recallTest > 95 ? 'text-green-600' :
                    dbData.vector.recallTest > 90 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <p className="text-sm text-[#4b4b4b]">Vector Performance</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  if (queueLoading || dbLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Operations</h2>
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
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
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Operations</h2>
          <p className="text-[#4b4b4b] mt-1">Queue management, database health, and system performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            {(['queues', 'database', 'vector'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                  selectedTab === tab
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
              refetchQueues();
              refetchDB();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'queues' && renderQueuesTab()}
      {selectedTab === 'database' && renderDatabaseTab()}
      {selectedTab === 'vector' && renderVectorTab()}
    </div>
  );
}
