import { Document, Image, Page, Text, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

import { tw } from "./theme"

type PdfLayoutProps = {
  title: string
  category?: string
  date?: string
  author?: string
  subject?: string
  logoSrc?: string
  children: ReactNode
}

// Coquille commune à tous les documents : header (logo + bandeau),
// bloc titre, zone de contenu libre, footer paginé fixe.
// C'est ce composant qu'on réutilise pour une fiche d'info, une fiche
// contact, un compte-rendu, etc. — seul le contenu change.
export default function PdfLayout({
  title,
  category = "DOCUMENT",
  date,
  author = "Aramons Les Palatines",
  subject,
  logoSrc = "/logo.png",
  children,
}: PdfLayoutProps) {
  const formattedDate =
    date ??
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date())

  return (
    <Document
      title={title}
      author={author}
      subject={subject ?? category}
      creator={author}
    >
      <Page
        size="A4"
        style={tw("bg-white px-12 pt-10 pb-14 font-sans text-gray-800")}
        wrap
      >
        {/* ───────────────── HEADER ───────────────── */}

        <View
          fixed
          style={tw(
            "flex-row items-center justify-between border-b border-gray-200 pb-4",
          )}
        >
          <Image src={logoSrc} style={tw("w-28")} />

          <View style={tw("items-end")}>
            <Text
              style={tw(
                "text-[8px] font-bold tracking-widest text-gray-500",
              )}
            >
              ARAMONS LES PALATINES
            </Text>

            <Text style={tw("text-[8px] text-gray-400 mt-1")}>
              Document officiel
            </Text>
          </View>
        </View>

        {/* ───────────────── TITRE ───────────────── */}

        <View style={tw("mt-8 mb-7")}>
          <Text
            style={tw(
              "text-[9px] font-bold tracking-widest text-brand mb-2",
            )}
          >
            {category.toUpperCase()}
          </Text>

          <Text style={tw("text-3xl font-bold text-gray-900 leading-tight")}>
            {title}
          </Text>

          <View style={tw("flex-row items-center mt-4")}>
            <View style={tw("w-8 h-1 bg-brand mr-3")} />

            <Text style={tw("text-[9px] text-gray-500")}>
              {formattedDate}
            </Text>
          </View>
        </View>

        {/* ───────────────── CONTENU ───────────────── */}

        <View>{children}</View>

        {/* ───────────────── FOOTER ───────────────── */}

        <View
          fixed
          style={tw(
            "absolute bottom-7 left-12 right-12 flex-row items-center justify-between border-t border-gray-200 pt-3",
          )}
        >
          <Text style={tw("text-[8px] text-gray-400")}>{author}</Text>

          <Text
            style={tw("text-[8px] text-gray-400")}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}