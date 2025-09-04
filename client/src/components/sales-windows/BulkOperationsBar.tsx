import React, { useState } from 'react';
import { 
  Archive, 
  Copy, 
  Play, 
  Pause, 
  Trash2, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Settings
} from 'lucide-react';
import type { SalesWindow } from '@/types/sales-windows';

interface BulkOperationsBarProps {
  selectedWindows: string[];
  onBulkStatusChange: (status: string) => void;
  onBulkArchive: () => void;
  onBulkDuplicate: () => void;
  onBulkDelete: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  totalWindows: number;
}

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedWindows,
  onBulkStatusChange,
  onBulkArchive,
  onBulkDuplicate,
  onBulkDelete,
  onSelectAll,
  onClearSelection,
  totalWindows
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmArchive, setShowConfirmArchive] = useState(false);

  const selectedCount = selectedWindows.length;
  const isAllSelected = selectedCount === totalWindows;
  const hasSelection = selectedCount > 0;

  const handleBulkStatusChange = (status: string) => {
    onBulkStatusChange(status);
  };

  const handleBulkArchive = () => {
    if (showConfirmArchive) {
      onBulkArchive();
      setShowConfirmArchive(false);
    } else {
      setShowConfirmArchive(true);
    }
  };

  const handleBulkDelete = () => {
    if (showConfirmDelete) {
      onBulkDelete();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };

  if (!hasSelection) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Select All ({totalWindows})</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            No windows selected
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} window{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Bulk Status Change */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-700">Status:</span>
            <select
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              className="text-sm border border-blue-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Change to...</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkStatusChange('OPEN')}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
              title="Open selected windows"
            >
              <Play className="h-3 w-3" />
              <span>Open</span>
            </button>

            <button
              onClick={() => handleBulkStatusChange('CLOSED')}
              className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
              title="Close selected windows"
            >
              <Pause className="h-3 w-3" />
              <span>Close</span>
            </button>

            <button
              onClick={onBulkDuplicate}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
              title="Duplicate selected windows"
            >
              <Copy className="h-3 w-3" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handleBulkArchive}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              title="Archive selected windows"
            >
              <Archive className="h-3 w-3" />
              <span>Archive</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
              title="Delete selected windows"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showConfirmArchive && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Are you sure you want to archive {selectedCount} window{selectedCount !== 1 ? 's' : ''}? 
              This action can be undone.
            </span>
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleBulkArchive}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Yes, Archive
            </button>
            <button
              onClick={() => setShowConfirmArchive(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Are you sure you want to delete {selectedCount} window{selectedCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </span>
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperationsBar;
