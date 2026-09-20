"use client";

import { DocumentProps } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const PDFPreview = dynamic(
  () => import("@/components/pdf/PDFPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        Chargement du PDF...
      </div>
    ),
  },
);

type PDFPreviewClientProps = {
  children: ReactElement<DocumentProps>;
};

export default function PDFPreviewClient({
  children,
}: PDFPreviewClientProps) {
  return <PDFPreview>{children}</PDFPreview>;
}