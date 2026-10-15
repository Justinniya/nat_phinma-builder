import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { roomStatusStyle, type RoomStatus } from "@/lib/rooms";
import { statusLabel, type PaymentStatus } from "@/lib/payments";

// Shared layout pieces, so every screen lines up the same way:
//   <PageContainer>          same width and side padding everywhere
//     <PageHeader />         back link, title, description, buttons
//     <Section> ... </Section>
//   </PageContainer>

// The one content column used by every logged-in screen (and the top bar).
export const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className={cn(containerClass, "flex flex-1 flex-col gap-8 py-8")}>{children}</main>;
}

export function PageHeader({
  back,
  title,
  description,
  badge,
  actions,
}: {
  back?: { href: string; label: string };
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6">
      {back && (
        <Link
          href={back.href}
          className="flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {badge}
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

// A titled block of the page, e.g. "Overview" or "Rooms".
export function Section({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Main content on the left (2/3), side panels on the right (1/3).
// On phones the two stack, main content first.
export function TwoColumn({ main, side }: { main: React.ReactNode; side: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
      <div className="flex flex-col gap-6 lg:col-span-2">{main}</div>
      <aside className="flex flex-col gap-6">{side}</aside>
    </div>
  );
}

const noticeTone = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  error: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  info: "border-border bg-secondary text-foreground",
};

// A message box: "Payment saved.", an error, a warning…
export function Notice({ tone, children }: { tone: keyof typeof noticeTone; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg border p-3 text-sm", noticeTone[tone])}>
      {children}
    </p>
  );
}

function Badge({ dot, children, className }: { dot: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {children}
    </span>
  );
}

export function RoomStatusBadge({ status, className }: { status: RoomStatus; className?: string }) {
  const style = roomStatusStyle[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        style.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge dot={statusLabel[status].dot}>{statusLabel[status].label}</Badge>;
}

// A label/value row for details lists (Boarder, Due, Amount…).
export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
