
"use client";

import { useState } from "react";

type SendResult = {
  total: number;
  sent: number;
  failed: number;
  removed: number;
};

export default function PushBroadcastForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SendResult | null>(null);

  async function sendNotification() {
    setError("");
    setResult(null);
    setConfirming(false);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });

      const text = await response.text();

      let data: {
        error?: string;
        total?: number;
        sent?: number;
        failed?: number;
        removed?: number;
      };

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Réponse invalide du serveur (HTTP ${response.status}). Vérifie les logs Vercel.`,
        );
      }

      if (!response.ok) {
        throw new Error(data.error ?? `Erreur HTTP ${response.status}.`);
      }

      setResult({
        total: data.total ?? 0,
        sent: data.sent ?? 0,
        failed: data.failed ?? 0,
        removed: data.removed ?? 0,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erreur inconnue.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setResult(null);
          setConfirming(true);
        }}
        className="space-y-6 rounded-2xl border bg-card p-6"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Composer une notification
          </h2>
          <p className="text-sm text-muted-foreground">
            Tous les abonnements actifs seront ciblés.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="push-title" className="text-sm font-medium">
            Titre
          </label>
          <input
            id="push-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            required
            placeholder="Ex. : Nouveau planning disponible"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-right text-xs text-muted-foreground">
            {title.length}/100
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="push-body" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="push-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={500}
            required
            rows={4}
            placeholder="Rédige le contenu de la notification..."
            className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-right text-xs text-muted-foreground">
            {body.length}/500
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="push-url" className="text-sm font-medium">
            Destination au clic
          </label>
          <input
            id="push-url"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            placeholder="/planning"
            pattern="/(?!/).*"
            title="Saisis un chemin interne commençant par un seul /"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Exemple : /planning, /actualites ou /.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {result && (
          <div
            role="status"
            className="space-y-2 rounded-xl border p-4 text-sm"
          >
            <p className="font-semibold">Envoi terminé</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Envoyées</p>
                <p className="text-2xl font-semibold">{result.sent}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Échecs</p>
                <p className="text-2xl font-semibold">{result.failed}</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              {result.total} abonnements traités · {result.removed} expirés supprimés.
            </p>
          </div>
        )}

        {confirming ? (
          <div className="space-y-3 rounded-xl border p-4">
            <p className="text-sm font-medium">
              Confirmer l&apos;envoi à tous les abonnés ?
            </p>
            <p className="text-sm text-muted-foreground">
              Cette action enverra immédiatement la notification à tous
              les appareils abonnés.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={sendNotification}
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Confirmer l'envoi"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            Préparer l&apos;envoi
          </button>
        )}
      </form>

      <aside className="space-y-4">
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Aperçu
          </p>

          <div className="mt-4 flex gap-3 rounded-xl border bg-background p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
              N
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold">
                {title.trim() || "Titre de la notification"}
              </p>
              <p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
                {body.trim() || "Le contenu apparaîtra ici."}
              </p>
              <p className="text-xs text-muted-foreground">
                À l&apos;instant · Notification
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            L&apos;affichage réel peut varier selon iOS, Android et le navigateur.
          </p>
        </div>

        <div className="rounded-2xl border p-5">
          <h3 className="text-sm font-semibold">À savoir</h3>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            <li>Seuls les appareils abonnés recevront le message.</li>
            <li>Les utilisateurs doivent avoir autorisé les notifications.</li>
            <li>Les abonnements expirés seront nettoyés automatiquement.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
