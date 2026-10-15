import { House, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "./login/actions";

// The white bar across the top of every logged-in screen.
export function TopBar({ email }: { email: string | undefined }) {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-brand bg-card dark:border-primary">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <House className="h-4 w-4" aria-hidden />
          </span>
          Rent Ledger
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <form action={logout}>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
