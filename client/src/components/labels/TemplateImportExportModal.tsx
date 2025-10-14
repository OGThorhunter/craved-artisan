import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Settings,
  Share2,
  Package,
  Loader2,
  Copy
} from 'lucide-react';
import type { LabelTemplate } from '../../types/label-templates';
import type { ImportResult, ImportOptions } from '../../services/labelTemplateImportExport';
import {
  exportLabelTemplates,
  importLabelTemplates,
  validateTemplateImport,
  templateImportExport
} from '../../services/labelTemplateImportExport';

interface TemplateImportExportModalProps {
  templates: LabelTemplate[];
  onImport: (templates: LabelTemplate[]) => Promise<void>;
  onClose: () => void;
  mode?: 'import' | 'export';
}

export const TemplateImportExportModal: React.FC<TemplateImportExportModalProps> = ({
  templates,
  onImport,
  onClose,
  mode: initialMode = 'export'
}) => {
  const [mode, setMode] = useState<'import' | 'export' | 'share'>(initialMode);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importValidation, setImportValidation] = useState<any>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    duplicateHandling: 'skip',
    validateTemplates: true,
    createBackup: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [sharingUrl, setSharingUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection for import
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportValidation(null);

    try {
      const validation = await validateTemplateImport(file);
      setImportValidation(validation);
    } catch (error) {
      setImportValidation({
        valid: false,
        templateCount: 0,
        version: 'unknown',
        issues: ['Failed to validate file'],
        preview: []
      });
    }
  };

  // Execute import
  const handleImport = async () => {
    if (!importFile || !importValidation?.valid) return;

    setIsProcessing(true);
    try {
      const result = await importLabelTemplates(importFile, templates, importOptions);
      setImportResult(result);
      
      if (result.success && result.imported > 0) {
        // In real implementation, reload templates from the result
        await onImport([]);
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{
          templateName: 'Import',
          error: error instanceof Error ? error.message : 'Import failed'
        }],
        duplicates: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute export
  const handleExport = () => {
    const templatesToExport = selectedTemplates.size > 0
      ? templates.filter(t => selectedTemplates.has(t.id))
      : templates;

    if (templatesToExport.length === 0) return;

    exportLabelTemplates(
      templatesToExport,
      `label-templates-${Date.now()}.json`,
      { description: `Exported ${templatesToExport.length} label templates` }
    );
  };

  // Generate sharing URL
  const handleGenerateShare = () => {
    const templatesToShare = selectedTemplates.size > 0
      ? templates.filter(t => selectedTemplates.has(t.id))
      : templates.slice(0, 3); // Limit sharing to 3 templates

    const url = templateImportExport.generateSharingLink(templatesToShare);
    setSharingUrl(url);
  };

  // Toggle template selection
  const toggleTemplateSelection = (templateId: string) => {
    const newSelection = new Set(selectedTemplates);
    if (newSelection.has(templateId)) {
      newSelection.delete(templateId);
    } else {
      newSelection.add(templateId);
    }
    setSelectedTemplates(newSelection);
  };

  // Select all templates
  const selectAllTemplates = () => {
    setSelectedTemplates(new Set(templates.map(t => t.id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTemplates(new Set());
  };

  const renderExportMode = () => (
    <div className="space-y-4">
      {/* Template Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Select Templates to Export</h4>
          <div className="flex space-x-2 text-sm">
            <button
              onClick={selectAllTemplates}
              className="text-brand-green hover:text-brand-green/80"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
          {templates.map(template => (
            <label
              key={template.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedTemplates.has(template.id)}
                onChange={() => toggleTemplateSelection(template.id)}
                className="rounded border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  {template.description || 'No description'}
                </div>
                <div className="text-xs text-gray-400">
                  {template.fields.length} fields • 
                  {Math.round(template.width / 25.4 * 10) / 10}" × {Math.round(template.height / 25.4 * 10) / 10}"
                </div>
              </div>
            </label>
          ))}
        </div>

        {selectedTemplates.size > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            {selectedTemplates.size} of {templates.length} templates selected
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h5 className="font-medium text-blue-900">Export Information</h5>
        </div>
        <div className="text-sm text-blue-800">
          Templates will be exported as a JSON file that can be imported into other Craved Artisan instances
          or shared with other users.
        </div>
      </div>
    </div>
  );

  const renderImportMode = () => (
    <div className="space-y-4">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Template File
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 cursor-pointer transition-colors"
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <div className="text-sm text-gray-600">
              {importFile ? (
                <span className="font-medium">{importFile.name}</span>
              ) : (
                <>
                  <span className="font-medium text-brand-green">Click to upload</span>
                  {' '}or drag and drop
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              JSON files up to 10MB
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File Validation */}
      {importValidation && (
        <div className={`border rounded-lg p-4 ${
          importValidation.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {importValidation.valid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h5 className={`font-medium ${
              importValidation.valid ? 'text-green-900' : 'text-red-900'
            }`}>
              {importValidation.valid ? 'Valid Template File' : 'Invalid Template File'}
            </h5>
          </div>

          <div className={`text-sm ${
            importValidation.valid ? 'text-green-800' : 'text-red-800'
          }`}>
            <div>Version: {importValidation.version}</div>
            <div>Templates: {importValidation.templateCount}</div>
          </div>

          {importValidation.issues.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium text-red-900 mb-1">Issues:</div>
              <ul className="text-sm text-red-800 list-disc list-inside">
                {importValidation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {importValidation.preview.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-green-900 mb-1">Preview:</div>
              <div className="space-y-1">
                {importValidation.preview.map((template, index) => (
                  <div key={index} className="text-sm text-green-800">
                    • {template.name} ({template.fieldCount} fields)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Options */}
      {importValidation?.valid && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900">Import Options</h5>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duplicate Handling
            </label>
            <select
              value={importOptions.duplicateHandling}
              onChange={(e) => setImportOptions(prev => ({
                ...prev,
                duplicateHandling: e.target.value as ImportOptions['duplicateHandling']
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
            >
              <option value="skip">Skip duplicates</option>
              <option value="rename">Rename duplicates</option>
              <option value="replace">Replace existing</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.validateTemplates}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  validateTemplates: e.target.checked
                }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Validate templates before import</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.createBackup}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  createBackup: e.target.checked
                }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Create backup before import</span>
            </label>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`border rounded-lg p-4 ${
          importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h5 className={`font-medium ${
              importResult.success ? 'text-green-900' : 'text-red-900'
            }`}>
              Import {importResult.success ? 'Completed' : 'Failed'}
            </h5>
          </div>

          <div className={`text-sm ${
            importResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            <div>Imported: {importResult.imported} templates</div>
            <div>Skipped: {importResult.skipped} templates</div>
            {importResult.errors.length > 0 && (
              <div>Errors: {importResult.errors.length}</div>
            )}
          </div>

          {importResult.errors.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium text-red-900 mb-1">Errors:</div>
              <div className="space-y-1">
                {importResult.errors.slice(0, 3).map((error, index) => (
                  <div key={index} className="text-sm text-red-800">
                    {error.templateName}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderShareMode = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Share2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">Share Templates</h4>
        <p className="text-sm text-gray-600">
          Generate a shareable link for your templates (limited to 3 templates)
        </p>
      </div>

      {!sharingUrl ? (
        <button
          onClick={handleGenerateShare}
          className="w-full px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 flex items-center justify-center space-x-2"
        >
          <Share2 className="w-4 h-4" />
          <span>Generate Sharing Link</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sharing URL
            </label>
            <div className="flex">
              <input
                type="text"
                value={sharingUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sharingUrl);
                  // Show toast notification in real app
                }}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            This link expires in 30 days. Recipients can import these templates into their own instance.
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {mode === 'import' ? (
                  <Upload className="w-5 h-5 text-gray-600" />
                ) : mode === 'export' ? (
                  <Download className="w-5 h-5 text-gray-600" />
                ) : (
                  <Share2 className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {mode === 'import' ? 'Import Templates' : 
                   mode === 'export' ? 'Export Templates' : 'Share Templates'}
                </h2>
                <p className="text-sm text-gray-600">
                  {mode === 'import' ? 'Import templates from a file' :
                   mode === 'export' ? 'Export templates to a file' : 'Share templates with others'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1">
            <button
              onClick={() => setMode('export')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                mode === 'export'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setMode('import')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                mode === 'import'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Import
            </button>
            <button
              onClick={() => setMode('share')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                mode === 'share'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Share
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {mode === 'export' && renderExportMode()}
          {mode === 'import' && renderImportMode()}
          {mode === 'share' && renderShareMode()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            {mode === 'export' && (
              <button
                onClick={handleExport}
                disabled={selectedTemplates.size === 0 && templates.length > 0}
                className="px-4 py-2 bg-brand-green text-white rounded hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>
                  Export {selectedTemplates.size > 0 ? selectedTemplates.size : templates.length} Templates
                </span>
              </button>
            )}

            {mode === 'import' && (
              <button
                onClick={handleImport}
                disabled={!importValidation?.valid || isProcessing}
                className="px-4 py-2 bg-brand-green text-white rounded hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{isProcessing ? 'Importing...' : 'Import Templates'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
