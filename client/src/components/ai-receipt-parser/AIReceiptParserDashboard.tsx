import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Receipt,
  FileText,
  Upload,
  Camera,
  Eye,
  Trash2,
  Download,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Search,
  Filter,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Brain,
  Image,
  FileImage,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  Hash,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Layers,
  Database,
} from 'lucide-react';

interface ParsedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods' | 'unknown';
  confidence: number;
  lineNumber?: number;
  rawText?: string;
}

interface ParsedReceipt {
  id: string;
  storeName?: string;
  storeAddress?: string;
  receiptDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  items: ParsedItem[];
  rawText: string;
  confidence: number;
  processingTime: number;
  createdAt: string;
}

interface ParsedShoppingList {
  id: string;
  title?: string;
  items: ParsedItem[];
  estimatedTotal?: number;
  rawText: string;
  confidence: number;
  processingTime: number;
  createdAt: string;
}

interface AIReceiptParserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIReceiptParserDashboard({ isOpen, onClose }: AIReceiptParserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'parse' | 'receipts' | 'shopping-lists' | 'analytics'>('parse');
  const [parseMode, setParseMode] = useState<'receipt' | 'shopping-list'>('receipt');
  const [inputText, setInputText] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ParsedReceipt | ParsedShoppingList | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch parsed receipts
  const { data: receiptsData, isLoading: receiptsLoading } = useQuery({
    queryKey: ['ai-receipt-parser-receipts'],
    queryFn: async () => {
      const response = await api.get('/ai-receipt-parser/receipts');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch parsed shopping lists
  const { data: shoppingListsData, isLoading: shoppingListsLoading } = useQuery({
    queryKey: ['ai-receipt-parser-shopping-lists'],
    queryFn: async () => {
      const response = await api.get('/ai-receipt-parser/shopping-lists');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['ai-receipt-parser-analytics'],
    queryFn: async () => {
      const response = await api.get('/ai-receipt-parser/analytics');
      return response.data;
    },
    enabled: isOpen,
  });

  // Parse receipt mutation
  const parseReceiptMutation = useMutation({
    mutationFn: async (data: { text?: string; image?: File }) => {
      const formData = new FormData();
      if (data.text) formData.append('text', data.text);
      if (data.image) formData.append('image', data.image);
      
      const response = await api.post('/ai-receipt-parser/parse-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Receipt parsed successfully!');
      queryClient.invalidateQueries(['ai-receipt-parser-receipts']);
      queryClient.invalidateQueries(['ai-receipt-parser-analytics']);
      setSelectedDocument(data.data);
      setShowDocumentDetails(true);
    },
    onError: () => {
      toast.error('Failed to parse receipt');
    },
  });

  // Parse shopping list mutation
  const parseShoppingListMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post('/ai-receipt-parser/parse-shopping-list', { text });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Shopping list parsed successfully!');
      queryClient.invalidateQueries(['ai-receipt-parser-shopping-lists']);
      queryClient.invalidateQueries(['ai-receipt-parser-analytics']);
      setSelectedDocument(data.data);
      setShowDocumentDetails(true);
    },
    onError: () => {
      toast.error('Failed to parse shopping list');
    },
  });

  // Import to inventory mutation
  const importToInventoryMutation = useMutation({
    mutationFn: async (data: { receiptId?: string; shoppingListId?: string; selectedItems: string[] }) => {
      const response = await api.post('/ai-receipt-parser/import-to-inventory', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.importedItems.length} items imported to inventory!`);
      queryClient.invalidateQueries(['inventory']);
      setSelectedItems([]);
    },
    onError: () => {
      toast.error('Failed to import items to inventory');
    },
  });

  // Delete receipt mutation
  const deleteReceiptMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/ai-receipt-parser/receipts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Receipt deleted successfully');
      queryClient.invalidateQueries(['ai-receipt-parser-receipts']);
      queryClient.invalidateQueries(['ai-receipt-parser-analytics']);
    },
    onError: () => {
      toast.error('Failed to delete receipt');
    },
  });

  // Delete shopping list mutation
  const deleteShoppingListMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/ai-receipt-parser/shopping-lists/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Shopping list deleted successfully');
      queryClient.invalidateQueries(['ai-receipt-parser-shopping-lists']);
      queryClient.invalidateQueries(['ai-receipt-parser-analytics']);
    },
    onError: () => {
      toast.error('Failed to delete shopping list');
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food_grade': return <Package className="w-4 h-4" />;
      case 'raw_materials': return <Layers className="w-4 h-4" />;
      case 'packaging': return <ShoppingCart className="w-4 h-4" />;
      case 'used_goods': return <Database className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food_grade': return 'bg-green-100 text-green-700';
      case 'raw_materials': return 'bg-blue-100 text-blue-700';
      case 'packaging': return 'bg-purple-100 text-purple-700';
      case 'used_goods': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseReceiptMutation.mutate({ image: file });
    }
  };

  const handleParseText = () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to parse');
      return;
    }

    if (parseMode === 'receipt') {
      parseReceiptMutation.mutate({ text: inputText });
    } else {
      parseShoppingListMutation.mutate(inputText);
    }
  };

  const handleImportSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to import');
      return;
    }

    if (!selectedDocument) {
      toast.error('No document selected');
      return;
    }

    const isReceipt = 'storeName' in selectedDocument;
    importToInventoryMutation.mutate({
      receiptId: isReceipt ? selectedDocument.id : undefined,
      shoppingListId: !isReceipt ? selectedDocument.id : undefined,
      selectedItems
    });
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (!selectedDocument) return;
    setSelectedItems(selectedDocument.items.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Brain className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Receipt & Shopping List Parser</h2>
                <p className="text-sm text-gray-600">Extract items from receipts and shopping lists using AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close dashboard"
                aria-label="Close dashboard"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            {[
              { id: 'parse', label: 'Parse Documents', icon: Upload },
              { id: 'receipts', label: 'Receipts', icon: Receipt },
              { id: 'shopping-lists', label: 'Shopping Lists', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Parse Tab */}
          {activeTab === 'parse' && (
            <div className="space-y-6">
              {/* Parse Mode Selection */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Parse Mode</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setParseMode('receipt')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      parseMode === 'receipt'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    Receipt
                  </button>
                  <button
                    onClick={() => setParseMode('shopping-list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      parseMode === 'shopping-list'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Shopping List
                  </button>
                </div>
              </div>

              {/* Input Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Text Input */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Input</h3>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={parseMode === 'receipt' 
                      ? "Paste receipt text here...\n\nExample:\nWhole Foods Market\n123 Main St\nDate: 12/15/2024\n\nOrganic Flour 2 @ $4.99    $9.98\nYeast 1 @ $2.49          $2.49\n\nTotal: $12.47"
                      : "Paste shopping list here...\n\nExample:\nWeekly Grocery Shopping\n\n- 3 bags of all-purpose flour\n- 2 packets of active dry yeast\n- 1 bottle of olive oil\n- 6 oak planks for furniture"
                    }
                    className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleParseText}
                    disabled={parseReceiptMutation.isPending || parseShoppingListMutation.isPending}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                  >
                    <Brain className="w-4 h-4" />
                    {parseReceiptMutation.isPending || parseShoppingListMutation.isPending ? 'Parsing...' : 'Parse Text'}
                  </button>
                </div>

                {/* Image Upload */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Upload</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Camera className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload Receipt Image</p>
                        <p className="text-sm text-gray-600">Supports JPG, PNG, GIF, and PDF files</p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={parseReceiptMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload receipt image"
                  />
                </div>
              </div>

              {/* Recent Parsed Documents */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receiptsData?.receipts?.slice(0, 2).map((receipt: ParsedReceipt) => (
                    <div key={receipt.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{receipt.storeName || 'Receipt'}</h4>
                        <span className="text-sm text-gray-600">{receipt.items.length} items</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {receipt.totalAmount ? `$${receipt.totalAmount.toFixed(2)}` : 'No total'} • 
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedDocument(receipt);
                          setShowDocumentDetails(true);
                        }}
                        className="inline-flex items-center gap-1 text-gray-800 hover:underline text-sm"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  ))}
                  {shoppingListsData?.shoppingLists?.slice(0, 2).map((list: ParsedShoppingList) => (
                    <div key={list.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{list.title || 'Shopping List'}</h4>
                        <span className="text-sm text-gray-600">{list.items.length} items</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedDocument(list);
                          setShowDocumentDetails(true);
                        }}
                        className="inline-flex items-center gap-1 text-gray-800 hover:underline text-sm"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="space-y-4">
              {receiptsData?.receipts?.map((receipt: ParsedReceipt) => (
                <div key={receipt.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Receipt className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{receipt.storeName || 'Receipt'}</h3>
                        <p className="text-sm text-gray-600">
                          {receipt.storeAddress} • {receipt.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(receipt.confidence)}`}>
                        {receipt.confidence.toFixed(0)}% confidence
                      </span>
                      <button
                        onClick={() => deleteReceiptMutation.mutate(receipt.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete receipt"
                        aria-label="Delete receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {receipt.totalAmount ? `$${receipt.totalAmount.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Processing Time</p>
                      <p className="text-lg font-bold text-gray-900">{receipt.processingTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items:</span>
                      {receipt.items.slice(0, 3).map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {item.name}
                        </span>
                      ))}
                      {receipt.items.length > 3 && (
                        <span className="text-xs text-gray-500">+{receipt.items.length - 3} more</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDocument(receipt);
                        setShowDocumentDetails(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shopping Lists Tab */}
          {activeTab === 'shopping-lists' && (
            <div className="space-y-4">
              {shoppingListsData?.shoppingLists?.map((list: ParsedShoppingList) => (
                <div key={list.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{list.title || 'Shopping List'}</h3>
                        <p className="text-sm text-gray-600">{list.items.length} items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(list.confidence)}`}>
                        {list.confidence.toFixed(0)}% confidence
                      </span>
                      <button
                        onClick={() => deleteShoppingListMutation.mutate(list.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete shopping list"
                        aria-label="Delete shopping list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Processing Time</p>
                      <p className="text-lg font-bold text-gray-900">{list.processingTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items:</span>
                      {list.items.slice(0, 3).map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {item.name}
                        </span>
                      ))}
                      {list.items.length > 3 && (
                        <span className="text-xs text-gray-500">+{list.items.length - 3} more</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDocument(list);
                        setShowDocumentDetails(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analyticsData.overview.totalReceipts}</p>
                      <p className="text-sm text-green-600">Parsed Receipts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.totalShoppingLists}</p>
                      <p className="text-sm text-blue-600">Shopping Lists</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{analyticsData.overview.totalItems}</p>
                      <p className="text-sm text-purple-600">Total Items</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{analyticsData.overview.avgConfidence}%</p>
                      <p className="text-sm text-orange-600">Avg Confidence</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analyticsData.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getCategoryIcon(category)}
                        <span className="text-2xl font-bold text-gray-900">{count as number}</span>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{category.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-lg font-bold text-gray-900">{analyticsData.recentActivity.receiptsLast7Days}</p>
                      <p className="text-sm text-gray-600">Receipts parsed (7 days)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-lg font-bold text-gray-900">{analyticsData.recentActivity.shoppingListsLast7Days}</p>
                      <p className="text-sm text-gray-600">Shopping lists parsed (7 days)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Details Modal */}
        {showDocumentDetails && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {('storeName' in selectedDocument) ? selectedDocument.storeName : selectedDocument.title} Details
                  </h3>
                  <button
                    onClick={() => setShowDocumentDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close document details"
                    aria-label="Close document details"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Document Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedDocument.confidence.toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedDocument.items.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedDocument.processingTime}ms</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Items</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllItems}
                        className="text-sm text-gray-800 hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearSelection}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  {selectedDocument.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleItemSelection(item.id)}
                        className="text-gray-800 hover:text-gray-900"
                        title={selectedItems.includes(item.id) ? 'Deselect item' : 'Select item'}
                        aria-label={selectedItems.includes(item.id) ? 'Deselect item' : 'Select item'}
                      >
                        {selectedItems.includes(item.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {getCategoryIcon(item.category)}
                            <span className="ml-1">{item.category.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity} {item.unit}</span>
                          {item.price > 0 && <span>Price: ${item.price.toFixed(2)}</span>}
                          {item.totalPrice > 0 && <span>Total: ${item.totalPrice.toFixed(2)}</span>}
                          <span className={`font-medium ${getConfidenceColor(item.confidence)}`}>
                            {item.confidence.toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Import Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedItems.length} of {selectedDocument.items.length} items selected
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDocumentDetails(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleImportSelected}
                      disabled={selectedItems.length === 0 || importToInventoryMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {importToInventoryMutation.isPending ? 'Importing...' : 'Import to Inventory'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              AI Receipt Parser • {analyticsData?.overview?.totalReceipts || 0} receipts • {analyticsData?.overview?.totalShoppingLists || 0} shopping lists
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">AI Service Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
