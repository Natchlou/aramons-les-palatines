(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: README.md
================================================
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



================================================
FILE: components.json
================================================
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {
    "@supabase": "https://supabase.com/ui/r/{name}.json",
    "@buzzform": "https://form.buildnbuzz.com/r/{name}.json"
  }
}



================================================
FILE: database.types.ts
================================================
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent: {
        Row: {
          created_at: string
          id: number
          maxSlotsPerDay: number | null
          name: string | null
          rotation_parity: string | null
          working_days: Database["public"]["Enums"]["days"][] | null
        }
        Insert: {
          created_at?: string
          id?: number
          maxSlotsPerDay?: number | null
          name?: string | null
          rotation_parity?: string | null
          working_days?: Database["public"]["Enums"]["days"][] | null
        }
        Update: {
          created_at?: string
          id?: number
          maxSlotsPerDay?: number | null
          name?: string | null
          rotation_parity?: string | null
          working_days?: Database["public"]["Enums"]["days"][] | null
        }
        Relationships: []
      }
      agent_absences: {
        Row: {
          agent_id: number | null
          created_at: string
          end_date: string | null
          id: number
          motif: string | null
          start_date: string | null
          type: string | null
        }
        Insert: {
          agent_id?: number | null
          created_at?: string
          end_date?: string | null
          id?: number
          motif?: string | null
          start_date?: string | null
          type?: string | null
        }
        Update: {
          agent_id?: number | null
          created_at?: string
          end_date?: string | null
          id?: number
          motif?: string | null
          start_date?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_absences_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
        ]
      }
      constraintes: {
        Row: {
          additional_service: string | null
          allowed_days: Database["public"]["Enums"]["days"][] | null
          bill: Database["public"]["Enums"]["type_bill"] | null
          created_at: string
          debiting: number | null
          disallow_days: Database["public"]["Enums"]["days"][] | null
          id: string
          per_month: number | null
          resident_id: string | null
          schedule_hours: Database["public"]["Enums"]["hours"][] | null
        }
        Insert: {
          additional_service?: string | null
          allowed_days?: Database["public"]["Enums"]["days"][] | null
          bill?: Database["public"]["Enums"]["type_bill"] | null
          created_at?: string
          debiting?: number | null
          disallow_days?: Database["public"]["Enums"]["days"][] | null
          id?: string
          per_month?: number | null
          resident_id?: string | null
          schedule_hours?: Database["public"]["Enums"]["hours"][] | null
        }
        Update: {
          additional_service?: string | null
          allowed_days?: Database["public"]["Enums"]["days"][] | null
          bill?: Database["public"]["Enums"]["type_bill"] | null
          created_at?: string
          debiting?: number | null
          disallow_days?: Database["public"]["Enums"]["days"][] | null
          id?: string
          per_month?: number | null
          resident_id?: string | null
          schedule_hours?: Database["public"]["Enums"]["hours"][] | null
        }
        Relationships: [
          {
            foreignKeyName: "constraintes_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: true
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      planning: {
        Row: {
          created_at: string
          data: Json | null
          date: string | null
          id: number
          month: number
          year: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          date?: string | null
          id?: number
          month: number
          year: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          date?: string | null
          id?: number
          month?: number
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      recents_menages: {
        Row: {
          completed_at: string | null
          created_at: string
          date: string | null
          details: Json | null
          heure: string | null
          id: string
          resident_id: string | null
          started_at: string | null
          statut: Database["public"]["Enums"]["status"] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date?: string | null
          details?: Json | null
          heure?: string | null
          id?: string
          resident_id?: string | null
          started_at?: string | null
          statut?: Database["public"]["Enums"]["status"] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date?: string | null
          details?: Json | null
          heure?: string | null
          id?: string
          resident_id?: string | null
          started_at?: string | null
          statut?: Database["public"]["Enums"]["status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "recents_menages_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          building: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          prefix: string | null
          room: string | null
        }
        Insert: {
          building?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          prefix?: string | null
          room?: string | null
        }
        Update: {
          building?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          prefix?: string | null
          room?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_cleaning: {
        Args: { p_menage_id: string }
        Returns: {
          completed_at: string | null
          created_at: string
          date: string | null
          details: Json | null
          heure: string | null
          id: string
          resident_id: string | null
          started_at: string | null
          statut: Database["public"]["Enums"]["status"] | null
        }
        SetofOptions: {
          from: "*"
          to: "recents_menages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      days: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi"
      hours:
        | "8h00"
        | "8h30"
        | "9h00"
        | "9h30"
        | "10h00"
        | "10h30"
        | "11h00"
        | "11h30"
        | "12h00"
        | "12h30"
        | "13h00"
        | "13h30"
        | "14h00"
        | "14h30"
        | "15h00"
        | "15h30"
        | "16h00"
        | "16h30"
        | "17h00"
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      type_bill: "mail" | "papier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      hours: [
        "8h00",
        "8h30",
        "9h00",
        "9h30",
        "10h00",
        "10h30",
        "11h00",
        "11h30",
        "12h00",
        "12h30",
        "13h00",
        "13h30",
        "14h00",
        "14h30",
        "15h00",
        "15h30",
        "16h00",
        "16h30",
        "17h00",
      ],
      status: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      type_bill: ["mail", "papier"],
    },
  },
} as const



================================================
FILE: eslint.config.mjs
================================================
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;



================================================
FILE: next.config.ts
================================================
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;



================================================
FILE: package.json
================================================
{
  "name": "aramons-les-palatines",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test-planning": "tsx scripts/test-planning.ts",
    "test-pdf": "tsx scripts/test-pdf.ts",
    "generate-type": "supabase gen types typescript --project-id ckaycfxfdtnsiybybdbv > database.types.ts"
  },
  "dependencies": {
    "@base-ui/react": "^1.7.0",
    "@buildnbuzz/form-core": "^0.1.12",
    "@buildnbuzz/form-react": "^0.1.13",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.9.1",
    "@radix-ui/react-visually-hidden": "^1.2.11",
    "@react-pdf/renderer": "^4.9.0",
    "@react-pdf/tailwind": "^0.2.0",
    "@shadcn/react": "^0.3.0",
    "@supabase/postgrest-js": "^2.115.0",
    "@supabase/ssr": "^0.12.6",
    "@supabase/supabase-js": "^2.115.0",
    "@tanstack/form-core": "^1.33.5",
    "@tanstack/react-form": "^1.33.5",
    "@tanstack/react-form-nextjs": "^1.33.5",
    "@tanstack/react-pacer": "^0.23.0",
    "@tanstack/react-table": "^9.2.4",
    "@zxing/browser": "^0.2.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "cn": "^0.2.5",
    "date-fns": "^4.4.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.5.0",
    "lucide-react": "^1.37.0",
    "marked": "^18.0.13",
    "next": "16.3.3",
    "next-themes": "^0.4.6",
    "react": "19.2.8",
    "react-day-picker": "^10.0.1",
    "react-dom": "19.2.8",
    "react-hook-form": "^7.87.0",
    "react-resizable-panels": "^4.12.3",
    "recharts": "^3.8.0",
    "shadcn": "^4.19.0",
    "sonner": "^2.0.8",
    "supabase": "^2.116.0",
    "tailwind-merge": "^3.6.0",
    "tsx": "^4.23.13",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.6.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^22.20.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.4.2",
    "eslint": "^9",
    "eslint-config-next": "16.3.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}



================================================
FILE: postcss.config.mjs
================================================
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;



================================================
FILE: proxy.ts
================================================
import { type NextRequest } from "next/server"

import { updateSession } from "@/lib/middleware"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}


================================================
FILE: tailwind.config.ts
================================================
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;



================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}



================================================
FILE: app/error.tsx
================================================
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


================================================
FILE: app/global-error.tsx
================================================
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


================================================
FILE: app/globals.css
================================================
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/*
  Palette "Aramons - Les Palatines"
  Inspiration : Camargue / Sud de la France — sable chaud, terracotta,
  bleu lagune, vert olivier. Contrastes renforcés pour un public senior
  (meilleure lisibilité), rayons de courbe plus généreux pour une
  ambiance accueillante et rassurante plutôt que "corporate".
*/

:root {
  --background: oklch(0.98 0.012 75); /* sable très clair, chaud */
  --foreground: oklch(0.27 0.02 50); /* brun foncé, doux, pas noir pur */

  --card: oklch(1 0.006 75);
  --card-foreground: oklch(0.27 0.02 50);

  --popover: oklch(1 0.006 75);
  --popover-foreground: oklch(0.27 0.02 50);

  --primary: oklch(0.52 0.13 40); /* terracotta / brique provençale */
  --primary-foreground: oklch(0.99 0.005 75);

  --secondary: oklch(0.62 0.07 200); /* bleu lagune/Camargue, doux */
  --secondary-foreground: oklch(0.99 0.005 75);

  --muted: oklch(0.94 0.02 70);
  --muted-foreground: oklch(0.45 0.03 55);

  --accent: oklch(0.78 0.1 85); /* doré/soleil, pour mise en avant */
  --accent-foreground: oklch(0.27 0.02 50);

  --destructive: oklch(0.58 0.21 27);

  --border: oklch(0.88 0.02 70);
  --input: oklch(0.9 0.02 70);
  --ring: oklch(0.6 0.1 40);

  --chart-1: oklch(0.62 0.14 40);
  --chart-2: oklch(0.62 0.08 200);
  --chart-3: oklch(0.68 0.11 130);
  --chart-4: oklch(0.78 0.1 85);
  --chart-5: oklch(0.5 0.05 50);

  --radius: 0.9rem;

  --sidebar: oklch(0.96 0.015 72);
  --sidebar-foreground: oklch(0.27 0.02 50);
  --sidebar-primary: oklch(0.52 0.13 40);
  --sidebar-primary-foreground: oklch(0.99 0.005 75);
  --sidebar-accent: oklch(0.9 0.03 70);
  --sidebar-accent-foreground: oklch(0.27 0.02 50);
  --sidebar-border: oklch(0.88 0.02 70);
  --sidebar-ring: oklch(0.6 0.1 40);
}

.dark {
  --background: oklch(0.22 0.015 50);
  --foreground: oklch(0.96 0.01 70);

  --card: oklch(0.27 0.018 48);
  --card-foreground: oklch(0.96 0.01 70);

  --popover: oklch(0.27 0.018 48);
  --popover-foreground: oklch(0.96 0.01 70);

  --primary: oklch(0.68 0.13 40);
  --primary-foreground: oklch(0.18 0.02 45);

  --secondary: oklch(0.5 0.07 200);
  --secondary-foreground: oklch(0.96 0.01 70);

  --muted: oklch(0.32 0.02 50);
  --muted-foreground: oklch(0.72 0.02 60);

  --accent: oklch(0.68 0.1 85);
  --accent-foreground: oklch(0.2 0.02 50);

  --destructive: oklch(0.65 0.2 25);

  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: oklch(0.68 0.13 40);

  --chart-1: oklch(0.68 0.13 40);
  --chart-2: oklch(0.6 0.08 200);
  --chart-3: oklch(0.65 0.11 130);
  --chart-4: oklch(0.72 0.1 85);
  --chart-5: oklch(0.55 0.04 55);

  --sidebar: oklch(0.25 0.017 48);
  --sidebar-foreground: oklch(0.96 0.01 70);
  --sidebar-primary: oklch(0.68 0.13 40);
  --sidebar-primary-foreground: oklch(0.18 0.02 45);
  --sidebar-accent: oklch(0.34 0.02 50);
  --sidebar-accent-foreground: oklch(0.96 0.01 70);
  --sidebar-border: oklch(1 0 0 / 12%);
  --sidebar-ring: oklch(0.68 0.13 40);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

.rayure {
  background-image: repeating-linear-gradient(
    45deg,
    #f0f0f0 0px,
    #f0f0f0 20px,
    #ffffff 20px,
    #ffffff 40px
  );
}

@media print {
  /* Masquer tout ce qui est marqué no-print */
  .no-print {
    display: none !important;
  }

  /* Masquer les onglets Radix non-actifs */
  [data-state="inactive"].print-only-active {
    display: none !important;
  }

  /* Afficher l'onglet actif */
  [data-state="active"].print-only-active {
    display: block !important;
  }

  /* Page A4 paysage */
  @page {
    size: A4 landscape;
    margin: 10mm;
  }

  html,
  body {
    background: white !important;
    color: black !important;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Éviter les coupures au milieu d'un jour */
  table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Répéter l'en-tête du tableau sur chaque page */
  table thead {
    display: table-header-group;
  }

  /* Supprimer les ombres */
  .shadow-sm,
  .shadow,
  .shadow-md,
  .shadow-lg {
    box-shadow: none !important;
  }

  /* Bordures plus nettes */
  table,
  th,
  td {
    border-color: #000 !important;
  }
}


================================================
FILE: app/layout.tsx
================================================
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Résidence Séniors Aramons Les Palatines",
  description: "Planning automatisé",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full w-full flex flex-col">
        {children}
      </body>
    </html>
  );
}



================================================
FILE: app/loading.tsx
================================================
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


================================================
FILE: app/not-found.tsx
================================================
"use client";
import Link from 'next/link'
import { ArrowLeft, Home, SearchX } from 'lucide-react'

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border bg-muted/50">
                    <SearchX className="size-8 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                    Erreur 404
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight">
                    Page introuvable
                </h1>

                <p className="mt-4 text-muted-foreground">
                    La page que vous recherchez n&apos;existe pas ou a peut-être été
                    déplacée.
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


================================================
FILE: app/page.tsx
================================================
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans">
        <h1 className="text-4xl font-bold mb-2">Bienvenue chez Aramons Les Palatines</h1>
        <h2 className="text-2xl">Vous trouvez ici la génération de planning de ménage</h2>
      </div>
    </>
  );
}



================================================
FILE: app/providers.tsx
================================================
"use client";

import { FormProvider } from "@buildnbuzz/form-react";
import { registry } from "@/components/buzzform/registry";

export default function FormProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormProvider registry={registry}>
      {children}
    </FormProvider>
  );
}


================================================
FILE: app/(admin)/layout.tsx
================================================
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import FormProviders from "../providers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";


export const metadata: Metadata = {
  title: "Administration",
  description: "Planning automatisé",
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Toaster />
      <TooltipProvider>
        <FormProviders>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" collapsible="icon" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex w-full flex-1 flex-col">
                <div className="@container/main w-full flex flex-1 flex-col gap-2">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </FormProviders>
      </TooltipProvider>
    </>
  );
}



================================================
FILE: app/(admin)/admin/agents/columns.tsx
================================================
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "@/database.types";
import { type DataTableFeatures } from "@/components/data-table/data-table-features";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

type AgentRow = Database['public']['Tables']['agent']['Row'];

const columnHelper = createColumnHelper<DataTableFeatures, AgentRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Nom"
  }),
  columnHelper.accessor("working_days", {
    header: "Jours de travail",
  }),
  columnHelper.accessor("maxSlotsPerDay", {
    header: "Ménage par jours",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return <Link href={`/admin/agents/${row.original.id}`} ><Button><EyeIcon /></Button></Link>;
    },
  }),
]);


================================================
FILE: app/(admin)/admin/agents/page.tsx
================================================
import { DataTable } from "@/components/data-table";

import { columns } from "./columns";
import { Database } from "@/database.types";
import SupabaseCrud from "@/lib/supabase-crud";

type AgentRow = Database['public']['Tables']['agent']['Row'];

export default async function AdminAgentsPage() {
  const agentsService = new SupabaseCrud<AgentRow>('agent')

  const agents = await agentsService.getAll()
  const agentsData = agents.data as AgentRow[] | null | undefined

  if (agents.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {agents.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des agents d&apos;entretiens
        </h1>
      </div>

      {agentsData?.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun agent trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={agentsData || []} columns={columns} />
      )}
    </div>
  );
}


================================================
FILE: app/(admin)/admin/agents/[id]/page.tsx
================================================
import AgentForm from "@/components/agents/agentForm"
import DataList from "@/components/data-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { Database } from "@/database.types"
import { createClient } from "@/lib/server"
import SupabaseCrud from "@/lib/supabase-crud"
import { ArrowLeftIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

type AgentRow = Database["public"]["Tables"]["agent"]["Row"]
type AgentAbsencesRow = Database["public"]["Tables"]["agent_absences"]["Row"]

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
})

const weekDays: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
}

