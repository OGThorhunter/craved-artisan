import { httpClient } from '../lib/http';

export interface LegalDocument {
  id: string;
  type: string;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserAgreement {
  id: string;
  userId: string;
  documentId: string;
  documentType: string;
  documentVersion: string;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
  document?: {
    id: string;
    type: string;
    version: string;
    title: string;
    isActive: boolean;
  };
}

export interface AcceptAgreementRequest {
  agreements: Array<{
    documentId: string;
    documentType: string;
    documentVersion: string;
  }>;
}

export interface AcceptanceCheckResult {
  success: boolean;
  allAccepted: boolean;
  acceptedTypes: string[];
  missingTypes: string[];
  requiredTypes: string[];
}

class LegalService {
  private cache = new Map<string, LegalDocument[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  /**
   * Get all active legal documents
   */
  async getAllDocuments(): Promise<LegalDocument[]> {
    const cacheKey = 'all-documents';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const response = await httpClient.get('/api/legal/documents');
    if (!response.ok) {
      throw new Error('Failed to fetch legal documents');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch legal documents');
    }

    this.setCache(cacheKey, data.documents);
    return data.documents;
  }

  /**
   * Get a specific document by type (returns latest active version)
   */
  async getDocumentByType(type: string): Promise<LegalDocument> {
    const cacheKey = `document-${type}`;
    const cached = this.getFromCache(cacheKey);
    if (cached && cached.length > 0) return cached[0];

    const response = await httpClient.get(`/api/legal/documents/${encodeURIComponent(type)}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Document of type '${type}' not found`);
      }
      throw new Error('Failed to fetch legal document');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch legal document');
    }

    this.setCache(cacheKey, [data.document]);
    return data.document;
  }

  /**
   * Get required documents for a specific role
   */
  async getRequiredDocuments(role: string): Promise<LegalDocument[]> {
    const cacheKey = `required-${role}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const response = await httpClient.get(`/api/legal/documents/required/${encodeURIComponent(role)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch required legal documents');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch required legal documents');
    }

    this.setCache(cacheKey, data.documents);
    return data.documents;
  }

  /**
   * Accept multiple legal agreements
   */
  async acceptAgreements(agreements: AcceptAgreementRequest): Promise<UserAgreement[]> {
    const response = await httpClient.post('/api/legal/agreements', agreements);
    if (!response.ok) {
      throw new Error('Failed to accept agreements');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to accept agreements');
    }

    // Clear user agreements cache
    this.clearUserAgreementsCache();

    return data.agreements;
  }

  /**
   * Get current user's accepted agreements
   */
  async getUserAgreements(): Promise<UserAgreement[]> {
    const cacheKey = 'user-agreements';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const response = await httpClient.get('/api/legal/user-agreements');
    if (!response.ok) {
      throw new Error('Failed to fetch user agreements');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch user agreements');
    }

    this.setCache(cacheKey, data.agreements);
    return data.agreements;
  }

  /**
   * Check if a user has accepted all required agreements for their role
   */
  async checkAcceptance(userId: string, role: string): Promise<AcceptanceCheckResult> {
    const response = await httpClient.get(`/api/legal/check-acceptance/${encodeURIComponent(userId)}/${encodeURIComponent(role)}`);
    if (!response.ok) {
      throw new Error('Failed to check agreement acceptance');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to check agreement acceptance');
    }

    return {
      success: data.success,
      allAccepted: data.allAccepted,
      acceptedTypes: data.acceptedTypes,
      missingTypes: data.missingTypes,
      requiredTypes: data.requiredTypes
    };
  }

  /**
   * Get Terms of Service document
   */
  async getTermsOfService(): Promise<LegalDocument> {
    return this.getDocumentByType('TOS');
  }

  /**
   * Get Privacy Policy document
   */
  async getPrivacyPolicy(): Promise<LegalDocument> {
    return this.getDocumentByType('PRIVACY');
  }

  /**
   * Get AI Disclaimer document
   */
  async getAIDisclaimer(): Promise<LegalDocument> {
    return this.getDocumentByType('AI_DISCLAIMER');
  }

  /**
   * Get Data Liability Waiver document
   */
  async getDataLiabilityWaiver(): Promise<LegalDocument> {
    return this.getDocumentByType('DATA_LIABILITY');
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Clear user agreements cache specifically
   */
  private clearUserAgreementsCache(): void {
    this.cache.delete('user-agreements');
    this.cacheTimestamps.delete('user-agreements');
  }

  /**
   * Get item from cache if still valid
   */
  private getFromCache<T>(key: string): T | null {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp || Date.now() - timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }

    return this.cache.get(key) as T || null;
  }

  /**
   * Set item in cache with timestamp
   */
  private setCache<T>(key: string, value: T): void {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }
}

export const legalService = new LegalService();
