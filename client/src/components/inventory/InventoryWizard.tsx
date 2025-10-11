import React, { useState, useRef } from 'react';
import { Wand2, FileText, Upload, Image, CheckCircle, X, ArrowRight, ArrowLeft, Sparkles, Building2 } from 'lucide-react';
import Button from '../ui/Button';
import CravendorWizard from '../ui/CravendorWizard';
import toast from 'react-hot-toast';
import type { CreateInventoryItemData } from '../../hooks/useInventory';

interface InventoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateInventoryItemData) => Promise<void>;
}

type WizardStep = 'welcome' | 'method' | 'input' | 'review';
type InputMethod = 'manual' | 'ai' | 'csv' | 'supplier' | null;

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
  const [supplierData, setSupplierData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    isPreferred: false,
    tags: [] as string[]
  });

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
      if (selectedMethod === 'supplier') {
        // Save supplier to localStorage for now
        // TODO: Replace with actual API call when backend is ready
        const newSupplier = {
          id: `sup-${Date.now()}`,
          ...supplierData,
          createdAt: new Date().toISOString().split('T')[0]
        };

        // Get existing suppliers from localStorage
        const existingSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
        existingSuppliers.push(newSupplier);
        localStorage.setItem('suppliers', JSON.stringify(existingSuppliers));

        toast.success(`✅ Supplier "${supplierData.businessName}" added successfully!`);
        
        // Dispatch a custom event so SupplierManager can refresh
        window.dispatchEvent(new CustomEvent('supplierAdded', { detail: newSupplier }));
        
        handleReset();
        onClose();
      } else {
        await onSave(parsedData as CreateInventoryItemData);
        handleReset();
        onClose();
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save. Please try again.');
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
    setSupplierData({
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
      isPreferred: false,
      tags: []
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
            <CravendorWizard title="Ah… so the keeper of wares has returned.">
              <div className="text-center space-y-6">
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  This is the <strong>AI-Assisted Inventory Wizard</strong>, the very heart of your enterprise. Every item, every craft, 
                  every piece of your work begins here. Keep it current, and the flow of trade shall remain strong.
                </p>
                
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  I am <strong>Cravendor</strong>, your guide through these halls of record and reason. Together, we will bring order 
                  to your stock and clarity to your craft.
                </p>

                <p className="text-xl text-gray-800 font-semibold mt-8">
                  Now then — how shall we begin?
                </p>

                <Button 
                  onClick={() => setCurrentStep('method')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-3 inline-flex items-center gap-2 whitespace-nowrap"
                >
                  Choose Your Path
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CravendorWizard>
          )}

          {/* Step 2: Method Selection */}
          {currentStep === 'method' && (
            <CravendorWizard title="How would you like to add this inventory item?">
              <div className="text-center space-y-6">
                <p className="text-lg text-gray-700">
                  Choose the path that suits thy quest, noble adventurer:
                </p>

                <div className="space-y-4 max-w-md mx-auto">
                  {/* Option A: Manual */}
                  <button
                    onClick={() => handleMethodSelect('manual')}
                    className="w-full p-6 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Manually Add Item</h4>
                        <p className="text-gray-600">Fill in the details yourself with precision</p>
                      </div>
                    </div>
                  </button>

                  {/* Option B: AI Parse */}
                  <button
                    onClick={() => handleMethodSelect('ai')}
                    className="w-full p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Wand2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Scan & AI Parse</h4>
                        <p className="text-gray-600">Let AI magic extract details from images</p>
                      </div>
                    </div>
                  </button>

                  {/* Option C: CSV Upload */}
                  <button
                    onClick={() => handleMethodSelect('csv')}
                    className="w-full p-6 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <Upload className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Upload CSV Document</h4>
                        <p className="text-gray-600">Bulk import from thy magical spreadsheets</p>
                      </div>
                    </div>
                  </button>

                  {/* Option D: Add Supplier */}
                  <button
                    onClick={() => handleMethodSelect('supplier')}
                    className="w-full p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Add a Supplier</h4>
                        <p className="text-gray-600">Register a business you buy from</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </CravendorWizard>
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
                      <select
                        value={parsedData.unit}
                        onChange={(e) => handleManualInput('unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        title="Select unit of measurement"
                      >
                        <option value="">Select unit...</option>
                        <option value="g">Grams (g)</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="l">Liters (l)</option>
                        <option value="fl oz">Fluid Ounces (fl oz)</option>
                        <option value="cup">Cups</option>
                        <option value="tbsp">Tablespoons (tbsp)</option>
                        <option value="tsp">Teaspoons (tsp)</option>
                        <option value="pieces">Pieces</option>
                        <option value="units">Units</option>
                        <option value="boxes">Boxes</option>
                        <option value="bottles">Bottles</option>
                        <option value="jars">Jars</option>
                        <option value="bags">Bags</option>
                        <option value="packages">Packages</option>
                        <option value="dozen">Dozen</option>
                      </select>
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
                      className="bg-purple-600 hover:bg-purple-700 text-white"
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
                      className="bg-purple-600 hover:bg-purple-700 text-white"
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
                      className="bg-orange-600 hover:bg-orange-700 text-white"
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

              {/* Supplier Input */}
              {selectedMethod === 'supplier' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-900 text-sm">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      <strong>Add Supplier Mode:</strong> Register a new business you purchase from. This will help track pricing and manage your supply chain.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input
                        type="text"
                        value={supplierData.businessName}
                        onChange={(e) => setSupplierData({...supplierData, businessName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., ABC Suppliers Inc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={supplierData.contactPerson}
                        onChange={(e) => setSupplierData({...supplierData, contactPerson: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={supplierData.email}
                        onChange={(e) => setSupplierData({...supplierData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="contact@supplier.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={supplierData.phone}
                        onChange={(e) => setSupplierData({...supplierData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={supplierData.website}
                        onChange={(e) => setSupplierData({...supplierData, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://supplier.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={supplierData.address}
                        onChange={(e) => setSupplierData({...supplierData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={supplierData.city}
                        onChange={(e) => setSupplierData({...supplierData, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Atlanta"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={supplierData.state}
                        onChange={(e) => setSupplierData({...supplierData, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="GA"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={supplierData.zipCode}
                        onChange={(e) => setSupplierData({...supplierData, zipCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="30301"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={supplierData.notes}
                        onChange={(e) => setSupplierData({...supplierData, notes: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Additional information about this supplier..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={supplierData.isPreferred}
                          onChange={(e) => setSupplierData({...supplierData, isPreferred: e.target.checked})}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Mark as Preferred Supplier</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep('review')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!supplierData.businessName || !supplierData.email}
                    >
                      Continue to Review
                      <ArrowRight className="h-4 w-4 ml-2" />
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
                  {selectedMethod === 'supplier' ? 'New Supplier Ready! 🎉' : 'Congrats! You added an inventory item! 🎉'}
                </h3>
                <p className="text-gray-600">
                  Check below to make sure we are accurate. If so, click accept!
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  {selectedMethod === 'supplier' ? <Building2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  {selectedMethod === 'supplier' ? 'Review Your Supplier' : 'Review Your Inventory Item'}
                </h4>

                {selectedMethod === 'supplier' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-green-200 md:col-span-2">
                      <span className="text-green-900 font-medium">Business Name:</span>
                      <span className="text-gray-900 font-semibold">{supplierData.businessName}</span>
                    </div>

                    {supplierData.contactPerson && (
                      <div className="flex justify-between py-2 border-b border-green-200">
                        <span className="text-green-900 font-medium">Contact Person:</span>
                        <span className="text-gray-900">{supplierData.contactPerson}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-green-900 font-medium">Email:</span>
                      <span className="text-gray-900">{supplierData.email}</span>
                    </div>

                    {supplierData.phone && (
                      <div className="flex justify-between py-2 border-b border-green-200">
                        <span className="text-green-900 font-medium">Phone:</span>
                        <span className="text-gray-900">{supplierData.phone}</span>
                      </div>
                    )}

                    {supplierData.website && (
                      <div className="flex justify-between py-2 border-b border-green-200">
                        <span className="text-green-900 font-medium">Website:</span>
                        <span className="text-gray-900">{supplierData.website}</span>
                      </div>
                    )}

                    {supplierData.address && (
                      <div className="flex justify-between py-2 border-b border-green-200 md:col-span-2">
                        <span className="text-green-900 font-medium">Address:</span>
                        <span className="text-gray-900 text-right">
                          {supplierData.address}, {supplierData.city}, {supplierData.state} {supplierData.zipCode}
                        </span>
                      </div>
                    )}

                    {supplierData.isPreferred && (
                      <div className="flex justify-between py-2 border-b border-green-200 md:col-span-2">
                        <span className="text-green-900 font-medium">Preferred Supplier:</span>
                        <span className="text-gray-900">⭐ Yes</span>
                      </div>
                    )}

                    {supplierData.notes && (
                      <div className="md:col-span-2 py-2">
                        <span className="text-green-900 font-medium">Notes:</span>
                        <p className="text-gray-900 mt-1">{supplierData.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (

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
                )}
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
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === 'review' && (
            <Button 
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {selectedMethod === 'supplier' ? 'Accept & Add Supplier' : 'Accept & Add to Inventory'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryWizard;

