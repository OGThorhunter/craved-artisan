import React, { useState } from 'react';
import { X, Download, Trash2, AlertTriangle, Shield } from 'lucide-react';

interface PrivacyOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  };
  onExport: (userId: string, format: 'JSON' | 'CSV') => void;
  onDelete: (userId: string, mode: 'delete' | 'anonymize') => void;
}

type Mode = 'export' | 'delete' | 'anonymize';

export default function PrivacyOpsModal({ isOpen, onClose, user, onExport, onDelete }: PrivacyOpsModalProps) {
  const [mode, setMode] = useState<Mode>('export');
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON');
  const [deleteMode, setDeleteMode] = useState<'delete' | 'anonymize'>('anonymize');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === 'export') {
        await onExport(user.id, exportFormat);
      } else {
        if (confirmation !== 'DELETE') return;
        await onDelete(user.id, deleteMode);
      }
      onClose();
    } catch (error) {
      console.error('Privacy operation failed:', error);
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Privacy Operations</h2>
              <p className="text-sm text-gray-600">{user.name} ({user.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mode Selection */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            <button
              onClick={() => setMode('export')}
              className={`flex-1 p-4 border-2 rounded-lg text-left ${
                mode === 'export' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Download className="w-5 h-5 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900">Export Data</div>
              <div className="text-sm text-gray-600">GDPR Subject Access Request</div>
            </button>
            
            <button
              onClick={() => setMode('delete')}
              className={`flex-1 p-4 border-2 rounded-lg text-left ${
                mode === 'delete' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Trash2 className="w-5 h-5 text-red-600 mb-2" />
              <div className="font-medium text-gray-900">Delete/Anonymize</div>
              <div className="text-sm text-gray-600">Remove or redact user data</div>
            </button>
          </div>
        </div>
        
        {/* Export Mode */}
        {mode === 'export' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'JSON' | 'CSV')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="JSON">JSON (complete data)</option>
                <option value="CSV">CSV (tabular format)</option>
              </select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Included Data</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• User profile and contact information</li>
                <li>• Order history and transactions</li>
                <li>• Vendor/Coordinator profiles (if applicable)</li>
                <li>• Admin notes and tasks</li>
                <li>• Security events and sessions</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Delete/Anonymize Mode */}
        {mode === 'delete' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deletion Mode</label>
              <div className="space-y-2">
                <button
                  onClick={() => setDeleteMode('anonymize')}
                  className={`w-full p-4 border-2 rounded-lg text-left ${
                    deleteMode === 'anonymize' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">Anonymize (Recommended)</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Redact PII but preserve financial ledger and audit trail
                  </div>
                </button>
                
                <button
                  onClick={() => setDeleteMode('delete')}
                  className={`w-full p-4 border-2 rounded-lg text-left ${
                    deleteMode === 'delete' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">Complete Delete</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Soft delete user and all associated data
                  </div>
                </button>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">Warning</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {deleteMode === 'anonymize' ? (
                      <>
                        <li>• Email will be replaced with deleted-{user.id.slice(0, 8)}@anonymized.local</li>
                        <li>• Name, phone, and address will be removed</li>
                        <li>• Order history and financial data preserved for compliance</li>
                        <li>• This action cannot be undone</li>
                      </>
                    ) : (
                      <>
                        <li>• User account will be marked as deleted</li>
                        <li>• Login will be disabled</li>
                        <li>• Data retained for 90 days then purged</li>
                        <li>• This action cannot be undone</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
        
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
            disabled={mode !== 'export' && confirmation !== 'DELETE' || isSubmitting}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'export' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Processing...' : mode === 'export' ? 'Download Export' : deleteMode === 'anonymize' ? 'Anonymize User' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

