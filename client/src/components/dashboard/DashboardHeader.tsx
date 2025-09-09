import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
  currentView?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: string;
  iconBg?: string;
  showQuote?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  description, 
  currentView,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
  showQuote = true 
}) => {
  return (
    <div className="mb-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          {Icon && (
            <div className={`p-3 ${iconBg} rounded-lg`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-lg text-gray-600">{description}</p>
          </div>
        </div>
        
        {/* Current View Indicator */}
        {currentView && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Current View:</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {currentView}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
