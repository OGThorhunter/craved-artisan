// import type { LabelTemplate, LabelData, LabelPrintJob, PrintSettings, LabelField } from '../types/labels.js';

// Temporary interfaces to test
interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  fields: LabelField[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface LabelField {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image' | 'line' | 'rectangle';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  alignment?: 'left' | 'center' | 'right';
  rotation?: number;
  dataSource?: string;
  format?: string;
}

interface LabelData {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  products: Array<{
    name: string;
    quantity: number;
    specifications?: string;
  }>;
  priority: string;
  expectedDelivery: string;
  trackingNumber?: string;
  barcode?: string;
  qrCode?: string;
  customFields?: Record<string, any>;
}

interface LabelPrintJob {
  id: string;
  templateId: string;
  orderIds: string[];
  copies: number;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface PrintSettings {
  printerName?: string;
  paperSize: 'A4' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  copies: number;
  quality: 'draft' | 'normal' | 'high';
}

class LabelService {
  private templates: LabelTemplate[] = [];
  private printJobs: LabelPrintJob[] = [];

  constructor() {
    this.loadTemplates();
    this.loadPrintJobs();
  }

  // Template Management
  async getTemplates(): Promise<LabelTemplate[]> {
    return this.templates;
  }

  async getTemplate(id: string): Promise<LabelTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }

  async saveTemplate(template: LabelTemplate): Promise<void> {
    const existingIndex = this.templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      this.templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      this.templates.push({ ...template, createdAt: new Date().toISOString() });
    }
    this.saveTemplates();
  }

  async deleteTemplate(id: string): Promise<void> {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveTemplates();
  }

  async duplicateTemplate(id: string, newName: string): Promise<LabelTemplate> {
    const original = await this.getTemplate(id);
    if (!original) throw new Error('Template not found');

    const duplicated: LabelTemplate = {
      ...original,
      id: `template-${Date.now()}`,
      name: newName,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: original.fields.map(field => ({
        ...field,
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    await this.saveTemplate(duplicated);
    return duplicated;
  }

  // Print Job Management
  async createPrintJob(templateId: string, orderIds: string[], copies: number = 1): Promise<LabelPrintJob> {
    const job: LabelPrintJob = {
      id: `job-${Date.now()}`,
      templateId,
      orderIds,
      copies,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.printJobs.push(job);
    this.savePrintJobs();
    return job;
  }

  async getPrintJobs(): Promise<LabelPrintJob[]> {
    return this.printJobs;
  }

  async executePrintJob(jobId: string, settings: PrintSettings): Promise<void> {
    const job = this.printJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Print job not found');

    job.status = 'printing';
    this.savePrintJobs();

    try {
      // Simulate printing process
      await this.simulatePrinting(job, settings);
      
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.savePrintJobs();
  }

  // Label Generation
  generateLabelData(order: any): LabelData {
    return {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerAddress: this.formatAddress(order.shippingAddress),
      products: order.items?.map((item: any) => ({
        name: item.productName || 'Unknown Product',
        quantity: item.quantity,
        specifications: item.specifications
      })) || [],
      priority: order.priority,
      expectedDelivery: order.expectedDeliveryDate,
      trackingNumber: order.trackingNumber,
      barcode: this.generateBarcode(order.orderNumber),
      qrCode: this.generateQRCode(order.id),
      customFields: {
        orderType: order.orderType,
        salesWindow: order.salesWindowId,
        assignedTo: order.assignedTo
      }
    };
  }

  // Print Preview
  async generatePrintPreview(template: LabelTemplate, data: LabelData): Promise<string> {
    // This would generate an HTML/CSS preview of the label
    // For now, return a mock preview
    return this.createLabelHTML(template, data);
  }

  // Private Methods
  private formatAddress(address: any): string {
    if (!address) return '';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`.trim();
  }

  private generateBarcode(data: string): string {
    // In a real implementation, this would generate an actual barcode
    return `*${data}*`;
  }

  private generateQRCode(data: string): string {
    // In a real implementation, this would generate an actual QR code
    return `QR:${data}`;
  }

  private createLabelHTML(template: LabelTemplate, data: LabelData): string {
    const scale = 3.7795275591; // mm to pixels conversion
    const width = template.width * scale;
    const height = template.height * scale;

    let html = `
      <div style="
        width: ${width}px;
        height: ${height}px;
        position: relative;
        border: 1px solid #ccc;
        background: white;
        font-family: Arial, sans-serif;
        overflow: hidden;
      ">
    `;

    template.fields.forEach(field => {
      const fieldData = this.getFieldData(field, data);
      const fieldStyle = this.getFieldStyle(field, scale);
      
      html += `
        <div style="${fieldStyle}">
          ${fieldData}
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  private getFieldData(field: LabelField, data: LabelData): string {
    if (field.dataSource) {
      const value = this.getNestedValue(data, field.dataSource);
      return field.format ? this.formatValue(value, field.format) : String(value || '');
    }
    return field.content;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, format: string): string {
    if (typeof value === 'number' && format.includes('currency')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    if (format.includes('date')) {
      return new Date(value).toLocaleDateString();
    }
    return String(value || '');
  }

  private getFieldStyle(field: LabelField, scale: number): string {
    const x = field.x * scale;
    const y = field.y * scale;
    const width = field.width * scale;
    const height = field.height * scale;

    return `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      font-size: ${(field.fontSize || 12) * scale}px;
      font-family: ${field.fontFamily || 'Arial, sans-serif'};
      font-weight: ${field.fontWeight || 'normal'};
      color: ${field.color || '#000000'};
      background-color: ${field.backgroundColor || 'transparent'};
      border: ${field.borderWidth || 0}px solid ${field.borderColor || 'transparent'};
      text-align: ${field.alignment || 'left'};
      transform: rotate(${field.rotation || 0}deg);
      display: flex;
      align-items: center;
      ${field.alignment === 'center' ? 'justify-content: center;' : ''}
      ${field.alignment === 'right' ? 'justify-content: flex-end;' : ''}
    `;
  }

  private async simulatePrinting(job: LabelPrintJob, settings: PrintSettings): Promise<void> {
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would:
    // 1. Generate print-ready PDF/HTML
    // 2. Send to printer via system print API
    // 3. Handle printer status and errors
    console.log(`Printing ${job.copies} copies of ${job.orderIds.length} labels`);
  }

  // Local Storage
  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem('label-templates');
      if (stored) {
        this.templates = JSON.parse(stored);
      } else {
        this.createDefaultTemplates();
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      this.createDefaultTemplates();
    }
  }

  private saveTemplates(): void {
    try {
      localStorage.setItem('label-templates', JSON.stringify(this.templates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  private loadPrintJobs(): void {
    try {
      const stored = localStorage.getItem('label-print-jobs');
      if (stored) {
        this.printJobs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load print jobs:', error);
    }
  }

  private savePrintJobs(): void {
    try {
      localStorage.setItem('label-print-jobs', JSON.stringify(this.printJobs));
    } catch (error) {
      console.error('Failed to save print jobs:', error);
    }
  }

  private createDefaultTemplates(): void {
    const defaultTemplate: LabelTemplate = {
      id: 'default-shipping',
      name: 'Shipping Label',
      description: 'Standard shipping label for orders',
      width: 100, // 100mm
      height: 60, // 60mm
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      fields: [
        {
          id: 'order-number',
          type: 'text',
          content: 'Order #',
          x: 5,
          y: 5,
          width: 20,
          height: 8,
          fontSize: 10,
          fontWeight: 'bold',
          dataSource: 'orderNumber'
        },
        {
          id: 'customer-name',
          type: 'text',
          content: 'Customer',
          x: 5,
          y: 15,
          width: 40,
          height: 8,
          fontSize: 8,
          dataSource: 'customerName'
        },
        {
          id: 'address',
          type: 'text',
          content: 'Address',
          x: 5,
          y: 25,
          width: 60,
          height: 20,
          fontSize: 7,
          dataSource: 'customerAddress'
        },
        {
          id: 'priority',
          type: 'text',
          content: 'Priority',
          x: 70,
          y: 5,
          width: 25,
          height: 8,
          fontSize: 8,
          fontWeight: 'bold',
          dataSource: 'priority',
          alignment: 'center'
        },
        {
          id: 'barcode',
          type: 'barcode',
          content: 'Barcode',
          x: 70,
          y: 15,
          width: 25,
          height: 15,
          fontSize: 6,
          dataSource: 'barcode'
        }
      ]
    };

    this.templates = [defaultTemplate];
    this.saveTemplates();
  }
}

export const labelService = new LabelService();
