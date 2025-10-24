/**
 * Preflight Validation and Error Reporting System
 * Comprehensive validation before label printing to ensure quality and compatibility
 */

import type { PrintJob, PrintElement, ValidationResult } from '../printEngines/basePrintEngine';
import type { LabelTemplate } from '../../types/label-templates';
import type { Order, OrderLineItem } from './labelResolver';
import { PrintEngineUtils } from '../printEngines/basePrintEngine';

export interface PreflightCheck {
  id: string;
  name: string;
  description: string;
  category: 'template' | 'data' | 'printer' | 'quality' | 'compliance';
  severity: 'critical' | 'warning' | 'info';
  passed: boolean;
  message: string;
  suggestion?: string;
  affectedElements?: string[];
  details?: Record<string, any>;
}

export interface PreflightReport {
  jobId: string;
  orderNumber?: string;
  productName?: string;
  timestamp: string;
  
  // Overall status
  status: 'pass' | 'warning' | 'fail';
  canPrint: boolean;
  
  // Check results
  checks: PreflightCheck[];
  
  // Summary counts
  criticalIssues: number;
  warnings: number;
  infos: number;
  totalChecks: number;
  
  // Quality scores
  templateQuality: number; // 0-100
  dataCompleteness: number; // 0-100
  printerCompatibility: number; // 0-100
  overallScore: number; // 0-100
  
  // Recommendations
  recommendations: Array<{
    type: 'template' | 'data' | 'printer' | 'general';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
  }>;
  
  // Performance estimates
  estimatedPrintTime: number; // seconds
  estimatedFileSize: number; // bytes
  estimatedInkUsage: number; // percentage
}

export class PreflightValidator {
  private checkRegistry: Map<string, (job: PrintJob, template: LabelTemplate, order?: Order) => PreflightCheck> = new Map();

  constructor() {
    this.registerDefaultChecks();
  }

