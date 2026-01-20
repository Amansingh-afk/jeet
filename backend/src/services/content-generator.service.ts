import OpenAI from 'openai';
import { config } from '../config/index.js';
import { LLMError } from '../utils/errors.js';
import type { ExtractedContent } from './vision.service.js';

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
 * Generated pattern JSON structure
 */
export interface GeneratedPattern {
  id: string;
  topic_id: string;
  name: string;
  name_hi: string;
  slug: string;
  signature: {
    embedding_text: string;
    variables: string[];
  };
  trick: {
    name: string;
    name_hi: string;
    one_liner: string;
    steps: Array<{
      step: number;
      action: string;
      action_hi: string;
      example: string;
      example_hi: string;
    }>;
    formula: string;
    formula_latex?: string;
    memory_hook: string;
    alternatives: unknown[];
  };
  common_mistakes: Array<{
    mistake: string;
    wrong: string;
    right: string;
    why: string;
  }>;
  teaching: {
    deep: {
      explanation: string;
      duration_seconds: number;
      includes: string[];
    };
    shortcut: {
      explanation: string;
      duration_seconds: number;
      includes: string[];
    };
    instant: {
      explanation: string;
      duration_seconds: number;
      includes: string[];
    };
  };
  visual: {
    has_diagram: boolean;
    template_id: string | null;
    description: string;
    when_to_show: string;
  };
  prerequisites: {
    patterns: string[];
    concepts: string[];
  };
  metadata: {
    difficulty: number;
    frequency: string;
    years_appeared: number[];
    avg_time_target_seconds: number;
    related_patterns: string[];
    tags: string[];
  };
}

/**
 * Generated question JSON structure
 */
export interface GeneratedQuestion {
  id: string;
  pattern_id: string;
  topic_id: string;
  text: {
    en: string;
    hi?: string;
  };
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct?: string;
  extracted_values?: Record<string, unknown>;
  solution?: {
    trick_application: string[];
    answer: string | number;
    answer_display: string;
  };
  difficulty: number;
  is_pyq: boolean;
  is_variation: boolean;
  embedding: null;
}

/**
 * Result of content generation
 */
export interface GenerationResult {
  pattern?: GeneratedPattern;
  question: GeneratedQuestion;
  is_new_pattern: boolean;
  suggested_pattern_id: string;
  suggested_question_id: string;
  warnings: string[];
}

const PATTERN_GENERATION_PROMPT = `You are an expert at creating SSC exam math pattern JSON files. Generate a complete pattern JSON based on the extracted content.

The pattern should:
1. Have a clear, descriptive name in English and Hindi
2. Include an embedding_text that captures the pattern's essence for semantic search
3. Document the trick in Hinglish (mix of Hindi and English) - this is how SSC coaching works
4. Include step-by-step trick application with examples
5. List common mistakes students make
6. Provide teaching content for 3 levels: deep (3+ mins), shortcut (1 min), instant (15 sec)

IMPORTANT:
- The trick should be SSC-style shortcuts, NOT textbook algebra
- Use Hinglish naturally (English words mixed with Hindi)
- Make memory hooks catchy and memorable
- Tags should include: topic keywords, method type, key concepts

Respond with ONLY the JSON object (no markdown, no explanation).`;

const QUESTION_GENERATION_PROMPT = `You are an expert at creating SSC exam question JSON files. Generate a complete question JSON based on the extracted content.

The question should:
1. Have the exact question text in English (and Hindi if available)
2. Include options if they were extracted
3. Include the correct answer
4. List extracted values (numbers and their meanings)
5. Show solution using the TRICK method, not textbook algebra
6. Each solution step should show trick application with actual numbers

IMPORTANT:
- solution.trick_application should be an array of strings showing each step
- extracted_values should map variable names to their values
- difficulty should be 1-5 based on complexity

Respond with ONLY the JSON object (no markdown, no explanation).`;

/**
 * Generate pattern JSON from extracted content
 */
