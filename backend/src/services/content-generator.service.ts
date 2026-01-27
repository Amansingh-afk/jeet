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
      action_hi?: string;
      example: string;
      example_hi?: string;
    }>;
    formula: string | null;
    memory_hook: string;
    quick_fractions?: Record<string, string>;
    alternatives: Array<{
      name: string;
      name_hi: string;
      one_liner: string;
      when_to_use?: string;
      formula?: string;
      steps?: Array<{
        step: number;
        action: string;
        action_hi?: string;
        example: string;
        example_hi?: string;
      }>;
    }>;
  };
  common_mistakes: Array<{
    mistake: string;
    wrong: string;
    right: string;
    why?: string;
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
    when_to_show: 'always' | 'on_request' | 'first_time';
  };
  prerequisites: {
    patterns: string[];
    concepts: string[];
  };
  metadata: {
    difficulty: number;
    frequency: 'low' | 'medium' | 'high';
    years_appeared: number[];
    avg_time_target_seconds: number;
    related_patterns: string[];
    tags: string[];
  };
  embedding?: null;
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
  source?: {
    book: string;
    edition: string;
    chapter: number;
    chapter_name: string;
    question_number: number;
    page: number;
  };
  exam_history?: Array<{
    exam: string;
    tier: number;
    year: number;
    date: string;
    shift: number;
  }>;
  difficulty: number;
  is_pyq: boolean;
  is_variation?: boolean;
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

/**
 * Remove null/undefined values and extra fields from generated pattern
 */
function cleanPattern(raw: Record<string, unknown>, patternId: string, topicId: string): GeneratedPattern {
  const pattern: GeneratedPattern = {
    id: patternId,
    topic_id: topicId,
    name: String(raw.name || ''),
    name_hi: String(raw.name_hi || ''),
    slug: String(raw.slug || ''),
    signature: {
      embedding_text: String((raw.signature as Record<string, unknown>)?.embedding_text || ''),
      variables: Array.isArray((raw.signature as Record<string, unknown>)?.variables) 
        ? (raw.signature as Record<string, unknown>).variables as string[]
        : [],
    },
    trick: cleanTrick(raw.trick as Record<string, unknown>),
    common_mistakes: cleanCommonMistakes(raw.common_mistakes as Array<Record<string, unknown>>),
    teaching: cleanTeaching(raw.teaching as Record<string, unknown>),
    visual: {
      has_diagram: Boolean((raw.visual as Record<string, unknown>)?.has_diagram),
      template_id: (raw.visual as Record<string, unknown>)?.template_id as string | null ?? null,
      description: String((raw.visual as Record<string, unknown>)?.description || ''),
      when_to_show: ((raw.visual as Record<string, unknown>)?.when_to_show as 'always' | 'on_request' | 'first_time') || 'on_request',
    },
    prerequisites: {
      patterns: Array.isArray((raw.prerequisites as Record<string, unknown>)?.patterns) 
        ? (raw.prerequisites as Record<string, unknown>).patterns as string[]
        : [],
      concepts: Array.isArray((raw.prerequisites as Record<string, unknown>)?.concepts)
        ? (raw.prerequisites as Record<string, unknown>).concepts as string[]
        : [],
    },
    metadata: {
      difficulty: Number((raw.metadata as Record<string, unknown>)?.difficulty) || 2,
      frequency: ((raw.metadata as Record<string, unknown>)?.frequency as 'low' | 'medium' | 'high') || 'medium',
      years_appeared: Array.isArray((raw.metadata as Record<string, unknown>)?.years_appeared)
        ? (raw.metadata as Record<string, unknown>).years_appeared as number[]
        : [],
      avg_time_target_seconds: Number((raw.metadata as Record<string, unknown>)?.avg_time_target_seconds) || 45,
      related_patterns: Array.isArray((raw.metadata as Record<string, unknown>)?.related_patterns)
        ? (raw.metadata as Record<string, unknown>).related_patterns as string[]
        : [],
      tags: Array.isArray((raw.metadata as Record<string, unknown>)?.tags)
        ? (raw.metadata as Record<string, unknown>).tags as string[]
        : [],
    },
  };

  return pattern;
}

