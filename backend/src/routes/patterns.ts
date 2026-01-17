import { Hono } from 'hono';
import { patternRepository } from '../repositories/pattern.repository.js';
import { questionRepository } from '../repositories/question.repository.js';
import { NotFoundError } from '../utils/errors.js';

const patterns = new Hono();

/**
 * GET /patterns
 * List all patterns (optionally filter by topic)
 */
patterns.get('/', async (c) => {
  const topicId = c.req.query('topic_id');
  const allPatterns = await patternRepository.findAll(topicId);

  return c.json({
    success: true,
    data: allPatterns.map((p) => ({
      id: p.id,
      topic_id: p.topic_id,
      name: p.name,
      name_hi: p.name_hi,
      difficulty: p.difficulty,
      frequency: p.frequency,
      avg_time_seconds: p.avg_time_seconds,
      trick_one_liner: p.trick.one_liner,
      tags: p.tags,
      question_count: (p as any).question_count,
    })),
  });
});

/**
 * GET /patterns/:id
 * Get full pattern details
 */
patterns.get('/:id', async (c) => {
  const id = c.req.param('id');
  const pattern = await patternRepository.findById(id);

  if (!pattern) {
    throw new NotFoundError('Pattern', id);
  }

  return c.json({
    success: true,
    data: pattern,
  });
});

/**
 * GET /patterns/:id/questions
 * Get questions for a pattern
 */
patterns.get('/:id/questions', async (c) => {
  const id = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const difficulty = c.req.query('difficulty')
    ? parseInt(c.req.query('difficulty')!, 10)
    : undefined;

  // Verify pattern exists
  const pattern = await patternRepository.findById(id);
  if (!pattern) {
    throw new NotFoundError('Pattern', id);
  }

  const questions = await questionRepository.findByPatternId(id, {
    limit,
    difficulty,
  });

  return c.json({
    success: true,
    data: {
      pattern_id: id,
      pattern_name: pattern.name,
      questions,
    },
  });
});

/**
 * GET /patterns/:id/trick
 * Get just the trick for a pattern (lightweight)
 */
patterns.get('/:id/trick', async (c) => {
  const id = c.req.param('id');
  const pattern = await patternRepository.findById(id);

  if (!pattern) {
    throw new NotFoundError('Pattern', id);
  }

  return c.json({
    success: true,
    data: {
      pattern_id: id,
      pattern_name: pattern.name,
      trick: pattern.trick,
      common_mistakes: pattern.common_mistakes,
    },
  });
});

export { patterns };
