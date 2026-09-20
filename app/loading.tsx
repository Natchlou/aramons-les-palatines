import { Loader2Icon } from 'lucide-react'

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/50">
          <Loader2Icon className="size-7 animate-spin text-muted-foreground" />
        </div>

        <h1 className="text-lg font-semibold">
          Chargement...
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez patienter quelques instants.
        </p>
      </div>
    </main>
  )
}