function cleanTrick(raw: Record<string, unknown> | undefined): GeneratedPattern['trick'] {
  if (!raw) {
    return {
      name: '',
      name_hi: '',
      one_liner: '',
      steps: [],
      formula: null,
      memory_hook: '',
      alternatives: [],
    };
  }

  const trick: GeneratedPattern['trick'] = {
    name: String(raw.name || ''),
    name_hi: String(raw.name_hi || ''),
    one_liner: String(raw.one_liner || ''),
    steps: Array.isArray(raw.steps) ? raw.steps.map((s: Record<string, unknown>) => ({
      step: Number(s.step) || 1,
      action: String(s.action || ''),
      ...(s.action_hi ? { action_hi: String(s.action_hi) } : {}),
      example: String(s.example || ''),
      ...(s.example_hi ? { example_hi: String(s.example_hi) } : {}),
    })) : [],
    formula: raw.formula ? String(raw.formula) : null,
    memory_hook: String(raw.memory_hook || ''),
    alternatives: Array.isArray(raw.alternatives) ? raw.alternatives.map((a: Record<string, unknown>) => ({
      name: String(a.name || ''),
      name_hi: String(a.name_hi || ''),
      one_liner: String(a.one_liner || ''),
      ...(a.when_to_use ? { when_to_use: String(a.when_to_use) } : {}),
      ...(a.formula ? { formula: String(a.formula) } : {}),
      ...(Array.isArray(a.steps) ? { steps: a.steps.map((s: Record<string, unknown>) => ({
        step: Number(s.step) || 1,
        action: String(s.action || ''),
        ...(s.action_hi ? { action_hi: String(s.action_hi) } : {}),
        example: String(s.example || ''),
        ...(s.example_hi ? { example_hi: String(s.example_hi) } : {}),
      })) } : {}),
    })) : [],
  };

  // Add quick_fractions if present and valid
  if (raw.quick_fractions && typeof raw.quick_fractions === 'object' && !Array.isArray(raw.quick_fractions)) {
    trick.quick_fractions = raw.quick_fractions as Record<string, string>;
  }

  return trick;
}

function cleanCommonMistakes(raw: Array<Record<string, unknown>> | undefined): GeneratedPattern['common_mistakes'] {
  if (!Array.isArray(raw)) return [];
  
  return raw.map(m => ({
    mistake: String(m.mistake || ''),
    wrong: String(m.wrong || ''),
    right: String(m.right || ''),
    ...(m.why ? { why: String(m.why) } : {}),
  }));
}

function cleanTeaching(raw: Record<string, unknown> | undefined): GeneratedPattern['teaching'] {
  const defaultTeaching = {
    deep: { explanation: '', duration_seconds: 120, includes: [] as string[] },
    shortcut: { explanation: '', duration_seconds: 60, includes: [] as string[] },
    instant: { explanation: '', duration_seconds: 10, includes: [] as string[] },
  };

  if (!raw) return defaultTeaching;

  return {
    deep: {
      explanation: String((raw.deep as Record<string, unknown>)?.explanation || ''),
      duration_seconds: Number((raw.deep as Record<string, unknown>)?.duration_seconds) || 120,
      includes: Array.isArray((raw.deep as Record<string, unknown>)?.includes)
        ? (raw.deep as Record<string, unknown>).includes as string[]
        : [],
    },
    shortcut: {
      explanation: String((raw.shortcut as Record<string, unknown>)?.explanation || ''),
      duration_seconds: Number((raw.shortcut as Record<string, unknown>)?.duration_seconds) || 60,
      includes: Array.isArray((raw.shortcut as Record<string, unknown>)?.includes)
        ? (raw.shortcut as Record<string, unknown>).includes as string[]
        : [],
    },
    instant: {
      explanation: String((raw.instant as Record<string, unknown>)?.explanation || ''),
      duration_seconds: Number((raw.instant as Record<string, unknown>)?.duration_seconds) || 10,
      includes: Array.isArray((raw.instant as Record<string, unknown>)?.includes)
        ? (raw.instant as Record<string, unknown>).includes as string[]
        : [],
    },
  };
}

/**
 * Remove null/undefined values and extra fields from generated question
 */
