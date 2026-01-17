import OpenAI from 'openai';
import { config } from '../config/index.js';
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

const SYSTEM_PROMPT = `You are Jeetu Bhaiya, a friendly and encouraging SSC exam mentor who teaches in Hinglish (mix of Hindi and English).

Your teaching style:
- Talk like a real elder brother (bhaiya), not a robot
- Use SSC exam tricks and shortcuts, NEVER textbook methods
- Be encouraging: "Dekh bhai, ye bahut easy hai"
- Be concise and exam-focused - students have limited time
- Use phrases like "Samjha?", "Easy hai na?", "Ab dekh ye trick"

Important rules:
1. ALWAYS use the trick provided - never solve using standard algebra/formulas
2. Apply the trick to the specific numbers in the question
3. Show step-by-step how the trick works with THESE numbers
4. Keep explanations short and punchy
5. End with encouragement or a tip

You will receive:
- The student's question
- The matched pattern with its trick
- The student's level (deep/shortcut/instant)
- Teaching content to use as a guide

Respond at the appropriate depth for their level.`;

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

  let prompt = `Student's question: "${question}"

Pattern: ${pattern.name} (${pattern.name_hi})

TRICK TO USE (MUST follow this):
Name: ${pattern.trick.name}
One-liner: ${pattern.trick.one_liner}

Steps:
${pattern.trick.steps.map((s) => `${s.step}. ${s.action}\n   Example: ${s.example}`).join('\n')}
`;

  if (pattern.trick.quick_fractions) {
    prompt += `\nQuick fractions reference:\n${Object.entries(pattern.trick.quick_fractions)
      .map(([k, v]) => `  ${k} = ${v}`)
      .join('\n')}`;
  }

  if (extractedValues && Object.keys(extractedValues).length > 0) {
    prompt += `\n\nExtracted values from question: ${JSON.stringify(extractedValues)}`;
  }

  prompt += `\n\nTeaching level: ${level.toUpperCase()}
Teaching guide: ${teachingContent.explanation}

Remember:
- Apply the trick to THIS specific question with THESE numbers
- ${level === 'deep' ? 'Explain the concept thoroughly, why the trick works' : ''}
- ${level === 'shortcut' ? 'Be quick and focused, just show the trick application' : ''}
- ${level === 'instant' ? 'Ultra brief - just the trick application in 2-3 lines' : ''}
- Use Hinglish naturally`;

  if (pattern.common_mistakes && pattern.common_mistakes.length > 0) {
    prompt += `\n\nCommon mistakes to warn about:
${pattern.common_mistakes.map((m) => `- ${m.mistake}: "${m.wrong}" (wrong) vs "${m.right}" (right)`).join('\n')}`;
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
