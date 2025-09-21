import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Key, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  Clock,
  Settings
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'admin' | 'security';
  resource: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  twoFactorEnabled: boolean;
  permissions: string[];
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'permission_change' | 'data_access' | 'failed_login' | 'suspicious_activity';
  user: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
}

interface SecurityPermissionsProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  securityEvents: SecurityEvent[];
  onUserCreate: (user: Omit<User, 'id' | 'lastLogin' | 'permissions'>) => void;
  onUserUpdate: (user: User) => void;
  onUserDelete: (id: string) => void;
  onRoleCreate: (role: Omit<Role, 'id' | 'userCount' | 'createdAt'>) => void;
  onRoleUpdate: (role: Role) => void;
  onRoleDelete: (id: string) => void;
  onPermissionUpdate: (userId: string, permissions: string[]) => void;
  onUserSuspend: (id: string, suspended: boolean) => void;
  onTwoFactorToggle: (id: string, enabled: boolean) => void;
}

const SecurityPermissions: React.FC<SecurityPermissionsProps> = ({
  users,
  roles,
  permissions,
  securityEvents,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onRoleCreate,
  onRoleUpdate,
  onRoleDelete,
  onPermissionUpdate,
  onUserSuspend,
  onTwoFactorToggle
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'security'>('users');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active' as const,
    twoFactorEnabled: false
  });
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isSystem: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'suspended': return AlertTriangle;
      default: return XCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return Unlock;
      case 'logout': return Lock;
      case 'permission_change': return Key;
      case 'data_access': return Eye;
      case 'failed_login': return XCircle;
      case 'suspicious_activity': return AlertTriangle;
      default: return Activity;
    }
  };

  const handleCreateUser = () => {
    if (newUser.name.trim() && newUser.email.trim() && newUser.role) {
      onUserCreate(newUser);
      setNewUser({ name: '', email: '', role: '', status: 'active', twoFactorEnabled: false });
      setShowCreateUser(false);
    }
  };

  const handleCreateRole = () => {
    if (newRole.name.trim()) {
      onRoleCreate(newRole);
      setNewRole({ name: '', description: '', permissions: [], isSystem: false });
      setShowCreateRole(false);
    }
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const twoFactorUsers = users.filter(u => u.twoFactorEnabled).length;
  const recentEvents = securityEvents.filter(e => 
    new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security & Permissions</h2>
          <p className="text-gray-600">Manage user access, roles, and security settings</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateUser(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setShowCreateRole(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">2FA Enabled</p>
              <p className="text-2xl font-bold text-gray-900">{twoFactorUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">{suspendedUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Events (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{recentEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'roles', label: 'Roles', icon: Key },
            { id: 'permissions', label: 'Permissions', icon: Shield },
            { id: 'security', label: 'Security Events', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Users</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => {
              const StatusIcon = getStatusIcon(user.status);
              return (
                <div key={user.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {user.status}
                          </span>
                          {user.twoFactorEnabled && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">
                              <Shield className="h-3 w-3 mr-1" />
                              2FA
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Role: {roles.find(r => r.id === user.role)?.name || 'Unknown'} • 
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onTwoFactorToggle(user.id, !user.twoFactorEnabled)}
                        className={`p-2 rounded-lg ${
                          user.twoFactorEnabled 
                            ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                        }`}
                        title={user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onUserSuspend(user.id, user.status !== 'suspended')}
                        className={`p-2 rounded-lg ${
                          user.status === 'suspended'
                            ? 'text-green-600 bg-green-100 hover:bg-green-200'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                        }`}
                        title={user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                      >
                        {user.status === 'suspended' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onUserDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-500">{role.description}</p>
                    <p className="text-sm text-gray-500">
                      {role.userCount} users • {role.permissions.length} permissions
                      {role.isSystem && ' • System Role'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRoleUpdate(role)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Edit Role"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => onRoleDelete(role.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete Role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Events Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Security Events</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {securityEvents.slice(0, 20).map((event) => {
              const EventIcon = getEventIcon(event.type);
              return (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <EventIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{event.description}</h4>
                        <p className="text-xs text-gray-500">
                          {event.user} • {event.ipAddress} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateUser(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRole(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPermissions;