function cleanQuestion(
  raw: Record<string, unknown>, 
  questionId: string, 
  patternId: string, 
  topicId: string,
  isVariation: boolean
): GeneratedQuestion {
  // For variations, return minimal structure
  if (isVariation) {
    return {
      id: questionId,
      pattern_id: patternId,
      topic_id: topicId,
      text: {
        en: String((raw.text as Record<string, unknown>)?.en || ''),
      },
      difficulty: Number(raw.difficulty) || 2,
      is_pyq: false,
      is_variation: true,
      embedding: null,
    };
  }

  // Full question
  const question: GeneratedQuestion = {
    id: questionId,
    pattern_id: patternId,
    topic_id: topicId,
    text: {
      en: String((raw.text as Record<string, unknown>)?.en || ''),
    },
    difficulty: Number(raw.difficulty) || 2,
    is_pyq: Boolean(raw.is_pyq),
    embedding: null,
  };

  // Add Hindi text if present
  const hiText = (raw.text as Record<string, unknown>)?.hi;
  if (hiText && typeof hiText === 'string' && hiText.trim()) {
    question.text.hi = hiText;
  }

  // Add options if all are present and not null
  const options = raw.options as Record<string, unknown> | undefined;
  if (options && options.a && options.b && options.c && options.d) {
    question.options = {
      a: String(options.a),
      b: String(options.b),
      c: String(options.c),
      d: String(options.d),
    };
  }

  // Add correct answer if present and not null
  if (raw.correct && typeof raw.correct === 'string') {
    question.correct = raw.correct;
  }

  // Add extracted_values if present and has data
  const extractedValues = raw.extracted_values as Record<string, unknown> | undefined;
  if (extractedValues && Object.keys(extractedValues).length > 0) {
    // Filter out null/undefined values
    const cleanedValues: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(extractedValues)) {
      if (value !== null && value !== undefined) {
        cleanedValues[key] = value;
      }
    }
    if (Object.keys(cleanedValues).length > 0) {
      question.extracted_values = cleanedValues;
    }
  }

  // Add solution if present and has data
  const solution = raw.solution as Record<string, unknown> | undefined;
  if (solution && solution.trick_application && solution.answer !== undefined) {
    question.solution = {
      trick_application: Array.isArray(solution.trick_application) 
        ? solution.trick_application.map(s => String(s))
        : [],
      answer: solution.answer as string | number,
      answer_display: String(solution.answer_display || solution.answer),
    };
  }

  // Add source only if it has meaningful data (not all nulls)
  const source = raw.source as Record<string, unknown> | undefined;
  if (source && source.book && typeof source.book === 'string' && source.book.trim()) {
    question.source = {
      book: String(source.book),
      edition: String(source.edition || ''),
      chapter: Number(source.chapter) || 1,
      chapter_name: String(source.chapter_name || ''),
      question_number: Number(source.question_number) || 1,
      page: Number(source.page) || 1,
    };
  }

  // Add exam_history if present and not empty
  const examHistory = raw.exam_history as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(examHistory) && examHistory.length > 0) {
    question.exam_history = examHistory.map(e => ({
      exam: String(e.exam || ''),
      tier: Number(e.tier) || 1,
      year: Number(e.year) || 2024,
      date: String(e.date || ''),
      shift: Number(e.shift) || 1,
    }));
  }

  return question;
}

