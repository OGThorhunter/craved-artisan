import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  X,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  RefreshCw,
  FileText,
  Package,
  Truck,
  Calendar,
  MapPin,
  Users,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Order, LabelProfile, PrinterProfile, CompileLabelsRequest, CompileLabelsResponse } from '@/types/label';

interface BulkLabelPrintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrders: Order[];
  onOrdersChange: (orders: Order[]) => void;
}

interface GroupedOrders {
  key: string;
  name: string;
  orders: Order[];
  labelCount: number;
  printerJobs: any[];
}

const BulkLabelPrintDrawer: React.FC<BulkLabelPrintDrawerProps> = ({
  isOpen,
  onClose,
  selectedOrders,
  onOrdersChange
}) => {
  const [groupBy, setGroupBy] = useState<'salesWindow' | 'pickupTime' | 'route' | 'printer'>('printer');
  const [dryRun, setDryRun] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompileLabelsResponse | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const queryClient = useQueryClient();

  // Fetch label profiles
  const { data: labelProfilesResponse } = useQuery({
    queryKey: ['label-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/label-profiles', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch label profiles');
      return response.json();
    },
  });

  // Fetch printer profiles
  const { data: printerProfilesResponse } = useQuery({
    queryKey: ['printer-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/printer-profiles', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch printer profiles');
      return response.json();
    },
  });

  const labelProfiles = labelProfilesResponse?.data || [];
  const printerProfiles = printerProfilesResponse?.data || [];

  // Compile labels mutation
  const compileLabelsMutation = useMutation({
    mutationFn: async (data: CompileLabelsRequest) => {
      const response = await fetch('/api/labels/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to compile labels');
      }
      return response.json();
    },
    onSuccess: (data: CompileLabelsResponse) => {
      setCompilationResult(data);
      if (data.dryRun) {
        toast.success('Label compilation preview generated');
      } else {
        toast.success('Labels sent to print queue');
        onClose();
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to compile labels: ${error.message}`);
    },
  });

  // Group orders based on selected criteria
  const groupedOrders: GroupedOrders[] = React.useMemo(() => {
    if (!selectedOrders.length) return [];

    const groups: { [key: string]: GroupedOrders } = {};

    selectedOrders.forEach(order => {
      let groupKey = '';
      let groupName = '';

      switch (groupBy) {
        case 'salesWindow':
          groupKey = order.salesWindowId || 'no-window';
          groupName = order.salesWindowId ? `Sales Window: ${order.salesWindowId}` : 'No Sales Window';
          break;
        case 'pickupTime':
          groupKey = order.expectedDeliveryDate || 'no-date';
          groupName = order.expectedDeliveryDate 
            ? `Pickup: ${new Date(order.expectedDeliveryDate).toLocaleDateString()}`
            : 'No Pickup Date';
          break;
        case 'route':
          groupKey = order.shippingAddress?.city || 'no-route';
          groupName = order.shippingAddress?.city || 'No Route';
          break;
        case 'printer':
          // This would be determined by the label profile resolution logic
          groupKey = 'default-printer';
          groupName = 'Default Printer';
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          name: groupName,
          orders: [],
          labelCount: 0,
          printerJobs: []
        };
      }

      groups[groupKey].orders.push(order);
      // Calculate label count based on order items and their label profiles
      groups[groupKey].labelCount += order.items?.length || 0;
    });

    return Object.values(groups);
  }, [selectedOrders, groupBy]);

  const handleCompile = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order');
      return;
    }

    setIsCompiling(true);
    try {
      await compileLabelsMutation.mutateAsync({
        orderIds: selectedOrders.map(order => order.id),
        groupBy,
        dryRun,
        options: {
          includeWarnings: true,
          validateMedia: true,
          checkTextFit: true,
          validateBarcodes: true
        }
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePrint = () => {
    setDryRun(false);
    handleCompile();
  };

  const handleDownload = () => {
    if (compilationResult?.batchJobId) {
      // Download PDFs for the batch job
      window.open(`/api/labels/batch/${compilationResult.batchJobId}/download`, '_blank');
    }
  };

  const getGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'salesWindow':
        return <Calendar className="h-4 w-4" />;
      case 'pickupTime':
        return <Clock className="h-4 w-4" />;
      case 'route':
        return <MapPin className="h-4 w-4" />;
      case 'printer':
        return <Printer className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'printing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Label Printing</h3>
              <p className="text-sm text-gray-600">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Grouping Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Group Orders By
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'printer', label: 'Printer', icon: Printer },
                  { value: 'salesWindow', label: 'Sales Window', icon: Calendar },
                  { value: 'pickupTime', label: 'Pickup Time', icon: Clock },
                  { value: 'route', label: 'Route', icon: MapPin }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setGroupBy(value as any)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                      groupBy === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grouped Orders Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Order Groups</h4>
                <span className="text-sm text-gray-500">
                  {groupedOrders.length} group{groupedOrders.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {groupedOrders.map((group) => (
                  <div key={group.key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getGroupIcon(groupBy)}
                        <div>
                          <h5 className="font-medium text-gray-900">{group.name}</h5>
                          <p className="text-sm text-gray-600">
                            {group.orders.length} order{group.orders.length !== 1 ? 's' : ''} • {group.labelCount} label{group.labelCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {group.printerJobs.length} print job{group.printerJobs.length !== 1 ? 's' : ''}
                        </span>
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View details"
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                <span>Advanced Options</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {showAdvanced && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="dryRun"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dryRun" className="text-sm text-gray-700">
                      Preview only (dry run) - Generate preview without printing
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label Profile Override
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select label profile override"
                        aria-label="Select label profile override"
                      >
                        <option value="">Use product defaults</option>
                        {labelProfiles.map((profile: LabelProfile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.name} ({profile.mediaWidthIn}" × {profile.mediaHeightIn}")
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Printer Override
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select printer override"
                        aria-label="Select printer override"
                      >
                        <option value="">Use profile defaults</option>
                        {printerProfiles.map((printer: PrinterProfile) => (
                          <option key={printer.id} value={printer.id}>
                            {printer.name} ({printer.driver})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compilation Results */}
            {compilationResult && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900">
                      {compilationResult.dryRun ? 'Preview Generated' : 'Labels Sent to Print Queue'}
                    </h4>
                    <div className="mt-2 text-sm text-blue-800">
                      <p>Total Labels: {compilationResult.summary.totalLabels}</p>
                      <p>Print Jobs: {compilationResult.summary.printerJobs.length}</p>
                      <p>Estimated Time: {Math.ceil(compilationResult.summary.estimatedTime / 60)} minutes</p>
                    </div>
                    
                    {compilationResult.warnings.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Warnings:</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {compilationResult.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {compilationResult?.dryRun && (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDFs</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCompile}
                disabled={isCompiling || selectedOrders.length === 0}
                className="px-4 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCompiling ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>{isCompiling ? 'Compiling...' : 'Preview'}</span>
              </button>
              
              <button
                onClick={handlePrint}
                disabled={isCompiling || selectedOrders.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print Labels</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkLabelPrintDrawer;
