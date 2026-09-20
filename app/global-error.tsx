'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & {
    digest?: string
  }
  reset: () => void
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border bg-muted/50">
              <AlertTriangle className="size-8 text-muted-foreground" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              Erreur critique
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Une erreur est survenue
            </h1>

            <p className="mt-4 text-muted-foreground">
              L&apos;application a rencontré un problème inattendu. Essayez
              de recharger l&apos;application.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-left">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Erreur de développement
                </p>

                <p className="wrap-break-word font-mono text-xs text-muted-foreground">
                  {error.message}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="size-4" />
              Recharger l&apos;application
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}