import { query } from '../config/database.js';
import type { Template, TemplateParam } from '../types/index.js';

interface TemplateRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  params: TemplateParam[];
  base_elements: unknown[];
  use_cases: string[] | null;
  preview_url: string | null;
  created_at: Date;
}

function rowToTemplate(row: TemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || undefined,
    params: row.params,
    base_elements: row.base_elements,
    use_cases: row.use_cases || undefined,
    preview_url: row.preview_url || undefined,
    created_at: row.created_at,
  };
}

export const templateRepository = {
  async findAll(category?: string): Promise<Template[]> {
    const whereClause = category ? 'WHERE category = $1' : '';
    const params = category ? [category] : [];

    const result = await query<TemplateRow>(
      `SELECT * FROM templates ${whereClause} ORDER BY category, name`,
      params
    );
    return result.rows.map(rowToTemplate);
  },

  async findById(id: string): Promise<Template | null> {
    const result = await query<TemplateRow>(
      'SELECT * FROM templates WHERE id = $1',
      [id]
    );
    return result.rows[0] ? rowToTemplate(result.rows[0]) : null;
  },

  async findByCategory(category: string): Promise<Template[]> {
    const result = await query<TemplateRow>(
      'SELECT * FROM templates WHERE category = $1 ORDER BY name',
      [category]
    );
    return result.rows.map(rowToTemplate);
  },

  async create(template: Omit<Template, 'created_at'>): Promise<Template> {
    const result = await query<TemplateRow>(
      `INSERT INTO templates (id, name, category, description, params, base_elements, use_cases, preview_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        template.id,
        template.name,
        template.category,
        template.description,
        JSON.stringify(template.params),
        JSON.stringify(template.base_elements),
        template.use_cases,
        template.preview_url,
      ]
    );
    return rowToTemplate(result.rows[0]);
  },

  async upsert(template: Omit<Template, 'created_at'>): Promise<Template> {
    const result = await query<TemplateRow>(
      `INSERT INTO templates (id, name, category, description, params, base_elements, use_cases, preview_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         params = EXCLUDED.params,
         base_elements = EXCLUDED.base_elements,
         use_cases = EXCLUDED.use_cases,
         preview_url = EXCLUDED.preview_url
       RETURNING *`,
      [
        template.id,
        template.name,
        template.category,
        template.description,
        JSON.stringify(template.params),
        JSON.stringify(template.base_elements),
        template.use_cases,
        template.preview_url,
      ]
    );
    return rowToTemplate(result.rows[0]);
  },

  async getCategories(): Promise<string[]> {
    const result = await query<{ category: string }>(
      'SELECT DISTINCT category FROM templates ORDER BY category'
    );
    return result.rows.map((r) => r.category);
  },
};
