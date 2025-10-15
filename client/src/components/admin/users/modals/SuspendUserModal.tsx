import React, { useState } from 'react';
import { X, UserX, AlertCircle } from 'lucide-react';

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  onSuspend: (userId: string, reason: string, params: any) => void;
}

export default function SuspendUserModal({ isOpen, onClose, user, onSuspend }: SuspendUserModalProps) {
  const [reasonCode, setReasonCode] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [gracePeriod, setGracePeriod] = useState(0);
  const [sendNotice, setSendNotice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isSuspending = user.status !== 'SUSPENDED';
  
  const reasonCodes = [
    { value: 'FRAUD', label: 'Fraud Suspected' },
    { value: 'ABUSE', label: 'Platform Abuse' },
    { value: 'TERMS_VIOLATION', label: 'Terms of Service Violation' },
    { value: 'PAYMENT_ISSUES', label: 'Payment Issues' },
    { value: 'DISPUTE_CHARGEBACK', label: 'Excessive Disputes/Chargebacks' },
    { value: 'SPAM', label: 'Spam or Malicious Activity' },
    { value: 'USER_REQUEST', label: 'User Requested' },
    { value: 'OTHER', label: 'Other (specify below)' }
  ];
  
  const handleSubmit = async () => {
    if (!reasonCode) return;
    
    setIsSubmitting(true);
    try {
      const reason = reasonCode === 'OTHER' ? customReason : reasonCodes.find(r => r.value === reasonCode)?.label || reasonCode;
      
      await onSuspend(user.id, reason, {
        gracePeriodDays: gracePeriod,
        sendNotice
      });
      
      onClose();
    } catch (error) {
      console.error('Suspension failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSuspending ? 'bg-red-100' : 'bg-green-100'}`}>
              <UserX className={`w-6 h-6 ${isSuspending ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isSuspending ? 'Suspend User' : 'Reinstate User'}
              </h2>
              <p className="text-sm text-gray-600">{user.name} ({user.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Warning */}
        {isSuspending && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Suspension Effects</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Vendor: Storefront hidden, products delisted</li>
                  <li>• Customer: Cannot place new orders</li>
                  <li>• All roles: Cannot login (except to view restrictions)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason Code <span className="text-red-500">*</span>
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a reason...</option>
              {reasonCodes.map((code) => (
                <option key={code.value} value={code.value}>
                  {code.label}
                </option>
              ))}
            </select>
          </div>
          
          {reasonCode === 'OTHER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Provide detailed reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>
          )}
          
          {isSuspending && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period for Open Payouts
                </label>
                <select
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value={0}>No grace period</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendNotice"
                  checked={sendNotice}
                  onChange={(e) => setSendNotice(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sendNotice" className="text-sm text-gray-700">
                  Send automated notice to user
                </label>
              </div>
            </>
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
            disabled={!reasonCode || (reasonCode === 'OTHER' && !customReason) || isSubmitting}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isSuspending ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Processing...' : isSuspending ? 'Suspend User' : 'Reinstate User'}
          </button>
        </div>
      </div>
    </div>
  );
}

