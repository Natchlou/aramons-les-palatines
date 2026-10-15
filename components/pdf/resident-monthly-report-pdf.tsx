import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

// ============================================================
// Types
// ============================================================

export type CleaningStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"

export interface ResidentMonthlyReportCleaning {
  id: string
  /** Date au format ISO (yyyy-mm-dd ou ISO complet) */
  date: string
  /** Heure prévue, ex: "14h00" */
  time: string
  status: CleaningStatus
  startedAt: string | null
  completedAt: string | null
}

export interface ResidentMonthlyReport {
  resident: {
    id: string
    name: string
    room: string | null
    building: string | null
  }
  period: {
    /** 1 = janvier, 12 = décembre */
    month: number
    year: number
  }
  cleanings: ResidentMonthlyReportCleaning[]
}

export interface ResidentMonthlyReportPdfProps {
  reports: ResidentMonthlyReport[]
  /** ISO — date de génération, affichée dans le pied de page */
  generatedAt?: string
}

// ============================================================
// Helpers
// ============================================================

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

const STATUS_LABELS: Record<CleaningStatus, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
}

const STATUS_COLORS: Record<CleaningStatus, string> = {
  PENDING: "#C99A2E",
  IN_PROGRESS: "#3B6E9E",
  COMPLETED: "#4A7C59",
  CANCELLED: "#A83A2C",
}

