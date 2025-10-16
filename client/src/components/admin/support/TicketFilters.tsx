import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TicketFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSearchChange: (search: string) => void;
}

export interface FilterState {
  status: string[];
  severity: string[];
  category: string;
  assignedTo: string;
}

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'AWAITING_VENDOR', label: 'Awaiting Vendor' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ESCALATED', label: 'Escalated' },
];

const severityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'ORDER', label: 'Order' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'EVENT', label: 'Event' },
  { value: 'TECH', label: 'Technical' },
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'OTHER', label: 'Other' },
];

export function TicketFilters({ onFilterChange, onSearchChange }: TicketFiltersProps) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    severity: [],
    category: '',
    assignedTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };
  
  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleSeverityToggle = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    
    const newFilters = { ...filters, severity: newSeverity };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, category: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    const newFilters: FilterState = {
      status: [],
      severity: [],
      category: '',
      assignedTo: '',
    };
    setFilters(newFilters);
    setSearch('');
    onFilterChange(newFilters);
    onSearchChange('');
  };
  
  const activeFilterCount = 
    filters.status.length + 
    filters.severity.length + 
    (filters.category ? 1 : 0) + 
    (filters.assignedTo ? 1 : 0);
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tickets by subject or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/20 focus:border-[#7F232E]"
            />
          </div>
        </div>
        
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-[#7F232E] bg-[#7F232E] text-white'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white text-[#7F232E] rounded text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        
        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
      
      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => handleStatusToggle(option.value)}
                      className="rounded border-gray-300 text-[#7F232E] focus:ring-[#7F232E]"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <div className="space-y-2">
                {severityOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.severity.includes(option.value)}
                      onChange={() => handleSeverityToggle(option.value)}
                      className="rounded border-gray-300 text-[#7F232E] focus:ring-[#7F232E]"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={handleCategoryChange}
                aria-label="Filter by category"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/20 focus:border-[#7F232E]"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

