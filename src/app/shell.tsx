import { House, LogOut, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logout } from "./login/actions";

// The frame around every logged-in screen, for landlords AND boarders:
//   - laptop: a midnight-blue sidebar (menu, extra panel, who's logged in)
//   - phone:  the menu as a bar across the top
// landlord-shell.tsx and boarder-shell.tsx fill it in.

export type ShellLink = { key: string; href: string; label: string; icon: LucideIcon; badge?: number };

export function Shell({
  links,
  active,
  profile,
  sidePanel,
  children,
}: {
  links: ShellLink[];
  active: string;
  profile: { title: string; subtitle?: string };
  sidePanel?: React.ReactNode; // e.g. the landlord's list of renters
  children: React.ReactNode;
}) {
  const menu = (compact: boolean) =>
    links.map(({ key, href, label, icon: Icon, badge }) => (
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
        {!!badge && (
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand">{badge}</span>
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

  // Initials for the round avatar, e.g. "Juan" -> "J".
  const initial = profile.title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex w-full flex-1">
      {/* Laptop: sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-brand px-4 py-5 dark:border-r dark:border-border dark:bg-card lg:flex">
        <div className="px-2">{logo}</div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
          {menu(false)}
        </nav>

        {sidePanel && <div className="mt-8 min-h-0 flex-1 overflow-y-auto">{sidePanel}</div>}

        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{profile.title}</p>
              {profile.subtitle && <p className="truncate text-xs text-white/55">{profile.subtitle}</p>}
            </div>
          </div>
          {logoutButton}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Phone: logo, who's logged in, log out — then the menu */}
        <header className="sticky top-0 z-20 flex flex-col gap-2 bg-brand px-4 pb-2 pt-3 dark:bg-card lg:hidden">
          <div className="flex items-center justify-between gap-3">
            {logo}
            {logoutButton}
          </div>
          <p className="truncate px-1 text-xs text-white/70">
            {profile.title}
            {profile.subtitle ? ` · ${profile.subtitle}` : ""}
          </p>
          <nav className="-mx-1 flex gap-1 overflow-x-auto" aria-label="Main">
            {menu(true)}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
