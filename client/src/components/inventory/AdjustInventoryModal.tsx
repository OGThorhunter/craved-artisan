import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';

interface AdjustInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

const AdjustInventoryModal: React.FC<AdjustInventoryModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    qtyDelta: 0,
    notes: '',
  });

  const adjustMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/vendor/inventory/${item?.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to adjust inventory');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Inventory adjusted successfully');
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      qtyDelta: 0,
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.qtyDelta === 0) {
      toast.error('Quantity adjustment cannot be zero');
      return;
    }
    
    if (item.current_qty + formData.qtyDelta < 0) {
      toast.error('Adjustment would result in negative inventory');
      return;
    }
    
    adjustMutation.mutate(formData);
  };

  if (!isOpen || !item) return null;

  const newQty = item.current_qty + formData.qtyDelta;

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
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Adjust Inventory</h2>
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
          
          {/* Current Stock Info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current Stock</p>
                <p className="font-semibold text-gray-900">{item.current_qty} {item.unit}</p>
              </div>
              <div>
                <p className="text-gray-600">Reorder Point</p>
                <p className="font-semibold text-gray-900">{item.reorder_point} {item.unit}</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Adjustment *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.qtyDelta}
                onChange={(e) => setFormData(prev => ({ ...prev, qtyDelta: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Positive for increase, negative for decrease
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Adjustment
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g., Found damaged items, miscount, etc."
              />
            </div>
            
            {/* Preview */}
            {formData.qtyDelta !== 0 && (
              <div className={`p-4 rounded-lg ${
                newQty < 0 ? 'bg-red-50' : 
                newQty <= item.reorder_point ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  newQty < 0 ? 'text-red-900' : 
                  newQty <= item.reorder_point ? 'text-yellow-900' : 'text-green-900'
                }`}>
                  Adjustment Preview
                </h4>
                <div className={`space-y-1 text-sm ${
                  newQty < 0 ? 'text-red-800' : 
                  newQty <= item.reorder_point ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  <p>Current: {item.current_qty} {item.unit}</p>
                  <p>Adjustment: {formData.qtyDelta > 0 ? '+' : ''}{formData.qtyDelta} {item.unit}</p>
                  <p>New Stock: {newQty} {item.unit}</p>
                  {newQty <= item.reorder_point && newQty >= 0 && (
                    <p className="font-medium">⚠️ Below reorder point</p>
                  )}
                  {newQty < 0 && (
                    <p className="font-medium">❌ Negative inventory not allowed</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={adjustMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adjustMutation.isPending || newQty < 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {adjustMutation.isPending ? 'Adjusting...' : 'Adjust Inventory'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdjustInventoryModal;

