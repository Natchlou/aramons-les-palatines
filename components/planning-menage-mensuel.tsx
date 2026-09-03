"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";

type Statut = "a-faire" | "en-cours" | "termine";

type Menage = {
  id: string;
  appartement: string;
  agent: string;
  creneau: string;
  statut: Statut;
};

const statutConfig: Record<Statut, { label: string; badge: string; dot: string }> = {
  "a-faire": { label: "À faire", badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  "en-cours": { label: "En cours", badge: "bg-accent/60 text-accent-foreground", dot: "bg-accent-foreground" },
  termine: { label: "Terminé", badge: "bg-chart-3/20 text-chart-3", dot: "bg-chart-3" },
};

const agentColor: Record<string, string> = {
  "Sophie M.": "bg-chart-1",
  "Karim B.": "bg-chart-2",
  "Nadia L.": "bg-chart-4",
};

// Données d'exemple pour août 2026 — clé au format "YYYY-MM-DD"
const menagesParJour: Record<string, Menage[]> = {
  "2026-08-03": [
    { id: "1", appartement: "T2 - 101", agent: "Sophie M.", creneau: "8h30", statut: "termine" },
    { id: "2", appartement: "T1 - 112", agent: "Karim B.", creneau: "9h00", statut: "termine" },
  ],
  "2026-08-04": [
    { id: "3", appartement: "T2 - 203", agent: "Karim B.", creneau: "9h00", statut: "termine" },
  ],
  "2026-08-05": [
    { id: "4", appartement: "T1 - 210", agent: "Nadia L.", creneau: "10h00", statut: "termine" },
    { id: "5", appartement: "T2 - 214", agent: "Nadia L.", creneau: "10h30", statut: "termine" },
    { id: "6", appartement: "Communs - RDC", agent: "Nadia L.", creneau: "11h15", statut: "termine" },
  ],
  "2026-08-10": [
    { id: "7", appartement: "T2 - 108", agent: "Sophie M.", creneau: "9h45", statut: "termine" },
  ],
  "2026-08-11": [
    { id: "8", appartement: "T1 - 104", agent: "Sophie M.", creneau: "9h15", statut: "termine" },
    { id: "9", appartement: "T2 - 207", agent: "Karim B.", creneau: "9h45", statut: "termine" },
  ],
  "2026-08-17": [
    { id: "10", appartement: "T2 - 101", agent: "Sophie M.", creneau: "8h30", statut: "termine" },
  ],
  "2026-08-24": [
    { id: "11", appartement: "T1 - 112", agent: "Karim B.", creneau: "9h00", statut: "termine" },
    { id: "12", appartement: "T2 - 203", agent: "Karim B.", creneau: "9h45", statut: "termine" },
  ],
  "2026-08-26": [
    { id: "13", appartement: "T2 - 214", agent: "Nadia L.", creneau: "10h30", statut: "en-cours" },
  ],
  "2026-08-29": [
    { id: "14", appartement: "T2 - 108", agent: "Sophie M.", creneau: "9h45", statut: "en-cours" },
    { id: "15", appartement: "T1 - 210", agent: "Nadia L.", creneau: "10h00", statut: "a-faire" },
    { id: "16", appartement: "Communs - RDC", agent: "Nadia L.", creneau: "11h15", statut: "a-faire" },
  ],
  "2026-08-31": [
    { id: "17", appartement: "T2 - 207", agent: "Karim B.", creneau: "9h45", statut: "a-faire" },
  ],
};

const joursLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const moisLabels = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  // décale pour que la semaine commence lundi (0 = lundi ... 6 = dimanche)
  const offset = (firstOfMonth.getDay() + 6) % 7;

  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - offset);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

export default function PlanningMenagesMensuel() {
  const today = new Date(2026, 7, 29); // 29 août 2026
  const [moisAffiche, setMoisAffiche] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [jourSelectionne, setJourSelectionne] = useState(formatKey(today));

  const cellules = useMemo(() => buildMonthGrid(moisAffiche), [moisAffiche]);

  const changerMois = (delta: number) => {
    setMoisAffiche((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const menagesDuJour = menagesParJour[jourSelectionne] ?? [];
  const dateSelectionneeLabel = new Date(jourSelectionne).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* En-tête + navigation mois */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
        <div>
          <p className="text-sm text-muted-foreground">Résidence Les Palatines</p>
          <h2 className="text-xl font-semibold">
            {moisLabels[moisAffiche.getMonth()]} {moisAffiche.getFullYear()}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changerMois(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMoisAffiche(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => changerMois(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grille calendrier */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-muted-foreground pb-2">
          {joursLabels.map((j) => (
            <div key={j}>{j}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 pb-4">
          {cellules.map((date) => {
            const key = formatKey(date);
            const dansLeMois = date.getMonth() === moisAffiche.getMonth();
            const estAujourdhui = formatKey(today) === key;
            const estSelectionne = jourSelectionne === key;
            const menagesJour = menagesParJour[key] ?? [];
            const visibles = menagesJour.slice(0, 2);
            const reste = menagesJour.length - visibles.length;

            return (
              <button
                key={key}
                onClick={() => setJourSelectionne(key)}
                className={[
                  "flex flex-col items-start gap-1 rounded-lg border p-1.5 text-left min-h-19 transition-colors",
                  estSelectionne
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-border hover:bg-muted/50",
                  !dansLeMois && "opacity-40",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    estAujourdhui ? "bg-primary text-primary-foreground" : "text-foreground",
                  ].join(" ")}
                >
                  {date.getDate()}
                </span>

                <div className="w-full space-y-0.5">
                  {visibles.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] bg-muted/70"
                    >
                      <span className={["h-1.5 w-1.5 shrink-0 rounded-full", agentColor[m.agent]].join(" ")} />
                      <span className="truncate">{m.appartement}</span>
                    </div>
                  ))}
                  {reste > 0 && (
                    <div className="px-1 text-[11px] text-muted-foreground">+{reste} de plus</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Détail du jour sélectionné */}
      <div className="border-t border-border px-6 py-5">
        <h3 className="text-base font-semibold capitalize mb-3">{dateSelectionneeLabel}</h3>

        {menagesDuJour.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun ménage prévu ce jour-là.</p>
        ) : (
          <div className="space-y-2">
            {menagesDuJour.map((m) => {
              const cfg = statutConfig[m.statut];
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5"
                >
                  <span className={["h-2 w-2 shrink-0 rounded-full", agentColor[m.agent]].join(" ")} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {m.appartement}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{m.agent}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {m.creneau}
                  </div>
                  <span className={["flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0", cfg.badge].join(" ")}>
                    <span className={["h-1.5 w-1.5 rounded-full", cfg.dot].join(" ")} />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}