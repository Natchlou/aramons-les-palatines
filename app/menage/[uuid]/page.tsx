"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlideToAction } from "@/components/slide-to-action";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  Loader2Icon,
  PlayIcon,
  XIcon,
} from "lucide-react";

type Resident = {
  id: string;
  prefix: string | null;
  first_name: string | null;
  last_name: string | null;
  room: string | null;
  building: string | null;
};

type RecentMenage = {
  id: string;
  resident_id: string;
  date: string;
  heure: string;
  statut: string;
  started_at: string | null;
  completed_at: string | null;
  completion_reason?: string | null;
};

type DevAction = "start" | "elapsed_1h" | "elapsed_90m" | "reset" | "cancel";

const MINIMUM_DURATION_MS = 60 * 60 * 1000;
const STANDARD_DURATION_MS = 90 * 60 * 1000;

const ADMIN_ROLES = ["admin", "super_admin"];

const COMPLETION_REASONS = [
  {
    value: "LOGEMENT_ALREADY_CLEAN",
    label: "Le logement était déjà propre",
  },
  {
    value: "LESS_CLEANING_REQUIRED",
    label: "Le ménage nécessaire était moins important que prévu",
  },
  {
    value: "RESIDENT_ABSENT",
    label: "Le résident était absent ou l'accès était limité",
  },
  {
    value: "TECHNICAL_ISSUE",
    label: "Un incident ou un problème technique est survenu",
  },
  {
    value: "OTHER",
    label: "Autre motif",
  },
] as const;

