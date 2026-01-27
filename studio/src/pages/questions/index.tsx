import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, type QuestionListItem, type PatternListItem } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Pencil, Award } from 'lucide-react'
import { useState, useMemo } from 'react'

function QuestionRowSkeleton() {
  return (
    <Card>
      <CardContent className="py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-8" />
      </CardContent>
    </Card>
  )
}

export function QuestionList() {
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [patternFilter, setPatternFilter] = useState<string>('all')

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions', { topic_id: topicFilter === 'all' ? undefined : topicFilter, pattern_id: patternFilter === 'all' ? undefined : patternFilter }],
    queryFn: () => api.getQuestions({
      topic_id: topicFilter === 'all' ? undefined : topicFilter,
      pattern_id: patternFilter === 'all' ? undefined : patternFilter,
    }),
  })

  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: api.getTopics,
  })

  const { data: patterns = [] } = useQuery({
    queryKey: ['patterns', topicFilter === 'all' ? undefined : topicFilter],
    queryFn: () => api.getPatterns(topicFilter === 'all' ? undefined : topicFilter),
  })

  const filteredQuestions = useMemo(() => {
    if (!search) return questions
    const lower = search.toLowerCase()
    return questions.filter(
      (q) =>
        q.text.en.toLowerCase().includes(lower) ||
        q.id.toLowerCase().includes(lower)
    )
  }, [questions, search])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">
            Manage practice questions linked to patterns
          </p>
        </div>
        <Button asChild>
          <Link to="/questions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Question
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={topicFilter} onValueChange={(v) => { setTopicFilter(v); setPatternFilter('all'); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={patternFilter} onValueChange={setPatternFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patterns</SelectItem>
            {patterns.map((pattern) => (
              <SelectItem key={pattern.id} value={pattern.id}>
                {pattern.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <QuestionRowSkeleton key={i} />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No questions found</p>
            <Button asChild>
              <Link to="/questions/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Question
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => (
            <QuestionRow key={question.id} question={question} patterns={patterns} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionRow({ question, patterns }: { question: QuestionListItem; patterns: PatternListItem[] }) {
  const pattern = patterns.find((p) => p.id === question.pattern_id)

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm line-clamp-2">{question.text.en}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {question.id}
            </Badge>
            {pattern && (
              <Badge variant="secondary" className="text-xs">
                {pattern.name}
              </Badge>
            )}
            {question.is_pyq && (
              <Badge className="text-xs bg-amber-100 text-amber-800">
                <Award className="h-3 w-3 mr-1" />
                PYQ
              </Badge>
            )}
            {question.difficulty && (
              <Badge variant="outline" className="text-xs">
                Difficulty: {question.difficulty}
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/questions/${question.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
