import React from "react"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

import type {
  CleaningPlanning,
  PlanningDay,
  PlanningWeek,
  Resident,
} from "@/lib/planning/types"

const DAYS = {
  "1": "Lundi",
  "2": "Mardi",
  "3": "Mercredi",
  "4": "Jeudi",
  "5": "Vendredi",
} as const

type DayNumber = keyof typeof DAYS

interface CleaningPlanningPdfProps {
  planning: CleaningPlanning
  residents: Resident[]
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 30,
    fontFamily: "Helvetica",
    fontSize: 8,
  },

  header: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },

  agent: {
    fontSize: 10,
    color: "#4b5563",
  },

  weekTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },

  day: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 3,
  },

  dayHeader: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  dayHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },

  row: {
    flexDirection: "row",
    minHeight: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  time: {
    width: 52,
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },

  task: {
    width: 175,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },

  resident: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },

  service: {
    width: 105,
    paddingVertical: 4,
    paddingHorizontal: 5,
    color: "#4b5563",
  },

  columnHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  columnHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    paddingVertical: 4,
    paddingHorizontal: 5,
  },

  pause: {
    color: "#9ca3af",
    fontFamily: "Helvetica-Oblique",
  },

  normalTask: {
    fontFamily: "Helvetica-Bold",
  },

  emptyDay: {
    padding: 7,
    color: "#9ca3af",
    fontFamily: "Helvetica-Oblique",
  },

  footer: {
    position: "absolute",
    bottom: 12,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#9ca3af",
    fontSize: 7,
  },
})

function getResidentMap(residents: Resident[]) {
  return new Map(residents.map((resident) => [resident.id, resident]))
}

function getResidentName(resident: Resident) {
  const prefix = resident.prefix
    ? resident.prefix.endsWith(".")
      ? resident.prefix
      : `${resident.prefix}.`
    : null

  return [prefix, resident.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
}

function getResidentService(resident: Resident) {
  const parts = [
    resident.building ? `Bât. ${resident.building}` : null,
    resident.room ? `Ch. ${resident.room}` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(" • ") : "—"
}

function isResidentId(value: string, residentMap: Map<string, Resident>) {
  return residentMap.has(value)
}

function isMutedTask(value: string) {
  const normalized = value.trim().toLowerCase()

  return normalized.includes("pause") || normalized.includes("fin")
}

function getDayEntries(day: PlanningDay | undefined) {
  if (!day) {
    return []
  }

  return Object.entries(day)
}

function hasContent(week: PlanningWeek) {
  return Object.values(week).some(
    (day) => day && Object.keys(day).length > 0,
  )
}

function WeekHeader() {
  return (
    <View style={styles.columnHeader}>
      <Text
        style={[
          styles.columnHeaderText,
          { width: 52 },
        ]}
      >
        HEURE
      </Text>

      <Text
        style={[
          styles.columnHeaderText,
          { width: 175 },
        ]}
      >
        À FAIRE
      </Text>

      <Text
        style={[
          styles.columnHeaderText,
          { flex: 1 },
        ]}
      >
        NOM
      </Text>

      <Text
        style={[
          styles.columnHeaderText,
          { width: 105 },
        ]}
      >
        SERVICE
      </Text>
    </View>
  )
}

interface DayProps {
  dayNumber: DayNumber
  day: PlanningDay | undefined
  residentMap: Map<string, Resident>
}

function Day({ dayNumber, day, residentMap }: DayProps) {
  const entries = getDayEntries(day)

  return (
    <View style={styles.day} wrap={false}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>
          {DAYS[dayNumber]}
        </Text>
      </View>

      {entries.length === 0 ? (
        <Text style={styles.emptyDay}>
          Aucun créneau planifié
        </Text>
      ) : (
        <>
          <WeekHeader />

          {entries.map(([time, value], index) => {
            const resident = isResidentId(value, residentMap)
              ? residentMap.get(value)
              : undefined

            const isLast = index === entries.length - 1
            const muted = isMutedTask(value)

            return (
              <View
                key={`${dayNumber}-${time}-${value}`}
                style={[
                  styles.row,
                  isLast ? styles.lastRow : undefined,
                ]}
              >
                <Text style={styles.time}>
                  {time}
                </Text>

                <View style={styles.task}>
                  {resident ? (
                    <Text>Ménage</Text>
                  ) : (
                    <Text
                      style={
                        muted
                          ? styles.pause
                          : styles.normalTask
                      }
                    >
                      {value}
                    </Text>
                  )}
                </View>

                <Text style={styles.resident}>
                  {resident
                    ? getResidentName(resident)
                    : "—"}
                </Text>

                <Text style={styles.service}>
                  {resident
                    ? getResidentService(resident)
                    : "—"}
                </Text>
              </View>
            )
          })}
        </>
      )}
    </View>
  )
}

interface WeekProps {
  week: PlanningWeek
  weekIndex: number
  residentMap: Map<string, Resident>
}

function Week({
  week,
  weekIndex,
  residentMap,
}: WeekProps) {
  const dayNumbers = Object.keys(DAYS) as DayNumber[]

  return (
    <View>
      <Text style={styles.weekTitle}>
        Semaine {weekIndex + 1}
      </Text>

      {dayNumbers.map((dayNumber) => (
        <Day
          key={dayNumber}
          dayNumber={dayNumber}
          day={week[dayNumber]}
          residentMap={residentMap}
        />
      ))}
    </View>
  )
}

interface PlanningPageProps {
  planning: CleaningPlanning
  week: PlanningWeek
  weekIndex: number
  residentMap: Map<string, Resident>
  pageNumber: number
  totalPages: number
}

function PlanningPage({
  planning,
  week,
  weekIndex,
  residentMap,
  pageNumber,
  totalPages,
}: PlanningPageProps) {
  return (
    <Page
      size="A4"
      orientation="portrait"
      style={styles.page}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {planning.title}
        </Text>

        <Text style={styles.agent}>
          Agent : {planning.agent}
        </Text>
      </View>

      <Week
        week={week}
        weekIndex={weekIndex}
        residentMap={residentMap}
      />

      <View style={styles.footer} fixed>
        <Text>
          Planning ménage
        </Text>

        <Text>
          Page {pageNumber} / {totalPages}
        </Text>
      </View>
    </Page>
  )
}

export default function CleaningPlanningPdf({
  planning,
  residents,
}: CleaningPlanningPdfProps) {
  const residentMap = getResidentMap(residents)

  // On ne garde que les semaines qui contiennent réellement
  // au moins un créneau.
  const weeks = planning.weeks
    .map((week, originalIndex) => ({
      week,
      originalIndex,
    }))
    .filter(({ week }) => hasContent(week))

  return (
    <Document
      title={planning.title}
      author="Aramons - Les Palatines"
      subject={`Planning ménage - ${planning.agent}`}
    >
      {weeks.map(({ week, originalIndex }, index) => (
        <PlanningPage
          key={`week-${originalIndex}`}
          planning={planning}
          week={week}
          weekIndex={originalIndex}
          residentMap={residentMap}
          pageNumber={index + 1}
          totalPages={weeks.length}
        />
      ))}
    </Document>
  )
}