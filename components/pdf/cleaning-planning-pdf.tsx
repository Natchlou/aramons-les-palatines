import * as React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type {
  MonthlyScheduleResponse,
  Task,
} from "@/lib/planningService"

// ============================================================================
// Types
// ============================================================================

export interface CleaningPlanningPdfProps {
  schedule: MonthlyScheduleResponse
  /** Masque pause / hall / plonge / lessives / common. */
  hideFixedTasks?: boolean
}

// ============================================================================
// Helpers
// ============================================================================

const TYPE_LABELS: Record<string, string> = {
  menage: "Ménage",
  hall: "Hall",
  pause: "Pause",
  plonge: "Plonge",
  lessives: "Lessives",
  common: "Parties communes",
  fixed: "—",
}

function taskLabel(task: Task): string {
  if (task.type === "menage") return TYPE_LABELS.menage
  if (task.resident) return task.resident
  return TYPE_LABELS[task.type] ?? task.type
}

function serviceLabel(task: Task): string {
  if (task.type !== "menage") return "—"
  const parts = [
    task.building ? `Bât. ${task.building}` : null,
    task.room ? `Ch. ${task.room}` : null,
  ].filter(Boolean)
  return parts.join(" • ") || "—"
}

function hasMultipleAgents(schedule: MonthlyScheduleResponse): boolean {
  const agents = new Set<string>()
  for (const w of schedule.weeks) {
    for (const d of w.days) {
      for (const t of d.tasks) {
        if (t.type === "menage" && t.agent) agents.add(t.agent)
      }
    }
  }
  return agents.size > 1
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#111827",
  },

  // ---- Header ----
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 8,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerLabel: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  agentLabel: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  agentName: {
    fontSize: 10,
    fontWeight: "bold",
  },

  // ---- Semaine ----
  weekBanner: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  weekLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ---- Table ----
  table: {
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: "#d1d5db",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 0.5,
    borderColor: "#d1d5db",
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#4b5563",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 0.5,
    borderColor: "#d1d5db",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // ---- Day row ----
  dayRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#d1d5db",
  },
  dayDateCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 0.5,
    borderColor: "#d1d5db",
    justifyContent: "flex-start",
  },
  dayDateText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
  },
  dayTasksCell: {
    flexDirection: "column",
    borderRightWidth: 0.5,
    borderColor: "#d1d5db",
  },
  taskRow: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: "#e5e7eb",
    minHeight: 14,
    alignItems: "center",
  },
  taskRowLast: {
    borderBottomWidth: 0,
  },

  // ---- Task cells ----
  cellTime: {
    fontSize: 7,
    color: "#374151",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.3,
    borderColor: "#e5e7eb",
  },
  cellLabel: {
    fontSize: 7,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.3,
    borderColor: "#e5e7eb",
  },
  cellName: {
    fontSize: 7,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.3,
    borderColor: "#e5e7eb",
  },
  cellService: {
    fontSize: 7,
    color: "#6b7280",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.3,
    borderColor: "#e5e7eb",
  },
  cellAgent: {
    fontSize: 7,
    color: "#6b7280",
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },

  labelMenage: {
    fontWeight: "bold",
    color: "#111827",
  },
  labelFixed: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  nameMenage: {
    fontWeight: "bold",
    color: "#111827",
  },
  nameEmpty: {
    color: "#d1d5db",
  },

  // ---- Footer ----
  footer: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#9ca3af",
  },
})

// ============================================================================
// Layout constants
// ============================================================================

/** Largeur utile A4 paysage (842pt) - marges (24×2) = 794pt. */
const COL_DATE = 100
const COL_TIME = 45
const COL_LABEL = 90
const COL_NAME = 180
const COL_SERVICE = 150
const COL_AGENT = 110

// ============================================================================
// Sous-composants
// ============================================================================

interface HeaderRowProps {
  showAgent: boolean
}

function TableHeader({ showAgent }: HeaderRowProps) {
  return (
    <View style={styles.tableHeader} fixed>
      <Text style={[styles.tableHeaderCell, { width: COL_DATE }]}>Date</Text>
      <Text style={[styles.tableHeaderCell, { width: COL_TIME }]}>Heure</Text>
      <Text style={[styles.tableHeaderCell, { width: COL_LABEL }]}>
        À faire
      </Text>
      <Text style={[styles.tableHeaderCell, { width: COL_NAME }]}>Nom</Text>
      <Text style={[styles.tableHeaderCell, { width: COL_SERVICE }]}>
        Service
      </Text>
      {showAgent && (
        <Text
          style={[styles.tableHeaderCell, { width: COL_AGENT, borderRightWidth: 0 }]}
        >
          Agent
        </Text>
      )}
    </View>
  )
}

