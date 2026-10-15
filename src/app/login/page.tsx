import { BadgeCheck, CalendarCheck, History, House } from "lucide-react";
import { Notice } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

// The landing page: exactly one screen, no scrolling.
// Midnight-blue background; the message on the left, a floating login
// card on the right. On phones: just the headline and the card.

const points = [
  { icon: CalendarCheck, text: "Every room's status on one screen" },
  { icon: BadgeCheck, text: "Boarders report, the landlord confirms" },
  { icon: History, text: "Any month found in seconds" },
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message } = await searchParams;

  return (
    <main className="relative isolate flex min-h-svh w-full flex-1 items-center overflow-hidden bg-brand text-white">
      {/* Decoration only: a faint grid and two soft glows. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div aria-hidden className="absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Left: the message */}
        <section className="flex flex-col gap-6 lg:gap-8">
          <div className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <House className="h-4 w-4" aria-hidden />
            </span>
            Rent Ledger
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Know who has paid,
              <br />
              <span className="text-blue-300">at a glance.</span>
            </h1>
            <p className="hidden max-w-md text-white/70 sm:block">
              A simple rent ledger for boarding houses, built for the landlord&apos;s phone.
            </p>
          </div>

          <ul className="hidden flex-col gap-3 sm:flex">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>

        {/* Right: floating login card */}
        <section className="w-full max-w-md justify-self-center rounded-2xl bg-card p-7 text-card-foreground shadow-2xl ring-1 ring-black/5 sm:p-8 lg:justify-self-end">
          <div className="mb-6 flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Log in, or enter an email and password and choose Sign up.</p>
          </div>

          <form className="flex flex-col gap-4">
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

            <div className="mt-2 flex flex-col gap-2.5">
              <Button formAction={login} size="lg" className="bg-brand text-brand-foreground dark:bg-primary">
                Log in
              </Button>
              <Button formAction={signup} variant="outline" size="lg">
                Sign up
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
