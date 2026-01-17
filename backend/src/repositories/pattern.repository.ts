import { query } from '../config/database.js';
import type { Pattern, PatternSignature, PatternTrick, PatternTeaching, PatternVisual, PatternPrerequisites, CommonMistake } from '../types/index.js';
import { formatEmbeddingForPg } from '../utils/embeddings.js';

interface PatternRow {
  id: string;
  topic_id: string;
  name: string;
  name_hi: string;
  slug: string;
  signature: PatternSignature;
  trick: PatternTrick;
  common_mistakes: CommonMistake[];
  teaching: PatternTeaching;
  visual: PatternVisual | null;
  prerequisites: PatternPrerequisites;
  difficulty: number;
  frequency: string;
  avg_time_seconds: number;
  tags: string[];
  embedding: string | null;
  created_at: Date;
  updated_at: Date;
  question_count?: string;
}

function rowToPattern(row: PatternRow): Pattern & { question_count?: number } {
  return {
    id: row.id,
    topic_id: row.topic_id,
    name: row.name,
    name_hi: row.name_hi,
    slug: row.slug,
    signature: row.signature,
    trick: row.trick,
    common_mistakes: row.common_mistakes || [],
    teaching: row.teaching,
    visual: row.visual || undefined,
    prerequisites: row.prerequisites || { patterns: [], concepts: [] },
    difficulty: row.difficulty,
    frequency: row.frequency as 'low' | 'medium' | 'high',
    avg_time_seconds: row.avg_time_seconds,
    tags: row.tags || [],
    embedding: undefined, // Don't return raw embedding
    created_at: row.created_at,
    updated_at: row.updated_at,
    question_count: row.question_count ? parseInt(row.question_count, 10) : undefined,
  } as Pattern & { question_count?: number };
}

export const patternRepository = {
  async findAll(topicId?: string): Promise<Pattern[]> {
    const whereClause = topicId ? 'WHERE topic_id = $1' : '';
    const params = topicId ? [topicId] : [];

    const result = await query<PatternRow>(
      `SELECT p.*, COUNT(q.id) as question_count
       FROM patterns p
       LEFT JOIN questions q ON q.pattern_id = p.id
       ${whereClause}
       GROUP BY p.id
       ORDER BY p.difficulty, p.name`,
      params
    );
    return result.rows.map(rowToPattern);
  },

  async findById(id: string): Promise<Pattern | null> {
    const result = await query<PatternRow>(
      'SELECT * FROM patterns WHERE id = $1',
      [id]
    );
    return result.rows[0] ? rowToPattern(result.rows[0]) : null;
  },

  async findByTopicId(topicId: string): Promise<Pattern[]> {
    const result = await query<PatternRow>(
      'SELECT * FROM patterns WHERE topic_id = $1 ORDER BY difficulty, name',
      [topicId]
    );
    return result.rows.map(rowToPattern);
  },

  async findSimilar(
    embedding: number[],
    limit: number = 5,
    threshold: number = 0.5
  ): Promise<(Pattern & { similarity: number })[]> {
    const embeddingStr = formatEmbeddingForPg(embedding);

    const result = await query<PatternRow & { similarity: number }>(
      `SELECT *, 1 - (embedding <=> $1::vector) as similarity
       FROM patterns
       WHERE embedding IS NOT NULL
         AND 1 - (embedding <=> $1::vector) > $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [embeddingStr, threshold, limit]
    );

    return result.rows.map((row) => ({
      ...rowToPattern(row),
      similarity: row.similarity,
    }));
  },

  async create(pattern: Omit<Pattern, 'created_at' | 'updated_at'>): Promise<Pattern> {
    const result = await query<PatternRow>(
      `INSERT INTO patterns (
         id, topic_id, name, name_hi, slug, signature, trick,
         common_mistakes, teaching, visual, prerequisites,
         difficulty, frequency, avg_time_seconds, tags
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        pattern.id,
        pattern.topic_id,
        pattern.name,
        pattern.name_hi,
        pattern.slug,
        JSON.stringify(pattern.signature),
        JSON.stringify(pattern.trick),
        JSON.stringify(pattern.common_mistakes),
        JSON.stringify(pattern.teaching),
        pattern.visual ? JSON.stringify(pattern.visual) : null,
        JSON.stringify(pattern.prerequisites),
        pattern.difficulty,
        pattern.frequency,
        pattern.avg_time_seconds,
        pattern.tags,
      ]
    );
    return rowToPattern(result.rows[0]);
  },

  async upsert(pattern: Omit<Pattern, 'created_at' | 'updated_at'>): Promise<Pattern> {
    const result = await query<PatternRow>(
      `INSERT INTO patterns (
         id, topic_id, name, name_hi, slug, signature, trick,
         common_mistakes, teaching, visual, prerequisites,
         difficulty, frequency, avg_time_seconds, tags
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET
         topic_id = EXCLUDED.topic_id,
         name = EXCLUDED.name,
         name_hi = EXCLUDED.name_hi,
         slug = EXCLUDED.slug,
         signature = EXCLUDED.signature,
         trick = EXCLUDED.trick,
         common_mistakes = EXCLUDED.common_mistakes,
         teaching = EXCLUDED.teaching,
         visual = EXCLUDED.visual,
         prerequisites = EXCLUDED.prerequisites,
         difficulty = EXCLUDED.difficulty,
         frequency = EXCLUDED.frequency,
         avg_time_seconds = EXCLUDED.avg_time_seconds,
         tags = EXCLUDED.tags,
         updated_at = NOW()
       RETURNING *`,
      [
        pattern.id,
        pattern.topic_id,
        pattern.name,
        pattern.name_hi,
        pattern.slug,
        JSON.stringify(pattern.signature),
        JSON.stringify(pattern.trick),
        JSON.stringify(pattern.common_mistakes),
        JSON.stringify(pattern.teaching),
        pattern.visual ? JSON.stringify(pattern.visual) : null,
        JSON.stringify(pattern.prerequisites),
        pattern.difficulty,
        pattern.frequency,
        pattern.avg_time_seconds,
        pattern.tags,
      ]
    );
    return rowToPattern(result.rows[0]);
  },

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    const embeddingStr = formatEmbeddingForPg(embedding);
    await query(
      'UPDATE patterns SET embedding = $1::vector, updated_at = NOW() WHERE id = $2',
      [embeddingStr, id]
    );
  },

  async countWithoutEmbedding(): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM patterns WHERE embedding IS NULL'
    );
    return parseInt(result.rows[0].count, 10);
  },

  async findWithoutEmbedding(limit: number = 100): Promise<Pattern[]> {
    const result = await query<PatternRow>(
      'SELECT * FROM patterns WHERE embedding IS NULL LIMIT $1',
      [limit]
    );
    return result.rows.map(rowToPattern);
  },
};
