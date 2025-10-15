import React, { useState } from 'react';
import { Users, Plus, Download, Mail, Settings } from 'lucide-react';
import UserListTable from '../../components/admin/users/UserListTable';
import UserFilters from '../../components/admin/users/UserFilters';
import { useLocation } from 'wouter';

export default function UsersListPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<{ userId: string; action: string } | null>(null);
  
  const handleUserSelect = (userId: string) => {
    setLocation(`/control/users/${userId}`);
  };
  
  const handleAction = (userId: string, action: string) => {
    setSelectedAction({ userId, action });
    
    // Handle different actions
    switch (action) {
      case 'impersonate':
        // Open impersonate modal
        console.log('Impersonate user:', userId);
        break;
      case 'suspend':
      case 'reinstate':
        // Open suspend/reinstate modal
        console.log(`${action} user:`, userId);
        break;
      case 'reset-mfa':
        // Open reset MFA confirmation
        console.log('Reset MFA for user:', userId);
        break;
      case 'force-logout':
        // Open force logout confirmation
        console.log('Force logout user:', userId);
        break;
      case 'view-audit':
        // Navigate to audit log
        setLocation(`/control/users/${userId}?tab=security`);
        break;
      case 'find-duplicates':
        // Open duplicate detection
        console.log('Find duplicates for user:', userId);
        break;
      case 'export':
        // Open export modal
        console.log('Export data for user:', userId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F7F2EC]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#7F232E] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2b2b2b]">User Management</h1>
                <p className="text-sm text-[#4b4b4b]">
                  Manage all vendors, customers, coordinators, and admins
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => console.log('Create user')}
                className="flex items-center gap-2 px-4 py-2 bg-[#7F232E] text-white rounded-lg hover:bg-[#6b1e27]"
              >
                <Plus className="w-4 h-4" />
                Create User
              </button>
              <button
                onClick={() => console.log('Export all')}
                className="flex items-center gap-2 px-4 py-2 border border-[#7F232E]/30 text-[#7F232E] rounded-lg hover:bg-white"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setLocation('/admin')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Vendors</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Coordinators</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-orange-600">23</div>
            <div className="text-sm text-gray-600">At Risk</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-red-600">5</div>
            <div className="text-sm text-gray-600">Suspended</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <UserFilters
            filters={filters}
            onFilterChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
        
        {/* User Table */}
        <UserListTable
          filters={filters}
          searchQuery={searchQuery}
          onUserSelect={handleUserSelect}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

