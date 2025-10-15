import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, GitMerge, Search, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../../../ui/Badge';

interface MergeDuplicateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
  onMerge: (primaryId: string, duplicateId: string) => void;
}

type Step = 'search' | 'select' | 'preview' | 'confirm';

export default function MergeDuplicateWizard({ isOpen, onClose, user, onMerge }: MergeDuplicateWizardProps) {
  const [step, setStep] = useState<Step>('search');
  const [selectedDuplicate, setSelectedDuplicate] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [confirmation, setConfirmation] = useState('');
  
  const { data: duplicatesData } = useQuery({
    queryKey: ['admin', 'users', user.id, 'duplicates'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${user.id}/duplicates`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to find duplicates');
      return response.json();
    },
    enabled: isOpen
  });
  
  const duplicates = duplicatesData?.data?.duplicates || [];
  
  const loadPreview = async (duplicateId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/merge-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ duplicateId })
      });
      
      if (!response.ok) throw new Error('Failed to load preview');
      const data = await response.json();
      setPreview(data.data);
      setStep('preview');
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  };
  
  const handleMerge = async () => {
    if (confirmation !== 'MERGE' || !selectedDuplicate) return;
    
    try {
      await onMerge(user.id, selectedDuplicate.userId);
      onClose();
    } catch (error) {
      console.error('Merge failed:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitMerge className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Merge Duplicate Users</h2>
              <p className="text-sm text-gray-600">
                Step {step === 'search' ? '1' : step === 'select' ? '2' : step === 'preview' ? '3' : '4'} of 4
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Step 1: Search/Select Duplicate */}
          {step === 'search' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Primary Account</h3>
                <div className="text-sm text-blue-800">
                  <div>{user.name} ({user.email})</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3">Potential Duplicates</h3>
              
              {duplicates.length > 0 ? (
                <div className="space-y-3">
                  {duplicates.map((duplicate: any) => (
                    <div
                      key={duplicate.userId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedDuplicate(duplicate);
                        loadPreview(duplicate.userId);
                      }}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{duplicate.name}</div>
                        <div className="text-sm text-gray-600">{duplicate.email}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{duplicate.matchType}</Badge>
                          <span className="text-xs text-gray-500">
                            Confidence: {(duplicate.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No potential duplicates found</p>
                  <p className="text-sm mt-1">This user appears to be unique</p>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Preview Merge */}
          {step === 'preview' && preview && (
            <div className="space-y-6">
              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <div className="text-sm font-medium text-blue-900 mb-3">✓ PRIMARY (Keep)</div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {preview.primaryUser.name}</div>
                    <div><strong>Email:</strong> {preview.primaryUser.email}</div>
                    <div><strong>Created:</strong> {new Date(preview.primaryUser.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-3">→ DUPLICATE (Merge)</div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>Name:</strong> {preview.duplicateUser.name}</div>
                    <div><strong>Email:</strong> {preview.duplicateUser.email}</div>
                    <div><strong>Created:</strong> {new Date(preview.duplicateUser.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Data to Merge */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Data to Transfer</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{preview.dataToMerge.orders}</div>
                    <div className="text-sm text-gray-600">Orders</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{preview.dataToMerge.roles}</div>
                    <div className="text-sm text-gray-600">Roles</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{preview.dataToMerge.notes}</div>
                    <div className="text-sm text-gray-600">Notes</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{preview.dataToMerge.tasks}</div>
                    <div className="text-sm text-gray-600">Tasks</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{preview.dataToMerge.riskFlags}</div>
                    <div className="text-sm text-gray-600">Risk Flags</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{preview.dataToMerge.securityEvents}</div>
                    <div className="text-sm text-gray-600">Security Events</div>
                  </div>
                </div>
              </div>
              
              {/* Conflicts */}
              {preview.conflicts && preview.conflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Merge Conflicts</h3>
                      <ul className="text-sm text-red-800 space-y-1">
                        {preview.conflicts.map((conflict: string, i: number) => (
                          <li key={i}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "MERGE" to confirm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                  placeholder="MERGE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={() => {
              if (step === 'preview') {
                setStep('search');
                setPreview(null);
                setSelectedDuplicate(null);
                setConfirmation('');
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            {step === 'preview' ? 'Back' : 'Cancel'}
          </button>
          
          {step === 'preview' && (
            <button
              onClick={handleMerge}
              disabled={confirmation !== 'MERGE'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <GitMerge className="w-4 h-4" />
              Execute Merge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

