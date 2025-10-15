import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { legalService, LegalDocument } from '../../services/legal';
import { LegalDocumentModal } from './LegalDocumentModal';

interface TOSAcceptanceCheckboxProps {
  role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR';
  accepted: boolean;
  onAcceptanceChange: (accepted: boolean, requiredDocuments?: LegalDocument[]) => void;
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
}

export const TOSAcceptanceCheckbox: React.FC<TOSAcceptanceCheckboxProps> = ({
  role,
  accepted,
  onAcceptanceChange,
  disabled = false,
  className = '',
  showLabels = true
}) => {
  const [requiredDocuments, setRequiredDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadRequiredDocuments();
  }, [role]);

  const loadRequiredDocuments = async () => {
    try {
      setLoading(true);
      const documents = await legalService.getRequiredDocuments(role);
      setRequiredDocuments(documents);
      onAcceptanceChange(accepted, documents);
    } catch (error) {
      console.error('Failed to load required documents:', error);
      toast.error('Failed to load legal documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onAcceptanceChange(isChecked, requiredDocuments);
  };

  const handleViewDocument = async (documentType: string) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const document = await legalService.getDocumentByType(documentType);
      setSelectedDocument(document);
    } catch (error) {
      console.error('Failed to load document:', error);
      toast.error('Failed to load document');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-green"></div>
        <span className="text-sm text-gray-600">Loading legal documents...</span>
      </div>
    );
  }

  const tosDocument = requiredDocuments.find(doc => doc.type === 'TOS');
  const privacyDocument = requiredDocuments.find(doc => doc.type === 'PRIVACY');
  const otherDocuments = requiredDocuments.filter(doc => !['TOS', 'PRIVACY'].includes(doc.type));

  return (
    <div className={className}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="tos-acceptance"
          checked={accepted}
          onChange={handleCheckboxChange}
          disabled={disabled}
          className="mt-1 h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green focus:ring-2"
        />
        <div className="flex-1">
          <label htmlFor="tos-acceptance" className="text-sm text-gray-700 cursor-pointer">
            {showLabels && (
              <span className="block mb-2 font-medium">
                I agree to the following legal documents: <span className="text-red-500">*</span>
              </span>
            )}
            <div className="space-y-1">
              {tosDocument && (
                <div>
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => handleViewDocument('TOS')}
                    className="text-brand-green hover:text-brand-green/80 underline font-medium"
                  >
                    Terms of Service
                  </button>
                  {' '}(v{tosDocument.version})
                </div>
              )}
              
              {privacyDocument && (
                <div>
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => handleViewDocument('PRIVACY')}
                    className="text-brand-green hover:text-brand-green/80 underline font-medium"
                  >
                    Privacy & Data Use Policy
                  </button>
                  {' '}(v{privacyDocument.version})
                </div>
              )}

              {otherDocuments.map((doc) => (
                <div key={doc.id}>
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => handleViewDocument(doc.type)}
                    className="text-brand-green hover:text-brand-green/80 underline font-medium"
                  >
                    {getDocumentDisplayName(doc.type)}
                  </button>
                  {' '}(v{doc.version})
                </div>
              ))}
            </div>
          </label>

          {showLabels && (
            <div className="mt-2 text-xs text-gray-500">
              By checking this box, you confirm that you have read, understood, and agree to be bound by all the legal documents listed above.
            </div>
          )}
        </div>
      </div>

      <LegalDocumentModal
        isOpen={showModal}
        onClose={closeModal}
        document={selectedDocument}
        loading={modalLoading}
      />
    </div>
  );
};

/**
 * Get user-friendly display name for document types
 */
function getDocumentDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    'TOS': 'Terms of Service',
    'PRIVACY': 'Privacy & Data Use Policy',
    'AI_DISCLAIMER': 'AI Disclaimer',
    'DATA_LIABILITY': 'Data Loss & Liability Waiver',
    'VENDOR_AGREEMENT': 'Vendor Services Agreement',
    'COORDINATOR_AGREEMENT': 'Event Coordinator Agreement'
  };

  return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
