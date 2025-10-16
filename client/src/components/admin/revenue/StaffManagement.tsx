import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit, X, Check, UserX } from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string;
  role: string;
  salaryCents: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const StaffManagement: React.FC = () => {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    role: '',
    salaryCents: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  // Fetch staff
  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin', 'staff', showActiveOnly],
    queryFn: async () => {
      const response = await fetch(`/api/admin/pl/staff?activeOnly=${showActiveOnly}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch staff');
      const result = await response.json();
      return result.data as StaffMember[];
    },
  });

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/admin/pl/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          salaryCents: parseInt(data.salaryCents),
          endDate: data.endDate || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create staff member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pl'] });
      toast.success('Staff member created successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create staff member');
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`/api/admin/pl/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          salaryCents: data.salaryCents ? parseInt(data.salaryCents) : undefined,
          endDate: data.endDate || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update staff member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pl'] });
      toast.success('Staff member updated successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update staff member');
    },
  });

  // Deactivate staff mutation
  const deactivateMutation = useMutation({
    mutationFn: async ({ id, endDate }: { id: string; endDate: string }) => {
      const response = await fetch(`/api/admin/pl/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ endDate }),
      });
      if (!response.ok) throw new Error('Failed to deactivate staff member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pl'] });
      toast.success('Staff member deactivated successfully');
    },
    onError: () => {
      toast.error('Failed to deactivate staff member');
    },
  });

  const resetForm = () => {
    setFormData({
      role: '',
      salaryCents: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setFormData({
      role: member.role,
      salaryCents: (member.salaryCents / 100).toString(),
      startDate: member.startDate.split('T')[0],
      endDate: member.endDate ? member.endDate.split('T')[0] : '',
      notes: member.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.salaryCents || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const submitData = {
      ...formData,
      salaryCents: (parseFloat(formData.salaryCents) * 100).toString(),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDeactivate = (member: StaffMember) => {
    const endDate = prompt('Enter end date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (endDate) {
      deactivateMutation.mutate({ id: member.id, endDate });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalMonthlyCost = staff
    ? staff
        .filter(s => s.isActive)
        .reduce((sum, s) => sum + Math.floor(s.salaryCents / 12), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage team members and salary costs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowActiveOnly(true)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                showActiveOnly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Show active staff only"
            >
              Active Only
            </button>
            <button
              onClick={() => setShowActiveOnly(false)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                !showActiveOnly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Show all staff"
            >
              All Staff
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Monthly Cost Summary */}
      {staff && staff.some(s => s.isActive) && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Active Staff</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {staff.filter(s => s.isActive).length} members
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-800">Monthly Cost</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(totalMonthlyCost)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {formatCurrency(totalMonthlyCost * 12)}/year
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role / Position *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Salary ($) *
                </label>
                <input
                  type="number"
                  value={formData.salaryCents}
                  onChange={(e) => setFormData({ ...formData, salaryCents: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="75000"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Additional information about this position..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'} Staff Member
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Staff Table */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {!isLoading && staff && staff.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Staff Members</h3>
          <p className="text-gray-600 mb-4">
            {showActiveOnly ? 'No active staff members found.' : 'No staff members found.'}
          </p>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Your First Staff Member
          </Button>
        </Card>
      )}

      {!isLoading && staff && staff.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.role}
                        </div>
                        {member.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {member.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(member.salaryCents)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(Math.floor(member.salaryCents / 12))}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(member.startDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.endDate ? formatDate(member.endDate) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={member.isActive ? 'success' : 'secondary'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      {member.isActive && (
                        <button
                          onClick={() => handleDeactivate(member)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          disabled={deactivateMutation.isPending}
                        >
                          <UserX className="w-4 h-4" />
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StaffManagement;

