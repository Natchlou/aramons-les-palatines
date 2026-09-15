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

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
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
};

const CLEANING_DURATION_MS = 90 * 60 * 1000;

export default function CleaningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [menage, setMenage] = useState<RecentMenage | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [now, setNow] = useState(0);

  const [error, setError] = useState<string | null>(null);

  /*
   * Chargement du ménage + résident.
   */
  useEffect(() => {
    let cancelled = false;

    const loadMenage = async () => {
      try {
        setLoading(true);
        setError(null);

        const { id } = await params;

        const supabase = createClient();

        const {
          data: menageData,
          error: menageError,
        } = await supabase
          .from("recents_menages")
          .select("*")
          .eq("id", id)
          .single<RecentMenage>();

        if (cancelled) {
          return;
        }

        if (menageError || !menageData) {
          console.error(menageError);

          setError("Ménage introuvable.");
          return;
        }

        setMenage(menageData);

        /*
         * Si le ménage est déjà en cours, on initialise
         * l'horloge à partir du moment où les données
         * sont reçues.
         *
         * Cela ne redémarre PAS le ménage :
         * started_at reste celui enregistré en base.
         */
        if (menageData.statut === "IN_PROGRESS") {
          setNow(Date.now());
        }

        const {
          data: residentData,
          error: residentError,
        } = await supabase
          .from("residents")
          .select("*")
          .eq("id", menageData.resident_id)
          .single<Resident>();

        if (cancelled) {
          return;
        }

        if (residentError || !residentData) {
          console.error(residentError);

          setError("Résident introuvable.");
          return;
        }

        setResident(residentData);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setError("Une erreur est survenue.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMenage();

    return () => {
      cancelled = true;
    };
  }, [params]);

  /*
   * Actualisation du compteur toutes les secondes.
   *
   * Le compteur est toujours calculé à partir de
   * menage.started_at.
   */
  useEffect(() => {
    if (menage?.statut !== "IN_PROGRESS") {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [menage?.statut]);

  /*
   * Calcul du temps restant.
   *
   * IMPORTANT :
   * started_at vient de Supabase.
   *
   * Exemple :
   *
   * started_at = 14:00
   * durée       = 1h30
   * fin prévue  = 15:30
   *
   * Si l'utilisateur recharge à 14:45 :
   *
   * 15:30 - 14:45 = 45 minutes restantes.
   */
  const remainingMs =
    !menage?.started_at || now === 0
      ? CLEANING_DURATION_MS
      : Math.max(
          0,
          new Date(menage.started_at).getTime() +
            CLEANING_DURATION_MS -
            now,
        );

  /*
   * Validation disponible uniquement lorsque
   * les 90 minutes sont réellement écoulées.
   */
  const canComplete =
    menage?.statut === "IN_PROGRESS" &&
    now !== 0 &&
    remainingMs <= 0;

  /*
   * Formatage HH:MM:SS.
   */
  const totalSeconds = Math.ceil(
    remainingMs / 1000,
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds = totalSeconds % 60;

  const formattedRemaining = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  /*
   * Démarrage du ménage.
   */
  const handleStart = async () => {
    if (!menage) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const supabase = createClient();

      const startedAt = new Date().toISOString();

      const {
        data,
        error: updateError,
      } = await supabase
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

        return;
      }

      setMenage(data);

      /*
       * Date.now() est utilisé ici dans un event handler,
       * donc c'est compatible avec les règles du React Compiler.
       */
      setNow(Date.now());
    } catch (error) {
      console.error(error);

      setError(
        "Une erreur est survenue lors du démarrage.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Validation du ménage.
   *
   * La RPC PostgreSQL vérifie elle-même les 90 minutes.
   * Le navigateur n'est donc PAS la sécurité.
   */
  const handleComplete = async () => {
    if (!menage || !canComplete) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const supabase = createClient();

      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "validate_cleaning",
        {
          p_menage_id: menage.id,
        },
      );

      if (rpcError) {
        console.error(rpcError);

        switch (rpcError.message) {
          case "MINIMUM_DURATION_NOT_REACHED":
            setError(
              "Les 1h30 ne sont pas encore écoulées.",
            );
            break;

          case "MENAGE_NOT_IN_PROGRESS":
            setError(
              "Ce ménage n'est plus en cours.",
            );
            break;

          case "MENAGE_NOT_STARTED":
            setError(
              "Ce ménage n'a pas encore été démarré.",
            );
            break;

          case "MENAGE_NOT_FOUND":
            setError("Ménage introuvable.");
            break;

          default:
            setError(
              "Impossible de valider le ménage.",
            );
        }

        return;
      }

      if (!data) {
        setError(
          "La validation du ménage a échoué.",
        );

        return;
      }

      setMenage(data as RecentMenage);

      router.push("/planning");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Une erreur est survenue lors de la validation.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  /*
   * Chargement.
   */
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

  /*
   * Erreur de chargement.
   */
  if (error && !menage) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>
              Ménage introuvable
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Retour
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!menage || !resident) {
    return null;
  }

  const fullName = [
    resident.prefix,
    resident.first_name,
    resident.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const isPending =
    menage.statut === "PENDING";

  const isInProgress =
    menage.statut === "IN_PROGRESS";

  const isCompleted =
    menage.statut === "COMPLETED";

  const isCancelled =
    menage.statut === "CANCELLED";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">
            Validation du ménage
          </CardTitle>

          <div>
            <p className="text-2xl font-semibold">
              {fullName || "Résident"}
            </p>

            <p className="text-sm text-muted-foreground">
              Chambre {resident.room ?? "—"} ·{" "}
              {resident.building ?? "—"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Date
              </p>

              <p className="mt-1 font-medium">
                {Intl.DateTimeFormat('fr', { dateStyle: 'full' }).format(new Date(menage.date as string))}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Heure prévue
              </p>

              <p className="mt-1 font-medium">
                 {Intl.DateTimeFormat('fr', { hour: 'numeric', minute: 'numeric', hour12: false }).format(new Date(`1970-01-01T${menage.heure}`))}
              </p>
            </div>
          </div>

          {/* Ménage en attente */}
          {isPending && (
            <div className="rounded-xl border bg-muted/40 p-6 text-center">
              <PlayIcon className="mx-auto mb-3 size-10 text-primary" />

              <p className="font-semibold">
                Ménage prêt à démarrer
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Appuyez sur le bouton pour commencer
                le ménage.
              </p>

              <p className="mt-3 text-sm font-medium">
                Durée prévue : 1h30
              </p>
            </div>
          )}

          {/* Ménage en cours */}
          {isInProgress && (
            <div className="rounded-xl border bg-muted/40 p-6 text-center">
              <Clock3Icon className="mx-auto mb-3 size-10 text-primary" />

              <p className="text-sm text-muted-foreground">
                Temps restant
              </p>

              <p className="mt-2 font-mono text-4xl font-bold tabular-nums">
                {formattedRemaining}
              </p>

              {canComplete ? (
                <p className="mt-2 text-sm font-medium text-green-600">
                  Les 1h30 sont écoulées.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  La validation sera disponible
                  lorsque les 1h30 seront écoulées.
                </p>
              )}
            </div>
          )}

          {/* Ménage terminé */}
          {isCompleted && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
              <CheckCircle2Icon className="mx-auto mb-3 size-10 text-green-600" />

              <p className="font-semibold text-green-700">
                Ménage terminé
              </p>

              {menage.completed_at && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Validé le{" "}
                  {new Date(
                    menage.completed_at,
                  ).toLocaleString("fr-FR")}
                </p>
              )}
            </div>
          )}

          {/* Ménage annulé */}
          {isCancelled && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <XIcon className="mx-auto mb-3 size-10 text-destructive" />

              <p className="font-semibold text-destructive">
                Ménage annulé
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <AlertCircleIcon className="size-5 shrink-0 text-destructive" />

              <p className="text-sm text-destructive">
                {error}
              </p>
            </div>
          )}
        </CardContent>

        {/* Boutons */}
        {!isCompleted && !isCancelled && (
          <CardFooter>
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                <XIcon />
                Annuler
              </Button>

              {isPending && (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleStart}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <PlayIcon />
                  )}

                  Démarrer
                </Button>
              )}

              {isInProgress && (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={
                    !canComplete ||
                    actionLoading
                  }
                >
                  {actionLoading ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <CheckIcon />
                  )}

                  Valider le ménage
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}