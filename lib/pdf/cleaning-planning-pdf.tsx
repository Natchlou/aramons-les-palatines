// lib/pdf/cleaning-planning-pdf.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { createTw } from "@react-pdf/tailwind";

export type CleaningTask = {
  time: string;
  resident: string;
  room?: string;
  building?: string;
  type?:
    | "menage"
    | "hall"
    | "plonge"
    | "pause"
    | "lavettes"
    | "bureaux"
    | "salle_animation";
};

export type DayAbsenceStatus = {
  type: "conges" | "maladie" | "remplacement";
  replacedBy?: string; // nom de l'agent remplaçant, pertinent si type === "remplacement"
};

export type CleaningPlanningDay = {
  date: string;
  tasks: CleaningTask[];
  absence?: DayAbsenceStatus;
};

export type CleaningPlanningWeek = {
  label: string;
  days: CleaningPlanningDay[];
};

export type CleaningPlanningMonth = {
  title: string;
  subtitle?: string;
  agent: string;
  weeks: CleaningPlanningWeek[];
};

export type CleaningPlanningMode = "weekly" | "monthly";

type CleaningPlanningPdfProps = {
  planning: CleaningPlanningMonth;
  mode?: CleaningPlanningMode;
};

const tw = createTw({
  theme: {
    extend: {
      fontFamily: {
        sans: ["Helvetica"],
      },
    },
  },
});

// Palette "Aramons - Les Palatines" en hex (classes arbitraires bg-[#...],
// @react-pdf/tailwind ne résout pas les couleurs custom nommées du thème).
const c = {
  background: "#FBF8F2",
  foreground: "#443830",
  primary: "#AD5C39",
  primaryForeground: "#FDFBF7",
  secondary: "#6FA0A6",
  secondaryForeground: "#FDFBF7",
  muted: "#EFE7D8",
  mutedForeground: "#79695C",
  accent: "#D8B067",
  accentForeground: "#443830",
  border: "#DCD3C1",
  destructive: "#B85C4A",
  destructiveBg: "#F5E4DE",
};

function getTaskLabel(task: CleaningTask) {
  switch (task.type) {
    case "hall":
      return "Hall";
    case "plonge":
      return "Plonge";
    case "pause":
      return "Pause";
    case "lavettes":
      return "Lavettes";
    case "bureaux":
      return "Bureaux";
    case "salle_animation":
      return "Salle d'animation";
    case "menage":
    default:
      return "Ménage";
  }
}

function formatTaskLine(task: CleaningTask) {
  const parts = [task.time, task.resident];

  if (task.room) parts.push(`Ch. ${task.room}`);
  if (task.building) parts.push(`Bât. ${task.building}`);

  return parts.join(" — ");
}

function getAbsenceLabel(absence: DayAbsenceStatus) {
  switch (absence.type) {
    case "conges":
      return "En congé";
    case "maladie":
      return "Arrêt maladie";
    case "remplacement":
      return absence.replacedBy
        ? `Remplacé par ${absence.replacedBy}`
        : "Remplacé";
    default:
      return "Absent";
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }

  return result;
}

