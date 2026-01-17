// Chat API service with SSE streaming support

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type TeachingLevel = 'deep' | 'shortcut' | 'instant'

export interface ChatRequest {
  message: string
  context?: {
    pattern_id?: string
    level?: TeachingLevel
  }
}

export type ChatChunkType = 'thinking' | 'pattern' | 'content' | 'diagram' | 'done' | 'error'

export interface PatternInfo {
  pattern_id: string
  pattern_name: string
  confidence: number
  matched_via: 'question' | 'pattern'
  matched_question_id?: string
}

export interface DiagramInfo {
  template_id?: string
  params?: Record<string, string>
}

export interface ChatChunk {
  type: ChatChunkType
  content?: string
  // Pattern chunk
  pattern_id?: string
  pattern_name?: string
  confidence?: number
  matched_via?: 'question' | 'pattern'
  matched_question_id?: string
  // Diagram chunk
  template_id?: string
  params?: Record<string, string>
  // Done chunk
  metadata?: {
    pattern_id?: string
    level?: TeachingLevel
  }
  // Error chunk
  alternatives?: Array<{
    pattern_id: string
    name: string
    similarity: number
  }>
}

export interface StreamCallbacks {
  onThinking?: (content: string) => void
  onPattern?: (pattern: PatternInfo) => void
  onContent?: (content: string) => void
  onDiagram?: (diagram: DiagramInfo) => void
  onDone?: (metadata?: { pattern_id?: string; level?: TeachingLevel }) => void
  onError?: (error: string, alternatives?: ChatChunk['alternatives']) => void
}

/**
 * Send a chat message and stream the response
 */
export async function streamChat(
  request: ChatRequest,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE events
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const chunk: ChatChunk = JSON.parse(data)
            processChunk(chunk, callbacks)
          } catch (e) {
            console.error('Failed to parse SSE chunk:', e, data)
          }
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6)
      if (data && data !== '[DONE]') {
        try {
          const chunk: ChatChunk = JSON.parse(data)
          processChunk(chunk, callbacks)
        } catch (e) {
          console.error('Failed to parse final SSE chunk:', e)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function processChunk(chunk: ChatChunk, callbacks: StreamCallbacks) {
  switch (chunk.type) {
    case 'thinking':
      callbacks.onThinking?.(chunk.content || '')
      break
    case 'pattern':
      callbacks.onPattern?.({
        pattern_id: chunk.pattern_id || '',
        pattern_name: chunk.pattern_name || '',
        confidence: chunk.confidence || 0,
        matched_via: chunk.matched_via || 'pattern',
        matched_question_id: chunk.matched_question_id,
      })
      break
    case 'content':
      callbacks.onContent?.(chunk.content || '')
      break
    case 'diagram':
      callbacks.onDiagram?.({
        template_id: chunk.template_id,
        params: chunk.params,
      })
      break
    case 'done':
      callbacks.onDone?.(chunk.metadata)
      break
    case 'error':
      callbacks.onError?.(chunk.content || 'Unknown error', chunk.alternatives)
      break
  }
}

/**
 * Get pattern match only (no LLM response) - useful for testing
 */
export async function matchPattern(message: string): Promise<{
  match: {
    pattern_id: string
    pattern_name: string
    confidence: number
    trick_one_liner: string
    matched_via: 'question' | 'pattern'
    matched_question_id?: string
  } | null
  alternatives: Array<{
    pattern_id: string
    name: string
    name_hi?: string
    similarity: number
    trick_one_liner: string
  }>
}> {
  const response = await fetch(`${API_BASE}/chat/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Match failed')
  }

  return result.data
}
