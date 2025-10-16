import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Activity, Database, Zap, Mail, CreditCard, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import IncidentBoard from './IncidentBoard';

export default function HealthIncidentsView() {
  const { data: incidents } = useQuery({
    queryKey: ['admin', 'ops', 'incidents'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/incidents?active=true');
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  const serviceStatuses = [
    { name: 'API', icon: Server, status: 'OK', details: 'p95: 245ms, 0.05% errors' },
    { name: 'Worker', icon: Activity, status: 'OK', details: 'All workers healthy' },
    { name: 'Web', icon: Server, status: 'OK', details: 'Frontend serving normally' },
    { name: 'Database', icon: Database, status: 'OK', details: '12/100 connections' },
    { name: 'Redis', icon: Zap, status: 'OK', details: '92.5% hit rate' },
    { name: 'Email', icon: Mail, status: 'OK', details: '98.5% delivery rate' },
    { name: 'Stripe', icon: CreditCard, status: 'OK', details: 'Webhooks current' },
    { name: 'TaxJar', icon: FileText, status: 'OK', details: 'API responsive' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'WARN': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'CRIT': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <CheckCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'success';
      case 'WARN': return 'warning';
      case 'CRIT': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Status Cards */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceStatuses.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-[#4b4b4b]" />
                    <span className="font-medium text-[#2b2b2b]">{service.name}</span>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
                <Badge variant={getStatusColor(service.status) as any}>
                  {service.status}
                </Badge>
                <p className="text-xs text-[#4b4b4b] mt-2">{service.details}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SLOs */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Service Level Objectives (SLOs)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-[#2b2b2b] mb-3">Uptime</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">99.95%</span>
              <span className="text-sm text-[#4b4b4b]">/ 99.9% target</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full"></div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium text-[#2b2b2b] mb-3">p95 Latency</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">245ms</span>
              <span className="text-sm text-[#4b4b4b]">/ 500ms target</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-1/2"></div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium text-[#2b2b2b] mb-3">Error Budget</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">85%</span>
              <span className="text-sm text-[#4b4b4b]">remaining</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-5/6"></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Incidents */}
      <div>
        <IncidentBoard incidents={incidents || []} />
      </div>

      {/* Post-mortems */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Recent Post-mortems</h3>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[#7F232E]/10 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-[#2b2b2b]">Database Connection Pool Exhaustion</p>
                <p className="text-sm text-[#4b4b4b]">Oct 10, 2025 - SEV2</p>
              </div>
              <Badge variant="secondary">View Docs</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border border-[#7F232E]/10 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-[#2b2b2b]">Email Queue Backlog</p>
                <p className="text-sm text-[#4b4b4b]">Oct 5, 2025 - SEV3</p>
              </div>
              <Badge variant="secondary">View Docs</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

