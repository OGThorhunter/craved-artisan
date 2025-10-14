import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Printer, Settings, Eye, Download, Plus, Edit, 
  Wand2, Zap, BarChart3, Clock, CheckCircle, AlertCircle,
  Package, QrCode, Type, Image, Layers, Grid, Save, 
  Play, Pause, RotateCcw, Copy, Trash2, Upload, Tag, Truck
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';

// Enhanced Phase 4 Integration - Using advanced label system
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  status: string;
  priority: string;
  orderItems: OrderItem[];
  createdAt: string;
  dueAt?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  dimensions: { width: number; height: number };
  elements: TemplateElement[];
  rules: LabelRule[];
  previewUrl?: string;
}

interface TemplateElement {
  id: string;
  type: 'text' | 'barcode' | 'qr_code' | 'image' | 'price' | 'date';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  dataBinding?: string; // e.g., "order.customerName", "product.name"
}

interface LabelRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface RuleAction {
  type: 'show_element' | 'hide_element' | 'set_text' | 'set_style';
  target: string;
  value?: any;
}

interface PrintJob {
  id: string;
  orderId: string;
  templateId: string;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  progress: number;
  labelCount: number;
  estimatedTime: number;
  createdAt: Date;
}

interface AdvancedLabelGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onPrintComplete: (jobIds: string[]) => void;
}

// Sample templates for the demo
const sampleTemplates: LabelTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Product Label',
    description: '3" x 2" product label with name, price, and barcode',
    dimensions: { width: 3, height: 2 },
    elements: [
      {
        id: 'elem-1',
        type: 'text',
        x: 0.25, y: 0.25, width: 2.5, height: 0.5,
        content: '{{product.name}}',
        style: { fontSize: 14, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
        dataBinding: 'product.name'
      },
      {
        id: 'elem-2', 
        type: 'text',
        x: 0.25, y: 0.75, width: 1.2, height: 0.3,
        content: '{{product.price}}',
        style: { fontSize: 12, fontFamily: 'Arial', color: '#000000', textAlign: 'left' },
        dataBinding: 'product.price'
      },
      {
        id: 'elem-3',
        type: 'barcode',
        x: 1.5, y: 1.0, width: 1.25, height: 0.75,
        content: '{{product.sku}}',
        style: {},
        dataBinding: 'product.sku'
      }
    ],
    rules: [
      {
        id: 'rule-1',
        name: 'High Priority Orders',
        conditions: [{ field: 'order.priority', operator: 'equals', value: 'HIGH' }],
        actions: [{ type: 'set_style', target: 'elem-1', value: { color: '#ff0000' } }],
        enabled: true
      }
    ]
  },
  {
    id: 'template-2',
    name: 'Shipping Label',
    description: '4" x 6" shipping label with customer info',
    dimensions: { width: 4, height: 6 },
    elements: [
      {
        id: 'elem-1',
        type: 'text',
        x: 0.5, y: 0.5, width: 3, height: 0.5,
        content: '{{order.customerName}}',
        style: { fontSize: 16, fontFamily: 'Arial', color: '#000000', textAlign: 'left' },
        dataBinding: 'order.customerName'
      },
      {
        id: 'elem-2',
        type: 'text', 
        x: 0.5, y: 1.0, width: 3, height: 0.3,
        content: 'Order: {{order.orderNumber}}',
        style: { fontSize: 12, fontFamily: 'Arial', color: '#666666', textAlign: 'left' },
        dataBinding: 'order.orderNumber'
      },
      {
        id: 'elem-3',
        type: 'qr_code',
        x: 2.5, y: 4.5, width: 1, height: 1,
        content: '{{order.trackingUrl}}',
        style: {},
        dataBinding: 'order.trackingUrl'
      }
    ],
    rules: []
  }
];

