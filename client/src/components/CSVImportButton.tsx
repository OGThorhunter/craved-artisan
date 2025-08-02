import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CSVImportButtonProps {
  vendorId: string;
  onImportSuccess?: () => void;
}

const CSVImportButton: React.FC<CSVImportButtonProps> = ({ vendorId, onImportSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `/api/vendors/${vendorId}/financials/import/test`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );

      const { importedCount, totalRows, mapping } = response.data;
      
      toast.success(`✅ Successfully imported ${importedCount} of ${totalRows} records`);
      
      // Show mapping information
      console.log('Field mapping:', mapping);
      
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error: any) {
      console.error('CSV import error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to import CSV file';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="relative cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
        />
        <div className={`
          flex items-center justify-center px-4 py-2 rounded-lg border-2 border-dashed
          transition-all duration-200 ease-in-out
          ${isUploading 
            ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }
        `}>
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600 font-medium">
                Uploading... {uploadProgress}%
              </span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">
                Import CSV Financial Data
              </span>
            </>
          )}
        </div>
      </label>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center">
        <FileText className="h-3 w-3 inline mr-1" />
        Upload a CSV file with financial data (Revenue, COGS, Expenses, etc.)
      </div>
      
      <div className="text-xs text-gray-400 text-center">
        Supported columns: Date, Revenue, Cost of Goods Sold, Operating Expenses, Net Profit, Cash In, Cash Out, Assets, Liabilities, Equity, Notes
      </div>
    </div>
  );
};

export default CSVImportButton; 