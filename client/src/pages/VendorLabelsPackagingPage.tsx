import React, { useState } from 'react';
import {
  Plus,
  Package,
  Printer,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  AlertCircle,
  Wand2,
  Box,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import CravendorWizard from '../components/ui/CravendorWizard';
import { getQuoteByCategory } from '../data/motivationalQuotes';

interface PackagingMaterial {
  id: string;
  name: string;
  size: string;
  width: number;
  height: number;
  depth?: number;
  material: string;
  stock: number;
  reorderPoint: number;
  unitPrice: number;
  supplier: string;
  assignedTemplate?: string;
  templateName?: string;
}

interface LabelTemplate {
  id: string;
  name: string;
  packageId: string;
  packageName: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  backgroundColor: string;
  elements: TemplateElement[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'barcode' | 'qr' | 'shape' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  rotation?: number;
}

const VendorLabelsPackagingPage: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<'welcome' | 'package' | 'template'>('welcome');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PackagingMaterial | null>(null);
  // Mock packaging data - in real app, load from inventory API
  const [packagingMaterials] = useState<PackagingMaterial[]>([
    {
      id: 'pkg-xl-window',
      name: 'XL Windowed Box',
      size: '12x8x4',
      width: 12,
      height: 8,
      depth: 4,
      material: 'Cardboard',
      stock: 150,
      reorderPoint: 25,
      unitPrice: 1.25,
      supplier: 'ABC Packaging',
      assignedTemplate: 'tmpl-xl-window',
      templateName: 'XL Windowed Bread Label'
    },
    {
      id: 'pkg-4x4-shrink',
      name: '4x4 Heat Shrink Bag',
      size: '4x4',
      width: 4,
      height: 4,
      material: 'Heat Shrink Film',
      stock: 300,
      reorderPoint: 50,
      unitPrice: 0.15,
      supplier: 'PackPro Supply'
    },
    {
      id: 'pkg-6x4-window',
      name: '6x4 Windowed Box',
      size: '6x4x3',
      width: 6,
      height: 4,
      depth: 3,
      material: 'Cardboard',
      stock: 200,
      reorderPoint: 30,
      unitPrice: 0.75,
      supplier: 'ABC Packaging',
      assignedTemplate: 'tmpl-6x4-window',
      templateName: 'Standard Pastry Label'
    },
    {
      id: 'pkg-small-bag',
      name: 'Small Paper Bag',
      size: '6x9',
      width: 6,
      height: 9,
      material: 'Kraft Paper',
      stock: 500,
      reorderPoint: 100,
      unitPrice: 0.08,
      supplier: 'EcoPack Co'
    },
    {
      id: 'pkg-medium-box',
      name: 'Medium Box',
      size: '8x8x4',
      width: 8,
      height: 8,
      depth: 4,
      material: 'Cardboard',
      stock: 100,
      reorderPoint: 20,
      unitPrice: 0.95,
      supplier: 'ABC Packaging'
    },
    {
      id: 'pkg-baguette-sleeve',
      name: 'Baguette Sleeve',
      size: '20x4',
      width: 20,
      height: 4,
      material: 'Paper',
      stock: 250,
      reorderPoint: 50,
      unitPrice: 0.12,
      supplier: 'BreadPack Pro',
      assignedTemplate: 'tmpl-baguette',
      templateName: 'Baguette Wrap Label'
    }
  ]);

  const [labelTemplates] = useState<LabelTemplate[]>([
    {
      id: 'tmpl-xl-window',
      name: 'XL Windowed Bread Label',
      packageId: 'pkg-xl-window',
      packageName: 'XL Windowed Box',
      width: 12,
      height: 8,
      orientation: 'landscape',
      backgroundColor: '#FFFFFF',
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tmpl-6x4-window',
      name: 'Standard Pastry Label',
      packageId: 'pkg-6x4-window',
      packageName: '6x4 Windowed Box',
      width: 6,
      height: 4,
      orientation: 'landscape',
      backgroundColor: '#FFFBF5',
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tmpl-baguette',
      name: 'Baguette Wrap Label',
      packageId: 'pkg-baguette-sleeve',
      packageName: 'Baguette Sleeve',
      width: 20,
      height: 4,
      orientation: 'landscape',
      backgroundColor: '#F7F2EC',
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const filteredPackaging = packagingMaterials.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTemplate = (pkg: PackagingMaterial) => {
    setSelectedPackage(pkg);
    setShowWizard(true);
    setWizardStep('template');
  };

  const handleEditTemplate = (template: LabelTemplate) => {
    const pkg = packagingMaterials.find(p => p.id === template.packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setShowWizard(true);
      setWizardStep('template');
    }
  };

  const handleDuplicateTemplate = (template: LabelTemplate) => {
    toast.success(`Duplicating template: ${template.name}`);
    // In real app, would create a copy
  };

  if (!showWizard) {
    return (
      <VendorDashboardLayout>
        <div className="p-6 bg-white min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <DashboardHeader 
              title="Labels & Packaging"
              description="Manage packaging materials and create custom label templates for each package type"
            />

            {/* Motivational Quote */}
            <MotivationalQuote
              quote={getQuoteByCategory('innovation').quote}
              author={getQuoteByCategory('innovation').author}
              icon={getQuoteByCategory('innovation').icon}
              variant={getQuoteByCategory('innovation').variant}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Package Types</p>
                    <p className="text-2xl font-bold text-gray-900">{packagingMaterials.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Tag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{labelTemplates.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assigned Templates</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {packagingMaterials.filter(p => p.assignedTemplate).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Needs Template</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {packagingMaterials.filter(p => !p.assignedTemplate).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowWizard(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  >
                    <Wand2 className="w-5 h-5" />
                    Label & Package Wizard
                  </button>

                  <input
                    type="text"
                    placeholder="Search packaging..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            {/* Packaging Materials List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F7F2EC] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPackaging.map((pkg, index) => (
                    <tr key={pkg.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFFBF5]'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Box className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{pkg.name}</div>
                            <div className="text-xs text-gray-500">{pkg.supplier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pkg.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pkg.material}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          pkg.stock <= pkg.reorderPoint ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {pkg.stock} units
                        </span>
                        {pkg.stock <= pkg.reorderPoint && (
                          <span className="ml-2 text-xs text-red-600">⚠️ Low</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {pkg.assignedTemplate ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-900">{pkg.templateName}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3" />
                            No Template
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center gap-1">
                          {pkg.assignedTemplate ? (
                            <>
                              <button
                                onClick={() => {
                                  const template = labelTemplates.find(t => t.id === pkg.assignedTemplate);
                                  if (template) handleEditTemplate(template);
                                }}
                                className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                title="Edit template"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const template = labelTemplates.find(t => t.id === pkg.assignedTemplate);
                                  if (template) handleDuplicateTemplate(template);
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                title="Duplicate template"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toast('Preview functionality coming soon')}
                                className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                                title="Preview template"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCreateTemplate(pkg)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Create Template
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  // Wizard view
  return (
    <VendorDashboardLayout>
      <div className="p-6 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          {wizardStep === 'welcome' && (
            <CravendorWizard title="Ah, the artisan seeks to brand their wares!">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  Welcome to the <strong>Labels & Packaging Wizard</strong>, where your creations receive their final flourish. 
                  Every package tells a story, every label bears your mark of quality.
                </p>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  I am <strong>Cravendor</strong>, keeper of templates and guardian of presentation. Together, we shall craft 
                  labels that honor your artistry and guide your customers.
                </p>
                <p className="text-xl text-gray-800 font-semibold mt-8">
                  Shall we begin forging your label templates?
                </p>
                <button
                  onClick={() => setWizardStep('package')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  Begin the Craft
                  <Wand2 className="h-5 w-5" />
                </button>
              </div>
            </CravendorWizard>
          )}

          {wizardStep === 'package' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Package Type</h2>
              <p className="text-gray-600 mb-6">Choose the packaging material you want to create a label template for.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packagingMaterials.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setWizardStep('template');
                    }}
                    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Box className="h-6 w-6 text-purple-600" />
                      <span className="font-semibold text-gray-900">{pkg.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">Size: {pkg.size}</div>
                    <div className="text-sm text-gray-600">Material: {pkg.material}</div>
                    {pkg.assignedTemplate && (
                      <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Has template: {pkg.templateName}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowWizard(false);
                  setWizardStep('welcome');
                }}
                className="mt-6 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {wizardStep === 'template' && selectedPackage && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Label Template
              </h2>
              <p className="text-gray-600 mb-6">
                For: <strong>{selectedPackage.name}</strong> ({selectedPackage.size})
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>🎨 Advanced Template Builder:</strong> This powerful visual editor will allow you to create 
                  professional labels with drag-and-drop elements, custom fonts, barcodes, QR codes, images, and more. 
                  The template builder is coming in the next phase of development.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={`e.g., ${selectedPackage.name} Label`}
                    title="Enter template name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" title="Select orientation">
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      defaultValue="#FFFFFF"
                      className="w-full h-10 border border-gray-300 rounded-lg"
                      title="Select background color"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <Printer className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Builder Placeholder</h3>
                  <p className="text-sm text-gray-600">
                    The advanced visual template builder will be integrated here. You'll be able to:
                  </p>
                  <ul className="text-left text-sm text-gray-600 mt-4 space-y-2 max-w-md mx-auto">
                    <li>• Drag and drop elements (text, images, shapes)</li>
                    <li>• Add barcodes and QR codes</li>
                    <li>• Use dynamic fields (product name, price, date, etc.)</li>
                    <li>• Import logos and custom graphics</li>
                    <li>• Preview before saving</li>
                    <li>• Save templates for reuse</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-6 border-t">
                  <button
                    onClick={() => setWizardStep('package')}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Template created for ${selectedPackage.name}!`);
                      setShowWizard(false);
                      setWizardStep('welcome');
                      setSelectedPackage(null);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorLabelsPackagingPage;

