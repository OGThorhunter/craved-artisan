// CSV export utilities for the job cost estimator

export interface ProcurementRow {
  ingredient: string;
  requiredNet: number;
  bufferPercent: number;
  requiredGross: number;
  packsToBuy: number;
  roundedQty: number;
  leftover: number;
  supplier: string;
  unit: string;
}

export interface CostingRow {
  ingredient: string;
  packs: number;
  packPrice: number;
  extendedCost: number;
}

export interface CostingSummary {
  totalIngredientCost: number;
  costPerTargetUnit: number;
  targetQuantity: number;
}

export function escapeCSVField(field: string | number): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCSV(
  procurementRows: ProcurementRow[],
  costingRows: CostingRow[],
  summary: CostingSummary,
  recipeName: string
): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`Job Cost Estimator Results - ${recipeName}`);
  lines.push(`Generated on ${new Date().toLocaleDateString()}`);
  lines.push('');
  
  // Procurement Table
  lines.push('PROCUREMENT TABLE');
  lines.push('Ingredient,Required Net,Buffer (%),Required Gross,Packs to Buy,Rounded Qty,Leftover,Supplier,Unit');
  
  procurementRows.forEach(row => {
    const csvRow = [
      escapeCSVField(row.ingredient),
      escapeCSVField(row.requiredNet.toFixed(2)),
      escapeCSVField(row.bufferPercent.toFixed(1)),
      escapeCSVField(row.requiredGross.toFixed(2)),
      escapeCSVField(row.packsToBuy),
      escapeCSVField(row.roundedQty.toFixed(2)),
      escapeCSVField(row.leftover.toFixed(2)),
      escapeCSVField(row.supplier),
      escapeCSVField(row.unit)
    ].join(',');
    lines.push(csvRow);
  });
  
  lines.push('');
  
  // Costing Table
  lines.push('COSTING TABLE');
  lines.push('Ingredient,Packs,Pack Price,Extended Cost');
  
  costingRows.forEach(row => {
    const csvRow = [
      escapeCSVField(row.ingredient),
      escapeCSVField(row.packs),
      escapeCSVField(row.packPrice.toFixed(2)),
      escapeCSVField(row.extendedCost.toFixed(2))
    ].join(',');
    lines.push(csvRow);
  });
  
  lines.push('');
  
  // Summary
  lines.push('SUMMARY');
  lines.push(`Total Ingredient Cost,$${summary.totalIngredientCost.toFixed(2)}`);
  lines.push(`Cost per ${summary.targetQuantity > 1 ? 'unit' : 'batch'},$${summary.costPerTargetUnit.toFixed(2)}`);
  lines.push(`Target Quantity,${summary.targetQuantity}`);
  
  return lines.join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateFilename(recipeName: string): string {
  const sanitizedName = recipeName.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `job_cost_estimator_${sanitizedName}_${date}.csv`;
}





















