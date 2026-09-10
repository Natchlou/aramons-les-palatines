"use client";

import { useState } from "react";

import type {
  CleaningPlanningMode,
} from "@/lib/pdf/cleaning-planning-pdf";
import { Planning } from "../planning";

type GeneratePlanningPdfProps = {
  planning: Planning;
  mode?: CleaningPlanningMode;
};

export default function GeneratePlanningPdf({
  planning,
  mode = "weekly",
}: GeneratePlanningPdfProps) {
  const [loading, setLoading] = useState(false);

  async function generatePdf() {
    const previewWindow = window.open("", "_blank");

    try {
      setLoading(true);

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planning,
          mode,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error ?? "Impossible de générer le PDF.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (previewWindow) {
        previewWindow.location.href = url;
      } else {
        window.open(url, "_blank");
      }

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60_000);
    } catch (error) {
      previewWindow?.close();

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de générer le PDF.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generatePdf}
      disabled={loading || planning.data.weeks.length === 0}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
    >
      {loading ? "Génération du PDF..." : "Exporter en PDF"}
    </button>
  );
}