import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';

interface ARInvoice {
  id: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  daysOverdue: number;
  recurring?: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRecurringDate?: string;
}

interface AccountsReceivableData {
  summary: {
    totalOutstanding: number;
    totalOverdue: number;
    averageDaysOutstanding: number;
    collectionRate: number;
  };
  aging: {
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
  invoices: ARInvoice[];
}

interface Props {
  data: AccountsReceivableData;
}

export function AccountsReceivableManagement({ data }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [localInvoices, setLocalInvoices] = useState<ARInvoice[]>(data?.invoices || []);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    invoiceNumber: '',
    amount: '',
    dueDate: '',
    recurring: false,
    recurringInterval: 'monthly' as const
  });

  // Initialize local state when data prop changes
  useEffect(() => {
    if (data?.invoices) {
      setLocalInvoices(data.invoices);
    }
  }, [data?.invoices]);

  // Null-safety helpers
  const safeNum = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return 0;
  };

  const safeString = (value: unknown) => {
    if (typeof value === 'string') return value;
    return '';
  };

  const safeDate = (value: unknown) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date();
  };

  // Guard against completely invalid data
  if (!data || typeof data !== 'object') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Invalid Data</h3>
        <p className="text-red-600">The accounts receivable data is not in the expected format.</p>
      </div>
    );
  }

  // Calculate local summary data including new invoices
  const calculateLocalSummary = () => {
    const allInvoices = [...localInvoices];
    const totalOutstanding = allInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalOverdue = allInvoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const totalDays = allInvoices.reduce((sum, invoice) => sum + invoice.daysOverdue, 0);
    const averageDaysOutstanding = allInvoices.length > 0 ? totalDays / allInvoices.length : 0;
    
    return {
      totalOutstanding,
      totalOverdue,
      averageDaysOutstanding: Math.round(averageDaysOutstanding),
      collectionRate: data.summary?.collectionRate || 0
    };
  };

  // Calculate local aging data including new invoices
  const calculateLocalAging = () => {
    const allInvoices = [...localInvoices];
    const today = new Date();
    
    const current = allInvoices
      .filter(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const days1_30 = allInvoices
      .filter(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 0 && diffDays >= -30;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const days31_60 = allInvoices
      .filter(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < -30 && diffDays >= -60;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const days61_90 = allInvoices
      .filter(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < -60 && diffDays >= -90;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const days90plus = allInvoices
      .filter(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < -90;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    return {
      current,
      '1-30': days1_30,
      '31-60': days31_60,
      '61-90': days61_90,
      '90+': days90plus
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new invoice with proper data structure
    const newInvoiceData: ARInvoice = {
      id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerName: newInvoice.customerName,
      invoiceNumber: newInvoice.invoiceNumber,
      amount: parseFloat(newInvoice.amount) || 0,
      dueDate: newInvoice.dueDate,
      status: 'pending',
      daysOverdue: 0,
      recurring: newInvoice.recurring,
      recurringInterval: newInvoice.recurringInterval
    };
    
    // Add to local state
    setLocalInvoices(prev => [...prev, newInvoiceData]);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // Reset form
    setShowAddForm(false);
    setNewInvoice({
      customerName: '',
      invoiceNumber: '',
      amount: '',
      dueDate: '',
      recurring: false,
      recurringInterval: 'monthly'
    });
    
    // TODO: In a real app, this would make an API call to persist the data
    console.log('Created new AR invoice:', newInvoiceData);
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    // TODO: Implement API call to upload file
    console.log('Uploading AR file:', uploadFile.name);
    
    // Reset form
    setShowUploadForm(false);
    setUploadFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
      setUploadFile(file);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Invoice added successfully! The new invoice has been added to your accounts receivable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Accounts Receivable</h2>
        <div className="flex space-x-3">
          <Button 
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              setShowAddForm(false);
            }}
            variant="outline"
            className="border-[#5B6E02] text-[#5B6E02] hover:bg-[#5B6E02] hover:text-white"
          >
            {showUploadForm ? 'Cancel Upload' : 'Upload CSV/Excel'}
          </Button>
          <Button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowUploadForm(false);
            }}
            className="bg-[#5B6E02] hover:bg-[#4A5A01]"
          >
            {showAddForm ? 'Cancel' : 'Add Invoice'}
          </Button>
        </div>
      </div>

      {/* Add Invoice Form */}
                {showAddForm && (
            <div className="bg-[#F7F2EC] p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Invoice</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice({...newInvoice, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Customer Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={newInvoice.invoiceNumber}
                    onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Invoice Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Due Date"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newInvoice.recurring}
                    onChange={(e) => setNewInvoice({...newInvoice, recurring: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Invoice</span>
                </label>
                
                {newInvoice.recurring && (
                  <select
                    value={newInvoice.recurringInterval}
                    onChange={(e) => setNewInvoice({...newInvoice, recurringInterval: e.target.value as any})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    aria-label="Recurring Interval"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#5B6E02] hover:bg-[#4A5A01]">
                  Create Invoice
                </Button>
              </div>
            </form>
        </div>
      )}

      {/* Upload Form */}
                {showUploadForm && (
            <div className="bg-[#F7F2EC] p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Invoices</h3>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV or Excel File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                required
                aria-label="Upload CSV or Excel file"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected columns: Customer Name, Invoice Number, Amount, Due Date, Recurring (true/false), Recurring Interval (weekly/monthly/quarterly/yearly)
              </p>
            </div>
            
            {uploadFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      File selected: {uploadFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Size: {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Recurring Invoice Options</h4>
              <p className="text-sm text-blue-700">
                To set up recurring invoices, include a "Recurring" column with "true" for recurring invoices, 
                and a "Recurring Interval" column with values: weekly, monthly, quarterly, or yearly.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#5B6E02] hover:bg-[#4A5A01]"
                disabled={!uploadFile}
              >
                Upload Invoices
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            ${calculateLocalSummary().totalOutstanding.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Outstanding</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            ${calculateLocalSummary().totalOverdue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            {calculateLocalSummary().averageDaysOutstanding}
          </div>
          <div className="text-sm text-gray-600">Avg Days Outstanding</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {calculateLocalSummary().collectionRate}%
          </div>
          <div className="text-sm text-gray-600">Collection Rate</div>
        </div>
      </div>

            {/* Aging Analysis */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Analysis</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${calculateLocalAging().current.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ${calculateLocalAging()['1-30'].toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">1-30 Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${calculateLocalAging()['31-60'].toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">31-60 Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${calculateLocalAging()['61-90'].toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">61-90 Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-800">
              ${calculateLocalAging()['90+'].toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">90+ Days</div>
          </div>
        </div>
      </div>

      {/* Outstanding Invoices Table */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Days Overdue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Recurring</th>
                </tr>
              </thead>
                          <tbody>
              {localInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{safeString(invoice.customerName)}</td>
                    <td className="py-3 px-4 font-mono">{safeString(invoice.invoiceNumber)}</td>
                    <td className="py-3 px-4">${safeNum(invoice.amount).toLocaleString()}</td>
                    <td className="py-3 px-4">{safeDate(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(safeString(invoice.status))}`}>
                        {safeString(invoice.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {safeNum(invoice.daysOverdue) > 0 ? (
                        <span className="text-red-600 font-medium">{safeNum(invoice.daysOverdue)} days</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {invoice.recurring ? (
                        <div className="text-sm">
                          <span className="text-blue-600 font-medium capitalize">{safeString(invoice.recurringInterval)}</span>
                          {invoice.nextRecurringDate && (
                            <div className="text-xs text-gray-500">
                              Next: {safeDate(invoice.nextRecurringDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* AR Trends and Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AR Trends</h3>
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Chart placeholder - AR trends over time</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Follow up on 5 invoices over 30 days old</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Send payment reminders for 3 overdue invoices</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Review recurring invoice schedule for next month</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
