import OpenAI from 'openai';
import { config } from '../config/index.js';
import { JEETU_BHAIYA_PROMPT } from '../config/prompts.js';
import { LLMError } from '../utils/errors.js';
import type { Pattern, TeachingLevelType, ChatChunk } from '../types/index.js';

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

// Jeetu Bhaiya persona prompt - versioned in config/prompts.ts
const SYSTEM_PROMPT = JEETU_BHAIYA_PROMPT.system;

export interface GenerateResponseParams {
  question: string;
  pattern: Pattern;
  level: TeachingLevelType;
  extractedValues?: Record<string, unknown>;
}

export const llmService = {
  /**
   * Generate a streaming response
   */
  async *streamResponse(params: GenerateResponseParams): AsyncGenerator<ChatChunk> {
    const client = getClient();

    const userPrompt = buildUserPrompt(params);

    try {
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield { type: 'content', content };
        }
      }

      // If pattern has a diagram, yield it at the end
      if (params.pattern.visual?.has_diagram && params.pattern.visual.template_id) {
        yield {
          type: 'diagram',
          template_id: params.pattern.visual.template_id,
          params: buildDiagramParams(params),
        };
      }

      yield {
        type: 'done',
        metadata: {
          pattern_id: params.pattern.id,
          level: params.level,
        },
      };
    } catch (error) {
      console.error('LLM streaming error:', error);
      yield {
        type: 'error',
        content: 'Sorry bhai, kuch technical issue ho gaya. Dobara try kar.',
      };
    }
  },

  /**
   * Generate a non-streaming response (for testing)
   */
  async generateResponse(params: GenerateResponseParams): Promise<string> {
    const client = getClient();

    const userPrompt = buildUserPrompt(params);

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('LLM error:', error);
      throw new LLMError('Failed to generate response');
    }
  },
};

function buildUserPrompt(params: GenerateResponseParams): string {
  const { question, pattern, level, extractedValues } = params;

  const teachingContent = pattern.teaching[level];

  // Level-specific instructions
  const levelInstructions = {
    instant: '1-2 lines mein answer de. Sirf trick apply kar, explanation mat de.',
    shortcut: '4-5 lines mein solve kar. Trick steps dikhaa with numbers. No theory.',
    deep: 'Full explanation de - concept, trick logic, steps with numbers, tip. 8-10 lines okay.',
  };

  let prompt = `Question: "${question}"

Pattern: ${pattern.name}
Trick: ${pattern.trick.one_liner}

Steps:
${pattern.trick.steps.map((s) => `${s.step}. ${s.action} (e.g., ${s.example})`).join('\n')}
`;

  if (pattern.trick.quick_fractions) {
    prompt += `\nFractions: ${Object.entries(pattern.trick.quick_fractions)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')}`;
  }

  if (extractedValues && Object.keys(extractedValues).length > 0) {
    prompt += `\n\nValues: ${Object.entries(extractedValues)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')}`;
  }

  prompt += `\n\n---
Level: ${level.toUpperCase()}
${levelInstructions[level]}

Reference explanation: ${teachingContent.explanation}`;

  if (pattern.common_mistakes && pattern.common_mistakes.length > 0 && level !== 'instant') {
    const mistake = pattern.common_mistakes[0];
    prompt += `\n\nCommon galti: ${mistake.mistake} - "${mistake.wrong}" nahi, "${mistake.right}" hona chahiye.`;
  }

  return prompt;
}

function buildDiagramParams(params: GenerateResponseParams): Record<string, string> {
  const { pattern, extractedValues } = params;
  const diagramParams: Record<string, string> = {};

  // Build params based on visual annotations and extracted values
  if (pattern.visual?.annotations) {
    for (const [key, value] of Object.entries(pattern.visual.annotations)) {
      diagramParams[key] = value;
    }
  }

  // Handle pc-005 pattern: Price Decrease - Consumption Increase
  if (pattern.id === 'pc-005' && extractedValues) {
    const decreasePercent = (extractedValues.decrease_percent as number) ||
                            (extractedValues.percent as number) ||
                            (Array.isArray(extractedValues.percentages) ? extractedValues.percentages[0] : null);

    if (decreasePercent && decreasePercent > 0 && decreasePercent < 100) {
      // Calculate remaining price fraction
      // e.g., 20% decrease → 80% remaining → 4/5
      const remaining = 100 - decreasePercent;
      const { numerator, denominator } = simplifyFraction(remaining, 100);

      // For price decrease pattern:
      // Left fraction shows the decrease: -1/denominator (decrease of 1 part)
      // Right fraction shows consumption increase: +1/(denominator-numerator)
      const decreaseNumerator = denominator - numerator; // e.g., 5-4 = 1
      const consumptionDenominator = numerator; // e.g., 4

      diagramParams['numerator_left'] = `-${decreaseNumerator}`;
      diagramParams['denominator_left'] = `${denominator}`;
      diagramParams['numerator_right'] = `+${decreaseNumerator}`;
      diagramParams['denominator_right'] = `${consumptionDenominator}`;
      diagramParams['calculation'] = `-${decreaseNumerator}+${denominator}`;
      diagramParams['sign_change_label'] = 'Sign change';
    }
  }

  // Override with extracted values if available (for other patterns)
  if (extractedValues) {
    if (extractedValues.profit_1) {
      diagramParams['arrow_1_label'] = `${extractedValues.profit_1}% profit`;
    }
    if (extractedValues.profit_2) {
      diagramParams['arrow_2_label'] = `${extractedValues.profit_2}% profit`;
    }
    if (extractedValues.final_price) {
      diagramParams['value_3'] = `₹${extractedValues.final_price}`;
    }
  }

  return diagramParams;
}

/**
 * Simplify a fraction to lowest terms using GCD
 */
function simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}
