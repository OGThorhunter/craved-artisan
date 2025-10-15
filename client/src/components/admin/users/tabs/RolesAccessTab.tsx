import React from 'react';
import { Shield, Plus, Trash2, UserCheck, Key, Users } from 'lucide-react';
import Card from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface RolesAccessTabProps {
  user: any;
  roles: string[];
}

export default function RolesAccessTab({ user, roles }: RolesAccessTabProps) {
  return (
    <div className="space-y-6">
      {/* Current Roles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2b2b2b]">Current Roles</h2>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#7F232E] text-white rounded-lg hover:bg-[#6b1e27] text-sm">
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#7F232E]" />
                  <span className="font-medium text-gray-900">{role.replace('_', ' ')}</span>
                </div>
                <button className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">Permissions:</div>
                <div className="space-y-1">
                  {getRolePermissions(role).map((perm) => (
                    <div key={perm} className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {roles.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No roles assigned</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Role Crossover Suggestions */}
      {roles.includes('CUSTOMER') && !roles.includes('VENDOR') && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Upgrade to Vendor?</h3>
              <p className="text-sm text-blue-700 mb-3">
                This customer has {user._count?.orders || 0} orders. They might be interested in becoming a vendor.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Convert to Vendor
              </button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Impersonate */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Impersonation</h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Impersonate User</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Log in as this user to troubleshoot issues. All actions will be audited.
              </p>
            </div>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
          <UserCheck className="w-4 h-4" />
          Impersonate User
        </button>
      </Card>
      
      {/* API Tokens */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2b2b2b]">API Tokens</h2>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Plus className="w-4 h-4" />
            Generate Token
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No API tokens generated</p>
        </div>
      </Card>
    </div>
  );
}

function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'VENDOR':
      return ['Manage products', 'View orders', 'Manage fulfillment', 'View analytics'];
    case 'CUSTOMER':
      return ['Place orders', 'View order history', 'Manage favorites'];
    case 'EVENT_COORDINATOR':
      return ['Create events', 'Manage vendors', 'View analytics', 'Handle payouts'];
    case 'SUPER_ADMIN':
      return ['Full system access', 'Manage users', 'View all data', 'Impersonate users'];
    case 'B2B_VENDOR':
      return ['Manage inventory', 'Wholesale orders', 'B2B analytics'];
    default:
      return [];
  }
}

