import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Play, Pause, RotateCcw, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

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
}

export default function JobsQueuesView() {
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: queueData, refetch: refetchQueues } = useQuery({
    queryKey: ['admin', 'ops', 'queues'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/queues');
      if (!response.ok) throw new Error('Failed to fetch queue data');
      const result = await response.json();
      return {
        queues: result.data.queues as QueueStats[],
        health: result.data.health
      };
    },
    refetchInterval: 30000
  });

  const { data: failedJobsData } = useQuery({
    queryKey: ['admin', 'ops', 'queues', selectedQueue, 'failed'],
    queryFn: async () => {
      if (!selectedQueue) return { failedJobs: [] };
      const response = await fetch(`/api/admin/ops/queues/${selectedQueue}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch failed jobs');
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedQueue
  });

  const queueActionMutation = useMutation({
    mutationFn: async ({ queueName, action, jobId }: { queueName: string; action: string; jobId?: string }) => {
      const response = await fetch('/api/admin/ops/queues/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueName, action, jobId })
      });
      if (!response.ok) throw new Error('Failed to perform queue action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'queues'] });
    }
  });

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'CRIT': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
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
              <p className="text-sm text-[#4b4b4b]">Avg Wait</p>
            </div>
          </Card>
        </div>
      )}

      {/* Driver Indicator - Removed client-side process.env access */}

      {/* Queue Details */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Queue Details</h3>
        <div className="space-y-4">
          {queueData?.queues?.map((queue: QueueStats, index: number) => (
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
                    {queue.paused && <Badge variant="warning">Paused</Badge>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedQueue(selectedQueue === queue.name ? '' : queue.name)}
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
                      {queue.oldestJob ? formatTime((Date.now() - new Date(queue.oldestJob).getTime()) / 1000) : 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Failed Jobs */}
      {selectedQueue && failedJobsData?.failedJobs && failedJobsData.failedJobs.length > 0 && (
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
                      <RotateCcw className="h-3 w-3 mr-1" />
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
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Repeat Jobs Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Scheduled Jobs</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Last Run</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-[#2b2b2b]">Support SLA Check</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">Every 10 minutes</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">2 mins ago</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-[#2b2b2b]">Support Auto-Close</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">Daily at 2:00 AM</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">8 hours ago</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-[#2b2b2b]">Health Checks</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">Every 5 minutes</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">1 min ago</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-[#2b2b2b]">Audit Chain Verification</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">Weekly (Sunday 2 AM)</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">3 days ago</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

