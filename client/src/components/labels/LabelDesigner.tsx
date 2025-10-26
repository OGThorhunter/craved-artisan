import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Move, 
  Type, 
  Image, 
  BarChart3, 
  QrCode,
  Minus,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Save,
  Eye,
  Download,
  Upload,
  Grid,
  Ruler,
  MousePointer,
  Square,
  Circle,
  Minus as LineIcon,
  X
} from 'lucide-react';
// import type { LabelTemplate, LabelField, LabelDesignerState } from '../../types/labels'; // Module doesn't exist
// Inline minimal types to satisfy TypeScript
type LabelTemplate = any;
type LabelField = any;
type LabelDesignerState = any;

interface LabelDesignerProps {
  template: LabelTemplate | null;
  onSave: (template: LabelTemplate) => void;
  onClose: () => void;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  fieldId: string | null;
  dragOffset: { x: number; y: number };
}

const LabelDesigner: React.FC<LabelDesignerProps> = ({
  template,
  onSave,
  onClose
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate | null>(template);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    fieldId: null,
    dragOffset: { x: 0, y: 0 }
  });
  const [designerState, setDesignerState] = useState<LabelDesignerState>({
    selectedField: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    zoom: 1,
    gridSize: 5,
    showGrid: true,
    snapToGrid: true
  });
  const [showFieldPanel, setShowFieldPanel] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 240 });

  // Initialize template
  useEffect(() => {
    if (template) {
      setCurrentTemplate(template);
    } else {
      // Create new template
      const newTemplate: LabelTemplate = {
        id: `template-${Date.now()}`,
        name: 'New Template',
        description: 'Custom label template',
        width: 100, // 100mm
        height: 60, // 60mm
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user'
      };
      setCurrentTemplate(newTemplate);
    }
  }, [template]);

  // Update canvas size based on template dimensions
  useEffect(() => {
    if (currentTemplate) {
      const scale = 4; // mm to pixels
      setCanvasSize({
        width: currentTemplate.width * scale,
        height: currentTemplate.height * scale
      });
    }
  }, [currentTemplate]);

  const addField = (type: LabelField['type']) => {
    if (!currentTemplate) return;

    const newField: LabelField = {
      id: `field-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      x: 10,
      y: 10,
      width: getDefaultWidth(type),
      height: getDefaultHeight(type),
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      alignment: 'left',
      rotation: 0,
      dataSource: getDefaultDataSource(type)
    };

    setCurrentTemplate(prev => prev ? {
      ...prev,
      fields: [...prev.fields, newField]
    } : null);
    setSelectedField(newField.id);
    setShowPropertiesPanel(true);
  };

  const getDefaultContent = (type: LabelField['type']): string => {
    switch (type) {
      case 'text': return 'Sample Text';
      case 'barcode': return '123456789';
      case 'qr': return 'https://example.com';
      case 'image': return '';
      case 'line': return '';
      case 'rectangle': return '';
      default: return '';
    }
  };

  const getDefaultWidth = (type: LabelField['type']): number => {
    switch (type) {
      case 'text': return 30;
      case 'barcode': return 40;
      case 'qr': return 20;
      case 'image': return 25;
      case 'line': return 50;
      case 'rectangle': return 30;
      default: return 20;
    }
  };

  const getDefaultHeight = (type: LabelField['type']): number => {
    switch (type) {
      case 'text': return 8;
      case 'barcode': return 15;
      case 'qr': return 20;
      case 'image': return 20;
      case 'line': return 1;
      case 'rectangle': return 15;
      default: return 8;
    }
  };

  const getDefaultDataSource = (type: LabelField['type']): string => {
    switch (type) {
      case 'text': return 'orderNumber';
      case 'barcode': return 'orderNumber';
      case 'qr': return 'orderId';
      case 'image': return '';
      case 'line': return '';
      case 'rectangle': return '';
      default: return '';
    }
  };

  const deleteField = (fieldId: string) => {
    if (!currentTemplate) return;

    setCurrentTemplate(prev => prev ? {
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    } : null);
    setSelectedField(null);
    setShowPropertiesPanel(false);
  };

  const updateField = (fieldId: string, updates: Partial<LabelField>) => {
    if (!currentTemplate) return;

    setCurrentTemplate(prev => prev ? {
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    } : null);
  };

  const getSelectedField = (): LabelField | null => {
    if (!currentTemplate || !selectedField) return null;
    return currentTemplate.fields.find(field => field.id === selectedField) || null;
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedField(fieldId);
    setShowPropertiesPanel(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      fieldId,
      dragOffset: { x: 0, y: 0 }
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.fieldId || !currentTemplate) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    
    const field = currentTemplate.fields.find(f => f.id === dragState.fieldId);
    if (!field) return;

    let newX = field.x + deltaX / designerState.zoom;
    let newY = field.y + deltaY / designerState.zoom;

    // Snap to grid
    if (designerState.snapToGrid) {
      newX = Math.round(newX / designerState.gridSize) * designerState.gridSize;
      newY = Math.round(newY / designerState.gridSize) * designerState.gridSize;
    }

    // Keep within canvas bounds
    newX = Math.max(0, Math.min(newX, currentTemplate.width - field.width));
    newY = Math.max(0, Math.min(newY, currentTemplate.height - field.height));

    updateField(dragState.fieldId, { x: newX, y: newY });
  }, [dragState, currentTemplate, designerState.zoom, designerState.snapToGrid, designerState.gridSize]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      fieldId: null,
      dragOffset: { x: 0, y: 0 }
    });
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedField(null);
      setShowPropertiesPanel(false);
    }
  };

  const renderField = (field: LabelField) => {
    const scale = designerState.zoom;
    const isSelected = selectedField === field.id;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: field.x * scale,
      top: field.y * scale,
      width: field.width * scale,
      height: field.height * scale,
      fontSize: field.fontSize * scale,
      fontFamily: field.fontFamily,
      fontWeight: field.fontWeight,
      color: field.color,
      backgroundColor: field.backgroundColor,
      textAlign: field.alignment,
      transform: `rotate(${field.rotation}deg)`,
      cursor: 'move',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: field.alignment === 'center' ? 'center' : field.alignment === 'right' ? 'flex-end' : 'flex-start',
      zIndex: isSelected ? 10 : 1,
      border: isSelected ? '2px solid #3b82f6' : (field.borderWidth > 0 ? `${field.borderWidth}px solid ${field.borderColor}` : '1px solid #e5e7eb'),
      borderRadius: '2px'
    };

    const renderFieldContent = () => {
      switch (field.type) {
        case 'text':
          return field.content || 'Sample Text';
        case 'barcode':
          return `*${field.content}*`;
        case 'qr':
          return 'QR Code';
        case 'image':
          return 'Image';
        case 'line':
          return <div style={{ width: '100%', height: '1px', backgroundColor: field.color }} />;
        case 'rectangle':
          return <div style={{ width: '100%', height: '100%', backgroundColor: field.backgroundColor, border: `1px solid ${field.borderColor}` }} />;
        default:
          return field.content;
      }
    };

    return (
      <div
        key={field.id}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, field.id)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedField(field.id);
          setShowPropertiesPanel(true);
        }}
      >
        {renderFieldContent()}
      </div>
    );
  };

  const handleSave = () => {
    if (currentTemplate) {
      onSave(currentTemplate);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      // Generate sample preview data
      setPreviewData({
        orderNumber: 'ORD-2025-001',
        customerName: 'John Doe',
        customerAddress: '123 Main St, City, State 12345',
        products: [
          { name: 'Product 1', quantity: 2 },
          { name: 'Product 2', quantity: 1 }
        ],
        priority: 'high',
        expectedDelivery: '2025-02-01',
        trackingNumber: 'TRK123456789',
        barcode: '123456789',
        qrCode: 'https://example.com/order/ORD-2025-001'
      });
    }
  };

  if (!currentTemplate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Type className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Label Designer</h3>
              <p className="text-sm text-gray-600">{currentTemplate.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreview}
              className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${
                previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>{previewMode ? 'Design' : 'Preview'}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close designer"
              aria-label="Close designer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Tools */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Fields</h4>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { type: 'text', icon: Type, label: 'Text' },
                  { type: 'barcode', icon: BarChart3, label: 'Barcode' },
                  { type: 'qr', icon: QrCode, label: 'QR Code' },
                  { type: 'image', icon: Image, label: 'Image' },
                  { type: 'line', icon: LineIcon, label: 'Line' },
                  { type: 'rectangle', icon: Square, label: 'Rectangle' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => addField(type as LabelField['type'])}
                    className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-700">{label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Design Tools</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={designerState.showGrid}
                        onChange={(e) => setDesignerState(prev => ({ ...prev, showGrid: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show Grid</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={designerState.snapToGrid}
                        onChange={(e) => setDesignerState(prev => ({ ...prev, snapToGrid: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Snap to Grid</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDesignerState(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Zoom out"
                      aria-label="Zoom out"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-700 w-12 text-center">
                      {Math.round(designerState.zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setDesignerState(prev => ({ ...prev, zoom: Math.min(2, prev.zoom + 0.1) }))}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Zoom in"
                      aria-label="Zoom in"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Canvas */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-center h-full">
              <div
                ref={canvasRef}
                className="relative border-2 border-gray-300 bg-white shadow-lg"
                style={{
                  width: canvasSize.width * designerState.zoom,
                  height: canvasSize.height * designerState.zoom,
                  backgroundImage: designerState.showGrid 
                    ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
                    : 'none',
                  backgroundSize: `${designerState.gridSize * designerState.zoom}px ${designerState.gridSize * designerState.zoom}px`
                }}
                onClick={handleCanvasClick}
              >
                {currentTemplate.fields.map(renderField)}
                
                {/* Canvas dimensions label */}
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                  {currentTemplate.width}mm × {currentTemplate.height}mm
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          {showPropertiesPanel && getSelectedField() && (
            <div className="w-80 border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Field Properties</h4>
                  <button
                    onClick={() => {
                      setShowPropertiesPanel(false);
                      setSelectedField(null);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Close properties panel"
                    aria-label="Close properties panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {getSelectedField() && (
                  <FieldPropertiesPanel
                    field={getSelectedField()!}
                    onUpdate={(updates) => updateField(getSelectedField()!.id, updates)}
                    onDelete={() => deleteField(getSelectedField()!.id)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Field Properties Panel Component
interface FieldPropertiesPanelProps {
  field: LabelField;
  onUpdate: (updates: Partial<LabelField>) => void;
  onDelete: () => void;
}

const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onUpdate,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {/* Basic Properties */}
      <div>
        <h5 className="text-xs font-medium text-gray-600 mb-2">Basic Properties</h5>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Content</label>
            <input
              type="text"
              value={field.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Field content"
              aria-label="Field content"
              placeholder="Enter field content"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X Position</label>
              <input
                type="number"
                value={field.x}
                onChange={(e) => onUpdate({ x: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="X position in millimeters"
                aria-label="X position in millimeters"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y Position</label>
              <input
                type="number"
                value={field.y}
                onChange={(e) => onUpdate({ y: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Y position in millimeters"
                aria-label="Y position in millimeters"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={field.width}
                onChange={(e) => onUpdate({ width: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Width in millimeters"
                aria-label="Width in millimeters"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                value={field.height}
                onChange={(e) => onUpdate({ height: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Height in millimeters"
                aria-label="Height in millimeters"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Text Properties */}
      {field.type === 'text' && (
        <div>
          <h5 className="text-xs font-medium text-gray-600 mb-2">Text Properties</h5>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <input
                type="number"
                value={field.fontSize || 12}
                onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 12 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Font size in points"
                aria-label="Font size in points"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Family</label>
              <select
                value={field.fontFamily || 'Arial, sans-serif'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Font family"
                aria-label="Font family"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
              <select
                value={field.fontWeight || 'normal'}
                onChange={(e) => onUpdate({ fontWeight: e.target.value as any })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Font weight"
                aria-label="Font weight"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignment</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => onUpdate({ alignment: 'left' })}
                  className={`p-1 rounded ${field.alignment === 'left' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  title="Align left"
                  aria-label="Align left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onUpdate({ alignment: 'center' })}
                  className={`p-1 rounded ${field.alignment === 'center' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  title="Align center"
                  aria-label="Align center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onUpdate({ alignment: 'right' })}
                  className={`p-1 rounded ${field.alignment === 'right' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  title="Align right"
                  aria-label="Align right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colors */}
      <div>
        <h5 className="text-xs font-medium text-gray-600 mb-2">Colors</h5>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={field.color || '#000000'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-8 border border-gray-300 rounded"
              title="Text color"
              aria-label="Text color"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={field.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-full h-8 border border-gray-300 rounded"
              title="Background color"
              aria-label="Background color"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Color</label>
            <input
              type="color"
              value={field.borderColor || '#000000'}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
              className="w-full h-8 border border-gray-300 rounded"
              title="Border color"
              aria-label="Border color"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Width</label>
            <input
              type="number"
              value={field.borderWidth || 0}
              onChange={(e) => onUpdate({ borderWidth: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Border width in pixels"
              aria-label="Border width in pixels"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div>
        <h5 className="text-xs font-medium text-gray-600 mb-2">Data Source</h5>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Field Mapping</label>
          <select
            value={field.dataSource || ''}
            onChange={(e) => onUpdate({ dataSource: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Data source field"
            aria-label="Data source field"
          >
            <option value="">Static Content</option>
            <option value="orderNumber">Order Number</option>
            <option value="customerName">Customer Name</option>
            <option value="customerAddress">Customer Address</option>
            <option value="priority">Priority</option>
            <option value="totalAmount">Total Amount</option>
            <option value="expectedDelivery">Expected Delivery</option>
            <option value="trackingNumber">Tracking Number</option>
            <option value="barcode">Barcode</option>
            <option value="qrCode">QR Code</option>
          </select>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <h5 className="text-xs font-medium text-gray-600 mb-2">Transform</h5>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Rotation (degrees)</label>
          <input
            type="number"
            value={field.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Rotation in degrees"
            aria-label="Rotation in degrees"
            placeholder="0"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Field</span>
        </button>
      </div>
    </div>
  );
};

export default LabelDesigner;
