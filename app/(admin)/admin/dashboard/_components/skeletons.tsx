import { Card, CardContent, CardHeader } from "@/components/ui/card"

const Bar = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-muted ${className}`} />
)

export function GreetingSkeleton() {
  return (
    <div className="space-y-2 px-4 lg:px-6">
      <Bar className="h-9 w-64" />
      <Bar className="h-4 w-48" />
    </div>
  )
}

export function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:grid-cols-4 lg:px-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Bar className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Bar className="h-8 w-16" />
            <Bar className="mt-2 h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ListCardSkeleton({
  rows = 3,
  title,
}: {
  rows?: number
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bar className="h-4 w-4 rounded-full" />
            <span className="text-base font-semibold">{title}</span>
          </div>
          <Bar className="h-5 w-8" />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Bar className="h-4 w-14 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <Bar className="h-4 w-3/4" />
                <Bar className="h-3 w-1/2" />
              </div>
              <Bar className="h-5 w-12 shrink-0" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function ProgressSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Bar className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Bar className="h-9 w-20" />
        <Bar className="h-2 w-full rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bar key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AgentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Bar className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Bar className="h-4 w-24" />
              <Bar className="h-4 w-16" />
            </div>
            <Bar className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}