import { Hono } from 'hono';
import { templateRepository } from '../../repositories/template.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import type { Template } from '../../types/index.js';

const studioTemplates = new Hono();

/**
 * GET /studio/templates
 * List all templates
 */
studioTemplates.get('/', async (c) => {
  const templates = await templateRepository.findAll();

  return c.json({
    success: true,
    data: templates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
    })),
  });
});

/**
 * GET /studio/templates/:id
 * Get full template details
 */
studioTemplates.get('/:id', async (c) => {
  const id = c.req.param('id');
  const template = await templateRepository.findById(id);

  if (!template) {
    throw new NotFoundError('Template', id);
  }

  return c.json({
    success: true,
    data: template,
  });
});

/**
 * POST /studio/templates
 * Create a new template
 */
studioTemplates.post('/', async (c) => {
  const body = await c.req.json<Omit<Template, 'created_at'>>();

  if (!body.id || !body.name || !body.category) {
    return c.json({ success: false, error: 'Missing required fields: id, name, category' }, 400);
  }

  const template = await templateRepository.create(body);

  return c.json({
    success: true,
    data: template,
  }, 201);
});

/**
 * PUT /studio/templates/:id
 * Update an existing template
 */
studioTemplates.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Template>>();

  const existing = await templateRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Template', id);
  }

  const updated = await templateRepository.upsert({
    ...existing,
    ...body,
    id,
  });

  return c.json({
    success: true,
    data: updated,
  });
});

/**
 * DELETE /studio/templates/:id
 * Delete a template
 */
studioTemplates.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await templateRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Template', id);
  }

  await templateRepository.delete(id);

  return c.json({
    success: true,
    message: `Template ${id} deleted`,
  });
});

export { studioTemplates };
