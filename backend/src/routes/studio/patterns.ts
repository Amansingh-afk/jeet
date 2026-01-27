import { Hono } from 'hono';
import { patternRepository } from '../../repositories/pattern.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import type { Pattern } from '../../types/index.js';

const studioPatterns = new Hono();

/**
 * GET /studio/patterns
 * List all patterns with optional topic filter
 */
studioPatterns.get('/', async (c) => {
  const topicId = c.req.query('topic_id');
  const patterns = await patternRepository.findAll(topicId);

  return c.json({
    success: true,
    data: patterns.map((p) => ({
      id: p.id,
      topic_id: p.topic_id,
      name: p.name,
      name_hi: p.name_hi,
      difficulty: p.difficulty,
      frequency: p.frequency,
      avg_time_seconds: p.avg_time_seconds,
      trick_one_liner: p.trick.one_liner,
      tags: p.tags,
      question_count: (p as any).question_count ?? 0,
    })),
  });
});

/**
 * GET /studio/patterns/:id
 * Get full pattern details
 */
studioPatterns.get('/:id', async (c) => {
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
 * POST /studio/patterns
 * Create a new pattern
 */
studioPatterns.post('/', async (c) => {
  const body = await c.req.json<Omit<Pattern, 'created_at' | 'updated_at'>>();

  // Validate required fields
  if (!body.id || !body.topic_id || !body.name) {
    return c.json({ success: false, error: 'Missing required fields: id, topic_id, name' }, 400);
  }

  const pattern = await patternRepository.create(body);

  return c.json({
    success: true,
    data: pattern,
  }, 201);
});

/**
 * PUT /studio/patterns/:id
 * Update an existing pattern
 */
studioPatterns.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Pattern>>();

  // Check if pattern exists
  const existing = await patternRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Pattern', id);
  }

  // Merge with existing and upsert
  const updated = await patternRepository.upsert({
    ...existing,
    ...body,
    id, // Ensure ID doesn't change
  });

  return c.json({
    success: true,
    data: updated,
  });
});

/**
 * DELETE /studio/patterns/:id
 * Delete a pattern
 */
studioPatterns.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await patternRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Pattern', id);
  }

  await patternRepository.delete(id);

  return c.json({
    success: true,
    message: `Pattern ${id} deleted`,
  });
});

export { studioPatterns };
