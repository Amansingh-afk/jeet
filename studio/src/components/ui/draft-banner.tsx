import { Button } from './button'
import { formatRelativeTime } from '@/hooks/use-autosave'
import { RotateCcw, Trash2, Clock } from 'lucide-react'

interface DraftBannerProps {
  timestamp: number
  onRestore: () => void
  onDiscard: () => void
}

export function DraftBanner({ timestamp, onRestore, onDiscard }: DraftBannerProps) {
  return (
    <div className="bg-muted/50 border rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>
          You have an unsaved draft from{' '}
          <span className="font-medium">{formatRelativeTime(timestamp)}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onDiscard}>
          <Trash2 className="h-4 w-4 mr-1" />
          Discard
        </Button>
        <Button size="sm" onClick={onRestore}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Restore Draft
        </Button>
      </div>
    </div>
  )
}

interface AutosaveIndicatorProps {
  lastSaved: Date | null
}

export function AutosaveIndicator({ lastSaved }: AutosaveIndicatorProps) {
  if (!lastSaved) return null

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Saved {formatRelativeTime(lastSaved.getTime())}
    </div>
  )
}
