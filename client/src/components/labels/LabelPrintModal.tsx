import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Eye, 
  Download, 
  X, 
  Settings, 
  Copy,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { labelService } from '../../services/labelService';

// Use types from the service
type LabelTemplate = Parameters<typeof labelService.getTemplates>[0];
type LabelData = Parameters<typeof labelService.generateLabelHtml>[1];
type PrintSettings = Parameters<typeof labelService.printLabels>[1];
type LabelPrintJob = ReturnType<typeof labelService.getPrintJobs>[0];

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderIds: string[];
  orders: any[];
}

const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
  isOpen,
  onClose,
  orderIds,
  orders
}) => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null);
  const [previewData, setPreviewData] = useState<LabelData | null>(null);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    copies: 1,
    quality: 'normal'
  });
  const [copies, setCopies] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printJob, setPrintJob] = useState<LabelPrintJob | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (orders.length > 0) {
        setPreviewData(labelService.generateLabelData(orders[0]));
      }
    }
  }, [isOpen, orders]);

  const loadTemplates = async () => {
    const templateList = await labelService.getTemplates();
    setTemplates(templateList);
    if (templateList.length > 0) {
      setSelectedTemplate(templateList[0]);
    }
  };

  const handlePrint = async () => {
    if (!selectedTemplate) return;

    setIsPrinting(true);
    try {
      const job = await labelService.createPrintJob(
        selectedTemplate.id,
        orderIds,
        copies
      );
      setPrintJob(job);
      
      await labelService.executePrintJob(job.id, printSettings);
      
      // Simulate successful print
      setTimeout(() => {
        setIsPrinting(false);
        setPrintJob(null);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Print failed:', error);
      setIsPrinting(false);
    }
  };

  const handlePreview = () => {
    if (orders.length > 0) {
      setPreviewData(labelService.generateLabelData(orders[0]));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'printing': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Print completed';
      case 'failed': return 'Print failed';
      case 'printing': return 'Printing...';
      default: return 'Pending';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Printer className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Print Labels</h3>
              <p className="text-sm text-gray-600">
                {orderIds.length} order{orderIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Settings */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label Template
                </label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    setSelectedTemplate(template || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Select label template"
                  aria-label="Select label template"
                >
                  <option value="">Select template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {selectedTemplate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedTemplate.description}
                  </p>
                )}
              </div>

              {/* Print Settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Print Settings
                  </label>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Toggle print settings"
              aria-label="Toggle print settings"
            >
              <Settings className="h-4 w-4" />
            </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Copies per order
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={copies}
                      onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Number of copies per order"
                      aria-label="Number of copies per order"
                      placeholder="1"
                    />
                  </div>

                  {showSettings && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Paper Size
                        </label>
                        <select
                          value={printSettings.paperSize}
                          onChange={(e) => setPrintSettings(prev => ({
                            ...prev,
                            paperSize: e.target.value as any
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="Select paper size"
                          aria-label="Select paper size"
                        >
                          <option value="A4">A4</option>
                          <option value="Letter">Letter</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Orientation
                        </label>
                        <select
                          value={printSettings.orientation}
                          onChange={(e) => setPrintSettings(prev => ({
                            ...prev,
                            orientation: e.target.value as any
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="Select orientation"
                          aria-label="Select orientation"
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Quality
                        </label>
                        <select
                          value={printSettings.quality}
                          onChange={(e) => setPrintSettings(prev => ({
                            ...prev,
                            quality: e.target.value as any
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="Select print quality"
                          aria-label="Select print quality"
                        >
                          <option value="draft">Draft</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Print Job Status */}
              {printJob && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(printJob.status)}
                    <span className="text-sm font-medium text-gray-900">
                      {getStatusText(printJob.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Job ID: {printJob.id}</p>
                    <p>Orders: {printJob.orderIds.length}</p>
                    <p>Copies: {printJob.copies}</p>
                    {printJob.error && (
                      <p className="text-red-600 mt-1">Error: {printJob.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Preview</h4>
              <button
                onClick={handlePreview}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Eye className="h-4 w-4" />
                <span>Refresh Preview</span>
              </button>
            </div>

            {selectedTemplate && previewData ? (
              <div className="space-y-4">
                {/* Label Preview */}
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div 
                    className="mx-auto border border-gray-400"
                    style={{
                      width: `${selectedTemplate.width * 3.7795275591}px`,
                      height: `${selectedTemplate.height * 3.7795275591}px`,
                      transform: 'scale(0.8)',
                      transformOrigin: 'top left'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: labelService.generatePrintPreview(selectedTemplate, previewData)
                    }}
                  />
                </div>

                {/* Order List */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Orders to Print ({orderIds.length})
                  </h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                        <span className="font-medium">{order.orderNumber}</span>
                        <span className="text-gray-600">{order.customerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Printer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a template to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total labels: {orderIds.length * copies}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={!selectedTemplate || isPrinting}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Printing...</span>
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  <span>Print Labels</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPrintModal;
