import { EventEmitter } from 'events';
import { LabelRule, RulesProcessor } from '../rules-engine/rules-processor';
import { logger } from '../../logger';

export interface TemplateElement {
  id: string;
  type: ElementType;
  name: string;
  
  // Position and Size (in inches)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees
  
  // Visual Properties
  style: ElementStyle;
  
  // Content and Data
  content: ElementContent;
  
  // Behavior and Rules
  rules?: string[]; // Rule IDs that affect this element
  visibility?: VisibilityCondition;
  
  // Layout and Constraints
  constraints?: ElementConstraints;
  locked?: boolean;
  groupId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
}

export enum ElementType {
  TEXT = 'text',
  BARCODE = 'barcode',
  QR_CODE = 'qr_code',
  IMAGE = 'image',
  RECTANGLE = 'rectangle',
  LINE = 'line',
  CIRCLE = 'circle',
  TABLE = 'table',
  CONTAINER = 'container'
}

export interface ElementStyle {
  // Typography (for text elements)
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  lineHeight?: number;
  letterSpacing?: number;
  
  // Colors and Fills
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  
  // Effects and Shadows
  opacity?: number; // 0-1
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  
  // Barcode/QR specific
  barcodeFormat?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC_A';
  qrErrorCorrection?: 'L' | 'M' | 'Q' | 'H';
  moduleSize?: number;
  
  // Image specific
  imageScaling?: 'fit' | 'fill' | 'stretch' | 'center';
  imageFilter?: 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness';
}

export interface ElementContent {
  // Static content
  text?: string;
  imageUrl?: string;
  imageData?: Buffer;
  
  // Dynamic content (data binding)
  dataBinding?: DataBinding;
  
  // Calculated content (formulas)
  formula?: string;
  
  // Conditional content (rules-based)
  conditionalContent?: ConditionalContent[];
}

export interface DataBinding {
  field: string; // e.g., "order.customerName", "product.price"
  format?: string; // Format string for numbers, dates, etc.
  defaultValue?: any;
  transform?: string; // Transform function name
}

export interface ConditionalContent {
  condition: string; // Rule condition
  content: string | number | boolean;
  style?: Partial<ElementStyle>;
}

export interface VisibilityCondition {
  rules: string[]; // Rule IDs
  operator: 'AND' | 'OR';
  defaultVisible: boolean;
}

export interface ElementConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number; // width/height ratio to maintain
  snapToGrid?: boolean;
  snapTolerance?: number; // pixels
  allowResize?: boolean;
  allowMove?: boolean;
  allowRotate?: boolean;
}

export interface TemplateCanvas {
  id: string;
  name: string;
  description?: string;
  
  // Canvas Properties
  width: number; // inches
  height: number; // inches
  dpi: number;
  orientation: 'portrait' | 'landscape';
  
  // Design Properties
  backgroundColor: string;
  gridEnabled: boolean;
  gridSize: number; // inches
  snapToGrid: boolean;
  safeMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Elements and Layers
  elements: TemplateElement[];
  layers: TemplateLayer[];
  
  // Rules and Logic
  rules: string[]; // Associated rule IDs
  
  // Metadata
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  tags?: string[];
  category?: string;
}

export interface TemplateLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-1
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
  elementIds: string[];
  zIndex: number;
}

export interface EditOperation {
  id: string;
  type: OperationType;
  timestamp: Date;
  elementId?: string;
  oldState?: any;
  newState?: any;
  metadata?: Record<string, any>;
}

export enum OperationType {
  CREATE_ELEMENT = 'create_element',
  UPDATE_ELEMENT = 'update_element',
  DELETE_ELEMENT = 'delete_element',
  MOVE_ELEMENT = 'move_element',
  RESIZE_ELEMENT = 'resize_element',
  ROTATE_ELEMENT = 'rotate_element',
  CHANGE_STYLE = 'change_style',
  CHANGE_CONTENT = 'change_content',
  CREATE_LAYER = 'create_layer',
  UPDATE_LAYER = 'update_layer',
  DELETE_LAYER = 'delete_layer',
  REORDER_LAYERS = 'reorder_layers'
}