function WeekTable({
  week,
  compact,
}: {
  week: CleaningPlanningWeek;
  compact: boolean;
}) {
  const rowMinHeight = compact ? "min-h-[20px]" : "min-h-[26px]";
  const cellText = compact ? "text-[7px]" : "text-xs";
  const cellPad = compact ? "p-1.5" : "p-2";
  const taskLabelText = compact ? "text-[6px]" : "text-[7px]";

  return (
    <View style={tw("mb-6")}>
      <Text
        style={tw(
          `${compact ? "text-sm" : "text-base"} font-bold text-[${c.primary}] mb-2 pb-1 border-b border-[${c.accent}]`,
        )}
      >
        {week.label}
      </Text>

      <View style={tw(`w-full rounded-lg overflow-hidden border border-[${c.border}]`)}>
        <View style={tw(`flex flex-row bg-[${c.secondary}] min-h-[18px]`)}>
          <Text
            style={tw(
              `w-1/5 ${cellPad} ${compact ? "text-[7px]" : "text-xs"} font-bold text-[${c.secondaryForeground}]`,
            )}
          >
            Date
          </Text>
          <Text
            style={tw(
              `flex-1 ${cellPad} ${compact ? "text-[7px]" : "text-xs"} font-bold text-[${c.secondaryForeground}]`,
            )}
          >
            Tâches
          </Text>
        </View>

        {week.days.map((day, index) => (
          <View
            style={tw(
              `flex flex-row ${rowMinHeight} border-t border-[${c.border}] ${
                day.absence
                  ? `bg-[${c.destructiveBg}]`
                  : index % 2 === 1
                    ? `bg-[${c.muted}]`
                    : ""
              }`,
            )}
            key={`${day.date}-${index}`}
            wrap={false}
          >
            <Text
              style={tw(
                `w-1/5 ${cellPad} ${cellText} font-bold text-[${c.primary}] border-r border-[${c.border}]`,
              )}
            >
              {day.date}
            </Text>

            <View style={tw(`flex-1 ${cellPad}`)}>
              {day.absence ? (
                <Text style={tw(`${cellText} font-bold text-[${c.destructive}]`)}>
                  {getAbsenceLabel(day.absence)}
                </Text>
              ) : day.tasks.length > 0 ? (
                day.tasks.map((task, taskIndex) => (
                  <Text key={taskIndex} style={tw(`${cellText} mb-0.5`)}>
                    {formatTaskLine(task)}{" "}
                    <Text style={tw(`${taskLabelText} font-bold text-[${c.secondary}]`)}>
                      ({getTaskLabel(task)})
                    </Text>
                  </Text>
                ))
              ) : (
                <Text style={tw(`${cellText} italic text-[${c.mutedForeground}]`)}>
                  Aucune tâche prévue
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function PlanningPage({
  planning,
  weeks,
  compact,
}: {
  planning: CleaningPlanningMonth;
  weeks: CleaningPlanningWeek[];
  compact: boolean;
}) {
  return (
    <Page size="A4" style={tw(`bg-[${c.background}] font-sans text-[${c.foreground}]`)}>
      <View style={tw(`bg-[${c.primary}] px-8 ${compact ? "py-4" : "py-5"}`)}>
        <Text style={tw(`${compact ? "text-base" : "text-lg"} font-bold text-[${c.primaryForeground}]`)}>
          {planning.title}
        </Text>

        {planning.subtitle && (
          <Text style={tw(`text-xs text-[${c.primaryForeground}] opacity-90 mt-1`)}>
            {planning.subtitle}
          </Text>
        )}

        <View style={tw(`mt-3 self-start rounded-full bg-[${c.accent}] px-3 py-1`)}>
          <Text style={tw(`text-sm font-bold text-[${c.accentForeground}]`)}>
            {planning.agent}
          </Text>
        </View>
      </View>

      <View style={tw(compact ? "p-6" : "p-8")}>
        {weeks.map((week, index) => (
          <WeekTable key={`${week.label}-${index}`} week={week} compact={compact} />
        ))}
      </View>

      <Text
        style={tw(
          `absolute bottom-5 left-8 right-8 text-center text-[7px] text-[${c.mutedForeground}]`,
        )}
        render={({ pageNumber, totalPages }) =>
          `Résidence Aramons / Les Palatines — Page ${pageNumber} / ${totalPages}`
        }
        fixed
      />
    </Page>
  );
}

export default function CleaningPlanningPdf({
  planning,
  mode = "weekly",
}: CleaningPlanningPdfProps) {
  const pagesGroups =
    mode === "monthly"
      ? chunk(planning.weeks, 2)
      : planning.weeks.map((week) => [week]);

  return (
    <Document
      title="Planning ménage"
      author="Résidence Aramons / Les Palatines"
      subject="Planning ménage"
    >
      {pagesGroups.map((weeks, index) => (
        <PlanningPage
          key={index}
          planning={planning}
          weeks={weeks}
          compact={mode === "monthly"}
        />
      ))}
    </Document>
  );
}