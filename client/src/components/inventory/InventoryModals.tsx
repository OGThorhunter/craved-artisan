import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit } from 'lucide-react';
import type { InventoryItem, CreateInventoryItemData, UpdateInventoryItemData } from '../../hooks/useInventory';

interface InventoryModalsProps {
  // Modal states
  showAddModal: boolean;
  showEditModal: boolean;
  showViewModal: boolean;
  
  // Data
  editingItem: InventoryItem | null;
  viewingItem: InventoryItem | null;
  
  // Actions
  onClose: () => void;
  onSave: (data: CreateInventoryItemData | UpdateInventoryItemData) => void;
  onEdit: (item: InventoryItem) => void;
  
  // Loading states
  isSaving?: boolean;
}

const InventoryModals: React.FC<InventoryModalsProps> = ({
  showAddModal,
  showEditModal,
  showViewModal,
  editingItem,
  viewingItem,
  onClose,
  onSave,
  onEdit,
  isSaving = false
}) => {
  const [formData, setFormData] = useState<CreateInventoryItemData>({
    name: '',
    description: '',
    category: 'food_grade',
    currentStock: 0,
    reorderPoint: 0,
    unit: 'kg',
    unitPrice: 0,
    supplier: '',
    batch: '',
    expiryDate: '',
    tags: [],
    location: ''
  });

  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showAddModal || showEditModal) {
      if (editingItem) {
        setFormData({
          name: editingItem.name,
          description: editingItem.description,
          category: editingItem.category,
          currentStock: editingItem.currentStock,
          reorderPoint: editingItem.reorderPoint,
          unit: editingItem.unit,
          unitPrice: editingItem.unitPrice,
          supplier: editingItem.supplier,
          batch: editingItem.batch || '',
          expiryDate: editingItem.expiryDate || '',
          tags: editingItem.tags,
          location: editingItem.location
        });
      } else {
        setFormData({
          name: '',
          description: '',
          category: 'food_grade',
          currentStock: 0,
          reorderPoint: 0,
          unit: 'kg',
          unitPrice: 0,
          supplier: '',
          batch: '',
          expiryDate: '',
          tags: [],
          location: ''
        });
      }
    }
  }, [showAddModal, showEditModal, editingItem]);

  const handleInputChange = (field: keyof CreateInventoryItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onSave({ ...formData, id: editingItem.id } as UpdateInventoryItemData);
    } else {
      onSave(formData);
    }
  };

  const categories = [
    { value: 'food_grade', label: 'Food Grade' },
    { value: 'raw_materials', label: 'Raw Materials' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'equipment', label: 'Equipment' }
  ];

  const units = ['kg', 'g', 'lb', 'oz', 'pieces', 'boxes', 'bottles', 'liters', 'ml'];

  const isModalOpen = showAddModal || showEditModal || showViewModal;

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="border border-gray-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#F7F2EC' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {showViewModal ? (
              <>
                <Eye className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
              </>
            ) : (
              <>
                <Edit className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showViewModal && viewingItem ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{viewingItem.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900 capitalize">{viewingItem.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                  <p className="text-gray-900">{viewingItem.currentStock} {viewingItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                  <p className="text-gray-900">{viewingItem.reorderPoint} {viewingItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <p className="text-gray-900">${viewingItem.unitPrice.toFixed(2)}/{viewingItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                  <p className="text-gray-900">${viewingItem.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <p className="text-gray-900">{viewingItem.supplier || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{viewingItem.location || 'N/A'}</p>
                </div>
                {viewingItem.batch && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <p className="text-gray-900">{viewingItem.batch}</p>
                  </div>
                )}
                {viewingItem.expiryDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <p className="text-gray-900">{new Date(viewingItem.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              {viewingItem.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{viewingItem.description}</p>
                </div>
              )}
              
              {viewingItem.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingItem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Add/Edit Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-label="Item name"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-label="Item category"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    id="currentStock"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                    aria-label="Current stock quantity"
                  />
                </div>

                <div>
                  <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Point *
                  </label>
                  <input
                    type="number"
                    id="reorderPoint"
                    value={formData.reorderPoint}
                    onChange={(e) => handleInputChange('reorderPoint', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                    aria-label="Reorder point quantity"
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-label="Unit of measurement"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    id="unitPrice"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                    aria-label="Unit price"
                  />
                </div>

                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Supplier name"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Storage location"
                  />
                </div>

                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    id="batch"
                    value={formData.batch}
                    onChange={(e) => handleInputChange('batch', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Batch number"
                  />
                </div>

                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Expiry date"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Add tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showViewModal ? 'Close' : 'Cancel'}
          </button>
          
          {showViewModal ? (
            <button
              onClick={() => {
                onClose();
                onEdit(viewingItem!);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Item
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryModals;

