import React from 'react';
import { AppIcon } from './AppIcon';

interface StandardButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
  title?: string;
}

export function StandardButton({
  onClick,
  children,
  icon,
  variant = 'primary',
  className = '',
  disabled = false,
  title
}: StandardButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  
  const variantClasses = {
    primary: "bg-[#5B6E02] text-white hover:bg-[#4A5D01]",
    secondary: "bg-white text-[#777] hover:text-[#333] border border-gray-200 hover:bg-gray-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <AppIcon name={icon} className="w-4 h-4" />}
      {children}
    </button>
  );
}
