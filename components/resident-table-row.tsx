"use client";

import { useTransition } from "react";
import Link from "next/link";
import { EyeIcon, TrashIcon } from "lucide-react";

import ResidentDialog from "@/components/resident-dialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Database } from "@/database.types";
import { deleteResident } from "@/app/admin/residents/actions";
import { toast } from "./ui/toast";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

export default function ResidentTableRow({
  resident,
}: {
  resident: ResidentRow;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer ${resident.first_name} ${resident.last_name} ? Cette action est irréversible.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteResident(resident.id);
        toast.add({type: 'success', title:'Suppression', description: 'Le résident à bien été supprimé'})
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le résident.",
        );
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {resident.last_name}
      </TableCell>

      <TableCell>
        {resident.first_name}
      </TableCell>

      <TableCell>
        Apt. {resident.room}
      </TableCell>

      <TableCell>
        Bât. {resident.building}
      </TableCell>

      <TableCell className="flex items-center justify-end gap-2">
        <ResidentDialog resident={resident} />

        <Link href={`/admin/residents/${resident.id}`}>
          <Button size={'icon'} variant={'outline'}>
            <EyeIcon />
          </Button>
        </Link>

        <Button
          size={'icon'}
          variant={'destructive'}
          onClick={handleDelete}
          disabled={isPending}
        >
          <TrashIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}