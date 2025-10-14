import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  BarChart3, 
  Grid, 
  Search, 
  Eye, 
  Plus, 
  Download,
  Sparkles,
  Tag,
  Mail,
  QrCode
} from 'lucide-react';
import type { TemplatePreset } from '../../services/labelTemplatePresets';
import { 
  getTemplatePresets, 
  getPresetsByCategory, 
  getCategories,
  presetToTemplate 
} from '../../services/labelTemplatePresets';
import type { LabelTemplate } from '../../types/label-templates';

interface TemplatePresetBrowserProps {
  onSelectPreset: (template: LabelTemplate) => void;
  onClose: () => void;
  currentUserId: string;
}

const categoryIcons = {
  shipping: Truck,
  product: Package,
  barcode: BarChart3,
  general: Grid
};

const categoryColors = {
  shipping: 'blue',
  product: 'green',
  barcode: 'purple',
  general: 'gray'
};

export const TemplatePresetBrowser: React.FC<TemplatePresetBrowserProps> = ({
  onSelectPreset,
  onClose,
  currentUserId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPreset, setPreviewPreset] = useState<TemplatePreset | null>(null);

  const categories = getCategories();
  const allPresets = getTemplatePresets();

  // Filter presets based on category and search
  const filteredPresets = allPresets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleSelectPreset = (preset: TemplatePreset) => {
    const template = presetToTemplate(preset, currentUserId);
    onSelectPreset(template);
    onClose();
  };

  const renderPresetCard = (preset: TemplatePreset) => {
    const CategoryIcon = categoryIcons[preset.category];
    const colorClass = categoryColors[preset.category];

    return (
      <div
        key={preset.id}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg bg-${colorClass}-100 text-${colorClass}-600`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{preset.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{preset.category}</p>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-3 min-h-[120px] flex items-center justify-center">
          <div 
            className="border-2 border-dashed border-gray-300 rounded bg-white relative overflow-hidden max-w-[100px] max-h-[80px]"
          >
            {/* Simulated label content */}
            <div className="p-1 text-xs">
              {preset.category === 'shipping' && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[6px]">FROM: Vendor</div>
                  <div className="font-bold text-[7px]">SHIP TO: Customer</div>
                  <div className="bg-black h-2 w-full mt-1"></div>
                </div>
              )}
              {preset.category === 'product' && (
                <div className="space-y-0.5">
                  <div className="font-bold text-[7px]">Product Name</div>
                  <div className="text-[6px]">$9.99</div>
                  <div className="bg-black h-1.5 w-full mt-0.5"></div>
                </div>
              )}
              {preset.category === 'barcode' && (
                <div className="space-y-0.5 text-center">
                  <div className="bg-black h-3 w-full"></div>
                  <div className="text-[5px] font-mono">123456789</div>
                </div>
              )}
              {preset.category === 'general' && (
                <div className="space-y-0.5">
                  <div className="text-[7px]">Address Line</div>
                  <div className="text-[6px]">City, State</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {preset.description}
        </p>

        {/* Dimensions */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{(preset.width / 25.4).toFixed(1)}" × {(preset.height / 25.4).toFixed(1)}"</span>
          <span>{preset.template.fields.length} elements</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewPreset(preset);
            }}
            className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => handleSelectPreset(preset)}
            className="flex-1 px-3 py-2 text-xs bg-brand-green text-white rounded hover:bg-brand-green/90 transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Use</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Template Presets</h2>
                <p className="text-sm text-gray-600">Choose from professionally designed label templates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
              />
            </div>

            {/* Category Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-brand-green text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All ({allPresets.length})
              </button>
              {categories.map((cat) => {
                const CategoryIcon = categoryIcons[cat.category as keyof typeof categoryIcons];
                return (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                      selectedCategory === cat.category
                        ? 'bg-brand-green text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <CategoryIcon className="w-4 h-4" />
                    <span className="capitalize">{cat.category} ({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPresets.map(renderPresetCard)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredPresets.length} template{filteredPresets.length !== 1 ? 's' : ''} available
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewPreset && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{previewPreset.name}</h3>
              <button
                onClick={() => setPreviewPreset(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Template Preview</p>
              <div 
                className="bg-white border-2 border-dashed border-gray-300 rounded mx-auto max-w-[300px] max-h-[200px]"
              >
                <div className="p-4 text-sm text-gray-600">
                  <div className="font-semibold mb-2">{previewPreset.name}</div>
                  <div className="text-xs">{previewPreset.description}</div>
                  <div className="mt-4 text-xs">
                    {previewPreset.template.fields.length} elements • {(previewPreset.width / 25.4).toFixed(1)}" × {(previewPreset.height / 25.4).toFixed(1)}"
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setPreviewPreset(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSelectPreset(previewPreset);
                  setPreviewPreset(null);
                }}
                className="px-4 py-2 bg-brand-green text-white rounded hover:bg-brand-green/90"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