export interface PreviewOptions {
  sampleData?: Record<string, any>;
  applyRules?: boolean;
  showSafeArea?: boolean;
  showGrid?: boolean;
  zoom?: number; // 0.1 to 5.0
  highlightElement?: string; // Element ID to highlight
}

export interface PreviewResult {
  imageData: Buffer;
  format: 'PNG' | 'SVG' | 'PDF';
  width: number;
  height: number;
  dpi: number;
  warnings?: string[];
  appliedRules?: string[];
}

export class VisualEditor extends EventEmitter {
  private canvas: TemplateCanvas;
  private history: EditOperation[];
  private historyIndex: number;
  private maxHistorySize: number;
  private rulesProcessor: RulesProcessor;
  private elementLibrary: Map<string, TemplateElement>;
  
  constructor(canvas?: TemplateCanvas, maxHistorySize: number = 100) {
    super();
    
    this.canvas = canvas || this.createDefaultCanvas();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = maxHistorySize;
    this.rulesProcessor = new RulesProcessor();
    this.elementLibrary = new Map();
    
    this.initializeElementLibrary();
    
    logger.info('Visual editor initialized', {
      canvasId: this.canvas.id,
      canvasSize: `${this.canvas.width}" × ${this.canvas.height}"`,
      dpi: this.canvas.dpi
    });
  }

  /**
   * Add an element to the canvas
   */
  addElement(elementData: Partial<TemplateElement>): string {
    const element: TemplateElement = {
      id: this.generateElementId(),
      type: elementData.type || ElementType.TEXT,
      name: elementData.name || `${elementData.type || 'Element'} ${this.canvas.elements.length + 1}`,
      x: elementData.x || 0.5,
      y: elementData.y || 0.5,
      width: elementData.width || 1,
      height: elementData.height || 0.5,
      rotation: elementData.rotation || 0,
      style: { ...this.getDefaultStyle(elementData.type || ElementType.TEXT), ...elementData.style },
      content: elementData.content || this.getDefaultContent(elementData.type || ElementType.TEXT),
      rules: elementData.rules || [],
      constraints: elementData.constraints,
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags: elementData.tags
    };
    
    // Validate element bounds
    this.validateElementBounds(element);
    
    // Add to canvas
    this.canvas.elements.push(element);
    
    // Record operation
    this.recordOperation({
      type: OperationType.CREATE_ELEMENT,
      elementId: element.id,
      newState: element
    });
    
    logger.debug('Element added to canvas', {
      elementId: element.id,
      type: element.type,
      position: `(${element.x}, ${element.y})`,
      size: `${element.width} × ${element.height}`
    });
    
    this.emit('elementAdded', element);
    return element.id;
  }

  /**
   * Update an element on the canvas
   */
  updateElement(elementId: string, updates: Partial<TemplateElement>): boolean {
    const element = this.getElementById(elementId);
    if (!element || element.locked) {
      return false;
    }
    
    const oldState = { ...element };
    
    // Apply updates
    Object.assign(element, updates, {
      updatedAt: new Date(),
      version: element.version + 1
    });
    
    // Validate bounds if position/size changed
    if (updates.x !== undefined || updates.y !== undefined || 
        updates.width !== undefined || updates.height !== undefined) {
      this.validateElementBounds(element);
    }
    
    // Record operation
    this.recordOperation({
      type: OperationType.UPDATE_ELEMENT,
      elementId,
      oldState,
      newState: { ...element }
    });
    
    logger.debug('Element updated', {
      elementId,
      updatedFields: Object.keys(updates)
    });
    
    this.emit('elementUpdated', element, oldState);
    return true;
  }

