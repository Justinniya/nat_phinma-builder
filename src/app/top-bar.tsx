import { House, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { containerClass } from "@/components/layout";
import { cn } from "@/lib/utils";
import { logout } from "./login/actions";

const landlordNav = [
  { key: "dashboard", href: "/", label: "Dashboard" },
  { key: "rooms", href: "/rooms", label: "Rooms" },
] as const;

// The white bar across the top of every logged-in screen. Its contents
// line up with the page content below (same container).
// `active` is only passed on Mama Lita's screens, which shows her menu.
export function TopBar({
  email,
  active,
}: {
  email: string | undefined;
  active?: (typeof landlordNav)[number]["key"];
}) {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-brand bg-card dark:border-primary">
      <div className={cn(containerClass, "flex h-16 items-center justify-between gap-4")}>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground dark:bg-primary">
              <House className="h-4 w-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">Rent Ledger</span>
          </Link>
          {active && (
            <nav className="flex items-center gap-1">
              {landlordNav.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={item.key === active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    item.key === active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden max-w-56 truncate text-sm text-muted-foreground md:inline">{email}</span>
          <form action={logout}>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
