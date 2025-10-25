import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Settings, 
  Type, 
  QrCode, 
  BarChart3,
  Save,
  Trash2,
  Eye,
  Download,
  List,
  AlertTriangle,
  ArrowLeft,
  Layout,
  Printer
} from 'lucide-react';
import QRCode from 'qrcode';

interface LabelElement {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image' | 'ingredients' | 'disclaimer' | 'price';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  color?: string;
}

interface LabelBackground {
  type: 'none' | 'color' | 'image';
  value?: string;
  opacity?: number;
}

const sampleData = {
  productName: 'Artisan Bread',
  sku: 'AB-001',
  vendorName: 'Craved Artisan',
  price: '$12.99',
  ingredients: 'Wheat flour, water, salt, yeast, olive oil',
  allergens: 'Contains wheat',
  disclaimer: 'Keep refrigerated. Best by date shown.',
  qrLink: 'https://craved-artisan.com/products/AB-001'
};

// Standard label sizes by printer type
const LABEL_SIZES = {
  'Zebra ZT230': [
    { name: '4x6 inch', width: 400, height: 600, description: 'Standard shipping label' },
    { name: '4x3 inch', width: 400, height: 300, description: 'Small product label' },
    { name: '2x1 inch', width: 200, height: 100, description: 'Price tag' },
    { name: '3x2 inch', width: 300, height: 200, description: 'Product label' },
    { name: '6x4 inch', width: 600, height: 400, description: 'Large format' }
  ],
  'Brother QL-820NWB': [
    { name: '4x6 inch', width: 400, height: 600, description: 'Standard shipping label' },
    { name: '3.5x1.125 inch', width: 350, height: 112, description: 'Name badge' },
    { name: '2.25x1.25 inch', width: 225, height: 125, description: 'Small label' },
    { name: '1x3 inch', width: 100, height: 300, description: 'Address label' }
  ],
  'PDF': [
    { name: '4x6 inch', width: 400, height: 600, description: 'Standard shipping label' },
    { name: '3x2 inch', width: 300, height: 200, description: 'Product label' },
    { name: '2x1 inch', width: 200, height: 100, description: 'Price tag' },
    { name: 'A4 sheet', width: 800, height: 1100, description: 'Full sheet' }
  ]
};

// Default layouts
const DEFAULT_LAYOUTS = {
  'Product Label': {
    name: 'Product Label',
    description: 'Standard product label with name, price, and QR code',
    elements: [
      { type: 'text', x: 10, y: 10, width: 180, height: 20, content: '{{productName}}', fontSize: 14, color: '#000000' },
      { type: 'text', x: 10, y: 35, width: 80, height: 15, content: 'SKU: {{sku}}', fontSize: 10, color: '#666666' },
      { type: 'price', x: 130, y: 35, width: 60, height: 20, content: '{{price}}' },
      { type: 'qr', x: 160, y: 10, width: 30, height: 30, content: '{{qrLink}}' }
    ]
  },
  'Shipping Label': {
    name: 'Shipping Label',
    description: 'Shipping label with address and tracking info',
    elements: [
      { type: 'text', x: 10, y: 10, width: 380, height: 25, content: '{{vendorName}}', fontSize: 16, color: '#000000' },
      { type: 'text', x: 10, y: 40, width: 380, height: 15, content: '{{shippingAddress}}', fontSize: 12, color: '#000000' },
      { type: 'text', x: 10, y: 60, width: 200, height: 15, content: 'Tracking: {{trackingNumber}}', fontSize: 10, color: '#666666' },
      { type: 'barcode', x: 250, y: 60, width: 140, height: 30, content: '{{trackingNumber}}' }
    ]
  },
  'Inventory Label': {
    name: 'Inventory Label',
    description: 'Inventory label with product details and ingredients',
      elements: [
      { type: 'text', x: 10, y: 10, width: 180, height: 20, content: '{{productName}}', fontSize: 14, color: '#000000' },
      { type: 'text', x: 10, y: 35, width: 80, height: 15, content: 'SKU: {{sku}}', fontSize: 10, color: '#666666' },
      { type: 'ingredients', x: 10, y: 55, width: 180, height: 40, content: '{{ingredients}}' },
      { type: 'disclaimer', x: 10, y: 100, width: 180, height: 25, content: '{{disclaimer}}' }
    ]
  },
  'Price Tag': {
    name: 'Price Tag',
    description: 'Simple price tag for retail display',
      elements: [
      { type: 'text', x: 5, y: 5, width: 90, height: 15, content: '{{productName}}', fontSize: 10, color: '#000000' },
      { type: 'price', x: 70, y: 25, width: 25, height: 15, content: '{{price}}' },
      { type: 'text', x: 5, y: 45, width: 90, height: 10, content: '{{vendorName}}', fontSize: 8, color: '#666666' }
    ]
  }
};

