import { Hono } from 'hono';
import { topicRepository } from '../repositories/topic.repository.js';
import { patternRepository } from '../repositories/pattern.repository.js';
import { NotFoundError } from '../utils/errors.js';

const topics = new Hono();

/**
 * GET /topics
 * List all topics with pattern counts
 */
topics.get('/', async (c) => {
  const allTopics = await topicRepository.findAll();

  return c.json({
    success: true,
    data: allTopics,
  });
});

/**
 * GET /topics/:id
 * Get topic by ID with its patterns
 */
topics.get('/:id', async (c) => {
  const id = c.req.param('id');
  const topic = await topicRepository.findById(id);

  if (!topic) {
    throw new NotFoundError('Topic', id);
  }

  // Get patterns for this topic
  const patterns = await patternRepository.findByTopicId(id);

  return c.json({
    success: true,
    data: {
      ...topic,
      patterns: patterns.map((p) => ({
        id: p.id,
        name: p.name,
        name_hi: p.name_hi,
        difficulty: p.difficulty,
        frequency: p.frequency,
        trick_one_liner: p.trick.one_liner,
      })),
    },
  });
});

export { topics };
