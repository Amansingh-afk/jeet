// Template API service for fetching and rendering Excalidraw diagrams

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface TemplateParam {
  name: string
  type: 'text' | 'number' | 'color'
  element_id?: string
  default?: string
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  params: TemplateParam[]
  base_elements: unknown[]
  use_cases?: string[]
  preview_url?: string
}

export interface RenderedTemplate {
  template_id: string
  template_name: string
  elements: unknown[]
}

// Cache for templates
const templateCache = new Map<string, Template>()

/**
 * Fetch a template by ID
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  // Check cache first
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!
  }

  try {
    const response = await fetch(`${API_BASE}/templates/${templateId}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Template not found: ${templateId}`)
        return null
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch template')
    }

    // Cache the template
    templateCache.set(templateId, result.data)
    return result.data
  } catch (error) {
    console.error(`Failed to fetch template ${templateId}:`, error)
    return null
  }
}

/**
 * Render a template with given params
 * This calls the backend to apply params to base_elements
 */
export async function renderTemplate(
  templateId: string,
  params: Record<string, string> = {}
): Promise<RenderedTemplate | null> {
  try {
    const response = await fetch(`${API_BASE}/templates/${templateId}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Template not found: ${templateId}`)
        return null
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to render template')
    }

    return result.data
  } catch (error) {
    console.error(`Failed to render template ${templateId}:`, error)
    return null
  }
}

/**
 * Get template with default values rendered
 * Useful for preview or when no specific params are provided
 */
export async function getTemplateWithDefaults(templateId: string): Promise<unknown[] | null> {
  const template = await getTemplate(templateId)

  if (!template) {
    return null
  }

  // Build default params
  const defaultParams: Record<string, string> = {}
  for (const param of template.params) {
    if (param.default) {
      defaultParams[param.name] = param.default
    }
  }

  const rendered = await renderTemplate(templateId, defaultParams)
  return rendered?.elements || null
}

/**
 * List all available templates
 */
export async function listTemplates(category?: string): Promise<Array<{
  id: string
  name: string
  category: string
  description: string
  param_count: number
  preview_url?: string
}>> {
  try {
    const url = category
      ? `${API_BASE}/templates?category=${encodeURIComponent(category)}`
      : `${API_BASE}/templates`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to list templates')
    }

    return result.data
  } catch (error) {
    console.error('Failed to list templates:', error)
    return []
  }
}

/**
 * Clear template cache
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}