  /**
   * Delete an element from the canvas
   */
  deleteElement(elementId: string): boolean {
    const elementIndex = this.canvas.elements.findIndex(e => e.id === elementId);
    if (elementIndex === -1) {
      return false;
    }
    
    const element = this.canvas.elements[elementIndex];
    if (element.locked) {
      return false;
    }
    
    // Remove from canvas
    this.canvas.elements.splice(elementIndex, 1);
    
    // Remove from any layers
    this.canvas.layers.forEach(layer => {
      const index = layer.elementIds.indexOf(elementId);
      if (index > -1) {
        layer.elementIds.splice(index, 1);
      }
    });
    
    // Record operation
    this.recordOperation({
      type: OperationType.DELETE_ELEMENT,
      elementId,
      oldState: element
    });
    
    logger.debug('Element deleted', { elementId });
    this.emit('elementDeleted', element);
    return true;
  }

  /**
   * Move element to new position
   */
  moveElement(elementId: string, x: number, y: number): boolean {
    const element = this.getElementById(elementId);
    if (!element || element.locked) {
      return false;
    }
    
    const oldPosition = { x: element.x, y: element.y };
    
    // Apply snap to grid if enabled
    if (this.canvas.snapToGrid) {
      x = Math.round(x / this.canvas.gridSize) * this.canvas.gridSize;
      y = Math.round(y / this.canvas.gridSize) * this.canvas.gridSize;
    }
    
    element.x = x;
    element.y = y;
    element.updatedAt = new Date();
    
    this.validateElementBounds(element);
    
    this.recordOperation({
      type: OperationType.MOVE_ELEMENT,
      elementId,
      oldState: oldPosition,
      newState: { x: element.x, y: element.y }
    });
    
    this.emit('elementMoved', element, oldPosition);
    return true;
  }

  /**
   * Resize element
   */
  resizeElement(elementId: string, width: number, height: number): boolean {
    const element = this.getElementById(elementId);
    if (!element || element.locked || !element.constraints?.allowResize) {
      return false;
    }
    
    const oldSize = { width: element.width, height: element.height };
    
    // Apply constraints
    if (element.constraints) {
      if (element.constraints.minWidth !== undefined) {
        width = Math.max(width, element.constraints.minWidth);
      }
      if (element.constraints.maxWidth !== undefined) {
        width = Math.min(width, element.constraints.maxWidth);
      }
      if (element.constraints.minHeight !== undefined) {
        height = Math.max(height, element.constraints.minHeight);
      }
      if (element.constraints.maxHeight !== undefined) {
        height = Math.min(height, element.constraints.maxHeight);
      }
      
      // Maintain aspect ratio if required
      if (element.constraints.aspectRatio) {
        const ratio = element.constraints.aspectRatio;
        if (Math.abs(width / height - ratio) > 0.01) {
          height = width / ratio;
        }
      }
    }
    
    element.width = width;
    element.height = height;
    element.updatedAt = new Date();
    
    this.validateElementBounds(element);
    
    this.recordOperation({
      type: OperationType.RESIZE_ELEMENT,
      elementId,
      oldState: oldSize,
      newState: { width: element.width, height: element.height }
    });
    
    this.emit('elementResized', element, oldSize);
    return true;
  }

