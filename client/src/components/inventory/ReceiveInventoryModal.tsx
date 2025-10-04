import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';

interface ReceiveInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

const ReceiveInventoryModal: React.FC<ReceiveInventoryModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    qty: 0,
    unit_cost: 0,
    supplier_name: '',
    batch_number: '',
    expiry_date: '',
    notes: '',
  });

  const receiveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/vendor/inventory/${item?.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to receive inventory');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Inventory received successfully');
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      qty: 0,
      unit_cost: 0,
      supplier_name: item?.supplier_name || '',
      batch_number: '',
      expiry_date: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.qty || formData.qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    if (!formData.unit_cost || formData.unit_cost <= 0) {
      toast.error('Unit cost must be greater than 0');
      return;
    }
    
    receiveMutation.mutate(formData);
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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Receive Inventory</h2>
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
                <p className="text-gray-600">Avg Cost</p>
                <p className="font-semibold text-gray-900">${item.avg_cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Reorder Point</p>
                <p className="font-semibold text-gray-900">{item.reorder_point} {item.unit}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Value</p>
                <p className="font-semibold text-gray-900">${(item.current_qty * item.avg_cost).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Receive *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.qty}
                onChange={(e) => setFormData(prev => ({ ...prev, qty: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </label>
              <Input
                value={formData.supplier_name}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number
              </label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
                placeholder="Enter batch number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
            
            {/* Preview */}
            {formData.qty > 0 && formData.unit_cost > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Receive Preview</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>New Stock: {item.current_qty + formData.qty} {item.unit}</p>
                  <p>Total Cost: ${(formData.qty * formData.unit_cost).toFixed(2)}</p>
                  <p>New Avg Cost: ${(((item.current_qty * item.avg_cost) + (formData.qty * formData.unit_cost)) / (item.current_qty + formData.qty)).toFixed(2)}</p>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={receiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={receiveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {receiveMutation.isPending ? 'Receiving...' : 'Receive Inventory'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReceiveInventoryModal;

