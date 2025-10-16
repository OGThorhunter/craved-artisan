import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Badge';

export interface IncidentFiltersState {
  status: string[];
  severity: string[];
  ownerId?: string;
  services: string[];
  tags: string[];
  startDate?: string;
  endDate?: string;
  hasPostmortem?: boolean;
}

interface IncidentFiltersProps {
  filters: IncidentFiltersState;
  onChange: (filters: IncidentFiltersState) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = ['OPEN', 'MITIGATED', 'CLOSED'];
const SEVERITY_OPTIONS = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
const SERVICE_OPTIONS = ['api', 'worker', 'web', 'database', 'redis', 'email', 'stripe', 'webhooks'];
const POSTMORTEM_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'With Post-mortem', value: true },
  { label: 'Without Post-mortem', value: false }
];

export default function IncidentFilters({ filters, onChange, onClear }: IncidentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const toggleArrayFilter = (key: 'status' | 'severity' | 'services', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const addTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      onChange({ ...filters, tags: [...filters.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange({ ...filters, tags: filters.tags.filter(t => t !== tag) });
  };

  const activeFilterCount = 
    filters.status.length +
    filters.severity.length +
    filters.services.length +
    filters.tags.length +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.hasPostmortem !== undefined ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-[#7F232E]/20 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#7F232E]" />
          <h3 className="font-semibold text-[#2b2b2b]">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={onClear}
              className="text-xs text-[#4b4b4b] hover:text-[#2b2b2b]"
            >
              Clear all
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-3 border-t border-[#7F232E]/10">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status}
                  onClick={() => toggleArrayFilter('status', status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-[#7F232E] text-white'
                      : 'bg-gray-100 text-[#4b4b4b] hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">Severity</label>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_OPTIONS.map(severity => (
                <button
                  key={severity}
                  onClick={() => toggleArrayFilter('severity', severity)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.severity.includes(severity)
                      ? 'bg-[#7F232E] text-white'
                      : 'bg-gray-100 text-[#4b4b4b] hover:bg-gray-200'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">Services</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map(service => (
                <button
                  key={service}
                  onClick={() => toggleArrayFilter('services', service)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.services.includes(service)
                      ? 'bg-[#7F232E] text-white'
                      : 'bg-gray-100 text-[#4b4b4b] hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="flex-1 px-3 py-1.5 border border-[#7F232E]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
              <Button variant="secondary" onClick={addTag} className="text-sm">
                Add
              </Button>
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-600" aria-label="Remove tag">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="incident-start-date" className="block text-sm font-medium text-[#2b2b2b] mb-2">Start Date</label>
              <input
                id="incident-start-date"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
                className="w-full px-3 py-1.5 border border-[#7F232E]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
            <div>
              <label htmlFor="incident-end-date" className="block text-sm font-medium text-[#2b2b2b] mb-2">End Date</label>
              <input
                id="incident-end-date"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
                className="w-full px-3 py-1.5 border border-[#7F232E]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
          </div>

          {/* Post-mortem */}
          <div>
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">Post-mortem</label>
            <div className="flex flex-wrap gap-2">
              {POSTMORTEM_OPTIONS.map(option => (
                <button
                  key={option.label}
                  onClick={() => onChange({ ...filters, hasPostmortem: option.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.hasPostmortem === option.value
                      ? 'bg-[#7F232E] text-white'
                      : 'bg-gray-100 text-[#4b4b4b] hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

