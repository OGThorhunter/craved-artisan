import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Calculator,
  Package,
  DollarSign,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  Zap,
  Upload
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import CravendorWizard from '../ui/CravendorWizard';
import { useInventoryItems, useCreateInventoryItem } from '../../hooks/useInventory';

interface ProductWizardData {
  name?: string;
  description?: string;
  type?: 'FOOD' | 'NON_FOOD' | 'SERVICE' | 'CLASSES';
  price?: number;
  baseCost?: number;
  laborCost?: number;
  sku?: string;
  autoGenerateSku?: boolean;
  batchSize?: number;
  creationTimeMinutes?: number;
  leadTimeDays?: number;
  packageId?: string;
  packageName?: string;
  instructions?: string;
  sops?: string;
  categoryId?: string;
  tags?: string[];
  allergenFlags?: string[];
  active?: boolean;
  ingredients?: Array<{
    inventoryItemId: string;
    quantity: number;
    unit: string;
    notes?: string;
    isOptional: boolean;
  }>;
  images?: Array<{
    imageUrl: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  documents?: Array<{
    title: string;
    documentUrl: string;
    type: 'SOP' | 'INSTRUCTION' | 'NUTRITION' | 'ALLERGEN';
    description?: string;
  }>;
  // Classes specific
  availableSeats?: number;
  costPerSeat?: number;
  duration?: string;
}

interface AddProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (productData: ProductWizardData) => void;
  categories?: Array<{ id: string; name: string }>;
}

type WizardStep = 'welcome' | 'creation-method' | 'ai-parsing' | 'basics' | 'details' | 'ingredients' | 'production' | 'images' | 'pricing' | 'review';

