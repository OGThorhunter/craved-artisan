import { logger } from '../../logger';

export interface LabelRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
  conditions: RuleCondition[];
  operator: 'AND' | 'OR';
  actions: RuleAction[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  tags?: string[];
}

export interface RuleCondition {
  id?: string;
  field: string; // e.g., "order.priority", "product.category", "customer.type"
  operator: ConditionOperator;
  value: any;
  valueType?: 'string' | 'number' | 'boolean' | 'date' | 'array';
  caseSensitive?: boolean;
  negate?: boolean; // If true, negates the condition result
}

export type ConditionOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'greater_than' | 'greater_than_or_equal'
  | 'less_than' | 'less_than_or_equal'
  | 'in_array' | 'not_in_array'
  | 'is_empty' | 'is_not_empty'
  | 'matches_regex' | 'is_between'
  | 'exists' | 'not_exists';

export interface RuleAction {
  id?: string;
  type: ActionType;
  target?: string; // Element ID or property path
  properties?: Record<string, any>;
  value?: any;
  transform?: TransformFunction;
}

export type ActionType =
  | 'show_element' | 'hide_element'
  | 'set_text' | 'set_property'
  | 'add_class' | 'remove_class'
  | 'transform_data' | 'conditional_format'
  | 'set_barcode' | 'set_qr_code'
  | 'add_element' | 'remove_element'
  | 'modify_layout' | 'apply_style';

export type TransformFunction =
  | 'uppercase' | 'lowercase' | 'capitalize'
  | 'format_currency' | 'format_date' | 'format_number'
  | 'truncate' | 'pad_left' | 'pad_right'
  | 'replace' | 'extract_regex' | 'calculate';

export interface RuleExecutionContext {
  order?: any;
  product?: any;
  customer?: any;
  vendor?: any;
  labelProfile?: any;
  customFields?: Record<string, any>;
  timestamp: Date;
  systemInfo?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
}

export interface RuleExecutionResult {
  ruleId: string;
  executed: boolean;
  conditionsMatched: boolean;
  actionsApplied: RuleActionResult[];
  executionTimeMs: number;
  errors: string[];
  warnings: string[];
}

export interface RuleActionResult {
  actionType: ActionType;
  target?: string;
  success: boolean;
  appliedValue?: any;
  error?: string;
}

export interface ProcessingOptions {
  stopOnFirstError?: boolean;
  maxExecutionTimeMs?: number;
  enableProfiling?: boolean;
  dryRun?: boolean;
}

export class RulesProcessor {
  private rules: Map<string, LabelRule>;
  private executionHistory: Map<string, RuleExecutionResult[]>;
  private performanceMetrics: Map<string, number[]>;

