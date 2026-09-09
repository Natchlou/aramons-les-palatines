"use client";

import { useRouter } from "next/navigation";
import type { Tables } from "@/database.types";

import ResidentForm from "@/components/resident-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";

type Resident = Tables<"residents">;

type ResidentDialogProps = {
  resident?: Resident;
};

export default function ResidentDialog({
  resident,
}: ResidentDialogProps) {
  const router = useRouter();

  const isEditing = !!resident;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={isEditing ? "outline" : "default"} size={isEditing ? 'icon': 'default'}>
            {isEditing ? <PencilIcon/> : "Ajouter un résident"}
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Modifier le résident"
              : "Ajouter un résident"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du résident."
              : "Ajoutez un nouveau résident."}
          </DialogDescription>
        </DialogHeader>

        <ResidentForm
          resident={resident}
          onSuccess={() => {
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}