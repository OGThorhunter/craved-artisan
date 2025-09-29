import React, { useState, useRef, useCallback } from 'react';
import { Trash2, Save, Download } from 'lucide-react';

interface OverlayElement {
  id: string;
  type: 'stall' | 'walking-path' | 'wall' | 'exit' | 'entrance';
  x: number;
  y: number;
  size: string;
  zone: string;
  vendorId?: string;
  vendorName?: string;
  vendorType?: string;
}

interface ImageOverlayEditorProps {
  floorPlanImage: string;
  selectedTool: string;
  stallSize: string;
  selectedZone: string;
  vendorAssignments: Record<number, any>;
  onElementsChange: (elements: OverlayElement[]) => void;
  onVendorAssign: (elementId: string, vendor: any) => void;
  onVendorRemove: (elementId: string) => void;
}

export function ImageOverlayEditor({
  floorPlanImage,
  selectedTool,
  stallSize,
  selectedZone,
  vendorAssignments,
  onElementsChange,
  onVendorAssign,
  onVendorRemove
}: ImageOverlayEditorProps) {
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Percentage of image width
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Percentage of image height
    
    // Only place elements if we have a valid tool selected
    if (selectedTool === 'available') return;
    
    const newElement: OverlayElement = {
      id: `element_${Date.now()}`,
      type: selectedTool as any,
      x,
      y,
      size: stallSize,
      zone: selectedZone
    };
    
    setElements(prev => {
      const newElements = [...prev, newElement];
      onElementsChange(newElements);
      return newElements;
    });
    
    console.log('Element placed:', newElement);
  }, [selectedTool, stallSize, selectedZone, onElementsChange]);

  const handleElementClick = useCallback((e: React.MouseEvent, element: OverlayElement) => {
    e.stopPropagation();
    setSelectedElement(element.id);
  }, []);

  const handleElementRightClick = useCallback((e: React.MouseEvent, element: OverlayElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    setElements(prev => {
      const newElements = prev.filter(el => el.id !== element.id);
      onElementsChange(newElements);
      return newElements;
    });
    
    if (selectedElement === element.id) {
      setSelectedElement(null);
    }
    
    console.log('Element removed:', element.id);
  }, [selectedElement, onElementsChange]);

  const handleDragStart = useCallback((e: React.MouseEvent, element: OverlayElement) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedElement(element.id);
    
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const elementRect = e.currentTarget.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top
    });
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    // Constrain to image bounds
    const constrainedX = Math.max(0, Math.min(95, x));
    const constrainedY = Math.max(0, Math.min(95, y));
    
    setElements(prev => {
      const newElements = prev.map(el => 
        el.id === selectedElement 
          ? { ...el, x: constrainedX, y: constrainedY }
          : el
      );
      onElementsChange(newElements);
      return newElements;
    });
  }, [isDragging, selectedElement, dragOffset, onElementsChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'stall': return '🏪';
      case 'walking-path': return '🚶';
      case 'wall': return '🧱';
      case 'exit': return '🚪';
      case 'entrance': return '🚶‍♂️';
      default: return '📍';
    }
  };

  const getElementColor = (type: string) => {
    switch (type) {
      case 'stall': return 'bg-green-500';
      case 'walking-path': return 'bg-blue-400';
      case 'wall': return 'bg-gray-600';
      case 'exit': return 'bg-red-500';
      case 'entrance': return 'bg-green-600';
      default: return 'bg-gray-400';
    }
  };

  const getElementSize = (size: string) => {
    switch (size) {
      case '5x5': return 'w-6 h-6';
      case '10x10': return 'w-8 h-8';
      case '15x15': return 'w-10 h-10';
      case '20x20': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const handleVendorAssign = (element: OverlayElement) => {
    // Find an available vendor to assign
    const availableVendors = Object.values(vendorAssignments).filter((vendor: any) => 
      !elements.some(el => el.vendorId === vendor.id)
    );
    
    if (availableVendors.length > 0) {
      const vendor = availableVendors[0];
      const updatedElement = { ...element, vendorId: vendor.id, vendorName: vendor.name, vendorType: vendor.type };
      
      setElements(prev => {
        const newElements = prev.map(el => el.id === element.id ? updatedElement : el);
        onElementsChange(newElements);
        return newElements;
      });
      
      onVendorAssign(element.id, vendor);
    }
  };

  const handleVendorRemove = (element: OverlayElement) => {
    setElements(prev => {
      const newElements = prev.map(el => 
        el.id === element.id 
          ? { ...el, vendorId: undefined, vendorName: undefined, vendorType: undefined }
          : el
      );
      onElementsChange(newElements);
      return newElements;
    });
    
    onVendorRemove(element.id);
  };

  const exportLayout = () => {
    const layoutData = {
      floorPlanImage,
      elements,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'layout-overlay.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Image Overlay Container */}
      <div className="relative border border-gray-300 rounded-lg bg-white overflow-hidden">
        <div className="relative">
          <img
            ref={imageRef}
            src={floorPlanImage}
            alt="Floor plan"
            className="w-full max-w-4xl mx-auto block"
            style={{ maxHeight: '600px', objectFit: 'contain' }}
            onClick={handleImageClick}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            title="Click to place elements, right-click to remove"
          />
          
          {/* Overlay Elements */}
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute ${getElementColor(element.type)} ${getElementSize(element.size)} rounded-full border-2 border-white shadow-lg cursor-move flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform ${
                selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => handleElementClick(e, element)}
              onContextMenu={(e) => handleElementRightClick(e, element)}
              onMouseDown={(e) => handleDragStart(e, element)}
              title={`${element.type} (${element.size}) - Zone: ${element.zone}${element.vendorName ? ` - Vendor: ${element.vendorName}` : ''}`}
            >
              {getElementIcon(element.type)}
            </div>
          ))}
          
          {/* Overlay Info */}
          <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 text-xs shadow-md">
            <div className="font-medium mb-1">Image Overlay Mode</div>
            <div>Click to place: {selectedTool}</div>
            <div>Size: {stallSize} | Zone: {selectedZone}</div>
            <div className="mt-2 text-gray-600">
              Elements: {elements.length} | 
              Stalls: {elements.filter(e => e.type === 'stall').length}
            </div>
          </div>
        </div>
      </div>

      {/* Element Management */}
      {elements.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Placed Elements ({elements.length})</h4>
            <div className="flex gap-2">
              <button
                onClick={exportLayout}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
              <button
                onClick={() => {
                  setElements([]);
                  onElementsChange([]);
                  setSelectedElement(null);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
            {elements.map((element) => (
              <div
                key={element.id}
                className={`p-3 rounded-lg border-2 ${
                  selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getElementIcon(element.type)}</span>
                    <span className="text-sm font-medium capitalize">{element.type}</span>
                  </div>
                  <button
                    onClick={(e) => handleElementRightClick(e, element)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove element"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  Size: {element.size} | Zone: {element.zone}
                </div>
                
                {element.type === 'stall' && (
                  <div className="space-y-1">
                    {element.vendorName ? (
                      <div className="text-xs">
                        <div className="font-medium text-green-700">{element.vendorName}</div>
                        <div className="text-gray-500">{element.vendorType}</div>
                        <button
                          onClick={() => handleVendorRemove(element)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove vendor
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVendorAssign(element)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Assign vendor
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Image Overlay Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click anywhere on the image to place the selected element</li>
          <li>• Right-click on an element to remove it</li>
          <li>• Drag elements to reposition them</li>
          <li>• Click on stall elements to assign vendors</li>
          <li>• Use the element management panel to view and manage all placed elements</li>
        </ul>
      </div>
    </div>
  );
}
