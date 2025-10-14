import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Image, 
  FileText, 
  Clock, 
  Users, 
  Package, 
  Save,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import Button from '../ui/Button';
import { ProductLabelProfileSelector } from './ProductLabelProfileSelector';
import { VariantLabelOverrides } from './VariantLabelOverrides';
import { LabelProfileHierarchyViewer } from '../labels/LabelProfileHierarchyViewer';

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_qty: number;
  reorder_point: number;
  avg_cost: number;
}

interface ProductIngredient {
  id?: string;
  inventoryItemId: string;
  quantity: number;
  unit: string;
  notes?: string;
  isOptional: boolean;
  inventoryItem?: InventoryItem;
}

interface ProductImage {
  id?: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductDocument {
  id?: string;
  title: string;
  documentUrl: string;
  type: 'SOP' | 'INSTRUCTION' | 'NUTRITION' | 'ALLERGEN';
  description?: string;
}

interface EnhancedProduct {
  id?: string;
  name: string;
  description: string;
  type: 'FOOD' | 'NON_FOOD' | 'SERVICE' | 'CLASSES';
  price: number;
  baseCost: number;
  laborCost: number;
  sku: string;
  autoGenerateSku: boolean;
  batchSize?: number;
  creationTimeMinutes?: number;
  leadTimeDays?: number;
  instructions?: string;
  sops?: string;
  categoryId?: string;
  tags: string[];
  allergenFlags: string[];
  active: boolean;
  labelProfileId?: string;
  ingredients: ProductIngredient[];
  images: ProductImage[];
  documents: ProductDocument[];
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
    labelProfileId?: string;
  }>;
  // Classes/Training specific fields
  availableSeats?: number;
  costPerSeat?: number;
  duration?: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

interface EnhancedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: EnhancedProduct) => Promise<void>;
  product?: EnhancedProduct | null;
  categories: Category[];
  inventoryItems: InventoryItem[];
}

