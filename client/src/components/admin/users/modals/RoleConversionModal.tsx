import React, { useState } from 'react';
import { X, Users, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../../../ui/Badge';
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/constants/roles';

interface RoleConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  };
  currentRoles: string[];
  onConvert: (userId: string, fromRole: string, toRole: string) => void;
}

export default function RoleConversionModal({ isOpen, onClose, user, currentRoles, onConvert }: RoleConversionModalProps) {
  const [toRole, setToRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableRoles = ROLES.filter(r => !currentRoles.includes(r)).map(role => ({
    value: role,
    label: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role]
  }));
  
  const getChangesPreview = () => {
    if (!toRole) return null;
    
    const changes = [];
    
    if (toRole === 'VENDOR') {
      changes.push('✓ Create VendorProfile');
      changes.push('✓ Create Stripe Connect account');
      changes.push('✓ Enable product management');
    } else if (toRole === 'EVENT_COORDINATOR') {
      changes.push('✓ Create EventCoordinatorProfile');
      changes.push('✓ Create Stripe Connect account');
      changes.push('✓ Enable event management');
    } else if (toRole === 'CUSTOMER' && currentRoles.includes('VENDOR')) {
      changes.push('⚠ Archive all products');
      changes.push('⚠ Disable storefront');
      changes.push('⚠ Preserve Stripe account data');
    }
    
    return changes;
  };
  
  const handleSubmit = async () => {
    if (!toRole) return;
    
    setIsSubmitting(true);
    try {
      const fromRole = currentRoles[0] || 'CUSTOMER';
      await onConvert(user.id, fromRole, toRole);
      onClose();
    } catch (error) {
      console.error('Role conversion failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  const changesPreview = getChangesPreview();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Convert User Role</h2>
              <p className="text-sm text-gray-600">{user.name} ({user.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Current Roles */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-2">Current Roles</div>
              <div className="flex gap-2">
                {currentRoles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
                {currentRoles.length === 0 && (
                  <Badge variant="secondary">CUSTOMER</Badge>
                )}
              </div>
            </div>
            
            {toRole && (
              <>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">New Role</div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {toRole.replace('_', ' ')}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Role <span className="text-red-500">*</span>
            </label>
            <select
              value={toRole}
              onChange={(e) => setToRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a role...</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>
          
          {/* Migration Preview */}
          {changesPreview && changesPreview.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">What Will Happen</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {changesPreview.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {toRole === 'VENDOR' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Next Steps for User</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>1. Complete Stripe Connect onboarding</li>
                    <li>2. Set up storefront and first product</li>
                    <li>3. Configure fulfillment options</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!toRole || isSubmitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Converting...' : 'Convert Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