export async function generatePattern(
  extracted: ExtractedContent,
  patternId: string,
  topicId: string
): Promise<GeneratedPattern> {
  const client = getClient();

  const prompt = `${PATTERN_GENERATION_PROMPT}

Extracted content:
- Pattern description: ${extracted.pattern_description}
- Suggested pattern name: ${extracted.suggested_pattern_name || 'Not provided'}
- Suggested trick name: ${extracted.suggested_trick_name || 'Not provided'}
- Topic: ${topicId}
- Sample question: ${extracted.question_text_en}
- Solution steps: ${JSON.stringify(extracted.solution_steps || [])}
- Extracted values: ${JSON.stringify(extracted.extracted_values || {})}
- Difficulty: ${extracted.difficulty_estimate}

Required fields:
- id: "${patternId}"
- topic_id: "${topicId}"

Generate the complete pattern JSON:`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError('No response from LLM');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const pattern = JSON.parse(jsonStr) as GeneratedPattern;

    // Ensure required fields are set
    pattern.id = patternId;
    pattern.topic_id = topicId;

    return pattern;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new LLMError('Failed to parse generated pattern as JSON');
    }
    console.error('Pattern generation error:', error);
    throw new LLMError('Failed to generate pattern');
  }
}

/**
 * Generate question JSON from extracted content
 */
export async function generateQuestion(
  extracted: ExtractedContent,
  questionId: string,
  patternId: string,
  topicId: string,
  isVariation: boolean = false
): Promise<GeneratedQuestion> {
  const client = getClient();

  const prompt = `${QUESTION_GENERATION_PROMPT}

Extracted content:
- Question text (EN): ${extracted.question_text_en}
- Question text (HI): ${extracted.question_text_hi || 'Not provided'}
- Options: ${JSON.stringify(extracted.options || null)}
- Correct option: ${extracted.correct_option || 'Not provided'}
- Answer: ${extracted.answer || 'Not provided'}
- Solution steps: ${JSON.stringify(extracted.solution_steps || [])}
- Extracted values: ${JSON.stringify(extracted.extracted_values || {})}
- Difficulty: ${extracted.difficulty_estimate}
- Is variation (lightweight): ${isVariation}

Required fields:
- id: "${questionId}"
- pattern_id: "${patternId}"
- topic_id: "${topicId}"
- is_variation: ${isVariation}

${isVariation ? 'Note: For variations, only include id, pattern_id, topic_id, text.en, and is_variation: true. Skip options, solution, etc.' : ''}

Generate the complete question JSON:`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError('No response from LLM');
    }

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const question = JSON.parse(jsonStr) as GeneratedQuestion;

    // Ensure required fields are set
    question.id = questionId;
    question.pattern_id = patternId;
    question.topic_id = topicId;
    question.is_variation = isVariation;
    question.embedding = null;

    return question;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new LLMError('Failed to parse generated question as JSON');
    }
    console.error('Question generation error:', error);
    throw new LLMError('Failed to generate question');
  }
}

/**
 * Generate both pattern and question from extracted content
 */
export async function generateFromExtracted(
  extracted: ExtractedContent,
  options: {
    topicId?: string;
    patternId?: string;
    questionId?: string;
    forceNewPattern?: boolean;
    isVariation?: boolean;
  } = {}
): Promise<GenerationResult> {
  const warnings: string[] = [];

  // Determine topic
  const topicId = options.topicId || extracted.topic_guess || 'percentage';

  // Determine if we need a new pattern
  const isNewPattern = options.forceNewPattern ?? extracted.is_likely_new_pattern;

  // Generate IDs
  const topicPrefix = topicId.substring(0, 2); // e.g., "pe" for percentage, "pl" for profit-loss
  const suggestedPatternId = options.patternId || `${topicPrefix}-xxx`; // User should provide proper ID
  const suggestedQuestionId =
    options.questionId || `${suggestedPatternId}-q-001`;

  if (suggestedPatternId.includes('xxx')) {
    warnings.push(
      'Pattern ID contains placeholder "xxx". Please provide a proper pattern ID before saving.'
    );
  }

  const result: GenerationResult = {
    question: {} as GeneratedQuestion,
    is_new_pattern: isNewPattern,
    suggested_pattern_id: suggestedPatternId,
    suggested_question_id: suggestedQuestionId,
    warnings,
  };

  // Generate pattern if needed
  if (isNewPattern) {
    result.pattern = await generatePattern(
      extracted,
      suggestedPatternId,
      topicId
    );
  }

  // Generate question
  result.question = await generateQuestion(
    extracted,
    suggestedQuestionId,
    suggestedPatternId,
    topicId,
    options.isVariation || false
  );

  // Add confidence warning
  if (extracted.confidence < 0.7) {
    warnings.push(
      `Low confidence extraction (${(extracted.confidence * 100).toFixed(0)}%). Please review carefully.`
    );
  }

  // Add extraction warnings
  if (extracted.warnings) {
    warnings.push(...extracted.warnings);
  }

  return result;
}

export const contentGeneratorService = {
  generatePattern,
  generateQuestion,
  generateFromExtracted,
};
