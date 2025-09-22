import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Eye, AlertCircle } from 'lucide-react';

interface LabelProfile {
  id: string;
  name: string;
  description?: string;
  widthIn: number;
  heightIn: number;
  orientation: string;
  engine: string;
  printerProfile: {
    name: string;
    driver: string;
    dpi: number;
  };
}

interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: 'order' | 'product' | 'manual';
  sourceId: string;
  sourceName?: string;
}

interface PreviewData {
  type: string;
  url: string;
  width: number;
  height: number;
  dpi: number;
}

export default function PrintLabelModal({
  isOpen,
  onClose,
  source,
  sourceId,
  sourceName
}: PrintLabelModalProps) {
  const [labelProfiles, setLabelProfiles] = useState<LabelProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [copies, setCopies] = useState<number>(1);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load label profiles on mount
  useEffect(() => {
    if (isOpen) {
      loadLabelProfiles();
    }
  }, [isOpen]);

  // Generate preview when profile changes
  useEffect(() => {
    if (selectedProfile && sourceId) {
      generatePreview();
    }
  }, [selectedProfile, sourceId]);

  const loadLabelProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/labels/profiles');
      const data = await response.json();
      
      if (response.ok) {
        setLabelProfiles(data.profiles);
        if (data.profiles.length > 0) {
          setSelectedProfile(data.profiles[0].id);
        }
      } else {
        setError(data.error || 'Failed to load label profiles');
      }
    } catch (error) {
      setError('Failed to load label profiles');
      console.error('Error loading label profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!selectedProfile || !sourceId) return;

    try {
      setPreviewLoading(true);
      setError('');

      const response = await fetch('/api/labels/jobs/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          sourceId,
          labelProfileId: selectedProfile
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.preview);
      } else {
        setError(data.error || 'Failed to generate preview');
      }
    } catch (error) {
      setError('Failed to generate preview');
      console.error('Error generating preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrintNow = async () => {
    if (!selectedProfile || !sourceId) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/labels/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          sourceId,
          labelProfileId: selectedProfile,
          copies
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show notification and close modal
        // TODO: Show success toast
        console.log('Label job created:', data.job);
        onClose();
      } else {
        setError(data.error || 'Failed to create print job');
      }
    } catch (error) {
      setError('Failed to create print job');
      console.error('Error creating print job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!preview?.url) return;

    try {
      const response = await fetch(preview.url);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label-${sourceId}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download PDF');
      console.error('Error downloading PDF:', error);
    }
  };

  if (!isOpen) return null;

  const selectedProfileData = labelProfiles.find(p => p.id === selectedProfile);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Print Label</h2>
            <p className="text-sm text-gray-500 mt-1">
              {source === 'order' && `Order: ${sourceName || sourceId}`}
              {source === 'product' && `Product: ${sourceName || sourceId}`}
              {source === 'manual' && `Manual: ${sourceName || sourceId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Label Profile Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label Profile
                </label>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
                ) : (
                  <select
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Select label profile"
                  >
                    {labelProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.widthIn}" × {profile.heightIn}")
                      </option>
                    ))}
                  </select>
                )}
                
                {selectedProfileData && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Engine:</strong> {selectedProfileData.engine}</p>
                    <p><strong>Printer:</strong> {selectedProfileData.printerProfile.name}</p>
                    <p><strong>DPI:</strong> {selectedProfileData.printerProfile.dpi}</p>
                    {selectedProfileData.description && (
                      <p><strong>Description:</strong> {selectedProfileData.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of copies"
                  aria-label="Number of copies"
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handlePrintNow}
                  disabled={loading || !selectedProfile}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {loading ? 'Creating Job...' : 'Print Now'}
                </button>

                {preview && (
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <button
                  onClick={generatePreview}
                  disabled={previewLoading || !selectedProfile}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  title="Refresh preview"
                  aria-label="Refresh preview"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {previewLoading ? 'Generating...' : 'Refresh'}
                </button>
              </div>

              {previewLoading ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Generating preview...</p>
                </div>
              ) : preview ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {preview.type === 'application/pdf' ? (
                    <iframe
                      src={preview.url}
                      className="w-full h-96"
                      title="Label Preview"
                    />
                  ) : (
                    <img
                      src={preview.url}
                      alt="Label Preview"
                      className="w-full h-auto"
                    />
                  )}
                  <div className="p-3 bg-gray-50 text-xs text-gray-600">
                    Size: {preview.width}" × {preview.height}" at {preview.dpi} DPI
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    Select a label profile to see a preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
