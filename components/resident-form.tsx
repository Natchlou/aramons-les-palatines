"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/client";
import { Tables } from "@/database.types";

const formSchema = z.object({
  first_name: z
    .string()
    .min(1, "Le prénom est obligatoire.")
    .max(100, "Le prénom est trop long."),

  last_name: z
    .string()
    .min(1, "Le nom est obligatoire.")
    .max(100, "Le nom est trop long."),

  room: z
    .string()
    .min(1, "L'appartement est obligatoire.")
    .max(20, "L'appartement est trop long."),

  building: z
    .string()
    .min(1, "Veuillez sélectionner un bâtiment."),
});

type FormValues = z.infer<typeof formSchema>;

type Resident = Tables<"residents">;

type ResidentFormProps = {
  resident?: Resident;
  onSuccess?: (resident: Resident) => void;
};

const supabase = createClient()

export default function ResidentForm({
  resident,
  onSuccess,
}: ResidentFormProps) {
  const isEditing = !!resident;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      first_name: resident?.first_name ?? "",
      last_name: resident?.last_name ?? "",
      room: resident?.room ?? "",
      building: resident?.building ?? "",
    },
  });

  const building = useWatch({
    control: form.control,
    name: "building",
  });

  async function onSubmit(values: FormValues) {
    if (isEditing) {
      const { data, error } = await supabase
        .from("residents")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          room: values.room,
          building: values.building,
        })
        .eq("id", resident.id)
        .select()
        .single();

      if (error) {
        form.setError("root", {
          message: error.message,
        });

        return;
      }

      onSuccess?.(data);

      return;
    }

    const { data, error } = await supabase
      .from("residents")
      .insert({
        first_name: values.first_name,
        last_name: values.last_name,
        room: values.room,
        building: values.building,
      })
      .select()
      .single();

    if (error) {
      form.setError("root", {
        message: error.message,
      });

      return;
    }

    onSuccess?.(data);

    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        {/* Prénom */}
        <Field>
          <FieldLabel htmlFor="first_name">
            Prénom
          </FieldLabel>

          <Input
            id="first_name"
            placeholder="Jean"
            {...form.register("first_name")}
          />

          {form.formState.errors.first_name && (
            <FieldError>
              {form.formState.errors.first_name.message}
            </FieldError>
          )}
        </Field>

        {/* Nom */}
        <Field>
          <FieldLabel htmlFor="last_name">
            Nom
          </FieldLabel>

          <Input
            id="last_name"
            placeholder="Dupont"
            {...form.register("last_name")}
          />

          {form.formState.errors.last_name && (
            <FieldError>
              {form.formState.errors.last_name.message}
            </FieldError>
          )}
        </Field>

        {/* Appartement */}
        <Field>
          <FieldLabel htmlFor="room">
            Appartement
          </FieldLabel>

          <Input
            id="room"
            placeholder="101"
            {...form.register("room")}
          />

          {form.formState.errors.room && (
            <FieldError>
              {form.formState.errors.room.message}
            </FieldError>
          )}
        </Field>

        {/* Bâtiment */}
        <Field>
          <FieldLabel>
            Bâtiment
          </FieldLabel>

          <Select
            value={building}
            onValueChange={(value) => {
              if (!value) return;

              form.setValue("building", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un bâtiment" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="1">
                Bâtiment 1
              </SelectItem>

              <SelectItem value="2">
                Bâtiment 2
              </SelectItem>
            </SelectContent>
          </Select>

          {form.formState.errors.building && (
            <FieldError>
              {form.formState.errors.building.message}
            </FieldError>
          )}
        </Field>

        {/* Erreur Supabase */}
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
              />
            }
          >
            Annuler
          </DialogClose>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Enregistrement..."
              : isEditing
                ? "Modifier"
                : "Ajouter"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
}