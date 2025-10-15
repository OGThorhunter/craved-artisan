import React, { useState } from 'react';
import { X, UserCheck, AlertTriangle } from 'lucide-react';

interface ImpersonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  };
  onImpersonate: (userId: string, reason: string, duration: number) => void;
}

export default function ImpersonateModal({ isOpen, onClose, user, onImpersonate }: ImpersonateModalProps) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(60); // minutes
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canSubmit = reason.trim().length >= 10 && confirmation === 'IMPERSONATE';
  
  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onImpersonate(user.id, reason, duration);
      onClose();
    } catch (error) {
      console.error('Impersonation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Impersonate User</h2>
              <p className="text-sm text-gray-600">{user.name} ({user.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Warning */}
        <div className="p-6 bg-yellow-50 border-b border-yellow-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Important Notice</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• All actions performed while impersonating will be audited</li>
                <li>• You will be automatically logged out after the time limit expires</li>
                <li>• This action requires a detailed reason for compliance</li>
                <li>• Do not access sensitive user data without authorization</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Impersonation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed reason for impersonating this user (minimum 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows={4}
            />
            <div className="text-sm text-gray-500 mt-1">
              {reason.length} / 10 minimum characters
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value={15}>15 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "IMPERSONATE" to confirm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
              placeholder="IMPERSONATE"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
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
            disabled={!canSubmit || isSubmitting}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Impersonating...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Impersonate User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

