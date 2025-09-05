import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Calculator,
  ArrowRight,
  RotateCcw,
  History,
  BookOpen,
  BarChart3,
  Search,
  Filter,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Layers,
  Package,
  Ruler,
  Thermometer,
  Gauge,
  Battery,
  Hash,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Info,
  Lightbulb,
  Star,
  Clock,
  Globe,
  Settings,
  Download,
  Upload,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  symbol: string;
  factor: number;
  category: string;
  description?: string;
  isCommon?: boolean;
}

interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  units: Unit[];
}

interface ConversionResult {
  from: {
    value: number;
    unit: string;
    unitName: string;
  };
  to: {
    value: number;
    unit: string;
    unitName: string;
  };
  factor: number;
  precision: number;
  formula?: string;
}

interface ConversionHistory {
  id: string;
  fromValue: number;
  fromUnit: string;
  toValue: number;
  toUnit: string;
  category: string;
  timestamp: string;
}

interface UnitConverterDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnitConverterDashboard({ isOpen, onClose }: UnitConverterDashboardProps) {
  const [activeTab, setActiveTab] = useState<'converter' | 'history' | 'reference' | 'analytics'>('converter');
  const [selectedCategory, setSelectedCategory] = useState<string>('weight');
  const [fromValue, setFromValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('kilogram');
  const [toUnit, setToUnit] = useState<string>('pound');
  const [precision, setPrecision] = useState<number>(6);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFormula, setShowFormula] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentConversions, setRecentConversions] = useState<ConversionResult[]>([]);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchInputs, setBatchInputs] = useState<Array<{value: string, fromUnit: string, toUnit: string}>>([
    { value: '', fromUnit: 'kilogram', toUnit: 'pound' }
  ]);
  const queryClient = useQueryClient();

  // Fetch unit categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['unit-converter-categories'],
    queryFn: async () => {
      const response = await axios.get('/api/unit-converter/categories');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch units for selected category
  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['unit-converter-units', selectedCategory],
    queryFn: async () => {
      const response = await axios.get(`/api/unit-converter/categories/${selectedCategory}`);
      return response.data;
    },
    enabled: isOpen && selectedCategory,
  });

  // Fetch conversion history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['unit-converter-history'],
    queryFn: async () => {
      const response = await axios.get('/api/unit-converter/history');
      return response.data;
    },
    enabled: isOpen && activeTab === 'history',
  });

  // Fetch quick reference
  const { data: referenceData, isLoading: referenceLoading } = useQuery({
    queryKey: ['unit-converter-quick-reference'],
    queryFn: async () => {
      const response = await axios.get('/api/unit-converter/quick-reference');
      return response.data;
    },
    enabled: isOpen && activeTab === 'reference',
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['unit-converter-analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/unit-converter/analytics');
      return response.data;
    },
    enabled: isOpen && activeTab === 'analytics',
  });

  // Convert units mutation
  const convertMutation = useMutation({
    mutationFn: async (data: { value: number; fromUnit: string; toUnit: string; precision: number }) => {
      const response = await axios.post('/api/unit-converter/convert', data);
      return response.data;
    },
    onSuccess: (data) => {
      setConversionResult(data.result);
      setRecentConversions(prev => [data.result, ...prev.slice(0, 9)]);
      queryClient.invalidateQueries(['unit-converter-history']);
      queryClient.invalidateQueries(['unit-converter-analytics']);
    },
    onError: () => {
      toast.error('Failed to convert units');
    },
  });

  // Batch convert mutation
  const batchConvertMutation = useMutation({
    mutationFn: async (conversions: Array<{ value: number; fromUnit: string; toUnit: string; precision: number }>) => {
      const response = await axios.post('/api/unit-converter/batch-convert', { conversions });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Batch conversion completed: ${data.results.filter((r: any) => r.success).length} successful`);
      queryClient.invalidateQueries(['unit-converter-history']);
      queryClient.invalidateQueries(['unit-converter-analytics']);
    },
    onError: () => {
      toast.error('Failed to perform batch conversion');
    },
  });

  // Handle unit conversion
  const handleConvert = () => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    
    if (fromUnit === toUnit) {
      toast.error('Please select different units to convert');
      return;
    }
    
    convertMutation.mutate({
      value,
      fromUnit,
      toUnit,
      precision
    });
  };

  // Handle batch conversion
  const handleBatchConvert = () => {
    const conversions = batchInputs
      .filter(input => input.value && input.fromUnit && input.toUnit)
      .map(input => ({
        value: parseFloat(input.value),
        fromUnit: input.fromUnit,
        toUnit: input.toUnit,
        precision
      }));
    
    if (conversions.length === 0) {
      toast.error('Please enter at least one conversion');
      return;
    }
    
    batchConvertMutation.mutate(conversions);
  };

  // Add batch input row
  const addBatchInput = () => {
    setBatchInputs(prev => [...prev, { value: '', fromUnit: fromUnit, toUnit: toUnit }]);
  };

  // Remove batch input row
  const removeBatchInput = (index: number) => {
    setBatchInputs(prev => prev.filter((_, i) => i !== index));
  };

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (conversionResult) {
      setFromValue(conversionResult.to.value.toString());
    }
  };

  // Copy result to clipboard
  const copyResult = async () => {
    if (conversionResult) {
      const text = `${conversionResult.from.value} ${conversionResult.from.unit} = ${conversionResult.to.value} ${conversionResult.to.unit}`;
      await navigator.clipboard.writeText(text);
      toast.success('Result copied to clipboard');
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'weight': return <Package className="w-5 h-5" />;
      case 'volume': return <Layers className="w-5 h-5" />;
      case 'length': return <Ruler className="w-5 h-5" />;
      case 'area': return <Target className="w-5 h-5" />;
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      case 'pressure': return <Gauge className="w-5 h-5" />;
      case 'energy': return <Battery className="w-5 h-5" />;
      case 'custom': return <Hash className="w-5 h-5" />;
      default: return <Calculator className="w-5 h-5" />;
    }
  };

  // Filter units based on search
  const filteredUnits = unitsData?.category?.units?.filter((unit: Unit) =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get common units for quick selection
  const commonUnits = filteredUnits.filter((unit: Unit) => unit.isCommon);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Advanced Unit Converter</h2>
                <p className="text-sm text-gray-600">Convert between different measurement systems with precision</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close converter"
                aria-label="Close converter"
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
              { id: 'converter', label: 'Converter', icon: Calculator },
              { id: 'history', label: 'History', icon: History },
              { id: 'reference', label: 'Quick Reference', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
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
          {/* Converter Tab */}
          {activeTab === 'converter' && (
            <div className="space-y-6">
              {/* Category Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Unit Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categoriesData?.categories?.map((category: UnitCategory) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setFromUnit(category.baseUnit);
                        setToUnit(category.baseUnit);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {getCategoryIcon(category.id)}
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.unitCount} units</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {batchMode ? 'Batch Converter' : 'Single Converter'}
                </h3>
                <button
                  onClick={() => setBatchMode(!batchMode)}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {batchMode ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {batchMode ? 'Single Mode' : 'Batch Mode'}
                </button>
              </div>

              {/* Single Converter */}
              {!batchMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Convert From</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                        <input
                          type="number"
                          value={fromValue}
                          onChange={(e) => setFromValue(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter value"
                          step="any"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search units..."
                          />
                          <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Select from unit"
                          >
                            {filteredUnits.map((unit: Unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Output Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Convert To</h4>
                      <button
                        onClick={swapUnits}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Swap units"
                        aria-label="Swap units"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          {conversionResult ? (
                            <div className="text-lg font-semibold text-gray-900">
                              {conversionResult.to.value} {conversionResult.to.unit}
                            </div>
                          ) : (
                            <div className="text-gray-500">Enter value and select units to convert</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                        <select
                          value={toUnit}
                          onChange={(e) => setToUnit(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Select to unit"
                        >
                          {filteredUnits.map((unit: Unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Batch Converter */}
              {batchMode && (
                <div className="space-y-4">
                  {batchInputs.map((input, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Conversion {index + 1}</h4>
                        {batchInputs.length > 1 && (
                          <button
                            onClick={() => removeBatchInput(index)}
                            className="text-red-400 hover:text-red-600"
                            title="Remove conversion"
                            aria-label="Remove conversion"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="number"
                            value={input.value}
                            onChange={(e) => {
                              const newInputs = [...batchInputs];
                              newInputs[index].value = e.target.value;
                              setBatchInputs(newInputs);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter value"
                            step="any"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">From Unit</label>
                          <select
                            value={input.fromUnit}
                            onChange={(e) => {
                              const newInputs = [...batchInputs];
                              newInputs[index].fromUnit = e.target.value;
                              setBatchInputs(newInputs);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Select from unit"
                          >
                            {filteredUnits.map((unit: Unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">To Unit</label>
                          <select
                            value={input.toUnit}
                            onChange={(e) => {
                              const newInputs = [...batchInputs];
                              newInputs[index].toUnit = e.target.value;
                              setBatchInputs(newInputs);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Select to unit"
                          >
                            {filteredUnits.map((unit: Unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addBatchInput}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Another Conversion
                  </button>
                </div>
              )}

              {/* Conversion Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Precision:</label>
                    <select
                      value={precision}
                      onChange={(e) => setPrecision(Number(e.target.value))}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select precision"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                        <option key={p} value={p}>{p} decimal places</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => setShowFormula(!showFormula)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                      showFormula ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showFormula ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {showFormula ? 'Hide' : 'Show'} Formula
                  </button>
                </div>
                
                <div className="flex gap-3">
                  {!batchMode && (
                    <>
                      <button
                        onClick={copyResult}
                        disabled={!conversionResult}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Result
                      </button>
                      <button
                        onClick={handleConvert}
                        disabled={convertMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Calculator className="w-4 h-4" />
                        {convertMutation.isPending ? 'Converting...' : 'Convert'}
                      </button>
                    </>
                  )}
                  
                  {batchMode && (
                    <button
                      onClick={handleBatchConvert}
                      disabled={batchConvertMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Calculator className="w-4 h-4" />
                      {batchConvertMutation.isPending ? 'Converting...' : 'Convert All'}
                    </button>
                  )}
                </div>
              </div>

              {/* Conversion Result */}
              {conversionResult && showFormula && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Conversion Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800">
                        {conversionResult.from.value} {conversionResult.from.unitName} = {conversionResult.to.value} {conversionResult.to.unitName}
                      </span>
                    </div>
                    <div className="text-blue-700">
                      <strong>Conversion Factor:</strong> {conversionResult.factor}
                    </div>
                    {conversionResult.formula && (
                      <div className="text-blue-700">
                        <strong>Formula:</strong> {conversionResult.formula}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Reference for Current Category */}
              {commonUnits.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Common {unitsData?.category?.name} Units</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {commonUnits.map((unit: Unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          setFromUnit(unit.id);
                          if (fromUnit === toUnit) {
                            setToUnit(commonUnits.find(u => u.id !== unit.id)?.id || unit.id);
                          }
                        }}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          fromUnit === unit.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {unit.name} ({unit.symbol})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {historyData?.history?.map((entry: ConversionHistory) => (
                <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(entry.category)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {entry.fromValue} {entry.fromUnit} → {entry.toValue} {entry.toUnit}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {entry.category}
                      </span>
                      <button
                        onClick={() => {
                          setFromValue(entry.fromValue.toString());
                          setFromUnit(entry.fromUnit);
                          setToUnit(entry.toUnit);
                          setActiveTab('converter');
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Use this conversion"
                        aria-label="Use this conversion"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Reference Tab */}
          {activeTab === 'reference' && (
            <div className="space-y-6">
              {referenceData?.quickReference && Object.entries(referenceData.quickReference).map(([category, conversions]: [string, any]) => (
                <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getCategoryIcon(category)}
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{category} Conversions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {conversions.map((conversion: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="font-medium text-gray-900">{conversion.from}</div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="font-medium text-gray-900">{conversion.to}</div>
                        {conversion.factor && (
                          <div className="text-sm text-gray-600">×{conversion.factor}</div>
                        )}
                        {conversion.formula && (
                          <div className="text-xs text-gray-500">{conversion.formula}</div>
                        )}
                      </div>
                    ))}
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.totalConversions}</p>
                      <p className="text-sm text-blue-600">Total Conversions</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Layers className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analyticsData.overview.totalCategories}</p>
                      <p className="text-sm text-green-600">Categories</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{analyticsData.overview.totalUnits}</p>
                      <p className="text-sm text-purple-600">Available Units</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{analyticsData.recentActivity.last24Hours}</p>
                      <p className="text-sm text-orange-600">Today</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Usage</h3>
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

              {/* Top Units */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Units</h3>
                <div className="space-y-2">
                  {analyticsData.topUnits.map((unit: any, index: number) => (
                    <div key={unit.unit} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{unit.unit}</span>
                      </div>
                      <span className="text-sm text-gray-600">{unit.count} uses</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Advanced Unit Converter • {analyticsData?.overview?.totalConversions || 0} conversions • {analyticsData?.overview?.totalUnits || 0} units
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Converter Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
