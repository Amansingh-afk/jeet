import OpenAI from 'openai';
import { config } from '../config/index.js';
import { LLMError } from '../utils/errors.js';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    if (!config.openai.apiKey) {
      throw new LLMError('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openaiClient;
}

/**
 * Extracted content from a math problem image
 */
export interface ExtractedContent {
  /** The question text in English */
  question_text_en: string;
  /** The question text in Hindi (if visible) */
  question_text_hi?: string;
  /** MCQ options if present */
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  /** Correct answer option (a/b/c/d) if marked */
  correct_option?: string;
  /** The correct answer value */
  answer?: string | number;
  /** Solution steps extracted from handwritten work */
  solution_steps?: string[];
  /** Key values/numbers extracted from the question */
  extracted_values?: Record<string, number | string>;
  /** Topic guess (percentage, profit-loss, time-work, etc.) */
  topic_guess: string;
  /** Pattern type description */
  pattern_description: string;
  /** Whether this looks like a new pattern or variation of existing */
  is_likely_new_pattern: boolean;
  /** Suggested pattern name */
  suggested_pattern_name?: string;
  /** Suggested trick name */
  suggested_trick_name?: string;
  /** Difficulty estimate (1-5) */
  difficulty_estimate: number;
  /** Raw OCR text for reference */
  raw_text?: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Any warnings or notes */
  warnings?: string[];
}

const EXTRACTION_PROMPT = `You are an expert SSC exam math content extractor. Analyze this handwritten/printed math problem image and extract structured information.

Your task:
1. Extract the question text EXACTLY as written
2. If there are MCQ options, extract them
3. If there's handwritten solution work, extract the steps
4. Identify what topic this belongs to (percentage, profit-loss, time-work, ratio-proportion, etc.)
5. Describe the PATTERN type (e.g., "Price Increase - Quantity Decrease with Expenditure Constant")
6. Estimate if this needs a new pattern or fits existing patterns like:
   - pc-005: Price Decrease - Consumption Increase (expenditure constant)
   - pc-006: Price Increase - Consumption Decrease (expenditure constant)
   - pc-007: Price Increase - Expenditure Increase - Quantity Decrease
   - pc-008: Price Decrease - Revenue Increase - Quantity Increment

Extract all numerical values and their meanings (e.g., price_increase_percent: 20, quantity: 350).

Respond in JSON format ONLY with this structure:
{
  "question_text_en": "...",
  "question_text_hi": "..." or null,
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."} or null,
  "correct_option": "a"|"b"|"c"|"d" or null,
  "answer": "..." or number,
  "solution_steps": ["step1", "step2", ...] or null,
  "extracted_values": {"key": value, ...},
  "topic_guess": "percentage",
  "pattern_description": "...",
  "is_likely_new_pattern": true/false,
  "suggested_pattern_name": "..." or null,
  "suggested_trick_name": "..." or null,
  "difficulty_estimate": 1-5,
  "raw_text": "...",
  "confidence": 0.0-1.0,
  "warnings": ["...", "..."] or null
}`;

/**
 * Extract content from an image (base64 or URL)
 */
export async function extractFromImage(
  imageData: string,
  isBase64: boolean = true
): Promise<ExtractedContent> {
  const client = getClient();

  const imageContent = isBase64
    ? {
        type: 'image_url' as const,
        image_url: {
          url: `data:image/jpeg;base64,${imageData}`,
          detail: 'high' as const,
        },
      }
    : {
        type: 'image_url' as const,
        image_url: {
          url: imageData,
          detail: 'high' as const,
        },
      };

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            imageContent,
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for more consistent extraction
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError('No response from vision model');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const extracted = JSON.parse(jsonStr) as ExtractedContent;
    return extracted;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new LLMError('Failed to parse vision model response as JSON');
    }
    console.error('Vision extraction error:', error);
    throw new LLMError('Failed to extract content from image');
  }
}

/**
 * Extract content from multiple images (e.g., question + solution on separate pages)
 */
export async function extractFromMultipleImages(
  images: Array<{ data: string; isBase64?: boolean }>
): Promise<ExtractedContent> {
  const client = getClient();

  const imageContents = images.map((img) => {
    const isBase64 = img.isBase64 !== false;
    return {
      type: 'image_url' as const,
      image_url: {
        url: isBase64 ? `data:image/jpeg;base64,${img.data}` : img.data,
        detail: 'high' as const,
      },
    };
  });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                EXTRACTION_PROMPT +
                '\n\nNote: Multiple images are provided. They may show the same question from different angles, or question + solution separately. Combine the information.',
            },
            ...imageContents,
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError('No response from vision model');
    }

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const extracted = JSON.parse(jsonStr) as ExtractedContent;
    return extracted;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new LLMError('Failed to parse vision model response as JSON');
    }
    console.error('Vision extraction error:', error);
    throw new LLMError('Failed to extract content from images');
  }
}

export const visionService = {
  extractFromImage,
  extractFromMultipleImages,
};
