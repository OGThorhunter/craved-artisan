import React, { useState } from 'react';
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
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    invoiceNumber: '',
    amount: '',
    dueDate: '',
    recurring: false,
    recurringInterval: 'monthly' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create invoice
    console.log('Creating new AR invoice:', newInvoice);
    setShowAddForm(false);
    setNewInvoice({
      customerName: '',
      invoiceNumber: '',
      amount: '',
      dueDate: '',
      recurring: false,
      recurringInterval: 'monthly'
    });
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
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Accounts Receivable</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#5B6E02] hover:bg-[#4A5A01]"
        >
          {showAddForm ? 'Cancel' : 'Add Invoice'}
        </Button>
      </div>

      {/* Add Invoice Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            ${data.summary.totalOutstanding.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Outstanding</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            ${data.summary.totalOverdue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            {data.summary.averageDaysOutstanding}
          </div>
          <div className="text-sm text-gray-600">Avg Days Outstanding</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {data.summary.collectionRate}%
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
                ${data.aging.current.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                ${data.aging['1-30'].toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">1-30 Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${data.aging['31-60'].toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">31-60 Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${data.aging['61-90'].toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">61-90 Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800">
                ${data.aging['90+'].toLocaleString()}
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
                {data.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{invoice.customerName}</td>
                    <td className="py-3 px-4 font-mono">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4">${invoice.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.daysOverdue > 0 ? (
                        <span className="text-red-600 font-medium">{invoice.daysOverdue} days</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {invoice.recurring ? (
                        <div className="text-sm">
                          <span className="text-blue-600 font-medium capitalize">{invoice.recurringInterval}</span>
                          {invoice.nextRecurringDate && (
                            <div className="text-xs text-gray-500">
                              Next: {new Date(invoice.nextRecurringDate).toLocaleDateString()}
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
