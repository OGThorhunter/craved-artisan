import React, { useState } from 'react';
// Card usage removed - using simple div structure instead
import { Button } from '@/components/ui';
import { useRecurringEntries, useCreateRecurringEntry, useUpdateRecurringEntry, useDeleteRecurringEntry, useToggleRecurringEntry, type RecurringEntry, type CreateRecurringEntryRequest } from '@/hooks/analytics/useRecurringEntries';

interface Props {
  vendorId: string;
}

export function RecurringManager({ vendorId }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RecurringEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    type: 'AR' as const,
    name: '',
    amount: '',
    interval: 'monthly' as const,
    startDate: '',
    description: '',
    vendorOrCustomer: '',
    category: ''
  });

  // React Query hooks
  const { data: entries = [], isLoading, error } = useRecurringEntries(vendorId);
  const createEntry = useCreateRecurringEntry(vendorId);
  const updateEntry = useUpdateRecurringEntry(vendorId);
  const deleteEntry = useDeleteRecurringEntry(vendorId);
  const toggleEntry = useToggleRecurringEntry(vendorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEntry) {
        // Update existing entry
        await updateEntry.mutateAsync({
          id: editingEntry.id,
          name: newEntry.name,
          amount: parseFloat(newEntry.amount),
          interval: newEntry.interval,
          startDate: newEntry.startDate,
          description: newEntry.description,
          vendorOrCustomer: newEntry.vendorOrCustomer,
          category: newEntry.category
        });
      } else {
        // Create new entry
        const createData: CreateRecurringEntryRequest = {
          type: newEntry.type,
          name: newEntry.name,
          amount: parseFloat(newEntry.amount),
          interval: newEntry.interval,
          startDate: newEntry.startDate,
          description: newEntry.description,
          vendorOrCustomer: newEntry.vendorOrCustomer,
          category: newEntry.category
        };
        await createEntry.mutateAsync(createData);
      }
      
      // Reset form and close
      setShowAddForm(false);
      setEditingEntry(null);
      setNewEntry({
        type: 'AR',
        name: '',
        amount: '',
        interval: 'monthly',
        startDate: '',
        description: '',
        vendorOrCustomer: '',
        category: ''
      });
    } catch (error) {
      console.error('Failed to save recurring entry:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleEdit = (entry: RecurringEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      type: entry.type,
      name: entry.name,
      amount: entry.amount.toString(),
      interval: entry.interval,
      startDate: entry.startDate,
      description: entry.description || '',
      vendorOrCustomer: entry.vendorOrCustomer,
      category: entry.category || ''
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEntry(null);
    setNewEntry({
      type: 'AR',
      name: '',
      amount: '',
      interval: 'monthly',
      startDate: '',
      description: '',
      vendorOrCustomer: '',
      category: ''
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleEntry.mutateAsync({ entryId: id, isActive: !currentStatus });
    } catch (error) {
      console.error('Failed to toggle entry status:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring entry?')) {
      try {
        await deleteEntry.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete entry:', error);
        // TODO: Show error toast/notification
      }
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  const getTypeColor = (type: string) => {
    return type === 'AR' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const formatInterval = (interval: string) => {
    return interval.charAt(0).toUpperCase() + interval.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B6E02]"></div>
        <span className="ml-2 text-gray-600">Loading recurring entries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Recurring Entries</div>
        <div className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Recurring Entries Manager</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#5B6E02] hover:bg-[#4A5A01]"
        >
          {showAddForm ? 'Cancel' : 'Add Recurring Entry'}
        </Button>
      </div>

      {/* Add/Edit Entry Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingEntry ? 'Edit Recurring Entry' : 'Add New Recurring Entry'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({...newEntry, type: e.target.value as 'AR' | 'AP'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Entry Type"
                  >
                    <option value="AR">Accounts Receivable</option>
                    <option value="AP">Accounts Payable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name/Description
                  </label>
                  <input
                    type="text"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    placeholder="e.g., Monthly Subscription, Rent Payment"
                    aria-label="Entry Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    placeholder="0.00"
                    aria-label="Amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval
                  </label>
                  <select
                    value={newEntry.interval}
                    onChange={(e) => setNewEntry({...newEntry, interval: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Recurring Interval"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newEntry.startDate}
                    onChange={(e) => setNewEntry({...newEntry, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    aria-label="Start Date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newEntry.type === 'AR' ? 'Customer' : 'Vendor'}
                  </label>
                  <input
                    type="text"
                    value={newEntry.vendorOrCustomer}
                    onChange={(e) => setNewEntry({...newEntry, vendorOrCustomer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    required
                    placeholder={newEntry.type === 'AR' ? 'Customer name' : 'Vendor name'}
                    aria-label="Customer or Vendor Name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    placeholder="e.g., Utilities, Rent, Subscriptions"
                    aria-label="Category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Description
                  </label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                    placeholder="Optional additional details"
                    aria-label="Additional Description"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#5B6E02] hover:bg-[#4A5A01]"
                  disabled={createEntry.isPending || updateEntry.isPending}
                >
                  {createEntry.isPending || updateEntry.isPending ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Create Entry')}
                </Button>
              </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            {entries.length}
          </div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {entries.filter(e => e.type === 'AR').length}
          </div>
          <div className="text-sm text-gray-600">AR Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {entries.filter(e => e.type === 'AP').length}
          </div>
          <div className="text-sm text-gray-600">AP Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {entries.filter(e => e.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Entries</div>
        </div>
      </div>

      {/* Recurring Entries Table */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recurring Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Interval</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Next Due</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-gray-500">{entry.vendorOrCustomer}</div>
                      {entry.category && (
                        <div className="text-xs text-gray-400">{entry.category}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    ${entry.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium">{formatInterval(entry.interval)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {new Date(entry.nextDueDate).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(entry.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.isActive)}`}>
                      {entry.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(entry.id, entry.isActive)}
                        className="text-xs"
                        disabled={toggleEntry.isPending}
                      >
                        {entry.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                        disabled={deleteEntry.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recurring entries found. Create your first one above.
          </div>
        )}
      </div>

      {/* Automation Settings */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-blue-800">Auto-Generate Entries</h4>
              <p className="text-sm text-blue-600">Automatically create new entries when due dates are reached</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
            
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-green-800">Email Notifications</h4>
              <p className="text-sm text-green-600">Send reminders before entries are due</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-purple-800">Calendar Integration</h4>
                <p className="text-sm text-purple-600">Sync recurring entries with your calendar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
      </div>
    </div>
  );
}