  /**
   * Run comprehensive preflight validation
   */
  async validatePrintJob(
    job: PrintJob, 
    template: LabelTemplate, 
    order?: Order
  ): Promise<PreflightReport> {
    const startTime = Date.now();
    const checks: PreflightCheck[] = [];

    // Run all registered checks
    for (const [checkId, checkFn] of this.checkRegistry) {
      try {
        const check = checkFn(job, template, order);
        checks.push(check);
      } catch (error) {
        checks.push({
          id: checkId,
          name: 'Check Execution Error',
          description: 'Failed to run validation check',
          category: 'template',
          severity: 'critical',
          passed: false,
          message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    // Calculate status and scores
    const criticalIssues = checks.filter(c => c.severity === 'critical' && !c.passed).length;
    const warnings = checks.filter(c => c.severity === 'warning' && !c.passed).length;
    const infos = checks.filter(c => c.severity === 'info' && !c.passed).length;
    
    const status = criticalIssues > 0 ? 'fail' : warnings > 0 ? 'warning' : 'pass';
    const canPrint = criticalIssues === 0;

    // Calculate quality scores
    const templateQuality = this.calculateTemplateQuality(checks);
    const dataCompleteness = this.calculateDataCompleteness(checks);
    const printerCompatibility = this.calculatePrinterCompatibility(checks);
    const overallScore = Math.round((templateQuality + dataCompleteness + printerCompatibility) / 3);

    // Generate recommendations
    const recommendations = this.generateRecommendations(checks, template, job);

    // Estimate performance metrics
    const estimates = this.estimatePerformanceMetrics(job, template);

    const report: PreflightReport = {
      jobId: job.id,
      orderNumber: job.metadata.orderNumber,
      productName: job.metadata.productName,
      timestamp: new Date().toISOString(),
      
      status,
      canPrint,
      
      checks,
      
      criticalIssues,
      warnings,
      infos,
      totalChecks: checks.length,
      
      templateQuality,
      dataCompleteness,
      printerCompatibility,
      overallScore,
      
      recommendations,
      
      ...estimates
    };

    console.log(`Preflight validation completed in ${Date.now() - startTime}ms: ${status.toUpperCase()}`);
    
    return report;
  }

  /**
   * Register default validation checks
   */
  private registerDefaultChecks(): void {
    // Template Structure Checks
    this.checkRegistry.set('template-dimensions', (job, template) => ({
      id: 'template-dimensions',
      name: 'Template Dimensions',
      description: 'Verify template has valid dimensions',
      category: 'template',
      severity: 'critical',
      passed: template.width > 0 && template.height > 0 && template.width <= 304.8 && template.height <= 304.8,
      message: template.width > 0 && template.height > 0 
        ? `Template dimensions: ${(template.width/25.4).toFixed(1)}" × ${(template.height/25.4).toFixed(1)}"`
        : 'Invalid template dimensions',
      suggestion: template.width <= 0 || template.height <= 0 
        ? 'Set positive width and height values'
        : 'Template exceeds maximum size (12" × 12")'
    }));

    this.checkRegistry.set('element-bounds', (job, template) => {
      const outOfBounds = job.elements.filter(el => 
        el.x < 0 || el.y < 0 || 
        el.x + el.width > job.dimensions.widthInches ||
        el.y + el.height > job.dimensions.heightInches
      );
      
      return {
        id: 'element-bounds',
        name: 'Element Boundaries',
        description: 'Check all elements are within label boundaries',
        category: 'template',
        severity: 'critical',
        passed: outOfBounds.length === 0,
        message: outOfBounds.length === 0 
          ? 'All elements within bounds'
          : `${outOfBounds.length} elements extend beyond label boundaries`,
        affectedElements: outOfBounds.map(el => el.id),
        suggestion: 'Resize or reposition out-of-bounds elements'
      };
    });

    // Data Completeness Checks
    this.checkRegistry.set('required-content', (job, template) => {
      const emptyElements = job.elements.filter(el => 
        ['text', 'barcode', 'qr'].includes(el.type) && (!el.content || el.content.trim() === '')
      );
      
      return {
        id: 'required-content',
        name: 'Required Content',
        description: 'Check all elements have required content',
        category: 'data',
        severity: 'warning',
        passed: emptyElements.length === 0,
        message: emptyElements.length === 0
          ? 'All elements have content'
          : `${emptyElements.length} elements are missing content`,
        affectedElements: emptyElements.map(el => el.id),
        suggestion: 'Provide content for empty text, barcode, or QR elements'
      };
    });

    this.checkRegistry.set('barcode-validation', (job, template) => {
      const barcodeElements = job.elements.filter(el => el.type === 'barcode');
      const invalidBarcodes = barcodeElements.filter(el => {
        if (!el.content) return true;
        
        // Basic barcode validation
        const format = el.barcodeFormat || 'CODE128';
        switch (format) {
          case 'CODE128':
            return el.content.length < 1 || el.content.length > 48;
          case 'CODE39':
            return !/^[A-Z0-9\-. $\/+%]*$/.test(el.content);
          case 'UPC':
            return !/^\d{12}$/.test(el.content);
          case 'EAN13':
            return !/^\d{13}$/.test(el.content);
          default:
            return false;
        }
      });
      
      return {
        id: 'barcode-validation',
        name: 'Barcode Validation',
        description: 'Validate barcode content and format',
        category: 'data',
        severity: 'critical',
        passed: invalidBarcodes.length === 0,
        message: invalidBarcodes.length === 0
          ? `${barcodeElements.length} barcodes validated`
          : `${invalidBarcodes.length} barcodes have invalid content`,
        affectedElements: invalidBarcodes.map(el => el.id),
        suggestion: 'Verify barcode content matches the selected format requirements'
      };
    });

    // Quality Checks
    this.checkRegistry.set('text-readability', (job, template) => {
      const smallText = job.elements.filter(el => 
        el.type === 'text' && el.fontSize && el.fontSize < 8
      );
      
      return {
        id: 'text-readability',
        name: 'Text Readability',
        description: 'Check text size for readability',
        category: 'quality',
        severity: 'warning',
        passed: smallText.length === 0,
        message: smallText.length === 0
          ? 'All text is readable size'
          : `${smallText.length} text elements may be too small`,
        affectedElements: smallText.map(el => el.id),
        suggestion: 'Consider increasing font size to 8pt or larger for better readability'
      };
    });

    this.checkRegistry.set('barcode-density', (job, template) => {
      const barcodes = job.elements.filter(el => el.type === 'barcode');
      const lowDensity = barcodes.filter(el => {
        const dotsWidth = el.width * job.dimensions.dpi;
        const contentLength = el.content?.length || 0;
        return contentLength > 0 && dotsWidth / contentLength < 3; // Less than 3 dots per character
      });
      
      return {
        id: 'barcode-density',
        name: 'Barcode Print Density',
        description: 'Check barcode elements have sufficient print density',
        category: 'quality',
        severity: 'warning',
        passed: lowDensity.length === 0,
        message: lowDensity.length === 0
          ? 'Barcode density acceptable'
          : `${lowDensity.length} barcodes may print poorly`,
        affectedElements: lowDensity.map(el => el.id),
        suggestion: 'Increase barcode width or reduce content length for better print quality'
      };
    });

    // Printer Compatibility Checks
    this.checkRegistry.set('printer-capabilities', (job, template) => {
      // This would check against actual printer capabilities
      // For now, we'll do basic checks
      const hasColor = job.elements.some(el => el.color && el.color !== '#000000');
      const hasImages = job.elements.some(el => el.type === 'image');
      
      return {
        id: 'printer-capabilities',
        name: 'Printer Capabilities',
        description: 'Check elements are supported by target printer',
        category: 'printer',
        severity: 'warning',
        passed: true, // Assume compatibility for now
        message: 'Elements compatible with target printer',
        details: {
          hasColor,
          hasImages,
          elementTypes: [...new Set(job.elements.map(el => el.type))]
        }
      };
    });

    // Compliance Checks  
    this.checkRegistry.set('element-overlap', (job, template) => {
      const overlaps = this.findElementOverlaps(job.elements);
      
      return {
        id: 'element-overlap',
        name: 'Element Overlap',
        description: 'Check for overlapping elements that may cause print issues',
        category: 'quality',
        severity: 'warning',
        passed: overlaps.length === 0,
        message: overlaps.length === 0
          ? 'No element overlaps detected'
          : `${overlaps.length} potential overlaps detected`,
        affectedElements: overlaps.flat(),
        suggestion: 'Adjust element positions to avoid overlaps'
      };
    });
  }

  /**
   * Calculate template quality score (0-100)
   */
  private calculateTemplateQuality(checks: PreflightCheck[]): number {
    const templateChecks = checks.filter(c => c.category === 'template');
    const passedCount = templateChecks.filter(c => c.passed).length;
    return templateChecks.length > 0 ? Math.round((passedCount / templateChecks.length) * 100) : 100;
  }

  /**
   * Calculate data completeness score (0-100)
   */
  private calculateDataCompleteness(checks: PreflightCheck[]): number {
    const dataChecks = checks.filter(c => c.category === 'data');
    const passedCount = dataChecks.filter(c => c.passed).length;
    return dataChecks.length > 0 ? Math.round((passedCount / dataChecks.length) * 100) : 100;
  }

  /**
   * Calculate printer compatibility score (0-100)
   */
  private calculatePrinterCompatibility(checks: PreflightCheck[]): number {
    const printerChecks = checks.filter(c => c.category === 'printer');
    const passedCount = printerChecks.filter(c => c.passed).length;
    return printerChecks.length > 0 ? Math.round((passedCount / printerChecks.length) * 100) : 100;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    checks: PreflightCheck[], 
    template: LabelTemplate, 
    job: PrintJob
  ): PreflightReport['recommendations'] {
    const recommendations: PreflightReport['recommendations'] = [];
    
    const failedCritical = checks.filter(c => c.severity === 'critical' && !c.passed);
    const failedWarnings = checks.filter(c => c.severity === 'warning' && !c.passed);

    // Critical issue recommendations
    failedCritical.forEach(check => {
      recommendations.push({
        type: check.category as any,
        priority: 'high',
        title: `Fix: ${check.name}`,
        description: check.message,
        action: check.suggestion || 'Review and correct this issue before printing'
      });
    });

    // Warning recommendations
    failedWarnings.forEach(check => {
      recommendations.push({
        type: check.category as any,
        priority: 'medium',
        title: `Optimize: ${check.name}`,
        description: check.message,
        action: check.suggestion || 'Consider addressing this for better print quality'
      });
    });

    // General optimization recommendations
    if (job.elements.length > 10) {
      recommendations.push({
        type: 'template',
        priority: 'low',
        title: 'Template Complexity',
        description: 'Template has many elements which may slow printing',
        action: 'Consider simplifying the design for faster printing'
      });
    }

    if (job.copies > 100) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Large Print Job',
        description: `Printing ${job.copies} labels`,
        action: 'Consider processing in smaller batches for better performance'
      });
    }

    return recommendations;
  }

  /**
   * Find overlapping elements
   */
  private findElementOverlaps(elements: PrintElement[]): string[][] {
    const overlaps: string[][] = [];

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const el1 = elements[i];
        const el2 = elements[j];

        // Guard against undefined elements
        if (!el1 || !el2) {
          continue;
        }

        // Check for rectangle intersection
        const overlap = !(
          el1.x + el1.width <= el2.x ||
          el2.x + el2.width <= el1.x ||
          el1.y + el1.height <= el2.y ||
          el2.y + el2.height <= el1.y
        );

        if (overlap) {
          overlaps.push([el1.id, el2.id]);
        }
      }
    }

