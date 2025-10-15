import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import LegalAgreementDisplay from '../auth/LegalAgreementDisplay';
import { legalService, LegalDocument } from '../../services/legal';

interface LegalAgreementsProps {
  role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR';
  onAcceptanceChange: (accepted: boolean, agreements?: LegalDocument[]) => void;
  disabled?: boolean;
  className?: string;
}

const LegalAgreements: React.FC<LegalAgreementsProps> = ({
  role,
  onAcceptanceChange,
  disabled = false,
  className = ''
}) => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptanceState, setAcceptanceState] = useState<Record<string, boolean>>({});

  // Fetch required documents for the role
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const requiredDocuments = await legalService.getRequiredDocuments(role);
        setDocuments(requiredDocuments);
        
        // Initialize acceptance state
        const initialState: Record<string, boolean> = {};
        requiredDocuments.forEach(doc => {
          initialState[doc.id] = false;
        });
        setAcceptanceState(initialState);
        
      } catch (err) {
        console.error('Error fetching legal documents:', err);
        setError(err instanceof Error ? err.message : 'Failed to load legal agreements');
        toast.error('Failed to load legal agreements');
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchDocuments();
    }
  }, [role]);

  // Check if all required agreements are accepted
  useEffect(() => {
    const allAccepted = documents.length > 0 && documents.every(doc => acceptanceState[doc.id]);
    onAcceptanceChange(allAccepted, allAccepted ? documents : undefined);
  }, [acceptanceState, documents, onAcceptanceChange]);

  const handleDocumentAcceptance = (documentId: string, accepted: boolean) => {
    setAcceptanceState(prev => ({
      ...prev,
      [documentId]: accepted
    }));
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Agreements</h3>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B6E02]"></div>
          <span className="ml-3 text-gray-600">Loading legal agreements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Agreements</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading agreements</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Agreements</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-gray-600">No legal agreements required for your account type.</p>
        </div>
      </div>
    );
  }

  const allAccepted = documents.every(doc => acceptanceState[doc.id]);
  const acceptedCount = documents.filter(doc => acceptanceState[doc.id]).length;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Legal Agreements</h3>
        <div className="text-sm text-gray-600">
          {acceptedCount} of {documents.length} accepted
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Please review and accept all legal agreements to continue with your {role.toLowerCase().replace('_', ' ')} account registration.
      </div>

      <div className="space-y-4">
        {documents.map((document) => (
          <LegalAgreementDisplay
            key={document.id}
            document={document}
            accepted={acceptanceState[document.id] || false}
            onAcceptChange={(accepted) => handleDocumentAcceptance(document.id, accepted)}
            error={!acceptanceState[document.id] && Object.keys(acceptanceState).length > 0 ? 
              'Please accept this agreement to continue' : undefined}
          />
        ))}
      </div>

      {/* Summary */}
      <div className={`mt-6 p-4 rounded-md ${
        allAccepted 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {allAccepted ? (
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h4 className={`text-sm font-medium ${allAccepted ? 'text-green-800' : 'text-yellow-800'}`}>
              {allAccepted 
                ? 'All agreements accepted' 
                : `${documents.length - acceptedCount} agreement(s) remaining`
              }
            </h4>
            <p className={`text-sm mt-1 ${allAccepted ? 'text-green-700' : 'text-yellow-700'}`}>
              {allAccepted 
                ? 'You can now proceed to the next step.'
                : 'Please accept all required agreements to continue.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAgreements;

