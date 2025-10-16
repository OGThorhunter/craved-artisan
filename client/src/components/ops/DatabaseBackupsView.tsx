import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, HardDrive, BarChart3, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import ConfirmActionDialog from './ConfirmActionDialog';

export default function DatabaseBackupsView() {
  const [maintenanceDialog, setMaintenanceDialog] = useState<{
    open: boolean;
    action: string;
  }>({ open: false, action: '' });

  const queryClient = useQueryClient();

  const { data: dbData, refetch: refetchDB } = useQuery({
    queryKey: ['admin', 'ops', 'database'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/db/health');
      if (!response.ok) throw new Error('Failed to fetch database data');
      const result = await response.json();
      return {
        stats: result.data.stats,
        health: result.data.health,
        vector: result.data.vector
      };
    },
    refetchInterval: 60000
  });

  const dbMaintenanceMutation = useMutation({
    mutationFn: async ({ action, tableName }: { action: string; tableName?: string }) => {
      const response = await fetch('/api/admin/ops/db/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tableName })
      });
      if (!response.ok) throw new Error('Failed to perform maintenance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'database'] });
      setMaintenanceDialog({ open: false, action: '' });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'CRIT': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
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
              <p className="text-sm text-[#4b4b4b]">Cache Hit</p>
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

      {/* Live Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Live Metrics</h3>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[#4b4b4b] mb-1">Connections</p>
              <p className="text-2xl font-bold text-[#2b2b2b]">
                {dbData?.stats?.connectionCount || 0}
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">
                Active: {dbData?.stats?.activeConnections || 0} | Idle: {dbData?.stats?.idleConnections || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#4b4b4b] mb-1">Slow Queries</p>
              <p className="text-2xl font-bold text-yellow-600">
                {dbData?.stats?.slowQueries || 0}
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">Last 24 hours</p>
            </div>

            <div>
              <p className="text-sm text-[#4b4b4b] mb-1">Deadlocks</p>
              <p className="text-2xl font-bold text-red-600">
                {dbData?.stats?.deadlocks || 0}
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">Last 24 hours</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Table Statistics</h3>
        <div className="space-y-3">
          {dbData?.stats?.tableStats?.slice(0, 10).map((table: any, index: number) => (
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
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Slowest Queries</h3>
        <div className="space-y-3">
          {dbData?.stats?.slowestQueries?.slice(0, 5).map((query: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="warning">{query.avgTime.toFixed(0)}ms avg</Badge>
                <span className="text-sm text-[#4b4b4b]">{query.calls} calls</span>
              </div>
              <p className="text-sm text-[#4b4b4b] font-mono break-all">
                {query.query.length > 100 ? `${query.query.substring(0, 100)}...` : query.query}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Maintenance Tools */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Maintenance Tools</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setMaintenanceDialog({ open: true, action: 'vacuum' })}
            disabled={dbMaintenanceMutation.isPending}
          >
            <HardDrive className="h-4 w-4 mr-2" />
            Vacuum
          </Button>
          <Button
            variant="secondary"
            onClick={() => setMaintenanceDialog({ open: true, action: 'analyze' })}
            disabled={dbMaintenanceMutation.isPending}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          <Button
            variant="secondary"
            onClick={() => setMaintenanceDialog({ open: true, action: 'reindex' })}
            disabled={dbMaintenanceMutation.isPending}
          >
            <Database className="h-4 w-4 mr-2" />
            Reindex
          </Button>
        </div>
      </div>

      {/* Backups */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Backups</h3>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#4b4b4b]">Last Snapshot</p>
              <p className="text-lg font-medium text-[#2b2b2b]">
                {new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()}
              </p>
            </div>
            <Button variant="secondary">
              <Shield className="h-4 w-4 mr-2" />
              Initiate Backup
            </Button>
          </div>

          <div className="pt-4 border-t border-[#7F232E]/10">
            <p className="text-sm text-[#4b4b4b]">
              <strong>Retention Policy:</strong> Daily backups kept for 7 days, weekly for 4 weeks, monthly for 12 months
            </p>
          </div>
        </Card>
      </div>

      {/* Maintenance Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={maintenanceDialog.open}
        onClose={() => setMaintenanceDialog({ open: false, action: '' })}
        onConfirm={() => dbMaintenanceMutation.mutate({ action: maintenanceDialog.action })}
        title={`Run ${maintenanceDialog.action.toUpperCase()}`}
        description={`This will run ${maintenanceDialog.action} on the database. This may cause temporary performance impact.`}
        actionLabel={`Run ${maintenanceDialog.action}`}
        requireReason={false}
        isDangerous={false}
        isLoading={dbMaintenanceMutation.isPending}
      />
    </div>
  );
}

