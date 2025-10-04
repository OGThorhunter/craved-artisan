import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Package, Users, Utensils, AlertTriangle, Plus, Trash2, Calculator } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import UnitConverter from './UnitConverter';

type ProductType = 'FOOD' | 'NON_FOOD' | 'SERVICE';

interface Product {
  id?: string;
  name: string;
  type: ProductType;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  tags: string[];
  imageUrl?: string;
  price: number;
  baseCost: number;
  laborCost: number;
  targetMarginLowPct: number;
  targetMarginHighPct: number;
  minPrice?: number;
  maxPrice?: number;
  sku?: string;
  barcode?: string;
  taxCode?: string;
  // Food-specific
  allergenFlags: string[];
  nutritionNotes?: string;
  // Service-specific
  serviceDurationMin?: number;
  serviceCapacityPerDay?: number;
  serviceLeadTimeDays?: number;
  requiresDeposit: boolean;
  // Variants
  variants: Array<{
    id?: string;
    name: string;
    sku?: string;
    priceDelta: number;
    isDefault: boolean;
  }>;
  // Materials
  materials: Array<{
    id?: string;
    inventoryItemId: string;
    qty: number;
    unit: string;
    wastePct: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentQty: number;
  reorderPoint: number;
  avgCost?: number;
}

interface ProductCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product;
  categories: Category[];
  inventoryItems: InventoryItem[];
  isLoading?: boolean;
}

const ALLERGEN_OPTIONS = [
  'wheat', 'gluten', 'dairy', 'eggs', 'soy', 'nuts', 'peanuts', 'fish', 'shellfish', 'sesame'
];

