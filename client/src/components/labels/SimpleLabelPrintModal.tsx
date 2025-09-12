import React, { useState } from 'react';
import { X, Printer, Download } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface SimpleLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const SimpleLabelPrintModal: React.FC<SimpleLabelPrintModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  const [copies, setCopies] = useState(1);
  const [labelSize, setLabelSize] = useState('4x6');

  if (!isOpen) return null;

  const handlePrint = () => {
    // Create a simple print layout
    const printContent = orders.map(order => {
      return `
        <div style="
          width: ${labelSize === '4x6' ? '4in' : '3in'};
          height: ${labelSize === '4x6' ? '6in' : '2in'};
          border: 1px solid #000;
          padding: 10px;
          margin: 5px;
          font-family: Arial, sans-serif;
          page-break-after: always;
        ">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">
            ${order.orderNumber}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            ${order.customerName}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            ${order.customerEmail}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            ${order.shippingAddress.street}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            Total: $${order.totalAmount.toFixed(2)}
          </div>
          <div style="font-size: 10px; margin-top: 5px;">
            Items: ${order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
          </div>
        </div>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Labels</title>
            <style>
              body { margin: 0; padding: 10px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Print Labels</h3>
              <p className="text-sm text-gray-600">{orders.length} order{orders.length > 1 ? 's' : ''} selected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label Size
            </label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select label size"
              aria-label="Select label size"
            >
              <option value="4x6">4" x 6"</option>
              <option value="3x2">3" x 2"</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Copies
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Number of copies to print"
              aria-label="Number of copies to print"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="text-xs text-gray-600">
              <div className="font-semibold">{orders[0]?.orderNumber}</div>
              <div>{orders[0]?.customerName}</div>
              <div>{orders[0]?.customerEmail}</div>
              <div>Total: ${orders[0]?.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Cancel"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            title="Print labels"
            aria-label="Print labels"
          >
            <Printer className="h-4 w-4" />
            <span>Print Labels</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleLabelPrintModal;
