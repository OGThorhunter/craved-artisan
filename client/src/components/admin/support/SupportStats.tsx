import React from 'react';
import { Inbox, AlertCircle, TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react';

interface SupportStatsProps {
  stats: {
    openCount: number;
    unresolvedCount: number;
    escalatedCount: number;
    todayCount: number;
    criticalCount: number;
    unassignedCount: number;
    slaComplianceRate: number;
  };
}

export function SupportStats({ stats }: SupportStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <StatCard
        label="Open Tickets"
        value={stats.openCount}
        icon={<Inbox className="w-5 h-5" />}
        color="blue"
      />
      
      <StatCard
        label="Unresolved"
        value={stats.unresolvedCount}
        icon={<Clock className="w-5 h-5" />}
        color="yellow"
      />
      
      <StatCard
        label="Escalated"
        value={stats.escalatedCount}
        icon={<AlertCircle className="w-5 h-5" />}
        color="red"
      />
      
      <StatCard
        label="Today"
        value={stats.todayCount}
        icon={<TrendingUp className="w-5 h-5" />}
        color="purple"
      />
      
      <StatCard
        label="Critical"
        value={stats.criticalCount}
        icon={<Zap className="w-5 h-5" />}
        color="orange"
      />
      
      <StatCard
        label="Unassigned"
        value={stats.unassignedCount}
        icon={<Inbox className="w-5 h-5" />}
        color="gray"
      />
      
      <StatCard
        label="SLA Compliance"
        value={`${stats.slaComplianceRate}%`}
        icon={<CheckCircle className="w-5 h-5" />}
        color="green"
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'red' | 'purple' | 'orange' | 'gray' | 'green';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

