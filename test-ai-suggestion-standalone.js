// Standalone test for AI Price Suggestion Algorithm

// AI Price Suggestion Function
function suggestAiPrice(unitCost, history, targetMargin) {
  if (history.length === 0) {
    // No history available, use basic calculation
    const suggestedPrice = unitCost / (1 - targetMargin / 100);
    return {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      note: 'No price history available. Using basic margin calculation.',
      volatilityDetected: false,
      confidence: 0.5
    };
  }

  // Calculate price volatility
  const prices = history.map(h => h.price);
  const meanPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - meanPrice, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / meanPrice;

  // Detect volatility (CV > 0.15 indicates high volatility)
  const volatilityDetected = coefficientOfVariation > 0.15;

  // Calculate cost volatility
  const costs = history.map(h => h.unitCost);
  const meanCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
  const costVariance = costs.reduce((sum, cost) => sum + Math.pow(cost - meanCost, 2), 0) / costs.length;
  const costStandardDeviation = Math.sqrt(costVariance);
  const costCoefficientOfVariation = costStandardDeviation / meanCost;

  // Calculate trend (simple linear regression)
  const n = history.length;
  const sumX = history.reduce((sum, _, index) => sum + index, 0);
  const sumY = history.reduce((sum, h) => sum + h.price, 0);
  const sumXY = history.reduce((sum, h, index) => sum + index * h.price, 0);
  const sumX2 = history.reduce((sum, _, index) => sum + index * index, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';

  // Calculate suggested price based on multiple factors
  let suggestedPrice;
  let note;
  let confidence;

  if (volatilityDetected) {
    // High volatility: use more conservative pricing
    const volatilityAdjustment = 1 + (coefficientOfVariation * 0.1);
    const basePrice = unitCost / (1 - targetMargin / 100);
    suggestedPrice = basePrice * volatilityAdjustment;
    note = `High price volatility detected (${(coefficientOfVariation * 100).toFixed(1)}% CV). Using conservative pricing with ${(volatilityAdjustment * 100 - 100).toFixed(1)}% adjustment.`;
    confidence = 0.7;
  } else if (costCoefficientOfVariation > 0.1) {
    // High cost volatility: adjust for cost uncertainty
    const costAdjustment = 1 + (costCoefficientOfVariation * 0.05);
    const basePrice = unitCost / (1 - targetMargin / 100);
    suggestedPrice = basePrice * costAdjustment;
    note = `High cost volatility detected (${(costCoefficientOfVariation * 100).toFixed(1)}% CV). Adjusting for cost uncertainty.`;
    confidence = 0.8;
  } else {
    // Stable conditions: use trend-adjusted pricing
    const trendAdjustment = trend === 'increasing' ? 1.02 : trend === 'decreasing' ? 0.98 : 1.0;
    const basePrice = unitCost / (1 - targetMargin / 100);
    suggestedPrice = basePrice * trendAdjustment;
    note = `Stable market conditions. ${trend} price trend detected. Using trend-adjusted pricing.`;
    confidence = 0.9;
  }

  // Ensure minimum margin is maintained
  const minMargin = targetMargin * 0.8; // Allow 20% margin buffer
  const minPrice = unitCost / (1 - minMargin / 100);
  if (suggestedPrice < minPrice) {
    suggestedPrice = minPrice;
    note += ' Adjusted to maintain minimum margin requirements.';
  }

  return {
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    note,
    volatilityDetected,
    confidence
  };
}

// Test cases
console.log('🧪 Testing AI Price Suggestion Algorithm\n');

// Test 1: Basic calculation with no history
console.log('Test 1: Basic calculation (no history)');
const test1 = suggestAiPrice(15, [], 30);
console.log(`Unit Cost: $15, Target Margin: 30%`);
console.log(`Suggested Price: $${test1.suggestedPrice}`);
console.log(`Note: ${test1.note}`);
console.log(`Confidence: ${test1.confidence}`);
console.log(`Volatility: ${test1.volatilityDetected}\n`);

// Test 2: Stable market conditions
console.log('Test 2: Stable market conditions');
const stableHistory = [
  { price: 20, date: '2024-01-01', unitCost: 15 },
  { price: 20.5, date: '2024-01-02', unitCost: 15.2 },
  { price: 19.8, date: '2024-01-03', unitCost: 14.9 }
];
const test2 = suggestAiPrice(15, stableHistory, 30);
console.log(`Unit Cost: $15, Target Margin: 30%`);
console.log(`Suggested Price: $${test2.suggestedPrice}`);
console.log(`Note: ${test2.note}`);
console.log(`Confidence: ${test2.confidence}`);
console.log(`Volatility: ${test2.volatilityDetected}\n`);

// Test 3: High volatility market
console.log('Test 3: High volatility market');
const volatileHistory = [
  { price: 20, date: '2024-01-01', unitCost: 15 },
  { price: 25, date: '2024-01-02', unitCost: 15 },
  { price: 18, date: '2024-01-03', unitCost: 15 },
  { price: 22, date: '2024-01-04', unitCost: 15 },
  { price: 28, date: '2024-01-05', unitCost: 15 }
];
const test3 = suggestAiPrice(15, volatileHistory, 30);
console.log(`Unit Cost: $15, Target Margin: 30%`);
console.log(`Suggested Price: $${test3.suggestedPrice}`);
console.log(`Note: ${test3.note}`);
console.log(`Confidence: ${test3.confidence}`);
console.log(`Volatility: ${test3.volatilityDetected}\n`);

// Test 4: High cost volatility
console.log('Test 4: High cost volatility');
const costVolatileHistory = [
  { price: 20, date: '2024-01-01', unitCost: 15 },
  { price: 20, date: '2024-01-02', unitCost: 18 },
  { price: 20, date: '2024-01-03', unitCost: 12 },
  { price: 20, date: '2024-01-04', unitCost: 16 }
];
const test4 = suggestAiPrice(15, costVolatileHistory, 30);
console.log(`Unit Cost: $15, Target Margin: 30%`);
console.log(`Suggested Price: $${test4.suggestedPrice}`);
console.log(`Note: ${test4.note}`);
console.log(`Confidence: ${test4.confidence}`);
console.log(`Volatility: ${test4.volatilityDetected}\n`);

// Test 5: Increasing trend
console.log('Test 5: Increasing trend');
const increasingHistory = [
  { price: 18, date: '2024-01-01', unitCost: 15 },
  { price: 19, date: '2024-01-02', unitCost: 15 },
  { price: 20, date: '2024-01-03', unitCost: 15 },
  { price: 21, date: '2024-01-04', unitCost: 15 }
];
const test5 = suggestAiPrice(15, increasingHistory, 30);
console.log(`Unit Cost: $15, Target Margin: 30%`);
console.log(`Suggested Price: $${test5.suggestedPrice}`);
console.log(`Note: ${test5.note}`);
console.log(`Confidence: ${test5.confidence}`);
console.log(`Volatility: ${test5.volatilityDetected}\n`);

console.log('✅ All tests completed!'); 