import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { X, Upload, FileText, Image, File, Check, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { toast } from 'react-hot-toast';

interface ReceiptParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedItem {
  name: string;
  qty: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  category: string;
  confidence: number;
}

const ReceiptParserModal: React.FC<ReceiptParserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'parsing' | 'review' | 'complete'>('upload');
  const [sourceType, setSourceType] = useState<'IMAGE' | 'PDF' | 'TEXT'>('IMAGE');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [parseJobId, setParseJobId] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const parseReceiptMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/ai/receipt/parse', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse receipt');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // setParseJobId(data.jobId);
      setStep('parsing');
      checkParseStatus(data.jobId);
    },
    onError: (error) => {
      toast.error(error.message);
      setStep('upload');
    }
  });

  const bulkReceiveMutation = useMutation({
    mutationFn: async (data: { jobId: string; rows: any[]; createMissing: boolean }) => {
      const response = await fetch('/api/ai/receipt/bulk-receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to receive inventory');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully received ${data.successCount} items`);
      setStep('complete');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const checkParseStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/ai/receipt/parse/${jobId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check parse status');
      }
      
      const data = await response.json();
      
      if (data.status === 'DONE') {
        setParsedItems(data.parsed_json || []);
        setStep('review');
      } else if (data.status === 'FAILED') {
        toast.error('Failed to parse receipt');
        setStep('upload');
      } else {
        // Still parsing, check again in 2 seconds
        setTimeout(() => checkParseStatus(jobId), 2000);
      }
    } catch {
      toast.error('Error checking parse status');
      setStep('upload');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sourceType === 'TEXT' && !rawText.trim()) {
      toast.error('Please enter receipt text');
      return;
    }
    
    if (sourceType !== 'TEXT' && !selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    const formData = new FormData();
    formData.append('source_type', sourceType);
    
    if (sourceType === 'TEXT') {
      formData.append('raw_text', rawText);
    } else if (selectedFile) {
      formData.append('file', selectedFile);
    }
    
    parseReceiptMutation.mutate(formData);
  };

  const handleItemSelect = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === parsedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(parsedItems.map((_, index) => index)));
    }
  };

  const handleReceiveSelected = () => {
    const itemsToReceive = parsedItems.filter((_, index) => selectedItems.has(index));
    
    if (itemsToReceive.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    
    bulkReceiveMutation.mutate(itemsToReceive);
  };

  const resetModal = () => {
    setStep('upload');
    setSourceType('IMAGE');
    setRawText('');
    setSelectedFile(null);
    // setParseJobId(null);
    setParsedItems([]);
    setSelectedItems(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Scan Receipt</h2>
                <p className="text-sm text-gray-600">Parse receipt and bulk receive inventory</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-8">
              {[
                { key: 'upload', label: 'Upload', icon: Upload },
                { key: 'parsing', label: 'Parsing', icon: Loader2 },
                { key: 'review', label: 'Review', icon: FileText },
                { key: 'complete', label: 'Complete', icon: Check }
              ].map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.key;
                const isCompleted = ['upload', 'parsing', 'review', 'complete'].indexOf(step) > index;
                
                return (
                  <div key={stepItem.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      <Icon size={16} className={isActive && stepItem.key === 'parsing' ? 'animate-spin' : ''} />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {stepItem.label}
                    </span>
                    {index < 3 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {step === 'upload' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Receipt Source
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'IMAGE', label: 'Image', icon: Image },
                      { key: 'PDF', label: 'PDF', icon: File },
                      { key: 'TEXT', label: 'Text', icon: FileText }
                    ].map((source) => {
                      const Icon = source.icon;
                      return (
                        <button
                          key={source.key}
                          type="button"
                          onClick={() => setSourceType(source.key as 'IMAGE' | 'PDF' | 'TEXT')}
                          className={`p-4 border-2 rounded-lg text-center transition-colors ${
                            sourceType === source.key
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={24} className="mx-auto mb-2" />
                          <span className="text-sm font-medium">{source.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {sourceType === 'TEXT' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt Text
                    </label>
                    <Textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Paste receipt text here..."
                      rows={8}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload {sourceType === 'IMAGE' ? 'Image' : 'PDF'} File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={sourceType === 'IMAGE' ? 'image/*' : '.pdf'}
                        onChange={handleFileSelect}
                        title="Select file to upload"
                        className="hidden"
                        required
                      />
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {sourceType === 'IMAGE' ? 'PNG, JPG, GIF up to 10MB' : 'PDF up to 10MB'}
                      </p>
                      {selectedFile && (
                        <div className="mt-4 p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            Selected: {selectedFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={parseReceiptMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={parseReceiptMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {parseReceiptMutation.isPending ? 'Parsing...' : 'Parse Receipt'}
                  </Button>
                </div>
              </form>
            )}
            
            {step === 'parsing' && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Parsing Receipt</h3>
                <p className="text-gray-600">
                  Please wait while we extract items from your receipt...
                </p>
              </div>
            )}
            
            {step === 'review' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Review Parsed Items</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      className="text-xs px-2 py-1"
                      onClick={handleSelectAll}
                    >
                      {selectedItems.size === parsedItems.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Badge variant="default" className="text-xs px-2 py-1">
                      {selectedItems.size} of {parsedItems.length} selected
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {parsedItems.map((item, index) => (
                    <Card
                      key={index}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedItems.has(index) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleItemSelect(index)}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(index)}
                          onChange={() => handleItemSelect(index)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          title={`Select item ${item.name}`}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <Badge
                              variant={item.confidence > 0.8 ? 'default' : item.confidence > 0.6 ? 'secondary' : 'destructive'}
                              className="text-xs px-2 py-1"
                            >
                              {Math.round(item.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Qty:</span> {item.qty} {item.unit}
                            </div>
                            <div>
                              <span className="font-medium">Unit Cost:</span> ${item.unit_cost.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Total:</span> ${item.total_cost.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {item.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setStep('upload')}
                    disabled={bulkReceiveMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleReceiveSelected}
                    disabled={bulkReceiveMutation.isPending || selectedItems.size === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkReceiveMutation.isPending ? 'Receiving...' : `Receive ${selectedItems.size} Items`}
                  </Button>
                </div>
              </div>
            )}
            
            {step === 'complete' && (
              <div className="text-center py-12">
                <Check className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt Processed</h3>
                <p className="text-gray-600 mb-6">
                  Your receipt has been successfully parsed and inventory items have been received.
                </p>
                <Button
                  onClick={handleClose}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReceiptParserModal;

