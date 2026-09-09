"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/client";

export async function deleteResident(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("residents")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/residents");
}