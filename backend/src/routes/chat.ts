import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import { patternMatcherService } from '../services/pattern-matcher.service.js';
import { llmService } from '../services/llm.service.js';
import type { ChatChunk, TeachingLevelType } from '../types/index.js';

const chat = new Hono();

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z
    .object({
      pattern_id: z.string().optional(),
      level: z.enum(['deep', 'shortcut', 'instant']).optional(),
    })
    .optional(),
});

/**
 * POST /chat
 * Main chat endpoint with streaming response
 */
chat.post('/', async (c) => {
  // Parse and validate request
  const body = await c.req.json();
  const parseResult = chatRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: 'Invalid request',
        details: parseResult.error.errors,
      },
      400
    );
  }

  const { message, context } = parseResult.data;
  const level: TeachingLevelType = context?.level || 'shortcut';

  // Stream response
  return streamSSE(c, async (stream) => {
    try {
      // Step 1: Pattern matching
      await stream.writeSSE({
        data: JSON.stringify({ type: 'thinking', content: 'Pattern match kar raha hoon...' }),
      });

      const result = await patternMatcherService.matchWithFallback(message);

      if (!result.match) {
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'error',
            content: 'Sorry bhai, ye question samajh nahi aaya. Thoda alag tarike se likh ke dekh.',
            alternatives: result.alternatives.slice(0, 3).map((a) => ({
              pattern_id: a.id,
              name: a.name,
              similarity: a.similarity,
            })),
          }),
        });
        return;
      }

      const { match } = result;

      // Step 2: Send matched pattern info
      await stream.writeSSE({
        data: JSON.stringify({
          type: 'pattern',
          pattern_id: match.pattern_id,
          pattern_name: match.pattern.name,
          confidence: match.confidence,
          matched_via: result.matchedVia,
          matched_question_id: result.matchedQuestionId,
        }),
      });

      // Step 3: Extract values from question
      const extractedValues = patternMatcherService.extractValues(message, match.pattern);

      // Step 4: Stream LLM response
      const responseStream = llmService.streamResponse({
        question: message,
        pattern: match.pattern,
        level,
        extractedValues,
      });

      for await (const chunk of responseStream) {
        await stream.writeSSE({
          data: JSON.stringify(chunk),
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      await stream.writeSSE({
        data: JSON.stringify({
          type: 'error',
          content: 'Kuch technical issue ho gaya bhai. Thodi der baad try kar.',
        }),
      });
    }
  });
});

/**
 * POST /chat/match
 * Pattern matching only (no LLM response)
 * Useful for testing pattern matching
 */
chat.post('/match', async (c) => {
  const body = await c.req.json();
  const { message } = body;

  if (!message || typeof message !== 'string') {
    return c.json({ success: false, error: 'Message is required' }, 400);
  }

  try {
    const result = await patternMatcherService.matchWithFallback(message);

    return c.json({
      success: true,
      data: {
        match: result.match
          ? {
              pattern_id: result.match.pattern_id,
              pattern_name: result.match.pattern.name,
              confidence: result.match.confidence,
              trick_one_liner: result.match.pattern.trick.one_liner,
              matched_via: result.matchedVia,
              matched_question_id: result.matchedQuestionId,
            }
          : null,
        alternatives: result.alternatives.slice(0, 5).map((a) => ({
          pattern_id: a.id,
          name: a.name,
          name_hi: a.name_hi,
          similarity: a.similarity,
          trick_one_liner: a.trick.one_liner,
        })),
      },
    });
  } catch (error) {
    console.error('Match error:', error);
    return c.json(
      { success: false, error: 'Pattern matching failed' },
      500
    );
  }
});

/**
 * POST /chat/test
 * Non-streaming test endpoint
 */
chat.post('/test', async (c) => {
  const body = await c.req.json();
  const { message, level = 'shortcut' } = body;

  if (!message || typeof message !== 'string') {
    return c.json({ success: false, error: 'Message is required' }, 400);
  }

  try {
    // Match pattern
    const { match } = await patternMatcherService.matchWithFallback(message);

    if (!match) {
      return c.json({
        success: false,
        error: 'Could not match to any pattern',
      });
    }

    // Extract values
    const extractedValues = patternMatcherService.extractValues(message, match.pattern);

    // Generate response (non-streaming)
    const response = await llmService.generateResponse({
      question: message,
      pattern: match.pattern,
      level: level as TeachingLevelType,
      extractedValues,
    });

    return c.json({
      success: true,
      data: {
        pattern: {
          id: match.pattern_id,
          name: match.pattern.name,
          confidence: match.confidence,
        },
        extractedValues,
        response,
      },
    });
  } catch (error) {
    console.error('Test chat error:', error);
    return c.json(
      { success: false, error: 'Chat test failed' },
      500
    );
  }
});

export { chat };
