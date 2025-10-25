import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Plus, Edit, Eye, Trash2, Link as LinkIcon,
  AlertCircle, CheckCircle, Printer, Settings, Tag,
  ArrowLeft, Save, X, Grid, List, Search, Filter
} from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { useLocation } from 'wouter';

// Types
interface PackageType {
  id: string;
  name: string;
  size: string;
  material: string;
  currentStock: number;
  reorderPoint: number;
  unitPrice: number;
  supplier?: string;
  labelTemplateId?: string;
  labelTemplate?: LabelTemplate;
  imageUrl?: string;
  tags?: string[];
}

interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  dimensions: { width: number; height: number };
  printEngine: 'PDF' | 'ZPL' | 'TSPL' | 'AUTO';
  elements: number;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const PackageTemplateMappingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load packages and templates
  useEffect(() => {
    loadPackagesAndTemplates();
  }, []);

  const loadPackagesAndTemplates = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockPackages: PackageType[] = [
        {
          id: 'pkg-xl-window',
          name: 'XL Windowed Box',
          size: '12x8x4',
          material: 'Cardboard',
          currentStock: 150,
          reorderPoint: 30,
          unitPrice: 2.50,
          supplier: 'Box Co',
          labelTemplateId: 'template-1',
          tags: ['box', 'windowed', 'large']
        },
        {
          id: 'pkg-4x4-shrink',
          name: '4x4 Heat Shrink Bag',
          size: '4x4',
          material: 'Heat Shrink Film',
          currentStock: 300,
          reorderPoint: 100,
          unitPrice: 0.35,
          supplier: 'Film Supply Co',
          labelTemplateId: undefined, // No template assigned!
          tags: ['bag', 'shrink', 'small']
        },
        {
          id: 'pkg-6x4-window',
          name: '6x4 Windowed Box',
          size: '6x4x3',
          material: 'Cardboard',
          currentStock: 200,
          reorderPoint: 50,
          unitPrice: 1.75,
          supplier: 'Box Co',
          labelTemplateId: 'template-2',
          tags: ['box', 'windowed', 'medium']
        },
        {
          id: 'pkg-small-bag',
          name: 'Small Paper Bag',
          size: '6x9',
          material: 'Kraft Paper',
          currentStock: 500,
          reorderPoint: 150,
          unitPrice: 0.25,
          supplier: 'Paper Products Inc',
          labelTemplateId: undefined, // No template assigned!
          tags: ['bag', 'paper', 'small']
        },
        {
          id: 'pkg-medium-box',
          name: 'Medium Box',
          size: '8x8x4',
          material: 'Cardboard',
          currentStock: 100,
          reorderPoint: 25,
          unitPrice: 1.95,
          supplier: 'Box Co',
          labelTemplateId: 'template-1',
          tags: ['box', 'standard', 'medium']
        },
        {
          id: 'pkg-baguette-sleeve',
          name: 'Baguette Sleeve',
          size: '20x4',
          material: 'Paper',
          currentStock: 250,
          reorderPoint: 75,
          unitPrice: 0.15,
          supplier: 'Paper Products Inc',
          labelTemplateId: undefined, // No template assigned!
          tags: ['sleeve', 'bread', 'specialty']
        }
      ];

      const mockTemplates: LabelTemplate[] = [
        {
          id: 'template-1',
          name: 'Standard Product Label',
          description: '3" x 2" product label with name, price, and barcode',
          dimensions: { width: 3, height: 2 },
          printEngine: 'AUTO',
          elements: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'template-2',
          name: 'Shipping Label',
          description: '4" x 6" shipping label with customer info',
          dimensions: { width: 4, height: 6 },
          printEngine: 'ZPL',
          elements: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'template-3',
          name: 'Ingredient Label',
          description: '2" x 1" label with ingredients and allergens',
          dimensions: { width: 2, height: 1 },
          printEngine: 'PDF',
          elements: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Map templates to packages
      const packagesWithTemplates = mockPackages.map(pkg => ({
        ...pkg,
        labelTemplate: mockTemplates.find(t => t.id === pkg.labelTemplateId)
      }));

      setPackages(packagesWithTemplates);
      setTemplates(mockTemplates);

    } catch (error) {
      toast.error('Failed to load packages and templates');
      console.error('Load error:', error);
    }
  };

  const handleAssignTemplate = (packageId: string, templateId: string) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === packageId) {
        const template = templates.find(t => t.id === templateId);
        return {
          ...pkg,
          labelTemplateId: templateId,
          labelTemplate: template
        };
      }
      return pkg;
    }));

    const packageName = packages.find(p => p.id === packageId)?.name;
    const templateName = templates.find(t => t.id === templateId)?.name;
    toast.success(`Assigned "${templateName}" to "${packageName}"`);
    setShowAssignModal(false);
  };

  const handleUnassignTemplate = (packageId: string) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === packageId) {
        return {
          ...pkg,
          labelTemplateId: undefined,
          labelTemplate: undefined
        };
      }
      return pkg;
    }));

    toast.success('Template unassigned from package');
  };

  const handleCreateTemplateForPackage = (pkg: PackageType) => {
    toast.success(`Creating new template for ${pkg.name}...`);
    // In real implementation, this would navigate to template editor with package context
    setLocation('/dashboard/vendor/labels/editor');
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.size.includes(searchQuery)
  );

  const packagesWithTemplates = filteredPackages.filter(pkg => pkg.labelTemplateId);
  const packagesWithoutTemplates = filteredPackages.filter(pkg => !pkg.labelTemplateId);

  return (
    <VendorDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setLocation('/dashboard/vendor/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Package Label Templates</h1>
              <p className="text-gray-600">Manage label templates for each packaging type</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateTemplateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setLocation('/dashboard/vendor/labels/editor')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Existing Template
              </Button>
            </div>

            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-2xl font-bold text-blue-700">{packages.length}</div>
            <div className="text-sm text-blue-600">Total Packages</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-2xl font-bold text-green-700">{packagesWithTemplates.length}</div>
            <div className="text-sm text-green-600">With Templates</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="text-2xl font-bold text-yellow-700">{packagesWithoutTemplates.length}</div>
            <div className="text-sm text-yellow-600">Need Templates</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-2xl font-bold text-purple-700">{templates.length}</div>
            <div className="text-sm text-purple-600">Available Templates</div>
          </Card>
        </div>

        {/* Packages Without Templates - Alert Section */}
        {packagesWithoutTemplates.length > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Action Required</h3>
                <p className="text-sm text-yellow-700">
                  {packagesWithoutTemplates.length} package{packagesWithoutTemplates.length > 1 ? 's' : ''} need{packagesWithoutTemplates.length === 1 ? 's' : ''} label template{packagesWithoutTemplates.length > 1 ? 's' : ''} assigned. 
                  Labels cannot be printed until templates are created and assigned.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Package List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => (
              <Card key={pkg.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">{pkg.size} • {pkg.material}</p>
                    </div>
                  </div>
                </div>

                {/* Template Assignment Status */}
                <div className="mb-4">
                  {pkg.labelTemplate ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Template Assigned</span>
                      </div>
                      <div className="text-sm text-green-700">{pkg.labelTemplate.name}</div>
                      <div className="text-xs text-green-600 mt-1">
                        {pkg.labelTemplate.dimensions.width}" × {pkg.labelTemplate.dimensions.height}" • 
                        {pkg.labelTemplate.printEngine}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">No Template</span>
                      </div>
                      <p className="text-xs text-yellow-700">
                        Create a template to enable label printing for this package
                      </p>
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                <div className="mb-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>In Stock:</span>
                    <span className="font-medium">{pkg.currentStock} units</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Unit Price:</span>
                    <span className="font-medium">${pkg.unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {pkg.labelTemplate ? (
                    <>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowAssignModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                      
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          toast.success(`Editing template: ${pkg.labelTemplate?.name}`);
                          setLocation('/dashboard/vendor/labels/editor');
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={() => handleUnassignTemplate(pkg.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                      onClick={() => handleCreateTemplateForPackage(pkg)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Template
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size/Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{pkg.name}</div>
                          <div className="text-xs text-gray-500">{pkg.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pkg.size}</div>
                      <div className="text-xs text-gray-500">{pkg.material}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pkg.currentStock}</div>
                      <div className="text-xs text-gray-500">${pkg.unitPrice}/unit</div>
                    </td>
                    <td className="px-6 py-4">
                      {pkg.labelTemplate ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">{pkg.labelTemplate.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {pkg.labelTemplate.dimensions.width}" × {pkg.labelTemplate.dimensions.height}"
                          </div>
                        </div>
                      ) : (
                        <Badge variant="destructive">No Template</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {pkg.labelTemplate ? (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setSelectedPackage(pkg);
                                setShowAssignModal(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleUnassignTemplate(pkg.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="bg-purple-500 hover:bg-purple-600"
                            onClick={() => handleCreateTemplateForPackage(pkg)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Create Template
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Assign Template Modal */}
        {showAssignModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    Assign Template to {selectedPackage.name}
                  </h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleAssignTemplate(selectedPackage.id, template.id)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <Badge variant="secondary">
                          {template.dimensions.width}" × {template.dimensions.height}"
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.elements} elements</span>
                        <span>{template.printEngine}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={() => {
                    setShowAssignModal(false);
                    handleCreateTemplateForPackage(selectedPackage);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template for This Package
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Create New Template</h3>
                  <button
                    onClick={() => setShowCreateTemplateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Choose Template Type</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'product', name: 'Product Label', desc: 'Name, price, ingredients', icon: Package },
                      { id: 'shipping', name: 'Shipping Label', desc: 'Address, tracking', icon: Printer },
                      { id: 'barcode', name: 'Barcode Label', desc: 'SKU, inventory', icon: Tag },
                      { id: 'custom', name: 'Custom Design', desc: 'Start from scratch', icon: Edit }
                    ].map(type => (
                      <button
                        key={type.id}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        onClick={() => {
                          toast.success(`Creating ${type.name}...`);
                          setShowCreateTemplateModal(false);
                          setLocation('/dashboard/vendor/labels/editor');
                        }}
                      >
                        <type.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-center">{type.name}</div>
                        <div className="text-xs text-gray-500 text-center mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button
                    onClick={() => {
                      setShowCreateTemplateModal(false);
                      setLocation('/dashboard/vendor/labels/editor');
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Open Visual Template Editor
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default PackageTemplateMappingPage;

