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