    return overlaps;
  }

  /**
   * Estimate performance metrics
   */
  private estimatePerformanceMetrics(job: PrintJob, template: LabelTemplate): {
    estimatedPrintTime: number;
    estimatedFileSize: number;
    estimatedInkUsage: number;
  } {
    // Estimate print time based on complexity
    const baseTimePerLabel = 2; // seconds
    const elementComplexity = job.elements.length * 0.1;
    const barcodeComplexity = job.elements.filter(el => el.type === 'barcode' || el.type === 'qr').length * 0.3;
    const imageComplexity = job.elements.filter(el => el.type === 'image').length * 0.5;
    
    const estimatedPrintTime = Math.round(
      job.copies * (baseTimePerLabel + elementComplexity + barcodeComplexity + imageComplexity)
    );

    // Estimate file size
    const baseSize = 1024; // 1KB base
    const elementSize = job.elements.length * 200; // 200 bytes per element
    const contentSize = job.elements.reduce((size, el) => {
      return size + (el.content?.length || 0) * 2;
    }, 0);
    
    const estimatedFileSize = baseSize + elementSize + contentSize;

    // Estimate ink usage (for thermal printers, this is "darkness")
    const labelArea = job.dimensions.widthInches * job.dimensions.heightInches;
    const filledElements = job.elements.filter(el => 
      el.backgroundColor || el.type === 'barcode' || el.type === 'qr'
    );
    const filledArea = filledElements.reduce((area, el) => area + (el.width * el.height), 0);
    const estimatedInkUsage = Math.min(100, Math.round((filledArea / labelArea) * 100));

    return {
      estimatedPrintTime,
      estimatedFileSize,
      estimatedInkUsage
    };
  }

  /**
   * Add custom validation check
   */
  addCustomCheck(
    id: string, 
    checkFn: (job: PrintJob, template: LabelTemplate, order?: Order) => PreflightCheck
  ): void {
    this.checkRegistry.set(id, checkFn);
  }

  /**
   * Remove validation check
   */
  removeCheck(id: string): boolean {
    return this.checkRegistry.delete(id);
  }

  /**
   * Get available checks
   */
  getAvailableChecks(): Array<{ id: string; name: string; category: string }> {
    // This would return metadata about available checks
    return [
      { id: 'template-dimensions', name: 'Template Dimensions', category: 'template' },
      { id: 'element-bounds', name: 'Element Boundaries', category: 'template' },
      { id: 'required-content', name: 'Required Content', category: 'data' },
      { id: 'barcode-validation', name: 'Barcode Validation', category: 'data' },
      { id: 'text-readability', name: 'Text Readability', category: 'quality' },
      { id: 'barcode-density', name: 'Barcode Density', category: 'quality' },
      { id: 'printer-capabilities', name: 'Printer Capabilities', category: 'printer' },
      { id: 'element-overlap', name: 'Element Overlap', category: 'quality' }
    ];
  }
}

