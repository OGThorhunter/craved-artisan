import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  status: 'OK' | 'WARN' | 'CRIT';
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  lastUpdated?: Date;
}

export default function KpiCard({
  title,
  icon: Icon,
  status,
  value,
  subtitle,
  trend,
  trendValue,
  lastUpdated
}: KpiCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'WARN': return 'text-yellow-600 bg-yellow-100';
      case 'CRIT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-[#4b4b4b]" />
        <span className="text-sm font-medium text-[#2b2b2b]">{title}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-[#2b2b2b]">{value}</div>
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>

        {subtitle && (
          <p className="text-xs text-[#4b4b4b]">{subtitle}</p>
        )}

        {trend && trendValue && (
          <p className={`text-xs font-medium ${getTrendColor(trend)}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </p>
        )}

        {lastUpdated && (
          <p className="text-xs text-[#4b4b4b]">
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </Card>
  );
}

