import React, { useState } from 'react';
import { MapPin, Upload, Grid, Users } from 'lucide-react';
import { ImageOverlayEditor } from './ImageOverlayEditor';

interface VendorAssignment {
  type: string;
  name: string;
  size: string;
}

interface StallStatus {
  status: string;
  zone: string;
  size: string;
}

interface LayoutWizardProps {
  eventId: string;
  eventTitle: string;
  floorPlanImage?: string;
  layoutMode?: 'grid' | 'image-overlay';
  gridRows?: number;
  gridColumns?: number;
  stallStatus?: Record<number, StallStatus>;
  vendorAssignments?: Record<number, VendorAssignment>;
  onUpdate?: (data: any) => void;
}

export function LayoutWizard({
  eventId,
  eventTitle,
  floorPlanImage: initialFloorPlanImage,
  layoutMode: initialLayoutMode = 'grid',
  gridRows: initialGridRows = 5,
  gridColumns: initialGridColumns = 8,
  stallStatus: initialStallStatus = {},
  vendorAssignments: initialVendorAssignments = {},
  onUpdate
}: LayoutWizardProps) {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'image-overlay'>(initialLayoutMode);
  const [floorPlanImage, setFloorPlanImage] = useState<string | undefined>(initialFloorPlanImage);
  const [gridRows, setGridRows] = useState(initialGridRows);
  const [gridColumns, setGridColumns] = useState(initialGridColumns);
  const [stallStatus, setStallStatus] = useState<Record<number, StallStatus>>(initialStallStatus);
  const [vendorAssignments, setVendorAssignments] = useState<Record<number, VendorAssignment>>(initialVendorAssignments);
  const [selectedTool, setSelectedTool] = useState('available');
  const [stallSize, setStallSize] = useState('10x10');
  const [selectedZone, setSelectedZone] = useState('zone-a');
  const [customZones, setCustomZones] = useState<Array<{name: string, color: string}>>([]);
  const [zoneAName, setZoneAName] = useState('Zone A');
  const [zoneBName, setZoneBName] = useState('Zone B');
  const [zoneCName, setZoneCName] = useState('Zone C');
  const [overlayElements, setOverlayElements] = useState<any[]>([]);

  // Helper functions for floor plan
  const getCellColor = (status: string): string => {
    switch (status) {
      case 'stall': return '#10b981';
      case 'walking-path': return '#93c5fd';
      case 'wall': return '#374151';
      case 'exit': return '#ef4444';
      case 'available':
      default: return '#e5e7eb';
    }
  };

  const getCellLabel = (status: string): string => {
    switch (status) {
      case 'stall': return 'S';
      case 'walking-path': return 'P';
      case 'wall': return 'W';
      case 'exit': return 'E';
      case 'available':
      default: return 'A';
    }
  };

  const handleCellClick = (index: number) => {
    const newStatus = selectedTool || 'available';
    const zone = selectedZone || 'zone-a';

    setStallStatus(prev => {
      const newStallStatus = {
        ...prev,
        [index]: { status: newStatus, zone: zone, size: stallSize }
      };

      // If placing a stall, assign a mock vendor if none exists
      let newVendorAssignments = { ...vendorAssignments };
      if (newStatus === 'stall' && !newVendorAssignments[index]) {
        // Generate a mock vendor assignment
        const vendorTypes = ['Baker', 'Honey', 'Vegetables', 'Artisan', 'Crafts'];
        const randomType = vendorTypes[Math.floor(Math.random() * vendorTypes.length)];
        const vendorNames = {
          'Baker': ['Sweet Treats Bakery', 'Artisan Bread Co.', 'Local Bakery'],
          'Honey': ['Golden Honey Co.', 'Bee Happy Honey', 'Pure Honey Co.'],
          'Vegetables': ['Fresh Farm Produce', 'Organic Greens', 'Local Garden'],
          'Artisan': ['Handmade Crafts', 'Artisan Works', 'Creative Studio'],
          'Crafts': ['Craft Corner', 'Handmade Goods', 'Artisan Crafts']
        };
        const randomName = vendorNames[randomType as keyof typeof vendorNames][Math.floor(Math.random() * vendorNames[randomType as keyof typeof vendorNames].length)];

        newVendorAssignments[index] = {
          type: randomType,
          name: randomName,
          size: stallSize
        };
      } else if (newStatus !== 'stall' && newVendorAssignments[index]) {
        // Remove vendor assignment if changing away from stall
        delete newVendorAssignments[index];
      }

      setVendorAssignments(newVendorAssignments);
      
      // Call update callback
      if (onUpdate) {
        onUpdate({
          layoutMode,
          floorPlanImage,
          gridRows,
          gridColumns,
          stallStatus: newStallStatus,
          vendorAssignments: newVendorAssignments
        });
      }

      return newStallStatus;
    });
  };

  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    // Clear cell on right-click
    setStallStatus(prev => {
      const newStallStatus = { ...prev };
      const newVendorAssignments = { ...vendorAssignments };

      // Remove both stall status and vendor assignment
      delete newStallStatus[index];
      delete newVendorAssignments[index];

      setVendorAssignments(newVendorAssignments);

      // Call update callback
      if (onUpdate) {
        onUpdate({
          layoutMode,
          floorPlanImage,
          gridRows,
          gridColumns,
          stallStatus: newStallStatus,
          vendorAssignments: newVendorAssignments
        });
      }

      return newStallStatus;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFloorPlanImage(url);
      if (onUpdate) {
        onUpdate({
          layoutMode,
          floorPlanImage: url,
          gridRows,
          gridColumns,
          stallStatus,
          vendorAssignments,
          overlayElements
        });
      }
    }
  };

  // Overlay element handlers
  const handleOverlayElementsChange = (elements: any[]) => {
    setOverlayElements(elements);
    if (onUpdate) {
      onUpdate({
        layoutMode,
        floorPlanImage,
        gridRows,
        gridColumns,
        stallStatus,
        vendorAssignments,
        overlayElements: elements
      });
    }
  };

  const handleVendorAssign = (elementId: string, vendor: any) => {
    console.log('Assigning vendor to element:', elementId, vendor);
    // Update overlay elements with vendor info
    setOverlayElements(prev => 
      prev.map(el => 
        el.id === elementId 
          ? { ...el, vendorId: vendor.id, vendorName: vendor.name, vendorType: vendor.type }
          : el
      )
    );
  };

  const handleVendorRemove = (elementId: string) => {
    console.log('Removing vendor from element:', elementId);
    // Remove vendor info from overlay element
    setOverlayElements(prev => 
      prev.map(el => 
        el.id === elementId 
          ? { ...el, vendorId: undefined, vendorName: undefined, vendorType: undefined }
          : el
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Layout Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Layout Creation Mode
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="layoutMode"
              value="grid"
              checked={layoutMode === 'grid'}
              onChange={(e) => setLayoutMode(e.target.value as 'grid' | 'image-overlay')}
              className="text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm">Grid Layout Builder</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="layoutMode"
              value="image-overlay"
              checked={layoutMode === 'image-overlay'}
              onChange={(e) => setLayoutMode(e.target.value as 'grid' | 'image-overlay')}
              className="text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm">Image Overlay Mode</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Choose between creating a grid-based layout or overlaying elements on an uploaded floor plan image
        </p>
      </div>

      {/* Floor Plan Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Venue Floor Plan (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-green transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Upload a venue floor plan image</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="floor-plan-upload"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="floor-plan-upload"
            className="mt-2 inline-block px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors cursor-pointer"
          >
            Upload Floor Plan
          </label>
        </div>
        {floorPlanImage && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Floor Plan Preview:</p>
            <img
              src={floorPlanImage}
              alt="Floor plan"
              className="w-full max-w-md rounded border"
            />
          </div>
        )}
      </div>

      {/* Grid Settings */}
      {layoutMode === 'grid' && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Grid Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grid Rows</label>
              <input
                type="number"
                min="3"
                max="20"
                value={gridRows}
                onChange={(e) => setGridRows(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                aria-label="Grid rows"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grid Columns</label>
              <input
                type="number"
                min="3"
                max="20"
                value={gridColumns}
                onChange={(e) => setGridColumns(parseInt(e.target.value) || 8)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                aria-label="Grid columns"
              />
            </div>
          </div>
        </div>
      )}

      {/* Layout Tools - Only show for grid mode */}
      {layoutMode === 'grid' && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Layout Tools</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Tool</label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                aria-label="Select layout tool"
              >
                <option value="available">Available (A)</option>
                <option value="stall">Stall (S)</option>
                <option value="walking-path">Walking Path (P)</option>
                <option value="wall">Wall (W)</option>
                <option value="exit">Exit (E)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stall Size</label>
              <select
                value={stallSize}
                onChange={(e) => setStallSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                aria-label="Select stall size"
              >
                <option value="5x5">5x5 ft</option>
                <option value="10x10">10x10 ft</option>
                <option value="10x15">10x15 ft</option>
                <option value="15x15">15x15 ft</option>
                <option value="20x20">20x20 ft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                aria-label="Select zone"
              >
                <option value="zone-a">{zoneAName}</option>
                <option value="zone-b">{zoneBName}</option>
                <option value="zone-c">{zoneCName}</option>
                {customZones.map((zone, index) => (
                  <option key={index} value={`custom-${index}`}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button
                type="button"
                onClick={() => {
                  const zoneName = prompt('Enter zone name:');
                  if (zoneName) {
                    setCustomZones(prev => [...prev, { name: zoneName, color: '#8B5CF6' }]);
                  }
                }}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Add Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Preview */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Layout Preview</h4>
        
        {/* Grid Mode Preview */}
        {layoutMode === 'grid' && (
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="grid gap-1 max-w-full overflow-auto" 
                 style={{ 
                   gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                   gridTemplateRows: `repeat(${gridRows}, 1fr)`
                 }}>
              {Array.from({ length: gridRows * gridColumns }, (_, index) => (
                <div
                  key={index}
                  className="w-8 h-8 border border-gray-400 rounded cursor-pointer flex items-center justify-center text-xs font-bold transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: getCellColor(stallStatus[index]?.status || 'available')
                  }}
                  onClick={() => handleCellClick(index)}
                  onContextMenu={(e) => handleRightClick(e, index)}
                  title={stallStatus[index]?.status === 'stall' && vendorAssignments[index]
                    ? `${vendorAssignments[index].name}\nType: ${vendorAssignments[index].type}\nSize: ${vendorAssignments[index].size}`
                    : `${getCellLabel(stallStatus[index]?.status || 'available')} - ${stallStatus[index]?.size || 'N/A'}`}
                >
                  {getCellLabel(stallStatus[index]?.status || 'available')}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Available (A)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Sold (S)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span>Walking Path (P)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span>Wall (W)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Exit (E)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click on grid cells to place the selected tool. Right-click to clear. Hover over sold stalls (S) to see vendor details.
            </p>
          </div>
        )}

        {/* Image Overlay Mode Preview */}
        {layoutMode === 'image-overlay' && (
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            {floorPlanImage ? (
              <ImageOverlayEditor
                floorPlanImage={floorPlanImage}
                selectedTool={selectedTool}
                stallSize={stallSize}
                selectedZone={selectedZone}
                vendorAssignments={vendorAssignments}
                onElementsChange={handleOverlayElementsChange}
                onVendorAssign={handleVendorAssign}
                onVendorRemove={handleVendorRemove}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg mb-2">📐 Image Overlay Mode</div>
                <p>Upload a floor plan image above to start placing elements on it.</p>
                <p className="text-sm mt-2">Once uploaded, you'll be able to click on the image to place stalls, paths, and other elements.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vendor Count Summary */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Vendor Registration Summary</h4>
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              // Only count vendors that have corresponding sold stalls in the grid
              const soldStalls = Object.keys(stallStatus).filter(
                index => stallStatus[parseInt(index)]?.status === 'stall'
              );

              const vendorCounts = soldStalls.reduce((acc: Record<string, number>, stallIndex) => {
                const vendor = vendorAssignments[parseInt(stallIndex)];
                if (vendor) {
                  acc[vendor.type] = (acc[vendor.type] || 0) + 1;
                }
                return acc;
              }, {});

              return Object.entries(vendorCounts).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold text-brand-green">{count}</div>
                  <div className="text-sm text-gray-600">{type}</div>
                </div>
              ));
            })()}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Vendors:</span>
              <span className="text-lg font-bold text-brand-green">
                {(() => {
                  const soldStalls = Object.keys(stallStatus).filter(
                    index => stallStatus[parseInt(index)]?.status === 'stall'
                  );
                  return soldStalls.filter(stallIndex => vendorAssignments[parseInt(stallIndex)]).length;
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-medium text-gray-700">Total Sold Stalls:</span>
              <span className="text-lg font-bold text-gray-600">
                {Object.keys(stallStatus).filter(
                  index => stallStatus[parseInt(index)]?.status === 'stall'
                ).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
