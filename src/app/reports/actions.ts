"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mama Lita confirms or rejects a boarder's "I paid" report, from the
// Dashboard, the Payments page or a room's history.
// Row Level Security only lets her change payments for her own rooms.

// After confirming she goes back to the page she was on. Only our own
// pages are allowed here, so a tampered value can't send her elsewhere.
function safeReturnPath(returnTo: string) {
  return /^\/(payments|rooms\/[0-9a-f-]{36})?$/.test(returnTo) ? returnTo : "/";
}

function done(returnTo: string, params: string): never {
  revalidatePath("/", "layout");
  redirect(`${safeReturnPath(returnTo)}?${params}`);
}

export async function confirmPayment(paymentId: string, returnTo: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "confirmed", reject_reason: null })
    .eq("id", paymentId)
    .eq("status", "pending");

  if (error) {
    // 23505 = the one-payment-per-month rule (008).
    const message =
      error.code === "23505"
        ? "That month is already marked as paid for this room. Reject this report instead."
        : error.message;
    done(returnTo, `error=${encodeURIComponent(message)}`);
  }
  done(returnTo, "confirmed=1");
}

export async function rejectPayment(paymentId: string, returnTo: string, formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) done(returnTo, `error=${encodeURIComponent("Please give a short reason, so the boarder knows what to fix.")}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "rejected", reject_reason: reason })
    .eq("id", paymentId)
    .eq("status", "pending");

  if (error) done(returnTo, `error=${encodeURIComponent(error.message)}`);
  done(returnTo, "rejected=1");
}
