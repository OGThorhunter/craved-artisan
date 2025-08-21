import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';

interface APBill {
  id: string;
  vendorName: string;
  billNumber: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  daysOverdue: number;
  recurring?: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRecurringDate?: string;
}

interface AccountsPayableData {
  summary: {
    totalOutstanding: number;
    totalOverdue: number;
    averageDaysOutstanding: number;
    paymentRate: number;
  };
  aging: {
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
  bills: APBill[];
}

interface Props {
  data: AccountsPayableData;
}

export function AccountsPayableManagement({ data }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBill, setNewBill] = useState({
    vendorName: '',
    billNumber: '',
    amount: '',
    dueDate: '',
    recurring: false,
    recurringInterval: 'monthly' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create bill
    console.log('Creating new AP bill:', newBill);
    setShowAddForm(false);
    setNewBill({
      vendorName: '',
      billNumber: '',
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
        <h2 className="text-2xl font-bold text-gray-900">Accounts Payable</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#5B6E02] hover:bg-[#4A5A01]"
        >
          {showAddForm ? 'Cancel' : 'Add Bill'}
        </Button>
      </div>

      {/* Add Bill Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Bill</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={newBill.vendorName}
                  onChange={(e) => setNewBill({...newBill, vendorName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                  required
                  aria-label="Vendor Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Number
                </label>
                <input
                  type="text"
                  value={newBill.billNumber}
                  onChange={(e) => setNewBill({...newBill, billNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                  required
                  aria-label="Bill Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
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
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
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
                  checked={newBill.recurring}
                  onChange={(e) => setNewBill({...newBill, recurring: e.target.checked})}
                  className="mr-2"
                  aria-label="Recurring Bill"
                />
                <span className="text-sm font-medium text-gray-700">Recurring Bill</span>
              </label>
              
              {newBill.recurring && (
                <select
                  value={newBill.recurringInterval}
                  onChange={(e) => setNewBill({...newBill, recurringInterval: e.target.value as any})}
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
                Create Bill
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
            {data.summary.paymentRate}%
          </div>
          <div className="text-sm text-gray-600">Payment Rate</div>
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

      {/* Outstanding Bills Table */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Bills</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Bill #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Days Overdue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Recurring</th>
              </tr>
            </thead>
            <tbody>
              {data.bills.map((bill) => (
                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{bill.vendorName}</td>
                  <td className="py-3 px-4 font-mono">{bill.billNumber}</td>
                  <td className="py-3 px-4">${bill.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {bill.daysOverdue > 0 ? (
                      <span className="text-red-600 font-medium">{bill.daysOverdue} days</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {bill.recurring ? (
                      <div className="text-sm">
                        <span className="text-blue-600 font-medium capitalize">{bill.recurringInterval}</span>
                        {bill.nextRecurringDate && (
                          <div className="text-xs text-gray-500">
                            Next: {new Date(bill.nextRecurringDate).toLocaleDateString()}
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

      {/* Payment Planning and Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Planning</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">This Week</h4>
              <div className="text-2xl font-bold text-blue-600">
                ${(data.bills
                  .filter(bill => {
                    const dueDate = new Date(bill.dueDate);
                    const today = new Date();
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                  })
                  .reduce((sum, bill) => sum + bill.amount, 0)).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Due in next 7 days</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">This Month</h4>
              <div className="text-2xl font-bold text-yellow-600">
                ${(data.bills
                  .filter(bill => {
                    const dueDate = new Date(bill.dueDate);
                    const today = new Date();
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 30;
                  })
                  .reduce((sum, bill) => sum + bill.amount, 0)).toLocaleString()}
              </div>
              <div className="text-sm text-yellow-600">Due in next 30 days</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Schedule payments for 8 bills due this week</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Contact 3 vendors about overdue payments</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Review recurring bill schedule for next month</span>
            </div>
          </div>
        </div>
      </div>

      {/* AP Trends Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AP Trends</h3>
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Chart placeholder - AP trends over time</span>
        </div>
      </div>
    </div>
  );
}
