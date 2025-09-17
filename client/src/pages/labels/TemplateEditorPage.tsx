import React, { useState, useCallback, useMemo } from 'react';
import { LabelPreview } from '@/features/labels/preview';
import type { 
  LabelTemplateVariant, 
  LabelElement, 
  SampleData, 
  DPI 
} from '@/features/labels/preview/types';
import { defaultSampleData, sampleDataVariants } from '@/features/labels/preview/sampleData';
import { buildCanvasSize, formatDimensions } from '@/features/labels/preview/units';
import { 
  Settings, 
  Palette, 
  Type, 
  Image, 
  QrCode, 
  BarChart3,
  Save,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';

export default function TemplateEditorPage() {
  const [selectedVariant, setSelectedVariant] = useState<string>('default');
  const [selectedElement, setSelectedElement] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'canvas' | 'elements' | 'sample'>('canvas');
  const [customSampleData, setCustomSampleData] = useState<string>(JSON.stringify(defaultSampleData, null, 2));

  // Create default template variant
  const defaultVariant: LabelTemplateVariant = {
    id: 'default',
    name: 'Standard Label',
    units: {
      widthIn: 4,
      heightIn: 2,
      dpi: 300,
      bleedIn: 0.125,
      safeIn: 0.25
    },
    elements: [
      {
        id: 'logo',
        type: 'image',
        x: 10,
        y: 10,
        w: 60,
        h: 30,
        fit: 'contain',
        bindingKey: '{{vendor.logo}}'
      },
      {
        id: 'product-name',
        type: 'text',
        x: 80,
        y: 15,
        w: 200,
        h: 20,
        text: '{{product.title}}',
        fontFamily: 'Arial',
        fontSizePt: 14,
        fontWeight: 'bold',
        color: '#000000',
        align: 'left',
        bindingKey: '{{product.title}}'
      },
      {
        id: 'sku',
        type: 'text',
        x: 80,
        y: 40,
        w: 100,
        h: 15,
        text: 'SKU: {{product.sku}}',
        fontFamily: 'Arial',
        fontSizePt: 10,
        color: '#666666',
        align: 'left',
        bindingKey: '{{product.sku}}'
      },
      {
        id: 'allergens',
        type: 'text',
        x: 10,
        y: 50,
        w: 300,
        h: 30,
        text: 'Allergens: {{product.allergens}}',
        fontFamily: 'Arial',
        fontSizePt: 9,
        color: '#d32f2f',
        align: 'left',
        bindingKey: '{{product.allergens}}'
      },
      {
        id: 'qr-code',
        type: 'qr',
        x: 250,
        y: 10,
        w: 40,
        h: 40,
        value: '{{qrPayload}}',
        ecc: 'M',
        bindingKey: '{{qrPayload}}'
      }
    ]
  };

  // Template variants
  const variants: LabelTemplateVariant[] = [
    defaultVariant,
    {
      id: 'small',
      name: 'Small Label (2x1)',
      units: {
        widthIn: 2,
        heightIn: 1,
        dpi: 300,
        bleedIn: 0.0625,
        safeIn: 0.125
      },
      elements: [
        {
          id: 'product-name-small',
          type: 'text',
          x: 10,
          y: 20,
          w: 180,
          h: 20,
          text: '{{product.title}}',
          fontFamily: 'Arial',
          fontSizePt: 12,
          fontWeight: 'bold',
          color: '#000000',
          align: 'center',
          bindingKey: '{{product.title}}'
        },
        {
          id: 'qr-small',
          type: 'qr',
          x: 200,
          y: 10,
          w: 30,
          h: 30,
          value: '{{qrPayload}}',
          ecc: 'L',
          bindingKey: '{{qrPayload}}'
        }
      ]
    },
    {
      id: 'large',
      name: 'Large Label (6x4)',
      units: {
        widthIn: 6,
        heightIn: 4,
        dpi: 300,
        bleedIn: 0.125,
        safeIn: 0.25
      },
      elements: [
        {
          id: 'logo-large',
          type: 'image',
          x: 20,
          y: 20,
          w: 100,
          h: 50,
          fit: 'contain',
          bindingKey: '{{vendor.logo}}'
        },
        {
          id: 'product-name-large',
          type: 'text',
          x: 140,
          y: 30,
          w: 300,
          h: 30,
          text: '{{product.title}}',
          fontFamily: 'Arial',
          fontSizePt: 18,
          fontWeight: 'bold',
          color: '#000000',
          align: 'left',
          bindingKey: '{{product.title}}'
        },
        {
          id: 'description',
          type: 'text',
          x: 20,
          y: 100,
          w: 400,
          h: 60,
          text: 'Fresh baked daily with premium ingredients',
          fontFamily: 'Arial',
          fontSizePt: 12,
          color: '#666666',
          align: 'left'
        },
        {
          id: 'allergens-large',
          type: 'text',
          x: 20,
          y: 180,
          w: 400,
          h: 40,
          text: 'Allergens: {{product.allergens}}',
          fontFamily: 'Arial',
          fontSizePt: 11,
          color: '#d32f2f',
          align: 'left',
          bindingKey: '{{product.allergens}}'
        },
        {
          id: 'qr-large',
          type: 'qr',
          x: 450,
          y: 20,
          w: 80,
          h: 80,
          value: '{{qrPayload}}',
          ecc: 'H',
          bindingKey: '{{qrPayload}}'
        }
      ]
    }
  ];

  const currentVariant = variants.find(v => v.id === selectedVariant) || defaultVariant;
  const canvasSize = buildCanvasSize(currentVariant.units);

  // Parse sample data
  const sampleData = useMemo(() => {
    try {
      return JSON.parse(customSampleData);
    } catch {
      return defaultSampleData;
    }
  }, [customSampleData]);

  // Handle element updates
  const handleElementUpdate = useCallback((updatedElement: LabelElement) => {
    // In a real implementation, this would update the variant's elements
    console.log('Element updated:', updatedElement);
  }, []);

  // Handle sample data change
  const handleSampleDataChange = useCallback((newData: string) => {
    setCustomSampleData(newData);
  }, []);

  // Handle variant change
  const handleVariantChange = useCallback((variantId: string) => {
    setSelectedVariant(variantId);
    setSelectedElement(undefined);
  }, []);

  // Add new element
  const handleAddElement = useCallback((type: LabelElement['type']) => {
    const newElement: LabelElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      w: type === 'text' ? 100 : type === 'qr' ? 40 : 80,
      h: type === 'text' ? 20 : type === 'qr' ? 40 : 60,
      ...(type === 'text' && {
        text: 'New Text',
        fontFamily: 'Arial',
        fontSizePt: 12,
        color: '#000000',
        align: 'left'
      }),
      ...(type === 'image' && {
        fit: 'contain'
      }),
      ...(type === 'shape' && {
        shape: 'rect',
        fill: '#f3f4f6',
        stroke: '#d1d5db',
        strokeWidth: 1
      }),
      ...(type === 'qr' && {
        value: 'https://example.com',
        ecc: 'M'
      }),
      ...(type === 'barcode' && {
        value: '123456789',
        format: 'code128'
      })
    };

    // In a real implementation, this would add the element to the variant
    console.log('Add element:', newElement);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Label Template Editor</h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentVariant.name} - {formatDimensions(currentVariant.units.widthIn, currentVariant.units.dpi)} × {formatDimensions(currentVariant.units.heightIn, currentVariant.units.dpi)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'canvas', label: 'Canvas', icon: Settings },
            { id: 'elements', label: 'Elements', icon: Palette },
            { id: 'sample', label: 'Sample Data', icon: Type }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'canvas' && (
            <div className="p-4 space-y-4">
              {/* Variant Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Variant
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Select template variant"
                >
                  {variants.map(variant => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Label Dimensions</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Width: {formatDimensions(currentVariant.units.widthIn, currentVariant.units.dpi)}</div>
                  <div>Height: {formatDimensions(currentVariant.units.heightIn, currentVariant.units.dpi)}</div>
                  <div>DPI: {currentVariant.units.dpi}</div>
                  {currentVariant.units.bleedIn && (
                    <div>Bleed: {formatDimensions(currentVariant.units.bleedIn, currentVariant.units.dpi)}</div>
                  )}
                  {currentVariant.units.safeIn && (
                    <div>Safe Area: {formatDimensions(currentVariant.units.safeIn, currentVariant.units.dpi)}</div>
                  )}
                </div>
              </div>

              {/* Sample Data Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Data Presets
                </label>
                <div className="space-y-2">
                  {Object.entries(sampleDataVariants).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setCustomSampleData(JSON.stringify(data, null, 2))}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)} Sample
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'elements' && (
            <div className="p-4 space-y-4">
              {/* Add Elements */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'text', icon: Type, label: 'Text' },
                    { type: 'image', icon: Image, label: 'Image' },
                    { type: 'shape', icon: Palette, label: 'Shape' },
                    { type: 'qr', icon: QrCode, label: 'QR Code' },
                    { type: 'barcode', icon: BarChart3, label: 'Barcode' }
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => handleAddElement(type as LabelElement['type'])}
                      className="flex flex-col items-center space-y-1 p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                    >
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Element List */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Elements</h3>
                <div className="space-y-1">
                  {currentVariant.elements.map((element) => (
                    <div
                      key={element.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        selectedElement === element.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm font-medium">{element.id}</span>
                        <span className="text-xs text-gray-500">({element.type})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy element"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete element"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sample' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Data (JSON)
                </label>
                <textarea
                  value={customSampleData}
                  onChange={(e) => handleSampleDataChange(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sample data JSON..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Save className="h-4 w-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Preview Area */}
      <div className="flex-1 flex flex-col">
        <LabelPreview
          variant={currentVariant}
          sample={sampleData}
          onElementUpdate={handleElementUpdate}
          onSelectionChange={setSelectedElement}
        />
      </div>
    </div>
  );
}
