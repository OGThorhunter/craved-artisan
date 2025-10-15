import React from 'react';
import { Clock, CheckCircle, Edit, Eye } from 'lucide-react';

interface FeeSchedule {
  id: string;
  name: string;
  scope: string;
  scopeRefId: string | null;
  takeRateBps: number | null;
  feeFloorCents: number | null;
  feeCapCents: number | null;
  version: number;
}

interface FeeScheduleTableProps {
  schedules: FeeSchedule[];
  onEdit?: (schedule: FeeSchedule) => void;
  onView?: (schedule: FeeSchedule) => void;
}

export const FeeScheduleTable: React.FC<FeeScheduleTableProps> = ({
  schedules,
  onEdit,
  onView,
}) => {
  const formatCurrency = (cents: number | null) => {
    if (cents === null) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatPercent = (bps: number | null) => {
    if (bps === null) return 'N/A';
    return `${(bps / 100).toFixed(2)}%`;
  };

  const getScopeBadgeColor = (scope: string) => {
    switch (scope) {
      case 'GLOBAL':
        return 'bg-blue-100 text-blue-800';
      case 'ROLE':
        return 'bg-purple-100 text-purple-800';
      case 'VENDOR':
        return 'bg-green-100 text-green-800';
      case 'EVENT':
        return 'bg-orange-100 text-orange-800';
      case 'CATEGORY':
        return 'bg-pink-100 text-pink-800';
      case 'ORDER':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWhereApplied = (schedule: FeeSchedule) => {
    if (schedule.scope === 'GLOBAL') return 'All transactions';
    if (schedule.scopeRefId) {
      return `${schedule.scope}: ${schedule.scopeRefId.substring(0, 8)}...`;
    }
    return schedule.scope;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scope
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Where Applied
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Take Rate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Floor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cap
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <tr key={schedule.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {schedule.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScopeBadgeColor(
                    schedule.scope
                  )}`}
                >
                  {schedule.scope}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getWhereApplied(schedule)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPercent(schedule.takeRateBps)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(schedule.feeFloorCents)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(schedule.feeCapCents)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">v{schedule.version}</span>
                  {schedule.version === 1 && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(schedule)}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label="View fee schedule"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(schedule)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Edit fee schedule"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {schedules.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No fee schedules found</p>
        </div>
      )}
    </div>
  );
};

