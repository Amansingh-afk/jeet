import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  FileJson,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExtractedContent {
  question_text: string
  topic_guess: string
  pattern_description: string
  is_likely_new_pattern: boolean
  confidence: number
  warnings?: string[]
}

interface GeneratedContent {
  is_new_pattern: boolean
  pattern_id: string
  question_id: string
  pattern: Record<string, unknown> | null
  question: Record<string, unknown>
}

interface ProcessResult {
  status: 'preview'
  session_id: string
  extracted: ExtractedContent
  generated: GeneratedContent
  warnings?: string[]
}

export function PhotoImportPage() {
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [editedPattern, setEditedPattern] = useState<string>('')
  const [editedQuestion, setEditedQuestion] = useState<string>('')
  const [topicOverride, setTopicOverride] = useState<string>('')
  const [patternIdOverride, setPatternIdOverride] = useState<string>('')

  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: api.getTopics,
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles)
      setResult(null)
      // Create preview for first image
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const processMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()

      if (files.length === 1) {
        formData.append('photo', files[0])
      } else {
        files.forEach((file, i) => {
          formData.append(`photo${i + 1}`, file)
        })
      }

      if (topicOverride) {
        formData.append('topic_id', topicOverride)
      }
      if (patternIdOverride) {
        formData.append('pattern_id', patternIdOverride)
      }

      const endpoint = files.length === 1 ? '/content/process-photo' : '/content/process-photos'
      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process photo')
      }

      return response.json()
    },
    onSuccess: (data: ProcessResult) => {
      setResult(data)
      if (data.generated.pattern) {
        setEditedPattern(JSON.stringify(data.generated.pattern, null, 2))
      }
      setEditedQuestion(JSON.stringify(data.generated.question, null, 2))
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result) throw new Error('No result to save')

      const body: Record<string, unknown> = {
        session_id: result.session_id,
      }

      // Parse edited JSON if modified
      if (editedPattern && result.generated.is_new_pattern) {
        body.pattern = JSON.parse(editedPattern)
      }
      if (editedQuestion) {
        body.question = JSON.parse(editedQuestion)
      }

      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      return response.json()
    },
    onSuccess: () => {
      // Reset state after save
      setFiles([])
      setPreview(null)
      setResult(null)
      setEditedPattern('')
      setEditedQuestion('')
    },
  })

  const clearAll = () => {
    setFiles([])
    setPreview(null)
    setResult(null)
    setEditedPattern('')
    setEditedQuestion('')
    setTopicOverride('')
    setPatternIdOverride('')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Photo Import</h1>
        <p className="text-muted-foreground">
          Upload photos of math problems to automatically extract and generate content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Photo
              </CardTitle>
              <CardDescription>
                Drag & drop or click to upload (max 5 photos, 10MB each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <p className="text-muted-foreground">
                    Drag & drop images here, or click to select
                  </p>
                )}
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Selected Files ({files.length})</Label>
                    <Button variant="ghost" size="sm" onClick={clearAll}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, i) => (
                      <Badge key={i} variant="secondary">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {preview && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 rounded-lg max-h-64 object-contain w-full bg-muted"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic (optional override)</Label>
                <Select value={topicOverride} onValueChange={setTopicOverride}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect from image" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detect</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pattern ID (for adding to existing pattern)</Label>
                <Input
                  value={patternIdOverride}
                  onChange={(e) => setPatternIdOverride(e.target.value)}
                  placeholder="e.g., pc-005 (leave empty for new pattern)"
                />
              </div>

              <Button
                onClick={() => processMutation.mutate()}
                disabled={files.length === 0 || processMutation.isPending}
                className="w-full"
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Process Photo
                  </>
                )}
              </Button>

              {processMutation.isError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {processMutation.error.message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Extraction Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Extracted Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Question</Label>
                    <p className="text-sm">{result.extracted.question_text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Topic</Label>
                      <Badge variant="secondary">{result.extracted.topic_guess}</Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Confidence</Label>
                      <Badge
                        variant={result.extracted.confidence > 0.8 ? 'default' : 'secondary'}
                      >
                        {(result.extracted.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Pattern</Label>
                    <p className="text-sm">{result.extracted.pattern_description}</p>
                  </div>

                  {result.extracted.warnings && result.extracted.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 text-yellow-600 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Warnings</span>
                      </div>
                      <ul className="text-sm text-yellow-600 list-disc list-inside">
                        {result.extracted.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generated JSON */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Generated Content
                  </CardTitle>
                  <CardDescription>
                    {result.generated.is_new_pattern ? 'New pattern + question' : 'New question for existing pattern'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="question">
                    <TabsList className="mb-4">
                      {result.generated.is_new_pattern && (
                        <TabsTrigger value="pattern">Pattern</TabsTrigger>
                      )}
                      <TabsTrigger value="question">Question</TabsTrigger>
                    </TabsList>

                    {result.generated.is_new_pattern && (
                      <TabsContent value="pattern">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Pattern ID: {result.generated.pattern_id}</Label>
                          </div>
                          <Textarea
                            value={editedPattern}
                            onChange={(e) => setEditedPattern(e.target.value)}
                            className="font-mono text-xs h-80"
                          />
                        </div>
                      </TabsContent>
                    )}

                    <TabsContent value="question">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Question ID: {result.generated.question_id}</Label>
                        </div>
                        <Textarea
                          value={editedQuestion}
                          onChange={(e) => setEditedQuestion(e.target.value)}
                          className="font-mono text-xs h-80"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Save Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Button
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      className="flex-1"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save to Filesystem
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      Cancel
                    </Button>
                  </div>

                  {saveMutation.isSuccess && (
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
                      Content saved! Run <code className="bg-muted px-1 rounded">npm run seed</code> to import to database.
                    </div>
                  )}

                  {saveMutation.isError && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {saveMutation.error.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Upload a photo to see extracted content</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
