import type { LabelTemplate } from '../types/label-templates';
import { getTemplatePresets, type TemplatePreset } from './labelTemplatePresets';

export interface TemplateExportData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  templates: LabelTemplate[];
  metadata: {
    totalCount: number;
    categories: string[];
    description?: string;
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    templateName: string;
    error: string;
  }>;
  duplicates: Array<{
    templateName: string;
    action: 'skip' | 'replace' | 'rename';
  }>;
}

export interface ImportOptions {
  duplicateHandling: 'skip' | 'replace' | 'rename';
  validateTemplates: boolean;
  createBackup: boolean;
}

class LabelTemplateImportExportService {
  private readonly EXPORT_VERSION = '1.0';
  private readonly SUPPORTED_VERSIONS = ['1.0'];

  /**
   * Export label templates to downloadable JSON file
   */
  exportTemplates(
    templates: LabelTemplate[],
    filename?: string,
    metadata?: { description?: string }
  ): void {
    const exportData: TemplateExportData = {
      version: this.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy: 'current-user', // In real app, get from auth context
      templates,
      metadata: {
        totalCount: templates.length,
        categories: this.extractCategories(templates),
        description: metadata?.description
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `label-templates-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export template presets to downloadable JSON file
   */
  exportPresets(filename?: string): void {
    const presets = getTemplatePresets();
    const templates = presets.map(preset => ({
      ...preset.template,
      id: preset.id,
      name: preset.name,
      description: preset.description
    }));

    this.exportTemplates(templates, filename || `label-template-presets-${Date.now()}.json`, {
      description: 'Label template presets from Craved Artisan platform'
    });
  }

  /**
   * Import templates from JSON file
   */
  async importTemplates(
    file: File,
    existingTemplates: LabelTemplate[],
    options: ImportOptions = {
      duplicateHandling: 'skip',
      validateTemplates: true,
      createBackup: true
    }
  ): Promise<ImportResult> {
    try {
      const content = await this.readFileContent(file);
      const exportData = this.parseExportData(content);

      // Create backup if requested
      if (options.createBackup && existingTemplates.length > 0) {
        this.createBackup(existingTemplates);
      }

      // Process imports
      return this.processImports(exportData.templates, existingTemplates, options);
    } catch (error) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{
          templateName: 'Import Process',
          error: error instanceof Error ? error.message : 'Unknown import error'
        }],
        duplicates: []
      };
    }
  }

  /**
   * Validate template import file without importing
   */
  async validateImportFile(file: File): Promise<{
    valid: boolean;
    templateCount: number;
    version: string;
    issues: string[];
    preview: Array<{ name: string; description?: string; fieldCount: number }>;
  }> {
    try {
      const content = await this.readFileContent(file);
      const exportData = this.parseExportData(content);

      const issues = this.validateExportData(exportData);
      const preview = exportData.templates.slice(0, 5).map(template => ({
        name: template.name,
        description: template.description,
        fieldCount: template.fields.length
      }));

      return {
        valid: issues.length === 0,
        templateCount: exportData.templates.length,
        version: exportData.version,
        issues,
        preview
      };
    } catch (error) {
      return {
        valid: false,
        templateCount: 0,
        version: 'unknown',
        issues: [error instanceof Error ? error.message : 'Failed to read file'],
        preview: []
      };
    }
  }

  /**
   * Create template sharing URL (for future implementation)
   */
  generateSharingLink(templates: LabelTemplate[]): string {
    // In a real implementation, this would upload to a sharing service
    // and return a shareable URL
    const data = btoa(JSON.stringify({
      templates: templates.slice(0, 3), // Limit for sharing
      sharedAt: new Date().toISOString()
    }));
    
    return `${window.location.origin}/templates/shared/${data}`;
  }

  /**
   * Import from sharing URL (for future implementation)
   */
  async importFromSharingLink(url: string): Promise<LabelTemplate[]> {
    try {
      const data = url.split('/shared/')[1];
      const decoded = JSON.parse(atob(data));
      return decoded.templates || [];
    } catch (error) {
      throw new Error('Invalid sharing link format');
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseExportData(content: string): TemplateExportData {
    try {
      const data = JSON.parse(content);
      
      if (!this.SUPPORTED_VERSIONS.includes(data.version)) {
        throw new Error(`Unsupported version: ${data.version}`);
      }

      return data;
    } catch (error) {
      throw new Error('Invalid JSON format or unsupported file structure');
    }
  }

  private validateExportData(data: TemplateExportData): string[] {
    const issues: string[] = [];

    if (!Array.isArray(data.templates)) {
      issues.push('Templates data is not an array');
      return issues;
    }

    data.templates.forEach((template, index) => {
      if (!template.name || typeof template.name !== 'string') {
        issues.push(`Template ${index + 1}: Missing or invalid name`);
      }

      if (!template.id || typeof template.id !== 'string') {
        issues.push(`Template ${index + 1}: Missing or invalid ID`);
      }

      if (!Array.isArray(template.fields)) {
        issues.push(`Template ${index + 1}: Fields must be an array`);
      }

      if (typeof template.width !== 'number' || typeof template.height !== 'number') {
        issues.push(`Template ${index + 1}: Invalid dimensions`);
      }
    });

    return issues;
  }

  private processImports(
    importedTemplates: LabelTemplate[],
    existingTemplates: LabelTemplate[],
    options: ImportOptions
  ): ImportResult {
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: []
    };

    const existingIds = new Set(existingTemplates.map(t => t.id));
    const existingNames = new Set(existingTemplates.map(t => t.name.toLowerCase()));

    importedTemplates.forEach((template, index) => {
      try {
        // Check for duplicates
        const isDuplicateId = existingIds.has(template.id);
        const isDuplicateName = existingNames.has(template.name.toLowerCase());

        if (isDuplicateId || isDuplicateName) {
          result.duplicates.push({
            templateName: template.name,
            action: options.duplicateHandling
          });

          switch (options.duplicateHandling) {
            case 'skip':
              result.skipped++;
              return;
            
            case 'rename':
              template.name = this.generateUniqueName(template.name, existingNames);
              template.id = `${template.id}-imported-${Date.now()}`;
              break;
            
            case 'replace':
              // In real implementation, would update existing template
              break;
          }
        }

        // Validate template if requested
        if (options.validateTemplates) {
          const validation = this.validateTemplate(template);
          if (!validation.valid) {
            result.errors.push({
              templateName: template.name,
              error: `Validation failed: ${validation.issues.join(', ')}`
            });
            return;
          }
        }

        // Update timestamps
        template.updatedAt = new Date().toISOString();
        if (!existingIds.has(template.id)) {
          template.createdAt = new Date().toISOString();
        }

        result.imported++;
        existingIds.add(template.id);
        existingNames.add(template.name.toLowerCase());

      } catch (error) {
        result.errors.push({
          templateName: template.name || `Template ${index + 1}`,
          error: error instanceof Error ? error.message : 'Unknown processing error'
        });
      }
    });

    result.success = result.errors.length === 0;
    return result;
  }

  private validateTemplate(template: LabelTemplate): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (template.width <= 0 || template.height <= 0) {
      issues.push('Invalid dimensions');
    }

    if (template.fields.some(field => !field.id || !field.type)) {
      issues.push('Invalid field configuration');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private generateUniqueName(baseName: string, existingNames: Set<string>): string {
    let counter = 1;
    let newName = `${baseName} (Copy)`;
    
    while (existingNames.has(newName.toLowerCase())) {
      counter++;
      newName = `${baseName} (Copy ${counter})`;
    }

    return newName;
  }

  private extractCategories(templates: LabelTemplate[]): string[] {
    // Extract categories from template names/descriptions
    const categories = new Set<string>();
    
    templates.forEach(template => {
      // Simple category extraction based on naming patterns
      if (template.name.toLowerCase().includes('shipping')) categories.add('Shipping');
      if (template.name.toLowerCase().includes('product')) categories.add('Product');
      if (template.name.toLowerCase().includes('barcode')) categories.add('Barcode');
      if (template.name.toLowerCase().includes('address')) categories.add('Address');
    });

    return Array.from(categories).sort();
  }

  private createBackup(templates: LabelTemplate[]): void {
    const backupFilename = `label-templates-backup-${Date.now()}.json`;
    this.exportTemplates(templates, backupFilename, {
      description: 'Automatic backup created before import'
    });
  }
}

// Export singleton instance
export const templateImportExport = new LabelTemplateImportExportService();

// Export convenience functions
export const exportLabelTemplates = (
  templates: LabelTemplate[],
  filename?: string,
  metadata?: { description?: string }
): void => {
  templateImportExport.exportTemplates(templates, filename, metadata);
};

export const importLabelTemplates = (
  file: File,
  existingTemplates: LabelTemplate[],
  options?: ImportOptions
): Promise<ImportResult> => {
  return templateImportExport.importTemplates(file, existingTemplates, options);
};

export const validateTemplateImport = (file: File) => {
  return templateImportExport.validateImportFile(file);
};
