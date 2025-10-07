import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Brain, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Calculator,
  Package,
  DollarSign,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ProductWizardData {
  name?: string;
  description?: string;
  type?: string;
  price?: number;
  baseCost?: number;
  laborCost?: number;
  materialsCost?: number;
  profitMargin?: number;
  competitorPrice?: number;
}

interface AddProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (productData: ProductWizardData) => void;
}

type WizardStep = 'welcome' | 'add-method' | 'pricing' | 'review';
type AddMethod = 'manual' | 'ai';

const AddProductWizard: React.FC<AddProductWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [selectedMethod, setSelectedMethod] = useState<AddMethod | null>(null);
  const [productData, setProductData] = useState<ProductWizardData>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleStepNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('add-method');
        break;
      case 'add-method':
        setCurrentStep('pricing');
        break;
      case 'pricing':
        setCurrentStep('review');
        break;
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'add-method':
        setCurrentStep('welcome');
        break;
      case 'pricing':
        setCurrentStep('add-method');
        break;
      case 'review':
        setCurrentStep('pricing');
        break;
    }
  };

  const handleComplete = () => {
    onComplete(productData);
    onClose();
    // Reset wizard state
    setCurrentStep('welcome');
    setSelectedMethod(null);
    setProductData({});
  };

  const handleMethodSelect = (method: AddMethod) => {
    setSelectedMethod(method);
    if (method === 'ai') {
      // Simulate AI parsing
      setIsUploading(true);
      setTimeout(() => {
        setProductData({
          name: 'AI Parsed Product',
          description: 'This product was parsed from your document',
          type: 'FOOD',
          price: 0,
          baseCost: 0,
          laborCost: 0,
          materialsCost: 0,
          profitMargin: 0,
          competitorPrice: 0
        });
        setIsUploading(false);
        handleStepNext();
      }, 2000);
    } else {
      handleStepNext();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate AI parsing
      setTimeout(() => {
        setProductData({
          name: 'AI Parsed Product',
          description: 'This product was parsed from your document',
          type: 'FOOD',
          price: 0,
          baseCost: 0,
          laborCost: 0,
          materialsCost: 0,
          profitMargin: 0,
          competitorPrice: 0
        });
        setIsUploading(false);
        handleStepNext();
      }, 2000);
    }
  };

  const updateProductData = (field: keyof ProductWizardData, value: string | number) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateProfitMargin = () => {
    const totalCost = (productData.baseCost || 0) + (productData.laborCost || 0) + (productData.materialsCost || 0);
    const price = productData.price || 0;
    if (price > 0 && totalCost > 0) {
      return ((price - totalCost) / price * 100).toFixed(1);
    }
    return 0;
  };

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: <Package className="w-5 h-5" /> },
    { id: 'add-method', title: 'Add Method', icon: <Plus className="w-5 h-5" /> },
    { id: 'pricing', title: 'Pricing', icon: <Calculator className="w-5 h-5" /> },
    { id: 'review', title: 'Review', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add Product Wizard</h2>
              <p className="text-white/90 mt-1">Let's create your perfect product</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              title="Close wizard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep === step.id 
                    ? 'bg-white text-purple-600 border-white' 
                    : steps.findIndex(s => s.id === currentStep) > index
                      ? 'bg-green-500 text-white border-green-500'
                      : 'border-white/30 text-white/70'
                }`}>
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">{step.title}</span>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-white/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Welcome */}
              {currentStep === 'welcome' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Package className="w-10 h-10 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to the Product Page!
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                      Think of your products as your goods to sell, whatever those may be! 
                      Baker or candlestick maker, Craved has your back! 
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      Let's start by telling me how you would like to add a product?
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Add Method */}
              {currentStep === 'add-method' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      How would you like to add your product?
                    </h3>
                    <p className="text-gray-600">
                      Choose the method that works best for you
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Manual Option */}
                    <Card 
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                        selectedMethod === 'manual' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                      }`}
                      onClick={() => handleMethodSelect('manual')}
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Plus className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            A) Add Product Manually
                          </h4>
                          <p className="text-gray-600">
                            Fill out the product form step by step. Perfect for when you have all the details ready.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* AI Option */}
                    <Card 
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                        selectedMethod === 'ai' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                      }`}
                      onClick={() => handleMethodSelect('ai')}
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <Brain className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            B) Use AI to Parse Image or Doc
                          </h4>
                          <p className="text-gray-600">
                            Upload an image or document and let our AI extract the product information for you.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Manual Form (if selected) */}
                  {selectedMethod === 'manual' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <h4 className="text-lg font-semibold text-gray-900">Product Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter product name"
                            value={productData.name || ''}
                            onChange={(e) => updateProductData('name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Type
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={productData.type || 'FOOD'}
                            onChange={(e) => updateProductData('type', e.target.value)}
                            title="Product Type"
                          >
                            <option value="FOOD">Food</option>
                            <option value="NON_FOOD">Non-Food</option>
                            <option value="SERVICE">Service</option>
                            <option value="CLASSES">Classes</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={3}
                            placeholder="Describe your product"
                            value={productData.description || ''}
                            onChange={(e) => updateProductData('description', e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Upload (if selected) */}
                  {selectedMethod === 'ai' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Upload Image or Document
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Upload an image of your product or a document with product details
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="ai-upload"
                        />
                        <label
                          htmlFor="ai-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                      {isUploading && (
                        <div className="text-center">
                          <div className="inline-flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            <span className="text-gray-600">AI is parsing your document...</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 'pricing' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Now let's consider a few things
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Like how much does it cost to make this product. We need to consider a few things like 
                      what do the materials cost, what does your labor cost and what are your competitors 
                      selling this similar product for? Deep stuff, right? We got this, let's consider 
                      what price point you want to hit!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Cost Inputs */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-purple-600" />
                        Cost Breakdown
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Materials Cost ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="0.00"
                            value={productData.materialsCost || ''}
                            onChange={(e) => updateProductData('materialsCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Labor Cost ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="0.00"
                            value={productData.laborCost || ''}
                            onChange={(e) => updateProductData('laborCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Cost ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="0.00"
                            value={productData.baseCost || ''}
                            onChange={(e) => updateProductData('baseCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Competitor Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="0.00"
                            value={productData.competitorPrice || ''}
                            onChange={(e) => updateProductData('competitorPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Calculation */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        Price Calculation
                      </h4>
                      
                      <Card className="p-6 bg-green-50 border-green-200">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Materials Cost:</span>
                            <span className="font-semibold">${(productData.materialsCost || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Labor Cost:</span>
                            <span className="font-semibold">${(productData.laborCost || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Base Cost:</span>
                            <span className="font-semibold">${(productData.baseCost || 0).toFixed(2)}</span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Cost:</span>
                            <span className="font-bold text-lg">
                              ${((productData.materialsCost || 0) + (productData.laborCost || 0) + (productData.baseCost || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Selling Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0.00"
                          value={productData.price || ''}
                          onChange={(e) => updateProductData('price', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <Card className="p-6 bg-blue-50 border-blue-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {calculateProfitMargin()}% Profit Margin
                          </div>
                          <div className="text-sm text-gray-600">
                            Profit: ${((productData.price || 0) - ((productData.materialsCost || 0) + (productData.laborCost || 0) + (productData.baseCost || 0))).toFixed(2)}
                          </div>
                        </div>
                      </Card>

                      {/* AI Price Suggestion */}
                      <Card className="p-6 bg-purple-50 border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-purple-900">AI Price Suggestion</h5>
                        </div>
                        <p className="text-sm text-purple-700 mb-3">
                          Based on your costs and competitor analysis, we suggest:
                        </p>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600 mb-2">
                            ${((productData.materialsCost || 0) + (productData.laborCost || 0) + (productData.baseCost || 0)) * 1.5}
                          </div>
                          <div className="text-xs text-purple-600">
                            50% markup for healthy profit
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Good job, you created a new product!
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      You can come back and visit this product anytime if you care to update things or just 
                      checkin and see if your pricing setup is still relevant. Take a quick looksie below 
                      and make sure everything is right, if so, click accept!
                    </p>
                  </div>

                  <Card className="p-6 bg-gray-50">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Product Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Name:</span>
                          <div className="text-gray-900">{productData.name || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Type:</span>
                          <div className="text-gray-900">{productData.type || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Description:</span>
                          <div className="text-gray-900">{productData.description || 'Not specified'}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Materials Cost:</span>
                          <div className="text-gray-900">${(productData.materialsCost || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Labor Cost:</span>
                          <div className="text-gray-900">${(productData.laborCost || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Base Cost:</span>
                          <div className="text-gray-900">${(productData.baseCost || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Selling Price:</span>
                          <div className="text-gray-900 font-bold">${(productData.price || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Profit Margin:</span>
                          <div className="text-gray-900 font-bold">{calculateProfitMargin()}%</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={currentStep === 'welcome' ? onClose : handleStepBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 'welcome' ? 'Cancel' : 'Back'}
            </Button>
            
            {currentStep !== 'review' && (
              <Button
                onClick={handleStepNext}
                disabled={currentStep === 'add-method' && !selectedMethod}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {currentStep === 'review' && (
              <Button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Accept & Create Product
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddProductWizard;
