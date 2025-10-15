import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, User, Shield, FileCheck, DollarSign, MessageSquare,
  Activity, HeadphonesIcon, Files, Settings, AlertCircle
} from 'lucide-react';
import OverviewTab from '../../components/admin/users/tabs/OverviewTab';
import RolesAccessTab from '../../components/admin/users/tabs/RolesAccessTab';
import OnboardingComplianceTab from '../../components/admin/users/tabs/OnboardingComplianceTab';
import CommerceTab from '../../components/admin/users/tabs/CommerceTab';
import MessagingCRMTab from '../../components/admin/users/tabs/MessagingCRMTab';
import ActivitySecurityTab from '../../components/admin/users/tabs/ActivitySecurityTab';
import SupportTab from '../../components/admin/users/tabs/SupportTab';
import FilesTab from '../../components/admin/users/tabs/FilesTab';
import { Badge } from '../../components/ui/Badge';

type TabType = 'overview' | 'roles' | 'compliance' | 'commerce' | 'messaging' | 'security' | 'support' | 'files';

export default function UserDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F232E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }
  
  if (!data?.data?.user) {
    return (
      <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => setLocation('/control/users')}
            className="px-4 py-2 bg-[#7F232E] text-white rounded-lg hover:bg-[#6b1e27]"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  
  const user = data.data.user;
  const roles = data.data.roles || [];
  const analytics = data.data.analytics || {};
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'roles', label: 'Roles & Access', icon: Shield },
    { id: 'compliance', label: 'Onboarding & Compliance', icon: FileCheck },
    { id: 'commerce', label: 'Commerce', icon: DollarSign },
    { id: 'messaging', label: 'Messaging & CRM', icon: MessageSquare },
    { id: 'security', label: 'Activity & Security', icon: Activity },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
    { id: 'files', label: 'Files', icon: Files }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'destructive';
      case 'PENDING': return 'warning';
      default: return 'secondary';
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F7F2EC]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => setLocation('/control/users')}
                className="p-2 hover:bg-gray-100 rounded-lg mt-1"
                aria-label="Back to users list"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-[#2b2b2b]">
                  {user.name || user.email}
                </h1>
                <p className="text-sm text-[#4b4b4b]">{user.email}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getStatusColor(user.status) as any}>
                    {user.status}
                  </Badge>
                  
                  {roles.map((role: string) => (
                    <Badge key={role} variant="secondary">
                      {role.replace('_', ' ')}
                    </Badge>
                  ))}
                  
                  {user.betaTester && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Beta Tester
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => console.log('Edit user')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Edit user settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => console.log('More actions')}
                className="px-4 py-2 bg-[#7F232E] text-white rounded-lg hover:bg-[#6b1e27]"
                aria-label="More actions"
              >
                Actions
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-[#7F232E]/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#7F232E] text-[#7F232E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && <OverviewTab user={user} analytics={analytics} />}
        {activeTab === 'roles' && <RolesAccessTab user={user} roles={roles} />}
        {activeTab === 'compliance' && <OnboardingComplianceTab user={user} />}
        {activeTab === 'commerce' && <CommerceTab userId={user.id} roles={roles} />}
        {activeTab === 'messaging' && <MessagingCRMTab userId={user.id} />}
        {activeTab === 'security' && <ActivitySecurityTab userId={user.id} />}
        {activeTab === 'support' && <SupportTab userId={user.id} />}
        {activeTab === 'files' && <FilesTab userId={user.id} />}
      </div>
    </div>
  );
}