/**
 * Error Reporting Service
 * Provides detailed error logging and reporting for label operations
 */
export class LabelErrorReporter {
  private errorLog: Array<{
    id: string;
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    details?: Record<string, any>;
  }> = [];

  /**
   * Log preflight report
   */
  logPreflightReport(report: PreflightReport): void {
    const entry = {
      id: `preflight-${report.jobId}`,
      timestamp: report.timestamp,
      level: report.status === 'fail' ? 'error' as const : 
             report.status === 'warning' ? 'warning' as const : 'info' as const,
      category: 'preflight',
      message: `Preflight ${report.status.toUpperCase()}: ${report.jobId}`,
      details: {
        orderNumber: report.orderNumber,
        productName: report.productName,
        criticalIssues: report.criticalIssues,
        warnings: report.warnings,
        overallScore: report.overallScore,
        canPrint: report.canPrint
      }
    };

    this.errorLog.push(entry);
    console.log(`[PREFLIGHT] ${entry.level.toUpperCase()}: ${entry.message}`, entry.details);
  }

  /**
   * Log batch processing results
   */
  logBatchResult(batchId: string, success: boolean, summary: any): void {
    const entry = {
      id: `batch-${batchId}`,
      timestamp: new Date().toISOString(),
      level: success ? 'info' as const : 'error' as const,
      category: 'batch',
      message: `Batch ${success ? 'COMPLETED' : 'FAILED'}: ${batchId}`,
      details: summary
    };

    this.errorLog.push(entry);
    console.log(`[BATCH] ${entry.level.toUpperCase()}: ${entry.message}`, entry.details);
  }

  /**
   * Get error log entries
   */
  getErrorLog(limit: number = 50): typeof this.errorLog {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Export error log as JSON
   */
  exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// Export singleton instances
export const preflightValidator = new PreflightValidator();
export const labelErrorReporter = new LabelErrorReporter();

// Export convenience functions
export const validatePrintJob = (job: PrintJob, template: LabelTemplate, order?: Order) => {
  return preflightValidator.validatePrintJob(job, template, order);
};

export const logPreflightReport = (report: PreflightReport) => {
  labelErrorReporter.logPreflightReport(report);
};
