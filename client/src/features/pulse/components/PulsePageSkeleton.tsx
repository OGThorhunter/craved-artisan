import React from 'react';

export function PulsePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F2EC] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="bg-[#E8CBAE] rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-white rounded w-32"></div>
        </div>

        {/* KPI skeleton */}
        <div className="bg-[#E8CBAE] rounded-lg p-6">
          <div className="h-6 bg-white rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Other sections skeleton */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#E8CBAE] rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-white rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 bg-white rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
