"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { deleteResident } from "@/app/(admin)/admin/residents/actions";
import { Database } from "@/database.types";
import ResidentForm from "./form";

type ResidentRow = Database['public']['Tables']['residents']['Row']

interface ResidentActionsProps {
  resident: ResidentRow;
}

export function ResidentActions({ resident }: ResidentActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Supprimer ${resident.first_name} ${resident.last_name} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteResident(resident.id);
        toast.add({ 
          type: 'success', 
          title: 'Suppression', 
          description: `${resident.first_name} ${resident.last_name} a bien été supprimé.` 
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inattendue.";
        toast.add({ 
          type: 'error', 
          title: 'Erreur', 
          description: message 
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <ResidentForm resident={resident} />

      <Link href={`/admin/residents/${resident.id}`}>
        <Button size="icon" variant="outline" disabled={isPending}>
          <EyeIcon className="h-4 w-4" />
        </Button>
      </Link>

      <Button
        size="icon"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Supprimer le résident"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}