import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Shapes, HelpCircle, Image, Plus, ArrowRight, RefreshCw, Database } from 'lucide-react'
import { api } from '@/services/api'

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Content authoring for Jeet SSC Exam Prep
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patterns</CardTitle>
                <Shapes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.patterns ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Problem types with tricks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.questions ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Practice problems mapped to patterns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.templates ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Excalidraw visual templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Topics</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.topics ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Subject topics covered
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shapes className="h-5 w-5" />
              Patterns
            </CardTitle>
            <CardDescription>
              Create and manage problem patterns with tricks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/patterns/new">
                <Plus className="h-4 w-4 mr-1" />
                New Pattern
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/patterns">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Questions
            </CardTitle>
            <CardDescription>
              Add practice questions linked to patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/questions/new">
                <Plus className="h-4 w-4 mr-1" />
                New Question
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/questions">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Templates
            </CardTitle>
            <CardDescription>
              Design Excalidraw visual templates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/templates/new">
                <Plus className="h-4 w-4 mr-1" />
                New Template
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/templates">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Embedding status */}
      <Card>
        <CardHeader>
          <CardTitle>Embedding Status</CardTitle>
          <CardDescription>
            Content items that need embedding generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-52" />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {stats?.patternsWithoutEmbedding ?? 0} patterns without embeddings
                </p>
                <p className="text-sm font-medium">
                  {stats?.questionsWithoutEmbedding ?? 0} questions without embeddings
                </p>
              </div>
            )}
            <Button asChild variant="outline">
              <Link to="/tools/embeddings">
                Manage Embeddings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
