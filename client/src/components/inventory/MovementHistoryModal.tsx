import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, History, Download, Filter } from 'lucide-react';
import Button from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [timeRange, setTimeRange] = useState('30');

  // Fetch movement history
  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements', item?.id, timeRange],
    queryFn: async () => {
      if (!item?.id) return [];
      
      const response = await fetch(`/api/vendor/inventory/${item.id}/movements?range=${timeRange}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch movement history');
      }
      
      return response.json();
    },
    enabled: !!item?.id
  });

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'RECEIVE':
        return 'green';
      case 'ADJUST':
        return 'blue';
      case 'CONSUME':
        return 'red';
      case 'WASTE':
        return 'red';
      case 'DONATION':
        return 'purple';
      case 'RETURN':
        return 'yellow';
      case 'RESERVE':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIVE':
        return 'Received';
      case 'ADJUST':
        return 'Adjusted';
      case 'CONSUME':
        return 'Consumed';
      case 'WASTE':
        return 'Wasted';
      case 'DONATION':
        return 'Donated';
      case 'RETURN':
        return 'Returned';
      case 'RESERVE':
        return 'Reserved';
      default:
        return type;
    }
  };

  const formatMovementQty = (qty: number, type: string) => {
    const sign = type === 'RECEIVE' || type === 'ADJUST' ? '+' : '';
    return `${sign}${qty}`;
  };

  const handleExport = () => {
    if (!movements || movements.length === 0) return;
    
    const csvContent = [
      ['Date', 'Type', 'Quantity', 'Unit Cost', 'Reference', 'Notes'].join(','),
      ...movements.map((movement: any) => [
        new Date(movement.createdAt).toLocaleDateString(),
        getMovementTypeLabel(movement.type),
        movement.qty,
        movement.unit_cost || '',
        movement.refType || '',
        movement.notes || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}-movements-${timeRange}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen || !item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Movement History</h2>
                <p className="text-sm text-gray-600">{item.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Time Range:</span>
                </div>
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!movements || movements.length === 0}
              >
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : movements && movements.length > 0 ? (
              <div className="space-y-4">
                {movements.map((movement: any) => (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <Badge variant={getMovementTypeColor(movement.type) as any} size="sm">
                          {getMovementTypeLabel(movement.type)}
                        </Badge>
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {formatMovementQty(movement.qty, movement.type)}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">{item.unit}</span>
                          </div>
                          
                          {movement.unit_cost && (
                            <div>
                              <span className="text-sm text-gray-600">@ $</span>
                              <span className="font-medium text-gray-900">{movement.unit_cost.toFixed(2)}</span>
                            </div>
                          )}
                          
                          {movement.refType && (
                            <div>
                              <span className="text-xs text-gray-500">Ref: </span>
                              <span className="text-sm font-medium text-gray-700">
                                {movement.refType}
                                {movement.refId && ` #${movement.refId}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {movement.notes && (
                          <p className="text-sm text-gray-600 mt-1">{movement.notes}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Movement History</h3>
                <p className="text-gray-600">
                  No movements found for this item in the selected time range.
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MovementHistoryModal;

