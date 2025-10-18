import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeftIcon, CogIcon, UserIcon } from '@heroicons/react/24/outline';

interface SettingsLayoutProps {
  account?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    primaryEmail?: string;
    memberCount: number;
  };
  userProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  currentUserRole?: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    component: React.ComponentType;
  }>;
  children: React.ReactNode;
}

export function SettingsLayout({
  account,
  userProfile,
  currentUserRole,
  activeTab,
  onTabChange,
  tabs,
  children,
}: SettingsLayoutProps) {
  const [, setLocation] = useLocation();

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <CogIcon className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </div>
            
            {/* Account Info */}
            <div className="flex items-center space-x-4">
              {account?.logoUrl && (
                <img
                  src={account.logoUrl}
                  alt={account.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{account?.name}</div>
                <div className="text-xs text-gray-500">{currentUserRole} • {account?.memberCount} members</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
























