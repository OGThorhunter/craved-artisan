import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Eye, 
  Download, 
  X, 
  Settings, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  expectedDeliveryDate: string;
  assignedTo?: string;
  tags: string[];
}

interface OrderListPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  selectedOrderIds?: string[];
}

interface PrintSettings {
  includeCustomerInfo: boolean;
  includeProductDetails: boolean;
  includeFinancials: boolean;
  includeTimeline: boolean;
  includeAssignments: boolean;
  includeTags: boolean;
  groupBy: 'none' | 'status' | 'priority' | 'assignedTo' | 'date';
  sortBy: 'orderNumber' | 'customerName' | 'status' | 'priority' | 'totalAmount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  pageOrientation: 'portrait' | 'landscape';
  fontSize: 'small' | 'medium' | 'large';
  showPageNumbers: boolean;
  showHeader: boolean;
  showFooter: boolean;
}

const OrderListPrintModal: React.FC<OrderListPrintModalProps> = ({
  isOpen,
  onClose,
  orders,
  selectedOrderIds = []
}) => {
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    includeCustomerInfo: true,
    includeProductDetails: true,
    includeFinancials: true,
    includeTimeline: true,
    includeAssignments: true,
    includeTags: true,
    groupBy: 'none',
    sortBy: 'orderNumber',
    sortOrder: 'asc',
    pageOrientation: 'portrait',
    fontSize: 'medium',
    showPageNumbers: true,
    showHeader: true,
    showFooter: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const filteredOrders = selectedOrderIds.length > 0 
    ? orders.filter(order => selectedOrderIds.includes(order.id))
    : orders;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_production': return <Package className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in_production': return 'In Production';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-red-800 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const sortOrders = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      let aValue: any = a[printSettings.sortBy];
      let bValue: any = b[printSettings.sortBy];

      if (printSettings.sortBy === 'totalAmount') {
        aValue = a.totalAmount;
        bValue = b.totalAmount;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (printSettings.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const groupOrders = (orders: Order[]) => {
    if (printSettings.groupBy === 'none') return { 'All Orders': orders };

    const grouped: Record<string, Order[]> = {};
    
    orders.forEach(order => {
      let key = '';
      switch (printSettings.groupBy) {
        case 'status':
          key = getStatusText(order.status);
          break;
        case 'priority':
          key = order.priority.charAt(0).toUpperCase() + order.priority.slice(1);
          break;
        case 'assignedTo':
          key = order.assignedTo || 'Unassigned';
          break;
        case 'date':
          key = formatDate(order.createdAt);
          break;
        default:
          key = 'All Orders';
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(order);
    });

    return grouped;
  };

  const generatePrintContent = () => {
    const sortedOrders = sortOrders(filteredOrders);
    const groupedOrders = groupOrders(sortedOrders);
    
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order List Report</title>
        <style>
          @page {
            size: ${printSettings.pageOrientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
            margin: 1in;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: ${printSettings.fontSize === 'small' ? '10px' : printSettings.fontSize === 'large' ? '14px' : '12px'};
            line-height: 1.4;
            color: #333;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .header h1 {
            margin: 0;
            font-size: ${printSettings.fontSize === 'small' ? '18px' : printSettings.fontSize === 'large' ? '24px' : '20px'};
          }
          
          .header .subtitle {
            margin: 5px 0 0 0;
            color: #666;
            font-size: ${printSettings.fontSize === 'small' ? '10px' : printSettings.fontSize === 'large' ? '14px' : '12px'};
          }
          
          .group-header {
            background-color: #f5f5f5;
            padding: 8px 12px;
            margin: 15px 0 10px 0;
            border-left: 4px solid #333;
            font-weight: bold;
            font-size: ${printSettings.fontSize === 'small' ? '11px' : printSettings.fontSize === 'large' ? '15px' : '13px'};
          }
          
          .order-item {
            border: 1px solid #ddd;
            margin-bottom: 10px;
            padding: 12px;
            border-radius: 4px;
            page-break-inside: avoid;
          }
          
          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
          }
          
          .order-number {
            font-weight: bold;
            font-size: ${printSettings.fontSize === 'small' ? '11px' : printSettings.fontSize === 'large' ? '15px' : '13px'};
          }
          
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: ${printSettings.fontSize === 'small' ? '9px' : printSettings.fontSize === 'large' ? '11px' : '10px'};
            font-weight: bold;
          }
          
          .priority-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: ${printSettings.fontSize === 'small' ? '8px' : printSettings.fontSize === 'large' ? '10px' : '9px'};
            margin-left: 8px;
          }
          
          .order-details {
            display: grid;
            grid-template-columns: ${printSettings.includeCustomerInfo ? '1fr 1fr' : '1fr'};
            gap: 15px;
            margin-bottom: 8px;
          }
          
          .detail-section h4 {
            margin: 0 0 5px 0;
            font-size: ${printSettings.fontSize === 'small' ? '10px' : printSettings.fontSize === 'large' ? '12px' : '11px'};
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .detail-section p {
            margin: 2px 0;
            font-size: ${printSettings.fontSize === 'small' ? '9px' : printSettings.fontSize === 'large' ? '11px' : '10px'};
          }
          
          .products-list {
            margin-top: 8px;
          }
          
          .product-item {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            border-bottom: 1px dotted #eee;
            font-size: ${printSettings.fontSize === 'small' ? '9px' : printSettings.fontSize === 'large' ? '11px' : '10px'};
          }
          
          .product-item:last-child {
            border-bottom: none;
          }
          
          .financial-summary {
            background-color: #f9f9f9;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
            text-align: right;
          }
          
          .total-amount {
            font-weight: bold;
            font-size: ${printSettings.fontSize === 'small' ? '11px' : printSettings.fontSize === 'large' ? '15px' : '13px'};
            color: #333;
          }
          
          .tags {
            margin-top: 8px;
          }
          
          .tag {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: ${printSettings.fontSize === 'small' ? '8px' : printSettings.fontSize === 'large' ? '10px' : '9px'};
            margin-right: 4px;
            margin-bottom: 2px;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: ${printSettings.fontSize === 'small' ? '9px' : printSettings.fontSize === 'large' ? '11px' : '10px'};
            color: #666;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
    `;

    if (printSettings.showHeader) {
      content += `
        <div class="header">
          <h1>Order List Report</h1>
          <div class="subtitle">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            ${filteredOrders.length !== orders.length ? ` | ${filteredOrders.length} of ${orders.length} orders` : ` | ${filteredOrders.length} orders`}
          </div>
        </div>
      `;
    }

    Object.entries(groupedOrders).forEach(([groupName, groupOrders], groupIndex) => {
      if (printSettings.groupBy !== 'none') {
        content += `<div class="group-header">${groupName} (${groupOrders.length} orders)</div>`;
      }

      groupOrders.forEach((order, index) => {
        if (groupIndex > 0 && index === 0) {
          content += '<div class="page-break"></div>';
        }

        content += `
          <div class="order-item">
            <div class="order-header">
              <div class="order-number">${order.orderNumber}</div>
              <div>
                <span class="status-badge" style="background-color: ${getStatusColor(order.status)}; color: white;">
                  ${getStatusText(order.status)}
                </span>
                <span class="priority-badge ${getPriorityColorClass(order.priority)}">
                  ${order.priority.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div class="order-details">
              ${printSettings.includeCustomerInfo ? `
                <div class="detail-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> ${order.customerName}</p>
                  <p><strong>Email:</strong> ${order.customerEmail}</p>
                </div>
              ` : ''}
              
              <div class="detail-section">
                <h4>Order Information</h4>
                <p><strong>Created:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Expected Delivery:</strong> ${formatDate(order.expectedDeliveryDate)}</p>
                ${printSettings.includeAssignments && order.assignedTo ? `<p><strong>Assigned To:</strong> ${order.assignedTo}</p>` : ''}
              </div>
            </div>
            
            ${printSettings.includeProductDetails && order.items.length > 0 ? `
              <div class="products-list">
                <h4>Products (${order.items.length})</h4>
                ${order.items.map(item => `
                  <div class="product-item">
                    <span>${item.productName} x${item.quantity}</span>
                    <span>${formatCurrency(item.totalPrice)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${printSettings.includeFinancials ? `
              <div class="financial-summary">
                <div class="total-amount">Total: ${formatCurrency(order.totalAmount)}</div>
              </div>
            ` : ''}
            
            ${printSettings.includeTags && order.tags.length > 0 ? `
              <div class="tags">
                ${order.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      });
    });

    if (printSettings.showFooter) {
      content += `
        <div class="footer">
          <p>Order List Report | Generated by Craved Artisan | ${new Date().toLocaleDateString()}</p>
        </div>
      `;
    }

    content += `
      </body>
      </html>
    `;

    return content;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'in_production': return '#3b82f6';
      case 'ready_for_pickup': return '#8b5cf6';
      case 'shipped': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-200 text-red-900';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      };
    } else {
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    const printContent = generatePrintContent();
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-list-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Print Order List</h3>
              <p className="text-sm text-gray-600">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print settings"
              aria-label="Print settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Settings */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Print Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Print Settings</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Page Orientation</label>
                    <select
                      value={printSettings.pageOrientation}
                      onChange={(e) => setPrintSettings(prev => ({
                        ...prev,
                        pageOrientation: e.target.value as 'portrait' | 'landscape'
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Page orientation"
                      aria-label="Page orientation"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                    <select
                      value={printSettings.fontSize}
                      onChange={(e) => setPrintSettings(prev => ({
                        ...prev,
                        fontSize: e.target.value as 'small' | 'medium' | 'large'
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Font size"
                      aria-label="Font size"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Group By</label>
                    <select
                      value={printSettings.groupBy}
                      onChange={(e) => setPrintSettings(prev => ({
                        ...prev,
                        groupBy: e.target.value as any
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Group orders by"
                      aria-label="Group orders by"
                    >
                      <option value="none">No Grouping</option>
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                      <option value="assignedTo">Assigned To</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sort By</label>
                    <select
                      value={printSettings.sortBy}
                      onChange={(e) => setPrintSettings(prev => ({
                        ...prev,
                        sortBy: e.target.value as any
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Sort orders by"
                      aria-label="Sort orders by"
                    >
                      <option value="orderNumber">Order Number</option>
                      <option value="customerName">Customer Name</option>
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                      <option value="totalAmount">Total Amount</option>
                      <option value="createdAt">Created Date</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sort Order</label>
                    <select
                      value={printSettings.sortOrder}
                      onChange={(e) => setPrintSettings(prev => ({
                        ...prev,
                        sortOrder: e.target.value as 'asc' | 'desc'
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Sort order"
                      aria-label="Sort order"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Content Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Include in Report</h4>
                
                <div className="space-y-2">
                  {[
                    { key: 'includeCustomerInfo', label: 'Customer Information' },
                    { key: 'includeProductDetails', label: 'Product Details' },
                    { key: 'includeFinancials', label: 'Financial Information' },
                    { key: 'includeTimeline', label: 'Timeline Information' },
                    { key: 'includeAssignments', label: 'Assignment Information' },
                    { key: 'includeTags', label: 'Order Tags' },
                    { key: 'showPageNumbers', label: 'Page Numbers' },
                    { key: 'showHeader', label: 'Report Header' },
                    { key: 'showFooter', label: 'Report Footer' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={printSettings[option.key as keyof PrintSettings] as boolean}
                        onChange={(e) => setPrintSettings(prev => ({
                          ...prev,
                          [option.key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Preview</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download HTML</span>
                </button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <div 
                className="max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: generatePrintContent()
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} will be printed
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
              disabled={isPrinting}
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
                  <span>Print Order List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderListPrintModal;
