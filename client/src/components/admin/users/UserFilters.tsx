import React, { useState } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

interface UserFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function UserFilters({ filters, onFilterChange, searchQuery, onSearchChange }: UserFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  const clearFilters = () => {
    onFilterChange({});
    onSearchChange('');
  };
  
  const activeFilterCount = Object.keys(filters).filter(k => filters[k]).length;
  
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
        
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
      
      {/* Quick Segments */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter('riskScoreMin', filters.riskScoreMin === '60' ? '' : '60')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filters.riskScoreMin === '60'
              ? 'bg-orange-100 border-orange-300 text-orange-800'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          At Risk
        </button>
        <button
          onClick={() => updateFilter('onboardingStage', filters.onboardingStage === 'NEEDS_ATTENTION' ? '' : 'NEEDS_ATTENTION')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filters.onboardingStage === 'NEEDS_ATTENTION'
              ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending KYC
        </button>
        <button
          onClick={() => updateFilter('stripeStatus', filters.stripeStatus === 'INCOMPLETE' ? '' : 'INCOMPLETE')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filters.stripeStatus === 'INCOMPLETE'
              ? 'bg-purple-100 border-purple-300 text-purple-800'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Stripe Incomplete
        </button>
        <button
          onClick={() => updateFilter('vacationMode', filters.vacationMode === 'true' ? '' : 'true')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filters.vacationMode === 'true'
              ? 'bg-green-100 border-green-300 text-green-800'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          🌴 Vacation On
        </button>
        <button
          onClick={() => updateFilter('betaTester', filters.betaTester === 'true' ? '' : 'true')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filters.betaTester === 'true'
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Beta Testers
        </button>
      </div>
      
      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role || ''}
                onChange={(e) => updateFilter('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="VENDOR">Vendor</option>
                <option value="B2B_VENDOR">B2B Vendor</option>
                <option value="EVENT_COORDINATOR">Event Coordinator</option>
                <option value="DROPOFF_MANAGER">Drop-off Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="SOFT_DELETED">Deleted</option>
              </select>
            </div>
            
            {/* Onboarding Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding</label>
              <select
                value={filters.onboardingStage || ''}
                onChange={(e) => updateFilter('onboardingStage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="NEEDS_ATTENTION">Needs Attention</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>
            
            {/* Email Verified */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
              <select
                value={filters.emailVerified || ''}
                onChange={(e) => updateFilter('emailVerified', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            
            {/* MFA Enabled */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MFA Enabled</label>
              <select
                value={filters.mfaEnabled || ''}
                onChange={(e) => updateFilter('mfaEnabled', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            
            {/* Risk Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Score</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.riskScoreMin || ''}
                  onChange={(e) => updateFilter('riskScoreMin', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.riskScoreMax || ''}
                  onChange={(e) => updateFilter('riskScoreMax', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Created Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created From</label>
              <input
                type="date"
                value={filters.createdFrom || ''}
                onChange={(e) => updateFilter('createdFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created To</label>
              <input
                type="date"
                value={filters.createdTo || ''}
                onChange={(e) => updateFilter('createdTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={filters.zip || ''}
                onChange={(e) => updateFilter('zip', e.target.value)}
                placeholder="Enter ZIP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <div
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                <span className="font-medium">{formatFilterKey(key)}:</span>
                <span>{formatFilterValue(value)}</span>
                <button
                  onClick={() => updateFilter(key, '')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatFilterKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatFilterValue(value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';
  return String(value);
}

