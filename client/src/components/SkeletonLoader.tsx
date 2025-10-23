import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = false,
  animate = true 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  const animateClasses = animate ? 'animate-pulse' : '';
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${roundedClasses} ${animateClasses} ${className}`}
      style={style}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
}

export function SkeletonCard({ 
  className = '',
  showAvatar = false,
  showTitle = true,
  showDescription = true,
  showActions = false,
  lines = 2
}: SkeletonCardProps) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <Skeleton width={40} height={40} rounded />
        )}
        
        <div className="flex-1 space-y-2">
          {showTitle && (
            <Skeleton width="60%" height={20} />
          )}
          
          {showDescription && (
            <div className="space-y-1">
              {Array.from({ length: lines }).map((_, index) => (
                <Skeleton 
                  key={index}
                  width={index === lines - 1 ? "40%" : "100%"} 
                  height={16} 
                />
              ))}
            </div>
          )}
          
          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Skeleton width={80} height={32} rounded />
              <Skeleton width={80} height={32} rounded />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className = ''
}: SkeletonTableProps) {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {showHeader && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} width="20%" height={16} />
            ))}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} width="20%" height={16} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonChartProps {
  className?: string;
  height?: number;
  showLegend?: boolean;
}

export function SkeletonChart({ 
  className = '',
  height = 200,
  showLegend = true
}: SkeletonChartProps) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="space-y-4">
        <Skeleton width="40%" height={20} />
        
        <div 
          className="bg-gray-100 rounded"
          style={{ height: `${height}px` }}
        >
          <div className="h-full flex items-end justify-between px-4 py-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton 
                key={index}
                width={20} 
                height={`${Math.random() * 80 + 20}%`}
                className="bg-gray-300"
              />
            ))}
          </div>
        </div>
        
        {showLegend && (
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton width={12} height={12} rounded />
                <Skeleton width={60} height={14} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function SkeletonList({ 
  items = 5,
  className = '',
  showAvatar = false,
  showActions = false
}: SkeletonListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
          {showAvatar && (
            <Skeleton width={40} height={40} rounded />
          )}
          
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={14} />
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <Skeleton width={60} height={28} rounded />
              <Skeleton width={60} height={28} rounded />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface SkeletonGridProps {
  items?: number;
  columns?: number;
  className?: string;
  showTitle?: boolean;
  showDescription?: boolean;
}

export function SkeletonGrid({ 
  items = 6,
  columns = 3,
  className = '',
  showTitle = true,
  showDescription = true
}: SkeletonGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }[columns] || 'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          {showTitle && (
            <Skeleton width="80%" height={18} />
          )}
          
          {showDescription && (
            <div className="space-y-2">
              <Skeleton width="100%" height={14} />
              <Skeleton width="60%" height={14} />
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <Skeleton width={60} height={20} />
            <Skeleton width={80} height={28} rounded />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonMetricsProps {
  metrics?: number;
  className?: string;
}

export function SkeletonMetrics({ 
  metrics = 4,
  className = ''
}: SkeletonMetricsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: metrics }).map((_, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton width={40} height={40} rounded />
            <div className="space-y-1">
              <Skeleton width={80} height={14} />
              <Skeleton width={60} height={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonFormProps {
  fields?: number;
  className?: string;
  showSubmit?: boolean;
}

export function SkeletonForm({ 
  fields = 4,
  className = '',
  showSubmit = true
}: SkeletonFormProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton width="30%" height={16} />
          <Skeleton width="100%" height={40} rounded />
        </div>
      ))}
      
      {showSubmit && (
        <div className="flex justify-end space-x-2 pt-4">
          <Skeleton width={80} height={36} rounded />
          <Skeleton width={80} height={36} rounded />
        </div>
      )}
    </div>
  );
}

// Animated skeleton with shimmer effect
export function ShimmerSkeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = false
}: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className={`bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

export default Skeleton;
































