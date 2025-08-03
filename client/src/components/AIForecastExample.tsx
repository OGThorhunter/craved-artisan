import React from 'react';
import AIForecastWidget from './AIForecastWidget';

interface AIForecastExampleProps {
  vendorId: string;
}

const AIForecastExample: React.FC<AIForecastExampleProps> = ({ vendorId }) => {
  return (
    <div className="space-y-6">
      {/* Dashboard Integration Example */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Forecast Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Forecast Widget */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Primary Forecast</h3>
            <AIForecastWidget 
              vendorId={vendorId} 
              months={12}
              className="h-full"
            />
          </div>
          
          {/* Quick Forecast Widget */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Forecast (3 months)</h3>
            <AIForecastWidget 
              vendorId={vendorId} 
              months={3}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Compact Widget Example */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Compact Widget</h2>
        <div className="max-w-md">
          <AIForecastWidget 
            vendorId={vendorId} 
            months={6}
            className="text-sm"
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Basic Usage:</strong></p>
          <code className="block bg-blue-100 p-2 rounded text-xs">
            {`<AIForecastWidget vendorId="your-vendor-id" />`}
          </code>
          
          <p><strong>With Custom Period:</strong></p>
          <code className="block bg-blue-100 p-2 rounded text-xs">
            {`<AIForecastWidget vendorId="your-vendor-id" months={6} />`}
          </code>
          
          <p><strong>With Custom Styling:</strong></p>
          <code className="block bg-blue-100 p-2 rounded text-xs">
            {`<AIForecastWidget vendorId="your-vendor-id" className="my-custom-class" />`}
          </code>
        </div>
      </div>
    </div>
  );
};

export default AIForecastExample; 