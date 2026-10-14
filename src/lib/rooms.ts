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

export type RoomStatus = "vacant" | "overdue" | "due_soon" | "upcoming";

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

export function roomStatus(room: Room, today: SimpleDate): RoomStatus {
  if (!room.boarder_email) return "vacant";
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
