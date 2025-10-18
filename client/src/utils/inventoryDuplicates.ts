import type { InventoryItem } from '../hooks/useInventory';

export interface DuplicateGroup {
  id: string;
  items: InventoryItem[];
  confidence: number;
  reason: string;
}

export interface DuplicateDetectionOptions {
  nameSimilarityThreshold: number;
  categoryMatchRequired: boolean;
  supplierMatchBonus: number;
  unitMatchBonus: number;
}

const defaultOptions: DuplicateDetectionOptions = {
  nameSimilarityThreshold: 0.7,
  categoryMatchRequired: true,
  supplierMatchBonus: 0.2,
  unitMatchBonus: 0.1
};

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }
  
  return matrix[str2.length]![str1.length]!;
}

/**
 * Normalize string for comparison (remove extra spaces, convert to lowercase, etc.)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, ''); // Remove special characters
}

/**
 * Check if two inventory items are potential duplicates
 */
function arePotentialDuplicates(
  item1: InventoryItem, 
  item2: InventoryItem, 
  options: DuplicateDetectionOptions = defaultOptions
): { isDuplicate: boolean; confidence: number; reason: string } {
  // Normalize names for comparison
  const name1 = normalizeString(item1.name);
  const name2 = normalizeString(item2.name);
  
  // Calculate name similarity
  const nameSimilarity = calculateSimilarity(name1, name2);
  
  // Check if names are similar enough
  if (nameSimilarity < options.nameSimilarityThreshold) {
    return { isDuplicate: false, confidence: 0, reason: 'Names too different' };
  }
  
  // If category match is required, check categories
  if (options.categoryMatchRequired && item1.category !== item2.category) {
    return { isDuplicate: false, confidence: 0, reason: 'Categories don\'t match' };
  }
  
  let confidence = nameSimilarity;
  let reason = `Name similarity: ${(nameSimilarity * 100).toFixed(1)}%`;
  
  // Add bonus for matching supplier
  if (item1.supplier === item2.supplier) {
    confidence += options.supplierMatchBonus;
    reason += `, Same supplier (+${(options.supplierMatchBonus * 100).toFixed(1)}%)`;
  }
  
  // Add bonus for matching unit
  if (item1.unit === item2.unit) {
    confidence += options.unitMatchBonus;
    reason += `, Same unit (+${(options.unitMatchBonus * 100).toFixed(1)}%)`;
  }
  
  // Add bonus for matching category (even if not required)
  if (item1.category === item2.category) {
    confidence += 0.1;
    reason += ', Same category (+10%)';
  }
  
  // Add bonus for similar descriptions
  const desc1 = normalizeString(item1.description);
  const desc2 = normalizeString(item2.description);
  if (desc1 && desc2) {
    const descSimilarity = calculateSimilarity(desc1, desc2);
    if (descSimilarity > 0.5) {
      confidence += descSimilarity * 0.1;
      reason += `, Similar description (+${(descSimilarity * 10).toFixed(1)}%)`;
    }
  }
  
  return {
    isDuplicate: confidence >= 0.6, // Minimum confidence threshold
    confidence: Math.min(confidence, 1.0),
    reason
  };
}

/**
 * Find all potential duplicate groups in the inventory
 */
export function findDuplicateGroups(
  items: InventoryItem[],
  options: DuplicateDetectionOptions = defaultOptions
): DuplicateGroup[] {
  const duplicateGroups: DuplicateGroup[] = [];
  const processedItems = new Set<string>();
  
  for (let i = 0; i < items.length; i++) {
    const item1 = items[i];
    if (!item1) continue;
    
    // Skip if already processed
    if (processedItems.has(item1.id)) continue;
    
    const duplicates = [item1];
    
    // Find all items that could be duplicates of item1
    for (let j = i + 1; j < items.length; j++) {
      const item2 = items[j];
      if (!item2) continue;
      
      // Skip if already processed
      if (processedItems.has(item2.id)) continue;
      
      const duplicateCheck = arePotentialDuplicates(item1, item2, options);
      
      if (duplicateCheck.isDuplicate) {
        duplicates.push(item2);
        processedItems.add(item2.id);
      }
    }
    
    // If we found duplicates, create a group
    if (duplicates.length > 1) {
      processedItems.add(item1.id);
      
      // Calculate average confidence for the group
      let totalConfidence = 0;
      let confidenceCount = 0;
      
      for (let k = 1; k < duplicates.length; k++) {
        const duplicate = duplicates[k];
        if (!duplicate) continue;
        const check = arePotentialDuplicates(item1, duplicate, options);
        totalConfidence += check.confidence;
        confidenceCount++;
      }
      
      const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
      
      duplicateGroups.push({
        id: `group-${item1.id}`,
        items: duplicates,
        confidence: avgConfidence,
        reason: duplicates.length > 2 ? 
          `Multiple potential duplicates found (${duplicates.length} items)` :
          arePotentialDuplicates(item1, duplicates[1], options).reason
      });
    }
  }
  
  return duplicateGroups;
}

/**
 * Get duplicate suggestions for a specific item
 */
export function getDuplicateSuggestions(
  item: InventoryItem,
  allItems: InventoryItem[],
  options: DuplicateDetectionOptions = defaultOptions
): InventoryItem[] {
  const suggestions: InventoryItem[] = [];
  
  for (const otherItem of allItems) {
    if (otherItem.id === item.id) continue;
    
    const duplicateCheck = arePotentialDuplicates(item, otherItem, options);
    
    if (duplicateCheck.isDuplicate) {
      suggestions.push(otherItem);
    }
  }
  
  // Sort by confidence (we'd need to recalculate for sorting, but for now just return as found)
  return suggestions;
}

/**
 * Check if an item has potential duplicates
 */
export function hasPotentialDuplicates(
  item: InventoryItem,
  allItems: InventoryItem[]
): boolean {
  return getDuplicateSuggestions(item, allItems).length > 0;
}

/**
 * Get confidence level color for display
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
  if (confidence >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-yellow-600 bg-yellow-50 border-yellow-200';
}

/**
 * Get confidence level text for display
 */
export function getConfidenceText(confidence: number): string {
  if (confidence >= 0.8) return 'High Risk';
  if (confidence >= 0.6) return 'Medium Risk';
  return 'Low Risk';
}
