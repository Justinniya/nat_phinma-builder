// Room types and the "who is due when" rules from docs/SPEC.md.

export type Room = {
  id: string;
  label: string;
  boarder_first_name: string | null;
  boarder_email: string | null;
  due_day: number;
  monthly_amount: number;
  note: string | null;
  created_at: string;
};

export const ROOM_COLUMNS =
  "id, label, boarder_first_name, boarder_email, due_day, monthly_amount, note, created_at";

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

function addMonths(date: SimpleDate, months: number): SimpleDate {
  const index = date.year * 12 + (date.month - 1) + months;
  return { year: Math.floor(index / 12), month: (index % 12) + 1, day: 1 };
}

function isOnOrBefore(a: SimpleDate, b: SimpleDate) {
  return isoDate(a) <= isoDate(b); // "2026-09-05" <= "2026-10-01" compares correctly as text
}

export type RoomDue = {
  status: RoomStatus;
  due: SimpleDate; // the due date that matters right now
  period: string; // the month that should be paid next, e.g. "2026-10-01"
};

// Works out where a room stands, from the months that have a CONFIRMED
// monthly payment (paidPeriods, e.g. {"2026-09-01", "2026-10-01"}).
//
// - Last month unpaid -> Overdue, even after the 1st of a new month.
//   (Only if the room already existed by last month's due date, so a
//   room added this month doesn't start out overdue.)
// - This month paid -> Paid, and the date shown is next month's.
// - Otherwise -> Overdue / Due soon (within 5 days) / Upcoming.
export function roomDue(room: Room, today: SimpleDate, paidPeriods: Set<string>): RoomDue {
  const lastMonth = addMonths(today, -1);
  const nextMonth = addMonths(today, 1);
  const thisPeriod = periodOf(today);
  const lastPeriod = periodOf(lastMonth);
  const thisDue = dueDateInMonth(room.due_day, today.year, today.month);
  const lastDue = dueDateInMonth(room.due_day, lastMonth.year, lastMonth.month);

  if (!room.boarder_email) return { status: "vacant", due: thisDue, period: thisPeriod };

  const created = parseDate(room.created_at.slice(0, 10));
  if (isOnOrBefore(created, lastDue) && !paidPeriods.has(lastPeriod)) {
    return { status: "overdue", due: lastDue, period: lastPeriod };
  }

  if (paidPeriods.has(thisPeriod)) {
    return {
      status: "paid",
      due: dueDateInMonth(room.due_day, nextMonth.year, nextMonth.month),
      period: periodOf(nextMonth),
    };
  }

  const daysLeft = thisDue.day - today.day;
  const status = daysLeft < 0 ? "overdue" : daysLeft <= 5 ? "due_soon" : "upcoming";
  return { status, due: thisDue, period: thisPeriod };
}

// The months with a confirmed monthly payment, for roomDue().
export function confirmedPeriods(payments: { type: string; status: string; period: string | null }[]) {
  return new Set(
    payments.filter((p) => p.type === "monthly" && p.status === "confirmed" && p.period).map((p) => p.period!),
  );
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

// How each room status looks:
//   dot    — small coloured dot (counters, filter tabs)
//   text   — coloured text (due dates)
//   badge  — tinted pill, easy to read at a glance
//   stripe — the coloured bar along the top of a room card
export const roomStatusStyle: Record<RoomStatus, { label: string; dot: string; text: string; badge: string; stripe: string }> = {
  paid: {
    label: "Paid",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    stripe: "bg-emerald-500",
  },
  overdue: {
    label: "Overdue",
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    badge: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    stripe: "bg-red-500",
  },
  due_soon: {
    label: "Due soon",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    badge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    stripe: "bg-amber-400",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    badge: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
    stripe: "bg-blue-500",
  },
  vacant: {
    label: "Vacant",
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    badge: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
    stripe: "bg-slate-300 dark:bg-slate-700",
  },
};

export function ordinal(n: number) {
  if (n >= 11 && n <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

// Last month, as stored in payments.period: "2026-09-01".
export function previousPeriod(today: SimpleDate) {
  return periodOf(addMonths(today, -1));
}