function computeDurationMinutes(
  startedAt: string | null,
  completedAt: string | null,
): number | null {
  if (!startedAt || !completedAt) return null
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  return Math.max(0, Math.round((end - start) / 60000))
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h} h ${String(m).padStart(2, "0")}`
  if (h > 0) return `${h} h`
  return `${m} min`
}

function formatDateFr(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const label = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#3B2E24",
    backgroundColor: "#FFFFFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#B85C38",
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B85C38",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#6B5B4D",
    marginTop: 2,
  },
  headerPeriod: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3B2E24",
    textAlign: "right",
  },

  // Resident
  residentBlock: {
    backgroundColor: "#FAF6EE",
    borderLeftWidth: 4,
    borderLeftColor: "#B85C38",
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  residentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3B2E24",
  },
  residentMeta: {
    fontSize: 9,
    color: "#6B5B4D",
    marginTop: 3,
  },
  residentBadge: {
    fontSize: 9,
    color: "#FFFFFF",
    backgroundColor: "#B85C38",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0D5C0",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  statLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#6B5B4D",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B2E24",
  },

  // Progress
  progressWrapper: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 9,
    color: "#6B5B4D",
  },
  progressValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#3B2E24",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E0D5C0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#B85C38",
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3B2E24",
    marginBottom: 8,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: "#E0D5C0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#FAF6EE",
    borderBottomWidth: 1,
    borderBottomColor: "#E0D5C0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8D8",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  cellHeader: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6B5B4D",
    letterSpacing: 0.4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cell: {
    fontSize: 9,
    color: "#3B2E24",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cellBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  // Columns
  colDate: { width: "45%" },
  colTime: { width: "13%" },
  colStatus: { width: "24%" },
  colDuration: { width: "18%", textAlign: "right" },

  // Status pill
  statusPill: {
    fontSize: 8,
    color: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  // Empty
  empty: {
    padding: 16,
    textAlign: "center",
    fontSize: 9,
    color: "#6B5B4D",
    fontStyle: "italic",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#6B5B4D",
    borderTopWidth: 1,
    borderTopColor: "#E0D5C0",
    paddingTop: 6,
  },
})

// ============================================================
// Une page = un résident
// ============================================================

function ReportPage({
  report,
  generatedAt,
}: {
  report: ResidentMonthlyReport
  generatedAt: string
}) {
  const { resident, period, cleanings } = report
  const periodLabel = `${MONTHS_FR[period.month - 1]} ${period.year}`

  const total = cleanings.length
  const completed = cleanings.filter((c) => c.status === "COMPLETED").length
  const cancelled = cleanings.filter((c) => c.status === "CANCELLED").length
  const pending = cleanings.filter(
    (c) => c.status === "PENDING" || c.status === "IN_PROGRESS",
  ).length

  const totalMinutes = cleanings.reduce((sum, c) => {
    const d = computeDurationMinutes(c.startedAt, c.completedAt)
    return sum + (d ?? 0)
  }, 0)

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0

  const sorted = [...cleanings].sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  return (
    <Page size="A4" style={styles.page} wrap>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Aramons Les Palatines</Text>
          <Text style={styles.headerSubtitle}>
            Rapport mensuel de ménage
          </Text>
        </View>
        <Text style={styles.headerPeriod}>{periodLabel}</Text>
      </View>

      {/* Résident */}
      <View style={styles.residentBlock}>
        <View>
          <Text style={styles.residentName}>{resident.name}</Text>
          <Text style={styles.residentMeta}>
            Chambre {resident.room ?? "—"} · Bâtiment{" "}
            {resident.building ?? "—"}
          </Text>
        </View>
        <Text style={styles.residentBadge}>Résident</Text>
      </View>

      {/* Statistiques */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total ménages</Text>
          <Text style={styles.statValue}>{total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Terminés</Text>
          <Text style={styles.statValue}>{completed}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>En cours / attente</Text>
          <Text style={styles.statValue}>{pending}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Annulés</Text>
          <Text style={styles.statValue}>{cancelled}</Text>
        </View>
      </View>

      {/* Progression */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Taux de réalisation · Temps cumulé :{" "}
            {formatDuration(totalMinutes)}
          </Text>
          <Text style={styles.progressValue}>{completionRate}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${completionRate}%` },
            ]}
          />
        </View>
      </View>

      {/* Détail */}
      <Text style={styles.sectionTitle}>Détail des ménages</Text>

      {sorted.length === 0 ? (
        <View style={styles.table}>
          <Text style={styles.empty}>
            Aucun ménage enregistré pour cette période.
          </Text>
        </View>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cellHeader, styles.colDate]}>Date</Text>
            <Text style={[styles.cellHeader, styles.colTime]}>Heure</Text>
            <Text style={[styles.cellHeader, styles.colStatus]}>Statut</Text>
            <Text style={[styles.cellHeader, styles.colDuration]}>
              Durée
            </Text>
          </View>

          {sorted.map((c, i) => {
            const duration = computeDurationMinutes(
              c.startedAt,
              c.completedAt,
            )
            const isLast = i === sorted.length - 1
            return (
              <View
                key={c.id}
                style={[styles.tableRow, isLast ? styles.tableRowLast : {}]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.colDate]}>
                  {formatDateFr(c.date)}
                </Text>
                <Text style={[styles.cell, styles.colTime]}>{c.time}</Text>
                <View style={[styles.cellBox, styles.colStatus]}>
                  <Text
                    style={[
                      styles.statusPill,
                      { backgroundColor: STATUS_COLORS[c.status] },
                    ]}
                  >
                    {STATUS_LABELS[c.status]}
                  </Text>
                </View>
                <Text style={[styles.cell, styles.colDuration]}>
                  {formatDuration(duration)}
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>Aramons Les Palatines · Rapport mensuel</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
        />
        <Text>Généré le {generatedAt}</Text>
      </View>
    </Page>
  )
}

// ============================================================
// Document
// ============================================================

export default function ResidentMonthlyReportPdf({
  reports,
  generatedAt,
}: ResidentMonthlyReportPdfProps) {
  const dateLabel = new Date(generatedAt!).toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  )

  return (
    <Document
      title="Rapport mensuel de ménage"
      author="Aramons Les Palatines"
      subject="Rapport mensuel"
    >
      {reports.map((report) => (
        <ReportPage
          key={report.resident.id}
          report={report}
          generatedAt={dateLabel}
        />
      ))}
    </Document>
  )
}