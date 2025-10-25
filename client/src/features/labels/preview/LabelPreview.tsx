import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Image, Transformer } from 'react-konva';
import Konva from 'konva';
import type { 
  LabelElement, 
  PreviewState, 
  LabelTemplateVariant,
  SampleData,
  Warning 
} from './types';
import { usePreviewEngine } from './usePreviewEngine';
import { dotsToCss, cssToDots, snapToGrid, isWithinSnapTolerance } from './units';
import { 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Ruler, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Download,
  FileText
} from 'lucide-react';

interface LabelPreviewProps {
  variant: LabelTemplateVariant;
  sample: SampleData;
  onElementUpdate?: (element: LabelElement) => void;
  onSelectionChange?: (id: string | undefined) => void;
}

export function LabelPreview({ 
  variant, 
  sample, 
  onElementUpdate, 
  onSelectionChange 
}: LabelPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    zoom: 1,
    showGrid: true,
    showRulers: true,
    showSafe: true,
    showBleed: true,
    selectedId: undefined
  });

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showPreflight, setShowPreflight] = useState(false);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    canvasSize,
    resolvedElements,
    warnings,
    validateElements,
    generatePreflightReport,
    exportToPNG,
    canvasRef
  } = usePreviewEngine({
    variant,
    sample,
    zoom: previewState.zoom,
    flags: {
      grid: previewState.showGrid,
      rulers: previewState.showRulers,
      safe: previewState.showSafe,
      bleed: previewState.showBleed
    },
    onSelectionChange: previewState.selectedId ? onSelectionChange : undefined
  });

  // Validate elements when they change
  useEffect(() => {
    validateElements();
  }, [validateElements]);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && previewState.selectedId) {
      const stage = stageRef.current;
      if (stage) {
        const selectedNode = stage.findOne(`#${previewState.selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [previewState.selectedId]);

  // Handle element selection
  const handleElementClick = useCallback((elementId: string) => {
    setPreviewState(prev => ({
      ...prev,
      selectedId: prev.selectedId === elementId ? undefined : elementId
    }));
    onSelectionChange?.(previewState.selectedId === elementId ? undefined : elementId);
  }, [previewState.selectedId, onSelectionChange]);

  // Handle element drag end
  const handleElementDragEnd = useCallback((elementId: string, newPos: { x: number; y: number }) => {
    const element = resolvedElements.find(el => el.id === elementId);
    if (!element) return;

    // Convert CSS pixels back to dots
    const dotsX = cssToDots(newPos.x, previewState.zoom);
    const dotsY = cssToDots(newPos.y, previewState.zoom);

    // Snap to grid if enabled
    const snappedX = previewState.showGrid ? snapToGrid(dotsX) : dotsX;
    const snappedY = previewState.showGrid ? snapToGrid(dotsY) : dotsY;

    const updatedElement = { ...element, x: snappedX, y: snappedY };
    onElementUpdate?.(updatedElement);
  }, [resolvedElements, previewState.zoom, previewState.showGrid, onElementUpdate]);

  // Handle zoom
  const handleZoom = useCallback((newZoom: number) => {
    setPreviewState(prev => ({ ...prev, zoom: Math.max(0.25, Math.min(4, newZoom)) }));
  }, []);

  // Handle panning
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) { // Middle mouse button only
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX - stagePos.x, y: e.evt.clientY - stagePos.y });
      e.evt.preventDefault();
    }
  }, [stagePos]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      const newPos = {
        x: e.evt.clientX - panStart.x,
        y: e.evt.clientY - panStart.y
      };
      setStagePos(newPos);
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.25, Math.min(4, newScale));
    
    setPreviewState(prev => ({ ...prev, zoom: clampedScale }));
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStagePos(newPos);
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    const blob = await exportToPNG();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label-${variant.name}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [exportToPNG, variant.name]);

  // Render text element
  const renderTextElement = useCallback((element: any) => {
    const x = dotsToCss(element.x, previewState.zoom);
    const y = dotsToCss(element.y, previewState.zoom);
    const width = dotsToCss(element.w || 100, previewState.zoom);
    const height = dotsToCss(element.h || 20, previewState.zoom);

    return (
      <Text
        key={element.id}
        id={element.id}
        x={x}
        y={y}
        width={width}
        height={height}
        text={element.text || ''}
        fontSize={element.fontSizePt * previewState.zoom}
        fontFamily={element.fontFamily}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : 'normal'}
        fill={element.color || '#000000'}
        align={element.align || 'left'}
        verticalAlign="top"
        wrap="word"
        ellipsis={true}
        onClick={() => handleElementClick(element.id)}
        draggable
        onDragEnd={(e) => {
          const newPos = {
            x: e.target.x(),
            y: e.target.y()
          };
          handleElementDragEnd(element.id, newPos);
        }}
      />
    );
  }, [previewState.zoom, handleElementClick, handleElementDragEnd]);

  // Render image element
  const renderImageElement = useCallback((element: any) => {
    const x = dotsToCss(element.x, previewState.zoom);
    const y = dotsToCss(element.y, previewState.zoom);
    const width = dotsToCss(element.w || 100, previewState.zoom);
    const height = dotsToCss(element.h || 100, previewState.zoom);

    return (
      <Image
        key={element.id}
        id={element.id}
        x={x}
        y={y}
        width={width}
        height={height}
        image={element.imageRef}
        onClick={() => handleElementClick(element.id)}
        draggable
        onDragEnd={(e) => {
          const newPos = {
            x: e.target.x(),
            y: e.target.y()
          };
          handleElementDragEnd(element.id, newPos);
        }}
      />
    );
  }, [previewState.zoom, handleElementClick, handleElementDragEnd]);

  // Render shape element
  const renderShapeElement = useCallback((element: any) => {
    const x = dotsToCss(element.x, previewState.zoom);
    const y = dotsToCss(element.y, previewState.zoom);
    const width = dotsToCss(element.w || 100, previewState.zoom);
    const height = dotsToCss(element.h || 100, previewState.zoom);

    if (element.shape === 'rect') {
      return (
        <Rect
          key={element.id}
          id={element.id}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth || 1}
          onClick={() => handleElementClick(element.id)}
          draggable
          onDragEnd={(e) => {
            const newPos = {
              x: e.target.x(),
              y: e.target.y()
            };
            handleElementDragEnd(element.id, newPos);
          }}
        />
      );
    }

    return null;
  }, [previewState.zoom, handleElementClick, handleElementDragEnd]);

  // Calculate stage dimensions
  const stageWidth = dotsToCss(canvasSize.wDots, previewState.zoom);
  const stageHeight = dotsToCss(canvasSize.hDots, previewState.zoom);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(previewState.zoom * 0.8)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(previewState.zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(previewState.zoom * 1.25)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPreviewState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
              className={`p-2 rounded ${previewState.showGrid ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={previewState.showGrid ? 'Hide grid' : 'Show grid'}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewState(prev => ({ ...prev, showRulers: !prev.showRulers }))}
              className={`p-2 rounded ${previewState.showRulers ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={previewState.showRulers ? 'Hide rulers' : 'Show rulers'}
            >
              <Ruler className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewState(prev => ({ ...prev, showSafe: !prev.showSafe }))}
              className={`p-2 rounded ${previewState.showSafe ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={previewState.showSafe ? 'Hide safe area' : 'Show safe area'}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Preflight Button */}
          <button
            onClick={() => setShowPreflight(!showPreflight)}
            className={`flex items-center space-x-2 px-3 py-2 rounded ${
              warnings.length > 0 
                ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Preflight {warnings.length > 0 && `(${warnings.length})`}
            </span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={previewState.zoom}
          scaleY={previewState.zoom}
          x={stagePos.x}
          y={stagePos.y}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Background Layer */}
          <Layer>
            {/* Paper Background */}
            <Rect
              x={0}
              y={0}
              width={canvasSize.wDots}
              height={canvasSize.hDots}
              fill="#ffffff"
              stroke="#e5e7eb"
              strokeWidth={1}
            />

            {/* Bleed Area */}
            {previewState.showBleed && canvasSize.bleedDots > 0 && (
              <Rect
                x={-canvasSize.bleedDots}
                y={-canvasSize.bleedDots}
                width={canvasSize.wDots + canvasSize.bleedDots * 2}
                height={canvasSize.hDots + canvasSize.bleedDots * 2}
                fill="rgba(255, 0, 0, 0.1)"
                stroke="rgba(255, 0, 0, 0.3)"
                strokeWidth={1}
                dash={[5, 5]}
              />
            )}

            {/* Safe Area */}
            {previewState.showSafe && canvasSize.safeDots > 0 && (
              <Rect
                x={canvasSize.safeDots}
                y={canvasSize.safeDots}
                width={canvasSize.wDots - canvasSize.safeDots * 2}
                height={canvasSize.hDots - canvasSize.safeDots * 2}
                fill="rgba(0, 255, 0, 0.1)"
                stroke="rgba(0, 255, 0, 0.3)"
                strokeWidth={1}
                dash={[5, 5]}
              />
            )}

            {/* Grid */}
            {previewState.showGrid && (
              <>
                {/* Vertical grid lines */}
                {Array.from({ length: Math.ceil(canvasSize.wDots / 8) }, (_, i) => (
                  <Rect
                    key={`v-${i}`}
                    x={i * 8}
                    y={0}
                    width={1}
                    height={canvasSize.hDots}
                    fill="#e5e7eb"
                    opacity={0.5}
                  />
                ))}
                {/* Horizontal grid lines */}
                {Array.from({ length: Math.ceil(canvasSize.hDots / 8) }, (_, i) => (
                  <Rect
                    key={`h-${i}`}
                    x={0}
                    y={i * 8}
                    width={canvasSize.wDots}
                    height={1}
                    fill="#e5e7eb"
                    opacity={0.5}
                  />
                ))}
              </>
            )}
          </Layer>

          {/* Elements Layer */}
          <Layer>
            {resolvedElements.map((element) => {
              switch (element.type) {
                case 'text':
                  return renderTextElement(element);
                case 'image':
                  return renderImageElement(element);
                case 'shape':
                  return renderShapeElement(element);
                default:
                  return null;
              }
            })}
          </Layer>

          {/* Selection Layer */}
          <Layer>
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>

      {/* Preflight Panel */}
      {showPreflight && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-h-64 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Preflight Report</h3>
              <button
                onClick={() => setShowPreflight(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close preflight panel"
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>
            
            {warnings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No issues found! Your label is ready for printing.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border-l-4 ${
                      warning.severity === 'error'
                        ? 'bg-red-50 border-red-400 text-red-800'
                        : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    }`}
                  >
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{warning.message}</p>
                        <p className="text-sm opacity-75">Element: {warning.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
