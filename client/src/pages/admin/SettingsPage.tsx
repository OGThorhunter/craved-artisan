import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Settings,
  Globe,
  Shield,
  DollarSign,
  Bell,
  Cpu,
  Plug,
  FileText,
  Wrench,
  Save,
  RotateCcw,
  FileSearch,
  ArrowLeft
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { PlatformIdentitySettings } from '../../components/admin/settings/PlatformIdentitySettings';
import { IntegrationsSettings } from '../../components/admin/settings/IntegrationsSettings';
import { AuthSecuritySettings } from '../../components/admin/settings/AuthSecuritySettings';
import { PaymentsFeesSettings } from '../../components/admin/settings/PaymentsFeesSettings';
import { AIFeatureFlagsSettings } from '../../components/admin/settings/AIFeatureFlagsSettings';
import { MaintenanceSettings } from '../../components/admin/settings/MaintenanceSettings';
import { NotificationsSettings } from '../../components/admin/settings/NotificationsSettings';
import { ComplianceSettings } from '../../components/admin/settings/ComplianceSettings';
import SEOHead from '../../components/SEOHead';

type SettingsTab =
  | 'identity'
  | 'security'
  | 'payments'
  | 'notifications'
  | 'ai-features'
  | 'integrations'
  | 'compliance'
  | 'maintenance';

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const result = await response.json();
      return result.data;
    }
  });

  // Warn before leaving with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const tabs = [
    {
      id: 'identity' as SettingsTab,
      label: 'Platform & Identity',
      icon: Globe
    },
    {
      id: 'security' as SettingsTab,
      label: 'Authentication & Security',
      icon: Shield
    },
    {
      id: 'payments' as SettingsTab,
      label: 'Payments & Fees',
      icon: DollarSign
    },
    {
      id: 'notifications' as SettingsTab,
      label: 'Notifications',
      icon: Bell
    },
    {
      id: 'ai-features' as SettingsTab,
      label: 'AI & Feature Flags',
      icon: Cpu
    },
    {
      id: 'integrations' as SettingsTab,
      label: 'Integrations',
      icon: Plug
    },
    {
      id: 'compliance' as SettingsTab,
      label: 'Compliance & Legal',
      icon: FileText
    },
    {
      id: 'maintenance' as SettingsTab,
      label: 'Maintenance',
      icon: Wrench
    }
  ];

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F232E] mx-auto mb-4"></div>
            <p className="text-[#4b4b4b]">Loading settings...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'identity':
        return <PlatformIdentitySettings settings={settings} />;
      case 'security':
        return <AuthSecuritySettings settings={settings} />;
      case 'payments':
        return <PaymentsFeesSettings settings={settings} />;
      case 'notifications':
        return <NotificationsSettings settings={settings} />;
      case 'ai-features':
        return <AIFeatureFlagsSettings settings={settings} />;
      case 'integrations':
        return <IntegrationsSettings />;
      case 'compliance':
        return <ComplianceSettings settings={settings} />;
      case 'maintenance':
        return <MaintenanceSettings settings={settings} />;
      default:
        return null;
    }
  };

  return (
    <>
      <SEOHead
        title="Settings - Admin Dashboard - Craved Artisan"
        description="Configure platform settings, integrations, and policies"
        url="/control/settings"
        type="website"
      />

      <div className="min-h-screen bg-[#F7F2EC]">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setLocation('/dashboard/admin')}
                  className="flex items-center gap-2"
                  aria-label="Back to Admin Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-[#2b2b2b]">Settings</h1>
                  <p className="text-sm text-[#4b4b4b]">
                    Configure platform identity, security, and integrations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-sm text-yellow-600 font-medium">
                    Unsaved changes
                  </span>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    // TODO: Implement reset logic
                    setHasUnsavedChanges(false);
                  }}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    // TODO: Navigate to audit logs
                    window.location.href = '/control/audit?scope=CONFIG';
                  }}
                  className="flex items-center gap-2"
                >
                  <FileSearch className="h-4 w-4" />
                  Audit History
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Implement save logic
                    setHasUnsavedChanges(false);
                  }}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left sidebar - tabs */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1 sticky top-24">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#7F232E] text-white'
                          : 'text-[#4b4b4b] hover:bg-white/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

