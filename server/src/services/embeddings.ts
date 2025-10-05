import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export interface EmbeddingResponse {
  embedding: number[];
}

export interface EmbeddingRequest {
  model: string;
  prompt: string;
}

/**
 * Generate embeddings using Ollama's bge-small model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post<EmbeddingResponse>(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: 'bge-small',
      prompt: text,
    });

    return response.data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for product data
 */
export async function generateProductEmbedding(product: {
  name: string;
  description?: string;
  tags?: string[];
}): Promise<number[]> {
  // Combine product information into a single text
  const textParts = [
    product.name,
    product.description || '',
    product.tags?.join(' ') || '',
  ].filter(Boolean);

  const combinedText = textParts.join(' ').substring(0, 500); // Limit to 500 chars
  return generateEmbedding(combinedText);
}

/**
 * Generate embeddings for search queries
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

/**
 * Check if Ollama is available and bge-small model is installed
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models || [];
    return models.some((model: any) => model.name === 'bge-small');
  } catch (error) {
    console.error('Ollama not available:', error);
    return false;
  }
}

/**
 * Install bge-small model if not available
 */
export async function installBgeSmallModel(): Promise<void> {
  try {
    console.log('Installing bge-small model...');
    await axios.post(`${OLLAMA_BASE_URL}/api/pull`, {
      name: 'bge-small',
    });
    console.log('bge-small model installed successfully');
  } catch (error) {
    console.error('Error installing bge-small model:', error);
    throw new Error('Failed to install bge-small model');
  }
}

/**
 * Convert embedding array to PostgreSQL vector format
 */
export function embeddingToVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Convert PostgreSQL vector to embedding array
 */
export function vectorToEmbedding(vector: string): number[] {
  return vector.slice(1, -1).split(',').map(Number);
}
