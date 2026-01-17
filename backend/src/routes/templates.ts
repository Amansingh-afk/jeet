import { Hono } from 'hono';
import { templateRepository } from '../repositories/template.repository.js';
import { NotFoundError } from '../utils/errors.js';

const templates = new Hono();

/**
 * GET /templates
 * List all templates (optionally filter by category)
 */
templates.get('/', async (c) => {
  const category = c.req.query('category');
  const allTemplates = await templateRepository.findAll(category);

  return c.json({
    success: true,
    data: allTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      param_count: t.params.length,
      preview_url: t.preview_url,
    })),
  });
});

/**
 * GET /templates/categories
 * Get list of template categories
 */
templates.get('/categories', async (c) => {
  const categories = await templateRepository.getCategories();

  return c.json({
    success: true,
    data: categories,
  });
});

/**
 * GET /templates/:id
 * Get full template with base_elements for rendering
 */
templates.get('/:id', async (c) => {
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
 * POST /templates/:id/render
 * Render a template with given params
 * Returns Excalidraw elements with params applied
 */
templates.post('/:id/render', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const params = body.params || {};

  const template = await templateRepository.findById(id);

  if (!template) {
    throw new NotFoundError('Template', id);
  }

  // Apply params to base elements
  const renderedElements = applyParamsToElements(
    template.base_elements,
    template.params,
    params
  );

  return c.json({
    success: true,
    data: {
      template_id: id,
      template_name: template.name,
      elements: renderedElements,
    },
  });
});

/**
 * Apply user params to template base elements
 */
function applyParamsToElements(
  baseElements: unknown[],
  templateParams: { name: string; element_id?: string; default?: string }[],
  userParams: Record<string, string>
): unknown[] {
  // Create a map of element_id -> param value
  const paramMap = new Map<string, string>();

  for (const param of templateParams) {
    const value = userParams[param.name] ?? param.default ?? '';
    if (param.element_id) {
      paramMap.set(param.element_id, value);
    }
  }

  // Clone and update elements
  return baseElements.map((element) => {
    const el = element as Record<string, unknown>;
    const cloned = { ...el };

    // If this element has a matching param, update its text
    if (el.id && paramMap.has(el.id as string)) {
      if (el.type === 'text') {
        const newText = paramMap.get(el.id as string);
        cloned.text = newText;
        cloned.originalText = newText; // Excalidraw needs both updated
      }
    }

    return cloned;
  });
}

export { templates };
