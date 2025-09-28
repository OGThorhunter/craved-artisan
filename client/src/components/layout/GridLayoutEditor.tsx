import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Minus, Settings, Eye, EyeOff } from 'lucide-react';
import type { EventLayout, Zone, Stall, GridPosition } from '@/lib/api/layout';
import { ZONE_COLORS, STALL_STATUS_COLORS } from '@/lib/api/layout';

interface GridLayoutEditorProps {
  layout: EventLayout;
  onGridConfigChange: (config: any) => void;
  onStallClick: (stall: Stall) => void;
}

export function GridLayoutEditor({ layout, onGridConfigChange, onStallClick }: GridLayoutEditorProps) {
  const [showGrid, setShowGrid] = useState(layout.showGrid ?? true);
  const [showAisles, setShowAisles] = useState(layout.showAisles ?? true);
  const [showNumbers, setShowNumbers] = useState(layout.showNumbers ?? true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const rows = layout.gridRows || 10;
  const columns = layout.gridColumns || 12;
  const aisleWidth = layout.aisleWidth || 6;
  const cellWidth = layout.cellWidth || 10;
  const cellHeight = layout.cellHeight || 10;

  // Create grid positions
  const gridPositions = useMemo(() => {
    const positions: GridPosition[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        positions.push({ row, column: col });
      }
    }
    return positions;
  }, [rows, columns]);

  // Find stall at position
  const getStallAtPosition = useCallback((row: number, column: number) => {
    return (layout.stalls || []).find(stall => 
      stall.row === row && stall.column === column
    );
  }, [layout.stalls]);

  // Find zone for position
  const getZoneForPosition = useCallback((row: number, column: number) => {
    return (layout.zones || []).find(zone => 
      zone.startRow && zone.endRow && zone.startColumn && zone.endColumn &&
      row >= zone.startRow && row <= zone.endRow &&
      column >= zone.startColumn && column <= zone.endColumn
    );
  }, [layout.zones]);

  // Calculate grid size
  const gridSize = useMemo(() => {
    const totalWidth = columns * cellWidth + (columns - 1) * aisleWidth;
    const totalHeight = rows * cellHeight + (rows - 1) * aisleWidth;
    return { width: totalWidth, height: totalHeight };
  }, [rows, columns, cellWidth, cellHeight, aisleWidth]);

  const handleCellClick = useCallback((row: number, column: number) => {
    const stall = getStallAtPosition(row, column);
    if (stall) {
      onStallClick(stall);
    } else {
      // Create new stall
      const zone = getZoneForPosition(row, column);
      const stallNumber = `${zone?.numberingPrefix || 'S'}${row}-${column}`;
      
      onStallClick({
        id: `stall_${row}_${column}`,
        layoutId: layout.id,
        zoneId: zone?.id,
        number: stallNumber,
        row,
        column,
        stallType: 'STALL',
        basePrice: zone?.basePrice || 0,
        totalPrice: zone?.basePrice || 0,
        features: zone?.features || [],
        status: 'AVAILABLE',
        isBlocked: false,
        surcharges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Stall);
    }
  }, [getStallAtPosition, getZoneForPosition, layout.id, onStallClick]);

  const handleZoneSelect = useCallback((zoneId: string | null) => {
    setSelectedZone(zoneId);
  }, []);

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Grid:</label>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Aisles:</label>
            <button
              onClick={() => setShowAisles(!showAisles)}
              className={`p-2 rounded-lg transition-colors ${
                showAisles ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showAisles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Numbers:</label>
            <button
              onClick={() => setShowNumbers(!showNumbers)}
              className={`p-2 rounded-lg transition-colors ${
                showNumbers ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGridConfigChange({ gridRows: rows + 1 })}
            className="p-2 bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-colors"
            title="Add row"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridConfigChange({ gridRows: Math.max(1, rows - 1) })}
            className="p-2 bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-colors"
            title="Remove row"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridConfigChange({ gridColumns: columns + 1 })}
            className="p-2 bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-colors"
            title="Add column"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridConfigChange({ gridColumns: Math.max(1, columns - 1) })}
            className="p-2 bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-colors"
            title="Remove column"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zone Legend */}
      {layout.zones && layout.zones.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Zones</h3>
          <div className="flex flex-wrap gap-3">
            {(layout.zones as Zone[]).map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneSelect(selectedZone === zone.id ? null : zone.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  selectedZone === zone.id
                    ? 'border-brand-green bg-brand-green/10'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-sm font-medium">{zone.name}</span>
                <span className="text-xs text-gray-500">${zone.basePrice}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Grid */}
          <div
            className="relative border-2 border-gray-300"
            style={{
              width: `${gridSize.width}px`,
              height: `${gridSize.height}px`,
            }}
          >
            {gridPositions.map((position) => {
              const stall = getStallAtPosition(position.row, position.column);
              const zone = getZoneForPosition(position.row, position.column);
              const isSelected = selectedZone ? zone?.id === selectedZone : true;
              
              const x = (position.column - 1) * (cellWidth + aisleWidth);
              const y = (position.row - 1) * (cellHeight + aisleWidth);
              
              return (
                <div
                  key={`${position.row}-${position.column}`}
                  onClick={() => handleCellClick(position.row, position.column)}
                  className={`absolute border border-gray-300 cursor-pointer transition-all hover:shadow-md ${
                    stall ? 'border-2' : 'border'
                  } ${!isSelected ? 'opacity-50' : ''}`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${cellWidth}px`,
                    height: `${cellHeight}px`,
                    backgroundColor: stall 
                      ? STALL_STATUS_COLORS[stall.status] + '20'
                      : zone 
                        ? zone.color + '20' 
                        : '#f9fafb',
                    borderColor: stall 
                      ? STALL_STATUS_COLORS[stall.status]
                      : zone 
                        ? zone.color 
                        : '#d1d5db',
                  }}
                  title={stall ? `Stall ${stall.number} - ${stall.status}` : `Position ${position.row}-${position.column}`}
                >
                  {showNumbers && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {stall ? stall.number : `${position.row}-${position.column}`}
                      </span>
                    </div>
                  )}
                  
                  {stall && (
                    <div className="absolute top-1 right-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STALL_STATUS_COLORS[stall.status] }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Grid Lines */}
          {showGrid && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{
                width: `${gridSize.width}px`,
                height: `${gridSize.height}px`,
              }}
            >
              {/* Vertical lines */}
              {Array.from({ length: columns + 1 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * (cellWidth + aisleWidth)}
                  y1={0}
                  x2={i * (cellWidth + aisleWidth)}
                  y2={gridSize.height}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Horizontal lines */}
              {Array.from({ length: rows + 1 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i * (cellHeight + aisleWidth)}
                  x2={gridSize.width}
                  y2={i * (cellHeight + aisleWidth)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STALL_STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700 capitalize">
                {status.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Info */}
      <div className="mt-4 text-sm text-gray-600">
        Grid: {rows} × {columns} | Cell Size: {cellWidth} × {cellHeight} {layout.units} | 
        Total: {gridSize.width} × {gridSize.height} {layout.units}
      </div>
    </div>
  );
}
