"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mama Lita records a payment herself. It counts straight away
// (status "confirmed") — she's the one holding the money.

export async function recordPayment(roomId: string, formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const back = (message: string) => redirect(`/rooms/${roomId}/pay?error=${encodeURIComponent(message)}`);

  const type = text("type");
  const method = text("method");
  const amount = Number(text("amount"));
  const paidOn = text("paid_on");
  const month = text("period"); // "2026-10" from the month picker

  if (!["monthly", "deposit", "advance"].includes(type)) back("Choose what the payment is for.");
  if (!["cash", "gcash"].includes(method)) back("Choose Cash or GCash.");
  if (!Number.isFinite(amount) || amount <= 0) back("Amount must be more than ₱0.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) back("Choose the date the money was paid.");
  if (type === "monthly" && !/^\d{4}-\d{2}$/.test(month)) back("Choose which month this payment is for.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("payments").insert({
    room_id: roomId,
    landlord_id: user.id,
    type,
    period: type === "monthly" ? `${month}-01` : null,
    amount,
    paid_on: paidOn,
    method,
    received_by: text("received_by") || null,
    reference_no: method === "gcash" ? text("reference_no") || null : null,
    status: "confirmed",
  });

  if (error) {
    // 23505 = "already exists" — the database's one-confirmed-payment-per-month rule.
    back(error.code === "23505" ? "This month is already marked as paid for this room." : error.message);
  }

  revalidatePath("/");
  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}?recorded=1`);
}

export async function deletePayment(roomId: string, paymentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) redirect(`/rooms/${roomId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}`);
}