const EnhancedProductModal: React.FC<EnhancedProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  inventoryItems
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDocumentParsing, setIsDocumentParsing] = useState(false);

  const [formData, setFormData] = useState<EnhancedProduct>({
    name: '',
    description: '',
    type: 'FOOD',
    price: 0,
    baseCost: 0,
    laborCost: 0,
    sku: '',
    autoGenerateSku: true,
    batchSize: undefined,
    creationTimeMinutes: undefined,
    leadTimeDays: undefined,
    instructions: '',
    sops: '',
    categoryId: '',
    tags: [],
    allergenFlags: [],
    active: true,
    labelProfileId: undefined,
    ingredients: [],
    images: [],
    documents: [],
    variants: [],
    // Classes/Training specific fields
    availableSeats: undefined,
    costPerSeat: undefined,
    duration: ''
  });

  const [newIngredient, setNewIngredient] = useState<Partial<ProductIngredient>>({
    inventoryItemId: '',
    quantity: 0,
    unit: '',
    notes: '',
    isOptional: false
  });

  const [newTag, setNewTag] = useState('');
  const [newAllergen, setNewAllergen] = useState('');

  // Initialize form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'FOOD',
        price: 0,
        baseCost: 0,
        laborCost: 0,
        sku: '',
        autoGenerateSku: true,
        batchSize: undefined,
        creationTimeMinutes: undefined,
        leadTimeDays: undefined,
        instructions: '',
        sops: '',
        categoryId: '',
        tags: [],
        allergenFlags: [],
        active: true,
        labelProfileId: undefined,
        ingredients: [],
        images: [],
        documents: [],
        variants: [],
        // Classes/Training specific fields
        availableSeats: undefined,
        costPerSeat: undefined,
        duration: ''
      });
    }
    setCurrentStep(1);
  }, [product, isOpen]);

  // Auto-generate SKU when name or type changes
  useEffect(() => {
    if (formData.autoGenerateSku && formData.name && formData.type) {
      const typePrefix = formData.type === 'FOOD' ? 'FD' : formData.type === 'SERVICE' ? 'SV' : formData.type === 'CLASSES' ? 'CL' : 'NF';
      const namePrefix = formData.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, sku: `${typePrefix}-${namePrefix}-${randomSuffix}` }));
    }
  }, [formData.name, formData.type, formData.autoGenerateSku]);

  // Auto-calculate price for classes when seats and cost per seat change
  useEffect(() => {
    if (formData.type === 'CLASSES' && formData.availableSeats && formData.costPerSeat) {
      const totalPrice = formData.availableSeats * formData.costPerSeat;
      setFormData(prev => ({ ...prev, price: totalPrice }));
    }
  }, [formData.type, formData.availableSeats, formData.costPerSeat]);

  const steps = [
    { id: 1, name: 'Basic Info', icon: Package },
    { id: 2, name: 'Ingredients', icon: Users },
    { id: 3, name: 'Images', icon: Image },
    { id: 4, name: 'Instructions', icon: FileText },
    { id: 5, name: 'Timing & Batch', icon: Clock },
    { id: 6, name: 'Review', icon: Eye }
  ];

  const handleInputChange = (field: keyof EnhancedProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddIngredient = () => {
    if (newIngredient.inventoryItemId && newIngredient.quantity && newIngredient.unit) {
      const selectedItem = inventoryItems.find(item => item.id === newIngredient.inventoryItemId);
      setFormData(prev => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            ...newIngredient,
            inventoryItem: selectedItem
          } as ProductIngredient
        ]
      }));
      setNewIngredient({
        inventoryItemId: '',
        quantity: 0,
        unit: '',
        notes: '',
        isOptional: false
      });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddAllergen = () => {
    if (newAllergen.trim() && !formData.allergenFlags.includes(newAllergen.trim())) {
      setFormData(prev => ({ ...prev, allergenFlags: [...prev.allergenFlags, newAllergen.trim()] }));
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setFormData(prev => ({ ...prev, allergenFlags: prev.allergenFlags.filter(a => a !== allergen) }));
  };

  const handleVariantsUpdate = (variants: EnhancedProduct['variants']) => {
    setFormData(prev => ({ ...prev, variants }));
  };


  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDocumentParsing(true);
    
    try {
      // Simulate document parsing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert('Document parsed successfully! Instructions and ingredients extracted.');
    } catch {
      alert('Failed to parse document. Please try again.');
    } finally {
      setIsDocumentParsing(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_product.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-generated SKU"
                    disabled={formData.autoGenerateSku}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.autoGenerateSku}
                      onChange={(e) => handleInputChange('autoGenerateSku', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FOOD">Food</option>
                  <option value="NON_FOOD">Non-Food</option>
                  <option value="SERVICE">Service</option>
                  <option value="CLASSES">Classes / Training</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Labor Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.laborCost}
                  onChange={(e) => handleInputChange('laborCost', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active product</span>
                </label>
              </div>

              {/* Label Profile Selector */}
              <ProductLabelProfileSelector
                selectedProfileId={formData.labelProfileId}
                onProfileSelect={(profileId) => handleInputChange('labelProfileId', profileId)}
              />
            </div>

            {/* Simple Variant Management for Testing */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Product Variants</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newVariant = {
                      id: `variant-${Date.now()}`,
                      name: `Variant ${formData.variants.length + 1}`,
                      price: formData.price,
                      stock: 0,
                      attributes: { size: 'Medium' }
                    };
                    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Variant</span>
                </button>
              </div>

              {formData.variants.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.variants.map((variant, index) => (
                    <div key={variant.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <span className="text-sm">{variant.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            variants: prev.variants.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Variant Label Overrides */}
              {formData.variants.length > 0 && (
                <VariantLabelOverrides
                  variants={formData.variants}
                  onVariantUpdate={handleVariantsUpdate}
                  defaultLabelProfileId={formData.labelProfileId}
                />
              )}

              {/* Label Profile Hierarchy Viewer */}
              <div className="border-t border-gray-200 pt-4">
                <LabelProfileHierarchyViewer
                  product={{
                    ...formData,
                    id: formData.id || 'new-product'
                  } as any}
                  variant={formData.variants.length > 0 ? formData.variants[0] : undefined}
                  showActions={true}
                />
              </div>
            </div>

            {/* Classes/Training specific fields */}
            {formData.type === 'CLASSES' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Class Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Seats *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.availableSeats || ''}
                      onChange={(e) => handleInputChange('availableSeats', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Seat ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPerSeat || ''}
                      onChange={(e) => handleInputChange('costPerSeat', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="75.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3 hours, 2 days, etc."
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Class Pricing Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        For classes, the "Price" field above represents the total revenue potential (Available Seats × Cost per Seat).
                        The system will automatically calculate this when you fill in the class details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Product Ingredients</h3>
              <Button
                onClick={handleAddIngredient}
                disabled={!newIngredient.inventoryItemId || newIngredient.quantity <= 0 || !newIngredient.unit}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient</label>
                <select
                  value={newIngredient.inventoryItemId}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, inventoryItemId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select ingredient</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.current_qty} {item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <div className="flex gap-2">
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select unit</option>
                    <option value="cups">Cups</option>
                    <option value="tbsp">Tablespoons</option>
                    <option value="tsp">Teaspoons</option>
                    <option value="grams">Grams</option>
                    <option value="kg">Kilograms</option>
                    <option value="lbs">Pounds</option>
                    <option value="oz">Ounces</option>
                    <option value="ml">Milliliters</option>
                    <option value="liters">Liters</option>
                    <option value="pieces">Pieces</option>
                    <option value="each">Each</option>
                    <option value="pinch">Pinch</option>
                    <option value="dash">Dash</option>
                  </select>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // Simple unit converter - convert between common units
                      const unitConversions: { [key: string]: { [key: string]: number } } = {
                        'cups': { 'tbsp': 16, 'tsp': 48, 'ml': 240, 'oz': 8 },
                        'tbsp': { 'tsp': 3, 'ml': 15, 'cups': 0.0625 },
                        'tsp': { 'tbsp': 0.333, 'ml': 5 },
                        'grams': { 'kg': 0.001, 'lbs': 0.0022, 'oz': 0.035 },
                        'kg': { 'grams': 1000, 'lbs': 2.2, 'oz': 35 },
                        'lbs': { 'kg': 0.45, 'grams': 454, 'oz': 16 },
                        'oz': { 'lbs': 0.0625, 'grams': 28, 'kg': 0.028 },
                        'ml': { 'liters': 0.001, 'cups': 0.0042, 'oz': 0.034 },
                        'liters': { 'ml': 1000, 'cups': 4.2 }
                      };
                      
                      const currentUnit = newIngredient.unit;
                      const currentQty = newIngredient.quantity;
                      
                      if (currentUnit && currentQty > 0 && unitConversions[currentUnit]) {
                        const conversions = unitConversions[currentUnit];
                        const availableUnits = Object.keys(conversions);
                        
                        if (availableUnits.length > 0) {
                          const convertedUnit = availableUnits[0];
                          const convertedQty = currentQty * conversions[convertedUnit];
                          setNewIngredient(prev => ({
                            ...prev,
                            unit: convertedUnit,
                            quantity: Math.round(convertedQty * 100) / 100
                          }));
                        }
                      }
                    }}
                    title="Convert to alternative unit"
                    className="px-3 text-sm"
                  >
                    ⇄
                  </Button>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newIngredient.isOptional}
                    onChange={(e) => setNewIngredient(prev => ({ ...prev, isOptional: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Optional</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {ingredient.inventoryItem?.name}
                      {ingredient.isOptional && (
                        <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {ingredient.quantity} {ingredient.unit}
                      {ingredient.notes && ` - ${ingredient.notes}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Available: {ingredient.inventoryItem?.current_qty} {ingredient.inventoryItem?.unit}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.ingredients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No ingredients added yet</p>
                <p className="text-sm">Add ingredients from your inventory to create the product</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
              <Button
                variant="secondary"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </Button>
            </div>

            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, {
                      imageUrl,
                      altText: file.name,
                      isPrimary: prev.images.length === 0,
                      sortOrder: prev.images.length
                    }]
                  }));
                }
              }}
            />


            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages.forEach((img, i) => img.isPrimary = i === index);
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                        className="bg-white text-gray-900"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                        className="bg-white text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.images.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No images uploaded yet</p>
                <p className="text-sm">Upload images or use AI to parse product details from an image</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Instructions & Documents</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleDocumentUpload}
                />
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('document-upload')?.click()}
                  className="flex items-center gap-2"
                  disabled={isDocumentParsing}
                >
                  {isDocumentParsing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Upload Document
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creation Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Step-by-step instructions for creating this product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standard Operating Procedures (SOPs)</label>
              <textarea
                value={formData.sops}
                onChange={(e) => handleInputChange('sops', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed SOPs for production processes..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add tag..."
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergen Flags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergen()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add allergen..."
                  />
                  <Button onClick={handleAddAllergen} disabled={!newAllergen.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergenFlags.map(allergen => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm rounded"
                    >
                      {allergen}
                      <button
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Production Timing & Batch Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                <input
                  type="number"
                  value={formData.batchSize || ''}
                  onChange={(e) => handleInputChange('batchSize', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How many units per batch"
                />
                <p className="text-xs text-gray-500 mt-1">Number of units produced in one batch</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creation Time (minutes)</label>
                <input
                  type="number"
                  value={formData.creationTimeMinutes || ''}
                  onChange={(e) => handleInputChange('creationTimeMinutes', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Time to create one batch"
                />
                <p className="text-xs text-gray-500 mt-1">Approximate time to complete one batch</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (days)</label>
                <input
                  type="number"
                  value={formData.leadTimeDays || ''}
                  onChange={(e) => handleInputChange('leadTimeDays', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Days needed before starting"
                />
                <p className="text-xs text-gray-500 mt-1">Days needed before starting production (e.g., sourdough starter)</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Production Planning</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {formData.batchSize && formData.creationTimeMinutes && (
                  <p>• Each batch produces {formData.batchSize} units in {formData.creationTimeMinutes} minutes</p>
                )}
                {formData.leadTimeDays && (
                  <p>• Requires {formData.leadTimeDays} day{formData.leadTimeDays > 1 ? 's' : ''} advance notice to begin production</p>
                )}
                {formData.ingredients.length > 0 && (
                  <p>• Uses {formData.ingredients.length} ingredient{formData.ingredients.length > 1 ? 's' : ''} from inventory</p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review Product Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {formData.name}</div>
                    <div><span className="font-medium">SKU:</span> {formData.sku}</div>
                    <div><span className="font-medium">Type:</span> {formData.type}</div>
                    <div><span className="font-medium">Price:</span> ${formData.price.toFixed(2)}</div>
                    <div><span className="font-medium">Labor Cost:</span> ${formData.laborCost.toFixed(2)}</div>
                    <div><span className="font-medium">Status:</span> {formData.active ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Production Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    {formData.batchSize && <div><span className="font-medium">Batch Size:</span> {formData.batchSize} units</div>}
                    {formData.creationTimeMinutes && <div><span className="font-medium">Creation Time:</span> {formData.creationTimeMinutes} minutes</div>}
                    {formData.leadTimeDays && <div><span className="font-medium">Lead Time:</span> {formData.leadTimeDays} days</div>}
                    <div><span className="font-medium">Ingredients:</span> {formData.ingredients.length}</div>
                    <div><span className="font-medium">Images:</span> {formData.images.length}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {formData.description || 'No description provided'}
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.allergenFlags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Allergen Flags</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergenFlags.map(allergen => (
                        <span key={allergen} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formData.ingredients.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {ingredient.inventoryItem?.name}
                          {ingredient.isOptional && <span className="text-gray-500"> (Optional)</span>}
                        </span>
                        <span className="text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className="text-sm text-gray-600">Comprehensive product management with AI assistance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!formData.name || !formData.sku || !formData.price}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isLoading || !formData.name || !formData.sku || !formData.price}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductModal;
