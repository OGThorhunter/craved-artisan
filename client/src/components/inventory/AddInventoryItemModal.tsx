import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus } from 'lucide-react';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { toast } from 'react-hot-toast';

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'FOOD_GRADE',
    unit: 'kg',
    current_qty: 0,
    reorder_point: 0,
    preferred_qty: 0,
    avg_cost: 0,
    last_cost: 0,
    supplier_name: '',
    location: '',
    batch_number: '',
    expiry_date: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/vendor/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create inventory item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Inventory item created successfully');
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'FOOD_GRADE',
      unit: 'kg',
      current_qty: 0,
      reorder_point: 0,
      preferred_qty: 0,
      avg_cost: 0,
      last_cost: 0,
      supplier_name: '',
      location: '',
      batch_number: '',
      expiry_date: '',
      tags: [],
    });
    setTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    addItemMutation.mutate(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Add Inventory Item</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <option value="FOOD_GRADE">Food Grade</option>
                    <option value="PACKAGING">Packaging</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="L">Liter (L)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="lb">Pound (lb)</option>
                    <option value="oz">Ounce (oz)</option>
                    <option value="ea">Each (ea)</option>
                    <option value="box">Box</option>
                    <option value="case">Case</option>
                    <option value="bag">Bag</option>
                    <option value="bottle">Bottle</option>
                    <option value="can">Can</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Shelf A1, Freezer, Pantry"
                  />
                </div>
              </div>
              
              {/* Quantities & Costs */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Quantities & Costs</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.current_qty}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_qty: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Point
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.reorder_point}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preferred_qty}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_qty: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Cost
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.avg_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, avg_cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Cost
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.last_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            {/* Supplier Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter tag and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={addItemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addItemMutation.isPending}
                className="bg-brand-red hover:bg-brand-red/90"
              >
                {addItemMutation.isPending ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AddInventoryItemModal;

