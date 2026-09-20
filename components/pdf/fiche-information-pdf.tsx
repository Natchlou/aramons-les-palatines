import MarkdownPDF from "./MarkdownPDF"
import PdfLayout from "./PDFLayout"

type FicheInformationProps = {
  title: string
  content: string
  date?: string
  category?: string
}

export default function FicheInformation({
  title,
  content,
  date,
  category = "FICHE D'INFORMATION",
}: FicheInformationProps) {
  return (
    <PdfLayout title={title} category={category} date={date}>
      <MarkdownPDF content={content} />
    </PdfLayout>
  )
}