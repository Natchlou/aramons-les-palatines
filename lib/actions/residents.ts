// lib/actions/residents.ts
"use server";

import { createClient } from "@/lib/server";
import { ResidentSchema } from "@/lib/schema";
import { InferType } from "@buildnbuzz/form-core";

type ResidentValues = InferType<typeof ResidentSchema.fields>;

export async function upsertResident(data: ResidentValues, id?: string) {
  const supabase = await createClient();

  if (id) {
    return supabase.from("residents").update(data).eq("id", id);
  }

  return supabase.from("residents").insert(data);
}
