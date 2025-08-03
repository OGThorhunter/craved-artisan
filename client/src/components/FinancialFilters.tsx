import React from 'react';
import { Calendar, Filter, Download, FileText } from 'lucide-react';

interface FinancialFiltersProps {
  selectedYear: number;
  selectedQuarter: string | null;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: string | null) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  className?: string;
}

export const FinancialFilters: React.FC<FinancialFiltersProps> = ({
  selectedYear,
  selectedQuarter,
  onYearChange,
  onQuarterChange,
  onExportCSV,
  onExportPDF,
  className = ''
}) => {
  // Generate last 5 years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const quarters = [
    { value: 'Q1', label: 'Q1 (Jan-Mar)' },
    { value: 'Q2', label: 'Q2 (Apr-Jun)' },
    { value: 'Q3', label: 'Q3 (Jul-Sep)' },
    { value: 'Q4', label: 'Q4 (Oct-Dec)' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
              Year:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Quarter Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label htmlFor="quarter-select" className="text-sm font-medium text-gray-700">
              Quarter:
            </label>
            <select
              id="quarter-select"
              value={selectedQuarter || ''}
              onChange={(e) => onQuarterChange(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Quarters</option>
              {quarters.map(quarter => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Active Filters:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
            {selectedYear}
          </span>
          {selectedQuarter && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
              {selectedQuarter}
            </span>
          )}
          {!selectedQuarter && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
              All Quarters
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 