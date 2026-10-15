"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findMyRoom } from "@/lib/my-room";
import { createClient } from "@/lib/supabase/server";

// A boarder reports "I paid". It's saved as PENDING: it only counts once
// the landlord confirms it. The database rules (006) also enforce this —
// a boarder can't save a payment as confirmed even by changing this code.

export async function reportPayment(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const back = (message: string) => redirect(`/i-paid?error=${encodeURIComponent(message)}`);

  const method = text("method");
  const amount = Number(text("amount"));
  const paidOn = text("paid_on");
  const month = text("period"); // "2026-10"

  if (!["cash", "gcash"].includes(method)) back("Choose Cash or GCash.");
  if (!Number.isFinite(amount) || amount <= 0) back("Amount must be more than ₱0.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) back("Choose the date you paid.");
  if (!/^\d{4}-\d{2}$/.test(month)) back("Choose which month this payment is for.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const room = await findMyRoom(supabase, user.email);
  if (!room) redirect("/");

  const { error } = await supabase.from("payments").insert({
    room_id: room.id,
    landlord_id: room.landlord_id,
    type: "monthly",
    period: `${month}-01`,
    amount,
    paid_on: paidOn,
    method,
    received_by: text("received_by") || null,
    reference_no: method === "gcash" ? text("reference_no") || null : null,
    status: "pending",
  });
  if (error) {
    // 23505 = "already exists" — the one-report-per-month rule (008).
    back(
      error.code === "23505"
        ? "You already sent a payment for that month, or it is already paid. Wait for your landlord to confirm it."
        : error.message,
    );
  }

  revalidatePath("/");
  redirect("/?reported=1");
}
