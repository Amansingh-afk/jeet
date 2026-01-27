import { useState, lazy, Suspense } from 'react'
import { type Template } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

// Lazy load ExcalidrawEditor to avoid loading it until needed
const ExcalidrawEditor = lazy(() => import('./excalidraw-editor').then(mod => ({ default: mod.ExcalidrawEditor })))
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Trash2 } from 'lucide-react'
import type { TemplateParam } from './excalidraw-editor'

interface TemplateFormProps {
  template: Omit<Template, 'created_at'> | Template
  onSubmit: (data: Partial<Template>) => void
  isSubmitting?: boolean
  isNew?: boolean
}

const categories = [
  'general',
  'flow',
  'comparison',
  'calculation',
  'diagram',
  'formula',
]

export function TemplateForm({ template, onSubmit, isSubmitting, isNew }: TemplateFormProps) {
  const [formData, setFormData] = useState(template)
  const [newUseCase, setNewUseCase] = useState('')
  const [activeTab, setActiveTab] = useState('json')
  const [hasOpenedVisual, setHasOpenedVisual] = useState(false)

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addUseCase = () => {
    if (newUseCase && !formData.use_cases?.includes(newUseCase)) {
      updateField('use_cases', [...(formData.use_cases || []), newUseCase])
      setNewUseCase('')
    }
  }

  const removeUseCase = (useCase: string) => {
    updateField('use_cases', (formData.use_cases || []).filter((u) => u !== useCase))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Template ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => updateField('id', e.target.value)}
                placeholder="flow-percentage-increase"
                disabled={!isNew}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Percentage Increase Flow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => updateField('category', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Visual flow diagram for percentage increase problems..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v)
          if (v === 'visual') setHasOpenedVisual(true)
        }}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="json">JSON Editor</TabsTrigger>
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" forceMount className={activeTab !== 'visual' ? 'hidden' : ''}>
          {hasOpenedVisual && (
            <Suspense fallback={
              <Card>
                <CardContent className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            }>
              <ExcalidrawEditor
                initialElements={formData.base_elements || []}
                initialParams={(formData.params || []) as TemplateParam[]}
                onSave={(elements, params) => {
                  updateField('base_elements', elements)
                  updateField('params', params as Template['params'])
                }}
              />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>Raw JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Parameters (JSON)</Label>
                <Textarea
                  value={JSON.stringify(formData.params, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      updateField('params', parsed)
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="[]"
                />
              </div>
              <div className="space-y-2">
                <Label>Base Elements (JSON)</Label>
                <Textarea
                  value={JSON.stringify(formData.base_elements, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      updateField('base_elements', parsed)
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="[]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(formData.use_cases || []).map((useCase) => (
              <Badge key={useCase} variant="secondary" className="gap-1">
                {useCase}
                <button
                  type="button"
                  onClick={() => removeUseCase(useCase)}
                  className="ml-1 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newUseCase}
              onChange={(e) => setNewUseCase(e.target.value)}
              placeholder="Add use case"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addUseCase()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addUseCase}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : isNew ? 'Create Template' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
