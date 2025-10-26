import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Eye, MoreVertical, UserCheck, UserX, Shield, AlertTriangle,
  LogOut, Key, FileText, GitMerge, Download
} from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
  riskScore: number;
  riskFlags: string[];
  onboardingProgress: number;
  lastActiveAt: string | null;
  orderCount: number;
  stripeStatus: string;
  vacationMode: boolean;
  created_at: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

interface UserListTableProps {
  filters: any;
  searchQuery: string;
  onUserSelect: (userId: string) => void;
  onAction: (userId: string, action: string) => void;
}

export default function UserListTable({ filters, searchQuery, onUserSelect, onAction }: UserListTableProps) {
  const [page, setPage] = React.useState(1);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', 'list', page, filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(searchQuery && { query: searchQuery }),
        ...filters
      });
      
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(data?.data?.users?.map((u: UserListItem) => u.id) || []);
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'VENDOR': return 'bg-green-100 text-green-800';
      case 'CUSTOMER': return 'bg-blue-100 text-blue-800';
      case 'EVENT_COORDINATOR': return 'bg-purple-100 text-purple-800';
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
      case 'B2B_VENDOR': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'destructive';
      case 'PENDING': return 'warning';
      case 'SOFT_DELETED': return 'secondary';
      default: return 'secondary';
    }
  };
  
  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600';
    if (score <= 50) return 'text-yellow-600';
    if (score <= 75) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getStripeStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'INCOMPLETE': return 'warning';
      case 'NOT_CREATED': return 'secondary';
      default: return 'secondary';
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || { page: 1, pageCount: 1, total: 0 };
  
  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction(selectedUsers[0], 'bulk-suspend')}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Suspend
              </button>
              <button
                onClick={() => onAction(selectedUsers[0], 'bulk-activate')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => onAction(selectedUsers[0], 'bulk-export')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                    aria-label="Select all users"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Roles</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Risk</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Onboarding</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Active</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Orders</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stripe</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user: UserListItem) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-gray-300"
                      aria-label={`Select user ${user.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {user.emailVerified && (
                            <UserCheck className="w-3 h-3 text-green-600" />
                          )}
                          {user.mfaEnabled && (
                            <Shield className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                        >
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getRiskColor(user.riskScore)}`}>
                        {user.riskScore}
                      </span>
                      {user.riskFlags.length > 0 && (
                        <div className="flex gap-1">
                          {user.riskFlags.slice(0, 2).map((flag) => (
                            <AlertTriangle key={flag} className="w-4 h-4 text-orange-500" />
                          ))}
                          {user.riskFlags.length > 2 && (
                            <span className="text-xs text-gray-500">+{user.riskFlags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2" title={`Onboarding ${user.onboardingProgress}% complete`}>
                        <div
                          className={`h-2 rounded-full ${
                            user.onboardingProgress === 100 ? 'bg-green-500' :
                            user.onboardingProgress >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${user.onboardingProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{user.onboardingProgress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.lastActiveAt ? (
                      <span title={new Date(user.lastActiveAt).toLocaleString()}>
                        {formatRelativeTime(user.lastActiveAt)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {user.orderCount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStripeStatusColor(user.stripeStatus) as any}>
                      {user.stripeStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Badge variant={getStatusColor(user.status) as any}>
                        {user.status}
                      </Badge>
                      {user.vacationMode && (
                        <span className="text-xs text-orange-600">🌴 Vacation</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onUserSelect(user.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View details"
                        aria-label={`View details for ${user.name}`}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-100 rounded" aria-label="More actions">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => onAction(user.id, 'impersonate')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            Impersonate
                          </button>
                          <button
                            onClick={() => onAction(user.id, user.status === 'SUSPENDED' ? 'reinstate' : 'suspend')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <UserX className="w-4 h-4" />
                            {user.status === 'SUSPENDED' ? 'Reinstate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => onAction(user.id, 'reset-mfa')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Key className="w-4 h-4" />
                            Reset MFA
                          </button>
                          <button
                            onClick={() => onAction(user.id, 'force-logout')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Force Logout
                          </button>
                          <button
                            onClick={() => onAction(user.id, 'view-audit')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Audit Log
                          </button>
                          <button
                            onClick={() => onAction(user.id, 'find-duplicates')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <GitMerge className="w-4 h-4" />
                            Find Duplicates
                          </button>
                          <button
                            onClick={() => onAction(user.id, 'export')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t"
                          >
                            <Download className="w-4 h-4" />
                            Export Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No users found</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, pagination.total)} of {pagination.total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {pagination.pageCount}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pageCount, p + 1))}
              disabled={page === pagination.pageCount}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Selected users info */}
      {selectedUsers.length > 0 && (
        <div className="text-sm text-gray-500">
          Selected: {selectedUsers.join(', ')}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