export default function CleaningPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const router = useRouter();

  const [menage, setMenage] = useState<RecentMenage | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [startAttempt, setStartAttempt] = useState(0);
  const [completionAttempt, setCompletionAttempt] = useState(0);

  const [showReasonForm, setShowReasonForm] = useState(false);
  const [completionReason, setCompletionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Affichage de la barre d'actions rapides (la vraie protection est dans la RPC).
  const [isAdmin, setIsAdmin] = useState(false);

  // Chargement du ménage, du résident et du rôle de l'utilisateur.
  useEffect(() => {
    let cancelled = false;

    async function loadMenage() {
      try {
        setLoading(true);
        setError(null);

        const { uuid } = await params;
        if (cancelled) return;

        const supabase = createClient();

        // Rôle de l'utilisateur connecté.
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single<{ role: string }>();

          if (cancelled) return;

          setIsAdmin(!!profile && ADMIN_ROLES.includes(profile.role));
        }

        const { data: menageData, error: menageError } = await supabase
          .from("recents_menages")
          .select("*")
          .eq("id", uuid)
          .single<RecentMenage>();

        if (cancelled) return;

        if (menageError || !menageData) {
          console.error(menageError);
          setError("Ménage introuvable.");
          return;
        }

        setMenage(menageData);

        if (menageData.statut === "IN_PROGRESS") {
          setNow(Date.now());
        }

        const { data: residentData, error: residentError } = await supabase
          .from("residents")
          .select("*")
          .eq("id", menageData.resident_id)
          .single<Resident>();

        if (cancelled) return;

        if (residentError || !residentData) {
          console.error(residentError);
          setError("Résident introuvable.");
          return;
        }

        setResident(residentData);
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setError("Une erreur est survenue lors du chargement.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMenage();

    return () => {
      cancelled = true;
    };
  }, [params]);

  // Actualisation du compteur chaque seconde.
  useEffect(() => {
    if (menage?.statut !== "IN_PROGRESS") return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [menage?.statut]);

  const startedAtMs = menage?.started_at
    ? new Date(menage.started_at).getTime()
    : null;

  const elapsedMs =
    startedAtMs !== null && now !== 0
      ? Math.max(0, now - startedAtMs)
      : 0;

  const remainingMs = Math.max(0, STANDARD_DURATION_MS - elapsedMs);

  // La validation devient possible après 1 heure.
  const canComplete =
    menage?.statut === "IN_PROGRESS" &&
    startedAtMs !== null &&
    now !== 0 &&
    elapsedMs >= MINIMUM_DURATION_MS;

  // À partir de 1 h 30, le motif n'est plus obligatoire.
  const needsReason =
    elapsedMs >= MINIMUM_DURATION_MS && elapsedMs < STANDARD_DURATION_MS;

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedRemaining = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  const formattedElapsed = (() => {
    const totalMinutes = Math.floor(elapsedMs / 60000);
    const elapsedHours = Math.floor(totalMinutes / 60);
    const elapsedMinutes = totalMinutes % 60;

    return `${elapsedHours} h ${elapsedMinutes.toString().padStart(2, "0")} min`;
  })();

  // Démarrage du ménage.
  const handleStart = async () => {
    if (!menage || menage.statut !== "PENDING") return;

    try {
      setActionLoading(true);
      setError(null);

      const supabase = createClient();
      const startedAt = new Date().toISOString();

      const { data, error: updateError } = await supabase
        .from("recents_menages")
        .update({
          statut: "IN_PROGRESS",
          started_at: startedAt,
        })
        .eq("id", menage.id)
        .eq("statut", "PENDING")
        .select("*")
        .single<RecentMenage>();

      if (updateError || !data) {
        console.error(updateError);
        setError(
          "Impossible de démarrer le ménage. Il a peut-être déjà été démarré.",
        );
        setStartAttempt((attempt) => attempt + 1);
        return;
      }

      setMenage(data);
      setNow(Date.now());
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors du démarrage.");
      setStartAttempt((attempt) => attempt + 1);
    } finally {
      setActionLoading(false);
    }
  };

  // Le slider ouvre le formulaire si le ménage est terminé avant 1 h 30.
  const handleCompleteRequest = async () => {
    if (!menage || !canComplete || actionLoading) return;

    setError(null);

    if (needsReason) {
      setShowReasonForm(true);
      return;
    }

    await validateMenage(null);
  };

  // Validation effective du ménage.
  const validateMenage = async (reason: string | null) => {
    if (!menage || !canComplete) return;

    try {
      setActionLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: rpcError } = await supabase.rpc(
        "validate_cleaning",
        {
          p_menage_id: menage.id,
          p_completion_reason: reason,
        },
      );

      if (rpcError) {
        console.error(rpcError);

        switch (rpcError.message) {
          case "MINIMUM_DURATION_NOT_REACHED":
            setError(
              "Une durée minimale d'une heure est nécessaire avant de valider ce ménage.",
            );
            break;

          case "COMPLETION_REASON_REQUIRED":
            setError(
              "Un motif est obligatoire pour terminer le ménage avant 1 h 30.",
            );
            setShowReasonForm(true);
            break;

          case "MENAGE_NOT_IN_PROGRESS":
            setError("Ce ménage n'est plus en cours.");
            break;

          case "MENAGE_NOT_STARTED":
            setError("Ce ménage n'a pas encore été démarré.");
            break;

          case "MENAGE_NOT_FOUND":
            setError("Ménage introuvable.");
            break;

          default:
            setError("Impossible de valider le ménage.");
        }

        setCompletionAttempt((attempt) => attempt + 1);
        return;
      }

      if (!data) {
        setError("La validation du ménage a échoué.");
        setCompletionAttempt((attempt) => attempt + 1);
        return;
      }

      setMenage(data as RecentMenage);
      setShowReasonForm(false);

      router.push("/planning");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la validation.");
      setCompletionAttempt((attempt) => attempt + 1);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReason = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!completionReason) {
      setError("Veuillez sélectionner un motif.");
      return;
    }

    if (completionReason === "OTHER" && !customReason.trim()) {
      setError("Veuillez préciser le motif.");
      return;
    }

    const selectedReason = COMPLETION_REASONS.find(
      (reason) => reason.value === completionReason,
    );

    if (!selectedReason) {
      setError("Le motif sélectionné est invalide.");
      return;
    }

    const reasonToSave =
      completionReason === "OTHER"
        ? `Autre : ${customReason.trim()}`
        : selectedReason.label;

    await validateMenage(reasonToSave);
  };

  // Actions rapides de développement (admin / super_admin).
  const handleDevAction = async (action: DevAction) => {
    if (!menage || !isAdmin) return;

    try {
      setActionLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: rpcError } = await supabase.rpc(
        "dev_menage_action",
        {
          p_menage_id: menage.id,
          p_action: action,
        },
      );

      if (rpcError || !data) {
        console.error(rpcError);
        setError(`Action « ${action} » impossible.`);
        return;
      }

      setMenage(data as RecentMenage);
      setNow(Date.now());
      setShowReasonForm(false);
      setStartAttempt((attempt) => attempt + 1);
      setCompletionAttempt((attempt) => attempt + 1);
    } catch (err) {
      console.error(err);
      setError(`Action « ${action} » impossible.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Simule 1 h 30 écoulées puis passe par la vraie validation.
  const handleDevForceComplete = async () => {
    if (!menage || !isAdmin) return;

    try {
      setActionLoading(true);
      setError(null);

      const supabase = createClient();

      if (menage.statut === "PENDING") {
        const { error: startError } = await supabase.rpc("dev_menage_action", {
          p_menage_id: menage.id,
          p_action: "start",
        });
        if (startError) throw startError;
      }

      const { error: shiftError } = await supabase.rpc("dev_menage_action", {
        p_menage_id: menage.id,
        p_action: "elapsed_90m",
      });
      if (shiftError) throw shiftError;

      const { error: validateError } = await supabase.rpc("validate_cleaning", {
        p_menage_id: menage.id,
        p_completion_reason: null,
      });
      if (validateError) throw validateError;

      router.push("/planning");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Validation forcée impossible.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
          <span>Chargement...</span>
        </div>
      </main>
    );
  }

  if (error && !menage) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Ménage introuvable</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>

          <CardFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Retour
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!menage || !resident) return null;

  const fullName = [resident.prefix, resident.first_name, resident.last_name]
    .filter(Boolean)
    .join(" ");

  const isPending = menage.statut === "PENDING";
  const isInProgress = menage.statut === "IN_PROGRESS";
  const isCompleted = menage.statut === "COMPLETED";
  const isCancelled = menage.statut === "CANCELLED";

  const formattedDate = (() => {
    const date = new Date(`${menage.date}T00:00:00`);

    return Number.isNaN(date.getTime())
      ? menage.date
      : new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "full",
        }).format(date);
  })();

  const formattedTime = menage.heure ? menage.heure.slice(0, 5) : "—";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Validation du ménage</CardTitle>

          <div>
            <p className="text-2xl font-semibold">{fullName || "Résident"}</p>

            <p className="text-sm text-muted-foreground">
              Chambre {resident.room ?? "—"} · {resident.building ?? "—"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="mt-1 font-medium">{formattedDate}</p>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm text-muted-foreground">Heure prévue</p>
              <p className="mt-1 font-medium">{formattedTime}</p>
            </div>
          </div>

          {isPending && (
            <div className="rounded-xl border bg-muted/40 p-6 text-center">
              <PlayIcon className="mx-auto mb-3 size-10 text-primary" />

              <p className="font-semibold">Ménage prêt à démarrer</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Faites glisser le bouton ci-dessous pour commencer.
              </p>

              <p className="mt-3 text-sm font-medium">Durée prévue : 1 h 30</p>
            </div>
          )}

          {isInProgress && (
            <div className="rounded-xl border bg-muted/40 p-6 text-center">
              <Clock3Icon className="mx-auto mb-3 size-10 text-primary" />

              <p className="text-sm text-muted-foreground">Temps écoulé</p>

              <p className="mt-2 font-mono text-3xl font-bold tabular-nums">
                {formattedElapsed}
              </p>

              {remainingMs > 0 && (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Temps restant avant 1 h 30
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                    {formattedRemaining}
                  </p>
                </>
              )}

              {elapsedMs < MINIMUM_DURATION_MS ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  La validation sera possible après 1 h de ménage.
                </p>
              ) : needsReason ? (
                <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-400">
                  Vous pouvez terminer maintenant, mais un motif sera
                  obligatoire avant 1 h 30.
                </p>
              ) : (
                <p className="mt-3 text-sm font-medium text-green-600">
                  Les 1 h 30 sont écoulées. Vous pouvez valider sans motif.
                </p>
              )}
            </div>
          )}

          {showReasonForm && isInProgress && (
            <form
              onSubmit={handleSubmitReason}
              className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
            >
              <div>
                <h3 className="font-semibold">
                  Justification de fin anticipée
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Le ménage dure moins de 1 h 30. Sélectionnez le motif
                  expliquant pourquoi il est terminé plus tôt.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="completion-reason"
                  className="text-sm font-medium"
                >
                  Motif <span className="text-destructive">*</span>
                </label>

                <select
                  id="completion-reason"
                  value={completionReason}
                  onChange={(event) => {
                    setCompletionReason(event.target.value);
                    setError(null);
                  }}
                  required
                  disabled={actionLoading}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner un motif</option>

                  {COMPLETION_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {completionReason === "OTHER" && (
                <div className="space-y-2">
                  <label
                    htmlFor="custom-reason"
                    className="text-sm font-medium"
                  >
                    Précisions <span className="text-destructive">*</span>
                  </label>

                  <textarea
                    id="custom-reason"
                    value={customReason}
                    onChange={(event) => {
                      setCustomReason(event.target.value);
                      setError(null);
                    }}
                    placeholder="Expliquez pourquoi le ménage a été terminé plus tôt..."
                    required
                    minLength={3}
                    maxLength={500}
                    rows={3}
                    disabled={actionLoading}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={actionLoading || !completionReason}
                >
                  {actionLoading && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  Confirmer la fin du ménage
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => {
                    setShowReasonForm(false);
                    setCompletionReason("");
                    setCustomReason("");
                    setError(null);
                    setCompletionAttempt((attempt) => attempt + 1);
                  }}
                >
                  Retour
                </Button>
              </div>
            </form>
          )}

          {isCompleted && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
              <CheckCircle2Icon className="mx-auto mb-3 size-10 text-green-600" />

              <p className="font-semibold text-green-700 dark:text-green-400">
                Ménage terminé
              </p>

              {menage.completed_at && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Validé le{" "}
                  {new Date(menage.completed_at).toLocaleString("fr-FR")}
                </p>
              )}

              {menage.completion_reason && (
                <p className="mt-3 text-sm">
                  <span className="font-medium">Motif :</span>{" "}
                  {menage.completion_reason}
                </p>
              )}
            </div>
          )}

          {isCancelled && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <XIcon className="mx-auto mb-3 size-10 text-destructive" />
              <p className="font-semibold text-destructive">Ménage annulé</p>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-2 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Actions admin (dev)
              </p>

              <div className="flex flex-wrap gap-2">
                {isPending && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => handleDevAction("start")}
                  >
                    Démarrer
                  </Button>
                )}

                {isInProgress && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() => handleDevAction("elapsed_1h")}
                    >
                      +1 h écoulée
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() => handleDevAction("elapsed_90m")}
                    >
                      +1 h 30 écoulées
                    </Button>
                  </>
                )}

                {(isPending || isInProgress) && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={actionLoading}
                    onClick={handleDevForceComplete}
                  >
                    Valider maintenant
                  </Button>
                )}

                {!isPending && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => handleDevAction("reset")}
                  >
                    Réinitialiser
                  </Button>
                )}

                {!isCancelled && !isCompleted && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={actionLoading}
                    onClick={() => handleDevAction("cancel")}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
            >
              <AlertCircleIcon className="size-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>

        {!isCompleted && !isCancelled && (
          <CardFooter>
            {!showReasonForm && isPending && (
              <div className="flex w-full flex-col gap-3">
                <SlideToAction
                  text="Glisser pour démarrer le ménage"
                  successText="Ménage démarré"
                  disabled={actionLoading}
                  resetKey={startAttempt}
                  onComplete={handleStart}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <XIcon className="mr-2 size-4" />
                  Retour
                </Button>
              </div>
            )}

            {!showReasonForm && isInProgress && (
              <div className="flex w-full flex-col gap-3">
                <SlideToAction
                  text={
                    canComplete
                      ? needsReason
                        ? "Glisser pour terminer avec justification"
                        : "Glisser pour valider le ménage"
                      : "Validation disponible après 1 heure"
                  }
                  successText="Validation en cours"
                  disabled={!canComplete || actionLoading}
                  resetKey={completionAttempt}
                  onComplete={handleCompleteRequest}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  Retour
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </main>
  );
}