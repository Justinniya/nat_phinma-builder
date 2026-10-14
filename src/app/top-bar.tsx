import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "./login/actions";

// The frosted bar across the top of every logged-in screen.
export function TopBar({ email }: { email: string | undefined }) {
  return (
    <header className="glass sticky top-0 z-10 flex items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6 lg:px-10">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Rent Ledger
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
        <form action={logout}>
          <Button variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
