import axios from 'axios';
import FormData from 'form-data';

// AI Service Configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const RECEIPT_OCR_URL = 'http://localhost:9001';
const INSIGHTS_URL = 'http://localhost:9002';

// LLM Prompts
export const RECEIPT_POST_PROCESSOR_PROMPT = `You are a structured data normalizer. Output STRICT JSON only. Units must be ISO-like ('kg','g','L','ml','ea','box').

Given OCR receipt content and optional vendor defaults, convert to:
{
 "header": {"vendor":string,"date":string,"subtotal":number?,"tax":number?,"total":number?},
 "lines":[{"name":string,"qty":number,"unit":string,"unit_price":number,"line_total":number?,"supplier":string?,"batch":string?,"expiry":string?}]
}

If a number is missing, omit it. Never invent suppliers. If a line looks like fees or coupon, set unit='ea'.`;

export const PRICING_ADVICE_PROMPT = `You are a concise retail pricing assistant. Output one sentence of advice plus a short reason. No hedging, no emojis.

Product: {{name}}
Current price: {{price}}; Base+labor cost: {{base_cost}}; Margin%: {{marginPct}} (target {{targetLow}}–{{targetHigh}})
Competitor median: {{competitorMedian}}
Sales last 30d: {{sales30d}}

Provide pricing advice:`;

// Ollama Chat Interface
export interface OllamaChatRequest {
  model?: string;
  system?: string;
  prompt: string;
  stream?: boolean;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export async function callOllamaChat({
  system,
  prompt,
  model = 'phi3.5:mini',
  stream = false
}: OllamaChatRequest): Promise<string> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      system,
      prompt,
      stream
    });

    if (stream) {
      // Handle streaming response
      return response.data.response || '';
    } else {
      return response.data.response || '';
    }
  } catch (error) {
    console.error('Ollama chat error:', error);
    throw new Error(`Ollama chat failed: ${error}`);
  }
}

// BGE Embeddings
export interface BGEEmbeddingRequest {
  model: string;
  prompt: string;
}

export interface BGEEmbeddingResponse {
  model: string;
  created_at: string;
  response: number[];
}

export async function embedTextBGE(texts: string[]): Promise<number[][]> {
  try {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
        model: 'bge-small',
        prompt: text
      });
      
      embeddings.push(response.data.embedding);
    }
    
    return embeddings;
  } catch (error) {
    console.error('BGE embedding error:', error);
    throw new Error(`BGE embedding failed: ${error}`);
  }
}

// OCR Receipt Parsing
export interface OCRParseRequest {
  file?: Buffer;
  filename?: string;
  text?: string;
}

export interface OCRParseResponse {
  jobId: string;
  status: string;
  parsed_json?: any;
  error?: string;
}