const ProductCreateEditModal: React.FC<ProductCreateEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  inventoryItems,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Product>({
    name: '',
    type: 'FOOD',
    description: '',
    tags: [],
    price: 0,
    baseCost: 0,
    laborCost: 0,
    targetMarginLowPct: 30,
    targetMarginHighPct: 45,
    requiresDeposit: false,
    allergenFlags: [],
    variants: [],
    materials: [],
  });

  const [newTag, setNewTag] = useState('');
  const [newVariant, setNewVariant] = useState({ name: '', sku: '', priceDelta: 0, isDefault: false });
  const [newMaterial, setNewMaterial] = useState({ inventoryItemId: '', qty: 1, unit: 'cups', wastePct: 0 });
  const [showUnitConverter, setShowUnitConverter] = useState(false);

  const totalSteps = 5;

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        type: 'FOOD',
        description: '',
        tags: [],
        price: 0,
        baseCost: 0,
        laborCost: 0,
        targetMarginLowPct: 30,
        targetMarginHighPct: 45,
        requiresDeposit: false,
        allergenFlags: [],
        variants: [],
        materials: [],
      });
    }
    setCurrentStep(1);
  }, [product, isOpen]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof Product, value: any[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleArrayChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleArrayChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addVariant = () => {
    if (newVariant.name.trim()) {
      handleArrayChange('variants', [...formData.variants, { ...newVariant, id: Date.now().toString() }]);
      setNewVariant({ name: '', sku: '', priceDelta: 0, isDefault: false });
    }
  };

  const removeVariant = (index: number) => {
    handleArrayChange('variants', formData.variants.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    if (newMaterial.inventoryItemId) {
      handleArrayChange('materials', [...formData.materials, { ...newMaterial, id: Date.now().toString() }]);
      setNewMaterial({ inventoryItemId: '', qty: 1, unit: 'cups', wastePct: 0 });
    }
  };

  const removeMaterial = (index: number) => {
    handleArrayChange('materials', formData.materials.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    const materialsCost = formData.materials.reduce((total, material) => {
      const item = inventoryItems.find(item => item.id === material.inventoryItemId);
      const cost = (item?.avgCost || 0) * material.qty * (1 + material.wastePct / 100);
      return total + cost;
    }, 0);
    return formData.baseCost + formData.laborCost + materialsCost;
  };

  const calculateMargin = () => {
    const totalCost = calculateTotalCost();
    if (formData.price > 0) {
      return ((formData.price - totalCost) / formData.price) * 100;
    }
    return 0;
  };

  const getTypeIcon = (type: ProductType) => {
    switch (type) {
      case 'FOOD': return Utensils;
      case 'SERVICE': return Users;
      case 'NON_FOOD': return Package;
      default: return Package;
    }
  };

  const getTypeColor = (type: ProductType) => {
    switch (type) {
      case 'FOOD': return 'text-green-600 bg-green-100';
      case 'SERVICE': return 'text-blue-600 bg-blue-100';
      case 'NON_FOOD': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.type !== '';
      case 2:
        return formData.price > 0;
      case 3:
        return true; // Materials are optional
      case 4:
        return true; // Type-specific fields are optional
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5B6E02]/10 rounded-lg">
              {React.createElement(getTypeIcon(formData.type), { className: "w-5 h-5 text-[#5B6E02]" })}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {product ? 'Edit Product' : 'Create Product'}
              </h2>
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep
                      ? 'bg-[#5B6E02] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-[#5B6E02]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                {/* Product Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Product Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['FOOD', 'NON_FOOD', 'SERVICE'] as ProductType[]).map(type => {
                      const Icon = getTypeIcon(type);
                      return (
                        <button
                          key={type}
                          onClick={() => handleInputChange('type', type)}
                          className={`p-4 border-2 rounded-lg text-left transition-colors ${
                            formData.type === type
                              ? 'border-[#5B6E02] bg-[#5B6E02]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-6 h-6 mb-2" />
                          <div className="font-medium">{type.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-600">
                            {type === 'FOOD' && 'Food items and ingredients'}
                            {type === 'NON_FOOD' && 'Physical products and supplies'}
                            {type === 'SERVICE' && 'Services and consultations'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                    placeholder="Describe your product"
                  />
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => handleInputChange('categoryId', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Add a tag"
                    />
                    <Button onClick={addTag} disabled={!newTag.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Options */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pricing */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Pricing</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={formData.minPrice || ''}
                            onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={formData.maxPrice || ''}
                            onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Costs */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Costs</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.baseCost}
                          onChange={(e) => handleInputChange('baseCost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Labor Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.laborCost}
                          onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Margin Calculation */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Cost Summary</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Base Cost:</span>
                          <span>${formData.baseCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Labor Cost:</span>
                          <span>${formData.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Materials Cost:</span>
                          <span>${(calculateTotalCost() - formData.baseCost - formData.laborCost).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Cost:</span>
                          <span>${calculateTotalCost().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Margin:</span>
                          <span className={calculateMargin() >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {calculateMargin().toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Margins */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Margin Low %</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.targetMarginLowPct}
                        onChange={(e) => handleInputChange('targetMarginLowPct', parseFloat(e.target.value) || 0)}
                        className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Margin High %</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.targetMarginHighPct}
                        onChange={(e) => handleInputChange('targetMarginHighPct', parseFloat(e.target.value) || 0)}
                        className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Variants & Options</h4>
                    <Button
                      variant="secondary"
                      onClick={() => setNewVariant({ name: '', sku: '', priceDelta: 0, isDefault: false })}
                      className="text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                  
                  {formData.variants.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{variant.name}</div>
                            <div className="text-sm text-gray-600">
                              {variant.sku && `SKU: ${variant.sku}`}
                              {variant.priceDelta !== 0 && ` • Price: ${variant.priceDelta > 0 ? '+' : ''}$${variant.priceDelta.toFixed(2)}`}
                              {variant.isDefault && ' • Default'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => removeVariant(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Materials */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients & Materials</h3>
                
                {/* Add Material */}
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                      <select
                        value={newMaterial.inventoryItemId}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, inventoryItemId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      >
                        <option value="">Select material</option>
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={newMaterial.qty}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, qty: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={newMaterial.unit}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="cups, lbs, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Waste %</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={newMaterial.wastePct}
                          onChange={(e) => setNewMaterial(prev => ({ ...prev, wastePct: parseFloat(e.target.value) || 0 }))}
                          className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={addMaterial}
                      disabled={!newMaterial.inventoryItemId}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Material
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowUnitConverter(!showUnitConverter)}
                    >
                      <Calculator className="w-4 h-4 mr-1" />
                      Unit Converter
                    </Button>
                  </div>
                </div>

                {/* Unit Converter */}
                {showUnitConverter && (
                  <div className="mb-4">
                    <UnitConverter
                      defaultFromUnit={newMaterial.unit}
                      onConvert={(from, to, factor) => {
                        setNewMaterial(prev => ({ ...prev, unit: to }));
                      }}
                    />
                  </div>
                )}

                {/* Materials List */}
                {formData.materials.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Materials Used</h4>
                    {formData.materials.map((material, index) => {
                      const item = inventoryItems.find(item => item.id === material.inventoryItemId);
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item?.name || 'Unknown Material'}</div>
                            <div className="text-sm text-gray-600">
                              {material.qty} {material.unit}
                              {material.wastePct > 0 && ` (+${material.wastePct}% waste)`}
                              {item?.avgCost && ` • $${(item.avgCost * material.qty * (1 + material.wastePct / 100)).toFixed(2)}`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => removeMaterial(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Cost Summary */}
                {formData.materials.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Cost Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Base Cost:</span>
                        <span>${formData.baseCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span>${formData.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Materials Cost:</span>
                        <span>${(calculateTotalCost() - formData.baseCost - formData.laborCost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Cost:</span>
                        <span>${calculateTotalCost().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Type-specific */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {formData.type === 'FOOD' && 'Food Information'}
                  {formData.type === 'SERVICE' && 'Service Details'}
                  {formData.type === 'NON_FOOD' && 'Product Details'}
                </h3>

                {formData.type === 'FOOD' && (
                  <div className="space-y-4">
                    {/* Allergens */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Allergen Information</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ALLERGEN_OPTIONS.map(allergen => (
                          <label key={allergen} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.allergenFlags.includes(allergen)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleArrayChange('allergenFlags', [...formData.allergenFlags, allergen]);
                                } else {
                                  handleArrayChange('allergenFlags', formData.allergenFlags.filter(a => a !== allergen));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm capitalize">{allergen}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition Notes</label>
                      <textarea
                        value={formData.nutritionNotes || ''}
                        onChange={(e) => handleInputChange('nutritionNotes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Nutritional information, dietary notes, etc."
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'SERVICE' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={formData.serviceDurationMin || ''}
                          onChange={(e) => handleInputChange('serviceDurationMin', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity per Day</label>
                        <input
                          type="number"
                          value={formData.serviceCapacityPerDay || ''}
                          onChange={(e) => handleInputChange('serviceCapacityPerDay', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                          min="1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (days)</label>
                      <input
                        type="number"
                        value={formData.serviceLeadTimeDays || ''}
                        onChange={(e) => handleInputChange('serviceLeadTimeDays', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.requiresDeposit}
                          onChange={(e) => handleInputChange('requiresDeposit', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Requires deposit</span>
                      </label>
                    </div>
                  </div>
                )}

                {formData.type === 'NON_FOOD' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input
                        type="text"
                        value={formData.sku || ''}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Product SKU"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                      <input
                        type="text"
                        value={formData.barcode || ''}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Product barcode"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Save</h3>
                
                <div className="space-y-4">
                  {/* Product Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Product Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Name</div>
                        <div className="text-gray-600">{formData.name}</div>
                      </div>
                      <div>
                        <div className="font-medium">Type</div>
                        <div className="text-gray-600">{formData.type.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <div className="font-medium">Price</div>
                        <div className="text-gray-600">${formData.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Total Cost</div>
                        <div className="text-gray-600">${calculateTotalCost().toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Margin</div>
                        <div className={`font-medium ${calculateMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculateMargin().toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Materials</div>
                        <div className="text-gray-600">{formData.materials.length} items</div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Cost Breakdown</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Base Cost:</span>
                        <span>${formData.baseCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span>${formData.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Materials Cost:</span>
                        <span>${(calculateTotalCost() - formData.baseCost - formData.laborCost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total Cost:</span>
                        <span>${calculateTotalCost().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Margin Alert */}
                  {calculateMargin() < formData.targetMarginLowPct && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Low Margin Alert</div>
                          <div className="text-sm">
                            Current margin ({calculateMargin().toFixed(1)}%) is below target ({formData.targetMarginLowPct}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button variant="secondary" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isLoading || !isStepValid(currentStep)}
                className="bg-[#5B6E02] text-white hover:bg-[#5B6E02]/90"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    {product ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreateEditModal;

