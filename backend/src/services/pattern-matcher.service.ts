import { patternRepository } from '../repositories/pattern.repository.js';
import { questionRepository } from '../repositories/question.repository.js';
import { generateEmbedding, normalizeForEmbedding } from '../utils/embeddings.js';
import { PatternMatchError } from '../utils/errors.js';
import type { Pattern, PatternMatch } from '../types/index.js';

// Thresholds
const QUESTION_MATCH_THRESHOLD = 0.85;  // High threshold for question matching (near-exact)
const PATTERN_MATCH_THRESHOLD = 0.55;   // Lower threshold for pattern fallback
const TOP_K = 5;

export interface MatchOptions {
  questionThreshold?: number;
  patternThreshold?: number;
  topK?: number;
  skipQuestionMatch?: boolean;  // For testing pattern matching directly
}

export interface MatchResult {
  match: PatternMatch | null;
  matchedVia: 'question' | 'pattern' | null;
  matchedQuestionId?: string;
  alternatives: (Pattern & { similarity: number })[];
}

export const patternMatcherService = {
  /**
   * Match a question text - tries questions first, then patterns
   */
  async match(questionText: string, options?: MatchOptions): Promise<PatternMatch> {
    const result = await this.matchWithFallback(questionText, options);

    if (!result.match) {
      throw new PatternMatchError(
        'Could not match question to any known pattern. Try rephrasing the question.'
      );
    }

    return result.match;
  },

  /**
   * Match with full details - questions first, then patterns
   */
  async matchWithFallback(questionText: string, options?: MatchOptions): Promise<MatchResult> {
    const questionThreshold = options?.questionThreshold ?? QUESTION_MATCH_THRESHOLD;
    const patternThreshold = options?.patternThreshold ?? PATTERN_MATCH_THRESHOLD;
    const topK = options?.topK ?? TOP_K;
    const skipQuestionMatch = options?.skipQuestionMatch ?? false;

    // Normalize user's question before embedding (replace numbers with X)
    const normalizedText = normalizeForEmbedding(questionText);
    console.log(`[PatternMatcher] Normalized: "${normalizedText.slice(0, 80)}..."`);

    // Generate embedding for normalized question
    const embedding = await generateEmbedding(normalizedText);

    // Step 1: Try to match against stored questions (high accuracy)
    if (!skipQuestionMatch) {
      const questionMatches = await questionRepository.findSimilar(embedding, 1, questionThreshold);

      if (questionMatches.length > 0) {
        const matchedQuestion = questionMatches[0];

        // Get the pattern for this question
        const pattern = await patternRepository.findById(matchedQuestion.pattern_id);

        if (pattern) {
          console.log(`[PatternMatcher] Matched via question: ${matchedQuestion.id} (${matchedQuestion.similarity.toFixed(2)})`);

          return {
            match: {
              pattern_id: pattern.id,
              confidence: matchedQuestion.similarity,
              pattern,
            },
            matchedVia: 'question',
            matchedQuestionId: matchedQuestion.id,
            alternatives: [],
          };
        }
      }
    }

    // Step 2: Fall back to pattern matching
    const patternMatches = await patternRepository.findSimilar(embedding, topK, 0.3);

    if (patternMatches.length === 0) {
      return { match: null, matchedVia: null, alternatives: [] };
    }

    const best = patternMatches[0];
    const isConfident = best.similarity >= patternThreshold;

    if (isConfident) {
      console.log(`[PatternMatcher] Matched via pattern: ${best.id} (${best.similarity.toFixed(2)})`);
    } else {
      console.log(`[PatternMatcher] Low confidence match: ${best.id} (${best.similarity.toFixed(2)}) - below threshold ${patternThreshold}`);
    }

    return {
      match: isConfident
        ? {
            pattern_id: best.id,
            confidence: best.similarity,
            pattern: best,
          }
        : null,
      matchedVia: isConfident ? 'pattern' : null,
      alternatives: patternMatches,
    };
  },

  /**
   * Match against patterns only (skip question matching)
   * Useful for testing or when you want pattern-level matching
   */
  async matchPatternOnly(questionText: string, options?: MatchOptions): Promise<MatchResult> {
    return this.matchWithFallback(questionText, { ...options, skipQuestionMatch: true });
  },

  /**
   * Extract values from question text based on pattern signature
   */
  extractValues(questionText: string, pattern: Pattern): Record<string, unknown> {
    const values: Record<string, unknown> = {};

    // Simple number extraction
    const numbers = questionText.match(/[\d,]+(?:\.\d+)?/g) || [];
    const cleanNumbers = numbers.map((n) => parseFloat(n.replace(/,/g, '')));

    // Try to map numbers to expected variables
    const expectedVars = pattern.signature.variables || [];

    expectedVars.forEach((varName, index) => {
      if (index < cleanNumbers.length) {
        values[varName] = cleanNumbers[index];
      }
    });

    // Extract percentages specifically
    const percentages = questionText.match(/(\d+(?:\.\d+)?)\s*%/g) || [];
    const cleanPercentages = percentages.map((p) => parseFloat(p.replace('%', '')));

    if (cleanPercentages.length > 0) {
      values['percentages'] = cleanPercentages;
      // Also set first percentage as common variable names
      if (cleanPercentages[0]) {
        values['A'] = cleanPercentages[0];
        values['percent'] = cleanPercentages[0];
      }
    }

    // Extract currency amounts
    const rupees = questionText.match(/[₹Rs\.]+\s*([\d,]+(?:\.\d+)?)/gi) || [];
    if (rupees.length > 0) {
      values['amounts'] = rupees.map((r) => {
        const match = r.match(/([\d,]+(?:\.\d+)?)/);
        return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      });
    }

    return values;
  },
};
