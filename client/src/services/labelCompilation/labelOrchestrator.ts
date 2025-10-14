/**
 * Label System Orchestrator
 * Central service that coordinates all label generation components
 */

import { labelResolver, type Order, type LabelResolutionRequest } from './labelResolver';
import { labelCompilationService } from './batchProcessor';
import { preflightValidator, labelErrorReporter, type PreflightReport } from './preflightValidator';
import type { PrintOutput } from '../printEngines/basePrintEngine';

export interface LabelGenerationRequest {
  orders: Order[];
  options: {
    engine?: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
    labelType?: 'product' | 'shipping' | 'both';
    runPreflight?: boolean;
    generatePreviews?: boolean;
    batchSize?: number;
    printerProfileId?: string;
  };
}

export interface LabelGenerationResult {
  success: boolean;
  outputs: PrintOutput[];
  previews: Array<{
    orderId: string;
    productName: string;
    previewImage: string; // base64
  }>;
  preflightReports: PreflightReport[];
  errors: string[];
  warnings: string[];
  summary: {
    totalOrders: number;
    totalLabels: number;
    processingTime: number;
    averageQualityScore: number;
  };
}

class LabelOrchestrator {
  /**
   * Complete end-to-end label generation
   */
  async generateLabels(request: LabelGenerationRequest): Promise<LabelGenerationResult> {
    const startTime = Date.now();
    
    console.log(`🏭 Starting label generation for ${request.orders.length} orders...`);

    const result: LabelGenerationResult = {
      success: false,
      outputs: [],
      previews: [],
      preflightReports: [],
      errors: [],
      warnings: [],
      summary: {
        totalOrders: request.orders.length,
        totalLabels: 0,
        processingTime: 0,
        averageQualityScore: 0
      }
    };

    try {
      // Step 1: Compile orders to labels
      console.log('📋 Step 1: Compiling orders to labels...');
      const batchResult = await labelCompilationService.compileOrderLabels(request.orders, {
        engine: request.options.engine,
        labelType: request.options.labelType,
        batchSize: request.options.batchSize,
        generatePreviews: request.options.generatePreviews
      });

      if (!batchResult.success) {
        result.errors.push(...batchResult.progress.errors.map(e => e.error));
        return result;
      }

      console.log(`✅ Compiled ${batchResult.groups.length} groups with ${batchResult.summary.totalLabels} labels`);

      // Step 2: Run preflight validation if requested
      if (request.options.runPreflight) {
        console.log('🔍 Step 2: Running preflight validation...');
        
        for (const group of batchResult.groups) {
          for (const job of group.printJobs) {
            try {
              // Get template for job (mock for now)
              const template = this.getMockTemplate();
              const report = await preflightValidator.validatePrintJob(job, template);
              
              result.preflightReports.push(report);
              
              // Log the report
              labelErrorReporter.logPreflightReport(report);
              
              // Collect warnings and errors
              if (!report.canPrint) {
                result.errors.push(`Order ${job.metadata.orderNumber}: Cannot print - ${report.criticalIssues} critical issues`);
              } else if (report.warnings > 0) {
                result.warnings.push(`Order ${job.metadata.orderNumber}: ${report.warnings} warnings`);
              }

            } catch (error) {
              result.errors.push(`Preflight failed for job ${job.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        const averageQualityScore = result.preflightReports.length > 0
          ? Math.round(result.preflightReports.reduce((sum, r) => sum + r.overallScore, 0) / result.preflightReports.length)
          : 0;
          
        result.summary.averageQualityScore = averageQualityScore;
        console.log(`✅ Preflight completed. Average quality score: ${averageQualityScore}%`);
      }

      // Step 3: Collect outputs
      console.log('📦 Step 3: Collecting print outputs...');
      result.outputs = batchResult.outputs.map(output => output.output);
      
      // Step 4: Generate previews if requested
      if (request.options.generatePreviews && batchResult.groups.length > 0) {
        console.log('🖼️ Step 4: Generating previews...');
        
        for (const group of batchResult.groups.slice(0, 5)) { // Limit to first 5 for demo
          for (const job of group.printJobs.slice(0, 1)) { // One preview per group
            try {
              const engine = this.getEngineInstance(group.engine);
              const preview = await engine.generatePreview(job);
              
              result.previews.push({
                orderId: job.metadata.orderNumber || job.id,
                productName: job.metadata.productName || 'Unknown Product',
                previewImage: preview.imageData
              });
            } catch (error) {
              result.warnings.push(`Preview generation failed for ${job.id}`);
            }
          }
        }
        
        console.log(`✅ Generated ${result.previews.length} previews`);
      }

      // Final summary
      result.summary.totalLabels = batchResult.summary.totalLabels;
      result.summary.processingTime = Date.now() - startTime;
      result.success = result.errors.length === 0;

      // Log batch completion
      labelErrorReporter.logBatchResult(batchResult.batchId, result.success, result.summary);

      console.log(`🎉 Label generation completed in ${result.summary.processingTime}ms`);
      console.log(`📊 Summary: ${result.summary.totalOrders} orders → ${result.summary.totalLabels} labels`);

      return result;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown orchestration error');
      result.summary.processingTime = Date.now() - startTime;
      
      console.error('❌ Label generation failed:', error);
      
      return result;
    }
  }

  /**
   * Quick label generation for testing
   */
  async generateTestLabel(
    productName: string = 'Test Product',
    sku: string = 'TEST-001',
    engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL' = 'PDF'
  ): Promise<{
    success: boolean;
    output?: PrintOutput;
    preview?: string;
    preflightReport?: PreflightReport;
    error?: string;
  }> {
    try {
      // Create mock order
      const mockOrder: Order = this.createMockOrder(productName, sku);
      
      // Generate labels
      const result = await this.generateLabels({
        orders: [mockOrder],
        options: {
          engine,
          labelType: 'product',
          runPreflight: true,
          generatePreviews: true,
          batchSize: 1
        }
      });

      if (!result.success) {
        return {
          success: false,
          error: result.errors.join('; ')
        };
      }

      return {
        success: true,
        output: result.outputs[0],
        preview: result.previews[0]?.previewImage,
        preflightReport: result.preflightReports[0]
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test generation failed'
      };
    }
  }

  /**
   * Get engine instance by name
   */
  private getEngineInstance(engineName: string): any {
    const engineMap = {
      'PDF': () => import('../printEngines/pdfPrintEngine').then(m => new m.PDFPrintEngine()),
      'ZPL': () => import('../printEngines/zplPrintEngine').then(m => new m.ZPLPrintEngine()),
      'TSPL': () => import('../printEngines/tsplPrintEngine').then(m => new m.TSPLPrintEngine()),
      'BrotherQL': () => import('../printEngines/brotherQLPrintEngine').then(m => new m.BrotherQLPrintEngine())
    };

    // For now, return mock engine
    return {
      generatePreview: async (job: any) => ({
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        width: 100,
        height: 50
      })
    };
  }

  /**
   * Create mock order for testing
   */
  private createMockOrder(productName: string, sku: string): Order {
    return {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'confirmed',
      customer: {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Atlanta',
          state: 'GA',
          zipCode: '30309',
          country: 'US'
        }
      },
      vendor: {
        id: 'vendor-1',
        businessName: 'Craved Artisan Bakery',
        email: 'vendor@cravedartisan.com',
        phone: '(555) 123-4567',
        address: {
          street: '456 Baker St',
          city: 'Atlanta', 
          state: 'GA',
          zipCode: '30308',
          country: 'US'
        },
        website: 'https://cravedartisan.com'
      },
      lineItems: [{
        id: `item-${Date.now()}`,
        productId: 'product-1',
        productName,
        quantity: 1,
        unitPrice: 12.99,
        totalPrice: 12.99,
        sku,
        weight: 0.5,
        ingredients: 'Flour, Water, Salt, Yeast',
        allergens: ['Gluten'],
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }],
      createdAt: new Date().toISOString(),
      subtotal: 12.99,
      tax: 1.04,
      shipping: 0,
      total: 14.03
    };
  }

  /**
   * Mock template for testing
   */
  private getMockTemplate() {
    return {
      id: 'template-test',
      name: 'Test Product Label',
      description: 'Test template for validation',
      width: 50.8, // 2 inches
      height: 25.4, // 1 inch
      fields: [
        {
          id: 'product-name',
          type: 'text' as const,
          content: '{{product.name}}',
          x: 2,
          y: 2,
          width: 46,
          height: 6,
          fontSize: 10
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };
  }
}

// Export singleton instance
export const labelOrchestrator = new LabelOrchestrator();
