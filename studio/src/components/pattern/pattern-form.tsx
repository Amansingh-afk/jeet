import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type Pattern } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Plus, Trash2 } from 'lucide-react'
import { SortableList } from '@/components/ui/sortable-list'
import { useAutosave } from '@/hooks/use-autosave'
import { DraftBanner, AutosaveIndicator } from '@/components/ui/draft-banner'

interface PatternFormProps {
  pattern: Omit<Pattern, 'created_at' | 'updated_at'> | Pattern
  onSubmit: (data: Partial<Pattern>) => void
  isSubmitting?: boolean
  isNew?: boolean
}

export function PatternForm({ pattern, onSubmit, isSubmitting, isNew }: PatternFormProps) {
  const [formData, setFormData] = useState(pattern)
  const [newTag, setNewTag] = useState('')
  const [showDraftBanner, setShowDraftBanner] = useState(true)

  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: api.getTopics,
  })

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: api.getTemplates,
  })

  const handleRestore = useCallback((data: typeof formData) => {
    setFormData(data)
    setShowDraftBanner(false)
  }, [])

  const { hasDraft, draftTimestamp, restoreDraft, clearDraft, lastSaved } = useAutosave({
    key: `pattern:${pattern.id || 'new'}`,
    data: formData,
    enabled: true,
    onRestore: handleRestore,
  })

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    clearDraft()
    onSubmit(formData)
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      updateField('tags', [...formData.tags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter((t) => t !== tag))
  }

  const addTrickStep = () => {
    const steps = formData.trick.steps
    updateField('trick', {
      ...formData.trick,
      steps: [
        ...steps,
        { step: steps.length + 1, action: '', example: '' },
      ],
    })
  }

  const removeTrickStep = (index: number) => {
    const steps = formData.trick.steps.filter((_, i) => i !== index)
    updateField('trick', {
      ...formData.trick,
      steps: steps.map((s, i) => ({ ...s, step: i + 1 })),
    })
  }

  const updateTrickStep = (index: number, field: string, value: string) => {
    const steps = [...formData.trick.steps]
    steps[index] = { ...steps[index], [field]: value }
    updateField('trick', { ...formData.trick, steps })
  }

  const reorderTrickSteps = (newSteps: typeof formData.trick.steps) => {
    updateField('trick', {
      ...formData.trick,
      steps: newSteps.map((s, i) => ({ ...s, step: i + 1 })),
    })
  }

  const addMistake = () => {
    updateField('common_mistakes', [
      ...formData.common_mistakes,
      { mistake: '', wrong: '', right: '' },
    ])
  }

  const removeMistake = (index: number) => {
    updateField(
      'common_mistakes',
      formData.common_mistakes.filter((_, i) => i !== index)
    )
  }

  const updateMistake = (index: number, field: string, value: string) => {
    const mistakes = [...formData.common_mistakes]
    mistakes[index] = { ...mistakes[index], [field]: value }
    updateField('common_mistakes', mistakes)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasDraft && showDraftBanner && draftTimestamp && (
        <DraftBanner
          timestamp={draftTimestamp}
          onRestore={restoreDraft}
          onDiscard={() => {
            clearDraft()
            setShowDraftBanner(false)
          }}
        />
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-auto grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="trick">Trick</TabsTrigger>
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          <AutosaveIndicator lastSaved={lastSaved} />
        </div>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Pattern ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => updateField('id', e.target.value)}
                    placeholder="pc-001"
                    disabled={!isNew}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic_id">Topic</Label>
                  <Select
                    value={formData.topic_id}
                    onValueChange={(v) => updateField('topic_id', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Percentage Increase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_hi">Name (Hindi)</Label>
                  <Input
                    id="name_hi"
                    value={formData.name_hi}
                    onChange={(e) => updateField('name_hi', e.target.value)}
                    placeholder="प्रतिशत वृद्धि"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="percentage-increase"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embedding_text">Embedding Text</Label>
                <Textarea
                  id="embedding_text"
                  value={formData.signature.embedding_text}
                  onChange={(e) =>
                    updateField('signature', {
                      ...formData.signature,
                      embedding_text: e.target.value,
                    })
                  }
                  placeholder="If price of an item increases by X%, by what percentage should consumption be decreased..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Generic text with numbers replaced by X. Used for semantic matching.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.signature.variables.map((v, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {v}
                      <button
                        type="button"
                        onClick={() =>
                          updateField('signature', {
                            ...formData.signature,
                            variables: formData.signature.variables.filter(
                              (_, j) => j !== i
                            ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add variable"
                    className="w-32 h-6"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !formData.signature.variables.includes(value)) {
                          updateField('signature', {
                            ...formData.signature,
                            variables: [...formData.signature.variables, value],
                          })
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trick Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trick_name">Trick Name (English)</Label>
                  <Input
                    id="trick_name"
                    value={formData.trick.name}
                    onChange={(e) =>
                      updateField('trick', { ...formData.trick, name: e.target.value })
                    }
                    placeholder="Fraction Method"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trick_name_hi">Trick Name (Hindi)</Label>
                  <Input
                    id="trick_name_hi"
                    value={formData.trick.name_hi}
                    onChange={(e) =>
                      updateField('trick', { ...formData.trick, name_hi: e.target.value })
                    }
                    placeholder="भिन्न विधि"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="one_liner">One Liner</Label>
                <Input
                  id="one_liner"
                  value={formData.trick.one_liner}
                  onChange={(e) =>
                    updateField('trick', { ...formData.trick, one_liner: e.target.value })
                  }
                  placeholder="X% = X/Y, increase = X/(Y+X)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory_hook">Memory Hook</Label>
                <Textarea
                  id="memory_hook"
                  value={formData.trick.memory_hook || ''}
                  onChange={(e) =>
                    updateField('trick', { ...formData.trick, memory_hook: e.target.value })
                  }
                  placeholder="Easy way to remember this trick..."
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Trick Steps (drag to reorder)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTrickStep}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                <SortableList
                  items={formData.trick.steps}
                  getKey={(_, i) => `step-${i}`}
                  onChange={reorderTrickSteps}
                  renderItem={(step, index) => (
                    <div className="flex gap-2 items-start flex-1 bg-card p-2 rounded border">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted text-sm font-medium shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          value={step.action}
                          onChange={(e) => updateTrickStep(index, 'action', e.target.value)}
                          placeholder="Action"
                        />
                        <Input
                          value={step.example}
                          onChange={(e) => updateTrickStep(index, 'example', e.target.value)}
                          placeholder="Example"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTrickStep(index)}
                        disabled={formData.trick.steps.length === 1}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Common Mistakes</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addMistake}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Mistake
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SortableList
                items={formData.common_mistakes}
                getKey={(_, i) => `mistake-${i}`}
                onChange={(items) => updateField('common_mistakes', items)}
                renderItem={(mistake, index) => (
                  <div className="border rounded-lg p-4 space-y-3 bg-card flex-1">
                    <div className="flex justify-between items-start">
                      <Label>Mistake {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeMistake(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={mistake.mistake}
                      onChange={(e) => updateMistake(index, 'mistake', e.target.value)}
                      placeholder="Description of the mistake"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-destructive">Wrong</Label>
                        <Input
                          value={mistake.wrong}
                          onChange={(e) => updateMistake(index, 'wrong', e.target.value)}
                          placeholder="Wrong approach"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-green-500">Right</Label>
                        <Input
                          value={mistake.right}
                          onChange={(e) => updateMistake(index, 'right', e.target.value)}
                          placeholder="Correct approach"
                        />
                      </div>
                    </div>
                    <Input
                      value={mistake.why || ''}
                      onChange={(e) => updateMistake(index, 'why', e.target.value)}
                      placeholder="Why this is wrong (optional)"
                    />
                  </div>
                )}
              />
              {formData.common_mistakes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No common mistakes added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teaching" className="space-y-4">
          {(['deep', 'shortcut', 'instant'] as const).map((level) => (
            <Card key={level}>
              <CardHeader>
                <CardTitle className="capitalize">{level} Teaching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <Textarea
                    value={formData.teaching[level].explanation}
                    onChange={(e) =>
                      updateField('teaching', {
                        ...formData.teaching,
                        [level]: {
                          ...formData.teaching[level],
                          explanation: e.target.value,
                        },
                      })
                    }
                    rows={level === 'deep' ? 8 : level === 'shortcut' ? 4 : 2}
                    placeholder={`${level} explanation...`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      value={formData.teaching[level].duration_seconds}
                      onChange={(e) =>
                        updateField('teaching', {
                          ...formData.teaching,
                          [level]: {
                            ...formData.teaching[level],
                            duration_seconds: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Includes</Label>
                    <div className="flex flex-wrap gap-1">
                      {formData.teaching[level].includes.map((item, i) => (
                        <Badge key={i} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visual?.has_diagram ?? false}
                    onChange={(e) =>
                      updateField('visual', {
                        ...formData.visual,
                        has_diagram: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">Has Diagram</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template_id">Template</Label>
                <Select
                  value={formData.visual?.template_id || '__none__'}
                  onValueChange={(v) =>
                    updateField('visual', {
                      ...formData.visual,
                      has_diagram: v !== '__none__',
                      template_id: v === '__none__' ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="when_to_show">When to Show</Label>
                <Select
                  value={formData.visual?.when_to_show || 'on_request'}
                  onValueChange={(v) =>
                    updateField('visual', {
                      has_diagram: formData.visual?.has_diagram ?? false,
                      ...formData.visual,
                      when_to_show: v as 'always' | 'on_request' | 'first_time',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="on_request">On Request</SelectItem>
                    <SelectItem value="first_time">First Time Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visual_description">Description</Label>
                <Textarea
                  id="visual_description"
                  value={formData.visual?.description || ''}
                  onChange={(e) =>
                    updateField('visual', {
                      has_diagram: formData.visual?.has_diagram ?? false,
                      ...formData.visual,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what the visual shows..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Difficulty & Frequency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                  <Select
                    value={String(formData.difficulty)}
                    onValueChange={(v) => updateField('difficulty', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Easy</SelectItem>
                      <SelectItem value="2">2 - Medium</SelectItem>
                      <SelectItem value="3">3 - Hard</SelectItem>
                      <SelectItem value="4">4 - Very Hard</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) =>
                      updateField('frequency', v as 'low' | 'medium' | 'high')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avg_time">Avg Time (seconds)</Label>
                  <Input
                    id="avg_time"
                    type="number"
                    value={formData.avg_time_seconds}
                    onChange={(e) =>
                      updateField('avg_time_seconds', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Required Patterns</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.patterns.map((p, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {p}
                      <button
                        type="button"
                        onClick={() =>
                          updateField('prerequisites', {
                            ...formData.prerequisites,
                            patterns: formData.prerequisites.patterns.filter(
                              (_, j) => j !== i
                            ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add pattern ID"
                    className="w-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !formData.prerequisites.patterns.includes(value)) {
                          updateField('prerequisites', {
                            ...formData.prerequisites,
                            patterns: [...formData.prerequisites.patterns, value],
                          })
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Required Concepts</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.concepts.map((c, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {c}
                      <button
                        type="button"
                        onClick={() =>
                          updateField('prerequisites', {
                            ...formData.prerequisites,
                            concepts: formData.prerequisites.concepts.filter(
                              (_, j) => j !== i
                            ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add concept"
                    className="w-48"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !formData.prerequisites.concepts.includes(value)) {
                          updateField('prerequisites', {
                            ...formData.prerequisites,
                            concepts: [...formData.prerequisites.concepts, value],
                          })
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : isNew ? 'Create Pattern' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
