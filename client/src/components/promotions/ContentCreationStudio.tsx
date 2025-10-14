import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video,
  Type,
  Palette,
  Download,
  Upload,
  Copy,
  Trash2,
  Save,
  Eye,
  Layers,
  Move,
  RotateCw,
  Crop,
  Filter,
  Sparkles,
  Wand2,
  Grid3x3,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

// Content Creation Tools with Templates System
interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'background';
  content: any;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  style: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: string;
    borderRadius?: number;
    opacity?: number;
    rotation?: number;
  };
  locked: boolean;
  visible: boolean;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'social_post' | 'story' | 'product_showcase' | 'promotion' | 'event';
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'ALL';
  dimensions: { width: number; height: number };
  elements: TemplateElement[];
  thumbnail: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

interface ContentCreationStudioProps {
  onSave?: (content: any) => void;
  onPublish?: (content: any, platforms: string[]) => void;
  initialTemplate?: ContentTemplate;
}

const ContentCreationStudio: React.FC<ContentCreationStudioProps> = ({ 
  onSave, 
  onPublish, 
  initialTemplate 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<TemplateElement[]>(initialTemplate?.elements || []);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 }); // Instagram square
  const [activeTemplate, setActiveTemplate] = useState<ContentTemplate | null>(initialTemplate || null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<ContentTemplate[]>([]);
  
  // Tool states
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'shape'>('select');
  const [textProperties, setTextProperties] = useState({
    content: 'Your text here',
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#000000',
    fontWeight: 'normal',
    textAlign: 'left'
  });
  
  const [canvasHistory, setCanvasHistory] = useState<TemplateElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/vendor/content-templates');
      const data = await response.json();
      if (data.success) {
        setAvailableTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  // Built-in templates for immediate use
  const builtInTemplates: ContentTemplate[] = [
    {
      id: 'promo_discount',
      name: 'Discount Promotion',
      description: 'Eye-catching discount announcement',
      category: 'promotion',
      platform: 'ALL',
      dimensions: { width: 1080, height: 1080 },
      elements: [
        {
          id: 'bg_1',
          type: 'background',
          content: '#FF6B6B',
          position: { x: 0, y: 0 },
          dimensions: { width: 1080, height: 1080 },
          style: { backgroundColor: '#FF6B6B' },
          locked: false,
          visible: true
        },
        {
          id: 'text_1',
          type: 'text',
          content: '30% OFF',
          position: { x: 540, y: 400 },
          dimensions: { width: 300, height: 100 },
          style: {
            fontSize: 72,
            fontFamily: 'Arial Black',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center'
          },
          locked: false,
          visible: true
        },
        {
          id: 'text_2',
          type: 'text',
          content: 'Limited Time Only!',
          position: { x: 540, y: 550 },
          dimensions: { width: 400, height: 50 },
          style: {
            fontSize: 24,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            textAlign: 'center'
          },
          locked: false,
          visible: true
        }
      ],
      thumbnail: '/templates/thumbnails/promo_discount.png',
      tags: ['promotion', 'discount', 'sale'],
      isPublic: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'product_showcase',
      name: 'Product Showcase',
      description: 'Professional product display template',
      category: 'product_showcase',
      platform: 'INSTAGRAM',
      dimensions: { width: 1080, height: 1080 },
      elements: [
        {
          id: 'bg_2',
          type: 'background',
          content: '#F8F9FA',
          position: { x: 0, y: 0 },
          dimensions: { width: 1080, height: 1080 },
          style: { backgroundColor: '#F8F9FA' },
          locked: false,
          visible: true
        },
        {
          id: 'img_1',
          type: 'image',
          content: { src: '/placeholder-product.jpg', alt: 'Product Image' },
          position: { x: 190, y: 150 },
          dimensions: { width: 700, height: 500 },
          style: { borderRadius: 20 },
          locked: false,
          visible: true
        },
        {
          id: 'text_3',
          type: 'text',
          content: 'Fresh Artisan Bread',
          position: { x: 540, y: 750 },
          dimensions: { width: 600, height: 60 },
          style: {
            fontSize: 36,
            fontFamily: 'Georgia',
            color: '#2C3E50',
            textAlign: 'center',
            fontWeight: 'bold'
          },
          locked: false,
          visible: true
        },
        {
          id: 'text_4',
          type: 'text',
          content: 'Made with love, baked to perfection',
          position: { x: 540, y: 820 },
          dimensions: { width: 500, height: 40 },
          style: {
            fontSize: 18,
            fontFamily: 'Georgia',
            color: '#7F8C8D',
            textAlign: 'center'
          },
          locked: false,
          visible: true
        }
      ],
      thumbnail: '/templates/thumbnails/product_showcase.png',
      tags: ['product', 'showcase', 'professional'],
      isPublic: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'story_behind_business',
      name: 'Story Behind Business',
      description: 'Share your brand story template',
      category: 'story',
      platform: 'FACEBOOK',
      dimensions: { width: 1200, height: 630 },
      elements: [
        {
          id: 'bg_3',
          type: 'background',
          content: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: { x: 0, y: 0 },
          dimensions: { width: 1200, height: 630 },
          style: { backgroundColor: '#667eea' },
          locked: false,
          visible: true
        },
        {
          id: 'text_5',
          type: 'text',
          content: 'Our Story',
          position: { x: 100, y: 100 },
          dimensions: { width: 400, height: 80 },
          style: {
            fontSize: 48,
            fontFamily: 'Georgia',
            color: '#FFFFFF',
            fontWeight: 'bold'
          },
          locked: false,
          visible: true
        },
        {
          id: 'text_6',
          type: 'text',
          content: 'From our kitchen to your table, every product tells a story of passion, quality, and artisanal craftsmanship.',
          position: { x: 100, y: 250 },
          dimensions: { width: 600, height: 200 },
          style: {
            fontSize: 24,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            textAlign: 'left'
          },
          locked: false,
          visible: true
        }
      ],
      thumbnail: '/templates/thumbnails/story_behind_business.png',
      tags: ['story', 'brand', 'personal'],
      isPublic: true,
      createdAt: new Date().toISOString()
    }
  ];

  // Initialize with built-in templates
  useEffect(() => {
    if (availableTemplates.length === 0) {
      setAvailableTemplates(builtInTemplates);
    }
  }, []);

  // Canvas drawing and interaction
  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElement]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw elements in order
    elements.forEach(element => {
      if (!element.visible) return;

      ctx.save();
      
      // Apply transformations
      ctx.translate(element.position.x, element.position.y);
      if (element.style.rotation) {
        ctx.rotate((element.style.rotation * Math.PI) / 180);
      }
      if (element.style.opacity) {
        ctx.globalAlpha = element.style.opacity;
      }

      switch (element.type) {
        case 'background':
          ctx.fillStyle = element.style.backgroundColor || element.content;
          ctx.fillRect(-element.position.x, -element.position.y, canvasSize.width, canvasSize.height);
          break;

        case 'text':
          ctx.fillStyle = element.style.color || '#000000';
          ctx.font = `${element.style.fontWeight || 'normal'} ${element.style.fontSize || 16}px ${element.style.fontFamily || 'Arial'}`;
          ctx.textAlign = (element.style.textAlign as CanvasTextAlign) || 'left';
          ctx.fillText(element.content, 0, 0);
          break;

        case 'image':
          // In a real implementation, you'd load and draw actual images
          ctx.fillStyle = '#E0E0E0';
          ctx.fillRect(0, 0, element.dimensions.width, element.dimensions.height);
          ctx.fillStyle = '#999';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Image', element.dimensions.width / 2, element.dimensions.height / 2);
          break;

        case 'shape':
          ctx.fillStyle = element.style.backgroundColor || '#000000';
          if (element.style.borderRadius) {
            // Draw rounded rectangle
            const radius = element.style.borderRadius;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(element.dimensions.width - radius, 0);
            ctx.quadraticCurveTo(element.dimensions.width, 0, element.dimensions.width, radius);
            ctx.lineTo(element.dimensions.width, element.dimensions.height - radius);
            ctx.quadraticCurveTo(element.dimensions.width, element.dimensions.height, element.dimensions.width - radius, element.dimensions.height);
            ctx.lineTo(radius, element.dimensions.height);
            ctx.quadraticCurveTo(0, element.dimensions.height, 0, element.dimensions.height - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(0, 0, element.dimensions.width, element.dimensions.height);
          }
          break;
      }

      // Draw selection outline
      if (selectedElement === element.id) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-5, -5, element.dimensions.width + 10, element.dimensions.height + 10);
      }

      ctx.restore();
    });
  };

  // Add text element
  const addTextElement = () => {
    const newElement: TemplateElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      content: textProperties.content,
      position: { x: canvasSize.width / 2 - 100, y: canvasSize.height / 2 },
      dimensions: { width: 200, height: 50 },
      style: {
        fontSize: textProperties.fontSize,
        fontFamily: textProperties.fontFamily,
        color: textProperties.color,
        fontWeight: textProperties.fontWeight,
        textAlign: textProperties.textAlign
      },
      locked: false,
      visible: true
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    saveToHistory();
  };

  // Add image element
  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newElement: TemplateElement = {
            id: `image_${Date.now()}`,
            type: 'image',
            content: { src: e.target?.result, alt: file.name },
            position: { x: 100, y: 100 },
            dimensions: { width: 300, height: 200 },
            style: {},
            locked: false,
            visible: true
          };
          
          setElements(prev => [...prev, newElement]);
          setSelectedElement(newElement.id);
          saveToHistory();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Add shape element
  const addShapeElement = (shapeType: 'rectangle' | 'circle') => {
    const newElement: TemplateElement = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      content: shapeType,
      position: { x: canvasSize.width / 2 - 75, y: canvasSize.height / 2 - 75 },
      dimensions: { width: 150, height: 150 },
      style: {
        backgroundColor: '#3B82F6',
        borderRadius: shapeType === 'circle' ? 75 : 10
      },
      locked: false,
      visible: true
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    saveToHistory();
  };

  // Save current state to history for undo/redo
  const saveToHistory = () => {
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo operation
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(canvasHistory[historyIndex - 1]);
    }
  };

  // Redo operation
  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(canvasHistory[historyIndex + 1]);
    }
  };

  // Update selected element properties
  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, style: { ...el.style, [property]: value } }
        : el
    ));
  };

  const updateElementContent = (content: any) => {
    if (!selectedElement) return;

    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, content }
        : el
    ));
  };

  // Delete selected element
  const deleteSelectedElement = () => {
    if (!selectedElement) return;

    setElements(prev => prev.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
    saveToHistory();
  };

  // Apply template
  const applyTemplate = (template: ContentTemplate) => {
    setElements(template.elements);
    setCanvasSize(template.dimensions);
    setActiveTemplate(template);
    setSelectedElement(null);
    setIsTemplateModalOpen(false);
    saveToHistory();
  };

  // Export canvas as image
  const exportAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `content_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Save as template
  const saveAsTemplate = async () => {
    const templateData = {
      name: `Custom Template ${Date.now()}`,
      description: 'Custom created template',
      category: 'social_post',
      platform: 'ALL',
      dimensions: canvasSize,
      elements: elements,
      tags: ['custom'],
      isPublic: false
    };

    try {
      const response = await fetch('/api/vendor/content-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        console.log('Template saved successfully');
        loadTemplates(); // Refresh templates list
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="h-screen flex">
      {/* Left Toolbar */}
      <div className="w-16 bg-gray-900 text-white flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setActiveTool('select')}
          className={`p-3 rounded-lg ${activeTool === 'select' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          title="Select Tool"
        >
          <Move className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveTool('text')}
          className={`p-3 rounded-lg ${activeTool === 'text' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          title="Add Text"
        >
          <Type className="w-5 h-5" />
        </button>
        
        <button
          onClick={addImageElement}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Add Image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => addShapeElement('rectangle')}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Add Rectangle"
        >
          <div className="w-5 h-3 border-2 border-current"></div>
        </button>
        
        <button
          onClick={() => addShapeElement('circle')}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Add Circle"
        >
          <div className="w-5 h-5 border-2 border-current rounded-full"></div>
        </button>

        <div className="flex-1"></div>

        <button
          onClick={undo}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Undo"
          disabled={historyIndex <= 0}
        >
          <RotateCw className="w-5 h-5 transform rotate-180" />
        </button>
        
        <button
          onClick={redo}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Redo"
          disabled={historyIndex >= canvasHistory.length - 1}
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 bg-white shadow-lg"
            style={{ 
              maxWidth: '80vh',
              maxHeight: '80vh',
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`
            }}
            onClick={(e) => {
              if (activeTool === 'text') {
                addTextElement();
              }
            }}
          />
          
          {/* Canvas Controls */}
          <div className="absolute top-4 left-4 flex space-x-2">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="bg-white px-3 py-1 rounded-md shadow text-sm hover:bg-gray-50"
            >
              Templates
            </button>
            <button
              onClick={exportAsImage}
              className="bg-white px-3 py-1 rounded-md shadow text-sm hover:bg-gray-50"
            >
              Export
            </button>
            <button
              onClick={saveAsTemplate}
              className="bg-white px-3 py-1 rounded-md shadow text-sm hover:bg-gray-50"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 space-y-6 overflow-y-auto">
        <h3 className="text-lg font-semibold">Properties</h3>
        
        {selectedEl ? (
          <div className="space-y-4">
            <h4 className="font-medium">Selected: {selectedEl.type}</h4>
            
            {/* Text Properties */}
            {selectedEl.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="text-content-input" className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    id="text-content-input"
                    value={selectedEl.content}
                    onChange={(e) => updateElementContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    title="Text content"
                    aria-label="Text content"
                  />
                </div>
                
                <div>
                  <label htmlFor="font-size-input" className="block text-sm font-medium mb-1">Font Size</label>
                  <input
                    id="font-size-input"
                    type="range"
                    min="12"
                    max="100"
                    value={selectedEl.style.fontSize || 16}
                    onChange={(e) => updateElementStyle('fontSize', parseInt(e.target.value))}
                    className="w-full"
                    title="Font size"
                    aria-label="Font size"
                  />
                  <span className="text-sm text-gray-500">{selectedEl.style.fontSize || 16}px</span>
                </div>
                
                <div>
                  <label htmlFor="font-family-select" className="block text-sm font-medium mb-1">Font Family</label>
                  <select
                    id="font-family-select"
                    value={selectedEl.style.fontFamily || 'Arial'}
                    onChange={(e) => updateElementStyle('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    title="Font family"
                    aria-label="Font family"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial Black">Arial Black</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="text-color-input" className="block text-sm font-medium mb-1">Color</label>
                  <input
                    id="text-color-input"
                    type="color"
                    value={selectedEl.style.color || '#000000'}
                    onChange={(e) => updateElementStyle('color', e.target.value)}
                    className="w-full h-10 border rounded-lg"
                    title="Text color"
                    aria-label="Text color"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateElementStyle('fontWeight', 'bold')}
                    className={`p-2 border rounded ${selectedEl.style.fontWeight === 'bold' ? 'bg-blue-100 border-blue-300' : ''}`}
                    title="Bold text"
                    aria-label="Bold text"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElementStyle('textAlign', 'left')}
                    className={`p-2 border rounded ${selectedEl.style.textAlign === 'left' ? 'bg-blue-100 border-blue-300' : ''}`}
                    title="Align left"
                    aria-label="Align left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElementStyle('textAlign', 'center')}
                    className={`p-2 border rounded ${selectedEl.style.textAlign === 'center' ? 'bg-blue-100 border-blue-300' : ''}`}
                    title="Align center"
                    aria-label="Align center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElementStyle('textAlign', 'right')}
                    className={`p-2 border rounded ${selectedEl.style.textAlign === 'right' ? 'bg-blue-100 border-blue-300' : ''}`}
                    title="Align right"
                    aria-label="Align right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* General Properties */}
            <div className="space-y-3">
              <div>
                <label htmlFor="opacity-input" className="block text-sm font-medium mb-1">Opacity</label>
                <input
                  id="opacity-input"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedEl.style.opacity || 1}
                  onChange={(e) => updateElementStyle('opacity', parseFloat(e.target.value))}
                  className="w-full"
                  title="Opacity"
                  aria-label="Opacity"
                />
                <span className="text-sm text-gray-500">{Math.round((selectedEl.style.opacity || 1) * 100)}%</span>
              </div>
              
              <div>
                <label htmlFor="rotation-input" className="block text-sm font-medium mb-1">Rotation</label>
                <input
                  id="rotation-input"
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedEl.style.rotation || 0}
                  onChange={(e) => updateElementStyle('rotation', parseInt(e.target.value))}
                  className="w-full"
                  title="Rotation"
                  aria-label="Rotation"
                />
                <span className="text-sm text-gray-500">{selectedEl.style.rotation || 0}°</span>
              </div>
            </div>

            <button
              onClick={deleteSelectedElement}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Element</span>
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select an element to edit properties</p>
          </div>
        )}

        {/* Canvas Size Controls */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Canvas Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCanvasSize({ width: 1080, height: 1080 })}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Instagram Square
            </button>
            <button
              onClick={() => setCanvasSize({ width: 1080, height: 1350 })}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Instagram Portrait
            </button>
            <button
              onClick={() => setCanvasSize({ width: 1200, height: 630 })}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Facebook Post
            </button>
            <button
              onClick={() => setCanvasSize({ width: 1080, height: 1920 })}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Story Format
            </button>
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Choose a Template</h3>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreationStudio;
