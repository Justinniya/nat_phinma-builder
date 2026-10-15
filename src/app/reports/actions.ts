"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mama Lita confirms or rejects a boarder's "I paid" report.
// Row Level Security only lets her change payments for her own rooms.

function done(params: string) {
  revalidatePath("/", "layout");
  redirect(`/?${params}`);
}

export async function confirmPayment(paymentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "confirmed", reject_reason: null })
    .eq("id", paymentId)
    .eq("status", "pending");

  if (error) {
    // 23505 = the one-confirmed-payment-per-month rule from 005.
    const message =
      error.code === "23505"
        ? "That month is already marked as paid for this room. Reject this report instead."
        : error.message;
    done(`error=${encodeURIComponent(message)}`);
  }
  done("confirmed=1");
}

export async function rejectPayment(paymentId: string, formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) done(`error=${encodeURIComponent("Please give a short reason, so the boarder knows what to fix.")}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "rejected", reject_reason: reason })
    .eq("id", paymentId)
    .eq("status", "pending");

  if (error) done(`error=${encodeURIComponent(error.message)}`);
  done("rejected=1");
}
