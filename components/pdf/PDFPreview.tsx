"use client";

import {
  PDFViewer,
} from "@react-pdf/renderer";

import type {
  DocumentProps,
} from "@react-pdf/renderer";

import type {
  ReactElement,
} from "react";

type PDFPreviewProps = {
  children: ReactElement<DocumentProps>;
};

export default function PDFPreview({
  children,
}: PDFPreviewProps) {
  return (
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar
    >
      {children}
    </PDFViewer>
  );
}