import { House, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { containerClass } from "@/components/layout";
import { cn } from "@/lib/utils";
import { logout } from "./login/actions";

// The top bar for BOARDERS (and people not linked to a room yet).
// Mama Lita's screens use the sidebar in landlord-shell.tsx instead.
export function TopBar({ email }: { email: string | undefined }) {
  return (
    <header className="sticky top-0 z-10 bg-brand text-white dark:bg-card">
      <div className={cn(containerClass, "flex h-16 items-center justify-between gap-4")}>
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <House className="h-4 w-4" aria-hidden />
          </span>
          Rent Ledger
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden max-w-56 truncate text-sm text-white/60 md:inline">{email}</span>
          <form action={logout}>
            <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
