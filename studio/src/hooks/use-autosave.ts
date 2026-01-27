import { useEffect, useCallback, useRef, useState } from 'react'
import { useToast } from './use-toast'

const AUTOSAVE_DELAY = 2000 // 2 seconds
const STORAGE_PREFIX = 'jeet-studio-draft:'

interface UseAutosaveOptions<T> {
  key: string
  data: T
  enabled?: boolean
  onRestore?: (data: T) => void
}

interface UseAutosaveReturn {
  hasDraft: boolean
  draftTimestamp: number | null
  restoreDraft: () => void
  clearDraft: () => void
  lastSaved: Date | null
}

export function useAutosave<T>({
  key,
  data,
  enabled = true,
  onRestore,
}: UseAutosaveOptions<T>): UseAutosaveReturn {
  const { toast } = useToast()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<number | null>(null)
  const isInitializedRef = useRef(false)

  const storageKey = `${STORAGE_PREFIX}${key}`

  // Check for existing draft on mount
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const { timestamp } = JSON.parse(stored)
        setHasDraft(true)
        setDraftTimestamp(timestamp)
      }
    } catch {
      // Ignore errors
    }
  }, [storageKey])

  // Autosave with debounce
  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          data,
          timestamp: Date.now(),
        }
        localStorage.setItem(storageKey, JSON.stringify(payload))
        setLastSaved(new Date())
        setHasDraft(true)
        setDraftTimestamp(payload.timestamp)
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    }, AUTOSAVE_DELAY)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled, storageKey])

  const restoreDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && onRestore) {
        const { data: savedData, timestamp } = JSON.parse(stored)
        onRestore(savedData)
        toast({
          title: 'Draft restored',
          description: `Restored from ${new Date(timestamp).toLocaleString()}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Failed to restore draft',
        variant: 'destructive',
      })
    }
  }, [storageKey, onRestore, toast])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      setHasDraft(false)
      setDraftTimestamp(null)
      toast({
        title: 'Draft cleared',
      })
    } catch {
      // Ignore errors
    }
  }, [storageKey, toast])

  return {
    hasDraft,
    draftTimestamp,
    restoreDraft,
    clearDraft,
    lastSaved,
  }
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