export async function ocrParse({ file, filename, text }: OCRParseRequest): Promise<OCRParseResponse> {
  try {
    if (file && filename) {
      // File upload
      const formData = new FormData();
      formData.append('file', file, filename);
      
      const response = await axios.post(`${RECEIPT_OCR_URL}/parse`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      
      return response.data;
    } else if (text) {
      // Text input
      const response = await axios.post(`${RECEIPT_OCR_URL}/parse-text`, {
        text
      });
      
      return response.data;
    } else {
      throw new Error('Either file or text must be provided');
    }
  } catch (error) {
    console.error('OCR parse error:', error);
    throw new Error(`OCR parsing failed: ${error}`);
  }
}

// Forecasting
export interface ForecastDataPoint {
  date: string;
  consumed: number;
}

export interface ForecastRequest {
  data: ForecastDataPoint[];
  periods?: number;
}

export interface ForecastResponse {
  forecast: Array<{
    date: string;
    predicted: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  trend: string;
  seasonality: Record<string, number>;
}

export async function forecastSeries(series: ForecastDataPoint[], periods = 56): Promise<ForecastResponse> {
  try {
    const response = await axios.post(`${INSIGHTS_URL}/forecast`, {
      data: series,
      periods
    });
    
    return response.data;
  } catch (error) {
    console.error('Forecast error:', error);
    throw new Error(`Forecasting failed: ${error}`);
  }
}

// Anomaly Detection
export interface AnomalyRequest {
  data: number[];
  contamination?: number;
}

export interface AnomalyResponse {
  anomalies: boolean[];
  scores: number[];
}

export async function detectAnomalies(data: number[], contamination = 0.1): Promise<AnomalyResponse> {
  try {
    const response = await axios.post(`${INSIGHTS_URL}/anomaly`, {
      data,
      contamination
    });
    
    return response.data;
  } catch (error) {
    console.error('Anomaly detection error:', error);
    throw new Error(`Anomaly detection failed: ${error}`);
  }
}

// Seasonal Analysis
export async function analyzeSeasonality(series: ForecastDataPoint[]): Promise<any> {
  try {
    const response = await axios.post(`${INSIGHTS_URL}/seasonal-analysis`, {
      data: series
    });
    
    return response.data;
  } catch (error) {
    console.error('Seasonal analysis error:', error);
    throw new Error(`Seasonal analysis failed: ${error}`);
  }
}

// Demand Pattern Analysis
export async function analyzeDemandPatterns(series: ForecastDataPoint[]): Promise<any> {
  try {
    const response = await axios.post(`${INSIGHTS_URL}/demand-patterns`, {
      data: series
    });
    
    return response.data;
  } catch (error) {
    console.error('Demand pattern analysis error:', error);
    throw new Error(`Demand pattern analysis failed: ${error}`);
  }
}

// Utility Functions
export function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'lb': 'kg', 'lbs': 'kg', 'pound': 'kg', 'pounds': 'kg',
    'oz': 'g', 'ounce': 'g', 'ounces': 'g',
    'gal': 'L', 'gallon': 'L', 'gallons': 'L',
    'qt': 'L', 'quart': 'L', 'quarts': 'L',
    'pt': 'ml', 'pint': 'ml', 'pints': 'ml',
    'fl oz': 'ml', 'fluid ounce': 'ml', 'fluid ounces': 'ml',
    'piece': 'ea', 'pieces': 'ea', 'each': 'ea', 'item': 'ea', 'items': 'ea',
    'box': 'box', 'boxes': 'box', 'case': 'case', 'cases': 'case',
    'bag': 'bag', 'bags': 'bag', 'bottle': 'bottle', 'bottles': 'bottle',
    'can': 'can', 'cans': 'can', 'jar': 'jar', 'jars': 'jar'
  };
  
  return unitMap[unit.toLowerCase()] || unit.toLowerCase();
}

export function calculateMovingAverage(
  currentQty: number,
  currentAvgCost: number,
  newQty: number,
  newUnitCost: number
): number {
  const totalQty = currentQty + newQty;
  const totalCost = (currentQty * currentAvgCost) + (newQty * newUnitCost);
  
  return totalQty > 0 ? totalCost / totalQty : newUnitCost;
}

export function generatePricingAdvice(
  name: string,
  price: number,
  baseCost: number,
  marginPct: number,
  targetLow: number,
  targetHigh: number,
  competitorMedian?: number,
  sales30d?: number
): string {
  const prompt = PRICING_ADVICE_PROMPT
    .replace('{{name}}', name)
    .replace('{{price}}', price.toString())
    .replace('{{base_cost}}', baseCost.toString())
    .replace('{{marginPct}}', marginPct.toString())
    .replace('{{targetLow}}', targetLow.toString())
    .replace('{{targetHigh}}', targetHigh.toString())
    .replace('{{competitorMedian}}', competitorMedian?.toString() || 'N/A')
    .replace('{{sales30d}}', sales30d?.toString() || 'N/A');

  return prompt;
}

// Health Check Functions
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return true;
  } catch {
    return false;
  }
}

export async function checkReceiptOCRHealth(): Promise<boolean> {
  try {
    await axios.get(`${RECEIPT_OCR_URL}/healthz`);
    return true;
  } catch {
    return false;
  }
}

export async function checkInsightsHealth(): Promise<boolean> {
  try {
    await axios.get(`${INSIGHTS_URL}/healthz`);
    return true;
  } catch {
    return false;
  }
}

export async function checkAllAIHealth(): Promise<{
  ollama: boolean;
  receiptOCR: boolean;
  insights: boolean;
  allHealthy: boolean;
}> {
  const [ollama, receiptOCR, insights] = await Promise.all([
    checkOllamaHealth(),
    checkReceiptOCRHealth(),
    checkInsightsHealth()
  ]);

  return {
    ollama,
    receiptOCR,
    insights,
    allHealthy: ollama && receiptOCR && insights
  };
}