export default async function AdminAgentShow({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const supabase = await createClient()

    const agentAbsencesService =
        new SupabaseCrud<AgentAbsencesRow>("agent_absences")

    const [agentResult, absencesResult] = await Promise.all([
        supabase
            .from("agent")
            .select("*")
            .eq("id", id)
            .single<AgentRow>(),

        agentAbsencesService.getWithFilters({
            filters: [
                {
                    column: "agent_id",
                    operator: "eq",
                    value: id,
                },
            ],
            sort: [
                { column: 'start_date'}
            ]
        }),
    ])

    const { data: agent, error: agentError } = agentResult

    const absences: AgentAbsencesRow[] = Array.isArray(absencesResult.data)
        ? absencesResult.data.flat()
        : []

    if (agentError || absencesResult.error) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-destructive">
                    Une erreur est survenue :{" "}
                    {agentError?.message || absencesResult.error?.message}
                </p>
            </div>
        )
    }

    if (!agent) {
        notFound()
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
            {/* En-tête */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image
                        src="/default.png"
                        alt={`Photo de ${agent.name}`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full bg-primary/10 object-cover"
                        loading="eager"
                    />

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {agent.name}
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Fiche de l&apos;agent d&apos;entretien
                        </p>
                    </div>
                </div>

                <Button variant="link">
                    <Link
                        href="/admin/agents"
                        className="flex items-center gap-1"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Retour
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_350px]">
                {/* Absences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Absences / Congés</CardTitle>

                        <CardAction>
                            <AgentForm agent_id={agent.id}/>
                        </CardAction>
                    </CardHeader>

                    <CardContent>
                        {absences.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Début</TableHead>
                                        <TableHead>Fin</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Motif</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {absences.map((absence) => (
                                        <TableRow key={absence.id}>
                                            <TableCell className="font-medium">
                                                {absence.start_date
                                                    ? dateFormatter.format(new Date(absence.start_date))
                                                    : "—"}
                                            </TableCell>

                                            <TableCell>
                                                {absence.end_date
                                                    ? dateFormatter.format(new Date(absence.end_date))
                                                    : "—"}
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {absence.type?.toUpperCase()}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                {absence.motif || "—"}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                {/* Actions */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucune absence ou congé enregistré pour le
                                moment.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Informations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations</CardTitle>
                    </CardHeader>

                    <CardContent className="text-sm">
                        <DataList
                            data={[
                                {
                                    title: "Jours de travail",
                                    value: agent.working_days?.length ? (
                                        <span className="flex flex-wrap gap-1">
                                            {agent.working_days.map((day) => (
                                                <Badge
                                                    variant="outline"
                                                    key={day}
                                                >
                                                    {weekDays[day] ?? day}
                                                </Badge>
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Non renseigné
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


================================================
FILE: app/(admin)/admin/residents/actions.ts
================================================
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export async function deleteResident(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("residents")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/residents");
}


================================================
FILE: app/(admin)/admin/residents/columns.tsx
================================================
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "@/database.types";
import { type DataTableFeatures } from "@/components/data-table/data-table-features";
import { ResidentActions } from "@/components/resident/resident-actions";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

const columnHelper = createColumnHelper<DataTableFeatures, ResidentRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("prefix", {
    header: "Préfixe"
  }),
  columnHelper.accessor("last_name", {
    header: "Nom",
  }),
  columnHelper.accessor("first_name", {
    header: "Prénom",
  }),
  columnHelper.accessor("room", {
    header: "Appartement",
  }),
  columnHelper.accessor("building", {
    header: "Bâtiment",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return <ResidentActions resident={row.original} />;
    },
  }),
]);


================================================
FILE: app/(admin)/admin/residents/page.tsx
================================================
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import ResidentForm from "@/components/resident/form";
import { Database } from "@/database.types";
import SupabaseCrud from "@/lib/supabase-crud";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

export default async function AdminResidentsPage() {
  const residentsService = new SupabaseCrud<ResidentRow>("residents")

  const residents = await residentsService.getWithFilters({
    sort: [{ column: 'room' }]
  })
  const residentsData = residents.data as ResidentRow[] | null | undefined

  if (residents.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {residents.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des résidents
        </h1>

        <ResidentForm />
      </div>

      {residentsData?.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun résident trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={residentsData || []} columns={columns} />
      )}
    </div>
  );
}


================================================
FILE: app/(admin)/admin/residents/[uuid]/page.tsx
================================================
import DataList from "@/components/data-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Database } from "@/database.types"
import { createClient } from "@/lib/server"
import { ArrowLeftIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Types
type ResidentRow = Database['public']['Tables']['residents']['Row'];
type ConstraintRow = Database['public']['Tables']['constraintes']['Row'];
type RecentMenageRow = Database['public']['Tables']['recents_menages']['Row'];

export default async function AdminResidentShow({
    params,
}: {
    params: Promise<{ uuid: string }>
}) {
    const { uuid } = await params

    const supabase = await createClient()

    const { data: resident, error: errorResident } = await supabase
        .from("residents")
        .select("*")
        .eq('id', uuid)
        .single<ResidentRow>();

    const { data: constraintes, error: errorConstraintes } = await supabase
        .from('constraintes')
        .select('*')
        .eq('resident_id', uuid)
        .maybeSingle<ConstraintRow>();

    const { data: recents_menages, error: errorRecentsMenage } = await supabase
        .from('recents_menages')
        .select('*')
        .eq('resident_id', uuid);

    if (errorResident || errorConstraintes || errorRecentsMenage) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-destructive">
                    Une erreur est survenue : {errorResident?.message} {errorConstraintes?.message} {errorRecentsMenage?.message}
                </p>
            </div>
        );
    }

    function splitCamelCaseArray(daysArray: string[]): string[] {
        return daysArray.flatMap(dayString =>
            dayString.split(/(?=[A-Z])/).map(day =>
                day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
            )
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans gap-6">
            {/* ===== En-tête : identité ===== */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image src={'/default.png'} alt="" width={256} height={256} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {resident.prefix} {resident.last_name} {resident.first_name}
                        </h1>
                        <p className="text-sm text-muted-foreground">Fiche du résident</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant={'link'}>
                        <Link href={'/admin/residents'} className="flex items-center gap-1"><ArrowLeftIcon /> Retour</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_350px]">

                {/* ===== Colonne principale ===== */}
                <div className="flex flex-col gap-4">

                    {constraintes && (constraintes.disallow_days || constraintes.schedule_hours) ? <Alert variant={'destructive'}>
                        <AlertTitle>Attention ce résident à des contraintes de ménages</AlertTitle>
                        <AlertDescription>
                            {constraintes.disallow_days ? <p>Jour de ménage : {splitCamelCaseArray(constraintes.disallow_days)}</p> : ''}
                            {constraintes.schedule_hours ? <p>Heure du ménage : {constraintes.schedule_hours}</p> : ''}
                        </AlertDescription>
                    </Alert> : ''}


                    <Card>
                        <CardHeader>
                            <CardTitle>Ménages récents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recents_menages.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Heure</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {recents_menages.map((item: RecentMenageRow) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {Intl.DateTimeFormat('fr', { dateStyle: 'full' }).format(new Date(item.date as string))}
                                                </TableCell>
                                                <TableCell>
                                                    {Intl.DateTimeFormat('fr', { hour: 'numeric', minute: 'numeric', hour12: false }).format(new Date(`1970-01-01T${item.heure}`))}
                                                </TableCell>
                                                <TableCell>
                                                    {item.statut}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/admin/residents/${resident.id}/${item.id}`}>
                                                        Voir en détail
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">Aucun ménage récent enregistré.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ===== Colonne latérale ===== */}
                <div className="flex flex-col gap-4">

                    {/* Propriétés / contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <DataList data={[
                                { title: 'Appartement', value: resident.room },
                                { title: 'Bâtiment', value: resident.building },
                                { title: 'Facture', value: <Badge>{constraintes?.bill ?? 'À définir'}</Badge> },
                                { title: 'Prélèvement', value: `Tous les ${constraintes?.debiting ?? '(à définir)'} du mois` },
                                { title: 'Nombre de ménage', value: constraintes?.per_month ?? 'À définir' },
                            ]} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>)
}


================================================
FILE: app/(admin)/admin/residents/[uuid]/[id]/page.tsx
================================================
import DataList from "@/components/data-list";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { Database } from "@/database.types";
import { createClient } from "@/lib/server";

import { CheckCircle2, CircleCheck, ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";

type RecentMenageRow =
    Database["public"]["Tables"]["recents_menages"]["Row"];

type ChecklistItem = {
    label: string;
    value: boolean;
};

type ChecklistSection = {
    title: string;
    items: ChecklistItem[];
};

type ChecklistDetails = ChecklistSection[];

export default async function AdminResidentDetailMenage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("recents_menages")
        .select("*")
        .eq("id", id)
        .single<RecentMenageRow>();

    if (error || !data) {
        notFound();
    }

    const details = data.details as ChecklistDetails;

    const checklistSections = details.filter(
        (section) => section.title !== "Prestation supplémentaire",
    );

    const totalItems = checklistSections.reduce(
        (total, section) => total + section.items.length,
        0,
    );

    const completedItems = checklistSections.reduce(
        (total, section) =>
            total + section.items.filter((item) => item.value).length,
        0,
    );

    const progress =
        totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;
    function formatTime(date: string | null) {
        if (!date) return "—";

        return new Date(date).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    function getDuration(
        startedAt: string | null,
        completedAt: string | null,
    ) {
        if (!startedAt || !completedAt) return "—";

        const start = new Date(startedAt).getTime();
        const end = new Date(completedAt).getTime();

        const duration = Math.floor((end - start) / 1000);

        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        return [
            hours > 0 ? `${hours} h` : null,
            minutes > 0 ? `${minutes} min` : null,
            `${seconds} s`,
        ]
            .filter(Boolean)
            .join(" ");
    }
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardCheck className="size-4" />
                        Ménage
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Détail du ménage
                    </h1>

                    <p className="text-muted-foreground">
                        Consultez les informations et la checklist du ménage.
                    </p>
                </div>

                <Badge
                    variant={
                        data.statut === "COMPLETED"
                            ? "default"
                            : "secondary"
                    }
                    className="w-fit px-3 py-1.5"
                >
                    {data.statut}
                </Badge>
            </div>

            <Separator />

            {/* Contenu */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                {/* Checklist - GAUCHE */}
                <section className="min-w-0 space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Checklist du ménage
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Vérification des différentes tâches effectuées.
                        </p>
                    </div>

                    {/* Progression */}
                    <Card>
                        <CardContent className="space-y-3 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CircleCheck className="size-4 text-primary" />

                                    <span className="text-sm font-medium">
                                        Progression
                                    </span>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    {completedItems}/{totalItems} tâches
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />
                                </div>

                                <span className="w-10 text-right text-sm font-medium">
                                    {progress}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sections */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {details.map((section) => {
                            const isExtraService =
                                section.title === "Prestation supplémentaire";

                            const completed = section.items.filter(
                                (item) => item.value,
                            ).length;

                            const total = section.items.length;

                            return (
                                <Card
                                    key={section.title}
                                    className="overflow-hidden"
                                >
                                    <CardHeader className="border-b bg-muted/30">
                                        <div className="flex items-center justify-between gap-3">
                                            <CardTitle className="text-base">
                                                {section.title}
                                            </CardTitle>

                                            {isExtraService ? (
                                                <Badge variant="outline">
                                                    Optionnel
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant={
                                                        completed === total
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="gap-1"
                                                >
                                                    {completed === total && (
                                                        <CheckCircle2 className="size-3.5" />
                                                    )}

                                                    {completed}/{total}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {section.items.map(
                                                (item, index) => (
                                                    <label
                                                        key={`${section.title}-${index}`}
                                                        className="flex cursor-default items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                                                    >
                                                        <Checkbox
                                                            checked={item.value}
                                                            disabled
                                                        />

                                                        <span
                                                            className={
                                                                item.value
                                                                    ? "text-sm text-muted-foreground line-through"
                                                                    : "text-sm"
                                                            }
                                                        >
                                                            {item.label ||
                                                                "Prestation supplémentaire"}
                                                        </span>

                                                        {item.value && (
                                                            <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" />
                                                        )}
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Informations - DROITE */}
                <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Informations du ménage
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Détails de l&apos;intervention.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <DataList
                                data={[
                                    {
                                        title: "Statut",
                                        value: (
                                            <Badge
                                                variant={
                                                    data.statut === "COMPLETED"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {data.statut}
                                            </Badge>
                                        ),
                                    },
                                    {
                                        title: "Date",
                                        value: data.date,
                                    },
                                    {
                                        title: "Heure prévue",
                                        value: data.heure,
                                    },
                                    {
                                        title: "Commencé à",
                                        value: formatTime(
                                            data.started_at,
                                        ),
                                    },
                                    {
                                        title: "Terminé à",
                                        value: formatTime(
                                            data.completed_at,
                                        ),
                                    },
                                    {
                                        title: "Durée",
                                        value: getDuration(
                                            data.started_at,
                                            data.completed_at,
                                        ),
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}


================================================
FILE: app/(admin)/admin/restaurant/page.tsx
================================================
export default function RestaurantPage() {
    return <div>
        
    </div>
}


================================================
FILE: app/(admin)/dashboard/page.tsx
================================================
import { SectionCards } from "@/components/section-cards"

export default function Page() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
      </div>
    </div>
  )
}



================================================
FILE: app/(main)/layout.tsx
================================================
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import Navbar from "@/components/navbar";
import FormProviders from "../providers";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <Toaster />
      <TooltipProvider>
        <FormProviders>
          {children}
        </FormProviders>
      </TooltipProvider>
    </>
  );
}



================================================
FILE: app/(main)/account/page.tsx
================================================
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Mon compte
        </h1>

        <p className="mt-2 text-muted-foreground">
          Gérez les informations de votre compte.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Vos informations personnelles.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium">Identifiant</p>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compte */}
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
            <CardDescription>
              Informations concernant votre compte.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Statut
                </p>

                <p className="text-sm text-muted-foreground">
                  Compte actif
                </p>
              </div>

              <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                Actif
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Card>
          <CardHeader>
            <CardTitle>Déconnexion</CardTitle>
            <CardDescription>
              Déconnectez-vous de votre compte sur cet appareil.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="destructive">
                Se déconnecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


================================================
FILE: app/(main)/cleaning/[id]/page.tsx
================================================
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
  Clock3Icon,
  Loader2Icon,
  PlayIcon,
  XIcon,
} from "lucide-react";
import { SlideToAction } from "@/components/slide-to-action";

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
   * Incrémentés à chaque tentative échouée (démarrage / validation).
   * Servent de resetKey aux SlideToAction correspondants : en cas
   * d'échec, le slider revient visuellement à son état initial au
   * lieu de rester bloqué sur son état "validé".
   */
  const [startAttempt, setStartAttempt] = useState(0);
  const [completionAttempt, setCompletionAttempt] = useState(0);

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
   *
   * Déclenché par le SlideToAction : en cas d'échec, on incrémente
   * startAttempt pour réinitialiser le slider.
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

        setStartAttempt((attempt) => attempt + 1);
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

      setStartAttempt((attempt) => attempt + 1);
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Validation du ménage.
   *
   * La RPC PostgreSQL vérifie elle-même les 90 minutes.
   * Le navigateur n'est donc PAS la sécurité.
   *
   * Déclenchée par le SlideToAction : si la RPC refuse la
   * validation, on incrémente completionAttempt pour que le
   * slider se réinitialise au lieu de rester affiché comme
   * "validé" à tort.
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

        setCompletionAttempt((attempt) => attempt + 1);
        return;
      }

      if (!data) {
        setError(
          "La validation du ménage a échoué.",
        );

        setCompletionAttempt((attempt) => attempt + 1);
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

      setCompletionAttempt((attempt) => attempt + 1);
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
            {isPending && (
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
                  <XIcon />
                  Annuler
                </Button>
              </div>
            )}

            {isInProgress && (
              <div className="flex w-full flex-col gap-3">
                <SlideToAction
                  text={
                    canComplete
                      ? "Glisser pour valider le ménage"
                      : "Disponible une fois les 1h30 écoulées"
                  }
                  successText="Ménage validé"
                  disabled={!canComplete || actionLoading}
                  resetKey={completionAttempt}
                  onComplete={handleComplete}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <XIcon />
                  Annuler
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </main>
  );
}


================================================
FILE: app/(main)/contact/page.tsx
================================================
import { Card, CardContent } from "@/components/ui/card"
import { MailIcon, ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Contact() {
    return (
        <section className="py-16 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
                    <span className="mb-3 inline-block text-sm font-medium text-primary">
                        Contact
                    </span>

                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                        Parlons de votre projet
                    </h2>

                    <p className="mt-4 text-muted-foreground sm:text-lg">
                        Une question, une idée ou un projet à développer ?
                        N&apos;hésitez pas à me contacter.
                    </p>
                </div>

                {/* Content */}
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-2xl border bg-muted shadow-sm">
                        <Image
                            src="/image-1.webp"
                            alt="Illustration représentant le contact"
                            width={768}
                            height={768}
                            className="aspect-square w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Contact */}
                    <div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Une idée en tête ?
                            </h3>

                            <p className="mt-3 leading-7 text-muted-foreground">
                                Je suis disponible pour échanger autour de vos
                                besoins en développement web, d&apos;une
                                application ou simplement pour discuter d&apos;un
                                projet.
                            </p>
                        </div>

                        <Card className="overflow-hidden border-border/60 shadow-sm">
                            <CardContent className="p-0">
                                <Link
                                    href="mailto:n.jullien57@gmail.com"
                                    className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50 sm:p-6"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <MailIcon className="size-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm text-muted-foreground">
                                                Adresse e-mail
                                            </p>

                                            <p className="truncate font-medium">
                                                n.jullien57@gmail.com
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowUpRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                                </Link>
                            </CardContent>
                        </Card>

                        <p className="mt-4 text-sm text-muted-foreground">
                            Je réponds généralement dans les meilleurs délais.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}


================================================
FILE: app/(main)/planning/page.tsx
================================================
import GenerateResidentNotices from "@/components/generate-resident-notice-pdf"
import { PlanningTabs } from "@/components/planning-tabs"
import FormPlanning from "@/components/planning/form-planning"
import { MonthlyScheduleResponse } from "@/lib/planningService"

import { createClient } from "@/lib/server"

export default async function Test1Page() {
  const supabase =
    await createClient()

  /* ------------------------------------------------------------------------ */
  /* PLANNING                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data: PlanningRow,
    error: planningError,
  } =
    await supabase
      .from("planning")
      .select("*")
      .limit(1)
      .single()

  if (
    planningError ||
    !PlanningRow
  ) {
    console.error(
      "Planning error:",
      planningError,
    )

    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Impossible de récupérer
          le planning.
        </div>
      </main>
    )
  }
  /* ------------------------------------------------------------------------ */
  /* PARSING                                                                   */
  /* ------------------------------------------------------------------------ */

  // `data` doit être un objet avec un tableau `weeks` non vide
  const rawData = PlanningRow.data

  if (
    !rawData ||
    typeof rawData !== "object" ||
    Array.isArray(rawData) ||
    !Array.isArray((rawData as { weeks?: unknown }).weeks)
  ) {
    console.error("Format planning invalide:", rawData)

    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Le format des données du planning est invalide.
        </div>
      </main>
    )
  }

  // On peut maintenant caster sans risque
  const schedule = rawData as unknown as MonthlyScheduleResponse

  const seen = new Set<string>()
  const residentsInPlanning = []

  for (const w of schedule.weeks) {
    for (const d of w.days) {
      for (const t of d.tasks) {
        if (t.type !== "menage" || !t.room) continue
        if (seen.has(t.room)) continue
        seen.add(t.room)
        residentsInPlanning.push({
          id: t.room,
          nom: t.resident ?? "—",
          room: t.room,
        })
      }
    }
  }

  residentsInPlanning.sort((a, b) => a.nom.localeCompare(b.nom))
  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="mx-auto w-full max-w-400 space-y-10 p-6 lg:p-8">
      <header className="border-b pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Plannings ménage
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {schedule.title}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <FormPlanning />
            <GenerateResidentNotices
              schedule={schedule}
            />
          </div>
        </div>
      </header>

      <PlanningTabs
        schedule={schedule}
        planningId={PlanningRow.id}
        year={PlanningRow.year}
        month={PlanningRow.month}
      />
    </main>
  )
}


================================================
FILE: app/(main)/test/page.tsx
================================================
import { Resident } from "@/lib/planning/types";
import SupabaseCrud from "@/lib/supabase-crud"

export default async function TestPage() {
    const residentService = new SupabaseCrud<Resident>("residents")

    const residents = await residentService.getWithFilters({
        sort: [{column: 'room', ascending: true}]
    });

    return <div className="mx-auto min-w-7xl p-4">
        <pre>
            {JSON.stringify(residents, null, ' ')}
        </pre>
    </div>
}


================================================
FILE: app/api/generate-planning/route.ts
================================================
import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// ============================================
// Types
// ============================================

type Day =
  | "Lundi"
  | "Mardi"
  | "Mercredi"
  | "Jeudi"
  | "Vendredi"

type TimeSlot =
  | "7h45"
  | "8h00"
  | "8h30"
  | "10h00"
  | "11h30"
  | "12h00"
  | "13h30"
  | "14h00"
  | "15h00"
  | "15h30"
  | "16h00"

type Agent =
  | "Christelle"
  | "Manon"
  | "Lana"

interface ResidentConstraint {
  resident_id: string
  allowed_days?: Day[]
  disallow_days?: Day[]
  schedule_hours?: TimeSlot[]
  per_month: number
}

interface PlanningDay {
  [time: string]: string
}

interface PlanningWeek {
  [day: number]: PlanningDay
}

interface MonthlyPlanning {
  title: string
  agent: Agent
  weeks: PlanningWeek[]
}

interface ResidentAssignmentStats {
  target: number
  assignments: number
  lastAssignmentOrder: number
}

interface PlanningSlot {
  agent: Agent
  weekNumber: number
  dayNumber: number
  day: Day
  timeSlot: TimeSlot
}

interface Assignment {
  residentId: string
  slot: PlanningSlot
}

// ============================================
// Configuration
// ============================================

const LANA_ACTIVE_WEEKS: number[] = [1, 2]

const DAYS: Day[] = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
]

const AGENTS: Agent[] = [
  "Christelle",
  "Manon",
  "Lana",
]

// ============================================
// Templates des agents
// ============================================

const AGENT_TEMPLATES: Record<
  Agent,
  Record<Day, Partial<Record<TimeSlot, string>>>
> = {
  Christelle: {
    Lundi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Ménage",
      "13h30": "Ménage",
      "15h00": "Parties communes",
      "16h00": "Fin",
    },

    Mardi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Ménage",
      "13h30": "Ménage",
      "15h00": "Parties communes",
      "16h00": "Fin",
    },

    Mercredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Fin",
    },

    Jeudi: {
      "7h45": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Ménage",
      "13h30": "Ménage",
      "15h00": "Parties communes",
      "16h00": "Fin",
    },

    Vendredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Lessives",
      "12h00": "Fin",
    },
  },

  Manon: {
    Lundi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Mardi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Mercredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Jeudi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Vendredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
  },

  Lana: {
    Lundi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Mardi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Mercredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Jeudi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },

    Vendredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
  },
}

// ============================================
// Parsing des contraintes
// ============================================

function parseJsonArray<T>(value: string): T[] | undefined {
  if (!value) {
    return undefined
  }

  try {
    const cleanedValue = value.replace(/\\"/g, '"')
    const parsed = JSON.parse(cleanedValue)

    return Array.isArray(parsed)
      ? (parsed as T[])
      : undefined
  } catch (error) {
    console.error(
      `[Planning] Erreur parsing JSON "${value}" :`,
      error,
    )

    return undefined
  }
}

function parseDaysOrHours<T>(
  value: unknown,
): T[] | undefined {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value as T[]
  }

  if (typeof value === "string") {
    const trimmed = value.trim()

    if (!trimmed) {
      return undefined
    }

    if (
      trimmed.startsWith("[") &&
      trimmed.endsWith("]")
    ) {
      return parseJsonArray<T>(trimmed)
    }

    return [trimmed as T]
  }

  return undefined
}

// ============================================
// Supabase — contraintes
// ============================================

async function fetchResidentConstraints(): Promise<
  ResidentConstraint[]
> {
  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("constraintes")
    .select(
      "resident_id, allowed_days, disallow_days, schedule_hours, per_month",
    )

  if (error) {
    throw new Error(
      `Erreur lors de la récupération des contraintes : ${error.message}`,
    )
  }

  return (data ?? [])
    .filter(
      (row) =>
        typeof row.resident_id === "string" &&
        row.resident_id.length > 0,
    )
    .map((row) => ({
      resident_id: row.resident_id,

      allowed_days:
        parseDaysOrHours<Day>(
          row.allowed_days,
        ),

      disallow_days:
        parseDaysOrHours<Day>(
          row.disallow_days,
        ),

      schedule_hours:
        parseDaysOrHours<TimeSlot>(
          row.schedule_hours,
        ),

      per_month: Math.max(
        0,
        Number(row.per_month ?? 0),
      ),
    }))
}

// ============================================
// Supabase — tous les résidents
// ============================================

async function fetchAllResidents(): Promise<string[]> {
  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("residents")
    .select("id")

  if (error) {
    throw new Error(
      `Erreur lors de la récupération des résidents : ${error.message}`,
    )
  }

  return [
    ...new Set(
      (data ?? [])
        .map((row) => row.id)
        .filter(
          (
            id,
          ): id is string =>
            typeof id === "string" &&
            id.length > 0,
        ),
    ),
  ]
}

// ============================================
// Mois
// ============================================

function getMonthIndex(mois: string): number {
  const months: Record<string, number> = {
    janvier: 0,
    février: 1,
    fevrier: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    août: 7,
    aout: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    décembre: 11,
    decembre: 11,
  }

  const normalized = mois
    .trim()
    .toLowerCase()

  const index = months[normalized]

  if (index === undefined) {
    throw new Error(
      `Mois invalide : "${mois}"`,
    )
  }

  return index
}

function getWeeksInMonth(
  mois: string,
  année: number,
): number[] {
  const monthIndex = getMonthIndex(mois)

  const firstDay = new Date(
    année,
    monthIndex,
    1,
  )

  const lastDay = new Date(
    année,
    monthIndex + 1,
    0,
  )

  const firstDayOffset =
    (firstDay.getDay() + 6) % 7

  const lastDayNumber =
    lastDay.getDate()

  const numberOfWeeks = Math.ceil(
    (firstDayOffset + lastDayNumber) / 7,
  )

  return Array.from(
    {
      length: numberOfWeeks,
    },
    (_, index) => index + 1,
  )
}

// ============================================
// Contraintes
// ============================================

function isResidentAvailable(
  constraint:
    | ResidentConstraint
    | undefined,
  day: Day,
  timeSlot: TimeSlot,
): boolean {
  if (!constraint) {
    return true
  }

  if (
    constraint.disallow_days?.includes(day)
  ) {
    return false
  }

  if (
    constraint.allowed_days &&
    constraint.allowed_days.length > 0 &&
    !constraint.allowed_days.includes(day)
  ) {
    return false
  }

  if (
    constraint.schedule_hours &&
    constraint.schedule_hours.length > 0 &&
    !constraint.schedule_hours.includes(
      timeSlot,
    )
  ) {
    return false
  }

  return true
}

// ============================================
// Statistiques
// ============================================

function createAssignmentStats(
  allResidents: string[],
  constraintsByResident: Map<
    string,
    ResidentConstraint
  >,
): Map<
  string,
  ResidentAssignmentStats
> {
  const stats = new Map<
    string,
    ResidentAssignmentStats
  >()

  for (const residentId of allResidents) {
    const constraint =
      constraintsByResident.get(
        residentId,
      )

    /*
     * Si une contrainte existe :
     * on respecte strictement per_month.
     *
     * Si aucune contrainte n'existe :
     * 1 ménage par mois par défaut.
     */
    const target =
      constraint?.per_month ?? 1

    stats.set(residentId, {
      target: Math.max(0, target),
      assignments: 0,
      lastAssignmentOrder: -1,
    })
  }

  return stats
}

// ============================================
// Score d'un résident
// ============================================

function getResidentCompatibleSlotCount(
  residentId: string,
  slots: PlanningSlot[],
  constraintsByResident: Map<
    string,
    ResidentConstraint
  >,
  usedDates: Set<string>,
): number {
  const constraint =
    constraintsByResident.get(
      residentId,
    )

  let count = 0

  for (const slot of slots) {
    const dateKey =
      `${slot.weekNumber}-${slot.dayNumber}`

    if (usedDates.has(dateKey)) {
      continue
    }

    if (
      !isResidentAvailable(
        constraint,
        slot.day,
        slot.timeSlot,
      )
    ) {
      continue
    }

    count++
  }

  return count
}

// ============================================
// Génération des créneaux
// ============================================

function generatePlanningSlots(
  weeksInMonth: number[],
): PlanningSlot[] {
  const slots: PlanningSlot[] = []

  for (const weekNumber of weeksInMonth) {
    const lanaActive =
      LANA_ACTIVE_WEEKS.includes(
        weekNumber,
      )

    for (
      let dayIndex = 0;
      dayIndex < DAYS.length;
      dayIndex++
    ) {
      const day = DAYS[dayIndex]
      const dayNumber = dayIndex + 1

      for (const agent of AGENTS) {
        if (
          agent === "Lana" &&
          !lanaActive
        ) {
          continue
        }

        const template =
          AGENT_TEMPLATES[agent][day]

        for (const [
          timeSlot,
          task,
        ] of Object.entries(template)) {
          if (task !== "Ménage") {
            continue
          }

          slots.push({
            agent,
            weekNumber,
            dayNumber,
            day,
            timeSlot:
              timeSlot as TimeSlot,
          })
        }
      }
    }
  }

  return slots
}

// ============================================
// Création des plannings vides
// ============================================

function createEmptyPlannings(
  mois: string,
  année: number,
  weeksInMonth: number[],
): MonthlyPlanning[] {
  return AGENTS.map((agent) => ({
    title: `Planning ménage - ${mois} ${année}`,
    agent,
    weeks: weeksInMonth
      .filter(
        (weekNumber) =>
          agent !== "Lana" ||
          LANA_ACTIVE_WEEKS.includes(
            weekNumber,
          ),
      )
      .map(() => ({})),
  }))
}

// ============================================
// Construction du planning
// ============================================

function initializePlanningTemplates(
  plannings: MonthlyPlanning[],
  weeksInMonth: number[],
): void {
  for (const planning of plannings) {
    const isLana =
      planning.agent === "Lana"

    const activeWeeks =
      isLana
        ? weeksInMonth.filter((week) =>
            LANA_ACTIVE_WEEKS.includes(
              week,
            ),
          )
        : weeksInMonth

    planning.weeks =
      activeWeeks.map(
        (weekNumber) => {
          const weekPlanning: PlanningWeek =
            {}

          let hallNumber = 1

          for (
            let dayIndex = 0;
            dayIndex < DAYS.length;
            dayIndex++
          ) {
            const day = DAYS[dayIndex]

            const template =
              AGENT_TEMPLATES[
                planning.agent
              ][day]

            const dayPlanning: PlanningDay =
              {}

            for (const [
              timeSlot,
              task,
            ] of Object.entries(
              template,
            )) {
              if (
                timeSlot === "8h00" ||
                timeSlot === "7h45"
              ) {
                dayPlanning[timeSlot] =
                  `Hall ${hallNumber}`

                hallNumber =
                  hallNumber === 1
                    ? 2
                    : 1

                continue
              }

              dayPlanning[timeSlot] =
                task
            }

            weekPlanning[
              dayIndex + 1
            ] = dayPlanning
          }

          return weekPlanning
        },
      )
  }
}

// ============================================
// Affectation d'un résident
// ============================================

function assignResidentToSlot(
  residentId: string,
  slot: PlanningSlot,
  plannings: MonthlyPlanning[],
  assignmentStats: Map<
    string,
    ResidentAssignmentStats
  >,
  assignmentOrder: number,
): void {
  const planning = plannings.find(
    (item) =>
      item.agent === slot.agent,
  )

  if (!planning) {
    return
  }

  const weekIndex =
    planning.agent === "Lana"
      ? LANA_ACTIVE_WEEKS.indexOf(
          slot.weekNumber,
        )
      : slot.weekNumber - 1

  if (weekIndex < 0) {
    return
  }

  const week =
    planning.weeks[weekIndex]

  if (!week) {
    return
  }

  const day =
    week[slot.dayNumber]

  if (!day) {
    return
  }

  day[slot.timeSlot] =
    residentId

  const stats =
    assignmentStats.get(
      residentId,
    )

  if (stats) {
    stats.assignments++
    stats.lastAssignmentOrder =
      assignmentOrder
  }
}

// ============================================
// Génération globale
// ============================================

function generateAssignments(
  allResidents: string[],
  constraintsByResident: Map<
    string,
    ResidentConstraint
  >,
  assignmentStats: Map<
    string,
    ResidentAssignmentStats
  >,
  slots: PlanningSlot[],
  plannings: MonthlyPlanning[],
): Assignment[] {
  const assignments: Assignment[] = []

  /*
   * Un résident ne peut être affecté
   * qu'une seule fois à une date donnée.
   *
   * Exemple :
   *
   * 2026-10-12
   *
   * Christelle → résident A
   * Manon      → résident B
   * Lana       → résident C
   *
   * mais jamais :
   *
   * Christelle → résident A
   * Manon      → résident A
   */
  const usedDatesByResident =
    new Map<string, Set<string>>()

  for (const residentId of allResidents) {
    usedDatesByResident.set(
      residentId,
      new Set(),
    )
  }

  /*
   * On mélange légèrement les créneaux
   * pour éviter de toujours favoriser
   * le même agent.
   *
   * Le tri reste ensuite déterministe.
   */
  const shuffledSlots = [
    ...slots,
  ].sort(() => Math.random() - 0.5)

  /*
   * On répète plusieurs passes.
   *
   * À chaque passe, les résidents ayant
   * encore beaucoup de retard sont prioritaires.
   */
  let assignmentOrder = 0

  const maxPasses = Math.max(
    ...allResidents.map(
      (residentId) =>
        assignmentStats.get(
          residentId,
        )?.target ?? 0,
    ),
    0,
  )

  for (
    let pass = 0;
    pass < maxPasses;
    pass++
  ) {
    /*
     * Résidents encore sous leur objectif.
     */
    const residentsToAssign =
      allResidents
        .filter((residentId) => {
          const stats =
            assignmentStats.get(
              residentId,
            )

          return (
            stats &&
            stats.target > 0 &&
            stats.assignments <
              stats.target
          )
        })
        .sort((a, b) => {
          const statsA =
            assignmentStats.get(a)!

          const statsB =
            assignmentStats.get(b)!

          /*
           * 1. Priorité au plus gros retard
           */
          const remainingA =
            statsA.target -
            statsA.assignments

          const remainingB =
            statsB.target -
            statsB.assignments

          if (
            remainingA !==
            remainingB
          ) {
            return (
              remainingB -
              remainingA
            )
          }

          /*
           * 2. Les résidents les plus
           * contraints passent avant.
           */
          const availableA =
            getResidentCompatibleSlotCount(
              a,
              shuffledSlots,
              constraintsByResident,
              usedDatesByResident.get(
                a,
              )!,
            )

          const availableB =
            getResidentCompatibleSlotCount(
              b,
              shuffledSlots,
              constraintsByResident,
              usedDatesByResident.get(
                b,
              )!,
            )

          if (
            availableA !==
            availableB
          ) {
            return (
              availableA -
              availableB
            )
          }

          /*
           * 3. Rotation.
           */
          const lastA =
            assignmentStats.get(
              a,
            )!.lastAssignmentOrder

          const lastB =
            assignmentStats.get(
              b,
            )!.lastAssignmentOrder

          return lastA - lastB
        })

    let assignedSomething = false

    for (const residentId of residentsToAssign) {
      const stats =
        assignmentStats.get(
          residentId,
        )

      if (!stats) {
        continue
      }

      if (
        stats.assignments >=
        stats.target
      ) {
        continue
      }

      const usedDates =
        usedDatesByResident.get(
          residentId,
        )!

      const constraint =
        constraintsByResident.get(
          residentId,
        )

      /*
       * On cherche les créneaux
       * compatibles avec ce résident.
       */
      const compatibleSlots =
        shuffledSlots.filter(
          (slot) => {
            const dateKey =
              `${slot.weekNumber}-${slot.dayNumber}`

            /*
             * Une seule fois par jour.
             */
            if (
              usedDates.has(
                dateKey,
              )
            ) {
              return false
            }

            /*
             * Contraintes.
             */
            if (
              !isResidentAvailable(
                constraint,
                slot.day,
                slot.timeSlot,
              )
            ) {
              return false
            }

            /*
             * Le créneau doit encore
             * être libre.
             */
            const planning =
              plannings.find(
                (item) =>
                  item.agent ===
                  slot.agent,
              )

            if (!planning) {
              return false
            }

            const weekIndex =
              planning.agent === "Lana"
                ? LANA_ACTIVE_WEEKS.indexOf(
                    slot.weekNumber,
                  )
                : slot.weekNumber - 1

            const week =
              planning.weeks[
                weekIndex
              ]

            if (!week) {
              return false
            }

            const day =
              week[
                slot.dayNumber
              ]

            if (!day) {
              return false
            }

            return (
              day[
                slot.timeSlot
              ] === "Ménage"
            )
          },
        )

      if (
        compatibleSlots.length ===
        0
      ) {
        continue
      }

      /*
       * On choisit le meilleur créneau.
       *
       * Priorité :
       *
       * 1. agent le moins chargé
       * 2. date la plus éloignée
       * 3. rotation
       */
      const agentLoad = new Map<
        Agent,
        number
      >()

      for (const agent of AGENTS) {
        agentLoad.set(agent, 0)
      }

      for (const assignment of assignments) {
        agentLoad.set(
          assignment.slot.agent,
          (agentLoad.get(
            assignment.slot.agent,
          ) ?? 0) + 1,
        )
      }

      compatibleSlots.sort(
        (a, b) => {
          const loadA =
            agentLoad.get(
              a.agent,
            ) ?? 0

          const loadB =
            agentLoad.get(
              b.agent,
            ) ?? 0

          if (loadA !== loadB) {
            return loadA - loadB
          }

          /*
           * Préférence pour les semaines
           * différentes entre deux passages.
           */
          if (
            a.weekNumber !==
            b.weekNumber
          ) {
            return (
              a.weekNumber -
              b.weekNumber
            )
          }

          return (
            a.dayNumber -
            b.dayNumber
          )
        },
      )

      const selectedSlot =
        compatibleSlots[0]

      if (!selectedSlot) {
        continue
      }

      const dateKey =
        `${selectedSlot.weekNumber}-${selectedSlot.dayNumber}`

      assignResidentToSlot(
        residentId,
        selectedSlot,
        plannings,
        assignmentStats,
        assignmentOrder++,
      )

      usedDates.add(dateKey)

      assignments.push({
        residentId,
        slot: selectedSlot,
      })

      assignedSomething = true
    }

    /*
     * Si aucune affectation n'a été possible
     * pendant cette passe, inutile de continuer.
     */
    if (!assignedSomething) {
      break
    }
  }

  return assignments
}

// ============================================
// Statistiques finales
// ============================================

function logAssignmentStatistics(
  allResidents: string[],
  assignmentStats: Map<
    string,
    ResidentAssignmentStats
  >,
  slots: PlanningSlot[],
  assignments: Assignment[],
): void {
  let residentsReachedTarget = 0
  let residentsNotReachedTarget = 0
  let totalTarget = 0
  let totalAssignments = 0

  for (const residentId of allResidents) {
    const stats =
      assignmentStats.get(
        residentId,
      )

    if (!stats) {
      continue
    }

    totalTarget += stats.target
    totalAssignments +=
      stats.assignments

    if (
      stats.assignments >=
      stats.target
    ) {
      residentsReachedTarget++
    } else {
      residentsNotReachedTarget++
    }

    if (
      stats.assignments <
      stats.target
    ) {
      console.warn(
        `[Planning] SOUS OBJECTIF ${residentId} : ${stats.assignments}/${stats.target}`,
      )
    }
  }

  console.log(
    "============================================",
  )

  console.log(
    `[Planning] Résidents : ${allResidents.length}`,
  )

  console.log(
    `[Planning] Objectif total : ${totalTarget}`,
  )

  console.log(
    `[Planning] Créneaux disponibles : ${slots.length}`,
  )

  console.log(
    `[Planning] Affectations réalisées : ${totalAssignments}`,
  )

  console.log(
    `[Planning] Résidents atteignant leur objectif : ${residentsReachedTarget}/${allResidents.length}`,
  )

  console.log(
    `[Planning] Résidents sous objectif : ${residentsNotReachedTarget}`,
  )

  console.log(
    `[Planning] Créneaux encore libres : ${
      slots.length -
      assignments.length
    }`,
  )

  console.log(
    "============================================",
  )
}

// ============================================
// Génération mensuelle
// ============================================

async function generateMonthlyPlannings(
  mois: string,
  année: number,
): Promise<MonthlyPlanning[]> {
  const [
    constraints,
    allResidents,
  ] = await Promise.all([
    fetchResidentConstraints(),
    fetchAllResidents(),
  ])

  // ==========================================
  // Vérification
  // ==========================================

  if (
    allResidents.length ===
    0
  ) {
    throw new Error(
      "Aucun résident trouvé dans la table residents.",
    )
  }

  console.log(
    `[Planning] ${allResidents.length} résidents trouvés.`,
  )

  // ==========================================
  // Index des contraintes
  // ==========================================

  const constraintsByResident =
    new Map<
      string,
      ResidentConstraint
    >()

  for (const constraint of constraints) {
    /*
     * Si plusieurs lignes existent pour
     * le même résident, la dernière est
     * utilisée.
     */
    constraintsByResident.set(
      constraint.resident_id,
      constraint,
    )
  }

  const constrainedResidentIds =
    new Set(
      constraints.map(
        (constraint) =>
          constraint.resident_id,
      ),
    )

  const unconstrainedResidents =
    allResidents.filter(
      (residentId) =>
        !constrainedResidentIds.has(
          residentId,
        ),
    )

  console.log(
    `[Planning] ${constraintsByResident.size} résidents avec contraintes.`,
  )

  console.log(
    `[Planning] ${unconstrainedResidents.length} résidents sans contraintes.`,
  )

  // ==========================================
  // Semaines
  // ==========================================

  const weeksInMonth =
    getWeeksInMonth(
      mois,
      année,
    )

  console.log(
    `[Planning] Semaines générées : ${weeksInMonth.join(", ")}`,
  )

  // ==========================================
  // Statistiques
  // ==========================================

  const assignmentStats =
    createAssignmentStats(
      allResidents,
      constraintsByResident,
    )

  // ==========================================
  // Plannings
  // ==========================================

  const plannings =
    createEmptyPlannings(
      mois,
      année,
      weeksInMonth,
    )

  initializePlanningTemplates(
    plannings,
    weeksInMonth,
  )

  // ==========================================
  // Créneaux
  // ==========================================

  const slots =
    generatePlanningSlots(
      weeksInMonth,
    )

  console.log(
    `[Planning] ${slots.length} créneaux ménage disponibles.`,
  )

  // ==========================================
  // Affectation globale
  // ==========================================

  const assignments =
    generateAssignments(
      allResidents,
      constraintsByResident,
      assignmentStats,
      slots,
      plannings,
    )

  // ==========================================
  // Statistiques
  // ==========================================

  logAssignmentStatistics(
    allResidents,
    assignmentStats,
    slots,
    assignments,
  )

  // ==========================================
  // Résidents jamais affectés
  // ==========================================

  const neverAssigned =
    allResidents.filter(
      (residentId) => {
        const stats =
          assignmentStats.get(
            residentId,
          )

        return (
          stats &&
          stats.assignments === 0 &&
          stats.target > 0
        )
      },
    )

  if (
    neverAssigned.length > 0
  ) {
    console.warn(
      `[Planning] ${neverAssigned.length} résident(s) n'ont reçu aucune affectation :`,
      neverAssigned,
    )
  }

  return plannings
}

// ============================================
// Endpoint GET
// ============================================

export async function GET(
  request: Request,
) {
  const {
    searchParams,
  } = new URL(
    request.url,
  )

  const mois =
    searchParams.get("mois") ||
    "Septembre"

  const année = parseInt(
    searchParams.get(
      "année",
    ) || "2026",
    10,
  )

  if (
    Number.isNaN(année)
  ) {
    return NextResponse.json(
      {
        error:
          "L'année fournie est invalide.",
      },
      {
        status: 400,
      },
    )
  }

  try {
    const plannings =
      await generateMonthlyPlannings(
        mois,
        année,
      )

    return NextResponse.json(
      plannings,
    )
  } catch (error) {
    console.error(
      "Erreur détaillée :",
      error,
    )

    return NextResponse.json(
      {
        error:
          `Erreur lors de la génération du planning : ${
            error instanceof Error
              ? error.message
              : String(error)
          }`,
      },
      {
        status: 500,
      },
    )
  }
}


================================================
FILE: app/api/pdf/route.ts
================================================
// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/server";
import { filterScheduleByAgent } from "@/lib/planningService";
import { CleaningPlanningPdf } from "@/components/pdf/cleaning-planning-pdf";
import type { MonthlyScheduleResponse } from "@/lib/planningService";

export async function POST(req: NextRequest) {
  try {
    const { planningId, agent } = await req.json();

    if (typeof planningId !== "number") {
      return NextResponse.json(
        { error: "planningId requis (number)." },
        { status: 400 },
      );
    }

    // 1. Récupérer le planning
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("planning")
      .select("id, year, month, data")
      .eq("id", planningId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Planning introuvable." },
        { status: 404 },
      );
    }

    const fullSchedule = data.data as MonthlyScheduleResponse;

    // 2. Filtrer si un agent est précisé
    const schedule = agent
      ? filterScheduleByAgent(fullSchedule, agent)
      : fullSchedule;

    // 3. Vérifier qu'il y a du contenu
    if (schedule.weeks.length === 0) {
      return NextResponse.json(
        { error: `Aucun ménage trouvé pour ${agent ?? "ce planning"}.` },
        { status: 404 },
      );
    }

    // 4. Générer le PDF
    const buffer = await renderToBuffer(
      CleaningPlanningPdf({ schedule }) as any,
    );

    // 5. Nom du fichier
    const mm = String(data.month).padStart(2, "0");
    const filename = agent
      ? `planning-menage-${data.year}-${mm}-${agent
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")}.pdf`
      : `planning-menage-${data.year}-${mm}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/pdf] Erreur :", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération du PDF." },
      { status: 500 },
    );
  }
}


================================================
FILE: app/api/pdf/resident-notice/route.ts
================================================
import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import ResidentNoticePdf, {
  type ResidentNotice,
} from "@/components/pdf/resident-notice-pdf";
import { createClient } from "@/lib/server";

export const runtime = "nodejs";

// Validation schema for ResidentNotice
const residentNoticeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  apartment: z.string().min(1, "Apartment is required").max(20, "Apartment too long"),
  building: z.string().min(1, "Building is required").max(20, "Building too long"),
  day: z.string().min(1, "Day is required").max(50, "Day too long"),
  time: z.string().min(1, "Time is required").max(20, "Time too long"),
});

// Validation schema for request body
const requestBodySchema = z.object({
  notices: z.array(residentNoticeSchema).min(1, "At least one notice is required"),
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    
    if (error || !data?.claims) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = requestBodySchema.parse(body);
    
    // Type assertion for our validated data
    const notices = validatedData.notices as ResidentNotice[];

    const document = createElement(ResidentNoticePdf, {
      notices: notices,
    }) as unknown as ReactElement<DocumentProps>;

    const pdf = await renderToBuffer(document);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="avis-menage.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}


================================================
FILE: app/auth/confirm/route.ts
================================================
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const _next = searchParams.get('next')
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`)
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`)
}



================================================
FILE: app/auth/error/page.tsx
================================================
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-muted-foreground">Code error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



================================================
FILE: app/auth/forgot-password/page.tsx
================================================
import { ForgotPasswordForm } from '@/components/forgot-password-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}



================================================
FILE: app/auth/login/page.tsx
================================================
import { LoginForm } from '@/components/login-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}



================================================
FILE: app/auth/sign-up/page.tsx
================================================
import { SignUpForm } from '@/components/sign-up-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}



================================================
FILE: app/auth/sign-up-success/page.tsx
================================================
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to confirm your account
                before signing in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



================================================
FILE: app/auth/update-password/page.tsx
================================================
import { UpdatePasswordForm } from '@/components/update-password-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}



================================================
FILE: app/pdf/page.tsx
================================================
import MenageChecklist from "@/components/pdf/menage-checklist-pdf";
import PDFPreviewClient from "@/components/pdf/PDFPreviewClient";
import { createClient } from "@/lib/server";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: residents,
    error,
  } = await supabase
    .from("residents")
    .select("*")
    .order("room", {
      ascending: true,
    });

  if (error) {
    return (
      <main className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Impossible de récupérer les résidents.
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full">
      <PDFPreviewClient>
        <MenageChecklist residents={residents ?? []} />
      </PDFPreviewClient>
    </main>
  );
}


================================================
FILE: app/restaurant/page.tsx
================================================
import Pos from "@/components/pos/pos";

export default function RestaurantPage() {
    return <Pos />
}


================================================
FILE: app/unauthorized/page.tsx
================================================
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


================================================
FILE: components/app-sidebar.tsx
================================================
"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FeatherIcon, UserIcon, BrushCleaningIcon, UtensilsIcon } from "lucide-react"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/default.png",
  },
  navMain: [
    {
      title: "Résidents",
      url: "/admin/residents",
      icon: (
        <UserIcon />
      ),
    },
    {
      title: "Agent d'entretien",
      url: "/admin/agents",
      icon: (
        <BrushCleaningIcon />
      ),
    },
    {
      title: 'Restaurant',
      url: "/admin/restaurant",
      icon: (
        <UtensilsIcon />
      )
    }
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <FeatherIcon className="size-5!" />
              <span className="text-base font-semibold">Aramons Les Palatines</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}



================================================
FILE: components/data-list.tsx
================================================
import React from "react";
import { Separator } from "@/components/ui/separator";

type Props = {
    data: {
        title: string;
        value: string | React.ReactNode | null;
    }[];
};

export default function DataList({ data }: Props) {
    return (
        <div className="space-y-3">
            {data.map((d, index) => (
                <React.Fragment key={index}>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {d.title}
                        </p>

                        <p>{d.value}</p>
                    </div>

                    {index < data.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );
}



================================================
FILE: components/data-table.tsx
================================================
"use client"

import {
  type ColumnDef,
  type RowData,
  useTable,
} from "@tanstack/react-table"
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"

import {
  features,
  type DataTableFeatures,
} from "@/components/data-table/data-table-features"
import { Input } from "./ui/input"
import { useState } from "react"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
}

export function DataTable<TData extends RowData>({
  columns = [],
  data = [],
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    columns,
    data,

    globalFilterFn: "includesString",
  })

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={table.state.globalFilter ?? ''}
            onChange={(value) => table.setGlobalFilter(String(value))}
            placeholder="Search all columns..."
            className="pl-8"
          />
        </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()

                  const SortIcon =
                    sorted === "asc"
                      ? ArrowUp
                      : sorted === "desc"
                        ? ArrowDown
                        : ArrowUpDown

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <table.FlexRender header={header} />

                              <SortIcon className="ml-2 size-4" />
                            </Button>
                          ) : (
                            <span className="text-sm font-medium">
                              <table.FlexRender header={header} />
                            </span>
                          )}
                        </>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() ? "selected" : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 px-2 py-4">
        {/* Rows count */}
        <div className="text-sm text-muted-foreground">
          {table
            .getPrePaginatedRowModel()
            .rows.length.toLocaleString()}{" "}
          sur {data.length.toLocaleString()} lignes
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              Lignes par page
            </p>

            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-17.5"
              >
                <SelectValue
                  placeholder={`${table.state.pagination.pageSize}`}
                />
              </SelectTrigger>

              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                  >
                    {pageSize}
                  </SelectItem>
                ))}

                <SelectItem value="Infinity">
                  Toutes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current page */}
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Page {table.state.pagination.pageIndex + 1} sur{" "}
            {Math.max(1, table.getPageCount())}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* First */}
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                Première page
              </span>

              <ChevronsLeftIcon />
            </Button>

            {/* Previous */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                Page précédente
              </span>

              <ChevronLeftIcon />
            </Button>

            {/* Next */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                Page suivante
              </span>

              <ChevronRightIcon />
            </Button>

            {/* Last */}
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                Dernière page
              </span>

              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof Input>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  // ⚠️ Correctif : on ne synchronise plus `value` avec `initialValue` via
  // useEffect (ça déclenche un rendu "en trop" après le commit — d'où
  // l'avertissement React sur les cascading renders). À la place, on
  // ajuste le state pendant le rendu lui-même : si `initialValue` a changé
  // depuis le dernier rendu, on remet `value` à jour tout de suite, avant
  // que le DOM ne soit peint. C'est le pattern recommandé par React pour
  // "réinitialiser un state quand une prop change".
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue)
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue)
    setValue(initialValue)
  }

  const debouncedOnChange = useDebouncedCallback(onChange, { wait: debounce })

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedOnChange(e.target.value)
      }}
    />
  )
}


================================================
FILE: components/dialog-planning.tsx
================================================
[Empty file]


================================================
FILE: components/forgot-password-form.tsx
================================================
'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Regarder vos emails</CardTitle>
            <CardDescription>Les instructions vous ont été envoyés</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Si vous vous êtes inscrit avec votre adresse e-mail et votre mot de passe, vous recevrez un e-mail vous permettant de réinitialiser votre mot de passe
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Réinitialiser votre mot de passe</CardTitle>
            <CardDescription>
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Envoi en cours...' : 'Envoyer un e-mail de réinitialisation'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Vous avez déjà un compte?{' '}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Se connecter
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



================================================
FILE: components/generate-planning-pdf.tsx
================================================
[Binary file]


================================================
FILE: components/generate-resident-notice-pdf.tsx
================================================
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import type { MonthlyScheduleResponse } from "@/lib/planningService"

export interface ResidentNoticePayload {
  name: string
  apartment: string
  building: string
  day: string
  time: string
}

export interface GenerateResidentNoticesProps {
  schedule: MonthlyScheduleResponse
  disabled?: boolean
}

/**
 * Construit la liste des notices à partir du planning.
 * Une notice par tâche "menage".
 */
function buildNotices(schedule: MonthlyScheduleResponse): ResidentNoticePayload[] {
  const notices: ResidentNoticePayload[] = []

  for (const week of schedule.weeks) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        if (task.type !== "menage") continue
        if (!task.resident || !task.room) continue

        notices.push({
          name: task.resident,
          apartment: task.room,
          building: task.building ?? "1",
          day: day.date,        // ex: "Lundi 5 octobre"
          time: task.time,      // ex: "10h00"
        })
      }
    }
  }

  return notices
}

export default function GenerateResidentNotices({
  schedule,
  disabled = false,
}: GenerateResidentNoticesProps) {
  const [loading, setLoading] = React.useState(false)

  const noticesCount = React.useMemo(() => {
    return buildNotices(schedule).length
  }, [schedule])

  async function handleGenerate() {
    if (loading) return

    try {
      setLoading(true)

      const notices = buildNotices(schedule)

      if (notices.length === 0) {
        window.alert("Aucune fiche à générer pour ce planning.")
        return
      }

      const res = await fetch("/api/pdf/resident-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notices }),
      })

      if (!res.ok) {
        let message = "Impossible de générer les fiches."
        try {
          const d = await res.json()
          if (typeof d?.error === "string") message = d.error
        } catch {}
        throw new Error(message)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `fiches-menage-${schedule.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.pdf`

      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      window.alert(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGenerate}
      disabled={disabled || loading || noticesCount === 0}
    >
      <FileText className="mr-2 h-4 w-4" />
      {loading
        ? "Génération…"
        : `Fiches résidents (${noticesCount})`}
    </Button>
  )
}


================================================
FILE: components/login-form.tsx
================================================
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { safeNextPath } from '@/lib/safe-next-path'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(safeNextPath(next, '/'))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Se connecter</CardTitle>
          <CardDescription>Entrer votre email pour vous connecter à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous n&apos;avez pas de compte?{' '}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                S&apos;inscrire
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



================================================
FILE: components/logo.tsx
================================================
import Image from "next/image";

export const Logo = () => (
  <Image src={'/logo.png'} alt="Logo" width={128} height={128} loading="eager"/>
);



================================================
FILE: components/logout-button.tsx
================================================
'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return <Button onClick={logout}>Déconnexion</Button>
}



================================================
FILE: components/nav-main.tsx
================================================
"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} render={<Link href={item.url}/>}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}



================================================
FILE: components/nav-menu.tsx
================================================
"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
  <NavigationMenu {...props} orientation={props.orientation}>
    <NavigationMenuList className="data-[orientation=vertical]:-ms-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} render={<Link href="/" />}>Accueil</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} render={<Link href="/planning" />}>Planning</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} render={<Link href="/admin/residents" />}>Administration</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} render={<Link href="/contact" />}>Me contacter</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);



================================================
FILE: components/nav-user.tsx
================================================
"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUserRoundIcon
                />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon
                />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon
                />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon
              />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}



================================================
FILE: components/navbar.tsx
================================================
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { createClient } from "@/lib/server";
import Link from "next/link";

const Navbar = async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  return (
    <nav className="h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Logo />

          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button variant="outline" className="hidden sm:inline-flex" render={<Link href={'/account'} />}>
              Mon compte
            </Button>
          ) : (
            <Button variant="outline" className="hidden sm:inline-flex" render={<Link href={'/auth/login'} />}>
              Se connecter
            </Button>
          )}

          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


================================================
FILE: components/navigation-sheet.tsx
================================================
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Menu de navigation</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger render={<Button size="icon" variant="outline" />}><Menu /></SheetTrigger>
      <SheetContent className="px-6 py-3">
        <Logo />
        <NavMenu className="mt-6 [&>div]:h-full" orientation="vertical" />
      </SheetContent>
    </Sheet>
  );
};



================================================
FILE: components/planning-tabs.tsx
================================================
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CleaningPlanning } from "@/components/planning"
import GeneratePlanningPdf from "@/components/generate-planning-pdf"
import {
  filterScheduleByAgent,
  listAgentsInSchedule,
  type MonthlyScheduleResponse,
} from "@/lib/planningService"

export interface PlanningTabsProps {
  schedule: MonthlyScheduleResponse
  /** ID de la ligne `planning` en DB (pour l'API PDF). */
  planningId: number
  year: number
  month: number
}

export function PlanningTabs({
  schedule,
  planningId,
  year,
  month,
}: PlanningTabsProps) {
  const agents = React.useMemo(() => listAgentsInSchedule(schedule), [schedule])
  const [activeTab, setActiveTab] = React.useState<string>(agents[0] ?? "")

  const filteredByAgent = React.useMemo(() => {
    const map = new Map<string, MonthlyScheduleResponse>()
    for (const agent of agents) {
      map.set(agent, filterScheduleByAgent(schedule, agent))
    }
    return map
  }, [schedule, agents])

  if (agents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun agent dans ce planning.
      </p>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          {agents.map((agent) => (
            <TabsTrigger key={agent} value={agent}>
              {agent}
            </TabsTrigger>
          ))}
        </TabsList>

        <GeneratePlanningPdf
          planningId={planningId}
          year={year}
          month={month}
          agent={activeTab}
        />
      </div>

      {agents.map((agent) => (
        <TabsContent key={agent} value={agent}>
          <CleaningPlanning schedule={filteredByAgent.get(agent)!}/>
        </TabsContent>
      ))}
    </Tabs>
  )
}


================================================
FILE: components/planning.tsx
================================================
"use client"

import * as React from "react"
import type {
  MonthlyScheduleResponse,
  Task,
} from "@/lib/planningService"

export interface CleaningPlanningProps {
  /** Planning complet (global ou déjà filtré par `filterScheduleByAgent`). */
  schedule: MonthlyScheduleResponse
  /** Filtre optionnel : si fourni, n'affiche que les tâches de cet agent. */
  agentFilter?: string
  /** Masque les tâches fixes (pause, hall, plonge, lessives, common). */
  hideFixedTasks?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  menage: "Ménage",
  hall: "Hall",
  pause: "Pause",
  plonge: "Plonge",
  lessives: "Lessives",
  common: "Parties communes",
  fixed: "—",
}

/** Libellé de la colonne "À faire" pour une tâche donnée. */
function taskLabel(task: Task): string {
  if (task.type === "menage") return TYPE_LABELS.menage
  // Pour hall / pause / etc., on affiche le libellé fourni par le service
  if (task.resident) return task.resident
  return TYPE_LABELS[task.type] ?? task.type
}

/** Libellé de la colonne "Service" (uniquement pour les ménages). */
function serviceLabel(task: Task): string {
  if (task.type !== "menage") return "—"
  const parts = [
    task.building ? `Bât. ${task.building}` : null,
    task.room ? `Ch. ${task.room}` : null,
  ].filter(Boolean)
  return parts.join(" • ") || "—"
}

export function CleaningPlanning({
  schedule,
  agentFilter,
  hideFixedTasks = false,
}: CleaningPlanningProps) {
  // --- 1. Filtrage optionnel par agent ---
  const filteredWeeks = React.useMemo(() => {
    if (!agentFilter) return schedule.weeks
    return schedule.weeks
      .map((week) => ({
        ...week,
        days: week.days
          .map((day) => ({
            ...day,
            tasks: day.tasks.filter(
              (t) => t.type === "menage" && t.agent === agentFilter,
            ),
          }))
          .filter((day) => day.tasks.length > 0),
      }))
      .filter((week) => week.days.length > 0)
  }, [schedule.weeks, agentFilter])

  // --- 2. Y a-t-il plusieurs agents dans ce planning ? ---
  const hasMultipleAgents = React.useMemo(() => {
    const agents = new Set<string>()
    for (const w of filteredWeeks) {
      for (const d of w.days) {
        for (const t of d.tasks) {
          if (t.agent) agents.add(t.agent)
        }
      }
    }
    return agents.size > 1
  }, [filteredWeeks])

  const displayAgent = agentFilter ?? schedule.agent
  const colCount = hasMultipleAgents ? 6 : 5

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Planning ménage
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {schedule.title}
          </h1>
          {schedule.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {schedule.subtitle}
            </p>
          )}
        </div>

        <div className="w-fit rounded-lg border bg-muted/40 px-4 py-2 sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {agentFilter ? "Agent" : "Équipe"}
          </p>
          <p className="font-semibold">{displayAgent}</p>
        </div>
      </header>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-237.5 border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="w-47.5 border-b px-4 py-3 text-left font-semibold">
                  Date
                </th>
                <th className="w-30 border-b px-4 py-3 text-left font-semibold">
                  Heure
                </th>
                <th className="w-55 border-b px-4 py-3 text-left font-semibold">
                  À faire
                </th>
                <th className="min-w-60 border-b px-4 py-3 text-left font-semibold">
                  Nom
                </th>
                <th className="min-w-47.5 border-b px-4 py-3 text-left font-semibold">
                  Service
                </th>
                {hasMultipleAgents && (
                  <th className="min-w-30 border-b px-4 py-3 text-left font-semibold">
                    Agent
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredWeeks.map((week, weekIndex) => (
                <React.Fragment key={`week-${weekIndex}-${week.label}`}>
                  {/* Bandeau semaine */}
                  <tr>
                    <td
                      colSpan={colCount}
                      className="border-b bg-muted/20 px-4 py-2"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {week.label}
                      </span>
                    </td>
                  </tr>

                  {week.days.map((day) => {
                    const tasks = hideFixedTasks
                      ? day.tasks.filter((t) => t.type === "menage")
                      : day.tasks

                    if (tasks.length === 0) return null

                    return (
                      <tr
                        key={day.isoDate}
                        className="align-top transition-colors hover:bg-muted/20"
                      >
                        {/* DATE */}
                        <td className="border-b px-4 py-0">
                          <div className="flex min-h-11 items-center">
                            <span className="font-semibold capitalize">
                              {day.date}
                            </span>
                          </div>
                        </td>

                        {/* HEURE */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => (
                              <div
                                key={`time-${i}-${t.time}-${t.agent ?? ""}`}
                                className="flex min-h-11 items-center px-4 py-2 font-medium tabular-nums text-muted-foreground"
                              >
                                {t.time}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* À FAIRE */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => {
                              const isMenage = t.type === "menage"
                              return (
                                <div
                                  key={`label-${i}-${t.time}-${t.agent ?? ""}`}
                                  className="flex min-h-11 items-center px-4 py-2"
                                >
                                  <span
                                    className={
                                      isMenage
                                        ? "font-medium"
                                        : "text-muted-foreground italic"
                                    }
                                  >
                                    {taskLabel(t)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </td>

                        {/* NOM */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => (
                              <div
                                key={`name-${i}-${t.time}-${t.agent ?? ""}`}
                                className="flex min-h-11 items-center px-4 py-2"
                              >
                                {t.type === "menage" ? (
                                  <span className="font-bold">
                                    {t.resident ?? "—"}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* SERVICE */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => (
                              <div
                                key={`svc-${i}-${t.time}-${t.agent ?? ""}`}
                                className="flex min-h-11 items-center px-4 py-2 text-muted-foreground"
                              >
                                {serviceLabel(t)}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* AGENT (conditionnel) */}
                        {hasMultipleAgents && (
                          <td className="border-b p-0">
                            <div className="divide-y">
                              {tasks.map((t, i) => (
                                <div
                                  key={`agent-${i}-${t.time}`}
                                  className="flex min-h-11 items-center px-4 py-2 text-xs text-muted-foreground"
                                >
                                  {t.agent ?? "—"}
                                </div>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAPPORT (optionnel — décommenter pour debug) */}
      {/*
      <details className="rounded-lg border bg-muted/20 p-4 text-sm">
        <summary className="cursor-pointer font-semibold">
          📊 Rapport de génération
        </summary>
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(schedule.report, null, 2)}
        </pre>
      </details>
      */}
    </section>
  )
}


================================================
FILE: components/section-cards.tsx
================================================
"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon
              />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period{" "}
            <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}



================================================
FILE: components/sign-up-form.tsx
================================================
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">S&apos;inscrire</CardTitle>
          <CardDescription>Créer votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Confirmer votre mot de passe</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Création du compte...' : "S'inscrire"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



================================================
FILE: components/site-header.tsx
================================================
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">Administration</h1>
      </div>
    </header>
  )
}



================================================
FILE: components/slide-to-action.tsx
================================================
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SlideToActionProps = {
  text?: string;
  successText?: string;
  onComplete?: () => void;
  disabled?: boolean;
  /** Change cette valeur pour réinitialiser le slider depuis le parent */
  resetKey?: string | number;
  className?: string;
};

const THUMB_SIZE = 52; // px, largeur du bouton
const COMPLETE_THRESHOLD = 0.85;
const KEYBOARD_STEP = 24; // px par pression de flèche

export function SlideToAction({
  text = "Glisser pour valider",
  successText = "Validé !",
  onComplete,
  disabled = false,
  resetKey,
  className,
}: SlideToActionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Réinitialise le slider quand resetKey change (ex: après un onComplete traité par le parent).
  // Ajustement pendant le rendu plutôt que dans un effect : évite le double rendu et le
  // warning React "setState synchronously within an effect".
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPosition(0);
    setCompleted(false);
  }

  const recalcMaxPosition = useCallback(() => {
    if (!containerRef.current) return;
    setMaxPosition(containerRef.current.offsetWidth - THUMB_SIZE - 4);
  }, []);

  // Recalcule la largeur dispo au montage et à chaque redimensionnement du conteneur
  useEffect(() => {
    recalcMaxPosition();
    const observer = new ResizeObserver(recalcMaxPosition);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [recalcMaxPosition]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || completed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || disabled || completed) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextPosition = event.clientX - rect.left - THUMB_SIZE / 2;

    setPosition(Math.max(0, Math.min(nextPosition, maxPosition)));
  };

  const handlePointerUp = () => {
    if (!dragging || disabled || completed) return;
    setDragging(false);

    if (position >= maxPosition * COMPLETE_THRESHOLD) {
      setPosition(maxPosition);
      setCompleted(true);
      onComplete?.();
      return;
    }
    setPosition(0);
  };

  // Accessibilité clavier : flèches pour déplacer, Entrée/Espace pour valider directement
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || completed) return;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        setPosition(Math.min(position + KEYBOARD_STEP, maxPosition));
        break;
      case "ArrowLeft":
        event.preventDefault();
        setPosition(Math.max(position - KEYBOARD_STEP, 0));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        setPosition(maxPosition);
        setCompleted(true);
        onComplete?.();
        break;
      default:
        break;
    }
  };

  const progress = maxPosition > 0 ? Math.round((position / maxPosition) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-14 w-full overflow-hidden rounded-full",
        "bg-muted/60 border border-border",
        "select-none touch-none",
        disabled && "opacity-50",
        className,
      )}
    >
      {/* Texte */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "text-sm font-medium text-muted-foreground",
          "pointer-events-none",
          "transition-opacity duration-200",
          completed && "opacity-0",
        )}
      >
        {text}
      </div>

      {/* Barre de progression */}
      <div
        className={cn(
          "absolute inset-y-1 left-1 rounded-full",
          "bg-primary/10",
          "transition-[width] duration-75",
        )}
        style={{ width: `${position + THUMB_SIZE}px` }}
      />

      {/* Bouton / thumb */}
      <button
        type="button"
        disabled={disabled}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completed ? 100 : progress}
        aria-label={completed ? successText : text}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute left-1 top-1 z-10",
          "flex h-12 w-12 items-center justify-center",
          "rounded-full bg-primary text-primary-foreground",
          "shadow-md",
          "cursor-grab active:cursor-grabbing",
          "transition-[transform,background-color] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          dragging && "transition-none",
          completed && "bg-green-600",
        )}
        style={{ transform: `translateX(${position}px)` }}
      >
        {completed ? (
          <Check className="size-5" />
        ) : (
          <ChevronRight className="size-5" />
        )}
      </button>

      {/* Texte de succès */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "text-sm font-semibold text-green-600",
          "pointer-events-none",
          "opacity-0 transition-opacity duration-200",
          completed && "opacity-100",
        )}
      >
        {successText}
      </div>
    </div>
  );
}


================================================
FILE: components/update-password-form.tsx
================================================
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/protected')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Réinitialiser votre mot de passe</CardTitle>
          <CardDescription>Veuillez saisir votre nouveau mot de passe ci-dessous.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nouveau mot de passe"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enregistrement en cours...' : 'Enregistrer le nouveau mot de passe'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



================================================
FILE: components/agents/agentForm.tsx
================================================
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/components/buzzform/form";

import { AgentAbscencesSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import SupabaseCrud from "@/lib/supabase-crud";
import { Database } from "@/database.types";

type AgentAbsences =
  Database["public"]["Tables"]["agent_absences"]["Row"];

type AgentAbsencesInsert =
  Database["public"]["Tables"]["agent_absences"]["Insert"];

export default function AgentForm({agent_id}: {agent_id: number}) {
  const agentAbsencesService =
    new SupabaseCrud<AgentAbsences>(
      "agent_absences",
    );

  const onSubmit = async ({
    value,
  }: {
    value: AgentAbsencesInsert;
  }) => {
    const result =
      await agentAbsencesService.create({...value, agent_id: agent_id});

    if (!result.success) {
      console.error(result.error);
      return;
    }

    console.log("Absence créée :", result.data);
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Ajouter
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ajouter un créneau de congés
          </DialogTitle>
        </DialogHeader>

        <Form
          schema={AgentAbscencesSchema}
          onSubmit={onSubmit}
        >
          <FormContent>
            <FormFields />

            <FormSubmit>
              Ajouter
            </FormSubmit>
          </FormContent>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


================================================
FILE: components/buzzform/form.tsx
================================================
"use client";

import * as React from "react";
import {
  Form as HeadlessForm,
  RenderFields,
  FormConfigContext,
  useForm,
  type FieldFormApi,
  type UseFormOptionsWithSchema,
  type FormRegistries,
  FormProvider,
  mergeRegistries,
} from "@buildnbuzz/form-react";
import type {
  CoreField,
  FormSchema,
  ValidationRun,
} from "@buildnbuzz/form-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Context ---

interface FormContextValue {
  form: FieldFormApi;
  schema?: FormSchema;
  formId: string;
  derivedValidationMode?: ValidationRun;
  registries?: FormRegistries;
}

const FormContext = React.createContext<FormContextValue | null>(null);

function useFormContext(): FormContextValue {
  const ctx = React.useContext(FormContext);
  if (!ctx) throw new Error("Must be used within <Form>");
  return ctx;
}

// --- Types ---

type FormActionsConfig = {
  /** Label for the submit button. Defaults to "Submit". */
  submitLabel?: string;
  /** Props forwarded to the submit button. */
  submitProps?: Omit<FormSubmitProps, "children">;
  /** Alignment of the actions row. Defaults to "end". */
  align?: FormActionsProps["align"];
  /** Whether to show a reset button. Defaults to false. */
  showReset?: boolean;
  /** Label for the reset button. Defaults to "Reset". */
  resetLabel?: string;
  /** Props forwarded to the reset button. */
  resetProps?: Omit<FormResetProps, "children">;
};

type FormOwnProps = {
  /** Unified runtime registries (fields, validators, resolvers, fns). */
  registries?: FormRegistries;
  children?: React.ReactNode;
  actions?: FormActionsConfig;
};

type FormWithInstance = FormOwnProps & {
  form: FieldFormApi;
  schema?: FormSchema;
  derivedValidationMode?: ValidationRun;
};

type FormWithSchema<TSchema extends FormSchema = FormSchema> = FormOwnProps &
  UseFormOptionsWithSchema<TSchema> & {
    form?: never;
  };

type FormProps<TSchema extends FormSchema = FormSchema> =
  | FormWithInstance
  | FormWithSchema<TSchema>;

// --- Form ---

function Form<TSchema extends FormSchema = FormSchema>(
  props: FormProps<TSchema>,
) {
  const config = React.useContext(FormConfigContext);
  const globalRegistries = config?.registries;
  // Check fields registry exists either on the prop or globally.
  // Merging happens inside the headless layer (renderer / field / use-form).
  const hasFieldRegistry =
    (props.registries?.fields ?? globalRegistries?.fields) !== undefined;

  const derivedValidationMode =
    (props as FormWithInstance).derivedValidationMode ??
    (props as FormWithSchema<TSchema>).derivedValidationMode ??
    config?.derivedValidationMode;
  const formId = React.useId();

  if (!hasFieldRegistry) {
    throw new Error(
      "No field component registry found. Pass `registries.fields` to <Form> or wrap with <FormProvider>.",
    );
  }

  if ("form" in props && props.form) {
    const mergedRegistries = mergeRegistries(
      config?.registries,
      props.registries,
    );
    return (
      <FormContext.Provider
        value={{
          form: props.form,
          schema: props.schema,
          formId,
          derivedValidationMode,
          registries: mergedRegistries,
        }}
      >
        <FormProvider
          registries={mergedRegistries}
          derivedValidationMode={derivedValidationMode}
        >
          {props.children}
        </FormProvider>
      </FormContext.Provider>
    );
  }

  return (
    <FormInner
      {...(props as FormWithSchema<TSchema>)}
      derivedValidationMode={derivedValidationMode}
      formId={formId}
    />
  );
}
function FormInner<TSchema extends FormSchema = FormSchema>({
  formId,
  children,
  schema,
  actions,
  defaultValues,
  onSubmit,
  registries,
  contextData,
  derivedValidationMode,
  ...tanstackOpts
}: FormWithSchema<TSchema> & {
  formId: string;
  derivedValidationMode?: ValidationRun;
}) {
  const config = React.useContext(FormConfigContext);
  if (process.env.NODE_ENV === "development" && children && actions) {
    console.warn(
      "<Form>: `actions` prop is ignored when children are provided.",
    );
  }

  const {
    submitLabel = "Submit",
    submitProps,
    align = "end",
    showReset = false,
    resetLabel = "Reset",
    resetProps,
  } = actions ?? {};

  const form = useForm<TSchema>({
    schema: schema as TSchema,
    defaultValues,
    onSubmit,
    registries,
    contextData,
    derivedValidationMode,
    ...tanstackOpts,
  } as UseFormOptionsWithSchema<TSchema>);

  const mergedRegistries = React.useMemo(
    () => mergeRegistries(config?.registries, registries),
    [config?.registries, registries],
  );

  return (
    <FormContext.Provider
      value={{
        form,
        schema,
        formId,
        derivedValidationMode,
        registries: mergedRegistries,
      }}
    >
      <FormProvider
        registries={mergedRegistries}
        derivedValidationMode={derivedValidationMode}
      >
        {children ?? (
          <FormContent>
            <FormFields />
            <FormActions align={align}>
              {showReset && <FormReset {...resetProps}>{resetLabel}</FormReset>}
              <FormSubmit {...submitProps}>{submitLabel}</FormSubmit>
            </FormActions>
          </FormContent>
        )}
      </FormProvider>
    </FormContext.Provider>
  );
}

// --- FormContent ---

type FormContentProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  autoRender?: boolean;
  as?: React.ElementType;
};

function FormContent({
  className,
  autoRender,
  as,
  children,
  ...props
}: FormContentProps) {
  const { form, formId, derivedValidationMode, registries } = useFormContext();

  return (
    <HeadlessForm
      id={formId}
      as={as}
      form={form}
      registries={registries}
      derivedValidationMode={derivedValidationMode}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {autoRender ? (
        <>
          <FormFields />
          {children}
        </>
      ) : (
        children
      )}
    </HeadlessForm>
  );
}

// --- FormFields ---

type FormFieldsProps = {
  className?: string;
};

function FormFields({ className }: FormFieldsProps) {
  const { form, schema, derivedValidationMode, registries } = useFormContext();
  const fields = (schema?.fields ?? []) as readonly CoreField[];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <RenderFields
        fields={fields}
        form={form}
        registries={registries}
        derivedValidationMode={derivedValidationMode}
      />
    </div>
  );
}

// --- FormActions ---

type FormActionsProps = React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end" | "between";
};

function FormActions({ className, align = "end", ...props }: FormActionsProps) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex gap-2",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className,
      )}
      {...props}
    />
  );
}

// --- FormSubmit ---

type FormSubmitProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "form"
> & {
  submittingText?: React.ReactNode;
};

function FormSubmit({
  children,
  submittingText = "Submitting...",
  disabled,
  ...props
}: FormSubmitProps) {
  const { form, formId } = useFormContext();
  return (
    <form.Subscribe
      selector={(s) => ({
        canSubmit: s.canSubmit,
        isSubmitting: s.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button
          type="submit"
          form={formId}
          disabled={disabled || !canSubmit || isSubmitting}
          {...props}
        >
          {isSubmitting ? submittingText : (children ?? "Submit")}
        </Button>
      )}
    </form.Subscribe>
  );
}

// --- FormReset ---

type FormResetProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "onClick"
> & {
  disabled?: boolean;
};

function FormReset({
  children,
  disabled,
  variant = "outline",
  ...props
}: FormResetProps) {
  const { form } = useFormContext();
  return (
    <form.Subscribe
      selector={(s) => ({ isSubmitting: s.isSubmitting, isDirty: s.isDirty })}
    >
      {({ isSubmitting, isDirty }) => (
        <Button
          type="button"
          variant={variant}
          disabled={disabled || isSubmitting || !isDirty}
          onClick={() => form.reset()}
          {...props}
        >
          {children ?? "Reset"}
        </Button>
      )}
    </form.Subscribe>
  );
}

// --- FormMessage ---

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { form } = useFormContext();
  return (
    <form.Subscribe selector={(s) => s.errors}>
      {(errors) => {
        const rootError = errors[0];
        const message =
          children ??
          (typeof rootError === "string" || React.isValidElement(rootError)
            ? (rootError as React.ReactNode)
            : null);
        if (!message) return null;
        return (
          <div
            role="alert"
            data-slot="form-message"
            className={cn(
              "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive",
              className,
            )}
            {...props}
          >
            {message}
          </div>
        );
      }}
    </form.Subscribe>
  );
}

// --- Exports ---

export {
  Form,
  FormContent,
  FormFields,
  FormActions,
  FormSubmit,
  FormReset,
  FormMessage,
  useFormContext,
  type FormProps,
  type FormContentProps,
  type FormActionsProps,
  type FormSubmitProps,
  type FormResetProps,
};



================================================
FILE: components/buzzform/registry.ts
================================================
"use client";

import type { FieldRegistry } from "@buildnbuzz/form-react";

import { TextField } from "./fields/text";
import { EmailField } from "./fields/email";
import { PasswordField } from "./fields/password";
import { RowField } from "./fields/row";
import { TextareaField } from "./fields/textarea";
import { NumberField } from "./fields/number";
import { SelectField } from "./fields/select";
import { CheckboxField } from "./fields/checkbox";
import { SwitchField } from "./fields/switch";
import { RadioField } from "./fields/radio";
import { GroupField } from "./fields/group";
import { ArrayField } from "./fields/array";
import { TabsField } from "./fields/tabs";
import { CollapsibleField } from "./fields/collapsible";
import { DateField } from "./fields/date";
import { TagsField } from "./fields/tags";
import { UploadField } from "./fields/upload";
import { UiField } from "./fields/ui";

export const registry: FieldRegistry = {
  text: TextField,
  email: EmailField,
  password: PasswordField,
  row: RowField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  checkbox: CheckboxField,
  switch: SwitchField,
  radio: RadioField,
  group: GroupField,
  array: ArrayField,
  tabs: TabsField,
  collapsible: CollapsibleField,
  date: DateField,
  tags: TagsField,
  upload: UploadField,
  ui: UiField,
};



================================================
FILE: components/buzzform/components/checkbox.tsx
================================================
"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "@/lib/utils";
import { Minus, Check } from "lucide-react";

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "checked"> & {
  checked?: boolean | "indeterminate";
  indeterminate?: boolean;
};

export function Checkbox({
  className,
  checked,
  indeterminate,
  ...props
}: CheckboxProps) {
  const isIndeterminate = indeterminate ?? checked === "indeterminate";
  const normalizedChecked = checked === "indeterminate" ? false : checked;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={normalizedChecked}
      indeterminate={isIndeterminate}
      data-indeterminate={isIndeterminate ? "" : undefined}
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-indeterminate:bg-primary data-indeterminate:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border transition-colors group-has-disabled/field:opacity-50 focus-visible:ring-[3px] aria-invalid:ring-[3px] peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 grid place-content-center text-current transition-none"
      >
        {isIndeterminate ? (
          <Minus
          />
        ) : (
          <Check
          />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}



================================================
FILE: components/buzzform/components/copy-button.tsx
================================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export interface CopyButtonProps {
  value: string;
  disabled?: boolean;
  successDuration?: number;
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({
  value,
  disabled = false,
  successDuration = 2000,
  className,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value || disabled) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), successDuration);
    } catch {
      // clipboard access denied — fail silently
    }
  };

  if (!value) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleCopy}
      disabled={disabled || !value}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="size-4" />
      ) : (
        <Copy className="size-4" />
      )}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}



================================================
FILE: components/buzzform/components/tag-input.tsx
================================================
"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Variants (CVA)
// ---------------------------------------------------------------------------

const tagInputVariants = cva(
  "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent bg-clip-padding px-3 py-1.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
  {
    variants: {
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
      readOnly: {
        true: "cursor-default bg-muted/30",
      },
    },
  }
);

const tagItemVariants = cva(
  "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 font-medium whitespace-nowrap text-foreground transition-all",
  {
    variants: {
      variant: {
        chips: "rounded-sm bg-muted px-1.5 text-xs",
        pills: "rounded-full bg-muted px-3 text-xs",
        inline: "rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "chips",
    },
  }
);

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type TagInputContextType = {
  value: string[];
  maxTags?: number;
  allowDuplicates?: boolean;
  maxTagLength?: number;
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  variant: "chips" | "pills" | "inline";
  addTag: (tag: string) => boolean;
  removeTag: (index: number) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const TagInputContext = React.createContext<TagInputContextType | null>(null);

function useTagInputContext() {
  const context = React.useContext(TagInputContext);
  if (!context) {
    throw new Error("TagInput components must be used within a <TagInput />");
  }
  return context;
}

// ---------------------------------------------------------------------------
// TagInput Root
// ---------------------------------------------------------------------------

export type TagInputDelimiter = "Enter" | "Comma" | "Space" | "Tab" | string;

export interface TagInputProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: "chips" | "pills" | "inline";
  maxTags?: number;
  allowDuplicates?: boolean;
  maxTagLength?: number;
  children?: React.ReactNode;
}

export const TagInput = ({
  value = [],
  onValueChange,
  disabled,
  readOnly,
  variant = "chips",
  maxTags,
  allowDuplicates = false,
  maxTagLength,
  children,
}: TagInputProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string): boolean => {
    const trimmed = tag.trim();
    if (!trimmed) return false;
    if (maxTagLength && trimmed.length > maxTagLength) return false;
    if (!allowDuplicates && value.includes(trimmed)) return false;
    if (maxTags !== undefined && value.length >= maxTags) return false;

    onValueChange?.([...value, trimmed]);
    return true;
  };

  const removeTag = (index: number) => {
    if (disabled || readOnly) return;
    onValueChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <TagInputContext.Provider
      value={{
        value,
        maxTags,
        allowDuplicates,
        maxTagLength,
        onValueChange,
        disabled,
        readOnly,
        variant,
        addTag,
        removeTag,
        inputValue,
        setInputValue,
        inputRef,
      }}
    >
      {children}
    </TagInputContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// TagInputList
// ---------------------------------------------------------------------------

export type TagInputListProps = React.ComponentPropsWithoutRef<"div">;

export const TagInputList = React.forwardRef<HTMLDivElement, TagInputListProps>(
  ({ className, ...props }, ref) => {
    const { disabled, readOnly, inputRef } = useTagInputContext();

    return (
      <div
        ref={ref}
        onClick={() => !disabled && !readOnly && inputRef.current?.focus()}
        className={cn(tagInputVariants({ disabled, readOnly, className }))}
        {...props}
      />
    );
  }
);
TagInputList.displayName = "TagInputList";

// ---------------------------------------------------------------------------
// TagInputItem
// ---------------------------------------------------------------------------

export interface TagInputItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

export const TagInputItem = React.forwardRef<HTMLDivElement, TagInputItemProps>(
  ({ className, index, children, ...props }, ref) => {
    const { variant, value, disabled, readOnly, removeTag } = useTagInputContext();
    const tag = value[index];

    return (
      <div
        ref={ref}
        className={cn(tagItemVariants({ variant, className }))}
        {...props}
      >
        {children ?? <span className="truncate max-w-40">{tag}</span>}
        {!disabled && !readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="ml-0.5 rounded-full p-0.5 opacity-50 hover:bg-muted-foreground/20 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    );
  }
);
TagInputItem.displayName = "TagInputItem";

// ---------------------------------------------------------------------------
// TagInputControl
// ---------------------------------------------------------------------------

export interface TagInputControlProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  delimiters?: TagInputDelimiter[];
}

export const TagInputControl = React.forwardRef<HTMLInputElement, TagInputControlProps>(
  ({ className, delimiters = ["Enter"], placeholder, onBlur, onKeyDown, ...props }, ref) => {
    const {
      inputValue,
      setInputValue,
      addTag,
      removeTag,
      value: tags,
      maxTags,
      disabled,
      readOnly,
      inputRef,
    } = useTagInputContext();

    // Sync external forward ref with context ref
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
        return;
      }

      const isDelimiter = delimiters.some((d) => {
        if (d === "Comma" && e.key === ",") return true;
        if (d === "Space" && e.key === " ") return true;
        return d.toLowerCase() === e.key.toLowerCase();
      });

      if (isDelimiter && inputValue.trim()) {
        e.preventDefault();
        if (addTag(inputValue)) {
          setInputValue("");
        }
      }

      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const hasCommaDelimiter = delimiters.some((d) => d === "Comma" || d === ",");

      if (hasCommaDelimiter && val.includes(",")) {
        const parts = val.split(",");
        const last = parts.pop() ?? "";

        parts.forEach((p) => {
          addTag(p);
        });

        setInputValue(last);
        return;
      }

      setInputValue(val);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (inputValue.trim()) {
        if (addTag(inputValue)) {
          setInputValue("");
        }
      }
      onBlur?.(e);
    };

    if (readOnly) return null;

    const canAddMore = maxTags === undefined || tags.length < maxTags;
    if (!canAddMore) return null;

    return (
      <input
        {...props}
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        disabled={disabled}
        placeholder={tags.length === 0 ? placeholder : ""}
        className={cn(
          "flex-1 min-w-20 bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed",
          className
        )}
        autoComplete={props.autoComplete ?? "off"}
      />
    );
  }
);
TagInputControl.displayName = "TagInputControl";



================================================
FILE: components/buzzform/fields/array.tsx
================================================
"use client";

import * as React from "react";
import type { ArrayFieldDef, CoreField } from "@buildnbuzz/form-react";
import {
  useDataField,
  RenderFields,
  useNestedErrorCount,
} from "@buildnbuzz/form-react";
import { resolveExpr } from "@buildnbuzz/form-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { GripVertical, ChevronDown, Copy, Trash2, Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface ArrayUi {
  /** Visual style for the array container. Defaults to `"default"`. */
  variant?: "default" | "minimal";
  /** Row header label — use `{ $data: "fieldName" }` to show a field value. Falls back to `"Item #N"`. */
  rowLabel?: unknown;
  /** Enable drag-to-reorder. Defaults to `true`. */
  isSortable?: boolean;
  /** Show error-count badge in the container header. Defaults to `true`. */
  showErrorBadge?: boolean;
  /** Show a duplicate button per row. Defaults to `false`. */
  allowDuplicate?: boolean;
  /** Require confirmation before deleting all items. Defaults to `true`. */
  confirmDelete?: boolean;
  /** Text and label overrides. */
  labels?: {
    /** Label for the add button. Defaults to `"Add Item"`. */
    add?: React.ReactNode;
    /** Empty state message. Defaults to `"No items added yet."`. */
    empty?: React.ReactNode;
    /** Fallback row label when dynamic path is missing or empty. Defaults to `"Item #N"`. */
    rowFallback?: string;
    /** Title for the delete confirmation dialog. */
    confirmDeleteTitle?: React.ReactNode;
    /** Description for the delete confirmation dialog. */
    confirmDeleteDescription?: React.ReactNode;
    /** Label for the cancel button in delete confirmation. */
    confirmDeleteCancelLabel?: string;
    /** Label for the confirm button in delete confirmation. */
    confirmDeleteActionLabel?: string;
  };
  /** Controls required asterisk visibility. */
  asterisk?: boolean;
}

// ---------------------------------------------------------------------------
// ArrayItem props type
// ---------------------------------------------------------------------------

interface ArrayItemProps {
  id: string;
  index: number;
  field: ArrayFieldDef;
  form: ReturnType<typeof useDataField>["form"];
  fieldApiName: string;
  rowLabel: unknown;
  rowFallback?: string;
  contextData: unknown;
  isSortable: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  canRemove: boolean;
  canDuplicate: boolean;
  allowDuplicate: boolean;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

// ---------------------------------------------------------------------------
// ArrayItem
// ---------------------------------------------------------------------------

function ArrayItem({
  id,
  index,
  field,
  form,
  fieldApiName,
  rowLabel,
  rowFallback,
  contextData,
  isSortable,
  isDisabled,
  isReadOnly,
  canRemove,
  canDuplicate,
  allowDuplicate,
  onRemove,
  onDuplicate,
}: ArrayItemProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const rowPath = `${fieldApiName}.${index}`;

  const rowData = form.getFieldValue(rowPath as never);
  const rowFormData =
    rowData && typeof rowData === "object"
      ? (rowData as Record<string, unknown>)
      : { value: rowData };

  const defaultRowLabel = rowFallback ?? `Item ${index + 1}`;

  const resolvedLabel = rowLabel
    ? String(
        resolveExpr(
          rowLabel as string,
          { data: rowFormData, context: (contextData ?? {}) as Record<string, unknown> },
        ) ?? "",
      ).trim() || defaultRowLabel
    : field.primitive === true && rowData !== undefined && rowData !== null
      ? String(rowData)
      : defaultRowLabel;

  const errorCount = useNestedErrorCount(field.fields as CoreField[], rowPath);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isSortable || isDisabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-card border rounded-lg overflow-hidden">
          <CardHeader
            className={cn(
              "flex flex-row items-center gap-2 px-3 py-2 bg-muted/50",
              isOpen && "border-b",
            )}
          >
            {isSortable && !isDisabled && (
              <span
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
              >
                <GripVertical className="size-4" />
              </span>
            )}

            <CollapsibleTrigger className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer">
              <ChevronDown className={cn(
                                            "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                                            !isOpen && "-rotate-90",
                                          )} />
              <span className="text-sm font-medium truncate">
                {resolvedLabel}
              </span>
              {errorCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-xs ml-1 shrink-0"
                >
                  {errorCount}
                </Badge>
              )}
            </CollapsibleTrigger>

            {!isReadOnly && (
              <div className="flex items-center gap-0.5 shrink-0">
                {allowDuplicate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDuplicate(index)}
                    disabled={!canDuplicate || isDisabled}
                    title="Duplicate"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(index)}
                  disabled={!canRemove || isDisabled}
                  title="Remove"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </CardHeader>

          <CollapsibleContent>
            <div className="p-4 flex flex-col gap-4">
              <RenderFields
                fields={field.fields as CoreField[]}
                form={form}
                basePath={rowPath}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

function MinimalArrayItem({
  id,
  index,
  field,
  form,
  fieldApiName,
  rowLabel,
  rowFallback,
  contextData,
  isSortable,
  isDisabled,
  isReadOnly,
  canRemove,
  canDuplicate,
  allowDuplicate,
  onRemove,
  onDuplicate,
}: ArrayItemProps) {
  const rowPath = `${fieldApiName}.${index}`;
  const rowData = form.getFieldValue(rowPath as never);
  const rowFormData =
    rowData && typeof rowData === "object"
      ? (rowData as Record<string, unknown>)
      : { value: rowData };

  const defaultRowLabel = rowFallback ?? `Item ${index + 1}`;

  const resolvedLabel = rowLabel
    ? String(
        resolveExpr(
          rowLabel as string,
          { data: rowFormData, context: (contextData ?? {}) as Record<string, unknown> },
        ) ?? "",
      ).trim() || defaultRowLabel
    : "";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isSortable || isDisabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex w-full items-start gap-3 py-1 group/array-item"
    >
      <div className="flex-1 min-w-0">
        {resolvedLabel && field.primitive !== true && (
          <p className="text-xs text-muted-foreground mb-2">{resolvedLabel}</p>
        )}
        <div
          className={cn(
            "flex flex-col gap-4 w-full",
            field.primitive === true &&
              "**:data-[slot=field-label]:hidden **:data-[slot=field-description]:hidden",
          )}
        >
          <RenderFields
            fields={field.fields as CoreField[]}
            form={form}
            basePath={rowPath}
          />
        </div>
      </div>

      {!isReadOnly && (
        <div
          className={cn(
            "flex items-center gap-1 shrink-0",
            field.primitive === true ? "mt-0.5" : "mt-7",
          )}
        >
          {isSortable && !isDisabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              {...attributes}
              {...listeners}
              title="Drag"
            >
              <GripVertical className="size-3.5" />
            </Button>
          )}
          {allowDuplicate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onDuplicate(index)}
              disabled={!canDuplicate || isDisabled}
              title="Duplicate"
            >
              <Copy className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
            disabled={!canRemove || isDisabled}
            title="Remove"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface ArrayFieldState {
  fieldApi: ReturnType<typeof useDataField>["fieldApi"];
  field: ArrayFieldDef;
  form: ReturnType<typeof useDataField>["form"];
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  errors: ReturnType<typeof useDataField>["errors"];
  isInvalid: boolean;
  descriptionId?: string;
  errorId?: string;
  contextData: unknown;
}

function DefaultArrayField(state: ArrayFieldState) {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  } = state;

  const ui = field.ui as ArrayUi | undefined;
  const labels = ui?.labels;

  const addLabel = labels?.add ?? "Add Item";
  const emptyMessage = labels?.empty ?? "No items added yet.";
  const isSortable = ui?.isSortable !== false;
  const showErrorBadge = ui?.showErrorBadge !== false;
  const allowDuplicate = ui?.allowDuplicate ?? false;
  const confirmDelete = ui?.confirmDelete !== false;

  const items = Array.isArray(fieldApi.state.value) ? fieldApi.state.value : [];

  const confirmDeleteTitle = labels?.confirmDeleteTitle ?? "Delete all items?";
  const confirmDeleteDescription =
    labels?.confirmDeleteDescription ??
    (items.length === 1
      ? "This will remove the item. This cannot be undone."
      : `This will remove all ${items.length} items. This cannot be undone.`);
  const confirmDeleteCancelLabel = labels?.confirmDeleteCancelLabel ?? "Cancel";
  const confirmDeleteActionLabel =
    labels?.confirmDeleteActionLabel ?? "Delete All";

  const [showDeleteAllDialog, setShowDeleteAllDialog] = React.useState(false);

  const canAddMore =
    field.maxItems === undefined || items.length < field.maxItems;
  const canRemoveAny =
    field.minItems === undefined || items.length > field.minItems;

  // Stable DnD IDs keyed by position — sufficient since we reorder in-place
  const dndId = React.useId();
  const itemIds = items.map((_, i) => `${fieldApi.name}-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(active.id as string);
    const to = itemIds.indexOf(over.id as string);
    if (from !== -1 && to !== -1) fieldApi.moveValue(from, to);
  };

  const handleAdd = () => {
    if (!isDisabled && !isReadOnly && canAddMore)
      fieldApi.pushValue(undefined as never);
  };

  const handleRemove = (index: number) => fieldApi.removeValue(index);

  const handleDuplicate = (index: number) => {
    if (canAddMore) fieldApi.insertValue(index + 1, items[index] as never);
  };

  const handleDeleteAll = () => {
    if (confirmDelete) {
      setShowDeleteAllDialog(true);
    } else {
      for (let i = items.length - 1; i >= 0; i--) fieldApi.removeValue(i);
    }
  };

  const totalErrorCount = useNestedErrorCount(
    field.fields as CoreField[],
    fieldApi.name,
  );
  const isEffectivelyRequired =
    isRequired || (typeof field.minItems === "number" && field.minItems >= 1);

  return (
    <>
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDeleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{confirmDeleteCancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                for (let i = items.length - 1; i >= 0; i--)
                  fieldApi.removeValue(i);
                setShowDeleteAllDialog(false);
              }}
            >
              {confirmDeleteActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FieldGroup data-field={fieldApi.name}>
        <Field data-invalid={isInvalid} data-disabled={isDisabled}>
          <FieldSet disabled={isDisabled} className="contents">
            <Card className="py-0 gap-0">
              {/* Header */}
              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between bg-muted/50 border-b gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {label && (
                    <FieldLegend className="text-sm font-semibold truncate mb-0">
                      {label}
                      {isEffectivelyRequired && ui?.asterisk !== false && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FieldLegend>
                  )}
                  {items.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-xs shrink-0"
                    >
                      {items.length}
                    </Badge>
                  )}
                  {showErrorBadge && totalErrorCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 px-1.5 text-xs shrink-0"
                    >
                      {totalErrorCount}
                    </Badge>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-1 shrink-0">
                    {items.length > 0 && canRemoveAny && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={handleDeleteAll}
                        disabled={isDisabled}
                        title="Delete all"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAdd}
                      disabled={!canAddMore || isDisabled}
                      title={typeof addLabel === "string" ? addLabel : "Add"}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4">
                {description && !isInvalid && (
                  <FieldDescription id={descriptionId} className="mb-4">
                    {description}
                  </FieldDescription>
                )}
                {isInvalid && (
                  <FieldError id={errorId} errors={errors} className="mb-4" />
                )}

                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      {emptyMessage}
                    </p>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAdd}
                        disabled={!canAddMore || isDisabled}
                      >
                        <Plus className="size-4 mr-1.5" />
                        {addLabel}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <DndContext
                      id={dndId}
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-3">
                          {items.map((_, index) => (
                            <ArrayItem
                              key={itemIds[index]}
                              id={itemIds[index]!}
                              index={index}
                              field={field}
                              form={form}
                              fieldApiName={fieldApi.name}
                              rowLabel={ui?.rowLabel}
                              rowFallback={labels?.rowFallback}
                              contextData={contextData}
                              isSortable={isSortable}
                              isDisabled={isDisabled}
                              isReadOnly={isReadOnly}
                              canRemove={canRemoveAny}
                              canDuplicate={canAddMore}
                              allowDuplicate={allowDuplicate}
                              onRemove={handleRemove}
                              onDuplicate={handleDuplicate}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-4 border-dashed text-muted-foreground hover:text-foreground"
                        onClick={handleAdd}
                        disabled={!canAddMore || isDisabled}
                      >
                        <Plus className="size-4 mr-2" />
                        {addLabel}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </FieldSet>
        </Field>
      </FieldGroup>
    </>
  );
}

function MinimalArrayField(state: ArrayFieldState) {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  } = state;

  const ui = field.ui as ArrayUi | undefined;
  const labels = ui?.labels;

  const addLabel = labels?.add ?? "Add Item";
  const emptyMessage = labels?.empty ?? "No items added yet.";
  const isSortable = ui?.isSortable !== false;
  const showErrorBadge = ui?.showErrorBadge !== false;
  const allowDuplicate = ui?.allowDuplicate ?? false;

  const items = Array.isArray(fieldApi.state.value) ? fieldApi.state.value : [];

  const canAddMore =
    field.maxItems === undefined || items.length < field.maxItems;
  const canRemoveAny =
    field.minItems === undefined || items.length > field.minItems;

  // Stable DnD IDs keyed by position — sufficient since we reorder in-place
  const dndId = React.useId();
  const itemIds = items.map((_, i) => `${fieldApi.name}-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(active.id as string);
    const to = itemIds.indexOf(over.id as string);
    if (from !== -1 && to !== -1) fieldApi.moveValue(from, to);
  };

  const handleAdd = () => {
    if (!isDisabled && !isReadOnly && canAddMore)
      fieldApi.pushValue(undefined as never);
  };

  const handleRemove = (index: number) => fieldApi.removeValue(index);

  const handleDuplicate = (index: number) => {
    if (canAddMore) fieldApi.insertValue(index + 1, items[index] as never);
  };

  const totalErrorCount = useNestedErrorCount(
    field.fields as CoreField[],
    fieldApi.name,
  );
  const isEffectivelyRequired =
    isRequired || (typeof field.minItems === "number" && field.minItems >= 1);

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        <FieldSet disabled={isDisabled} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {label && (
              <FieldLegend className="text-sm font-semibold mb-0">
                {label}
                {isEffectivelyRequired && ui?.asterisk !== false && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FieldLegend>
            )}
            {items.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {items.length}
              </Badge>
            )}
            {showErrorBadge && totalErrorCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {totalErrorCount}
              </Badge>
            )}
            {!isReadOnly && (
              <div className="ml-auto flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleAdd}
                  disabled={!canAddMore || isDisabled}
                  title={typeof addLabel === "string" ? addLabel : "Add Item"}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {description && !isInvalid && (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          )}
          {isInvalid && <FieldError id={errorId} errors={errors} />}

          {items.length === 0 ? (
            <div className="flex items-center justify-between border border-dashed rounded-lg px-3 py-3">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAdd}
                  disabled={!canAddMore || isDisabled}
                >
                  <Plus className="size-4 mr-1.5" />
                  {addLabel}
                </Button>
              )}
            </div>
          ) : (
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {items.map((_, index) => (
                    <MinimalArrayItem
                      key={itemIds[index]}
                      id={itemIds[index]!}
                      index={index}
                      field={field}
                      form={form}
                      fieldApiName={fieldApi.name}
                      rowLabel={ui?.rowLabel}
                      rowFallback={labels?.rowFallback}
                      contextData={contextData}
                      isSortable={isSortable}
                      isDisabled={isDisabled}
                      isReadOnly={isReadOnly}
                      canRemove={canRemoveAny}
                      canDuplicate={canAddMore}
                      allowDuplicate={allowDuplicate}
                      onRemove={handleRemove}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </FieldSet>
      </Field>
    </FieldGroup>
  );
}

export function ArrayField() {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  } = useDataField<ArrayFieldDef>();

  const state: ArrayFieldState = {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  };

  const ui = field.ui as ArrayUi | undefined;
  const variant = ui?.variant ?? "default";

  if (variant === "minimal") return <MinimalArrayField {...state} />;
  return <DefaultArrayField {...state} />;
}



================================================
FILE: components/buzzform/fields/checkbox-group.tsx
================================================
"use client";

import type { CheckboxGroupField as CheckboxGroupFieldDef } from "@buildnbuzz/form-react";
import { useDataField, useFieldOptions } from "@buildnbuzz/form-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type OptionGroupVariant = "default" | "card";
type OptionGroupDirection = "vertical" | "horizontal";
type OptionGroupColumns = 1 | 2 | 3 | 4 | string | number | undefined;

interface OptionUi {
  description?: string;
}

interface CheckboxGroupUi {
  variant?: OptionGroupVariant;
  direction?: OptionGroupDirection;
  columns?: OptionGroupColumns;
  card?: {
    size?: "sm" | "md" | "lg";
    bordered?: boolean;
  };
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
  asterisk?: boolean;
}

const cardSizeClasses = {
  sm: "p-2.5 sm:p-3",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

function getGridColumnsClass(columns: OptionGroupColumns | undefined) {
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 3) return "sm:grid-cols-2 md:grid-cols-3";
  if (columns === 4) return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  return undefined;
}

function getLayoutClass({
  variant = "default",
  direction = "vertical",
  columns,
}: {
  variant?: OptionGroupVariant;
  direction?: OptionGroupDirection;
  columns?: OptionGroupColumns;
}) {
  const isCard = variant === "card";
  const isHorizontal = direction === "horizontal";

  if (isHorizontal && !columns)
    return "!flex flex-row flex-wrap gap-x-4 gap-y-2";

  const effectiveColumns =
    isCard || isHorizontal ? (columns ?? (isCard ? 2 : undefined)) : undefined;

  if (!effectiveColumns || effectiveColumns === 1) return "flex flex-col gap-2";

  return cn("grid gap-2", getGridColumnsClass(effectiveColumns));
}

export function CheckboxGroupField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleBlur,
  } = useDataField<CheckboxGroupFieldDef>();

  const { options, isLoading } = useFieldOptions(field.options);
  const ui = field.ui as CheckboxGroupUi | undefined;

  const selected = Array.isArray(fieldApi.state.value)
    ? (fieldApi.state.value as string[])
    : [];

  const variant = ui?.variant ?? "default";
  const direction = ui?.direction ?? "vertical";
  const columns = ui?.columns;
  const cardSize = ui?.card?.size ?? "md";
  const cardBordered = ui?.card?.bordered ?? true;
  const isCardVariant = variant === "card";
  const isHorizontal = direction === "horizontal";
  const layoutClass = getLayoutClass({ variant, direction, columns });

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  const handleToggle = (val: string, checked: boolean) => {
    if (isReadOnly) return;
    const maxSelected = field.maxSelected;
    const hasMax = typeof maxSelected === "number";
    if (checked && hasMax && selected.length >= maxSelected) return;

    const next = checked
      ? [...selected, val]
      : selected.filter((v) => v !== val);

    fieldApi.handleChange(next);
    handleBlur();
  };

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <div
        className="flex flex-col gap-2"
        data-invalid={isInvalid}
        data-disabled={isDisabled}
      >
        {label && (
          <FieldLabel className="gap-1 items-baseline">
            {isRequired && ui?.asterisk !== false && (
              <span className="text-destructive">*</span>
            )}
            {label}
          </FieldLabel>
        )}

        {description && !isInvalid && (
          <FieldDescription id={descriptionId} className="-mt-1 mb-1">
            {description}
          </FieldDescription>
        )}

        <div
          className={layoutClass}
          role="group"
          aria-describedby={ariaDescribedBy}
        >
          {isLoading ? (
            <div className="py-2 text-sm text-muted-foreground animate-pulse">
              Loading options...
            </div>
          ) : (
            options.map((opt, i) => {
            const {
              value: val,
              label: optLabel,
              disabled: optDisabled,
              ui: optUi,
            } = opt;
            const optDesc = (optUi as OptionUi | undefined)?.description;
            const checked = selected.includes(val);
            const hasMax = typeof field.maxSelected === "number";
            const atMax = hasMax && selected.length >= field.maxSelected!;
            const isOptDisabled =
              optDisabled || isDisabled || (atMax && !checked);
            const id = `${fieldApi.name}-${i}`;

            if (isCardVariant) {
              const showDescription = optDesc && cardSize !== "sm";
              return (
                <label
                  key={`${val}-${i}`}
                  htmlFor={id}
                  className={cn(
                    "cursor-pointer transition-all duration-150 rounded-lg flex items-start gap-3",
                    cardSizeClasses[cardSize],
                    cardBordered && "border",
                    cardBordered &&
                      checked &&
                      "border-primary ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10",
                    cardBordered &&
                      !checked &&
                      "border-border hover:border-foreground/20 hover:bg-accent/30",
                    !cardBordered && "hover:bg-accent/50",
                    !cardBordered && checked && "bg-accent",
                    isOptDisabled &&
                      "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                  data-checked={checked}
                  data-disabled={isOptDisabled}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(next) => handleToggle(val, next === true)}
                    disabled={isOptDisabled}
                    className="shrink-0 mt-0.5"
                    autoFocus={ui?.autoFocus && i === 0}
                  />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          cardSize === "lg" ? "text-base" : "text-sm",
                        )}
                      >
                        {optLabel}
                      </span>
                    </div>
                    {showDescription && (
                      <span
                        className={cn(
                          "text-muted-foreground line-clamp-2",
                          cardSize === "lg" ? "text-sm" : "text-xs",
                        )}
                      >
                        {optDesc}
                      </span>
                    )}
                  </div>
                </label>
              );
            }

            return (
              <Field
                key={`${val}-${i}`}
                orientation="horizontal"
                className={cn(
                  "items-center gap-2.5 space-y-0",
                  isHorizontal && !columns && "w-auto",
                  isOptDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) => handleToggle(val, next === true)}
                  disabled={isOptDisabled}
                  autoFocus={ui?.autoFocus && i === 0}
                />
                <FieldLabel
                  htmlFor={id}
                  className={cn(
                    "font-normal cursor-pointer m-0 flex items-center gap-2 text-sm",
                    isOptDisabled && "cursor-not-allowed",
                  )}
                >
                  {optLabel}
                </FieldLabel>
              </Field>
            );
            })
          )}
          {options.length === 0 && !isLoading && (
            <div className="py-2 text-sm text-muted-foreground italic">
              No options available
            </div>
          )}
        </div>

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </div>
    </FieldGroup>
  );
}



================================================
FILE: components/buzzform/fields/checkbox.tsx
================================================
"use client";

import type { CheckboxField as CheckboxFieldDef } from "@buildnbuzz/form-react";
import { useDataField } from "@buildnbuzz/form-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface CheckboxUi {
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
  asterisk?: boolean;
}

export function CheckboxField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleChange,
    handleBlur,
  } = useDataField<CheckboxFieldDef>();

  // Delegate to group renderer if hasMany
  if ("hasMany" in field && field.hasMany) {
    return <CheckboxGroupField />;
  }

  // Delegate to tristate renderer if tristate
  if ("tristate" in field && field.tristate) {
    return <TristateCheckboxField />;
  }

  const value = (fieldApi.state.value as boolean) ?? false;
  const ui = field.ui as CheckboxUi | undefined;

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field
        orientation="horizontal"
        data-invalid={isInvalid}
        data-disabled={isDisabled}
      >
        <Checkbox
          id={fieldApi.name}
          checked={value}
          onCheckedChange={(checked) => {
            if (isReadOnly) return;
            handleChange(!!checked);
            handleBlur();
          }}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
          aria-readonly={isReadOnly}
          autoFocus={ui?.autoFocus}
        />

        <FieldContent>
          {label && (
            <FieldLabel
              htmlFor={fieldApi.name}
              className="cursor-pointer m-0 font-normal inline"
            >
              {label}
              {isRequired && ui?.asterisk !== false && (
                <span className="text-destructive">&nbsp;*</span>
              )}
            </FieldLabel>
          )}

          {description && !isInvalid && (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          )}

          {isInvalid && <FieldError id={errorId} errors={errors} />}
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}

import { CheckboxGroupField } from "./checkbox-group";
import { TristateCheckboxField } from "./tristate-checkbox";



================================================
FILE: components/buzzform/fields/collapsible.tsx
================================================
"use client";

import * as React from "react";
import type { CollapsibleField as CollapsibleFieldDef } from "@buildnbuzz/form-react";
import { useLayoutField, useNestedErrorCount } from "@buildnbuzz/form-react";
import { resolveExpr, toDotNotation } from "@buildnbuzz/form-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface CollapsibleUi {
  /** Visual variant. Defaults to `"bordered"`. */
  variant?: "card" | "bordered" | "ghost";
  /** Vertical spacing between nested fields. Defaults to `"md"`. */
  spacing?: "sm" | "md" | "lg";
  /** Show an error-count badge next to the trigger label. Defaults to `true`. */
  showErrorBadge?: boolean;
  /** Description rendered below the trigger label when expanded. */
  description?: string;
  /** Icon rendered before the trigger label. */
  icon?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const spacingClass: Record<NonNullable<CollapsibleUi["spacing"]>, string> = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function TriggerChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
              !open && "-rotate-90",
            )} />
  );
}

function TriggerLabel({
  label,
  icon,
  errorCount,
  showErrorBadge,
  bold,
}: {
  label: React.ReactNode;
  icon?: React.ReactNode;
  errorCount: number;
  showErrorBadge: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      {icon && (
        <span className="shrink-0 text-muted-foreground">{icon}</span>
      )}
      <span
        className={cn(
          "text-sm truncate",
          bold ? "font-semibold" : "font-medium",
        )}
      >
        {label}
      </span>
      {showErrorBadge && errorCount > 0 && (
        <Badge variant="destructive" className="h-5 px-1.5 text-xs">
          {errorCount}
        </Badge>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CollapsibleField
// ---------------------------------------------------------------------------

export function CollapsibleField({ children }: { children?: React.ReactNode }) {
  const { field, fieldPath, formData, contextData, label } =
    useLayoutField<CollapsibleFieldDef>();

  const ui = field.ui as CollapsibleUi | undefined;
  const variant = ui?.variant ?? "bordered";
  const spacing = ui?.spacing ?? "md";
  const showErrorBadge = ui?.showErrorBadge !== false;
  const description = ui?.description;
  const icon = ui?.icon;

  const resolvedCollapsed = resolveExpr(
    field.collapsed,
    { data: formData, context: contextData },
  );
  const [isOpen, setIsOpen] = React.useState(resolvedCollapsed !== true);

  // Read current error count from the store snapshot (re-renders when form state changes)
  const errorCount = useNestedErrorCount(field.fields, toDotNotation(fieldPath));

  const triggerLabelProps = {
    label: label || "Toggle",
    icon,
    errorCount,
    showErrorBadge,
  };

  const descriptionNode = description ? (
    <p className="text-sm text-muted-foreground mb-3">{description}</p>
  ) : null;

  // ── GHOST ──────────────────────────────────────────────────────────────────
  if (variant === "ghost") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className="w-full px-2 py-2 rounded-md flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${typeof label === "string" ? label : "Section"}`}
        >
          <TriggerLabel {...triggerLabelProps} />
          <TriggerChevron open={isOpen} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={cn("pt-4 pl-2", spacingClass[spacing])}>
            {descriptionNode}
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // ── BORDERED ───────────────────────────────────────────────────────────────
  if (variant === "bordered") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border border-dashed border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger
            className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${typeof label === "string" ? label : "Section"}`}
          >
            <TriggerLabel {...triggerLabelProps} />
            <TriggerChevron open={isOpen} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={cn("px-4 pt-2 pb-4", spacingClass[spacing])}>
              {descriptionNode}
              {children}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // ── CARD (default) ─────────────────────────────────────────────────────────
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="py-0 gap-0">
        <CardHeader className="p-0 border-b-0">
          <CollapsibleTrigger
            className={cn(
              "w-full px-4 py-3 flex flex-row items-center justify-between",
              "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
              isOpen && "border-b",
            )}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${typeof label === "string" ? label : "Section"}`}
          >
            <TriggerLabel {...triggerLabelProps} bold />
            <TriggerChevron open={isOpen} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className={cn("px-4 pt-3 pb-4", spacingClass[spacing])}>
            {descriptionNode}
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}



================================================
FILE: components/buzzform/fields/date.tsx
================================================
"use client";

import * as React from "react";
import type { DateField as DateFieldDef } from "@buildnbuzz/form-react";
import { useDataField } from "@buildnbuzz/form-react";
import {
  format,
  parse,
  isValid,
  startOfDay,
  addDays,
  startOfWeek,
  addWeeks,
  setHours,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  getSeconds,
} from "date-fns";
import { Calendar as BaseCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Calendar, X, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface DatePreset {
  label: string;
  value: string | (() => string);
}

interface DateUi {
  /** date-fns display format for the calendar trigger. Defaults to `"MM/dd/yyyy"`. */
  format?: string;
  /** date-fns format for manual text input. Defaults to `format`. */
  inputFormat?: string;
  /** Quick-select presets. `true` uses built-in Today/Tomorrow/Next Week. */
  presets?: boolean | DatePreset[];
  /** Time picker config (only used when `field.withTime` is true). */
  timePicker?:
    | boolean
    | {
        /** Minute interval for the time input step. Defaults to `1`. */
        interval?: number;
        /** Use 24-hour format. Defaults to `true`. */
        use24hr?: boolean;
        /** Include seconds. Defaults to `false`. */
        includeSeconds?: boolean;
      };
  /** Auto-focus the text input on mount. */
  autoFocus?: boolean;
  /** className applied to `<FieldGroup>`. */
  className?: string;
  /** Inline width applied to `<FieldGroup>`. */
  width?: string | number;
  /** Controls required asterisk visibility. */
  asterisk?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PRESETS: DatePreset[] = [
  { label: "Today", value: () => startOfDay(new Date()).toISOString() },
  {
    label: "Tomorrow",
    value: () => startOfDay(addDays(new Date(), 1)).toISOString(),
  },
  {
    label: "Next Week",
    value: () =>
      startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }).toISOString(),
  },
];

function isoToDate(iso: string | undefined | null): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isValid(d) ? d : undefined;
}

function dateToIso(date: Date, withTime: boolean): string {
  if (withTime) return date.toISOString();
  return format(date, "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// DateField
// ---------------------------------------------------------------------------

export function DateField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    placeholder,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleBlur,
  } = useDataField<DateFieldDef>();

  const ui = field.ui as DateUi | undefined;
  const withTime = field.withTime ?? false;
  const displayFormat = ui?.format ?? "MM/dd/yyyy";
  const inputFormat = ui?.inputFormat ?? displayFormat;

  const timePickerConfig = withTime ? (ui?.timePicker ?? true) : undefined;
  const includeSeconds =
    typeof timePickerConfig === "object"
      ? timePickerConfig.includeSeconds === true
      : false;
  const timeInterval =
    typeof timePickerConfig === "object" && timePickerConfig.interval
      ? timePickerConfig.interval
      : 1;
  const timeStep = includeSeconds ? 1 : timeInterval * 60;

  const presetsConfig = ui?.presets;
  const presets: DatePreset[] | null =
    presetsConfig === true
      ? DEFAULT_PRESETS
      : Array.isArray(presetsConfig)
        ? presetsConfig
        : null;

  const minDate = isoToDate(field.minDate);
  const maxDate = isoToDate(field.maxDate);

  const storedValue = fieldApi.state.value as string | undefined;
  const dateValue = isoToDate(storedValue);

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState(() =>
    dateValue ? format(dateValue, inputFormat) : "",
  );
  const [lastSynced, setLastSynced] = React.useState<Date | undefined>(
    dateValue,
  );

  // Keep inputText in sync when value changes externally
  if (dateValue?.getTime() !== lastSynced?.getTime()) {
    setLastSynced(dateValue);
    const formatted = dateValue ? format(dateValue, inputFormat) : "";
    if (formatted !== inputText) setInputText(formatted);
  }

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  const clampDate = (date: Date): Date => {
    if (minDate && date < startOfDay(minDate)) return minDate;
    if (maxDate && date > startOfDay(maxDate)) return maxDate;
    return date;
  };

  const preserveTime = (next: Date): Date => {
    if (!dateValue || !withTime) return next;
    let d = setHours(next, getHours(dateValue));
    d = setMinutes(d, getMinutes(dateValue));
    d = setSeconds(d, getSeconds(dateValue));
    return d;
  };

  const commit = (date: Date) => {
    fieldApi.handleChange(dateToIso(date, withTime));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      fieldApi.handleChange(undefined as unknown as string);
      return;
    }
    commit(clampDate(preserveTime(date)));
    if (!withTime) setIsOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m, s] = e.target.value.split(":").map(Number);
    const base = dateValue ?? new Date();
    let next = setHours(base, h || 0);
    next = setMinutes(next, m || 0);
    next = setSeconds(next, s || 0);
    commit(clampDate(next));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    fieldApi.handleChange(undefined as unknown as string);
  };

  const handlePreset = (preset: DatePreset) => {
    const iso =
      typeof preset.value === "function" ? preset.value() : preset.value;
    const date = isoToDate(iso);
    if (!date) return;
    commit(clampDate(preserveTime(date)));
    if (!withTime) setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputBlur = () => {
    handleBlur();
    if (!inputText.trim()) {
      if (!isRequired) fieldApi.handleChange(undefined as unknown as string);
      return;
    }
    const parsed = parse(inputText, inputFormat, new Date());
    if (isValid(parsed)) {
      const clamped = clampDate(preserveTime(parsed));
      if (minDate && parsed < startOfDay(minDate)) {
        setInputText(dateValue ? format(dateValue, inputFormat) : "");
        return;
      }
      if (maxDate && parsed > startOfDay(maxDate)) {
        setInputText(dateValue ? format(dateValue, inputFormat) : "");
        return;
      }
      commit(clamped);
    } else {
      setInputText(dateValue ? format(dateValue, inputFormat) : "");
    }
  };

  const timeValue = dateValue
    ? includeSeconds
      ? format(dateValue, "HH:mm:ss")
      : format(dateValue, "HH:mm")
    : "";

  const disabledMatchers = [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
  ];

  const calendarPopover = (
    <div className="flex flex-col">
      <BaseCalendar
        mode="single"
        selected={dateValue}
        onSelect={handleDateSelect}
        disabled={disabledMatchers.length ? disabledMatchers : undefined}
        autoFocus={ui?.autoFocus}
        className="w-full"
      />
      {presets && presets.length > 0 && (
        <div className="border-t px-3 py-2 flex flex-wrap gap-1.5">
          {presets.map((preset, i) => (
            <InputGroupButton
              key={i}
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 rounded-full"
              onClick={() => handlePreset(preset)}
            >
              {preset.label}
            </InputGroupButton>
          ))}
        </div>
      )}
    </div>
  );

  const dateInput = (
    <InputGroup>
      <InputGroupAddon align="inline-start" className="pl-3">
        <Popover open={isOpen} onOpenChange={setIsOpen} modal>
          <PopoverTrigger
            className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground"
            disabled={isDisabled || isReadOnly}
          >
            <Calendar className="size-4" />
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-auto min-w-(--anchor-width)"
            align="start"
          >
            {calendarPopover}
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
      <InputGroupInput
        id={fieldApi.name}
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder || inputFormat.toLowerCase()}
        disabled={isDisabled}
        readOnly={isReadOnly}
        autoComplete={field.autoComplete}
        autoFocus={ui?.autoFocus}
        aria-invalid={isInvalid}
        aria-describedby={ariaDescribedBy}
        className="px-2"
      />
      {!isRequired && !isDisabled && !isReadOnly && dateValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            onClick={handleClear}
            title="Clear date"
          >
            <X className="size-3.5 text-muted-foreground" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );

  const content = withTime ? (
    <FieldGroup className="flex-col sm:flex-row gap-3 items-stretch">
      <div className="flex flex-col gap-1.5 flex-1">
        <FieldLabel
          htmlFor={fieldApi.name}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-0"
        >
          Date
        </FieldLabel>
        {dateInput}
      </div>
      <div className="flex flex-col gap-1.5 w-full sm:w-40">
        <FieldLabel
          htmlFor={`${fieldApi.name}-time`}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-0"
        >
          Time
        </FieldLabel>
        <InputGroup
          className={cn(!dateValue && "opacity-50 cursor-not-allowed")}
        >
          <InputGroupAddon
            align="inline-start"
            className="pl-3 pointer-events-none"
          >
            <Clock className="size-4 shrink-0" />
          </InputGroupAddon>
          <InputGroupInput
            id={`${fieldApi.name}-time`}
            type="time"
            step={timeStep}
            value={timeValue}
            onChange={handleTimeChange}
            disabled={isDisabled || !dateValue}
            className="px-2 focus-visible:ring-0 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            placeholder="--:--"
          />
        </InputGroup>
      </div>
    </FieldGroup>
  ) : (
    dateInput
  );

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired && ui?.asterisk !== false ? (
              <span className="text-destructive">*</span>
            ) : null}
          </FieldLabel>
        )}
        <FieldContent>{content}</FieldContent>
        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}



================================================
FILE: components/buzzform/fields/email.tsx
================================================
"use client";

import type { EmailField as EmailFieldDef } from "@buildnbuzz/form-react";
import { useDataField } from "@buildnbuzz/form-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "../components/copy-button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface EmailUi {
  copyable?: boolean;
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
  asterisk?: boolean;
}

export function EmailField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    placeholder,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleChange,
    handleBlur,
  } = useDataField<EmailFieldDef>();

  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as EmailUi | undefined;

  const width = ui?.width;
  const widthStyle = width
    ? {
      width: typeof width === "number" ? `${width}px` : width,
      flex: "0 1 auto",
    }
    : undefined;

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired && ui?.asterisk !== false ? (
              <span className="text-destructive">*</span>
            ) : null}
          </FieldLabel>
        )}

        <FieldContent>
          <div className={cn("relative", ui?.copyable && "flex items-center")}>
            <Input
              id={fieldApi.name}
              name={fieldApi.name}
              type="email"
              inputMode="email"
              autoComplete={field.autoComplete ?? "email"}
              autoFocus={ui?.autoFocus}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-invalid={isInvalid}
              aria-describedby={ariaDescribedBy}
              minLength={field.minLength}
              maxLength={field.maxLength}
              required={isRequired}
              className={cn(ui?.copyable && "pr-9")}
            />
            {ui?.copyable && (
              <CopyButton
                value={value}
                disabled={isDisabled}
                className="absolute right-0 top-0 h-full px-2.5 text-muted-foreground hover:text-foreground"
              />
            )}
          </div>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}



================================================
FILE: components/buzzform/fields/group