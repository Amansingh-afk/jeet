import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type Pattern } from '@/services/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { PatternForm } from '@/components/pattern/pattern-form'

const emptyPattern: Omit<Pattern, 'created_at' | 'updated_at'> = {
  id: '',
  topic_id: '',
  name: '',
  name_hi: '',
  slug: '',
  signature: {
    embedding_text: '',
    variables: [],
  },
  trick: {
    name: '',
    name_hi: '',
    one_liner: '',
    steps: [{ step: 1, action: '', example: '' }],
  },
  common_mistakes: [],
  teaching: {
    deep: { explanation: '', duration_seconds: 120, includes: ['concept', 'why_it_works', 'formula', 'common_mistakes'] },
    shortcut: { explanation: '', duration_seconds: 60, includes: ['trick_steps'] },
    instant: { explanation: '', duration_seconds: 10, includes: ['one_liner'] },
  },
  prerequisites: {
    patterns: [],
    concepts: [],
  },
  difficulty: 2,
  frequency: 'medium',
  avg_time_seconds: 30,
  tags: [],
}

export function PatternNew() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: Omit<Pattern, 'created_at' | 'updated_at'>) => api.createPattern(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] })
      toast({ title: 'Pattern created successfully' })
      navigate(`/patterns/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to create pattern',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/patterns')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Pattern</h1>
          <p className="text-muted-foreground">Create a new problem pattern with trick</p>
        </div>
      </div>

      <PatternForm
        pattern={emptyPattern}
        onSubmit={(data) => createMutation.mutate(data as Omit<Pattern, 'created_at' | 'updated_at'>)}
        isSubmitting={createMutation.isPending}
        isNew
      />
    </div>
  )
}
