import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getConfidenceColor, getConfidenceText } from '../../utils/inventoryDuplicates';

interface DuplicateIndicatorProps {
  confidence: number;
  duplicateCount: number;
  onClick?: () => void;
  compact?: boolean;
}

const DuplicateIndicator: React.FC<DuplicateIndicatorProps> = ({
  confidence,
  duplicateCount,
  onClick,
  compact = false
}) => {
  const colorClass = getConfidenceColor(confidence);
  const confidenceText = getConfidenceText(confidence);
  
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass} hover:opacity-80 transition-opacity`}
        title={`${duplicateCount} potential duplicate${duplicateCount > 1 ? 's' : ''} found - ${confidenceText}`}
      >
        <AlertTriangle className="w-3 h-3" />
        {duplicateCount}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClass} hover:opacity-80 transition-opacity`}
      title={`${duplicateCount} potential duplicate${duplicateCount > 1 ? 's' : ''} found - ${confidenceText}`}
    >
      <AlertTriangle className="w-4 h-4" />
      <div className="text-left">
        <div className="text-xs font-medium">
          {duplicateCount} Duplicate{duplicateCount > 1 ? 's' : ''}
        </div>
        <div className="text-xs opacity-75">
          {confidenceText}
        </div>
      </div>
    </button>
  );
};

export default DuplicateIndicator;
