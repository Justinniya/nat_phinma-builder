import { BedDouble, House, LayoutDashboard, LogOut, Wallet } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { logout } from "./login/actions";

// The frame around every one of Mama Lita's screens:
//   - laptop: a midnight-blue sidebar on the left with the menu
//   - phone:  the same menu as a bar across the top
// Boarders don't get this — they only have one screen (their room).

const nav = [
  { key: "dashboard", href: "/", label: "Dashboard", icon: LayoutDashboard },
  { key: "rooms", href: "/rooms", label: "Rooms", icon: BedDouble },
  { key: "payments", href: "/payments", label: "Payments", icon: Wallet },
] as const;

export type LandlordSection = (typeof nav)[number]["key"];

export async function LandlordShell({
  email,
  active,
  children,
}: {
  email: string | undefined;
  active: LandlordSection;
  children: React.ReactNode;
}) {
  // How many boarder reports are waiting — shown next to "Payments".
  const supabase = await createClient();
  const { count } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const waiting = count ?? 0;

  const links = (compact: boolean) =>
    nav.map(({ key, href, label, icon: Icon }) => (
      <Link
        key={key}
        href={href}
        aria-current={key === active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
          compact ? "shrink-0 px-3 py-2" : "px-3 py-2.5",
          key === active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {label}
        {key === "payments" && waiting > 0 && (
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand">{waiting}</span>
        )}
      </Link>
    ));

  const logo = (
    <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
        <House className="h-4 w-4" aria-hidden />
      </span>
      Rent Ledger
    </Link>
  );

  const logoutButton = (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </button>
    </form>
  );

  return (
    <div className="flex w-full flex-1">
      {/* Laptop: sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-brand px-4 py-5 dark:bg-card dark:border-r dark:border-border lg:flex">
        <div className="px-2">{logo}</div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
          {links(false)}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
          <p className="truncate px-3 text-xs text-white/50">{email}</p>
          {logoutButton}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Phone: the same menu as a bar across the top */}
        <header className="sticky top-0 z-20 flex flex-col gap-2 bg-brand px-4 pb-2 pt-3 dark:bg-card lg:hidden">
          <div className="flex items-center justify-between">
            {logo}
            {logoutButton}
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto" aria-label="Main">
            {links(true)}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
