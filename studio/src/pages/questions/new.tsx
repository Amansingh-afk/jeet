import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type Question } from '@/services/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { QuestionForm } from '@/components/question/question-form'

export function QuestionNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const patternId = searchParams.get('pattern_id') || ''
  const topicId = searchParams.get('topic_id') || ''

  const emptyQuestion: Omit<Question, 'created_at'> = {
    id: '',
    pattern_id: patternId,
    topic_id: topicId,
    text: { en: '' },
    options: { a: '', b: '', c: '', d: '' },
    correct_option: undefined,
    difficulty: 2,
    is_pyq: false,
    is_variation: false,
  }

  const createMutation = useMutation({
    mutationFn: (data: Omit<Question, 'created_at'>) => api.createQuestion(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast({ title: 'Question created successfully' })
      navigate(`/questions/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to create question',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/questions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Question</h1>
          <p className="text-muted-foreground">Create a new practice question</p>
        </div>
      </div>

      <QuestionForm
        question={emptyQuestion}
        onSubmit={(data) => createMutation.mutate(data as Omit<Question, 'created_at'>)}
        isSubmitting={createMutation.isPending}
        isNew
      />
    </div>
  )
}
