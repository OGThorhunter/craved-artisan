// Re-export from the main legal service to maintain backwards compatibility
export { 
  legalService, 
  LegalDocument, 
  UserAgreement, 
  AcceptAgreementRequest, 
  AcceptanceCheckResult 
} from '../../services/legal';

// Legacy API functions for backwards compatibility - these delegate to the main service
import { legalService } from '../../services/legal';
import type { LegalDocument, UserAgreement } from '../../services/legal';

// Interface for backwards compatibility with existing function signatures
export interface AgreementAcceptance {
  documentId: string;
  documentType: string;
  documentVersion: string;
}

/**
 * @deprecated Use legalService.getAllDocuments() instead
 * Fetch all active legal documents
 */
export const getLegalDocuments = async (): Promise<LegalDocument[]> => {
  return legalService.getAllDocuments();
};

/**
 * @deprecated Use legalService.getDocumentByType() instead
 * Fetch a specific legal document by type
 */
export const getLegalDocumentByType = async (type: string): Promise<LegalDocument> => {
  return legalService.getDocumentByType(type);
};

/**
 * @deprecated Use legalService.getRequiredDocuments() instead
 * Fetch required legal documents for a specific role
 */
export const getRequiredDocumentsForRole = async (role: string): Promise<LegalDocument[]> => {
  return legalService.getRequiredDocuments(role);
};

/**
 * @deprecated Use legalService.acceptAgreements() instead
 * Accept multiple legal agreements (batch)
 */
export const acceptAgreements = async (agreements: AgreementAcceptance[]): Promise<UserAgreement[]> => {
  const formattedAgreements = {
    agreements: agreements.map(agreement => ({
      documentId: agreement.documentId,
      documentType: agreement.documentType,
      documentVersion: agreement.documentVersion
    }))
  };
  return legalService.acceptAgreements(formattedAgreements);
};

/**
 * @deprecated Use legalService.getUserAgreements() instead
 * Get current user's accepted agreements
 */
export const getUserAgreements = async (): Promise<UserAgreement[]> => {
  return legalService.getUserAgreements();
};

/**
 * @deprecated Use legalService.checkAcceptance() instead
 * Check if a user has accepted all required agreements for their role
 */
export const checkAgreementAcceptance = async (userId: string, role: string) => {
  return legalService.checkAcceptance(userId, role);
};