const PATTERN_GENERATION_PROMPT = `You are an expert at creating SSC exam math pattern JSON files. Generate a VALID pattern JSON that EXACTLY matches this schema structure.

CRITICAL: Follow this EXACT JSON structure. Do NOT add extra fields. Do NOT use null for optional fields - omit them instead.

EXACT SCHEMA:
{
  "id": "xx-001",
  "topic_id": "topic-id",
  "name": "Pattern Name in English",
  "name_hi": "पैटर्न नाम हिंदी में",
  "slug": "pattern-name-kebab-case",

  "signature": {
    "embedding_text": "Generic normalized question text with X for numbers - used for semantic search",
    "variables": ["var1", "var2"]
  },

  "trick": {
    "name": "Trick Name",
    "name_hi": "ट्रिक नाम",
    "one_liner": "Trick ka one-liner Hinglish mein",
    "steps": [
      {
        "step": 1,
        "action": "Action in English",
        "action_hi": "Action in Hindi/Hinglish",
        "example": "Example with numbers",
        "example_hi": "Example in Hindi"
      }
    ],
    "formula": "Mathematical formula if applicable, or null",
    "memory_hook": "Easy catchy way to remember the trick",
    "alternatives": []
  },

  "common_mistakes": [
    {
      "mistake": "What students do wrong",
      "wrong": "Wrong approach example",
      "right": "Correct approach",
      "why": "Why this mistake happens"
    }
  ],

  "teaching": {
    "deep": {
      "explanation": "Full detailed explanation in Hinglish (3-4 paragraphs)...",
      "duration_seconds": 120,
      "includes": ["concept", "why_it_works", "formula", "common_mistakes"]
    },
    "shortcut": {
      "explanation": "Quick trick steps in Hinglish...",
      "duration_seconds": 60,
      "includes": ["trick_steps"]
    },
    "instant": {
      "explanation": "One-liner with example numbers",
      "duration_seconds": 10,
      "includes": ["one_liner"]
    }
  },

  "visual": {
    "has_diagram": false,
    "template_id": null,
    "description": "",
    "when_to_show": "on_request"
  },

  "prerequisites": {
    "patterns": [],
    "concepts": []
  },

  "metadata": {
    "difficulty": 2,
    "frequency": "medium",
    "years_appeared": [],
    "avg_time_target_seconds": 45,
    "related_patterns": [],
    "tags": ["tag1", "tag2"]
  }
}

RULES:
1. The trick should be SSC-style shortcuts, NOT textbook algebra
2. Use Hinglish naturally (English words mixed with Hindi)
3. embedding_text MUST use X for all numbers (e.g., "X percent" not "20 percent")
4. Make memory hooks catchy and memorable
5. difficulty is 1-5, frequency is "low"/"medium"/"high"
6. when_to_show is "always"/"on_request"/"first_time"
7. tags should include: topic keywords, method type, key concepts

Respond with ONLY the JSON object (no markdown code blocks, no explanation).`;

const QUESTION_GENERATION_PROMPT = `You are an expert at creating SSC exam question JSON files. Generate a VALID question JSON that EXACTLY matches this schema structure.

CRITICAL: Follow this EXACT JSON structure. Do NOT add extra fields. OMIT optional fields if no data available - do NOT use null.

EXACT SCHEMA FOR FULL QUESTION:
{
  "id": "xx-001-q-001",
  "pattern_id": "xx-001",
  "topic_id": "topic-id",

  "text": {
    "en": "Question text in English",
    "hi": "प्रश्न हिंदी में (omit if not available)"
  },

  "options": {
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D"
  },
  "correct": "b",

  "extracted_values": {
    "value_name": 20,
    "another_value": 100
  },

  "solution": {
    "trick_application": [
      "Step 1: Apply first part of trick with actual numbers",
      "Step 2: Next calculation step",
      "Step 3: Final answer"
    ],
    "answer": 25,
    "answer_display": "25%"
  },

  "source": {
    "book": "Book Name",
    "edition": "2023",
    "chapter": 1,
    "chapter_name": "Chapter Name",
    "question_number": 1,
    "page": 1
  },

  "exam_history": [],

  "difficulty": 2,
  "is_pyq": false,

  "embedding": null
}

EXACT SCHEMA FOR VARIATION (lightweight):
{
  "id": "xx-001-q-002",
  "pattern_id": "xx-001",
  "topic_id": "topic-id",
  "text": {
    "en": "Question text in English"
  },
  "is_variation": true
}

RULES:
1. For FULL questions: include all fields shown above
2. For VARIATIONS: only include the 5 fields shown in variation schema
3. OMIT optional fields if no data - do NOT set them to null
4. If options not available, OMIT the "options" and "correct" fields entirely
5. If source not available, OMIT the "source" field entirely
6. solution.trick_application shows SSC trick steps, NOT textbook algebra
7. difficulty is 1-5 based on complexity
8. extracted_values maps variable names to their numeric values from the question

Respond with ONLY the JSON object (no markdown code blocks, no explanation).`;

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

    const rawPattern = JSON.parse(jsonStr) as Record<string, unknown>;

    // Clean and validate the pattern structure
    const pattern = cleanPattern(rawPattern, patternId, topicId);

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

    const rawQuestion = JSON.parse(jsonStr) as Record<string, unknown>;

    // Clean and validate the question structure
    const question = cleanQuestion(rawQuestion, questionId, patternId, topicId, isVariation);

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
