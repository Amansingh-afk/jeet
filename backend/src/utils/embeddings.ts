import OpenAI from 'openai';
import { config } from '../config/index.js';

let openaiClient: OpenAI | null = null;

/**
 * Normalize text for embedding by replacing specific values with generic placeholders.
 * This improves similarity matching for questions that differ only in numbers.
 *
 * Examples:
 *   "salt decreases by 20%" → "salt decreases by X%"
 *   "A sells to B at Rs 500" → "A sells to B at Rs X"
 *   "3 men can do work in 5 days" → "X men can do work in X days"
 */
export function normalizeForEmbedding(text: string): string {
  return text
    // Percentages: 20%, 30.5% → X%
    .replace(/\d+(\.\d+)?%/g, 'X%')
    // Rupees: ₹500, ₹1,000, ₹ 500 → ₹X
    .replace(/₹\s?\d[\d,]*(\.\d+)?/g, '₹X')
    // Rs notation: Rs 500, Rs. 1000 → Rs X
    .replace(/Rs\.?\s?\d[\d,]*(\.\d+)?/gi, 'Rs X')
    // Standalone numbers: 5 years, 3 men, 100 → X years, X men, X
    .replace(/\b\d[\d,]*(\.\d+)?\b/g, 'X');
}

function getClient(): OpenAI {
  if (!openaiClient) {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openaiClient;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getClient();

  // OpenAI supports up to 2048 inputs per request
  const batchSize = 100;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });

    results.push(...response.data.map((d) => d.embedding));

    // Rate limiting - wait a bit between batches
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Format embedding array for pgvector insertion
 * pgvector expects format: [0.1, 0.2, 0.3, ...]
 */
export function formatEmbeddingForPg(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Create text for pattern embedding
 * Prefers embedding_text if available, otherwise uses structure + keywords
 */
export function createPatternEmbeddingText(pattern: {
  name: string;
  signature: {
    structure: string;
    keywords: string[];
    variations?: string[];
    embedding_text?: string;
  };
}): string {
  // Prefer explicit embedding_text if provided
  if (pattern.signature.embedding_text) {
    return pattern.signature.embedding_text;
  }

  // Fallback to structure + keywords + variations
  const parts = [
    pattern.signature.structure,
    pattern.signature.keywords.join(' '),
  ];

  if (pattern.signature.variations?.length) {
    parts.push(pattern.signature.variations.join(' '));
  }

  // Normalize to handle any numbers in the structure/variations
  return normalizeForEmbedding(parts.join(' '));
}

/**
 * Create text for question embedding
 * Normalizes numbers to improve matching across variations
 */
export function createQuestionEmbeddingText(question: {
  text: { en: string; hi?: string };
}): string {
  return normalizeForEmbedding(question.text.en);
}
