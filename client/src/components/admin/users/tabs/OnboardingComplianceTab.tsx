import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, Calendar, RefreshCw } from 'lucide-react';
import Card from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface OnboardingComplianceTabProps {
  user: any;
}

export default function OnboardingComplianceTab({ user }: OnboardingComplianceTabProps) {
  const hasStripe = user.vendorProfile?.stripeAccountId || user.coordinatorProfile?.stripeAccountId;
  
  return (
    <div className="space-y-6">
      {/* Stripe Connect Status */}
      {hasStripe && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2b2b2b]">Stripe Connect</h2>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <RefreshCw className="w-4 h-4" />
              Re-sync
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account ID</span>
                  <span className="font-mono text-sm text-gray-900">
                    {user.vendorProfile?.stripeAccountId || user.coordinatorProfile?.stripeAccountId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payouts Enabled</span>
                  {user.stripeAccount?.payoutsEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                {user.stripeAccount?.tosAcceptedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">TOS Accepted</span>
                    <span className="text-sm text-gray-900">
                      {new Date(user.stripeAccount.tosAcceptedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Requirements Due</div>
              {user.stripeAccount?.requirementsDue && JSON.parse(user.stripeAccount.requirementsDue).length > 0 ? (
                <div className="space-y-2">
                  {JSON.parse(user.stripeAccount.requirementsDue).map((req: string) => (
                    <div key={req} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">{req.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>No requirements due</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
      
      {/* KYC/KYB Checklist */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">KYC/KYB Verification</h2>
        
        <div className="space-y-3">
          <ChecklistItem
            label="Email Verification"
            completed={user.emailVerified}
            date={user.emailVerifiedAt}
          />
          <ChecklistItem
            label="Phone Verification"
            completed={user.phoneVerified}
            date={user.phoneVerifiedAt}
          />
          <ChecklistItem
            label="Identity Documents"
            completed={false}
          />
          <ChecklistItem
            label="Business Information"
            completed={!!user.vendorProfile}
          />
        </div>
      </Card>
      
      {/* Tax & Nexus */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Tax & Nexus</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">W-9 Status</div>
            <Badge variant={user.taxProfile?.w9Status === 'APPROVED' ? 'success' : 'warning'}>
              {user.taxProfile?.w9Status || 'NOT_SUBMITTED'}
            </Badge>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">TaxJar ID</div>
            <span className="text-sm text-gray-900">
              {user.taxProfile?.taxJarId || 'Not configured'}
            </span>
          </div>
          
          <div className="col-span-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Tax Nexus States</div>
            {user.taxProfile?.nexusStates ? (
              <div className="flex flex-wrap gap-2">
                {JSON.parse(user.taxProfile.nexusStates).map((state: any) => (
                  <Badge key={state.state} variant="secondary">
                    {state.state}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-500">No nexus states</span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Documents Vault */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2b2b2b]">Documents</h2>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No documents uploaded</p>
        </div>
      </Card>
      
      {/* Vacation Mode */}
      {user.vendorProfile && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Vacation Mode</h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Vacation Mode</div>
              <div className="text-sm text-gray-600">
                {user.vacationMode?.enabled 
                  ? `Active until ${user.vacationMode.endDate ? new Date(user.vacationMode.endDate).toLocaleDateString() : 'indefinite'}`
                  : 'Not active'}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.vacationMode?.enabled ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user.vacationMode?.enabled ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          {user.vacationMode?.enabled && user.vacationMode.reason && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">Reason</div>
              <div className="text-sm text-blue-700">{user.vacationMode.reason}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

interface ChecklistItemProps {
  label: string;
  completed: boolean;
  date?: string | null;
}

function ChecklistItem({ label, completed, date }: ChecklistItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {completed ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-gray-300" />
        )}
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      {completed && date && (
        <span className="text-xs text-gray-500">
          {new Date(date).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

