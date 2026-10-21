
import type { ReactNode } from "react";

interface TestZoneProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function TestZone({
  children,
  title = "Zone de développement",
  description = "Espace réservé aux tests et aux expérimentations.",
  className = "",
}: TestZoneProps) {
  return (
    <main
      className={`relative min-h-screen w-full overflow-hidden border-2 border-red-500 px-8 py-4 ${className}`}
    >
      {/* Grille de fond */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0
          bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
          bg-size-[24px_24px]"
      />

      {/* Badge */}
      <span className="absolute right-0 top-0 z-20 bg-red-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
        Zone de test
      </span>

      {/* Contenu */}
      <section className="relative z-10">
        <h1 className="text-lg font-semibold text-gray-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>

        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
