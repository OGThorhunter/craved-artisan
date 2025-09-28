import React from 'react';
import type { EventLayout, Stall } from '@/lib/api/layout';

interface ImageOverlayEditorProps {
  layout: EventLayout;
  onImageConfigChange: (config: any) => void;
  onStallClick: (stall: Stall) => void;
}

export function ImageOverlayEditor({ layout, onImageConfigChange, onStallClick }: ImageOverlayEditorProps) {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🖼️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Overlay Editor</h3>
        <p className="text-gray-600 mb-6">
          Upload a floor plan image and position stalls by dragging and dropping
        </p>
        
        {layout.backgroundImage ? (
          <div className="border border-gray-300 rounded-lg p-4 max-w-2xl mx-auto">
            <img
              src={layout.backgroundImage}
              alt="Floor plan"
              className="w-full h-auto"
            />
            <p className="text-sm text-gray-500 mt-2">
              Drag and drop stalls onto the image to position them
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-500 mb-4">No background image uploaded</p>
            <button
              onClick={() => onImageConfigChange({})}
              className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors"
            >
              Upload Floor Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
