import React from 'react';

type SubView = 'overview' | 'fees' | 'ledger' | 'promos' | 'payouts' | 'pl' | 'staff' | 'costs';

interface SubNavigationProps {
  activeView: SubView;
  onViewChange: (view: SubView) => void;
}

export const SubNavigation: React.FC<SubNavigationProps> = ({
  activeView,
  onViewChange,
}) => {
  const tabs: Array<{ id: SubView; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fee Manager' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'promos', label: 'Promos' },
    { id: 'payouts', label: 'Payouts' },
    { id: 'pl', label: 'P&L Dashboard' },
    { id: 'staff', label: 'Staff' },
    { id: 'costs', label: 'Cost Overrides' },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === tab.id
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

