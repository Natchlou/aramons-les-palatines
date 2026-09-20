"use client"
import Link from 'next/link'
import { ArrowLeft, Home, ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border bg-muted/50">
                    <ShieldX className="size-8 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                    Accès refusé
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight">
                    Vous n&apos;êtes pas autorisé
                </h1>

                <p className="mt-4 text-muted-foreground">
                    Vous n&apos;avez pas les permissions nécessaires pour accéder à cette
                    page. Contactez un administrateur si vous pensez qu&apos;il s&apos;agit
                    d&apos;une erreur.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Home className="size-4" />
                        Retour à l&apos;accueil
                    </Link>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        <ArrowLeft className="size-4" />
                        Page précédente
                    </button>
                </div>
            </div>
        </main>
    )
}