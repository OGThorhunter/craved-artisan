import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Users, AlertCircle } from 'lucide-react';
import Card from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export default function IncidentKPIs() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['admin', 'ops', 'incidents', 'kpis'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/incidents/kpis');
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV1': return 'bg-red-100 text-red-800 border-red-300';
      case 'SEV2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'SEV3': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SEV4': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totalOpen = Object.values(kpis.openBySeverity).reduce((sum: number, count: any) => sum + count, 0);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Incidents by Severity */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#4b4b4b]">Open Incidents</h4>
            <AlertTriangle className="h-5 w-5 text-[#7F232E]" />
          </div>
          <div className="text-2xl font-bold text-[#2b2b2b] mb-3">{totalOpen}</div>
          <div className="space-y-1">
            {Object.entries(kpis.openBySeverity).map(([severity, count]: [string, any]) => (
              count > 0 && (
                <div key={severity} className="flex items-center justify-between text-xs">
                  <Badge className={`${getSeverityColor(severity)} text-xs px-2 py-0.5`}>
                    {severity}
                  </Badge>
                  <span className="font-medium text-[#2b2b2b]">{count}</span>
                </div>
              )
            ))}
            {totalOpen === 0 && (
              <p className="text-xs text-green-600">All clear!</p>
            )}
          </div>
        </Card>

        {/* MTTM / MTTR */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#4b4b4b]">Response Times</h4>
            <Clock className="h-5 w-5 text-[#4b4b4b]" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-[#4b4b4b]">MTTM (Mitigation)</div>
              <div className="text-xl font-bold text-[#2b2b2b]">
                {kpis.mttm > 0 ? formatDuration(kpis.mttm) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#4b4b4b]">MTTR (Resolution)</div>
              <div className="text-xl font-bold text-[#2b2b2b]">
                {kpis.mttr > 0 ? formatDuration(kpis.mttr) : 'N/A'}
              </div>
            </div>
          </div>
        </Card>

        {/* SLA Breaches */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#4b4b4b]">SLA Breaches</h4>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold mb-1">
            <span className={kpis.slaBreaches > 0 ? 'text-red-600' : 'text-green-600'}>
              {kpis.slaBreaches}
            </span>
          </div>
          <p className="text-xs text-[#4b4b4b]">Today</p>
          {kpis.slaBreaches > 0 && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Needs attention
            </Badge>
          )}
        </Card>

        {/* On-Call */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#4b4b4b]">On-Call Now</h4>
            <Users className="h-5 w-5 text-[#4b4b4b]" />
          </div>
          <div className="mb-1">
            <div className="font-semibold text-[#2b2b2b]">{kpis.onCall.name}</div>
            <div className="text-sm text-[#4b4b4b]">{kpis.onCall.contact}</div>
          </div>
          <Badge variant="secondary" className="text-xs mt-2">
            Primary responder
          </Badge>
        </Card>
      </div>

      {/* Cached timestamp */}
      <div className="text-xs text-[#4b4b4b] text-right">
        Cached @ {new Date(kpis.cachedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}

