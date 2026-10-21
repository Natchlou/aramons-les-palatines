import { Suspense } from "react"
import { DashboardGreeting } from "./_components/dashboard-greeting"
import { DashboardStats } from "./_components/dashboard-stats"
import { DashboardToday } from "./_components/dashboard-today"
import { DashboardUpcoming } from "./_components/dashboard-upcoming"
import { DashboardCompletion } from "./_components/dashboard-completion"
import { DashboardAgents } from "./_components/dashboard-agents"
import {
  AgentsSkeleton,
  GreetingSkeleton,
  ListCardSkeleton,
  ProgressSkeleton,
  SectionCardsSkeleton,
} from "./_components/skeletons"

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      <Suspense fallback={<GreetingSkeleton />}>
        <DashboardGreeting />
      </Suspense>

      <Suspense fallback={<SectionCardsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
        <div className="space-y-4 lg:col-span-2">
          <Suspense fallback={<ListCardSkeleton title="Agenda du jour" rows={3} />}>
            <DashboardToday />
          </Suspense>
          <Suspense fallback={<ListCardSkeleton title="Les 7 prochains jours" rows={5} />}>
            <DashboardUpcoming />
          </Suspense>
        </div>
        <div className="space-y-4">
          <Suspense fallback={<ProgressSkeleton />}>
            <DashboardCompletion />
          </Suspense>
          <Suspense fallback={<AgentsSkeleton />}>
            <DashboardAgents />
          </Suspense>
        </div>
      </div>
    </div>
  )
}