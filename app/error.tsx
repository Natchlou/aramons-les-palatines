'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & {
    digest?: string
  }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border bg-muted/50">
          <AlertTriangle className="size-8 text-muted-foreground" />
        </div>

        <p className="text-sm font-medium text-muted-foreground">
          Erreur inattendue
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Une erreur est survenue
        </h1>

        <p className="mt-4 text-muted-foreground">
          Impossible de charger cette page correctement. Vous pouvez réessayer
          ou retourner à l&apos;accueil.
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

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="size-4" />
            Réessayer
          </button>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Home className="size-4" />
            Accueil
          </Link>
        </div>
      </div>
    </main>
  )
}