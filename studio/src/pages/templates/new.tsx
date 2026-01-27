import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type Template } from '@/services/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { TemplateForm } from '@/components/template/template-form'

const emptyTemplate: Omit<Template, 'created_at'> = {
  id: '',
  name: '',
  category: 'general',
  description: '',
  params: [],
  base_elements: [],
  use_cases: [],
}

export function TemplateNew() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: Omit<Template, 'created_at'>) => api.createTemplate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast({ title: 'Template created successfully' })
      navigate(`/templates/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to create template',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Template</h1>
          <p className="text-muted-foreground">Create a new Excalidraw template</p>
        </div>
      </div>

      <TemplateForm
        template={emptyTemplate}
        onSubmit={(data) => createMutation.mutate(data as Omit<Template, 'created_at'>)}
        isSubmitting={createMutation.isPending}
        isNew
      />
    </div>
  )
}