  /**
   * Apply rules to canvas and update elements
   */
  async applyRules(context: Record<string, any>): Promise<void> {
    if (this.canvas.rules.length === 0) {
      return;
    }
    
    logger.debug('Applying rules to canvas', {
      canvasId: this.canvas.id,
      ruleCount: this.canvas.rules.length,
      contextKeys: Object.keys(context)
    });
    
    try {
      const ruleContext = {
        ...context,
        canvas: this.canvas,
        timestamp: new Date()
      };
      
      // Process rules for the entire canvas
      const result = await this.rulesProcessor.processRules(
        ruleContext,
        this.canvas,
        { enableProfiling: true }
      );
      
      // Apply rule results to elements
      for (const ruleResult of result.results) {
        if (ruleResult.executed && ruleResult.actionsApplied.length > 0) {
          await this.applyRuleActions(ruleResult.ruleId, ruleResult.actionsApplied);
        }
      }
      
      logger.debug('Rules applied successfully', {
        canvasId: this.canvas.id,
        rulesExecuted: result.results.filter(r => r.executed).length,
        totalExecutionTime: result.totalExecutionTimeMs
      });
      
      this.emit('rulesApplied', result);
      
    } catch (error) {
      logger.error('Failed to apply rules', {
        canvasId: this.canvas.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate preview of the canvas
   */
  async generatePreview(options: PreviewOptions = {}): Promise<PreviewResult> {
    logger.debug('Generating canvas preview', {
      canvasId: this.canvas.id,
      options
    });
    
    try {
      // Apply rules if requested
      if (options.applyRules && options.sampleData) {
        await this.applyRules(options.sampleData);
      }
      
      // Calculate canvas dimensions in pixels
      const pixelWidth = Math.round(this.canvas.width * this.canvas.dpi);
      const pixelHeight = Math.round(this.canvas.height * this.canvas.dpi);
      
      // Generate preview (mock implementation)
      const previewData = await this.renderCanvas(options);
      
      const result: PreviewResult = {
        imageData: previewData,
        format: 'PNG',
        width: pixelWidth,
        height: pixelHeight,
        dpi: this.canvas.dpi,
        warnings: this.validateCanvasForPreview(),
        appliedRules: this.canvas.rules
      };
      
      logger.debug('Preview generated successfully', {
        canvasId: this.canvas.id,
        dimensions: `${result.width}×${result.height}`,
        format: result.format,
        warningCount: result.warnings?.length || 0
      });
      
      this.emit('previewGenerated', result);
      return result;
      
    } catch (error) {
      logger.error('Preview generation failed', {
        canvasId: this.canvas.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Export canvas to various formats
   */
  async exportCanvas(format: 'JSON' | 'SVG' | 'PDF' | 'PNG'): Promise<{
    data: Buffer | string;
    mimeType: string;
    filename: string;
  }> {
    logger.debug('Exporting canvas', {
      canvasId: this.canvas.id,
      format
    });
    
    switch (format) {
      case 'JSON':
        const jsonData = JSON.stringify(this.canvas, null, 2);
        return {
          data: jsonData,
          mimeType: 'application/json',
          filename: `${this.canvas.name || 'template'}.json`
        };
      
      case 'SVG':
        const svgData = await this.generateSVG();
        return {
          data: svgData,
          mimeType: 'image/svg+xml',
          filename: `${this.canvas.name || 'template'}.svg`
        };
      
      case 'PDF':
      case 'PNG':
        const preview = await this.generatePreview({ zoom: 1.0 });
        return {
          data: preview.imageData,
          mimeType: format === 'PDF' ? 'application/pdf' : 'image/png',
          filename: `${this.canvas.name || 'template'}.${format.toLowerCase()}`
        };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Undo last operation
   */
  undo(): boolean {
    if (this.historyIndex < 0) {
      return false;
    }
    
    const operation = this.history[this.historyIndex];
    this.applyUndoOperation(operation);
    this.historyIndex--;
    
    logger.debug('Operation undone', {
      operationType: operation.type,
      elementId: operation.elementId
    });
    
    this.emit('operationUndone', operation);
    return true;
  }

  /**
   * Redo last undone operation
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) {
      return false;
    }
    
    this.historyIndex++;
    const operation = this.history[this.historyIndex];
    this.applyRedoOperation(operation);
    
    logger.debug('Operation redone', {
      operationType: operation.type,
      elementId: operation.elementId
    });
    
    this.emit('operationRedone', operation);
    return true;
  }

  /**
   * Get canvas state
   */
  getCanvas(): TemplateCanvas {
    return { ...this.canvas };
  }

  /**
   * Get element by ID
   */
  getElementById(elementId: string): TemplateElement | undefined {
    return this.canvas.elements.find(e => e.id === elementId);
  }

  /**
   * Get elements by type
   */
  getElementsByType(type: ElementType): TemplateElement[] {
    return this.canvas.elements.filter(e => e.type === type);
  }

  // Private helper methods

  private createDefaultCanvas(): TemplateCanvas {
    return {
      id: this.generateCanvasId(),
      name: 'New Template',
      width: 4,
      height: 6,
      dpi: 203,
      orientation: 'portrait',
      backgroundColor: '#ffffff',
      gridEnabled: true,
      gridSize: 0.125, // 1/8 inch
      snapToGrid: true,
      safeMargins: {
        top: 0.125,
        right: 0.125,
        bottom: 0.125,
        left: 0.125
      },
      elements: [],
      layers: [
        {
          id: 'default',
          name: 'Default Layer',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'normal',
          elementIds: [],
          zIndex: 0
        }
      ],
      rules: [],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private initializeElementLibrary(): void {
    // Initialize library with common element templates
    const textElement: TemplateElement = {
      id: 'lib_text',
      type: ElementType.TEXT,
      name: 'Text',
      x: 0, y: 0, width: 2, height: 0.5,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#000000'
      },
      content: { text: 'Sample Text' },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
    
    this.elementLibrary.set('text', textElement);
  }

  private getDefaultStyle(type: ElementType): ElementStyle {
    const baseStyle: ElementStyle = {
      color: '#000000',
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'none',
      opacity: 1
    };
    
    switch (type) {
      case ElementType.TEXT:
        return {
          ...baseStyle,
          fontFamily: 'Arial',
          fontSize: 12,
          fontWeight: 'normal',
          textAlign: 'left'
        };
      
      case ElementType.BARCODE:
        return {
          ...baseStyle,
          barcodeFormat: 'CODE128',
          moduleSize: 2
        };
      
      case ElementType.QR_CODE:
        return {
          ...baseStyle,
          qrErrorCorrection: 'M',
          moduleSize: 2
        };
      
      case ElementType.RECTANGLE:
        return {
          ...baseStyle,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: '#000000'
        };
      
      default:
        return baseStyle;
    }
  }

  private getDefaultContent(type: ElementType): ElementContent {
    switch (type) {
      case ElementType.TEXT:
        return { text: 'Text' };
      
      case ElementType.BARCODE:
        return { 
          text: '123456789',
          dataBinding: { field: 'product.sku', defaultValue: '123456789' }
        };
      
      case ElementType.QR_CODE:
        return { 
          text: 'https://example.com',
          dataBinding: { field: 'order.url', defaultValue: 'https://example.com' }
        };
      
      default:
        return {};
    }
  }

  private validateElementBounds(element: TemplateElement): void {
    // Ensure element stays within canvas bounds
    element.x = Math.max(0, Math.min(element.x, this.canvas.width - element.width));
    element.y = Math.max(0, Math.min(element.y, this.canvas.height - element.height));
    
    // Ensure positive dimensions
    element.width = Math.max(0.1, element.width);
    element.height = Math.max(0.1, element.height);
  }

  private recordOperation(operation: Omit<EditOperation, 'id' | 'timestamp'>): void {
    const fullOperation: EditOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: new Date()
    };
    
    // Remove any operations after current index (for redo)
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new operation
    this.history.push(fullOperation);
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.historyIndex = this.history.length - 1;
    }
  }

  private async applyRuleActions(ruleId: string, actions: any[]): Promise<void> {
    // Apply rule action results to canvas elements
    // This would implement the actual rule application logic
    logger.debug('Applying rule actions', { ruleId, actionCount: actions.length });
  }

  private validateCanvasForPreview(): string[] {
    const warnings: string[] = [];
    
    // Check for overlapping elements
    for (let i = 0; i < this.canvas.elements.length; i++) {
      for (let j = i + 1; j < this.canvas.elements.length; j++) {
        if (this.elementsOverlap(this.canvas.elements[i], this.canvas.elements[j])) {
          warnings.push(`Elements "${this.canvas.elements[i].name}" and "${this.canvas.elements[j].name}" overlap`);
        }
      }
    }
    
    // Check for elements outside safe margins
    this.canvas.elements.forEach(element => {
      if (element.x < this.canvas.safeMargins.left ||
          element.y < this.canvas.safeMargins.top ||
          element.x + element.width > this.canvas.width - this.canvas.safeMargins.right ||
          element.y + element.height > this.canvas.height - this.canvas.safeMargins.bottom) {
        warnings.push(`Element "${element.name}" is outside safe margins`);
      }
    });
    
    return warnings;
  }

  private elementsOverlap(a: TemplateElement, b: TemplateElement): boolean {
    return !(a.x + a.width <= b.x || 
             b.x + b.width <= a.x || 
             a.y + a.height <= b.y || 
             b.y + b.height <= a.y);
  }

  private async renderCanvas(options: PreviewOptions): Promise<Buffer> {
    // Mock canvas rendering - in real implementation, this would use
    // a rendering engine like Cairo, Skia, or HTML5 Canvas
    const mockImageData = Buffer.from('mock_image_data');
    return mockImageData;
  }

  private async generateSVG(): Promise<string> {
    // Mock SVG generation
    const svg = `
      <svg width="${this.canvas.width * 72}" height="${this.canvas.height * 72}" 
           viewBox="0 0 ${this.canvas.width * 72} ${this.canvas.height * 72}" 
           xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${this.canvas.backgroundColor}"/>
        ${this.canvas.elements.map(element => this.elementToSVG(element)).join('\n')}
      </svg>
    `;
    return svg.trim();
  }

  private elementToSVG(element: TemplateElement): string {
    // Convert element to SVG representation
    const x = element.x * 72; // Convert inches to points
    const y = element.y * 72;
    const width = element.width * 72;
    const height = element.height * 72;
    
    switch (element.type) {
      case ElementType.TEXT:
        return `<text x="${x}" y="${y + height/2}" 
                      font-family="${element.style.fontFamily}" 
                      font-size="${element.style.fontSize}" 
                      fill="${element.style.color}">
                  ${element.content.text || ''}
                </text>`;
      
      case ElementType.RECTANGLE:
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
                      fill="${element.style.backgroundColor}" 
                      stroke="${element.style.borderColor}" 
                      stroke-width="${element.style.borderWidth}"/>`;
      
      default:
        return `<!-- ${element.type} not implemented -->`;
    }
  }

  private applyUndoOperation(operation: EditOperation): void {
    switch (operation.type) {
      case OperationType.CREATE_ELEMENT:
        if (operation.elementId) {
          this.deleteElement(operation.elementId);
        }
        break;
      
      case OperationType.DELETE_ELEMENT:
        if (operation.oldState) {
          this.canvas.elements.push(operation.oldState);
        }
        break;
      
      case OperationType.UPDATE_ELEMENT:
        if (operation.elementId && operation.oldState) {
          const element = this.getElementById(operation.elementId);
          if (element) {
            Object.assign(element, operation.oldState);
          }
        }
        break;
    }
  }

  private applyRedoOperation(operation: EditOperation): void {
    switch (operation.type) {
      case OperationType.CREATE_ELEMENT:
        if (operation.newState) {
          this.canvas.elements.push(operation.newState);
        }
        break;
      
      case OperationType.DELETE_ELEMENT:
        if (operation.elementId) {
          const index = this.canvas.elements.findIndex(e => e.id === operation.elementId);
          if (index > -1) {
            this.canvas.elements.splice(index, 1);
          }
        }
        break;
      
      case OperationType.UPDATE_ELEMENT:
        if (operation.elementId && operation.newState) {
          const element = this.getElementById(operation.elementId);
          if (element) {
            Object.assign(element, operation.newState);
          }
        }
        break;
    }
  }

  private generateElementId(): string {
    return `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCanvasId(): string {
    return `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
