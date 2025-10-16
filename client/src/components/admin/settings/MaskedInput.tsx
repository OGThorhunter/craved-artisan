import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedInputProps {
  value: string;
  label: string;
  canReveal?: boolean;
  className?: string;
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  value,
  label,
  canReveal = false,
  className = ''
}) => {
  const [revealed, setRevealed] = useState(false);

  const getMaskedValue = () => {
    if (!value) return 'Not configured';
    if (revealed) return value;
    
    // Show only last 4 characters
    if (value.length > 4) {
      return `****...${value.slice(-4)}`;
    }
    return '****';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium text-[#2b2b2b]">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={getMaskedValue()}
          readOnly
          aria-label={label}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-[#2b2b2b] font-mono text-sm"
        />
        {canReveal && value && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
            title={revealed ? 'Hide' : 'Show'}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4 text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

