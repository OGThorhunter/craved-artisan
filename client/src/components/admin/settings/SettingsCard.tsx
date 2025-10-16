import React from 'react';
import Card from '../../ui/Card';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  icon,
  className = ''
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-[#7F232E]/10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-[#2b2b2b]">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-[#4b4b4b]">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
};

