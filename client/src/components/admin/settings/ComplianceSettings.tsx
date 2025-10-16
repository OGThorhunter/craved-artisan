import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { FileText, Upload, Trash2, Shield, AlertCircle } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { ReasonModal } from './ReasonModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface ComplianceSettingsProps {
  settings: any[];
}

export const ComplianceSettings: React.FC<ComplianceSettingsProps> = ({ settings }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ key: string; value: any } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch compliance documents
  const { data: documents } = useQuery({
    queryKey: ['admin', 'settings', 'compliance', 'documents'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/compliance/documents', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch S3 status
  const { data: s3Status } = useQuery({
    queryKey: ['admin', 'integrations', 's3', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/integrations/s3/status', {
        credentials: 'include'
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value, reason }: { key: string; value: any; reason: string }) => {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value, reason })
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/admin/settings/compliance/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'compliance', 'documents'] });
    }
  });

  const getSetting = (key: string) => {
    const setting = settings?.find((s) => s.key === key);
    return setting?.value;
  };

  const handleUpdate = (key: string, value: any) => {
    setPendingUpdate({ key, value });
    setShowReasonModal(true);
  };

  const confirmUpdate = (reason: string) => {
    if (pendingUpdate) {
      updateMutation.mutate({
        key: pendingUpdate.key,
        value: pendingUpdate.value,
        reason
      });
    }
    setPendingUpdate(null);
  };

  const handleDeleteDocument = (documentId: string) => {
    setSelectedDocument(documentId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteDocumentMutation.mutate(selectedDocument);
    }
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* S3 Warning */}
      {s3Status && !s3Status.configured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">File Upload Disabled</p>
            <p className="text-sm text-yellow-700 mt-1">
              S3 is not configured. Document metadata can be saved, but files cannot be uploaded.
              Configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, and AWS_REGION to enable uploads.
            </p>
          </div>
        </div>
      )}

      {/* Data Retention */}
      <SettingsCard
        title="Data Retention"
        description="Configure how long user data is retained"
        icon={<Shield className="h-5 w-5 text-[#7F232E]" />}
      >
        <div>
          <label htmlFor="data-retention" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
            Data Retention Period (days)
          </label>
          <input
            id="data-retention"
            type="number"
            min="1"
            max="3650"
            value={getSetting('compliance.data_retention_days') || 2555}
            onChange={(e) => handleUpdate('compliance.data_retention_days', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
          />
          <p className="text-xs text-[#4b4b4b] mt-1">
            Default: 2555 days (7 years). Legal requirement for financial records.
          </p>
        </div>
      </SettingsCard>

      {/* Privacy Compliance */}
      <SettingsCard
        title="Privacy Compliance"
        description="GDPR and CCPA compliance settings"
        icon={<Shield className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">GDPR Compliance Enabled</label>
              <p className="text-xs text-[#4b4b4b]">General Data Protection Regulation (EU)</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getSetting('compliance.gdpr_enabled') ? 'success' : 'secondary'}>
                {getSetting('compliance.gdpr_enabled') ? 'Active' : 'Inactive'}
              </Badge>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={getSetting('compliance.gdpr_enabled') !== false}
                  onChange={(e) => handleUpdate('compliance.gdpr_enabled', e.target.checked)}
                  className="sr-only peer"
                  aria-label="GDPR Compliance Enabled"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[#2b2b2b]">CCPA Compliance Enabled</label>
              <p className="text-xs text-[#4b4b4b]">California Consumer Privacy Act (US)</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getSetting('compliance.ccpa_enabled') ? 'success' : 'secondary'}>
                {getSetting('compliance.ccpa_enabled') ? 'Active' : 'Inactive'}
              </Badge>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={getSetting('compliance.ccpa_enabled') !== false}
                  onChange={(e) => handleUpdate('compliance.ccpa_enabled', e.target.checked)}
                  className="sr-only peer"
                  aria-label="CCPA Compliance Enabled"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
              </label>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Compliance Documents */}
      <SettingsCard
        title="Compliance Documents"
        description="Upload and manage compliance documentation"
        icon={<FileText className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          {documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#4b4b4b]" />
                      <span className="text-sm font-medium text-[#2b2b2b]">{doc.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {doc.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {doc.fileName && (
                      <p className="text-xs text-[#4b4b4b] mt-1 ml-6">
                        {doc.fileName} ({doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'})
                      </p>
                    )}
                    {doc.uploadedAt && (
                      <p className="text-xs text-[#4b4b4b] ml-6">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-[#4b4b4b]">No compliance documents uploaded yet.</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              disabled={!s3Status?.configured}
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            {!s3Status?.configured && (
              <p className="text-xs text-yellow-600 mt-2">
                S3 must be configured to upload documents
              </p>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* Business Information */}
      <SettingsCard
        title="Business Information"
        description="Legal business entity details"
        icon={<Shield className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Business registration information, EIN, and legal entity details should be stored securely.
            This section can be expanded to include editable business info fields as needed.
          </p>
        </div>
      </SettingsCard>

      {/* Subject Access Request */}
      <SettingsCard
        title="Subject Access Request (SAR)"
        description="GDPR/CCPA data export requests"
        icon={<Shield className="h-5 w-5 text-[#7F232E]" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4b4b4b]">
            When a user requests their data (Subject Access Request), use the form below to generate
            a complete export of their personal data.
          </p>
          
          <div>
            <label htmlFor="sar-user-id" className="text-sm font-medium text-[#2b2b2b] mb-1 block">
              User ID or Email
            </label>
            <div className="flex gap-2">
              <input
                id="sar-user-id"
                type="text"
                placeholder="Enter user ID or email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
              <Button variant="primary">
                Generate Export
              </Button>
            </div>
            <p className="text-xs text-[#4b4b4b] mt-1">
              Exports all user data including profile, orders, and activity history.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> Automated SAR export generation with secure download links.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Reason Modal */}
      <ReasonModal
        isOpen={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setPendingUpdate(null);
        }}
        onConfirm={confirmUpdate}
        title="Confirm Compliance Setting Change"
        description="Please provide a reason for this compliance configuration change. This will be logged in the audit trail."
        actionLabel="Update Setting"
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedDocument(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Compliance Document"
        description="Are you sure you want to delete this compliance document? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};

