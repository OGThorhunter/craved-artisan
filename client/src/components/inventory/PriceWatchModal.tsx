import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { toast } from 'react-hot-toast';

interface PriceWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

const PriceWatchModal: React.FC<PriceWatchModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    target_unit_cost: 0,
    source: 'B2B' as 'B2B' | 'MARKET' | 'CUSTOM_URL',
    source_meta: '',
  });

  const createPriceWatchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/vendor/inventory/price-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          inventoryItemId: item?.id,
          ...data
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create price watch');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Price watch created successfully');
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const stopPriceWatchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vendor/inventory/price-watch/${item?.priceWatches?.[0]?.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop price watch');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Price watch stopped');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      target_unit_cost: 0,
      source: 'B2B',
      source_meta: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target_unit_cost || formData.target_unit_cost <= 0) {
      toast.error('Target unit cost must be greater than 0');
      return;
    }
    
    createPriceWatchMutation.mutate(formData);
  };

  const handleStopWatch = () => {
    if (window.confirm('Are you sure you want to stop watching this item?')) {
      stopPriceWatchMutation.mutate();
    }
  };

  if (!isOpen || !item) return null;

  const hasActiveWatch = item.priceWatches && item.priceWatches.length > 0;
  const currentWatch = hasActiveWatch ? item.priceWatches[0] : null;

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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Price Watch</h2>
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
          
          {/* Current Price Info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current Avg Cost</p>
                <p className="font-semibold text-gray-900">${item.avg_cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Cost</p>
                <p className="font-semibold text-gray-900">${item.last_cost.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {hasActiveWatch ? (
              /* Active Watch */
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Active Price Watch</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex justify-between">
                      <span>Target Price:</span>
                      <span className="font-medium">${currentWatch.target_unit_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span className="font-medium">{currentWatch.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {new Date(currentWatch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleStopWatch}
                    disabled={stopPriceWatchMutation.isPending}
                    className="flex-1"
                  >
                    <EyeOff size={16} />
                    Stop Watch
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              /* Create Watch Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Unit Cost *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.target_unit_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_unit_cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll notify you when prices drop to this level
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watch Source
                  </label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as any }))}
                  >
                    <option value="B2B">B2B Marketplace</option>
                    <option value="MARKET">Public Market</option>
                    <option value="CUSTOM_URL">Custom URL</option>
                  </Select>
                </div>
                
                {formData.source === 'CUSTOM_URL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom URL
                    </label>
                    <Input
                      value={formData.source_meta}
                      onChange={(e) => setFormData(prev => ({ ...prev, source_meta: e.target.value }))}
                      placeholder="https://example.com/product"
                    />
                  </div>
                )}
                
                {/* Preview */}
                {formData.target_unit_cost > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Watch Preview</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p>Current Price: ${item.avg_cost.toFixed(2)}</p>
                      <p>Target Price: ${formData.target_unit_cost.toFixed(2)}</p>
                      <p>Potential Savings: ${(item.avg_cost - formData.target_unit_cost).toFixed(2)} per {item.unit}</p>
                      <p>Savings %: {(((item.avg_cost - formData.target_unit_cost) / item.avg_cost) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={createPriceWatchMutation.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPriceWatchMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {createPriceWatchMutation.isPending ? 'Creating...' : 'Start Watch'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PriceWatchModal;