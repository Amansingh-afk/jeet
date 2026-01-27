import { Hono } from 'hono';
import { query } from '../../config/database.js';

const studioStats = new Hono();

/**
 * GET /studio/stats
 * Get overall statistics for the dashboard
 */
studioStats.get('/', async (c) => {
  const [
    patternsResult,
    questionsResult,
    templatesResult,
    topicsResult,
    patternsWithoutEmbeddingResult,
    questionsWithoutEmbeddingResult,
  ] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM patterns'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM questions'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM templates'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM topics'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM patterns WHERE embedding IS NULL'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM questions WHERE embedding IS NULL'),
  ]);

  return c.json({
    success: true,
    data: {
      patterns: parseInt(patternsResult.rows[0].count, 10),
      questions: parseInt(questionsResult.rows[0].count, 10),
      templates: parseInt(templatesResult.rows[0].count, 10),
      topics: parseInt(topicsResult.rows[0].count, 10),
      patternsWithoutEmbedding: parseInt(patternsWithoutEmbeddingResult.rows[0].count, 10),
      questionsWithoutEmbedding: parseInt(questionsWithoutEmbeddingResult.rows[0].count, 10),
    },
  });
});

export { studioStats };
