import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Settings,
  X,
  Save,
  Download,
  Upload
} from 'lucide-react';
import type { LabelTemplate } from '../../types/labels';
import { labelService } from '../../services/labelService';
import LabelDesigner from './LabelDesigner';

interface LabelTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: LabelTemplate) => void;
}

const LabelTemplateManager: React.FC<LabelTemplateManagerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [designerTemplate, setDesignerTemplate] = useState<LabelTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    const templateList = await labelService.getTemplates();
    setTemplates(templateList);
  };

  const handleCreateNew = () => {
    const newTemplate: LabelTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      description: 'Custom label template',
      width: 100,
      height: 60,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user'
    };
    setEditingTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleEdit = (template: LabelTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
  };

  const handleDesign = (template: LabelTemplate) => {
    setDesignerTemplate(template);
    setShowDesigner(true);
  };

  const handleDesignerSave = async (template: LabelTemplate) => {
    try {
      await labelService.saveTemplate(template);
      await loadTemplates();
      setShowDesigner(false);
      setDesignerTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDuplicate = async (template: LabelTemplate) => {
    try {
      const newName = `${template.name} (Copy)`;
      const duplicated = await labelService.duplicateTemplate(template.id, newName);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await labelService.deleteTemplate(templateId);
      await loadTemplates();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    try {
      await labelService.saveTemplate(editingTemplate);
      await loadTemplates();
      setIsEditing(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleSelect = (template: LabelTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Label Templates</h3>
            <p className="text-sm text-gray-600">Manage your label templates</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Template List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Templates</h4>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Template</span>
                </button>
              </div>

              <div className="space-y-3">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900">{template.name}</h5>
                          {template.isDefault && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{template.width}mm × {template.height}mm</span>
                          <span>{template.fields.length} fields</span>
                          <span>Updated {formatDate(template.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(template);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Use this template"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDesign(template);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Design template"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(template);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Edit template"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(template);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Duplicate template"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {!template.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(template.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No templates found</p>
                    <p className="text-sm">Create your first template to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Template Details/Editor */}
          <div className="w-1/2 overflow-y-auto">
            {isEditing && editingTemplate ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Edit Template</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingTemplate(null);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate(prev => 
                        prev ? { ...prev, name: e.target.value } : null
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Template name"
                      aria-label="Template name"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingTemplate.description || ''}
                      onChange={(e) => setEditingTemplate(prev => 
                        prev ? { ...prev, description: e.target.value } : null
                      )}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Template description"
                      aria-label="Template description"
                      placeholder="Enter template description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (mm)
                      </label>
                      <input
                        type="number"
                        value={editingTemplate.width}
                        onChange={(e) => setEditingTemplate(prev => 
                          prev ? { ...prev, width: parseInt(e.target.value) || 0 } : null
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Template width in millimeters"
                        aria-label="Template width in millimeters"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (mm)
                      </label>
                      <input
                        type="number"
                        value={editingTemplate.height}
                        onChange={(e) => setEditingTemplate(prev => 
                          prev ? { ...prev, height: parseInt(e.target.value) || 0 } : null
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Template height in millimeters"
                        aria-label="Template height in millimeters"
                        placeholder="60"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Fields ({editingTemplate.fields.length})
                    </h5>
                    <p className="text-sm text-gray-600">
                      Field editor will be available in Phase 2
                    </p>
                  </div>
                </div>
              </div>
            ) : selectedTemplate ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Template Details</h4>
                  <button
                    onClick={() => handleEdit(selectedTemplate)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Name</h5>
                    <p className="text-gray-900">{selectedTemplate.name}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Description</h5>
                    <p className="text-gray-900">{selectedTemplate.description || 'No description'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Dimensions</h5>
                      <p className="text-gray-900">{selectedTemplate.width}mm × {selectedTemplate.height}mm</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Fields</h5>
                      <p className="text-gray-900">{selectedTemplate.fields.length} fields</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Created</h5>
                    <p className="text-gray-900">{formatDate(selectedTemplate.createdAt)}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Last Updated</h5>
                    <p className="text-gray-900">{formatDate(selectedTemplate.updatedAt)}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSelect(selectedTemplate)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Use This Template</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a template to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Template</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this template? This will permanently remove it and cannot be undone.
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Label Designer Modal */}
        {showDesigner && (
          <LabelDesigner
            template={designerTemplate}
            onSave={handleDesignerSave}
            onClose={() => {
              setShowDesigner(false);
              setDesignerTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LabelTemplateManager;
