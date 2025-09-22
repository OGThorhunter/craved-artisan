import React, { useState } from 'react';
import { Plus, Printer, Settings, Eye, Edit, Trash2, Copy } from 'lucide-react';

interface PrinterProfile {
  id: string;
  name: string;
  driver: string;
  dpi: number;
  maxWidthIn: number;
  maxHeightIn: number;
  networkAddress?: string;
  status: string;
  _count: {
    labelProfiles: number;
    labelJobs: number;
  };
}

interface LabelProfile {
  id: string;
  name: string;
  description?: string;
  widthIn: number;
  heightIn: number;
  orientation: string;
  engine: string;
  status: string;
  printerProfile: {
    name: string;
    driver: string;
    dpi: number;
  };
  template?: {
    title: string;
    version: string;
    status: string;
  };
  _count: {
    labelJobs: number;
  };
}

export default function LabelManagementPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'printers'>('profiles');
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<LabelProfile | null>(null);

  // Mock data - in real implementation, this would come from API
  const printerProfiles: PrinterProfile[] = [
    {
      id: '1',
      name: 'Zebra ZT230',
      driver: 'ZPL',
      dpi: 203,
      maxWidthIn: 4.0,
      maxHeightIn: 6.0,
      networkAddress: '192.168.1.100',
      status: 'ACTIVE',
      _count: { labelProfiles: 3, labelJobs: 45 }
    },
    {
      id: '2',
      name: 'Brother QL-820NWB',
      driver: 'BROTHER_QL',
      dpi: 300,
      maxWidthIn: 4.0,
      maxHeightIn: 6.0,
      networkAddress: '192.168.1.101',
      status: 'ACTIVE',
      _count: { labelProfiles: 2, labelJobs: 23 }
    }
  ];

  const labelProfiles: LabelProfile[] = [
    {
      id: '1',
      name: 'Standard Product Label 4×6',
      description: 'Standard product label for general use',
      widthIn: 4.0,
      heightIn: 6.0,
      orientation: 'PORTRAIT',
      engine: 'ZPL',
      status: 'ACTIVE',
      printerProfile: { name: 'Zebra ZT230', driver: 'ZPL', dpi: 203 },
      template: { title: 'Product Label Template', version: '1.2.0', status: 'PUBLISHED' },
      _count: { labelJobs: 45 }
    },
    {
      id: '2',
      name: 'Small Product Label 2×1',
      description: 'Compact label for small products',
      widthIn: 2.0,
      heightIn: 1.0,
      orientation: 'LANDSCAPE',
      engine: 'BROTHER_QL',
      status: 'ACTIVE',
      printerProfile: { name: 'Brother QL-820NWB', driver: 'BROTHER_QL', dpi: 300 },
      template: { title: 'Small Label Template', version: '1.0.0', status: 'PUBLISHED' },
      _count: { labelJobs: 23 }
    }
  ];

  const handlePrinterAction = (action: string, printer: PrinterProfile) => {
    console.log(`${action} printer ${printer.id}`);
    // Implement printer actions
  };

  const handleProfileAction = (action: string, profile: LabelProfile) => {
    console.log(`${action} profile ${profile.id}`);
    // Implement profile actions
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Label Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage printer profiles, label templates, and print jobs
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPrinterModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Add Printer
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Label Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profiles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profiles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Label Profiles
              </button>
              <button
                onClick={() => setActiveTab('printers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'printers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Printer Profiles
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Label Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Settings className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Profiles
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {labelProfiles.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Printer className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Profiles
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {labelProfiles.filter(p => p.status === 'ACTIVE').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Jobs
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {labelProfiles.reduce((sum, p) => sum + p._count.labelJobs, 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labelProfiles.map((profile) => (
                <div key={profile.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {profile.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.status}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-500">
                      {profile.description}
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium">{profile.widthIn}" × {profile.heightIn}"</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Printer:</span>
                        <span className="font-medium">{profile.printerProfile.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Engine:</span>
                        <span className="font-medium">{profile.engine}</span>
                      </div>
                      {profile.template && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Template:</span>
                          <span className="font-medium">{profile.template.title} v{profile.template.version}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Jobs:</span>
                        <span className="font-medium">{profile._count.labelJobs}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProfileAction('edit', profile)}
                          className="text-gray-600 hover:text-blue-600"
                          title="Edit profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleProfileAction('copy', profile)}
                          className="text-gray-600 hover:text-green-600"
                          title="Copy profile"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleProfileAction('preview', profile)}
                          className="text-gray-600 hover:text-purple-600"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleProfileAction('delete', profile)}
                        className="text-gray-600 hover:text-red-600"
                        title="Delete profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Printer Profiles Tab */}
        {activeTab === 'printers' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Printer className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Printers
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {printerProfiles.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Settings className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Printers
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {printerProfiles.filter(p => p.status === 'ACTIVE').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Jobs
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {printerProfiles.reduce((sum, p) => sum + p._count.labelJobs, 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Printers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {printerProfiles.map((printer) => (
                <div key={printer.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {printer.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        printer.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : printer.status === 'OFFLINE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {printer.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Driver:</span>
                        <span className="font-medium">{printer.driver}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">DPI:</span>
                        <span className="font-medium">{printer.dpi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Max Size:</span>
                        <span className="font-medium">{printer.maxWidthIn}" × {printer.maxHeightIn}"</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Network:</span>
                        <span className="font-medium">{printer.networkAddress || 'Not configured'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Profiles:</span>
                        <span className="font-medium">{printer._count.labelProfiles}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Jobs:</span>
                        <span className="font-medium">{printer._count.labelJobs}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePrinterAction('edit', printer)}
                          className="text-gray-600 hover:text-blue-600"
                          title="Edit printer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrinterAction('test', printer)}
                          className="text-gray-600 hover:text-green-600"
                          title="Test connection"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrinterAction('copy', printer)}
                          className="text-gray-600 hover:text-purple-600"
                          title="Copy printer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handlePrinterAction('delete', printer)}
                        className="text-gray-600 hover:text-red-600"
                        title="Delete printer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {/* TODO: Implement PrinterModal and ProfileModal components */}
    </div>
  );
}
