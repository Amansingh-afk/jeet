const API_BASE = '/api'

interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(response.status, error.message || 'Request failed')
  }

  return response.json()
}

// API endpoints
export const api = {
  // Ask a question
  ask: (question: string) =>
    request<{
      answer: string
      pattern?: {
        id: string
        name: string
        trick: string
      }
      matchedQuestion?: {
        id: string
        text: string
        similarity: number
      }
    }>('/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  // Get all topics
  topics: () =>
    request<{
      topics: Array<{
        id: string
        name: string
        description: string
        patternCount: number
      }>
    }>('/topics'),

  // Get patterns for a topic
  patterns: (topicId: string) =>
    request<{
      patterns: Array<{
        id: string
        name: string
        description: string
        trick: string
      }>
    }>(`/topics/${topicId}/patterns`),

  // Get a specific pattern
  pattern: (patternId: string) =>
    request<{
      pattern: {
        id: string
        name: string
        description: string
        trick: string
        examples: string[]
      }
    }>(`/patterns/${patternId}`),
}

export { ApiError }
