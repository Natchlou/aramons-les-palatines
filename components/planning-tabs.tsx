"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CleaningPlanning } from "@/components/planning"
import GeneratePlanningPdf from "@/components/generate-planning-pdf"
import {
  filterScheduleByAgent,
  listAgentsInSchedule,
  type MonthlyScheduleResponse,
} from "@/lib/planningService"

export interface PlanningTabsProps {
  schedule: MonthlyScheduleResponse
  /** ID de la ligne `planning` en DB (pour l'API PDF). */
  planningId: number
  year: number
  month: number
}

export function PlanningTabs({
  schedule,
  planningId,
  year,
  month,
}: PlanningTabsProps) {
  const agents = React.useMemo(() => listAgentsInSchedule(schedule), [schedule])
  const [activeTab, setActiveTab] = React.useState<string>(agents[0] ?? "")

  const filteredByAgent = React.useMemo(() => {
    const map = new Map<string, MonthlyScheduleResponse>()
    for (const agent of agents) {
      map.set(agent, filterScheduleByAgent(schedule, agent))
    }
    return map
  }, [schedule, agents])

  if (agents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun agent dans ce planning.
      </p>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          {agents.map((agent) => (
            <TabsTrigger key={agent} value={agent}>
              {agent}
            </TabsTrigger>
          ))}
        </TabsList>

        <GeneratePlanningPdf
          planningId={planningId}
          year={year}
          month={month}
          agent={activeTab}
        />
      </div>

      {agents.map((agent) => (
        <TabsContent key={agent} value={agent}>
          <CleaningPlanning schedule={filteredByAgent.get(agent)!}/>
        </TabsContent>
      ))}
    </Tabs>
  )
}