interface TaskRowProps {
  task: Task
  isLast: boolean
  showAgent: boolean
}

function TaskRow({ task, isLast, showAgent }: TaskRowProps) {
  const isMenage = task.type === "menage"

  return (
    <View style={[styles.taskRow, isLast ? styles.taskRowLast : {}]}>
      <Text style={[styles.cellTime, { width: COL_TIME }]}>{task.time}</Text>

      <Text
        style={[
          styles.cellLabel,
          { width: COL_LABEL },
          isMenage ? styles.labelMenage : styles.labelFixed,
        ]}
      >
        {taskLabel(task)}
      </Text>

      <Text
        style={[
          styles.cellName,
          { width: COL_NAME },
          isMenage ? styles.nameMenage : styles.nameEmpty,
        ]}
      >
        {isMenage ? task.resident ?? "—" : "—"}
      </Text>

      <Text
        style={[
          styles.cellService,
          { width: COL_SERVICE },
          !showAgent ? { borderRightWidth: 0 } : {},
        ]}
      >
        {serviceLabel(task)}
      </Text>

      {showAgent && (
        <Text style={[styles.cellAgent, { width: COL_AGENT }]}>
          {task.agent ?? "—"}
        </Text>
      )}
    </View>
  )
}

// ============================================================================
// Composant principal
// ============================================================================

export function CleaningPlanningPdf({
  schedule,
  hideFixedTasks = false,
}: CleaningPlanningPdfProps) {
  const showAgent = hasMultipleAgents(schedule)
  const displayAgent = schedule.agent

  return (
    <Document
      title={schedule.title}
      author="Résidence Séniors Aramons / Les Palatines"
      creator="Planning ménage"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ---------- Header ---------- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>Planning ménage</Text>
            <Text style={styles.title}>{schedule.title}</Text>
            {schedule.subtitle && (
              <Text style={styles.subtitle}>{schedule.subtitle}</Text>
            )}
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.agentLabel}>
              {showAgent ? "Équipe" : "Agent"}
            </Text>
            <Text style={styles.agentName}>{displayAgent}</Text>
          </View>
        </View>

        {/* ---------- Table ---------- */}
        <View style={styles.table}>
          <TableHeader showAgent={showAgent} />

          {schedule.weeks.map((week, weekIdx) => (
            <React.Fragment key={`week-${weekIdx}-${week.label}`}>
              {/* Bandeau semaine */}
              <View style={styles.weekBanner} wrap={false}>
                <Text style={styles.weekLabel}>{week.label}</Text>
              </View>

              {week.days.map((day) => {
                const tasks = hideFixedTasks
                  ? day.tasks.filter((t) => t.type === "menage")
                  : day.tasks

                if (tasks.length === 0) return null

                return (
                  <View
                    key={`day-${day.isoDate}`}
                    style={styles.dayRow}
                    wrap={false}
                  >
                    {/* Date */}
                    <View style={[styles.dayDateCell, { width: COL_DATE }]}>
                      <Text style={styles.dayDateText}>{day.date}</Text>
                    </View>

                    {/* Colonne des tâches empilées */}
                    <View
                      style={[
                        styles.dayTasksCell,
                        { width: showAgent
                            ? COL_TIME + COL_LABEL + COL_NAME + COL_SERVICE + COL_AGENT
                            : COL_TIME + COL_LABEL + COL_NAME + COL_SERVICE },
                      ]}
                    >
                      {tasks.map((task, i) => (
                        <TaskRow
                          key={`t-${i}-${task.time}-${task.agent ?? ""}`}
                          task={task}
                          isLast={i === tasks.length - 1}
                          showAgent={showAgent}
                        />
                      ))}
                    </View>
                  </View>
                )
              })}
            </React.Fragment>
          ))}
        </View>

        {/* ---------- Footer ---------- */}
        <View style={styles.footer} fixed>
          <Text>{schedule.subtitle ?? "Planning ménage"}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

export default CleaningPlanningPdf