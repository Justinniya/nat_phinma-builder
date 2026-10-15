import { BadgeCheck, CalendarCheck, History, House } from "lucide-react";
import { BoardingHouseIllustration } from "@/components/illustrations";
import { Notice } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

// The landing page: one screen. What the app is (left), log in (right).
// Each point is said once.

const points = [
  { icon: CalendarCheck, text: "Every room's status on one screen" },
  { icon: BadgeCheck, text: "Boarders report payments, the landlord confirms" },
  { icon: History, text: "Any month's payment found in seconds" },
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message } = await searchParams;

  return (
    <main className="grid w-full flex-1 grid-cols-1 lg:grid-cols-2">
      {/* Left: what Rent Ledger is */}
      <section className="flex flex-col gap-10 bg-brand px-6 py-10 text-brand-foreground sm:px-12 lg:justify-center lg:px-16">
        <div className="flex items-center gap-2.5 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <House className="h-4 w-4" aria-hidden />
          </span>
          Rent Ledger
        </div>

        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Know who has paid — at a glance.</h1>
          <p className="text-white/75">A simple rent ledger for boarding houses.</p>
        </div>

        <ul className="flex flex-col gap-3">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-white/90">
              <Icon className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
              {text}
            </li>
          ))}
        </ul>

        <BoardingHouseIllustration className="hidden w-full max-w-xs lg:block" />
      </section>

      {/* Right: log in */}
      <section className="flex items-center justify-center bg-card px-6 py-12 sm:px-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Log in</h2>
            <p className="text-sm text-muted-foreground">New here? Enter your email and a password, then choose Sign up.</p>
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

            {typeof error === "string" && <Notice tone="error">{error}</Notice>}
            {typeof message === "string" && <Notice tone="info">{message}</Notice>}

            <div className="flex flex-col gap-3">
              <Button formAction={login} size="lg" className="bg-brand text-brand-foreground dark:bg-primary">
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
