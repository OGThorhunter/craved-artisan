import React, { useState, useRef } from 'react';
import { Wand2, FileText, Upload, Image, CheckCircle, X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import type { CreateInventoryItemData } from '../../hooks/useInventory';

interface InventoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateInventoryItemData) => Promise<void>;
}

type WizardStep = 'welcome' | 'method' | 'input' | 'review';
type InputMethod = 'manual' | 'ai' | 'csv' | null;

const InventoryWizard: React.FC<InventoryWizardProps> = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>(null);
  const [parsedData, setParsedData] = useState<Partial<CreateInventoryItemData>>({
    name: '',
    description: '',
    category: 'food_grade',
    currentStock: 0,
    reorderPoint: 0,
    unit: '',
    unitPrice: 0,
    supplier: '',
    batch: '',
    expiryDate: '',
    tags: [],
    location: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMethodSelect = (method: InputMethod) => {
    setSelectedMethod(method);
    setCurrentStep('input');
  };

  const handleManualInput = (field: string, value: string | number | string[]) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIParse = async () => {
    setIsProcessing(true);
    
    // Simulate AI parsing
    setTimeout(() => {
      // Mock parsing - extract data from image/text
      setParsedData({
        name: 'Organic Flour (Parsed)',
        description: 'High-quality organic flour from AI parsing',
        category: 'food_grade',
        currentStock: 50,
        reorderPoint: 10,
        unit: 'kg',
        unitPrice: 3.50,
        supplier: 'Local Organic Farm',
        batch: 'AI-' + Date.now(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['organic', 'flour', 'ai-parsed'],
        location: 'Storage Room A'
      });
      setIsProcessing(false);
      setCurrentStep('review');
    }, 2000);
  };

  const handleCSVParse = async () => {
    setIsProcessing(true);
    
    // Simulate CSV parsing
    setTimeout(() => {
      setParsedData({
        name: 'Vanilla Extract (CSV Import)',
        description: 'Pure Madagascar vanilla extract',
        category: 'food_grade',
        currentStock: 15,
        reorderPoint: 5,
        unit: 'bottles',
        unitPrice: 12.00,
        supplier: 'Premium Spices Co',
        batch: 'CSV-' + Date.now(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['vanilla', 'extract', 'csv-import'],
        location: 'Spice Cabinet'
      });
      setIsProcessing(false);
      setCurrentStep('review');
    }, 1500);
  };

  const handleAccept = async () => {
    try {
      await onSave(parsedData as CreateInventoryItemData);
      handleReset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleReset = () => {
    setCurrentStep('welcome');
    setSelectedMethod(null);
    setParsedData({
      name: '',
      description: '',
      category: 'food_grade',
      currentStock: 0,
      reorderPoint: 0,
      unit: '',
      unitPrice: 0,
      supplier: '',
      batch: '',
      expiryDate: '',
      tags: [],
      location: ''
    });
    setSelectedFile(null);
    setRawText('');
    setIsProcessing(false);
  };

  const handleBack = () => {
    if (currentStep === 'input') {
      setCurrentStep('method');
    } else if (currentStep === 'method') {
      setCurrentStep('welcome');
    } else if (currentStep === 'review') {
      setCurrentStep('input');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-500">
          <div className="flex items-center gap-3">
            <Wand2 className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">AI-Assisted Inventory Wizard</h2>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            title="Close wizard"
            aria-label="Close wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {['Welcome', 'Method', 'Input', 'Review'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  index === 0 && currentStep === 'welcome' ? 'text-purple-600 font-semibold' :
                  index === 1 && currentStep === 'method' ? 'text-purple-600 font-semibold' :
                  index === 2 && currentStep === 'input' ? 'text-purple-600 font-semibold' :
                  index === 3 && currentStep === 'review' ? 'text-purple-600 font-semibold' :
                  'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 && currentStep === 'welcome' ? 'bg-purple-500 text-white' :
                    index === 1 && currentStep === 'method' ? 'bg-purple-500 text-white' :
                    index === 2 && currentStep === 'input' ? 'bg-purple-500 text-white' :
                    index === 3 && currentStep === 'review' ? 'bg-purple-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="hidden sm:inline text-sm">{step}</span>
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    (index === 0 && ['method', 'input', 'review'].includes(currentStep)) ||
                    (index === 1 && ['input', 'review'].includes(currentStep)) ||
                    (index === 2 && currentStep === 'review')
                      ? 'bg-purple-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Welcome */}
          {currentStep === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full">
                <Sparkles className="h-10 w-10 text-purple-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to the AI-Assisted Inventory Management System!
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Managing your inventory is one of the most critical steps to get the full benefit of the CravedArtisan tools. 
                  My goal is to make this task <span className="font-semibold text-purple-600">easy peasy and enjoyable</span>, 
                  if that is possible to say at the same time as "inventory" 😊
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xl mx-auto">
                <p className="text-blue-900 text-sm">
                  💡 <strong>Pro Tip:</strong> Our AI assistant can help you add items in seconds, 
                  saving you time and reducing data entry errors!
                </p>
              </div>

              <Button 
                onClick={() => setCurrentStep('method')}
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
              >
                Let's Get Started!
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Method Selection */}
          {currentStep === 'method' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  How would you like to add this inventory item?
                </h3>
                <p className="text-gray-600">Choose the method that works best for you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Option A: Manual */}
                <button
                  onClick={() => handleMethodSelect('manual')}
                  className="group relative bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Manually Add Item</h4>
                      <p className="text-sm text-gray-600">
                        Fill in the details yourself with a simple form
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Most Precise</Badge>
                  </div>
                </button>

                {/* Option B: AI Parse */}
                <button
                  onClick={() => handleMethodSelect('ai')}
                  className="group relative bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Wand2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Use AI to Parse</h4>
                      <p className="text-sm text-gray-600">
                        Upload an image or receipt and let AI extract the details
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">⚡ Fastest</Badge>
                  </div>
                </button>

                {/* Option C: CSV Upload */}
                <button
                  onClick={() => handleMethodSelect('csv')}
                  className="group relative bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Upload CSV/Document</h4>
                      <p className="text-sm text-gray-600">
                        Bulk import multiple items from a spreadsheet
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">📊 Bulk Import</Badge>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Input (varies by method) */}
          {currentStep === 'input' && (
            <div className="space-y-6">
              {/* Manual Input */}
              {selectedMethod === 'manual' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-900 text-sm">
                      <Wand2 className="h-4 w-4 inline mr-2" />
                      <strong>Manual Entry Mode:</strong> Fill in the details below to add your inventory item.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={parsedData.name}
                        onChange={(e) => handleManualInput('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Organic Bread Flour"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={parsedData.description}
                        onChange={(e) => handleManualInput('description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Describe this inventory item..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={parsedData.category}
                        onChange={(e) => handleManualInput('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        title="Select category"
                      >
                        <option value="food_grade">Food Grade</option>
                        <option value="raw_materials">Raw Materials</option>
                        <option value="packaging">Packaging</option>
                        <option value="equipment">Equipment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <input
                        type="text"
                        value={parsedData.supplier}
                        onChange={(e) => handleManualInput('supplier', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Supplier name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                      <input
                        type="number"
                        value={parsedData.currentStock}
                        onChange={(e) => handleManualInput('currentStock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point *</label>
                      <input
                        type="number"
                        value={parsedData.reorderPoint}
                        onChange={(e) => handleManualInput('reorderPoint', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                      <input
                        type="text"
                        value={parsedData.unit}
                        onChange={(e) => handleManualInput('unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., kg, boxes, bottles"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={parsedData.unitPrice}
                        onChange={(e) => handleManualInput('unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={parsedData.location}
                        onChange={(e) => handleManualInput('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Storage location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                      <input
                        type="text"
                        value={parsedData.batch}
                        onChange={(e) => handleManualInput('batch', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Batch ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={parsedData.expiryDate}
                        onChange={(e) => handleManualInput('expiryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        title="Select expiry date"
                        placeholder="Select date"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(parsedData.tags) ? parsedData.tags.join(', ') : ''}
                        onChange={(e) => handleManualInput('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., organic, flour, gluten-free"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep('review')}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!parsedData.name || !parsedData.unit}
                    >
                      Continue to Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Parse Input */}
              {selectedMethod === 'ai' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-900 text-sm">
                      <Wand2 className="h-4 w-4 inline mr-2" />
                      <strong>AI Parse Mode:</strong> Upload an image of a receipt, label, or product packaging, 
                      and our AI will automatically extract the details!
                    </p>
                  </div>

                  <div 
                    className="border-2 border-dashed border-purple-300 rounded-lg p-12 text-center hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      title="Upload file for AI parsing"
                      aria-label="Upload file for AI parsing"
                    />
                    <Image className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                    <p className="text-lg text-gray-700 mb-2 font-medium">
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or paste text from a receipt/label:
                    </label>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Paste receipt or label text here..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAIParse}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!selectedFile && !rawText.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Parse with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* CSV Upload Input */}
              {selectedMethod === 'csv' && (
                <div className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-900 text-sm">
                      <Upload className="h-4 w-4 inline mr-2" />
                      <strong>CSV Import Mode:</strong> Upload a CSV file with your inventory data. 
                      We'll import all items at once!
                    </p>
                  </div>

                  <div 
                    className="border-2 border-dashed border-orange-300 rounded-lg p-12 text-center hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      title="Upload CSV file"
                      aria-label="Upload CSV file"
                    />
                    <FileText className="mx-auto h-16 w-16 text-orange-400 mb-4" />
                    <p className="text-lg text-gray-700 mb-2 font-medium">
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to upload CSV file'}
                    </p>
                    <p className="text-sm text-gray-500">
                      CSV format with headers: Name, Description, Category, Stock, Unit, Price, etc.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 text-xs font-medium mb-2">Expected CSV Format:</p>
                    <code className="text-xs text-blue-800 block">
                      Name,Description,Category,Current Stock,Reorder Point,Unit,Unit Price,Supplier,Location
                    </code>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleCSVParse}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!selectedFile || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Parsing CSV...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import CSV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Congrats! You added an inventory item! 🎉
                </h3>
                <p className="text-gray-600">
                  Check below to make sure we are accurate. If so, click accept!
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Review Your Inventory Item
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-green-900 font-medium">Name:</span>
                    <span className="text-gray-900 font-semibold">{parsedData.name}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-green-900 font-medium">Category:</span>
                    <span className="text-gray-900">{parsedData.category?.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-green-900 font-medium">Current Stock:</span>
                    <span className="text-gray-900 font-semibold">{parsedData.currentStock} {parsedData.unit}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-green-900 font-medium">Reorder Point:</span>
                    <span className="text-gray-900">{parsedData.reorderPoint} {parsedData.unit}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-green-900 font-medium">Unit Price:</span>
                    <span className="text-gray-900 font-semibold">${parsedData.unitPrice?.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-green-900 font-medium">Total Value:</span>
                    <span className="text-gray-900 font-semibold">
                      ${((parsedData.currentStock || 0) * (parsedData.unitPrice || 0)).toFixed(2)}
                    </span>
                  </div>

                  {parsedData.supplier && (
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-green-900 font-medium">Supplier:</span>
                      <span className="text-gray-900">{parsedData.supplier}</span>
                    </div>
                  )}

                  {parsedData.location && (
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-green-900 font-medium">Location:</span>
                      <span className="text-gray-900">{parsedData.location}</span>
                    </div>
                  )}

                  {parsedData.batch && (
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-green-900 font-medium">Batch:</span>
                      <span className="text-gray-900">{parsedData.batch}</span>
                    </div>
                  )}

                  {parsedData.expiryDate && (
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-green-900 font-medium">Expiry Date:</span>
                      <span className="text-gray-900">
                        {new Date(parsedData.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {parsedData.tags && parsedData.tags.length > 0 && (
                    <div className="md:col-span-2 py-2 border-b border-green-200">
                      <span className="text-green-900 font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {parsedData.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedData.description && (
                    <div className="md:col-span-2 py-2">
                      <span className="text-green-900 font-medium">Description:</span>
                      <p className="text-gray-900 mt-1">{parsedData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 text-sm">
                  ⚠️ <strong>Not quite right?</strong> Click "Back" to make changes, or click "Accept" if everything looks good!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 'welcome' || isProcessing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep === 'review' && (
            <Button 
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept & Add to Inventory
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Badge component for the wizard
const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default InventoryWizard;

