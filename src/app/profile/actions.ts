"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The landlord changes the name shown in her sidebar. Row Level Security
// (009) only lets her change her own row.
export async function updateName(formData: FormData) {
  const name = String(formData.get("display_name") ?? "").trim();
  if (!name || name.length > 60) {
    redirect(`/profile?error=${encodeURIComponent("Please enter a name of up to 60 characters.")}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("landlords").update({ display_name: name }).eq("user_id", user.id);
  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/profile?saved=1");
}
