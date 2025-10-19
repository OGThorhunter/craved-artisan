import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

import { Edit2, Save, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface FinancialSnapshot {
  id: string;
  date: string;
  revenue: number;
  cogs: number;
  opex: number;
  netProfit: number;
  assets: number;
  liabilities: number;
  equity: number;
  cashIn: number;
  cashOut: number;
  notes?: string;
}

interface EditableFinancialTableProps {
  data: FinancialSnapshot[];
  vendorId: string;
  className?: string;
}

const columnHelper = createColumnHelper<FinancialSnapshot>();

export const EditableFinancialTable: React.FC<EditableFinancialTableProps> = ({
  data,
  vendorId,
  className = ''
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FinancialSnapshot>>({});
  const queryClient = useQueryClient();

  const updateFinancialMutation = useMutation({
    mutationFn: async ({ snapshotId, updateData }: { snapshotId: string; updateData: Partial<FinancialSnapshot> }) => {
      const response = await axios.patch(
        `/api/vendors/${vendorId}/financials/${snapshotId}`,
        updateData,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-financials'] });
      toast.success('Financial data updated successfully');
      setEditingId(null);
      setEditData({});
    },
    onError: (error) => {
      console.error('Error updating financial data:', error);
      toast.error('Failed to update financial data');
    },
  });

  const handleEdit = (snapshot: FinancialSnapshot) => {
    setEditingId(snapshot.id);
    setEditData(snapshot);
  };

  const handleSave = (snapshotId: string) => {
    updateFinancialMutation.mutate({ snapshotId, updateData: editData });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleInputChange = (field: keyof FinancialSnapshot, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'notes' ? parseFloat(value) || 0 : value
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = useMemo(() => [
    columnHelper.accessor('date', {
      header: 'Date',
      cell: ({ getValue, row }) => {
        const date = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="date"
              value={editData.date || date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
              aria-label="Edit date"
              title="Edit date"
            />
          );
        }
        return formatDate(date);
      },
    }),
    columnHelper.accessor('revenue', {
      header: 'Revenue',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="number"
              step="0.01"
              value={editData.revenue ?? value}
              onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || 0)}
              className="px-2 py-1 border rounded text-sm w-24"
              aria-label="Edit revenue"
              title="Edit revenue"
              placeholder="0.00"
            />
          );
        }
        return (
          <span className="text-green-600 font-medium">
            {formatCurrency(value)}
          </span>
        );
      },
    }),
    columnHelper.accessor('cogs', {
      header: 'COGS',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="number"
              step="0.01"
              value={editData.cogs ?? value}
              onChange={(e) => handleInputChange('cogs', parseFloat(e.target.value) || 0)}
              className="px-2 py-1 border rounded text-sm w-24"
              aria-label="Edit COGS"
              title="Edit COGS"
              placeholder="0.00"
            />
          );
        }
        return (
          <span className="text-red-600 font-medium">
            -{formatCurrency(value)}
          </span>
        );
      },
    }),
    columnHelper.accessor('opex', {
      header: 'OPEX',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="number"
              step="0.01"
              value={editData.opex ?? value}
              onChange={(e) => handleInputChange('opex', parseFloat(e.target.value) || 0)}
              className="px-2 py-1 border rounded text-sm w-24"
              aria-label="Edit OPEX"
              title="Edit OPEX"
              placeholder="0.00"
            />
          );
        }
        return (
          <span className="text-red-600 font-medium">
            -{formatCurrency(value)}
          </span>
        );
      },
    }),
    columnHelper.accessor('netProfit', {
      header: 'Net Profit',
      cell: ({ getValue, row }) => {
        const value = getValue();
        const isEditing = editingId === row.original.id;
        const calculatedProfit = isEditing 
          ? (editData.revenue ?? row.original.revenue) - (editData.cogs ?? row.original.cogs) - (editData.opex ?? row.original.opex)
          : value;
        
        if (isEditing) {
          return (
            <span className="text-blue-600 font-medium">
              {formatCurrency(calculatedProfit)}
            </span>
          );
        }
        
        const isPositive = calculatedProfit >= 0;
        return (
          <span className={`font-medium flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatCurrency(calculatedProfit)}
          </span>
        );
      },
    }),
    columnHelper.accessor('cashIn', {
      header: 'Cash In',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="number"
              step="0.01"
              value={editData.cashIn ?? value}
              onChange={(e) => handleInputChange('cashIn', parseFloat(e.target.value) || 0)}
              className="px-2 py-1 border rounded text-sm w-24"
              aria-label="Edit cash in"
              title="Edit cash in"
              placeholder="0.00"
            />
          );
        }
        return (
          <span className="text-green-600 font-medium">
            {formatCurrency(value)}
          </span>
        );
      },
    }),
    columnHelper.accessor('cashOut', {
      header: 'Cash Out',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="number"
              step="0.01"
              value={editData.cashOut ?? value}
              onChange={(e) => handleInputChange('cashOut', parseFloat(e.target.value) || 0)}
              className="px-2 py-1 border rounded text-sm w-24"
              aria-label="Edit cash out"
              title="Edit cash out"
              placeholder="0.00"
            />
          );
        }
        return (
          <span className="text-red-600 font-medium">
            -{formatCurrency(value)}
          </span>
        );
      },
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (editingId === row.original.id) {
          return (
            <input
              type="text"
              value={(editData.notes ?? value) || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="px-2 py-1 border rounded text-sm w-32"
              placeholder="Add notes..."
            />
          );
        }
        return (
          <span className="text-gray-600 text-sm truncate max-w-32" title={value}>
            {value || '-'}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        
        if (isEditing) {
          return (
            <div className="flex gap-1">
              <button
                onClick={() => handleSave(row.original.id)}
                disabled={updateFinancialMutation.isPending}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }
        
        return (
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        );
      },
    }),
  ], [editingId, editData, updateFinancialMutation.isPending]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Editable Financial Snapshots
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Click the edit icon to modify financial data inline. Changes are automatically calculated.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${editingId === row.original.id ? 'bg-blue-50' : ''}`}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          No financial snapshots found. Generate some data to get started.
        </div>
      )}
    </div>
  );
}; 