const AddProductWizard: React.FC<AddProductWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  categories = []
}) => {
  // Fetch inventory items
  const { data: inventoryItems = [] } = useInventoryItems();
  const createInventoryItem = useCreateInventoryItem();

  // Mock packaging data - in real app, would come from API
  const availablePackaging = [
    { id: 'pkg-xl-window', name: 'XL Windowed Box', size: '12x8x4', material: 'Cardboard', labelTemplate: 'xl-window-label' },
    { id: 'pkg-4x4-shrink', name: '4x4 Heat Shrink Bag', size: '4x4', material: 'Heat Shrink Film', labelTemplate: '4x4-label' },
    { id: 'pkg-6x4-window', name: '6x4 Windowed Box', size: '6x4x3', material: 'Cardboard', labelTemplate: '6x4-window-label' },
    { id: 'pkg-small-bag', name: 'Small Paper Bag', size: '6x9', material: 'Kraft Paper', labelTemplate: 'small-bag-label' },
    { id: 'pkg-medium-box', name: 'Medium Box', size: '8x8x4', material: 'Cardboard', labelTemplate: 'medium-box-label' },
    { id: 'pkg-baguette-sleeve', name: 'Baguette Sleeve', size: '20x4', material: 'Paper', labelTemplate: 'baguette-label' }
  ];
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [creationMethod, setCreationMethod] = useState<'manual' | 'scan' | null>(null);
  const [showCustomIngredientForm, setShowCustomIngredientForm] = useState(false);
  const [showAiParsingModal, setShowAiParsingModal] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [aiParsingResult, setAiParsingResult] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingAttempted, setParsingAttempted] = useState(false);
  const [customIngredientData, setCustomIngredientData] = useState({
    name: '',
    description: '',
    category: '',
    supplier: '',
    currentStock: 0,
    quantityPerUnit: 1,
    reorderPoint: 0,
    unit: '',
    unitPrice: 0,
    location: '',
    batchNumber: '',
    expirationDate: '',
    tags: [] as string[]
  });
  const [productData, setProductData] = useState<ProductWizardData>({
    type: 'FOOD',
    active: true,
    autoGenerateSku: true,
    tags: [],
    allergenFlags: [],
    ingredients: [],
    images: [],
    documents: []
  });
  const [noLeadTime, setNoLeadTime] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newIngredient, setNewIngredient] = useState({
    inventoryItemId: '',
    quantity: 0,
    unit: '',
    notes: '',
    isOptional: false
  });
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    file: File;
    preview: string;
    isPrimary: boolean;
  }>>([]);

  const commonAllergens = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Soy', 'Fish', 'Shellfish', 'Wheat'];

  const handleStepNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('creation-method');
        break;
      case 'creation-method':
        // This case is now handled directly in the button click handlers
        break;
      case 'ai-parsing':
        setCurrentStep('basics');
        break;
      case 'basics':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('ingredients');
        break;
      case 'ingredients':
        setCurrentStep('production');
        break;
      case 'production':
        setCurrentStep('images');
        break;
      case 'images':
        setCurrentStep('pricing');
        break;
      case 'pricing':
        setCurrentStep('review');
        break;
      case 'review':
        onComplete(productData);
        handleReset();
        onClose();
        break;
      default:
        break;
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'creation-method':
        setCurrentStep('welcome');
        break;
      case 'ai-parsing':
        setCurrentStep('creation-method');
        break;
      case 'basics':
        setCurrentStep(creationMethod === 'scan' ? 'ai-parsing' : 'creation-method');
        break;
      case 'details':
        setCurrentStep('basics');
        break;
      case 'ingredients':
        setCurrentStep('details');
        break;
      case 'production':
        setCurrentStep('ingredients');
        break;
      case 'images':
        setCurrentStep('production');
        break;
      case 'pricing':
        setCurrentStep('images');
        break;
      case 'review':
        setCurrentStep('pricing');
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setCurrentStep('welcome');
    setCreationMethod(null);
    setNoLeadTime(false);
    setUploadedDocument(null);
    setAiParsingResult(null);
    setIsParsing(false);
    setParsingAttempted(false);
    setProductData({
      type: 'FOOD',
      active: true,
      autoGenerateSku: true,
      tags: [],
      allergenFlags: [],
      ingredients: [],
      images: [],
      documents: []
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProductData = (field: keyof ProductWizardData, value: string | number | boolean | string[] | any[] | undefined) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !productData.tags?.includes(newTag.trim())) {
      updateProductData('tags', [...(productData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateProductData('tags', productData.tags?.filter(t => t !== tag) || []);
  };

  const toggleAllergen = (allergen: string) => {
    const allergens = productData.allergenFlags || [];
    if (allergens.includes(allergen)) {
      updateProductData('allergenFlags', allergens.filter(a => a !== allergen));
    } else {
      updateProductData('allergenFlags', [...allergens, allergen]);
    }
  };

  const addIngredient = () => {
    if (newIngredient.inventoryItemId && newIngredient.quantity > 0 && newIngredient.unit) {
      updateProductData('ingredients', [
        ...(productData.ingredients || []),
        { ...newIngredient }
      ]);
      setNewIngredient({
        inventoryItemId: '',
        quantity: 0,
        unit: '',
        notes: '',
        isOptional: false
      });
    }
  };

  const handleAutoCreateIngredients = async (parsedIngredients: any[]) => {
    const createdIngredients: any[] = [];
    const missingIngredients: string[] = [];

    for (const parsedIngredient of parsedIngredients) {
      // Check if ingredient exists in inventory
      const existingItem = inventoryItems.find(item => 
        item.name.toLowerCase().includes(parsedIngredient.name.toLowerCase()) ||
        parsedIngredient.name.toLowerCase().includes(item.name.toLowerCase())
      );

      if (existingItem) {
        // Use existing ingredient
        createdIngredients.push({
          inventoryItemId: existingItem.id,
          quantity: parsedIngredient.quantity,
          unit: parsedIngredient.unit,
          notes: `AI parsed from document`,
          isOptional: false
        });
      } else {
        // Create new ingredient in inventory
        try {
          const newInventoryItem = await createInventoryItem.mutateAsync({
            name: parsedIngredient.name,
            description: `Auto-created from AI parsing - please update stock levels`,
            category: 'food_grade',
            currentStock: 0, // Zero stock as specified
            reorderPoint: 0,
            unit: parsedIngredient.unit,
            unitPrice: 0, // Will need to be updated by user
            supplier: 'Unknown - AI Created',
            batch: `AI-${Date.now()}`,
            tags: ['ai-created', 'needs-review'],
            location: 'To be determined'
          });

          // Add to ingredients list
          createdIngredients.push({
            inventoryItemId: newInventoryItem.id,
            quantity: parsedIngredient.quantity,
            unit: parsedIngredient.unit,
            notes: `AI created ingredient - stock: 0, needs review`,
            isOptional: false
          });

          missingIngredients.push(parsedIngredient.name);
        } catch (error) {
          console.error('Failed to create ingredient:', parsedIngredient.name, error);
          missingIngredients.push(parsedIngredient.name);
        }
      }
    }

    // Update product ingredients
    updateProductData('ingredients', createdIngredients);

    // Show disclaimer for missing ingredients if any
    if (missingIngredients.length > 0) {
      alert(`⚠️ AI Parsing Notice\n\nThe following ingredients were not found in your inventory and have been added with zero stock:\n\n• ${missingIngredients.join('\n• ')}\n\nPlease review and update their stock levels and pricing in your inventory.`);
    }
  };

  const removeIngredient = (index: number) => {
    updateProductData('ingredients', productData.ingredients?.filter((_, i) => i !== index) || []);
  };

  // Image upload functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        
        setUploadedImages(prev => [...prev, {
          id,
          file,
          preview,
          isPrimary: prev.length === 0 // First image is primary by default
        }]);
      }
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // If we removed the primary image, make the first remaining image primary
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (id: string) => {
    setUploadedImages(prev => 
      prev.map(img => ({ ...img, isPrimary: img.id === id }))
    );
  };

  const generateSKU = () => {
    const prefix = productData.type === 'FOOD' ? 'FD' : 
                   productData.type === 'NON_FOOD' ? 'NF' :
                   productData.type === 'SERVICE' ? 'SV' : 'CL';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
  };

  const getStepProgress = () => {
    const steps = ['welcome', 'creation-method', 'ai-parsing', 'basics', 'details', 'ingredients', 'production', 'images', 'pricing', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const calculateTotalCost = () => {
    return (productData.baseCost || 0) + (productData.laborCost || 0);
  };

  const calculateMargin = () => {
    const totalCost = calculateTotalCost();
    const price = productData.price || 0;
    if (price > 0 && totalCost > 0) {
      return (((price - totalCost) / price) * 100).toFixed(1);
    }
    return '0.0';
  };

  // Auto-calculate inventory costs
  const calculatedInventoryCost = useMemo(() => {
    if (!productData.ingredients || productData.ingredients.length === 0) {
      return 0;
    }

    return productData.ingredients.reduce((total, ingredient) => {
      const inventoryItem = inventoryItems.find(item => item.id === ingredient.inventoryItemId);
      if (inventoryItem) {
        // Use average cost if available, otherwise last cost, fallback to unitPrice
        const costPerUnit = inventoryItem.avg_cost || inventoryItem.last_cost || inventoryItem.unitPrice || 0;
        return total + (ingredient.quantity * costPerUnit);
      }
      return total;
    }, 0);
  }, [productData.ingredients, inventoryItems]);

  // Auto-update base cost when inventory changes
  React.useEffect(() => {
    if (calculatedInventoryCost > 0 && !productData.baseCost) {
      updateProductData('baseCost', calculatedInventoryCost);
    }
  }, [calculatedInventoryCost, productData.baseCost]);

  // Reset AI parsing states when modal opens
  React.useEffect(() => {
    if (showAiParsingModal) {
      setUploadedDocument(null);
      setAiParsingResult(null);
      setIsParsing(false);
      setParsingAttempted(false);
    }
  }, [showAiParsingModal]);

  // Calculate suggested selling price based on target margin
  const suggestedPrice = useMemo(() => {
    const totalCost = calculatedInventoryCost + (productData.laborCost || 0);
    const targetMargin = 0.35; // 35% target margin
    if (totalCost > 0) {
      return totalCost / (1 - targetMargin);
    }
    return 0;
  }, [calculatedInventoryCost, productData.laborCost]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add Product Wizard</h2>
              <p className="text-white/90 mt-1">Let's create your perfect product</p>
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="text-white/80 hover:text-white transition-colors"
              title="Close wizard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step Progress */}
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-purple-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
        </div>

        {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {currentStep === 'welcome' && (
            <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              >
                <CravendorWizard title="Greetings, I am Cravendor the Wise!">
                  <p className="text-lg text-gray-700">
                    Keeper of the marketplace realms and your humble guide on this noble quest to master the <strong>Product Wizard</strong>.
                  </p>
                  <p className="text-lg text-gray-700">
                    In these enchanted realms of craft and commerce, your product page's hold the power to awaken the full magic of Craved Artisan. Fear not, adventurer, for I shall walk beside you on this journey.
                  </p>
                  <p className="text-lg text-gray-700 font-medium text-purple-700">
                    Now then, shall we begin your quest? Click next to embark.
                  </p>
                  <Button onClick={handleStepNext} className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-full inline-flex items-center justify-center mx-auto gap-2">
                    Next <ArrowRight className="w-5 h-5" />
                  </Button>
                </CravendorWizard>
              </motion.div>
            )}

            {currentStep === 'creation-method' && (
              <motion.div
                key="creation-method"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CravendorWizard title="How would you like to create your product?">
                  <p className="text-lg text-gray-700 mb-6">
                    Choose your preferred method for adding product details:
                  </p>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <button
                      onClick={() => {
                        setCreationMethod('manual');
                        setCurrentStep('basics');
                      }}
                      className="w-full p-6 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
                          <p className="text-gray-600">Fill out product details step by step</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCreationMethod('scan');
                        setShowAiParsingModal(true);
                      }}
                      className="w-full p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Scan & AI Parse</h3>
                          <p className="text-gray-600">Upload an image and let AI extract product information</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </CravendorWizard>
              </motion.div>
            )}

            {currentStep === 'ai-parsing' && parsingAttempted && (
              <motion.div
                key="ai-parsing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CravendorWizard title="AI Parsing Results">
                  {aiParsingResult !== null && aiParsingResult !== undefined ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-semibold mb-1">Successfully Parsed!</p>
                            <p>AI has extracted the following information from your document:</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                        <h4 className="font-semibold text-gray-900 mb-3">Parsed Information:</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Product Name:</span> {aiParsingResult.name || 'Not detected'}</div>
                          <div><span className="font-medium">Description:</span> {aiParsingResult.description || 'Not detected'}</div>
                          <div><span className="font-medium">Price:</span> ${aiParsingResult.price || 'Not detected'}</div>
                          <div><span className="font-medium">Ingredients:</span> {aiParsingResult.ingredients?.length || 0} items detected</div>
                          {aiParsingResult.ingredients && aiParsingResult.ingredients.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium">Ingredients List:</span>
                              <ul className="mt-1 ml-4 space-y-1">
                                {aiParsingResult.ingredients.slice(0, 3).map((ingredient: any, index: number) => (
                                  <li key={index} className="text-xs text-gray-600">
                                    • {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                                  </li>
                                ))}
                                {aiParsingResult.ingredients.length > 3 && (
                                  <li className="text-xs text-gray-500">
                                    ... and {aiParsingResult.ingredients.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={async () => {
                            // Apply all parsed data to productData
                            if (aiParsingResult.name) updateProductData('name', aiParsingResult.name);
                            if (aiParsingResult.description) updateProductData('description', aiParsingResult.description);
                            if (aiParsingResult.price) updateProductData('price', aiParsingResult.price);
                            
                            // Auto-fill ingredients and create missing ones
                            if (aiParsingResult.ingredients && aiParsingResult.ingredients.length > 0) {
                              await handleAutoCreateIngredients(aiParsingResult.ingredients);
                            }
                            
                            // Skip to review step for AI-parsed products
                            setCurrentStep('review');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Use Parsed Data & Skip to Review
                        </Button>
                        <Button
                          onClick={async () => {
                            // Fill in all fields with parsed data for manual editing
                            if (aiParsingResult.name) updateProductData('name', aiParsingResult.name);
                            if (aiParsingResult.description) updateProductData('description', aiParsingResult.description);
                            if (aiParsingResult.price) updateProductData('price', aiParsingResult.price);
                            
                            // Auto-fill ingredients and create missing ones
                            if (aiParsingResult.ingredients && aiParsingResult.ingredients.length > 0) {
                              await handleAutoCreateIngredients(aiParsingResult.ingredients);
                            }
                            
                            // Go to basics step for manual editing
                            setCurrentStep('basics');
                          }}
                          variant="secondary"
                        >
                          Edit Manually (Pre-filled)
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Parsing Failed</p>
                            <p>The AI was unable to extract information from your document. You can proceed with manual entry.</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setCurrentStep('basics');
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Continue with Manual Entry
                      </Button>
                    </div>
                  )}
                </CravendorWizard>
              </motion.div>
            )}

            {currentStep === 'basics' && (
              <motion.div
                key="basics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Basic Product Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                        <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                          </label>
                          <input
                            type="text"
                      id="name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={productData.name || ''}
                            onChange={(e) => updateProductData('name', e.target.value)}
                      placeholder="e.g., Artisan Sourdough Loaf"
                      title="Product Name"
                          />
                        </div>

                        <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={productData.description || ''}
                      onChange={(e) => updateProductData('description', e.target.value)}
                      placeholder="A brief description of your product"
                      title="Product Description"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type *
                          </label>
                          <select
                      id="type"
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

                  {categories.length > 0 && (
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                          </label>
                      <select
                        id="categoryId"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={productData.categoryId || ''}
                        onChange={(e) => updateProductData('categoryId', e.target.value)}
                        title="Category"
                      >
                        <option value="">Select a category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={productData.active || false}
                      onChange={(e) => updateProductData('active', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="active" className="text-sm text-gray-700">
                      Product is active and available for sale
                    </label>
                        </div>
                      </div>

                    </motion.div>
                  )}

            {currentStep === 'details' && (
                    <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Product Details & SKU</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU (Stock Keeping Unit)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                        type="checkbox"
                        id="autoGenerateSku"
                        checked={productData.autoGenerateSku || false}
                        onChange={(e) => {
                          updateProductData('autoGenerateSku', e.target.checked);
                          if (e.target.checked) {
                            updateProductData('sku', generateSKU());
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="autoGenerateSku" className="text-sm text-gray-700">
                        Auto-generate SKU
                      </label>
                    </div>
                    {!productData.autoGenerateSku && (
                      <input
                        type="text"
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={productData.sku || ''}
                        onChange={(e) => updateProductData('sku', e.target.value)}
                        placeholder="Enter custom SKU"
                        title="SKU"
                      />
                    )}
                    {productData.autoGenerateSku && productData.sku && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        Generated SKU: <strong>{productData.sku}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        id="tags"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                        title="Tags"
                      />
                      <Button onClick={addTag} className="text-sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {productData.tags && productData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {productData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-purple-500 hover:text-purple-700"
                              title="Remove tag"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergen Flags
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {commonAllergens.map(allergen => (
                        <label
                          key={allergen}
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={productData.allergenFlags?.includes(allergen) || false}
                            onChange={() => toggleAllergen(allergen)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm">{allergen}</span>
                        </label>
                      ))}
                      </div>
                          </div>
                        </div>

                    </motion.div>
                  )}

            {currentStep === 'ingredients' && (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Ingredients & Cost Calculation</h3>
                <p className="text-gray-600 text-center">
                  Add ingredients from your inventory for automatic cost calculation
                </p>

                {/* Auto-calculation info card */}
                {calculatedInventoryCost > 0 && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Auto-Calculated Costs</h4>
                </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Inventory Cost:</span>
                        <span className="font-bold text-blue-900 ml-2">${calculatedInventoryCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Based on:</span>
                        <span className="font-medium text-blue-900 ml-2">{productData.ingredients?.length || 0} ingredients</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 This cost will be automatically applied to your base cost in the pricing step
                    </p>
                  </Card>
                )}

                {inventoryItems.length > 0 ? (
                  <>
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Add Ingredient</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={newIngredient.inventoryItemId}
                            onChange={(e) => {
                              if (e.target.value === 'add-custom') {
                                setShowCustomIngredientForm(true);
                                return;
                              }
                              const item = inventoryItems.find(i => i.id === e.target.value);
                              setNewIngredient({
                                ...newIngredient,
                                inventoryItemId: e.target.value,
                                unit: item?.unit || ''
                              });
                            }}
                            title="Select ingredient"
                          >
                            <option value="">Select ingredient...</option>
                            {inventoryItems.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.currentStock} {item.unit} available)
                              </option>
                            ))}
                            <option value="add-custom" className="text-blue-600 font-medium">
                              + Add Custom Ingredient
                            </option>
                          </select>
                  </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={newIngredient.quantity || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                setNewIngredient({ ...newIngredient, quantity: 0 });
                              } else {
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue)) {
                                  setNewIngredient({ ...newIngredient, quantity: numValue });
                                }
                              }
                            }}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            title="Quantity"
                          />
                          <input
                            type="text"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={newIngredient.unit}
                            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                            placeholder="Unit"
                            title="Unit"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={newIngredient.notes || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, notes: e.target.value })}
                          placeholder="Notes (optional)"
                          title="Notes"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newIngredient.isOptional}
                            onChange={(e) => setNewIngredient({ ...newIngredient, isOptional: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">Optional ingredient</span>
                        </label>
                        <Button
                          onClick={addIngredient}
                          disabled={!newIngredient.inventoryItemId || newIngredient.quantity <= 0}
                          className="text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>
                    </Card>

                    {productData.ingredients && productData.ingredients.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">Ingredients List:</h4>
                        {productData.ingredients.map((ing, index) => {
                          const item = inventoryItems.find(i => i.id === ing.inventoryItemId);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                              <div>
                                <span className="font-medium">{item?.name || 'Unknown'}</span>
                                <span className="text-gray-600 ml-2">
                                  {ing.quantity} {ing.unit}
                                </span>
                                {ing.isOptional && (
                                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Optional
                                  </span>
                                )}
                                {ing.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{ing.notes}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeIngredient(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove ingredient"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-6 bg-yellow-50 border-yellow-200 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-yellow-800">
                      No inventory items available. You can add ingredients later from the product edit page.
                    </p>
                  </Card>
                )}

              </motion.div>
            )}

            {/* AI Parsing Modal */}
            {showAiParsingModal && (
              <motion.div
                key={`ai-modal-${showAiParsingModal}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">AI Document Parser</h3>
                      <p className="text-white/90 mt-1">Upload a document and let AI extract product information</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowAiParsingModal(false);
                        setCreationMethod('manual');
                        setCurrentStep('basics');
                        // Reset parsing states
                        setUploadedDocument(null);
                        setAiParsingResult(null);
                        setIsParsing(false);
                        setParsingAttempted(false);
                      }}
                      className="text-white/80 hover:text-white transition-colors"
                      title="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {!uploadedDocument ? (
                      <div className="text-center space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                          <h4 className="font-semibold text-blue-900 mb-2">Upload Document</h4>
                          <p className="text-blue-700 text-sm mb-4">
                            Upload a PDF, image, or document containing your product information. AI will extract details like name, description, ingredients, and pricing.
                          </p>
                          
                          <input
                            type="file"
                            id="document-upload"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadedDocument(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="document-upload"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            Choose File
                          </label>
                        </div>

                        <div className="text-xs text-gray-500">
                          <p>Supported formats: PDF, JPG, PNG, DOC, DOCX (max 10MB)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-900">Document Uploaded</p>
                              <p className="text-green-700 text-sm">{uploadedDocument.name}</p>
                            </div>
                          </div>
                        </div>

                        {!isParsing && !aiParsingResult && (
                          <div className="text-center space-y-4">
                            <Button
                              onClick={async () => {
                                setIsParsing(true);
                                setParsingAttempted(true);
                                try {
                                  // For now, use mock parsing until the API endpoint is implemented
                                  // TODO: Replace with actual API call when /api/ai/parse-document is available
                                  
                                  // Simulate AI parsing delay
                                  await new Promise(resolve => setTimeout(resolve, 3000));
                                  
                                  // Mock successful parsing result based on document type
                                  const fileName = uploadedDocument.name.toLowerCase();
                                  let mockResult;
                                  
                                  if (fileName.includes('recipe') || fileName.includes('ingredient')) {
                                    mockResult = {
                                      name: "Artisan Sourdough Bread",
                                      description: "Traditional sourdough bread made with organic flour and natural starter",
                                      price: 8.99,
                                      ingredients: [
                                        { name: "Organic Bread Flour", quantity: 500, unit: "g" },
                                        { name: "Sourdough Starter", quantity: 100, unit: "g" },
                                        { name: "Himalayan Pink Salt", quantity: 10, unit: "g" },
                                        { name: "Filtered Water", quantity: 350, unit: "ml" }
                                      ],
                                      instructions: "Mix ingredients, knead, proof, and bake at 450°F for 30 minutes"
                                    };
                                  } else if (fileName.includes('product') || fileName.includes('menu')) {
                                    mockResult = {
                                      name: "Gourmet Chocolate Chip Cookies",
                                      description: "Handcrafted cookies with premium dark chocolate chips",
                                      price: 4.99,
                                      ingredients: [
                                        { name: "All-Purpose Flour", quantity: 250, unit: "g" },
                                        { name: "European Butter", quantity: 113, unit: "g" },
                                        { name: "Dark Brown Sugar", quantity: 100, unit: "g" },
                                        { name: "Belgian Dark Chocolate Chips", quantity: 150, unit: "g" }
                                      ]
                                    };
                                  } else {
                                    // Generic product parsing
                                    mockResult = {
                                      name: "Custom Artisan Product",
                                      description: "Handcrafted product made with premium ingredients",
                                      price: 12.99,
                                      ingredients: [
                                        { name: "Premium Ingredient A", quantity: 100, unit: "g" },
                                        { name: "Special Ingredient B", quantity: 50, unit: "ml" }
                                      ]
                                    };
                                  }
                                  
                                  setAiParsingResult(mockResult);
                                } catch (error) {
                                  console.error('AI parsing failed:', error);
                                  setAiParsingResult(null);
                                } finally {
                                  setIsParsing(false);
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Parse with AI
                            </Button>
                            
                            <Button
                              onClick={() => {
                                setUploadedDocument(null);
                                setAiParsingResult(null);
                                setParsingAttempted(false);
                              }}
                              variant="secondary"
                            >
                              Upload Different File
                            </Button>
                          </div>
                        )}

                        {isParsing && (
                          <div className="text-center space-y-4">
                            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-purple-700 font-medium">AI is analyzing your document...</p>
                            <p className="text-gray-600 text-sm">This may take a few moments</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg">
                    <Button
                      onClick={() => {
                        setShowAiParsingModal(false);
                        setCreationMethod('manual');
                        setCurrentStep('basics');
                        // Reset parsing states
                        setUploadedDocument(null);
                        setAiParsingResult(null);
                        setIsParsing(false);
                        setParsingAttempted(false);
                      }}
                      variant="secondary"
                    >
                      Cancel & Use Manual Entry
                    </Button>
                    {aiParsingResult && (
                      <Button
                        onClick={() => {
                          setShowAiParsingModal(false);
                          setCurrentStep('ai-parsing');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Custom Ingredient Form Modal */}
            {showCustomIngredientForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Add Custom Ingredient</h3>
                      <p className="text-white/90 mt-1">This ingredient will be saved to your inventory</p>
                    </div>
                    <button
                      onClick={() => setShowCustomIngredientForm(false)}
                      className="text-white/80 hover:text-white transition-colors"
                      title="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {/* Disclaimer */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Important Notice</p>
                          <p>This ingredient will be added to your inventory system. Make sure all information is accurate as it will affect your stock tracking and cost calculations.</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.name}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, name: e.target.value})}
                          placeholder="e.g., Organic Coconut Flour"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.category}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, category: e.target.value})}
                          title="Category"
                        >
                          <option value="">Select category...</option>
                          <option value="food_grade">Food Grade</option>
                          <option value="raw_materials">Raw Materials</option>
                          <option value="packaging">Packaging</option>
                          <option value="equipment">Equipment</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.description}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, description: e.target.value})}
                          placeholder="Brief description of the ingredient..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supplier
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.supplier}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, supplier: e.target.value})}
                          placeholder="e.g., Local Farm Co."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.location}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, location: e.target.value})}
                          placeholder="e.g., Pantry Shelf A1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Stock (Bulk Quantity) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.currentStock}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, currentStock: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                          title="Current Stock"
                        />
                        <p className="text-xs text-gray-500 mt-1">Total quantity you have (e.g., 1 box, 5 lbs)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity Per Unit *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.quantityPerUnit}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, quantityPerUnit: parseFloat(e.target.value) || 1})}
                          placeholder="1.00"
                          title="Quantity Per Unit"
                        />
                        <p className="text-xs text-gray-500 mt-1">How many individual units in your bulk purchase (e.g., 15 cups from 1 box of garlic)</p>
                        <p className="text-xs text-blue-600 mt-1">💡 This helps calculate unit cost: if you paid $30 for 15 cups, each cup costs $2.00</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.unit}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, unit: e.target.value})}
                          title="Unit"
                        >
                          <option value="">Select unit...</option>
                          <option value="lbs">Pounds (lbs)</option>
                          <option value="oz">Ounces (oz)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="g">Grams (g)</option>
                          <option value="cups">Cups</option>
                          <option value="tbsp">Tablespoons (tbsp)</option>
                          <option value="tsp">Teaspoons (tsp)</option>
                          <option value="each">Each</option>
                          <option value="dozen">Dozen</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price ($) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.unitPrice}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, unitPrice: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reorder Point
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.reorderPoint}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, reorderPoint: parseFloat(e.target.value) || 0})}
                          placeholder="Minimum stock level"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batch Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.batchNumber}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, batchNumber: e.target.value})}
                          placeholder="e.g., BATCH-2024-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customIngredientData.expirationDate}
                          onChange={(e) => setCustomIngredientData({...customIngredientData, expirationDate: e.target.value})}
                          title="Expiration Date"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
                    <Button
                      onClick={() => setShowCustomIngredientForm(false)}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        createInventoryItem.mutate({
                          name: customIngredientData.name,
                          description: customIngredientData.description,
                          category: customIngredientData.category as 'food_grade' | 'raw_materials' | 'packaging' | 'equipment',
                          currentStock: customIngredientData.currentStock,
                          reorderPoint: customIngredientData.reorderPoint,
                          unit: customIngredientData.unit,
                          unitPrice: customIngredientData.unitPrice,
                          supplier: customIngredientData.supplier,
                          batch: customIngredientData.batchNumber || undefined,
                          expiryDate: customIngredientData.expirationDate || undefined,
                          tags: customIngredientData.tags,
                          location: customIngredientData.location
                        }, {
                          onSuccess: () => {
                            setShowCustomIngredientForm(false);
                            // Reset form
                            setCustomIngredientData({
                              name: '',
                              description: '',
                              category: '',
                              supplier: '',
                              currentStock: 0,
                              quantityPerUnit: 1,
                              reorderPoint: 0,
                              unit: '',
                              unitPrice: 0,
                              location: '',
                              batchNumber: '',
                              expirationDate: '',
                              tags: []
                            });
                          }
                        });
                      }}
                      disabled={!customIngredientData.name || !customIngredientData.category || !customIngredientData.unit || customIngredientData.unitPrice <= 0 || createInventoryItem.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createInventoryItem.isPending ? 'Adding...' : 'Add to Inventory'}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 'production' && (
              <motion.div
                key="production"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Production Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productData.type !== 'CLASSES' && (
                    <>
                        <div>
                        <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 mb-2">
                          Batch Size (units per batch)
                          </label>
                          <input
                            type="number"
                          id="batchSize"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={productData.batchSize || ''}
                          onChange={(e) => updateProductData('batchSize', parseInt(e.target.value) || undefined)}
                          placeholder="e.g., 12"
                          min="1"
                          step="1"
                          title="Batch Size"
                          />
                        </div>
                        
                        <div>
                        <label htmlFor="creationTimeMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                          Creation Time (minutes)
                          </label>
                          <input
                            type="number"
                          id="creationTimeMinutes"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={productData.creationTimeMinutes || ''}
                          onChange={(e) => updateProductData('creationTimeMinutes', parseInt(e.target.value) || undefined)}
                          placeholder="e.g., 60"
                          min="0"
                          step="1"
                          title="Creation Time"
                          />
                        </div>
                        
                        <div>
                        <label htmlFor="leadTimeDays" className="block text-sm font-medium text-gray-700 mb-2">
                          Lead Time (days)
                          </label>
                          <input
                            type="number"
                          id="leadTimeDays"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={productData.leadTimeDays || ''}
                          onChange={(e) => {
                            if (!noLeadTime) {
                              updateProductData('leadTimeDays', parseInt(e.target.value) || undefined);
                            }
                          }}
                          placeholder="e.g., 3"
                          min="0"
                          step="1"
                          title="Lead Time"
                          disabled={noLeadTime}
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="noLeadTime"
                            checked={noLeadTime}
                            onChange={(e) => {
                              setNoLeadTime(e.target.checked);
                              if (e.target.checked) {
                                updateProductData('leadTimeDays', 0);
                              }
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="noLeadTime" className="text-sm text-gray-700">
                            No lead time required
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Days needed before production can start (e.g., sourdough starter prep)
                        </p>
                        </div>

                      <div>
                        <label htmlFor="packageId" className="block text-sm font-medium text-gray-700 mb-2">
                          Package Type *
                        </label>
                        <select
                          id="packageId"
                          value={productData.packageId || ''}
                          onChange={(e) => {
                            const selectedPkg = availablePackaging.find(p => p.id === e.target.value);
                            updateProductData('packageId', e.target.value);
                            updateProductData('packageName', selectedPkg?.name);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          title="Select package type for this product"
                        >
                          <option value="">Select packaging...</option>
                          {availablePackaging.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} ({pkg.size}) - {pkg.material}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          This determines which label template will be used when printing labels for orders
                        </p>
                      </div>
                    </>
                  )}
                        
                  {productData.type === 'CLASSES' && (
                    <>
                        <div>
                        <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700 mb-2">
                          Available Seats
                          </label>
                          <input
                            type="number"
                          id="availableSeats"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={productData.availableSeats || ''}
                          onChange={(e) => updateProductData('availableSeats', parseInt(e.target.value) || undefined)}
                          placeholder="e.g., 12"
                          min="1"
                          step="1"
                          title="Available Seats"
                          />
                        </div>

                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          id="duration"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={productData.duration || ''}
                          onChange={(e) => updateProductData('duration', e.target.value)}
                          placeholder="e.g., 2 hours"
                          title="Duration"
                        />
                      </div>
                    </>
                  )}
                    </div>

                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Production Instructions
                  </label>
                  <textarea
                    id="instructions"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={productData.instructions || ''}
                    onChange={(e) => updateProductData('instructions', e.target.value)}
                    placeholder="Step-by-step instructions for creating this product..."
                    title="Instructions"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="sops" className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Operating Procedures (SOPs)
                  </label>
                  <textarea
                    id="sops"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={productData.sops || ''}
                    onChange={(e) => updateProductData('sops', e.target.value)}
                    placeholder="Quality standards, safety procedures, and best practices..."
                    title="SOPs"
                  ></textarea>
                </div>

              </motion.div>
            )}

            {currentStep === 'images' && (
              <motion.div
                key="images"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Product Images</h3>
                <p className="text-gray-600 text-center">
                  Upload images to showcase your product (optional but recommended)
                </p>

                {/* Upload Area */}
                <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                  <div className="text-center">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="bg-purple-100 p-4 rounded-full">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload Product Images</p>
                        <p className="text-sm text-gray-500">Click to browse or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP (max 10MB each)</p>
                      </div>
                    </label>
                  </div>
                </Card>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                        <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Uploaded Images ({uploadedImages.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={image.preview}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Primary Badge */}
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                          </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!image.isPrimary && (
                              <Button
                                onClick={() => setPrimaryImage(image.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              onClick={() => removeImage(image.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Tips */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-semibold text-blue-900 mb-2">Image Tips</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Use high-quality, well-lit photos</li>
                        <li>• Show your product from multiple angles</li>
                        <li>• Include close-up shots of details</li>
                        <li>• The first image will be your primary product image</li>
                      </ul>
                          </div>
                        </div>
                      </Card>
              </motion.div>
            )}

            {currentStep === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Pricing & Costs</h3>
                <p className="text-gray-600 text-center">
                  Set your costs and selling price to calculate profit margins
                </p>

                {/* Auto-calculated cost summary */}
                {calculatedInventoryCost > 0 && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Auto-Calculated from Ingredients</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Inventory Cost:</span>
                        <span className="font-bold text-green-900 ml-2">${calculatedInventoryCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Suggested Price:</span>
                        <span className="font-bold text-green-900 ml-2">${suggestedPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      💡 Based on 35% target margin. You can adjust these values below.
                    </p>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="baseCost" className="block text-sm font-medium text-gray-700 mb-2">
                      Base/Materials Cost ($) *
                        </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                        id="baseCost"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={productData.baseCost || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateProductData('baseCost', 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              updateProductData('baseCost', numValue);
                            }
                          }
                        }}
                        placeholder="0.00"
                        min="0"
                          step="0.01"
                        title="Base Cost"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 mb-2">
                      Labor Cost ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="laborCost"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={productData.laborCost || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateProductData('laborCost', 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              updateProductData('laborCost', numValue);
                            }
                          }
                        }}
                          placeholder="0.00"
                        min="0"
                        step="0.01"
                        title="Labor Cost"
                        />
                    </div>
                  </div>
                      </div>

                      <Card className="p-6 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Cost Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Base Cost:</div>
                    <div className="font-bold text-right">${(productData.baseCost || 0).toFixed(2)}</div>
                    <div>Labor Cost:</div>
                    <div className="font-bold text-right">${(productData.laborCost || 0).toFixed(2)}</div>
                    <div className="pt-2 border-t border-blue-300">Total Cost:</div>
                    <div className="font-bold text-right pt-2 border-t border-blue-300 text-blue-700">
                      ${calculateTotalCost().toFixed(2)}
                          </div>
                        </div>
                      </Card>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price ($) *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="price"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-bold"
                        value={productData.price || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateProductData('price', 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              updateProductData('price', numValue);
                            }
                          }
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        title="Selling Price"
                      />
                        </div>
                    {suggestedPrice > 0 && (
                      <Button
                        onClick={() => updateProductData('price', suggestedPrice)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                      >
                        Use Suggested
                      </Button>
                    )}
                          </div>
                          </div>

                {productData.price && productData.price > 0 && (
                  <Card className="p-6 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Profit Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Selling Price:</div>
                      <div className="font-bold text-right">${productData.price.toFixed(2)}</div>
                      <div>Total Cost:</div>
                      <div className="font-bold text-right">${calculateTotalCost().toFixed(2)}</div>
                      <div className="pt-2 border-t border-green-300">Profit per Unit:</div>
                      <div className="font-bold text-right pt-2 border-t border-green-300 text-green-700">
                        ${(productData.price - calculateTotalCost()).toFixed(2)}
                        </div>
                      <div>Profit Margin:</div>
                      <div className="font-bold text-right text-green-700">{calculateMargin()}%</div>
                    </div>
                  </Card>
              )}

              </motion.div>
            )}

              {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="bg-green-100 p-6 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                  </div>
                <h3 className="text-3xl font-bold text-green-600">
                  {creationMethod === 'scan' ? 'AI-Parsed Product Ready!' : 'Good Job, You Created a New Product!'}
                </h3>
                <p className="text-lg text-gray-700 max-w-prose mx-auto">
                  {creationMethod === 'scan' 
                    ? 'Your AI-parsed product has been automatically created with all the details from your document. Review the information below and make any final adjustments before accepting.'
                    : 'You can come back and visit this product anytime if you care to update things or just check-in and see if your pricing setup is still relevant. Take a quick look below and make sure everything is right, if so, click accept!'
                  }
                </p>

                {/* AI Parsing Notice */}
                {creationMethod === 'scan' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800 text-left">
                        <p className="font-semibold mb-1">🤖 AI Parsing Complete</p>
                        <p>This product was created using AI document parsing. All ingredients have been automatically matched or created in your inventory. Please review the ingredient details and update any missing stock levels or pricing.</p>
                      </div>
                    </div>
                  </div>
                )}

                <Card className="p-6 bg-gray-50 border border-gray-200 text-left space-y-3">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-6 h-6 text-purple-600" />
                    Product Summary
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                      <span className="font-semibold">Name:</span>
                      <p className="text-gray-700">{productData.name || 'N/A'}</p>
                        </div>
                        <div>
                      <span className="font-semibold">Type:</span>
                      <p className="text-gray-700">{productData.type || 'N/A'}</p>
                        </div>
                        <div>
                      <span className="font-semibold">SKU:</span>
                      <p className="text-gray-700 font-mono">{productData.sku || 'N/A'}</p>
                        </div>
                    <div>
                      <span className="font-semibold">Status:</span>
                      <p className="text-gray-700">{productData.active ? 'Active' : 'Inactive'}</p>
                      </div>
                        <div>
                      <span className="font-semibold">Selling Price:</span>
                      <p className="text-gray-700 text-lg font-bold">${(productData.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                      <span className="font-semibold">Total Cost:</span>
                      <p className="text-gray-700">${calculateTotalCost().toFixed(2)}</p>
                        </div>
                        <div>
                      <span className="font-semibold">Profit Margin:</span>
                      <p className="text-green-600 font-bold">{calculateMargin()}%</p>
                        </div>
                        <div>
                      <span className="font-semibold">Package Type:</span>
                      <p className="text-gray-700">{productData.packageName || 'Not selected'}</p>
                        </div>
                        <div>
                      <span className="font-semibold">Ingredients:</span>
                      <p className="text-gray-700">{productData.ingredients?.length || 0} items</p>
                      {productData.ingredients && productData.ingredients.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {productData.ingredients.map((ingredient, index) => {
                            const item = inventoryItems.find(i => i.id === ingredient.inventoryItemId);
                            const isAiCreated = item?.tags?.includes('ai-created');
                            return (
                              <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                                <span>• {item?.name || 'Unknown'} ({ingredient.quantity} {ingredient.unit})</span>
                                {isAiCreated && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                    AI Created
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                        </div>
                        <div>
                      <span className="font-semibold">Images:</span>
                      <p className="text-gray-700">{uploadedImages.length} uploaded</p>
                        </div>
                    {productData.batchSize && (
                      <div>
                        <span className="font-semibold">Batch Size:</span>
                        <p className="text-gray-700">{productData.batchSize} units</p>
                      </div>
                    )}
                    {productData.availableSeats && (
                      <div>
                        <span className="font-semibold">Seats:</span>
                        <p className="text-gray-700">{productData.availableSeats} available</p>
                    </div>
                    )}
                  </div>

                  {productData.tags && productData.tags.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {productData.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                </div>
              )}

                  {productData.allergenFlags && productData.allergenFlags.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm">Allergens:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {productData.allergenFlags.map((allergen, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {uploadedImages.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm">Product Images:</span>
                      <div className="flex gap-2 mt-2">
                        {uploadedImages.slice(0, 3).map((image) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.preview}
                              alt="Product preview"
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                            {image.isPrimary && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                                ★
                              </div>
                            )}
                          </div>
                        ))}
                        {uploadedImages.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                            +{uploadedImages.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
            </motion.div>
            )}
        </div>

        {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
            {currentStep !== 'welcome' && (
            <Button
              variant="secondary"
                onClick={handleStepBack}
              className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            )}
            {currentStep === 'creation-method' && (
              <Button
                onClick={handleStepNext}
                disabled={!creationMethod}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'ai-parsing' && (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'basics' && (
              <Button
                onClick={handleStepNext}
                disabled={!productData.name || !productData.description}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'details' && (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'ingredients' && (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'production' && (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'images' && (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'pricing' && (
              <Button
                onClick={handleStepNext}
                disabled={!productData.price || !productData.baseCost || !productData.laborCost}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 'review' && (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white ml-auto"
              >
                <CheckCircle className="w-4 h-4" /> Accept & Create Product
              </Button>
            )}
        </div>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddProductWizard;
