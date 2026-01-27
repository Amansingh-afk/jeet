import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Download, FileJson, FolderOpen } from 'lucide-react'
import { useState } from 'react'

export function ExportPage() {
  const { toast } = useToast()
  const [selectedTopic, setSelectedTopic] = useState<string>('')

  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: api.getTopics,
  })

  const exportTopicMutation = useMutation({
    mutationFn: (topicId: string) => api.exportTopic(topicId),
    onSuccess: (data) => {
      toast({
        title: 'Export complete',
        description: `Exported ${data.paths.length} files`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export</h1>
        <p className="text-muted-foreground">
          Export content from database to JSON files
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Export by Topic
          </CardTitle>
          <CardDescription>
            Export all patterns and questions for a topic to the content/ directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select topic to export" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => exportTopicMutation.mutate(selectedTopic)}
              disabled={!selectedTopic || exportTopicMutation.isPending}
            >
              {exportTopicMutation.isPending ? (
                'Exporting...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Topic
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Files will be exported to <code>content/topics/{'{topic_id}'}/</code>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p>Exports follow the standard Jeet content structure:</p>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`content/
  topics/
    {topic_id}/
      patterns/
        {pattern_id}.json
      questions/
        {question_id}.json`}
          </pre>
          <p>
            These JSON files can be committed to git and seeded to the database
            using <code>npm run seed</code>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <ol>
            <li>
              <strong>Create/Edit in Studio</strong>: Use the Studio UI to create and edit
              patterns, questions, and templates. Changes are saved directly to the database.
            </li>
            <li>
              <strong>Generate Embeddings</strong>: Before exporting, ensure all content has
              embeddings generated via the Embeddings tool.
            </li>
            <li>
              <strong>Export to JSON</strong>: Export content to JSON files in the
              <code>content/</code> directory.
            </li>
            <li>
              <strong>Commit to Git</strong>: Commit the exported JSON files to version control.
            </li>
            <li>
              <strong>Deploy</strong>: On production, run <code>npm run seed</code> to import
              the JSON files into the production database.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
