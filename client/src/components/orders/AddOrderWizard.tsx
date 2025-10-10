import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, User, Package, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dueDate: string;
  dueTime: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'RUSH';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL';
  fulfillmentMethod: 'PICKUP' | 'DELIVERY';
  notes: string;
  items: OrderItem[];
}

interface AddOrderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (order: OrderFormData) => void;
}

// Mock products for demo
const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Sourdough Bread', price: 6.99, imageUrl: '/images/sourdough.jpg' },
  { id: 'prod-2', name: 'Butter Croissant', price: 3.99, imageUrl: '/images/croissant.jpg' },
  { id: 'prod-3', name: 'Chocolate Chip Cookies (Dozen)', price: 12.99, imageUrl: '/images/cookies.jpg' },
  { id: 'prod-4', name: 'Baguette', price: 4.49, imageUrl: '/images/baguette.jpg' },
  { id: 'prod-5', name: 'Cinnamon Rolls (6-pack)', price: 15.99, imageUrl: '/images/cinnamon-rolls.jpg' },
];

const AddOrderWizard: React.FC<AddOrderWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    dueDate: '',
    dueTime: '',
    priority: 'MEDIUM',
    paymentStatus: 'PENDING',
    fulfillmentMethod: 'PICKUP',
    notes: '',
    items: []
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity: productQuantity,
      unitPrice: product.price,
      total: product.price * productQuantity
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setSelectedProduct('');
    setProductQuantity(1);
    toast.success(`Added ${product.name} to order`);
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    toast.success('Item removed from order');
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.customerName || !formData.customerEmail) {
        toast.error('Please fill in customer name and email');
        return;
      }
    }
    
    if (step === 2) {
      if (formData.items.length === 0) {
        toast.error('Please add at least one product to the order');
        return;
      }
    }

    if (step === 3) {
      if (!formData.dueDate) {
        toast.error('Please select a due date');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (onComplete) {
      onComplete(formData);
    }
    toast.success(`Order created for ${formData.customerName}!`);
    onClose();
  };

  const orderTotal = formData.items.reduce((sum, item) => sum + item.total, 0);

  const steps = [
    { number: 1, title: 'Customer Info', icon: User },
    { number: 2, title: 'Add Products', icon: Package },
    { number: 3, title: 'Schedule & Details', icon: Calendar },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Order</h2>
              <p className="text-blue-100 text-sm mt-1">Step {step} of {steps.length}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
              title="Close wizard"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => {
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              
              return (
                <React.Fragment key={s.number}>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : s.number}
                    </div>
                    <div className="hidden md:block">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                        {s.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Information</h3>
                <p className="text-gray-600">Who is this order for?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Add Products */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Package className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Products</h3>
                <p className="text-gray-600">Select products for this order</p>
              </div>

              {/* Add Product Form */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select a product"
                    >
                      <option value="">-- Choose a product --</option>
                      {mockProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button onClick={handleAddProduct} className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Add Product to Order
                  </Button>
                </div>
              </div>

              {/* Order Items List */}
              {formData.items.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Order Items ({formData.items.length})</h4>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-600 hover:text-red-900 ml-4"
                        title="Remove item"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                    <span className="font-semibold text-green-900">Order Total</span>
                    <span className="text-2xl font-bold text-green-600">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No products added yet</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule & Details */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <Calendar className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule & Details</h3>
                <p className="text-gray-600">When is this order due?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select due date"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select due time"
                    placeholder="Select time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['LOW', 'MEDIUM', 'HIGH', 'RUSH'] as const).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-4 py-3 rounded-lg border-2 text-center font-medium transition-all ${
                        formData.priority === priority
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['PENDING', 'PARTIAL', 'PAID'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFormData({ ...formData, paymentStatus: status })}
                      className={`px-4 py-3 rounded-lg border-2 text-center font-medium transition-all ${
                        formData.paymentStatus === status
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['PICKUP', 'DELIVERY'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setFormData({ ...formData, fulfillmentMethod: method })}
                      className={`px-4 py-3 rounded-lg border-2 text-center font-medium transition-all ${
                        formData.fulfillmentMethod === method
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Special instructions, dietary restrictions, etc."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h3>
                <p className="text-gray-600">Please review all details before submitting</p>
              </div>

              {/* Customer Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Name:</span>
                    <span className="ml-2 font-medium text-blue-900">{formData.customerName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Email:</span>
                    <span className="ml-2 font-medium text-blue-900">{formData.customerEmail}</span>
                  </div>
                  {formData.customerPhone && (
                    <div>
                      <span className="text-blue-700">Phone:</span>
                      <span className="ml-2 font-medium text-blue-900">{formData.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Order Items ({formData.items.length})</h4>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="font-bold text-gray-900">${item.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule & Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Schedule & Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-700">Due Date:</span>
                    <span className="ml-2 font-medium text-green-900">
                      {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                      {formData.dueTime && ` at ${formData.dueTime}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Priority:</span>
                    <span className="ml-2 font-medium text-green-900">{formData.priority}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Payment:</span>
                    <span className="ml-2 font-medium text-green-900">{formData.paymentStatus}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Fulfillment:</span>
                    <span className="ml-2 font-medium text-green-900">{formData.fulfillmentMethod}</span>
                  </div>
                </div>
                {formData.notes && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="text-green-700">Notes:</span>
                    <p className="mt-1 text-green-900">{formData.notes}</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Order Total</p>
                    <p className="text-4xl font-bold">${orderTotal.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-16 w-16 text-white/30" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            
            {step < steps.length ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
                Create Order
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderWizard;

