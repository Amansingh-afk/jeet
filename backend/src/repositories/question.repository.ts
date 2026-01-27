import { query } from '../config/database.js';
import type { Question, QuestionText, QuestionOptions, QuestionSolution, QuestionSource, ExamAppearance } from '../types/index.js';
import { formatEmbeddingForPg } from '../utils/embeddings.js';

interface QuestionRow {
  id: string;
  pattern_id: string;
  topic_id: string;
  text_en: string;
  text_hi: string | null;
  options: QuestionOptions | null;
  correct_option: string | null;
  extracted_values: Record<string, unknown> | null;
  solution: QuestionSolution | null;
  source: QuestionSource | null;
  exam_history: ExamAppearance[] | null;
  difficulty: number;
  is_pyq: boolean;
  is_variation: boolean;
  embedding: string | null;
  created_at: Date;
}

function rowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    pattern_id: row.pattern_id,
    topic_id: row.topic_id,
    text: {
      en: row.text_en,
      hi: row.text_hi || undefined,
    },
    options: row.options || undefined,
    correct_option: row.correct_option as 'a' | 'b' | 'c' | 'd' | undefined,
    extracted_values: row.extracted_values || undefined,
    solution: row.solution || undefined,
    source: row.source || undefined,
    exam_history: row.exam_history || undefined,
    difficulty: row.difficulty,
    is_pyq: row.is_pyq,
    is_variation: row.is_variation,
    embedding: undefined,
    created_at: row.created_at,
  };
}

export const questionRepository = {
  async findById(id: string): Promise<Question | null> {
    const result = await query<QuestionRow>(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    return result.rows[0] ? rowToQuestion(result.rows[0]) : null;
  },

  async findByPatternId(
    patternId: string,
    options?: { limit?: number; difficulty?: number }
  ): Promise<Question[]> {
    let sql = 'SELECT * FROM questions WHERE pattern_id = $1';
    const params: (string | number)[] = [patternId];

    if (options?.difficulty) {
      sql += ' AND difficulty = $2';
      params.push(options.difficulty);
    }

    sql += ' ORDER BY is_pyq DESC, difficulty';

    if (options?.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }

    const result = await query<QuestionRow>(sql, params);
    return result.rows.map(rowToQuestion);
  },

  async findByTopicId(
    topicId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Question[]> {
    let sql = 'SELECT * FROM questions WHERE topic_id = $1 ORDER BY pattern_id, difficulty';
    const params: (string | number)[] = [topicId];

    if (options?.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }

    if (options?.offset) {
      sql += ` OFFSET $${params.length + 1}`;
      params.push(options.offset);
    }

    const result = await query<QuestionRow>(sql, params);
    return result.rows.map(rowToQuestion);
  },

  async findSimilar(
    embedding: number[],
    limit: number = 5,
    threshold: number = 0.6
  ): Promise<(Question & { similarity: number })[]> {
    const embeddingStr = formatEmbeddingForPg(embedding);

    const result = await query<QuestionRow & { similarity: number }>(
      `SELECT *, 1 - (embedding <=> $1::vector) as similarity
       FROM questions
       WHERE embedding IS NOT NULL
         AND 1 - (embedding <=> $1::vector) > $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [embeddingStr, threshold, limit]
    );

    return result.rows.map((row) => ({
      ...rowToQuestion(row),
      similarity: row.similarity,
    }));
  },

  async create(question: Omit<Question, 'created_at'>): Promise<Question> {
    const result = await query<QuestionRow>(
      `INSERT INTO questions (
         id, pattern_id, topic_id, text_en, text_hi, options,
         correct_option, extracted_values, solution, source,
         exam_history, difficulty, is_pyq, is_variation
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        question.id,
        question.pattern_id,
        question.topic_id,
        question.text.en,
        question.text.hi,
        question.options ? JSON.stringify(question.options) : null,
        question.correct_option || null,
        question.extracted_values ? JSON.stringify(question.extracted_values) : null,
        question.solution ? JSON.stringify(question.solution) : null,
        question.source ? JSON.stringify(question.source) : null,
        question.exam_history ? JSON.stringify(question.exam_history) : null,
        question.difficulty ?? 2,
        question.is_pyq ?? false,
        question.is_variation ?? false,
      ]
    );
    return rowToQuestion(result.rows[0]);
  },

  async upsert(question: Omit<Question, 'created_at'>): Promise<Question> {
    const result = await query<QuestionRow>(
      `INSERT INTO questions (
         id, pattern_id, topic_id, text_en, text_hi, options,
         correct_option, extracted_values, solution, source,
         exam_history, difficulty, is_pyq, is_variation
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         pattern_id = EXCLUDED.pattern_id,
         topic_id = EXCLUDED.topic_id,
         text_en = EXCLUDED.text_en,
         text_hi = EXCLUDED.text_hi,
         options = EXCLUDED.options,
         correct_option = EXCLUDED.correct_option,
         extracted_values = EXCLUDED.extracted_values,
         solution = EXCLUDED.solution,
         source = EXCLUDED.source,
         exam_history = EXCLUDED.exam_history,
         difficulty = EXCLUDED.difficulty,
         is_pyq = EXCLUDED.is_pyq,
         is_variation = EXCLUDED.is_variation
       RETURNING *`,
      [
        question.id,
        question.pattern_id,
        question.topic_id,
        question.text.en,
        question.text.hi,
        question.options ? JSON.stringify(question.options) : null,
        question.correct_option || null,
        question.extracted_values ? JSON.stringify(question.extracted_values) : null,
        question.solution ? JSON.stringify(question.solution) : null,
        question.source ? JSON.stringify(question.source) : null,
        question.exam_history ? JSON.stringify(question.exam_history) : null,
        question.difficulty ?? 2,
        question.is_pyq ?? false,
        question.is_variation ?? false,
      ]
    );
    return rowToQuestion(result.rows[0]);
  },

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    const embeddingStr = formatEmbeddingForPg(embedding);
    await query(
      'UPDATE questions SET embedding = $1::vector WHERE id = $2',
      [embeddingStr, id]
    );
  },

  async countByPatternId(patternId: string): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM questions WHERE pattern_id = $1',
      [patternId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async findAll(): Promise<Question[]> {
    const result = await query<QuestionRow>(
      'SELECT * FROM questions ORDER BY topic_id, pattern_id, id'
    );
    return result.rows.map(rowToQuestion);
  },

  async findWithoutEmbedding(limit: number = 100): Promise<Question[]> {
    const result = await query<QuestionRow>(
      'SELECT * FROM questions WHERE embedding IS NULL LIMIT $1',
      [limit]
    );
    return result.rows.map(rowToQuestion);
  },

  async delete(id: string): Promise<void> {
    await query('DELETE FROM questions WHERE id = $1', [id]);
  },
};
