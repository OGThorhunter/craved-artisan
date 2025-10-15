import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { legalService, UserAgreement, LegalDocument } from '../../services/legal';
import { LegalDocumentModal } from './LegalDocumentModal';

interface AcceptedAgreementsListProps {
  className?: string;
}

export const AcceptedAgreementsList: React.FC<AcceptedAgreementsListProps> = ({
  className = ''
}) => {
  const [userAgreements, setUserAgreements] = useState<UserAgreement[]>([]);
  const [allDocuments, setAllDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agreements, documents] = await Promise.all([
        legalService.getUserAgreements(),
        legalService.getAllDocuments()
      ]);
      setUserAgreements(agreements);
      setAllDocuments(documents);
    } catch (error) {
      console.error('Failed to load agreements:', error);
      toast.error('Failed to load legal agreements');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      
      const document = allDocuments.find(doc => doc.id === documentId);
      if (document) {
        setSelectedDocument(document);
        setModalLoading(false);
      } else {
        // Fallback: fetch by type if not in cache
        const agreement = userAgreements.find(a => a.documentId === documentId);
        if (agreement) {
          const doc = await legalService.getDocumentByType(agreement.documentType);
          setSelectedDocument(doc);
        }
        setModalLoading(false);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      toast.error('Failed to load document');
      setShowModal(false);
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  const getDocumentDisplayName = (type: string): string => {
    const displayNames: Record<string, string> = {
      'TOS': 'Terms of Service',
      'PRIVACY': 'Privacy & Data Use Policy',
      'AI_DISCLAIMER': 'AI Disclaimer',
      'DATA_LIABILITY': 'Data Loss & Liability Waiver',
      'VENDOR_AGREEMENT': 'Vendor Services Agreement',
      'COORDINATOR_AGREEMENT': 'Event Coordinator Agreement'
    };

    return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOutdated = (agreement: UserAgreement): boolean => {
    const currentDoc = allDocuments.find(doc => 
      doc.type === agreement.documentType && doc.isActive
    );
    return currentDoc ? currentDoc.version !== agreement.documentVersion : false;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        <span className="ml-3 text-gray-600">Loading agreements...</span>
      </div>
    );
  }

  if (userAgreements.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-2">
          <CheckCircleIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agreements Found</h3>
        <p className="text-gray-500">
          You haven't accepted any legal agreements yet. This will be populated when you sign up or accept new terms.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {userAgreements.map((agreement) => {
          const outdated = isOutdated(agreement);
          const currentDoc = allDocuments.find(doc => 
            doc.type === agreement.documentType && doc.isActive
          );

          return (
            <div
              key={agreement.id}
              className={`border border-gray-200 rounded-lg p-4 ${
                outdated ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {outdated ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    <h4 className="text-lg font-medium text-gray-900">
                      {getDocumentDisplayName(agreement.documentType)}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      v{agreement.documentVersion}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Accepted on: {formatDate(agreement.acceptedAt)}</p>
                    {agreement.ipAddress && (
                      <p>From IP: {agreement.ipAddress}</p>
                    )}
                  </div>

                  {outdated && currentDoc && (
                    <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-800">
                          <strong>Update Available:</strong> A newer version (v{currentDoc.version}) of this document is available. 
                          Consider reviewing and re-accepting the updated terms.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDocument(agreement.documentId)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
