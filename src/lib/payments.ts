// Payment types and labels, shared by Mama Lita's and (later) the
// boarder's screens. See docs/SPEC.md -> Data -> payments.

export type PaymentType = "monthly" | "deposit" | "advance";
export type PaymentMethod = "cash" | "gcash";
export type PaymentStatus = "pending" | "confirmed" | "rejected";

export type Payment = {
  id: string;
  room_id: string;
  type: PaymentType;
  period: string | null; // "2026-10-01" for October 2026; empty for deposits/advances
  amount: number;
  paid_on: string; // "2026-10-15"
  method: PaymentMethod;
  received_by: string | null;
  reference_no: string | null;
  status: PaymentStatus;
  reject_reason: string | null;
  created_at: string;
};

export const PAYMENT_COLUMNS =
  "id, room_id, type, period, amount, paid_on, method, received_by, reference_no, status, reject_reason, created_at";

export const typeLabel: Record<PaymentType, string> = {
  monthly: "Monthly",
  deposit: "Deposit",
  advance: "Advance",
};

export const methodLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
};

export const statusLabel: Record<PaymentStatus, { label: string; dot: string }> = {
  pending: { label: "Pending", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", dot: "bg-red-500" },
};
