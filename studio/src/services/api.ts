const API_BASE = '/api'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.data ?? data
}

// Types
export interface Topic {
  id: string
  name: string
  name_hi: string
  slug: string
}

export interface PatternListItem {
  id: string
  topic_id: string
  name: string
  name_hi: string
  difficulty: number
  frequency: string
  avg_time_seconds: number
  trick_one_liner: string
  tags: string[]
  question_count: number
}

export interface Pattern {
  id: string
  topic_id: string
  name: string
  name_hi: string
  slug: string
  signature: {
    embedding_text: string
    variables: string[]
  }
  trick: {
    name: string
    name_hi: string
    one_liner: string
    steps: Array<{
      step: number
      action: string
      action_hi?: string
      example: string
      example_hi?: string
    }>
    formula?: string
    formula_simple?: string
    memory_hook?: string
    quick_fractions?: Record<string, string>
    alternatives?: Array<{
      name: string
      name_hi: string
      one_liner: string
      when_to_use?: string
      steps: Array<{
        step: number
        action: string
        action_hi?: string
        example: string
        example_hi?: string
      }>
    }>
  }
  common_mistakes: Array<{
    mistake: string
    wrong: string
    right: string
    why?: string
  }>
  teaching: {
    deep: {
      explanation: string
      duration_seconds: number
      includes: string[]
    }
    shortcut: {
      explanation: string
      duration_seconds: number
      includes: string[]
    }
    instant: {
      explanation: string
      duration_seconds: number
      includes: string[]
    }
  }
  visual?: {
    has_diagram: boolean
    template_id?: string
    description?: string
    when_to_show?: 'always' | 'on_request' | 'first_time'
  }
  prerequisites: {
    patterns: string[]
    concepts: string[]
  }
  difficulty: number
  frequency: 'low' | 'medium' | 'high'
  avg_time_seconds: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface QuestionListItem {
  id: string
  pattern_id: string
  topic_id: string
  text: { en: string; hi?: string }
  difficulty?: number
  is_pyq?: boolean
  is_variation?: boolean
}

export interface Question {
  id: string
  pattern_id: string
  topic_id: string
  text: { en: string; hi?: string }
  options?: { a: string; b: string; c: string; d: string }
  correct_option?: 'a' | 'b' | 'c' | 'd'
  extracted_values?: Record<string, unknown>
  solution?: {
    trick_application: string[]
    answer: number | string
    answer_display: string
  }
  source?: {
    book: string
    edition?: string
    chapter?: number
    chapter_name?: string
    question_number?: number
    page?: number
  }
  exam_history?: Array<{
    exam: string
    tier?: number
    year: number
    date?: string
    shift?: number
  }>
  difficulty?: number
  is_pyq?: boolean
  is_variation?: boolean
  created_at?: string
}

export interface TemplateListItem {
  id: string
  name: string
  category: string
  description?: string
}

export interface Template {
  id: string
  name: string
  category: string
  description?: string
  params: Array<{
    name: string
    type: 'text' | 'number' | 'color'
    element_id?: string
    position?: string
    default?: string
  }>
  base_elements: unknown[]
  use_cases?: string[]
  preview_url?: string
  created_at: string
}

export interface Stats {
  patterns: number
  questions: number
  templates: number
  topics: number
  patternsWithoutEmbedding: number
  questionsWithoutEmbedding: number
}

// API functions
export const api = {
  // Stats
  async getStats(): Promise<Stats> {
    return fetchApi<Stats>('/studio/stats')
  },

  // Topics
  async getTopics(): Promise<Topic[]> {
    return fetchApi<Topic[]>('/topics')
  },

  // Patterns
  async getPatterns(topicId?: string): Promise<PatternListItem[]> {
    const query = topicId ? `?topic_id=${topicId}` : ''
    return fetchApi<PatternListItem[]>(`/studio/patterns${query}`)
  },

  async getPattern(id: string): Promise<Pattern> {
    return fetchApi<Pattern>(`/studio/patterns/${id}`)
  },

  async createPattern(data: Omit<Pattern, 'created_at' | 'updated_at'>): Promise<Pattern> {
    return fetchApi<Pattern>('/studio/patterns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updatePattern(id: string, data: Partial<Pattern>): Promise<Pattern> {
    return fetchApi<Pattern>(`/studio/patterns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deletePattern(id: string): Promise<void> {
    await fetchApi<void>(`/studio/patterns/${id}`, { method: 'DELETE' })
  },

  // Questions
  async getQuestions(filters?: { pattern_id?: string; topic_id?: string }): Promise<QuestionListItem[]> {
    const params = new URLSearchParams()
    if (filters?.pattern_id) params.set('pattern_id', filters.pattern_id)
    if (filters?.topic_id) params.set('topic_id', filters.topic_id)
    const query = params.toString() ? `?${params}` : ''
    return fetchApi<QuestionListItem[]>(`/studio/questions${query}`)
  },

  async getQuestion(id: string): Promise<Question> {
    return fetchApi<Question>(`/studio/questions/${id}`)
  },

  async createQuestion(data: Omit<Question, 'created_at'>): Promise<Question> {
    return fetchApi<Question>('/studio/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    return fetchApi<Question>(`/studio/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteQuestion(id: string): Promise<void> {
    await fetchApi<void>(`/studio/questions/${id}`, { method: 'DELETE' })
  },

  // Templates
  async getTemplates(): Promise<TemplateListItem[]> {
    return fetchApi<TemplateListItem[]>('/studio/templates')
  },

  async getTemplate(id: string): Promise<Template> {
    return fetchApi<Template>(`/studio/templates/${id}`)
  },

  async createTemplate(data: Omit<Template, 'created_at'>): Promise<Template> {
    return fetchApi<Template>('/studio/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    return fetchApi<Template>(`/studio/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteTemplate(id: string): Promise<void> {
    await fetchApi<void>(`/studio/templates/${id}`, { method: 'DELETE' })
  },

  // Embeddings
  async generateEmbeddings(type: 'patterns' | 'questions', ids?: string[]): Promise<{ processed: number }> {
    return fetchApi<{ processed: number }>('/studio/embeddings/generate', {
      method: 'POST',
      body: JSON.stringify({ type, ids }),
    })
  },

  async regeneratePatternEmbedding(id: string): Promise<void> {
    await fetchApi<void>(`/studio/embeddings/pattern/${id}`, { method: 'POST' })
  },

  // Export
  async exportPattern(id: string): Promise<{ path: string }> {
    return fetchApi<{ path: string }>(`/studio/export/pattern/${id}`, { method: 'POST' })
  },

  async exportTopic(id: string): Promise<{ paths: string[] }> {
    return fetchApi<{ paths: string[] }>(`/studio/export/topic/${id}`, { method: 'POST' })
  },
}
