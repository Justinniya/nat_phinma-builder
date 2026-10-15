import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Camera,
  ChevronDown,
  History,
  House,
  Lock,
  Send,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

// The landing page for logged-out visitors: what the app does, then the
// log-in form at the bottom (#login).

type Feature = { icon: LucideIcon; title: string; text: string };

const audiences = {
  landlords: {
    tab: "For landlords",
    heading: "Run your boarding house with less stress",
    features: [
      { icon: CalendarCheck, title: "Status at a glance", text: "Every room marked paid, due soon or overdue." },
      { icon: BadgeCheck, title: "Confirm payments", text: "Boarders report a payment; you confirm when the money is in your hand." },
      { icon: History, title: "Payment history", text: "Answer “did I pay in August?” in seconds." },
      { icon: Camera, title: "Room photos", text: "Keep photos of each room in one place." },
    ] satisfies Feature[],
  },
  boarders: {
    tab: "For boarders",
    heading: "Know exactly where you stand",
    features: [
      { icon: CalendarDays, title: "Your due date", text: "See when rent is due and how much." },
      { icon: Send, title: "Report “I paid”", text: "Paid in cash or GCash? Let your landlord know in a few taps." },
      { icon: History, title: "Your history", text: "Every payment, with your landlord's confirmation." },
      { icon: Lock, title: "Private to you", text: "You only ever see your own room." },
    ] satisfies Feature[],
  },
};

type Audience = keyof typeof audiences;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message, for: forParam } = await searchParams;
  const audience: Audience = forParam === "boarders" ? "boarders" : "landlords";
  const current = audiences[audience];

  return (
    <div className="flex w-full flex-1 flex-col bg-card">
      {/* 1. Slim header with a thin brand line underneath */}
      <header className="border-b-2 border-brand bg-card">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-2 font-semibold text-brand dark:text-foreground">
            <House className="h-5 w-5" aria-hidden />
            Rent Ledger
          </span>
          <Link
            href="#login"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "border-brand text-brand hover:bg-brand hover:text-brand-foreground dark:border-primary dark:text-primary",
            })}
          >
            Log in
          </Link>
        </div>
      </header>

      {/* 2. Hero with a V-shaped bottom edge. If public/images/hero.jpg
             exists it shows behind a dark tint; otherwise it's plain
             midnight blue. */}
      <section
        className="relative bg-brand bg-cover bg-center text-brand-foreground [clip-path:polygon(0_0,100%_0,100%_82%,50%_100%,0_82%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(25, 25, 112, 0.72), rgba(25, 25, 112, 0.88)), url('/images/hero.jpg')",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-32 pt-20 text-center sm:pb-40 sm:pt-28">
          <h1 className="text-3xl font-light tracking-tight sm:text-5xl">
            Know who has paid — at a glance
          </h1>
          <p className="max-w-xl text-white/80">
            The notebook, the GCash screenshots and the Messenger chats, replaced by one simple rent ledger.
          </p>
          <Link href="#login" className={buttonVariants({ size: "lg", className: "bg-primary px-8" })}>
            Get started
          </Link>
          <p className="text-xs text-white/60">Free for boarding houses. Works on any phone.</p>
        </div>
      </section>

      {/* 3. Tabs: who is this for? (Plain links, so no JavaScript needed.) */}
      <nav className="mx-auto -mt-4 flex w-full max-w-4xl justify-center gap-8 border-b border-border px-4" id="features">
        {(Object.keys(audiences) as Audience[]).map((key) => (
          <Link
            key={key}
            href={`?for=${key}#features`}
            scroll={false}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              key === audience
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {audiences[key].tab}
          </Link>
        ))}
      </nav>

      {/* 4. Heading with a short gold accent line, then 5. four features */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-center text-2xl font-light tracking-tight sm:text-4xl">{current.heading}</h2>
          <span className="h-0.5 w-16 bg-gold" aria-hidden />
        </div>

        <ul className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {current.features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center gap-3 text-center">
              <ChevronDown className="h-5 w-5 text-muted-foreground/50" aria-hidden />
              <Icon className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="font-semibold text-primary">{title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Log-in form */}
      <section id="login" className="border-t border-border bg-page px-4 py-16 sm:px-6">
        <div className="panel mx-auto flex w-full max-w-sm flex-col gap-6 rounded-[var(--radius)] p-8">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-brand dark:text-foreground">
              Log in to your account
            </h2>
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

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Rent Ledger · Built at the PHINMA AI Builder Workshop
      </footer>
    </div>
  );
}