export default function TemplateEditorPage() {
  const [elements, setElements] = useState<LabelElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    elementX: 0,
    elementY: 0
  });
  const [showPreview, setShowPreview] = useState(false);
  const [imageUploadRef, setImageUploadRef] = useState<HTMLInputElement | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('Zebra ZT230');
  const [selectedLabelSize, setSelectedLabelSize] = useState<string>('4x6 inch');
  const [labelDimensions, setLabelDimensions] = useState({ width: 400, height: 600 });
  const [labelBackground, setLabelBackground] = useState<LabelBackground>({ type: 'none' });
  const [backgroundUploadRef, setBackgroundUploadRef] = useState<HTMLInputElement | null>(null);

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCode.toDataURL(text, { width: 100 });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handlePrinterChange = (printer: string) => {
    setSelectedPrinter(printer);
    // Reset to first available size for new printer
    const sizes = LABEL_SIZES[printer as keyof typeof LABEL_SIZES];
    if (sizes && sizes.length > 0) {
      setSelectedLabelSize(sizes[0]!.name);
      setLabelDimensions({ width: sizes[0]!.width, height: sizes[0]!.height });
    }
  };

  const handleLabelSizeChange = (sizeName: string) => {
    setSelectedLabelSize(sizeName);
    const sizes = LABEL_SIZES[selectedPrinter as keyof typeof LABEL_SIZES];
    const selectedSize = sizes?.find(size => size.name === sizeName);
    if (selectedSize) {
      setLabelDimensions({ width: selectedSize.width, height: selectedSize.height });
    }
  };

  const applyDefaultLayout = async (layoutName: string) => {
    const layout = DEFAULT_LAYOUTS[layoutName as keyof typeof DEFAULT_LAYOUTS];
    if (!layout) return;

    const newElements: LabelElement[] = [];
    
    for (const element of layout.elements) {
      const id = `${element.type}-${Date.now()}-${Math.random()}`;
      let content = element.content || '';
      
      // Generate QR code if needed
      if (element.type === 'qr' && element.content) {
        content = await generateQRCode(element.content);
      }
      
      newElements.push({
        id,
        type: element.type as LabelElement['type'],
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        content,
        fontSize: element.fontSize,
        color: element.color
      });
    }
    
    setElements(newElements);
    setSelectedElement(null);
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLabelBackground({
          type: 'image',
          value: result,
          opacity: 0.8
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerBackgroundUpload = () => {
    backgroundUploadRef?.click();
  };

  const handleBackgroundColorChange = (color: string) => {
    setLabelBackground({
      type: 'color',
      value: color,
      opacity: 0.3
    });
  };

  const removeBackground = () => {
    setLabelBackground({ type: 'none' });
  };

  const addElement = async (type: LabelElement['type']) => {
    const id = `${type}-${Date.now()}`;
    let content = '';
    let defaultSize = { width: 100, height: 30 };

    switch (type) {
      case 'text':
        content = 'Sample Text';
        break;
      case 'barcode':
        content = '123456789';
        break;
      case 'qr':
        content = await generateQRCode('{{qrLink}}');
        defaultSize = { width: 80, height: 80 };
        break;
      case 'image':
        content = '';
        defaultSize = { width: 100, height: 100 };
        break;
      case 'ingredients':
        content = '{{ingredients}}';
        defaultSize = { width: 120, height: 60 };
        break;
      case 'disclaimer':
        content = '{{disclaimer}}';
        defaultSize = { width: 140, height: 40 };
        break;
      case 'price':
        content = '{{price}}';
        defaultSize = { width: 80, height: 30 };
        break;
    }

    const newElement: LabelElement = {
      id,
      type,
      x: 50,
      y: 50,
      width: defaultSize.width,
      height: defaultSize.height,
      content,
      fontSize: type === 'text' || type === 'price' ? 16 : 12,
      color: '#000000'
    };

    setElements([...elements, newElement]);
    setSelectedElement(id);
  };

  const updateElement = (id: string, updates: Partial<LabelElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (showPreview) return;
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - element.x;
    const offsetY = e.clientY - element.y;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    setSelectedElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showPreview) return;

    if (isDragging && selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      const newX = Math.max(0, Math.min(400 - element.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(200 - element.height, e.clientY - dragOffset.y));

      updateElement(selectedElement, { x: newX, y: newY });
    }

    if (isResizing && selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.elementX;
      let newY = resizeStart.elementY;

      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'n':
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'e':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          break;
        case 'se':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 's':
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
        case 'w':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
      }

      // Ensure element stays within canvas bounds
      newX = Math.max(0, Math.min(400 - newWidth, newX));
      newY = Math.max(0, Math.min(200 - newHeight, newY));

      updateElement(selectedElement, { x: newX, y: newY, width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (showPreview) return;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    setResizeHandle(handle);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
      elementX: element.x,
      elementY: element.y
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      addElement('image').then(() => {
        // Update the last added element with the image URL
        const lastElement = elements[elements.length - 1];
        if (lastElement) {
          updateElement(lastElement.id, { content: imageUrl });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    imageUploadRef?.click();
  };

  const handleSaveTemplate = () => {
    const templateData = {
      elements,
      metadata: {
        name: 'Product Label Template',
        size: { width: 400, height: 200 },
        dpi: 300
      }
    };
    console.log('Template saved:', templateData);
    alert('Template saved successfully!');
  };

  const handleDownloadLabel = () => {
    console.log('Downloading label...');
    alert('Label download feature coming soon!');
  };

  const renderElementContent = (element: LabelElement) => {
    const renderedContent = element.content?.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return sampleData[key as keyof typeof sampleData] || match;
    });

    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: element.fontSize || 16,
              color: element.color || '#000000',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            {renderedContent || 'Sample Text'}
          </div>
        );
      case 'barcode':
        return (
          <div
            style={{
              width: element.width,
              height: element.height,
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '10px'
            }}
          >
            {renderedContent || '123456789'}
          </div>
        );
      case 'qr':
        return (
          <div style={{ width: element.width, height: element.height }}>
            {element.content && element.content.startsWith('data:image') ? (
              <img
                src={element.content}
                alt="QR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  border: '1px dashed #ccc'
                }}
              >
                QR Code
              </div>
            )}
          </div>
        );
      case 'image':
        return (
          <div style={{ width: element.width, height: element.height }}>
            {element.content ? (
              <img
                src={element.content}
                alt="Uploaded"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  border: '1px dashed #ccc'
                }}
              >
                Image
              </div>
            )}
          </div>
        );
      case 'ingredients':
        return (
          <div
            style={{
              width: element.width,
              height: element.height,
              border: '2px solid #10b981',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              flexDirection: 'column',
              fontSize: element.fontSize || 10,
              color: element.color || '#065f46'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Ingredients:</div>
            <div style={{ fontSize: '9px', lineHeight: '1.2' }}>
              {renderedContent || '{{ingredients}}'}
            </div>
          </div>
        );
      case 'disclaimer':
        return (
          <div
            style={{
              width: element.width,
              height: element.height,
              border: '2px solid #f59e0b',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: '#fffbeb',
              display: 'flex',
              flexDirection: 'column',
              fontSize: element.fontSize || 8,
              color: element.color || '#92400e'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Disclaimer:</div>
            <div style={{ fontSize: '7px', lineHeight: '1.1' }}>
              {renderedContent || '{{disclaimer}}'}
            </div>
          </div>
        );
      case 'price':
        return (
          <div
            style={{
              width: element.width,
              height: element.height,
              border: '2px solid #059669',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: element.fontSize || 16,
              color: element.color || '#059669',
              fontWeight: 'bold'
            }}
          >
            {renderedContent || '{{price}}'}
          </div>
        );
      default:
        return null;
    }
  };

  const renderResizeHandles = (element: LabelElement) => {
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const handleSize = 8;

    return handles.map((position) => {
      let style: React.CSSProperties = {
        position: 'absolute',
        width: handleSize,
        height: handleSize,
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        cursor: `${position}-resize`,
        zIndex: 20
      };

      switch (position) {
        case 'nw':
          style.left = -handleSize / 2;
          style.top = -handleSize / 2;
          break;
        case 'n':
          style.left = element.width / 2 - handleSize / 2;
          style.top = -handleSize / 2;
          break;
        case 'ne':
          style.right = -handleSize / 2;
          style.top = -handleSize / 2;
          break;
        case 'e':
          style.right = -handleSize / 2;
          style.top = element.height / 2 - handleSize / 2;
          break;
        case 'se':
          style.right = -handleSize / 2;
          style.bottom = -handleSize / 2;
          break;
        case 's':
          style.left = element.width / 2 - handleSize / 2;
          style.bottom = -handleSize / 2;
          break;
        case 'sw':
          style.left = -handleSize / 2;
          style.bottom = -handleSize / 2;
          break;
        case 'w':
          style.left = -handleSize / 2;
          style.top = element.height / 2 - handleSize / 2;
          break;
      }

      return (
        <div
          key={position}
          className="bg-blue-500"
          style={style}
          onMouseDown={(e) => handleResizeStart(e, position)}
        />
      );
    });
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/vendor" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Label Template Editor</h1>
          </div>
          <div className="text-sm text-gray-500">
            Create and edit product labels
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)] bg-gray-100">
        {/* Hidden file input for image upload */}
        <input
          type="file"
          ref={setImageUploadRef}
          onChange={handleImageUpload}
          accept="image/*"
          title="Upload image file"
          aria-label="Upload image file"
          style={{ display: 'none' }}
        />
        
        {/* Hidden file input for background upload */}
        <input
          type="file"
          ref={setBackgroundUploadRef}
          onChange={handleBackgroundUpload}
          accept="image/*"
          title="Upload background image"
          aria-label="Upload background image"
          style={{ display: 'none' }}
        />
        
      {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col max-h-[calc(100vh-73px)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Label Template Editor</h1>
            <p className="text-sm text-gray-600 mt-1">Design your product labels</p>
        </div>

        {/* Background Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Background</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={triggerBackgroundUpload}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                title="Upload background image"
                aria-label="Upload background image"
              >
                📷 Image
              </button>
              <button
                onClick={() => handleBackgroundColorChange('#f0f0f0')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                title="Set light gray background"
                aria-label="Set light gray background"
              >
                🎨 Light
              </button>
              <button
                onClick={() => handleBackgroundColorChange('#e0e0e0')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                title="Set medium gray background"
                aria-label="Set medium gray background"
              >
                🎨 Medium
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="flex-1 h-8 border border-gray-300 rounded cursor-pointer"
                title="Choose custom background color"
                aria-label="Choose custom background color"
              />
            <button
                onClick={removeBackground}
                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
                title="Remove background"
                aria-label="Remove background"
              >
                ✕ Clear
            </button>
            </div>
            {labelBackground.type !== 'none' && (
              <div className="text-xs text-gray-600">
                Current: {labelBackground.type === 'image' ? 'Image' : 'Color'} 
                {labelBackground.opacity && ` (${Math.round(labelBackground.opacity * 100)}% opacity)`}
              </div>
            )}
          </div>
        </div>

          {/* Default Layouts */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              Quick Layouts
            </h3>
            <div className="space-y-2">
              {Object.entries(DEFAULT_LAYOUTS).map(([key, layout]) => (
                <button
                  key={key}
                  onClick={() => applyDefaultLayout(key)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  title={layout.description}
                  aria-label={`Apply ${layout.name} layout`}
                >
                  <div className="text-sm font-medium text-gray-900">{layout.name}</div>
                  <div className="text-xs text-gray-600">{layout.description}</div>
                </button>
              ))}
            </div>
              </div>

          {/* Add Elements */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement('text')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Add Text Element"
                aria-label="Add Text Element"
              >
                <Type className="w-5 h-5 mr-2" />
                <span className="text-sm">Text</span>
              </button>
              <button
                onClick={() => addElement('qr')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Add QR Code Element"
                aria-label="Add QR Code Element"
              >
                <QrCode className="w-5 h-5 mr-2" />
                <span className="text-sm">QR Code</span>
              </button>
              <button
                onClick={() => addElement('barcode')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Add Barcode Element"
                aria-label="Add Barcode Element"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                <span className="text-sm">Barcode</span>
              </button>
              <button
                onClick={triggerImageUpload}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Upload Image Element"
                aria-label="Upload Image Element"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span className="text-sm">Image</span>
              </button>
              <button
                onClick={() => addElement('ingredients')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Add Ingredients Element"
                aria-label="Add Ingredients Element"
              >
                <List className="w-5 h-5 mr-2" />
                <span className="text-sm">Ingredients</span>
              </button>
            <button
                onClick={() => addElement('disclaimer')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Add Disclaimer Element"
                aria-label="Add Disclaimer Element"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm">Disclaimer</span>
            </button>
              <button
                onClick={() => addElement('price')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Add Price Element"
                aria-label="Add Price Element"
              >
                <span className="text-lg font-bold text-green-600 mr-2">$</span>
                <span className="text-sm">Price</span>
              </button>
                </div>
              </div>

          {/* Elements List */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Elements</h3>
            <div className="space-y-2">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedElement === element.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex items-center justify-between">
              <div>
                      <div className="text-sm font-medium">{element.id}</div>
                      <div className="text-xs text-gray-600">{element.type}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Element"
                      aria-label="Delete Element"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Properties Panel */}
          {selectedElementData && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Properties</h3>
              <div className="space-y-3">
              <div>
                  <label className="block text-xs text-gray-600 mb-1">Content</label>
                  <input
                    type="text"
                    value={selectedElementData.content || ''}
                    onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    title="Element content"
                    aria-label="Element content"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">X</label>
                    <input
                      type="number"
                      value={selectedElementData.x}
                      onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      title="X position"
                      aria-label="X position"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Y</label>
                    <input
                      type="number"
                      value={selectedElementData.y}
                      onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      title="Y position"
                      aria-label="Y position"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      title="Element width"
                      aria-label="Element width"
                    />
              </div>
              <div>
                    <label className="block text-xs text-gray-600 mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      title="Element height"
                      aria-label="Element height"
                    />
                      </div>
                      </div>
                {selectedElementData.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                      <input
                        type="number"
                        value={selectedElementData.fontSize || 16}
                        onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        title="Font size"
                        aria-label="Font size"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElementData.color || '#000000'}
                        onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        title="Text color"
                        aria-label="Text color"
                      />
                </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${
                showPreview 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={showPreview ? "Hide Preview" : "Show Preview"}
              aria-label={showPreview ? "Hide Preview" : "Show Preview"}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleSaveTemplate}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              title="Save Template"
              aria-label="Save Template"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-gray-900">Label Template</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPrinter}
                    onChange={(e) => handlePrinterChange(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select printer"
                    aria-label="Select printer"
                  >
                    {Object.keys(LABEL_SIZES).map((printer) => (
                      <option key={printer} value={printer}>{printer}</option>
                    ))}
                  </select>
                  <select
                    value={selectedLabelSize}
                    onChange={(e) => handleLabelSizeChange(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select label size"
                    aria-label="Select label size"
                  >
                    {LABEL_SIZES[selectedPrinter as keyof typeof LABEL_SIZES]?.map((size) => (
                      <option key={size.name} value={size.name}>{size.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleDownloadLabel}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  title="Export Label"
                  aria-label="Export Label"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Label
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
            <div 
              className="canvas-container bg-white shadow-lg relative"
              style={{ 
                width: `${labelDimensions.width}px`, 
                height: `${labelDimensions.height}px`,
                background: labelBackground.type === 'color' 
                  ? labelBackground.value 
                  : labelBackground.type === 'image' 
                    ? `url(${labelBackground.value}) center/cover` 
                    : 'white'
              }}
              onClick={(e) => {
                if (!showPreview && e.target === e.currentTarget) {
                  setSelectedElement(null);
                }
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Background overlay for opacity control */}
              {labelBackground.type !== 'none' && labelBackground.opacity && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: labelBackground.type === 'color' ? labelBackground.value : 'transparent',
                    opacity: labelBackground.opacity
                  }}
                />
              )}
              {/* Grid overlay - only show when not in preview mode */}
              {!showPreview && (
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `
                    linear-gradient(to right, #ccc 1px, transparent 1px),
                    linear-gradient(to bottom, #ccc 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }} />
              )}
              
              {/* Canvas border */}
              <div className="absolute inset-0 border-2 border-gray-300 rounded" />
              
              {/* Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border-2 ${
                    !showPreview && selectedElement === element.id
                      ? 'border-green-500 bg-green-50 bg-opacity-50'
                      : !showPreview
                      ? 'border-transparent hover:border-blue-300'
                      : 'border-transparent'
                  } ${isDragging && selectedElement === element.id ? 'shadow-lg' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    cursor: showPreview ? 'default' : (isResizing ? 'default' : 'grab'),
                    userSelect: 'none',
                    zIndex: selectedElement === element.id ? 10 : 1,
                    transition: (isDragging || isResizing) && selectedElement === element.id ? 'none' : 'all 0.2s ease'
                  }}
                  onMouseDown={(e) => {
                    if (!showPreview) {
                      // Only start drag if not clicking on a resize handle
                      if (!e.target || !(e.target as HTMLElement).classList.contains('bg-blue-500')) {
                        handleMouseDown(e, element.id);
                      }
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showPreview) {
                      setSelectedElement(element.id);
                    }
                  }}
                >
                  {renderElementContent(element)}
                  {!showPreview && renderResizeHandles(element)}
                </div>
              ))}
              
              {/* Instructions */}
              <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-80 px-2 py-1 rounded">
                {showPreview 
                  ? 'Preview Mode - Click "Hide Preview" to edit' 
                  : 'Click and drag elements to move them • Use blue handles to resize'
                }
        </div>

              {/* Preview mode indicator */}
              {showPreview && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  PREVIEW MODE
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}