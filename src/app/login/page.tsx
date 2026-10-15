import { Banknote, CalendarDays, House, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BoardingHouseIllustration } from "@/components/illustrations";
import { login, signup } from "./actions";

const highlights = [
  { icon: CalendarDays, text: "See who has paid, who is due soon and who is overdue — on one screen." },
  { icon: Banknote, text: "Record cash or GCash payments in a few taps." },
  { icon: NotebookPen, text: "Look up any room's history without flipping through a notebook." },
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message } = await searchParams;

  return (
    <main className="grid w-full flex-1 grid-cols-1 lg:grid-cols-2">
      {/* Left: blue brand panel. On phones it becomes a short header. */}
      <section className="flex flex-col justify-between gap-8 bg-primary px-6 py-8 text-primary-foreground sm:px-10 lg:px-16 lg:py-12">
        <div className="flex items-center gap-2.5 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <House className="h-4 w-4" aria-hidden />
          </span>
          Rent Ledger
        </div>

        <div className="hidden flex-col gap-8 lg:flex">
          <BoardingHouseIllustration className="w-full max-w-sm" />
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">
              Every rent payment, in one place.
            </h2>
            <p className="max-w-md text-white/80">
              No more cross-checking the notebook, GCash screenshots and Messenger chats.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="hidden text-sm text-white/60 lg:block">For boarding house landlords and boarders.</p>
      </section>

      {/* Right: the login form. */}
      <section className="flex items-center justify-center bg-card px-6 py-12 sm:px-10">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Log in to your account</h1>
            <p className="text-sm text-muted-foreground">
              New here? Enter your email and a password, then choose Sign up.
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={6}
                required
              />
            </div>

            {typeof error === "string" && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                {error}
              </p>
            )}
            {typeof message === "string" && (
              <p className="rounded-lg border border-border bg-secondary p-3 text-sm">{message}</p>
            )}

            <div className="flex flex-col gap-3">
              <Button formAction={login} size="lg">
                Log in
              </Button>
              <Button formAction={signup} variant="outline" size="lg">
                Sign up
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
