import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw, Zap, Database, AlertCircle } from 'lucide-react'
import { useState } from 'react'

function EmbeddingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function EmbeddingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [processingType, setProcessingType] = useState<'patterns' | 'questions' | null>(null)

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const generateMutation = useMutation({
    mutationFn: (type: 'patterns' | 'questions') => api.generateEmbeddings(type),
    onMutate: (type) => {
      setProcessingType(type)
    },
    onSuccess: (data, type) => {
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast({
        title: 'Embeddings generated',
        description: `Processed ${data.processed} ${type}`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to generate embeddings',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setProcessingType(null)
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Embeddings</h1>
          <p className="text-muted-foreground">
            Generate and manage vector embeddings for semantic search
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <EmbeddingCardSkeleton />
            <EmbeddingCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Pattern Embeddings
                </CardTitle>
                <CardDescription>
                  Embeddings for pattern signature matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.patternsWithoutEmbedding ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      patterns without embeddings
                    </p>
                  </div>
                  {stats?.patternsWithoutEmbedding && stats.patternsWithoutEmbedding > 0 && (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <Button
                  onClick={() => generateMutation.mutate('patterns')}
                  disabled={generateMutation.isPending || !stats?.patternsWithoutEmbedding}
                  className="w-full"
                >
                  {processingType === 'patterns' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Pattern Embeddings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Question Embeddings
                </CardTitle>
                <CardDescription>
                  Embeddings for exact question matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.questionsWithoutEmbedding ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      questions without embeddings
                    </p>
                  </div>
                  {stats?.questionsWithoutEmbedding && stats.questionsWithoutEmbedding > 0 && (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <Button
                  onClick={() => generateMutation.mutate('questions')}
                  disabled={generateMutation.isPending || !stats?.questionsWithoutEmbedding}
                  className="w-full"
                >
                  {processingType === 'questions' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Question Embeddings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Embeddings Work</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p>
            Embeddings are numerical representations of text that capture semantic meaning.
            Jeet uses embeddings for:
          </p>
          <ul>
            <li>
              <strong>Pattern matching</strong>: When a user asks a question, we find the most
              similar pattern based on the pattern's <code>embedding_text</code>.
            </li>
            <li>
              <strong>Question matching</strong>: For exact or near-exact matches (like PYQs),
              we compare the user's question against stored question embeddings.
            </li>
          </ul>
          <p>
            Embeddings are generated using OpenAI's <code>text-embedding-3-small</code> model
            and stored in PostgreSQL using the <code>pgvector</code> extension.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
