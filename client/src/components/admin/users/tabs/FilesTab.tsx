import React from 'react';
import { FileText, Upload, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface FilesTabProps {
  userId: string;
}

export default function FilesTab({ userId }: FilesTabProps) {
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Upload Document</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-sm text-gray-500">Supported: PDF, JPG, PNG (max 10MB)</p>
        </div>
      </Card>
      
      {/* Document Categories */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Documents by Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Identity Documents', count: 0, icon: FileText },
            { name: 'Business Licenses', count: 0, icon: FileText },
            { name: 'Tax Documents', count: 0, icon: FileText },
            { name: 'Insurance Certificates', count: 0, icon: FileText },
            { name: 'Permits', count: 0, icon: FileText },
            { name: 'Other', count: 0, icon: FileText }
          ].map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{category.count}</div>
              </button>
            );
          })}
        </div>
      </Card>
      
      {/* Documents List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">All Documents</h2>
        
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No documents uploaded</p>
          <p className="text-sm mt-1">Documents will appear here once uploaded</p>
        </div>
      </Card>
    </div>
  );
}

