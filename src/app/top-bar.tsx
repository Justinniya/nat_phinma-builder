import { House, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "./login/actions";

// The frosted bar across the top of every logged-in screen.
export function TopBar({ email }: { email: string | undefined }) {
  return (
    <header className="glass sticky top-0 z-10 flex items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6 lg:px-10">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <House className="h-5 w-5" aria-hidden />
        </span>
        Rent Ledger
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
        <form action={logout}>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
