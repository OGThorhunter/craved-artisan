import React from 'react';

interface InventorySkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

const InventorySkeleton: React.FC<InventorySkeletonProps> = ({ 
  viewMode = 'grid', 
  count = 6 
}) => {
  const SkeletonCard = () => (
    <div className="bg-[#F7F2EC] shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-1">
          <div className="h-5 bg-gray-300 rounded-full w-16"></div>
          <div className="h-5 bg-gray-300 rounded-full w-20"></div>
        </div>

        {/* Stock Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-300 rounded w-12"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-300 rounded w-20"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="h-2 bg-gray-300 rounded w-full"></div>
        </div>

        {/* Cost Info */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-300 rounded w-16"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>

        {/* Supplier & Location */}
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <div className="h-8 bg-gray-300 rounded flex-1"></div>
          <div className="h-8 bg-gray-300 rounded flex-1"></div>
          <div className="h-8 bg-gray-300 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-4">
        <div>
          <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div>
          <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div>
          <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-3 bg-gray-300 rounded w-24"></div>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1">
          <div className="h-5 bg-gray-300 rounded-full w-16"></div>
          <div className="h-5 bg-gray-300 rounded-full w-20"></div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      </td>
    </tr>
  );

  if (viewMode === 'list') {
    return (
      <div className="bg-[#F7F2EC] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: count }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default InventorySkeleton;

























