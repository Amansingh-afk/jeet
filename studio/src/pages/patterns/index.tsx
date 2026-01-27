import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, type PatternListItem, type Topic } from '@/services/api'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Search, Pencil, HelpCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

function PatternCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex gap-1.5 mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

const difficultyLabels: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
  4: 'Very Hard',
  5: 'Expert',
}

const frequencyColors: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export function PatternList() {
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('all')

  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['patterns', topicFilter === 'all' ? undefined : topicFilter],
    queryFn: () => api.getPatterns(topicFilter === 'all' ? undefined : topicFilter),
  })

  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: api.getTopics,
  })

  const filteredPatterns = useMemo(() => {
    if (!search) return patterns
    const lower = search.toLowerCase()
    return patterns.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.name_hi.includes(search) ||
        p.id.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower))
    )
  }, [patterns, search])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patterns</h1>
          <p className="text-muted-foreground">
            Manage problem patterns with tricks and teaching content
          </p>
        </div>
        <Button asChild>
          <Link to="/patterns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Pattern
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
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
      </div>

      {/* Pattern list */}
      {patternsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <PatternCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPatterns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No patterns found</p>
            <Button asChild>
              <Link to="/patterns/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Pattern
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} topics={topics} />
          ))}
        </div>
      )}
    </div>
  )
}

function PatternCard({ pattern, topics }: { pattern: PatternListItem; topics: Topic[] }) {
  const topic = topics.find((t) => t.id === pattern.topic_id)

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{pattern.name}</CardTitle>
            <CardDescription className="truncate">{pattern.name_hi}</CardDescription>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link to={`/patterns/${pattern.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant="outline" className="text-xs">
            {pattern.id}
          </Badge>
          {topic && (
            <Badge variant="secondary" className="text-xs">
              {topic.name}
            </Badge>
          )}
          <Badge className={cn('text-xs', frequencyColors[pattern.frequency])}>
            {pattern.frequency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {pattern.trick_one_liner}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Difficulty: {difficultyLabels[pattern.difficulty] || pattern.difficulty}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            {pattern.question_count} questions
          </span>
        </div>
        {pattern.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pattern.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {pattern.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{pattern.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
