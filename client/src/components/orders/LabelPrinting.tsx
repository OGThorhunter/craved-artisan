import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Settings, 
  Upload, 
  X, 
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  RotateCcw
} from 'lucide-react';

interface LabelTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  fields: LabelField[];
  logo?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface LabelField {
  id: string;
  type: 'text' | 'logo' | 'barcode' | 'qr' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  rotation?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    specifications?: string;
  }>;
  expectedDeliveryDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface LabelPrintingProps {
  orders: Order[];
  onClose: () => void;
}

const LabelPrinting: React.FC<LabelPrintingProps> = ({ orders, onClose }) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [labelTemplates, setLabelTemplates] = useState<LabelTemplate[]>([
    {
      id: 'default',
      name: 'Standard Shipping Label',
      width: 4,
      height: 6,
      orientation: 'portrait',
      fields: [
        {
          id: 'logo',
          type: 'logo',
          content: 'LOGO',
          x: 10,
          y: 10,
          width: 60,
          height: 20,
          alignment: 'center'
        },
        {
          id: 'orderNumber',
          type: 'text',
          content: 'Order #: {{orderNumber}}',
          x: 10,
          y: 40,
          width: 80,
          height: 15,
          fontSize: 12,
          fontWeight: 'bold',
          alignment: 'left'
        },
        {
          id: 'customerName',
          type: 'text',
          content: '{{customerName}}',
          x: 10,
          y: 60,
          width: 80,
          height: 15,
          fontSize: 11,
          fontWeight: 'bold',
          alignment: 'left'
        },
        {
          id: 'shippingAddress',
          type: 'text',
          content: '{{shippingAddress.street}}\n{{shippingAddress.city}}, {{shippingAddress.state}} {{shippingAddress.zipCode}}\n{{shippingAddress.country}}',
          x: 10,
          y: 80,
          width: 80,
          height: 40,
          fontSize: 10,
          alignment: 'left'
        },
        {
          id: 'deliveryDate',
          type: 'text',
          content: 'Expected: {{expectedDeliveryDate}}',
          x: 10,
          y: 130,
          width: 80,
          height: 15,
          fontSize: 9,
          alignment: 'left'
        },
        {
          id: 'priority',
          type: 'text',
          content: 'PRIORITY: {{priority}}',
          x: 10,
          y: 150,
          width: 80,
          height: 15,
          fontSize: 10,
          fontWeight: 'bold',
          color: '#dc2626',
          alignment: 'left'
        }
      ],
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 1
    },
    {
      id: 'compact',
      name: 'Compact Label',
      width: 3,
      height: 4,
      orientation: 'portrait',
      fields: [
        {
          id: 'orderNumber',
          type: 'text',
          content: '{{orderNumber}}',
          x: 5,
          y: 5,
          width: 70,
          height: 15,
          fontSize: 14,
          fontWeight: 'bold',
          alignment: 'center'
        },
        {
          id: 'customerName',
          type: 'text',
          content: '{{customerName}}',
          x: 5,
          y: 25,
          width: 70,
          height: 15,
          fontSize: 10,
          alignment: 'center'
        },
        {
          id: 'shippingAddress',
          type: 'text',
          content: '{{shippingAddress.city}}, {{shippingAddress.state}}',
          x: 5,
          y: 45,
          width: 70,
          height: 20,
          fontSize: 8,
          alignment: 'center'
        }
      ],
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 1
    }
  ]);

  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate>(labelTemplates[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = labelTemplates.find(t => t.id === templateId);
    if (template) {
      setCurrentTemplate(template);
      setSelectedTemplate(templateId);
    }
  };

  const renderLabel = (order: Order, template: LabelTemplate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on template
    const dpi = 300; // Print quality
    const width = template.width * dpi;
    const height = template.height * dpi;
    
    canvas.width = width;
    canvas.height = height;

    // Set background
    ctx.fillStyle = template.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    if (template.borderWidth && template.borderWidth > 0) {
      ctx.strokeStyle = template.borderColor || '#000000';
      ctx.lineWidth = template.borderWidth;
      ctx.strokeRect(0, 0, width, height);
    }

    // Render fields
    template.fields.forEach(field => {
      const x = (field.x / 100) * width;
      const y = (field.y / 100) * height;
      const fieldWidth = (field.width / 100) * width;
      const fieldHeight = (field.height / 100) * height;

      ctx.save();

      // Set font
      const fontSize = (field.fontSize || 12) * (dpi / 72); // Convert to pixels
      ctx.font = `${field.fontWeight || 'normal'} ${fontSize}px ${field.fontFamily || 'Arial'}`;
      ctx.fillStyle = field.color || '#000000';
      ctx.textAlign = field.alignment || 'left';

      // Process content with order data
      let content = field.content;
      content = content.replace(/\{\{orderNumber\}\}/g, order.orderNumber);
      content = content.replace(/\{\{customerName\}\}/g, order.customerName);
      content = content.replace(/\{\{customerEmail\}\}/g, order.customerEmail);
      content = content.replace(/\{\{customerPhone\}\}/g, order.customerPhone || '');
      content = content.replace(/\{\{shippingAddress\.street\}\}/g, order.shippingAddress.street);
      content = content.replace(/\{\{shippingAddress\.city\}\}/g, order.shippingAddress.city);
      content = content.replace(/\{\{shippingAddress\.state\}\}/g, order.shippingAddress.state);
      content = content.replace(/\{\{shippingAddress\.zipCode\}\}/g, order.shippingAddress.zipCode);
      content = content.replace(/\{\{shippingAddress\.country\}\}/g, order.shippingAddress.country);
      content = content.replace(/\{\{expectedDeliveryDate\}\}/g, new Date(order.expectedDeliveryDate).toLocaleDateString());
      content = content.replace(/\{\{priority\}\}/g, order.priority.toUpperCase());

      // Handle different field types
      if (field.type === 'text') {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line, x, y + (index * fontSize * 1.2));
        });
      } else if (field.type === 'logo') {
        // Draw logo placeholder
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(x, y, fieldWidth, fieldHeight);
        ctx.fillText('LOGO', x + fieldWidth/2, y + fieldHeight/2);
      }

      ctx.restore();
    });
  };

  const handlePrint = () => {
    const selectedOrderData = orders.filter(order => selectedOrders.includes(order.id));
    
    selectedOrderData.forEach((order, index) => {
      setTimeout(() => {
        renderLabel(order, currentTemplate);
        window.print();
      }, index * 1000); // Delay between prints
    });
  };

  const handleDownload = () => {
    const selectedOrderData = orders.filter(order => selectedOrders.includes(order.id));
    
    selectedOrderData.forEach((order, index) => {
      renderLabel(order, currentTemplate);
      
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `label-${order.orderNumber}-${index + 1}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Label Printing</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Order Selection */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Select Orders</h4>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedOrders.length === orders.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrders.includes(order.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectOrder(order.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(order.expectedDeliveryDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Template and Preview */}
          <div className="flex-1 flex flex-col">
            {/* Template Selection */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Label Template</h4>
                <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  title={isEditing ? 'Switch to preview mode' : 'Switch to edit mode'}
                >
                  <Settings className="h-4 w-4" />
                  <span>{isEditing ? 'Preview' : 'Edit'}</span>
                </button>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    title={previewMode ? 'Hide label preview' : 'Show label preview'}
                  >
                    <Eye className="h-4 w-4" />
                    <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                {labelTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {template.name}
                    <div className="text-xs text-gray-500">
                      {template.width}" × {template.height}"
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Area */}
            {previewMode && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center justify-center">
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-200 rounded"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      title="Label preview"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDownload}
                    disabled={selectedOrders.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={selectedOrders.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Labels</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPrinting;