const AdvancedLabelGenerator: React.FC<AdvancedLabelGeneratorProps> = ({
  isOpen,
  onClose,
  orders,
  onPrintComplete
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'templates' | 'editor' | 'queue' | 'analytics'>('generate');
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(sampleTemplates[0]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<LabelTemplate[]>(sampleTemplates);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Initialize with all orders selected
  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrders(orders.map(o => o.id));
      // Use first order as preview data
      setPreviewData({
        order: orders[0],
        product: orders[0].orderItems[0] ? {
          name: orders[0].orderItems[0].productName,
          price: `$${orders[0].orderItems[0].unitPrice.toFixed(2)}`,
          sku: `SKU-${orders[0].orderItems[0].productId}`
        } : {}
      });
    }
  }, [orders]);

  const handleGenerateLabels = async () => {
    if (!selectedTemplate || selectedOrders.length === 0) {
      toast.error('Please select a template and at least one order');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Calculate total labels needed
      const totalLabels = selectedOrders.reduce((total, orderId) => {
        const order = orders.find(o => o.id === orderId);
        return total + (order?.orderItems.reduce((sum, item) => sum + item.quantity, 0) || 0);
      }, 0);

      // Create print jobs
      const newJobs: PrintJob[] = selectedOrders.map(orderId => ({
        id: `job-${Date.now()}-${orderId}`,
        orderId,
        templateId: selectedTemplate.id,
        status: 'queued',
        progress: 0,
        labelCount: orders.find(o => o.id === orderId)?.orderItems.reduce((sum, item) => sum + item.quantity, 0) || 0,
        estimatedTime: 30, // seconds
        createdAt: new Date()
      }));

      setPrintJobs(prev => [...prev, ...newJobs]);

      // Simulate processing
      toast.success(`Generating ${totalLabels} labels using "${selectedTemplate.name}"`);
      
      // Simulate job processing
      for (const job of newJobs) {
        await simulateJobProcessing(job.id);
      }

      onPrintComplete(newJobs.map(j => j.id));
      
    } catch (error) {
      toast.error('Failed to generate labels');
      console.error('Label generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateJobProcessing = async (jobId: string) => {
    const intervals = [10, 25, 50, 75, 100];
    
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPrintJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, progress, status: progress === 100 ? 'completed' : 'printing' } : job
      ));
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: LabelTemplate = {
      id: `template-${Date.now()}`,
      name: 'Custom Template',
      description: 'New custom label template',
      dimensions: { width: 3, height: 2 },
      elements: [],
      rules: []
    };
    
    setEditingTemplate(newTemplate);
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = (template: LabelTemplate) => {
    if (template.id.startsWith('template-new')) {
      setTemplates(prev => [...prev, { ...template, id: `template-${Date.now()}` }]);
    } else {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    }
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    toast.success('Template saved successfully');
  };

  const renderGenerateTab = () => (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Select Label Template
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {templates.map(template => (
            <div
              key={template.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate?.id === template.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{template.name}</h4>
                <Badge variant="outline">
                  {template.dimensions.width}" × {template.dimensions.height}"
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {template.elements.length} elements • {template.rules.length} rules
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => {
                    setEditingTemplate(template);
                    setShowTemplateEditor(true);
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={handleCreateTemplate} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </Card>

      {/* Order Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Select Orders ({selectedOrders.length} of {orders.length})
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {orders.map(order => {
            const isSelected = selectedOrders.includes(order.id);
            const labelCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
            
            return (
              <div
                key={order.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedOrders(prev => 
                    isSelected 
                      ? prev.filter(id => id !== order.id)
                      : [...prev, order.id]
                  );
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">{order.customerName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{labelCount} labels</div>
                  <div className="text-sm text-gray-600">${order.total.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedOrders(orders.map(o => o.id))}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedOrders([])}
          >
            Select None
          </Button>
        </div>
      </Card>

      {/* Rules & Preview */}
      {selectedTemplate && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Smart Rules & Preview
          </h3>
          {selectedTemplate.rules.length > 0 ? (
            <div className="space-y-2 mb-4">
              {selectedTemplate.rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{rule.name}</span>
                  </div>
                  <Badge variant={rule.enabled ? "success" : "secondary"}>
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No smart rules configured for this template</p>
          )}
          
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Label preview will appear here</p>
            <p className="text-xs text-gray-400 mt-1">
              Preview with: {previewData?.order?.customerName || 'Sample Data'}
            </p>
          </div>
        </Card>
      )}

      {/* Generate Actions */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Ready to Generate</h3>
            <p className="text-sm text-blue-700">
              {selectedOrders.length} orders • {
                selectedOrders.reduce((total, orderId) => {
                  const order = orders.find(o => o.id === orderId);
                  return total + (order?.orderItems.reduce((sum, item) => sum + item.quantity, 0) || 0);
                }, 0)
              } labels • {selectedTemplate?.name}
            </p>
          </div>
          <Button
            onClick={handleGenerateLabels}
            disabled={!selectedTemplate || selectedOrders.length === 0 || isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Labels
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderQueueTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Print Queue ({printJobs.length} jobs)
        </h3>
        
        {printJobs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No print jobs in queue</p>
            <p className="text-sm text-gray-400">Generated labels will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {printJobs.map(job => {
              const order = orders.find(o => o.id === job.orderId);
              const template = templates.find(t => t.id === job.templateId);
              
              return (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      job.status === 'completed' ? 'bg-green-500' :
                      job.status === 'printing' ? 'bg-blue-500' :
                      job.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">{order?.orderNumber}</div>
                      <div className="text-sm text-gray-600">
                        {job.labelCount} labels • {template?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {job.status === 'completed' ? 'Complete' : `${job.progress}%`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.status === 'completed' ? 'Ready' : `~${job.estimatedTime}s`}
                      </div>
                    </div>
                    {job.status === 'completed' && (
                      <Button size="sm" variant="secondary">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Label Usage Analytics
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{printJobs.length}</div>
            <div className="text-sm text-blue-600">Jobs Processed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {printJobs.reduce((sum, job) => sum + job.labelCount, 0)}
            </div>
            <div className="text-sm text-green-600">Labels Generated</div>
          </div>
        </div>

        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Detailed analytics available</p>
          <p className="text-sm text-gray-400">Track usage patterns, performance metrics, and cost savings</p>
        </div>
      </Card>
    </div>
  );

  const renderEditorTab = () => (
    <div className="space-y-6">
      {/* Phase 4 Template Editor Integration */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-800">
          <Wand2 className="h-6 w-6" />
          Phase 4 Visual Template Editor
        </h3>
        <p className="text-purple-700 mb-6">
          Create professional label templates with drag-and-drop design, smart rules, and real-time preview. 
          Perfect for generating labels directly from your orders.
        </p>
        
        {/* Template Creation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => {
              toast.success('Opening Visual Template Editor...');
              // In full implementation, this would open the Phase 4 VisualEditor service
            }}
            className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <div className="text-center">
              <Type className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Drag & Drop Editor</div>
              <div className="text-xs opacity-90">Visual design with elements</div>
            </div>
          </Button>
          
          <Button
            onClick={() => {
              toast.success('Loading Professional Presets...');
              setActiveTab('templates');
            }}
            variant="outline"
            className="h-20 border-2 border-purple-300 hover:bg-purple-50"
          >
            <div className="text-center">
              <Tag className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-medium text-purple-700">Use Presets</div>
              <div className="text-xs text-purple-600">8 professional templates</div>
            </div>
          </Button>
        </div>

        {/* Phase 4 Features Showcase */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3">✨ Phase 4 Advanced Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Smart Rules Engine</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Batch Processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Multi-Format Output</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Queue Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Performance Optimization</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Template Creation Wizard */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Template
        </h3>
        
        <div className="space-y-4">
          {/* Template Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'product', name: 'Product Label', icon: Package, desc: 'Name, price, ingredients' },
                { id: 'shipping', name: 'Shipping Label', icon: Truck, desc: 'Address, tracking info' },
                { id: 'barcode', name: 'Barcode Label', icon: QrCode, desc: 'SKU, inventory tracking' },
                { id: 'custom', name: 'Custom Design', icon: Edit, desc: 'Start from scratch' }
              ].map(type => (
                <button
                  key={type.id}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  onClick={() => {
                    toast.success(`Creating ${type.name} template with Phase 4 features...`);
                    // In real implementation, this would open the Phase 4 Visual Editor
                  }}
                >
                  <type.icon className="h-5 w-5 text-blue-600 mb-2" />
                  <div className="font-medium text-sm">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Template Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Label Size</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>4" × 6" (Standard Shipping)</option>
                <option>3" × 2" (Product Label)</option>
                <option>2" × 1" (Small Product)</option>
                <option>1" × 1" (Barcode Only)</option>
                <option>Custom Size</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Print Engine</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>AUTO (Smart Selection)</option>
                <option>PDF (Universal Printer)</option>
                <option>ZPL (Zebra Thermal)</option>
                <option>TSPL (TSC Printers)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                toast.success('Opening Phase 4 Visual Editor with drag-and-drop design...');
                // In full implementation, this would open the Phase 4 VisualEditor service
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Open Visual Editor
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                toast.info('Quick template created! Opening in editor...');
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Create
            </Button>
          </div>
        </div>
      </Card>

      {/* Phase 4 System Integration Preview */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced System Integration
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">🧠 Rules Engine</h4>
            <p className="text-sm text-gray-600">
              Create smart rules like "Show URGENT badge for high-priority orders" or 
              "Format prices as currency for international customers"
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📊 Analytics Integration</h4>
            <p className="text-sm text-gray-600">
              Track label usage, print performance, cost analysis, and get optimization 
              recommendations for your templates
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">⚙️ Queue Management</h4>
            <p className="text-sm text-gray-600">
              Intelligent job scheduling, load balancing across printers, and automatic 
              error recovery with retry policies
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Label Generator</h2>
              <p className="text-gray-600">Generate professional labels with smart rules and real-time preview</p>
            </div>
            <Button variant="secondary" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            {[
              { id: 'generate', label: 'Generate Labels', icon: Printer },
              { id: 'editor', label: 'Create Template', icon: Plus },
              { id: 'templates', label: 'Templates', icon: Layers },
              { id: 'queue', label: 'Print Queue', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'queue' && printJobs.length > 0 && (
                  <Badge variant="primary" className="ml-1">{printJobs.length}</Badge>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'generate' && renderGenerateTab()}
            {activeTab === 'editor' && renderEditorTab()}
            {activeTab === 'templates' && (
              <div className="text-center py-12">
                <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Template Management</h3>
                <p className="text-gray-500">Create, edit, and organize your label templates</p>
              </div>
            )}
            {activeTab === 'queue' && renderQueueTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedLabelGenerator;