  constructor() {
    this.rules = new Map();
    this.executionHistory = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Add or update a rule in the processor
   */
  addRule(rule: LabelRule): void {
    this.validateRule(rule);
    this.rules.set(rule.id, { ...rule, updatedAt: new Date() });
    
    logger.info('Rule added to processor', {
      ruleId: rule.id,
      name: rule.name,
      priority: rule.priority,
      conditionCount: rule.conditions.length,
      actionCount: rule.actions.length
    });
  }

  /**
   * Remove a rule from the processor
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.executionHistory.delete(ruleId);
      this.performanceMetrics.delete(ruleId);
      logger.info('Rule removed from processor', { ruleId });
    }
    return removed;
  }

  /**
   * Process all applicable rules for given context and template
   */
  async processRules(
    context: RuleExecutionContext,
    template: any,
    options: ProcessingOptions = {}
  ): Promise<{
    template: any;
    results: RuleExecutionResult[];
    totalExecutionTimeMs: number;
  }> {
    const startTime = Date.now();
    const results: RuleExecutionResult[] = [];
    let modifiedTemplate = JSON.parse(JSON.stringify(template)); // Deep clone

    logger.debug('Starting rules processing', {
      ruleCount: this.rules.size,
      contextKeys: Object.keys(context),
      options
    });

    try {
      // Get active rules sorted by priority (highest first)
      const activeRules = Array.from(this.rules.values())
        .filter(rule => rule.isActive)
        .sort((a, b) => b.priority - a.priority);

      for (const rule of activeRules) {
        // Check execution timeout
        if (options.maxExecutionTimeMs) {
          const elapsed = Date.now() - startTime;
          if (elapsed > options.maxExecutionTimeMs) {
            logger.warn('Rules processing timeout exceeded', {
              elapsedMs: elapsed,
              maxMs: options.maxExecutionTimeMs,
              processedRules: results.length
            });
            break;
          }
        }

        const result = await this.executeRule(rule, context, modifiedTemplate, options);
        results.push(result);

        // Apply successful actions to template
        if (result.conditionsMatched && !options.dryRun) {
          modifiedTemplate = this.applyActionsToTemplate(
            modifiedTemplate,
            result.actionsApplied.filter(a => a.success)
          );
        }

        // Stop on error if configured
        if (options.stopOnFirstError && result.errors.length > 0) {
          logger.warn('Stopping rules processing due to error', {
            ruleId: rule.id,
            errors: result.errors
          });
          break;
        }
      }

      const totalExecutionTime = Date.now() - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(results, totalExecutionTime);

      logger.info('Rules processing completed', {
        totalRules: activeRules.length,
        executedRules: results.length,
        successfulRules: results.filter(r => r.executed && r.errors.length === 0).length,
        totalExecutionTimeMs: totalExecutionTime
      });

      return {
        template: modifiedTemplate,
        results,
        totalExecutionTimeMs: totalExecutionTime
      };

    } catch (error) {
      logger.error('Rules processing failed', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Rules processing failed: ${error.message}`);
    }
  }

  /**
   * Execute a single rule against the context
   */
  private async executeRule(
    rule: LabelRule,
    context: RuleExecutionContext,
    template: any,
    options: ProcessingOptions
  ): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    
    const result: RuleExecutionResult = {
      ruleId: rule.id,
      executed: false,
      conditionsMatched: false,
      actionsApplied: [],
      executionTimeMs: 0,
      errors: [],
      warnings: []
    };

    try {
      // Evaluate conditions
      const conditionsMatched = this.evaluateConditions(rule.conditions, rule.operator, context);
      result.conditionsMatched = conditionsMatched;

      if (conditionsMatched) {
        // Execute actions
        for (const action of rule.actions) {
          try {
            const actionResult = await this.executeAction(action, context, template);
            result.actionsApplied.push(actionResult);
          } catch (error) {
            const errorMsg = `Action execution failed: ${error.message}`;
            result.errors.push(errorMsg);
            result.actionsApplied.push({
              actionType: action.type,
              target: action.target,
              success: false,
              error: errorMsg
            });
          }
        }
        result.executed = true;
      }

    } catch (error) {
      result.errors.push(`Rule execution failed: ${error.message}`);
      logger.error('Rule execution error', {
        ruleId: rule.id,
        error: error.message,
        context: Object.keys(context)
      });
    } finally {
      result.executionTimeMs = Date.now() - startTime;
      
      // Log execution if profiling enabled
      if (options.enableProfiling) {
        logger.debug('Rule execution profile', {
          ruleId: rule.id,
          executionTimeMs: result.executionTimeMs,
          conditionsMatched: result.conditionsMatched,
          actionsCount: result.actionsApplied.length,
          errors: result.errors
        });
      }

      // Store execution history
      if (!this.executionHistory.has(rule.id)) {
        this.executionHistory.set(rule.id, []);
      }
      this.executionHistory.get(rule.id)!.push(result);
      
      // Keep only last 100 executions per rule
      const history = this.executionHistory.get(rule.id)!;
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
    }

    return result;
  }

  /**
   * Evaluate rule conditions using specified operator
   */
  private evaluateConditions(
    conditions: RuleCondition[],
    operator: 'AND' | 'OR',
    context: RuleExecutionContext
  ): boolean {
    if (conditions.length === 0) return true;

    const results = conditions.map(condition => this.evaluateCondition(condition, context));

    return operator === 'AND' 
      ? results.every(result => result)
      : results.some(result => result);
  }

  /**
   * Evaluate a single condition against context
   */
  private evaluateCondition(condition: RuleCondition, context: RuleExecutionContext): boolean {
    try {
      const actualValue = this.getValueFromContext(condition.field, context);
      const expectedValue = condition.value;
      
      let result = false;

      switch (condition.operator) {
        case 'equals':
          result = this.compareValues(actualValue, expectedValue, condition.caseSensitive) === 0;
          break;
        
        case 'not_equals':
          result = this.compareValues(actualValue, expectedValue, condition.caseSensitive) !== 0;
          break;
        
        case 'contains':
          result = actualValue != null && 
                   actualValue.toString().toLowerCase().includes(expectedValue.toString().toLowerCase());
          break;
        
        case 'not_contains':
          result = actualValue == null || 
                   !actualValue.toString().toLowerCase().includes(expectedValue.toString().toLowerCase());
          break;
        
        case 'starts_with':
          result = actualValue != null && 
                   actualValue.toString().toLowerCase().startsWith(expectedValue.toString().toLowerCase());
          break;
        
        case 'ends_with':
          result = actualValue != null && 
                   actualValue.toString().toLowerCase().endsWith(expectedValue.toString().toLowerCase());
          break;
        
        case 'greater_than':
          result = this.compareNumbers(actualValue, expectedValue) > 0;
          break;
        
        case 'greater_than_or_equal':
          result = this.compareNumbers(actualValue, expectedValue) >= 0;
          break;
        
        case 'less_than':
          result = this.compareNumbers(actualValue, expectedValue) < 0;
          break;
        
        case 'less_than_or_equal':
          result = this.compareNumbers(actualValue, expectedValue) <= 0;
          break;
        
        case 'in_array':
          result = Array.isArray(expectedValue) && expectedValue.includes(actualValue);
          break;
        
        case 'not_in_array':
          result = !Array.isArray(expectedValue) || !expectedValue.includes(actualValue);
          break;
        
        case 'is_empty':
          result = actualValue == null || actualValue === '' || 
                   (Array.isArray(actualValue) && actualValue.length === 0);
          break;
        
        case 'is_not_empty':
          result = actualValue != null && actualValue !== '' && 
                   (!Array.isArray(actualValue) || actualValue.length > 0);
          break;
        
        case 'matches_regex':
          const regex = new RegExp(expectedValue.toString(), condition.caseSensitive ? 'g' : 'gi');
          result = actualValue != null && regex.test(actualValue.toString());
          break;
        
        case 'is_between':
          if (Array.isArray(expectedValue) && expectedValue.length === 2) {
            const numValue = parseFloat(actualValue);
            result = !isNaN(numValue) && 
                     numValue >= parseFloat(expectedValue[0]) && 
                     numValue <= parseFloat(expectedValue[1]);
          }
          break;
        
        case 'exists':
          result = actualValue !== undefined;
          break;
        
        case 'not_exists':
          result = actualValue === undefined;
          break;
        
        default:
          throw new Error(`Unsupported condition operator: ${condition.operator}`);
      }

      // Apply negation if specified
      if (condition.negate) {
        result = !result;
      }

      return result;

    } catch (error) {
      logger.warn('Condition evaluation error', {
        condition: condition.field,
        operator: condition.operator,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Execute a rule action
   */
  private async executeAction(
    action: RuleAction,
    context: RuleExecutionContext,
    template: any
  ): Promise<RuleActionResult> {
    const result: RuleActionResult = {
      actionType: action.type,
      target: action.target,
      success: false
    };

    try {
      let appliedValue: any;

      switch (action.type) {
        case 'set_text':
          appliedValue = this.resolveActionValue(action.value, context);
          result.appliedValue = appliedValue;
          result.success = true;
          break;
        
        case 'set_property':
          appliedValue = this.resolveActionValue(action.value, context);
          result.appliedValue = appliedValue;
          result.success = true;
          break;
        
        case 'show_element':
        case 'hide_element':
          result.appliedValue = action.type === 'show_element';
          result.success = true;
          break;
        
        case 'transform_data':
          if (action.transform) {
            const originalValue = this.getValueFromTemplate(action.target, template);
            appliedValue = this.applyTransform(originalValue, action.transform, action.properties);
            result.appliedValue = appliedValue;
            result.success = true;
          }
          break;
        
        case 'set_barcode':
        case 'set_qr_code':
          appliedValue = this.resolveActionValue(action.value, context);
          result.appliedValue = appliedValue;
          result.success = true;
          break;
        
        case 'apply_style':
          if (action.properties) {
            result.appliedValue = action.properties;
            result.success = true;
          }
          break;
        
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }

    } catch (error) {
      result.error = error.message;
      result.success = false;
    }

    return result;
  }

  /**
   * Apply successful actions to template
   */
  private applyActionsToTemplate(template: any, successfulActions: RuleActionResult[]): any {
    // This would modify the template based on successful actions
    // Implementation depends on template structure
    // For now, return the template as-is
    return template;
  }

  /**
   * Get value from context using dot notation
   */
  private getValueFromContext(path: string, context: RuleExecutionContext): any {
    const parts = path.split('.');
    let current: any = context;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Get value from template using path
   */
  private getValueFromTemplate(path: string | undefined, template: any): any {
    if (!path) return template;
    return this.getValueFromContext(path, template);
  }

  /**
   * Resolve action value with context substitution
   */
  private resolveActionValue(value: any, context: RuleExecutionContext): any {
    if (typeof value === 'string' && value.includes('{{')) {
      // Replace placeholders with context values
      return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const resolvedValue = this.getValueFromContext(path.trim(), context);
        return resolvedValue != null ? resolvedValue.toString() : match;
      });
    }
    return value;
  }

  /**
   * Apply data transformation
   */
  private applyTransform(value: any, transform: TransformFunction, properties?: Record<string, any>): any {
    if (value == null) return value;

    switch (transform) {
      case 'uppercase':
        return value.toString().toUpperCase();
      
      case 'lowercase':
        return value.toString().toLowerCase();
      
      case 'capitalize':
        return value.toString().charAt(0).toUpperCase() + value.toString().slice(1).toLowerCase();
      
      case 'format_currency':
        const amount = parseFloat(value);
        const currency = properties?.currency || 'USD';
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency 
        }).format(amount);
      
      case 'format_date':
        const date = new Date(value);
        const format = properties?.format || 'MM/DD/YYYY';
        return this.formatDate(date, format);
      
      case 'format_number':
        const num = parseFloat(value);
        const decimals = properties?.decimals || 0;
        return num.toFixed(decimals);
      
      case 'truncate':
        const length = properties?.length || 50;
        const suffix = properties?.suffix || '...';
        const str = value.toString();
        return str.length > length ? str.substring(0, length) + suffix : str;
      
      default:
        return value;
    }
  }

  /**
   * Compare values with optional case sensitivity
   */
  private compareValues(a: any, b: any, caseSensitive = true): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    const aStr = caseSensitive ? a.toString() : a.toString().toLowerCase();
    const bStr = caseSensitive ? b.toString() : b.toString().toLowerCase();
    
    return aStr.localeCompare(bStr);
  }

  /**
   * Compare numeric values
   */
  private compareNumbers(a: any, b: any): number {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (isNaN(numA) && isNaN(numB)) return 0;
    if (isNaN(numA)) return -1;
    if (isNaN(numB)) return 1;
    
    return numA - numB;
  }

  /**
   * Format date with simple pattern
   */
  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * Validate rule structure
   */
  private validateRule(rule: LabelRule): void {
    if (!rule.id) {
      throw new Error('Rule ID is required');
    }
    
    if (!rule.name) {
      throw new Error('Rule name is required');
    }
    
    if (!Array.isArray(rule.conditions)) {
      throw new Error('Rule conditions must be an array');
    }
    
    if (!Array.isArray(rule.actions)) {
      throw new Error('Rule actions must be an array');
    }
    
    if (!['AND', 'OR'].includes(rule.operator)) {
      throw new Error('Rule operator must be AND or OR');
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(results: RuleExecutionResult[], totalTime: number): void {
    for (const result of results) {
      if (!this.performanceMetrics.has(result.ruleId)) {
        this.performanceMetrics.set(result.ruleId, []);
      }
      
      const metrics = this.performanceMetrics.get(result.ruleId)!;
      metrics.push(result.executionTimeMs);
      
      // Keep only last 1000 measurements
      if (metrics.length > 1000) {
        metrics.splice(0, metrics.length - 1000);
      }
    }
  }

  /**
   * Get performance statistics for a rule
   */
  getPerformanceStats(ruleId: string): {
    averageExecutionTimeMs: number;
    minExecutionTimeMs: number;
    maxExecutionTimeMs: number;
    executionCount: number;
  } | null {
    const metrics = this.performanceMetrics.get(ruleId);
    if (!metrics || metrics.length === 0) return null;

    const sum = metrics.reduce((a, b) => a + b, 0);
    
    return {
      averageExecutionTimeMs: sum / metrics.length,
      minExecutionTimeMs: Math.min(...metrics),
      maxExecutionTimeMs: Math.max(...metrics),
      executionCount: metrics.length
    };
  }

  /**
   * Get execution history for a rule
   */
  getExecutionHistory(ruleId: string, limit = 50): RuleExecutionResult[] {
    const history = this.executionHistory.get(ruleId);
    if (!history) return [];
    
    return history.slice(-limit);
  }

  /**
   * Get all active rules
   */
  getActiveRules(): LabelRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.isActive);
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): LabelRule | undefined {
    return this.rules.get(ruleId);
  }
}
