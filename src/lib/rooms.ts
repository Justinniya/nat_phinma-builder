// Room types and the "who is due when" rules from docs/SPEC.md.

export type Room = {
  id: string;
  label: string;
  boarder_first_name: string | null;
  boarder_email: string | null;
  due_day: number;
  monthly_amount: number;
  note: string | null;
};

export type RoomStatus = "vacant" | "paid" | "overdue" | "due_soon" | "upcoming";

export type SimpleDate = { year: number; month: number; day: number }; // month is 1–12

// "Today" in the Philippines, whatever timezone the server runs in.
// (Vercel's servers run on UTC, which is 8 hours behind Manila.)
export function todayInManila(): SimpleDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function daysInMonth(year: number, month: number) {
  // Day 0 of the next month is the last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// The room's due date in the given month. A due day of 29–31 falls back
// to the last day of shorter months (e.g. due day 31 -> Feb 28).
export function dueDateInMonth(dueDay: number, year: number, month: number): SimpleDate {
  return { year, month, day: Math.min(dueDay, daysInMonth(year, month)) };
}

// The month a payment is for, as stored in payments.period: "2026-10-01".
export function periodOf(date: SimpleDate) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-01`;
}

// "2026-10-01" -> "October 2026"
export function formatPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// SimpleDate -> "2026-10-15", the format the database and date inputs use.
export function isoDate(date: SimpleDate) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

// A date as stored in the database ("2026-10-15") -> SimpleDate.
export function parseDate(value: string): SimpleDate {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

// paidThisMonth: is there a CONFIRMED monthly payment for this month?
export function roomStatus(room: Room, today: SimpleDate, paidThisMonth = false): RoomStatus {
  if (!room.boarder_email) return "vacant";
  if (paidThisMonth) return "paid";
  const due = dueDateInMonth(room.due_day, today.year, today.month);
  const daysLeft = due.day - today.day;
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 5) return "due_soon";
  return "upcoming";
}

export function formatDate(date: SimpleDate) {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatPesos(amount: number) {
  return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// How each room status looks. Colours are kept to small dots so the page
// stays calm and blue stays the main colour.
export const roomStatusStyle: Record<RoomStatus, { label: string; dot: string; text: string }> = {
  paid: { label: "Paid", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  overdue: { label: "Overdue", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
  due_soon: { label: "Due soon", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  upcoming: { label: "Upcoming", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  vacant: { label: "Vacant", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
};

export function ordinal(n: number) {
  if (n >= 11 && n <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

// The due date that matters right now: this month's, or — once this
// month is paid — next month's.
export function dueDateToShow(room: Room, today: SimpleDate, paidThisMonth: boolean): SimpleDate {
  if (!paidThisMonth) return dueDateInMonth(room.due_day, today.year, today.month);
  const next = today.month === 12 ? { year: today.year + 1, month: 1 } : { year: today.year, month: today.month + 1 };
  return dueDateInMonth(room.due_day, next.year, next.month);
}
