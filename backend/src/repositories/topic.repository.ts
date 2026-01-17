import { query } from '../config/database.js';
import type { Topic } from '../types/index.js';

interface TopicRow {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  sort_order: number;
  icon: string | null;
  color: string | null;
  description: string | null;
  prerequisites: string[];
  exam_weightage: Record<string, string>;
  metadata: Record<string, unknown>;
  created_at: Date;
  pattern_count?: string;
}

function rowToTopic(row: TopicRow): Topic & { pattern_count?: number } {
  return {
    id: row.id,
    name: row.name,
    name_hi: row.name_hi,
    slug: row.slug,
    sort_order: row.sort_order,
    icon: row.icon || undefined,
    color: row.color || undefined,
    description: row.description || undefined,
    prerequisites: row.prerequisites || [],
    exam_weightage: row.exam_weightage || {},
    metadata: row.metadata || {},
    created_at: row.created_at,
    pattern_count: row.pattern_count ? parseInt(row.pattern_count, 10) : undefined,
  };
}

export const topicRepository = {
  async findAll(): Promise<(Topic & { pattern_count: number })[]> {
    const result = await query<TopicRow>(`
      SELECT t.*, COUNT(p.id) as pattern_count
      FROM topics t
      LEFT JOIN patterns p ON p.topic_id = t.id
      GROUP BY t.id
      ORDER BY t.sort_order
    `);
    return result.rows.map(rowToTopic) as (Topic & { pattern_count: number })[];
  },

  async findById(id: string): Promise<Topic | null> {
    const result = await query<TopicRow>(
      'SELECT * FROM topics WHERE id = $1',
      [id]
    );
    return result.rows[0] ? rowToTopic(result.rows[0]) : null;
  },

  async findBySlug(slug: string): Promise<Topic | null> {
    const result = await query<TopicRow>(
      'SELECT * FROM topics WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ? rowToTopic(result.rows[0]) : null;
  },

  async create(topic: Omit<Topic, 'created_at'>): Promise<Topic> {
    const result = await query<TopicRow>(
      `INSERT INTO topics (id, name, name_hi, slug, sort_order, icon, color, description, prerequisites, exam_weightage, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        topic.id,
        topic.name,
        topic.name_hi,
        topic.slug,
        topic.sort_order,
        topic.icon,
        topic.color,
        topic.description,
        topic.prerequisites,
        JSON.stringify(topic.exam_weightage),
        JSON.stringify(topic.metadata),
      ]
    );
    return rowToTopic(result.rows[0]);
  },

  async upsert(topic: Omit<Topic, 'created_at'>): Promise<Topic> {
    const result = await query<TopicRow>(
      `INSERT INTO topics (id, name, name_hi, slug, sort_order, icon, color, description, prerequisites, exam_weightage, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         name_hi = EXCLUDED.name_hi,
         slug = EXCLUDED.slug,
         sort_order = EXCLUDED.sort_order,
         icon = EXCLUDED.icon,
         color = EXCLUDED.color,
         description = EXCLUDED.description,
         prerequisites = EXCLUDED.prerequisites,
         exam_weightage = EXCLUDED.exam_weightage,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [
        topic.id,
        topic.name,
        topic.name_hi,
        topic.slug,
        topic.sort_order,
        topic.icon,
        topic.color,
        topic.description,
        topic.prerequisites,
        JSON.stringify(topic.exam_weightage),
        JSON.stringify(topic.metadata),
      ]
    );
    return rowToTopic(result.rows[0]);
  },
};
