"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export async function deleteResident(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("residents")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/residents");
}