import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type Question } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Plus, Trash2 } from 'lucide-react'

interface QuestionFormProps {
  question: Omit<Question, 'created_at'> | Question
  onSubmit: (data: Partial<Question>) => void
  isSubmitting?: boolean
  isNew?: boolean
}

export function QuestionForm({ question, onSubmit, isSubmitting, isNew }: QuestionFormProps) {
  const [formData, setFormData] = useState(question)

  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: api.getTopics,
  })

  const { data: patterns = [] } = useQuery({
    queryKey: ['patterns', formData.topic_id],
    queryFn: () => api.getPatterns(formData.topic_id || undefined),
    enabled: !!formData.topic_id,
  })

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

  const addExamHistory = () => {
    updateField('exam_history', [
      ...(formData.exam_history || []),
      { exam: '', year: new Date().getFullYear() },
    ])
  }

  const removeExamHistory = (index: number) => {
    updateField(
      'exam_history',
      (formData.exam_history || []).filter((_, i) => i !== index)
    )
  }

  const updateExamHistory = (index: number, field: string, value: string | number) => {
    const history = [...(formData.exam_history || [])]
    history[index] = { ...history[index], [field]: value }
    updateField('exam_history', history)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Question ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => updateField('id', e.target.value)}
                    placeholder="pc-001-q-001"
                    disabled={!isNew}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic_id">Topic</Label>
                  <Select
                    value={formData.topic_id}
                    onValueChange={(v) => {
                      updateField('topic_id', v)
                      updateField('pattern_id', '')
                    }}
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
                <div className="space-y-2">
                  <Label htmlFor="pattern_id">Pattern</Label>
                  <Select
                    value={formData.pattern_id}
                    onValueChange={(v) => updateField('pattern_id', v)}
                    disabled={!formData.topic_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((pattern) => (
                        <SelectItem key={pattern.id} value={pattern.id}>
                          {pattern.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_en">Question Text (English)</Label>
                <Textarea
                  id="text_en"
                  value={formData.text.en}
                  onChange={(e) => updateField('text', { ...formData.text, en: e.target.value })}
                  placeholder="If the price of an item increases by 20%..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_hi">Question Text (Hindi - Optional)</Label>
                <Textarea
                  id="text_hi"
                  value={formData.text.hi || ''}
                  onChange={(e) => updateField('text', { ...formData.text, hi: e.target.value })}
                  placeholder="अगर किसी वस्तु की कीमत 20% बढ़ जाती है..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Answer Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['a', 'b', 'c', 'd'].map((option) => (
                <div key={option} className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-muted font-medium uppercase">
                    {option}
                  </div>
                  <Input
                    value={formData.options?.[option as keyof typeof formData.options] || ''}
                    onChange={(e) =>
                      updateField('options', {
                        ...formData.options,
                        [option]: e.target.value,
                      } as typeof formData.options)
                    }
                    placeholder={`Option ${option.toUpperCase()}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={formData.correct_option === option}
                      onChange={() => updateField('correct_option', option as 'a' | 'b' | 'c' | 'd')}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-muted-foreground">Correct</span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer Value</Label>
                  <Input
                    id="answer"
                    value={formData.solution?.answer || ''}
                    onChange={(e) =>
                      updateField('solution', {
                        ...formData.solution,
                        answer: e.target.value,
                        trick_application: formData.solution?.trick_application || [],
                        answer_display: formData.solution?.answer_display || '',
                      })
                    }
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer_display">Answer Display</Label>
                  <Input
                    id="answer_display"
                    value={formData.solution?.answer_display || ''}
                    onChange={(e) =>
                      updateField('solution', {
                        ...formData.solution,
                        answer_display: e.target.value,
                        trick_application: formData.solution?.trick_application || [],
                        answer: formData.solution?.answer || '',
                      })
                    }
                    placeholder="25%"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trick Application Steps</Label>
                {(formData.solution?.trick_application || []).map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={step}
                      onChange={(e) => {
                        const steps = [...(formData.solution?.trick_application || [])]
                        steps[index] = e.target.value
                        updateField('solution', { ...formData.solution!, trick_application: steps })
                      }}
                      placeholder={`Step ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const steps = (formData.solution?.trick_application || []).filter((_, i) => i !== index)
                        updateField('solution', { ...formData.solution!, trick_application: steps })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField('solution', {
                      ...formData.solution,
                      trick_application: [...(formData.solution?.trick_application || []), ''],
                      answer: formData.solution?.answer || '',
                      answer_display: formData.solution?.answer_display || '',
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={String(formData.difficulty || '')}
                    onValueChange={(v) => updateField('difficulty', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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
                <div className="flex items-center gap-3 pt-7">
                  <Switch
                    id="is_pyq"
                    checked={formData.is_pyq || false}
                    onCheckedChange={(v) => updateField('is_pyq', v)}
                  />
                  <Label htmlFor="is_pyq">Previous Year Question</Label>
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Switch
                    id="is_variation"
                    checked={formData.is_variation || false}
                    onCheckedChange={(v) => updateField('is_variation', v)}
                  />
                  <Label htmlFor="is_variation">Variation Question</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.exam_history || []).map((exam, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Exam</Label>
                    <Input
                      value={exam.exam}
                      onChange={(e) => updateExamHistory(index, 'exam', e.target.value)}
                      placeholder="SSC CGL"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tier</Label>
                    <Input
                      type="number"
                      value={exam.tier || ''}
                      onChange={(e) => updateExamHistory(index, 'tier', parseInt(e.target.value))}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Year</Label>
                    <Input
                      type="number"
                      value={exam.year}
                      onChange={(e) => updateExamHistory(index, 'year', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Shift</Label>
                    <Input
                      type="number"
                      value={exam.shift || ''}
                      onChange={(e) => updateExamHistory(index, 'shift', parseInt(e.target.value))}
                      placeholder="1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExamHistory(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addExamHistory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exam Appearance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : isNew ? 'Create Question' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
