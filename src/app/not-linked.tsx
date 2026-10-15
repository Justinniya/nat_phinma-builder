import { DoorOpen } from "lucide-react";
import { containerClass } from "@/components/layout";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";

// Shown to someone who is logged in but is neither a landlord nor saved
// as the boarder of any room.
export function NotLinked({ email }: { email: string | undefined }) {
  return (
    <>
      <TopBar email={email} />
      <main className={cn(containerClass, "flex flex-1 items-center justify-center py-16")}>
        <div className="panel flex max-w-md flex-col items-center gap-4 rounded-[var(--radius)] p-10 text-center">
          <DoorOpen className="h-10 w-10 text-primary" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight">Your account isn&apos;t linked to a room yet</h1>
          <p className="text-sm text-muted-foreground">
            Ask your landlord to save <span className="font-medium text-foreground">{email}</span> as the boarder
            email on your room. Then log out and log in again.
          </p>
        </div>
      </main>
    </>
  );
}
