import { useRef, useState, useEffect, lazy, Suspense, Component, type ReactNode } from 'react'
import '@excalidraw/excalidraw/index.css'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Link2, Link2Off, Trash2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const Excalidraw = lazy(() =>
  import('@excalidraw/excalidraw').then(mod => ({ default: mod.Excalidraw }))
)

class ExcalidrawErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; onRetry: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="font-semibold mb-1">Canvas Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'Failed to load canvas'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                this.props.onRetry()
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export interface TemplateParam {
  name: string
  type: 'text' | 'number' | 'color'
  element_id?: string
  position?: string
  default?: string
}

interface ExcalidrawEditorProps {
  initialElements: unknown[]
  initialParams: TemplateParam[]
  onSave: (elements: unknown[], params: TemplateParam[]) => void
}

export function ExcalidrawEditor({
  initialElements,
  initialParams,
  onSave,
}: ExcalidrawEditorProps) {
  const excalidrawAPIRef = useRef<any>(null)
  const [mountKey, setMountKey] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [params, setParams] = useState<TemplateParam[]>(initialParams)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [bindingMode, setBindingMode] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleRetry = () => {
    setIsReady(false)
    setMountKey(k => k + 1)
    setTimeout(() => setIsReady(true), 300)
  }

  const handleSave = () => {
    if (excalidrawAPIRef.current) {
      const elements = excalidrawAPIRef.current.getSceneElements()
      onSave(elements, params)
      setHasChanges(false)
    }
  }

  const handleChange = (elements: readonly any[], appState: any) => {
    setHasChanges(true)
    const selectedIds = Object.keys(appState.selectedElementIds || {})
    if (selectedIds.length === 1) {
      setSelectedElementId(selectedIds[0])
      if (bindingMode) {
        const element = elements.find(el => el.id === selectedIds[0])
        if (element && element.type === 'text') {
          setParams(prev => prev.map(p =>
            p.name === bindingMode ? { ...p, element_id: selectedIds[0] } : p
          ))
          setBindingMode(null)
        }
      }
    } else {
      setSelectedElementId(null)
    }
  }

  const addParam = () => {
    setParams([...params, { name: `param_${params.length + 1}`, type: 'text', default: '' }])
    setHasChanges(true)
  }

  const updateParam = (index: number, updates: Partial<TemplateParam>) => {
    const updated = [...params]
    updated[index] = { ...updated[index], ...updates }
    setParams(updated)
    setHasChanges(true)
  }

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const unbindParam = (paramName: string) => {
    setParams(prev => prev.map(p => p.name === paramName ? { ...p, element_id: undefined } : p))
    setHasChanges(true)
  }

  const getElementText = (elementId: string): string => {
    if (!excalidrawAPIRef.current) return 'Unknown'
    const elements = excalidrawAPIRef.current.getSceneElements()
    const element = elements.find((el: { id: string }) => el.id === elementId)
    return element?.type === 'text' ? (element.text?.slice(0, 20) || 'Text') : 'Unknown'
  }

  const safeElements = Array.isArray(initialElements) ? initialElements : []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges}>
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Canvas */}
        <Card className="overflow-hidden">
          <div style={{ height: 550, width: '100%', position: 'relative' }}>
            {bindingMode && (
              <div className="absolute top-2 left-2 right-2 z-10 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm flex items-center justify-between">
                <span>Click a text element to bind "{bindingMode}"</span>
                <Button size="sm" variant="secondary" onClick={() => setBindingMode(null)}>Cancel</Button>
              </div>
            )}

            {!isReady ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ExcalidrawErrorBoundary key={mountKey} onRetry={handleRetry}>
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                }>
                  <div style={{ height: '100%', width: '100%' }}>
                    <Excalidraw
                      excalidrawAPI={(api) => { excalidrawAPIRef.current = api }}
                      initialData={{
                        elements: safeElements as any[],
                        appState: {
                          theme: 'dark',
                          viewBackgroundColor: '#1a1a1a',
                        },
                      }}
                      onChange={handleChange}
                      theme="dark"
                      UIOptions={{
                        canvasActions: {
                          saveToActiveFile: false,
                          loadScene: false,
                          export: false,
                          saveAsImage: false,
                        },
                      }}
                    />
                  </div>
                </Suspense>
              </ExcalidrawErrorBoundary>
            )}
          </div>
        </Card>

        {/* Params */}
        <div className="space-y-4 overflow-auto" style={{ maxHeight: 550 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Parameters</CardTitle>
                  <CardDescription className="text-xs">Bind to text elements</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addParam}>Add</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {params.map((param, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border space-y-2',
                    bindingMode === param.name && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={param.name}
                      onChange={(e) => updateParam(index, { name: e.target.value })}
                      className="h-7 text-sm font-medium flex-1"
                      placeholder="param_name"
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeParam(index)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={param.type}
                      onChange={(e) => updateParam(index, { type: e.target.value as any })}
                      className="h-7 text-xs rounded border bg-background px-2"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="color">Color</option>
                    </select>
                    <Input
                      value={param.default || ''}
                      onChange={(e) => updateParam(index, { default: e.target.value })}
                      className="h-7 text-xs flex-1"
                      placeholder="Default"
                    />
                  </div>
                  <div>
                    {param.element_id ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Link2 className="h-3 w-3 mr-1" />
                          {getElementText(param.element_id)}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => unbindParam(param.name)}>
                          <Link2Off className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setBindingMode(param.name)}
                        disabled={bindingMode !== null}
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        Bind to Element
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {params.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add parameters to bind to canvas elements
                </p>
              )}
            </CardContent>
          </Card>

          {selectedElementId && !bindingMode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs text-muted-foreground">{selectedElementId}</code>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
