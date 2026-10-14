import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

const highlights = [
  "See who has paid, who is due soon and who is overdue — on one screen.",
  "Record cash or GCash payments in a few taps.",
  "Look up any room's history without flipping through a notebook.",
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message } = await searchParams;

  return (
    <main className="grid w-full flex-1 grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-16">
      {/* Left side: what the app is. On phones this sits above the form. */}
      <section className="flex flex-col gap-6">
        <span className="glass w-fit rounded-full px-4 py-1 text-sm text-muted-foreground">
          For boarding house landlords and boarders
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Rent Ledger
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          The notebook, the GCash screenshots and the Messenger chats — in one place.
        </p>
        <ul className="hidden max-w-xl flex-col gap-3 sm:flex">
          {highlights.map((text) => (
            <li key={text} className="glass flex items-start gap-3 rounded-[var(--radius)] px-4 py-3">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Right side: the login form. */}
      <Card className="w-full max-w-md justify-self-center lg:justify-self-end">
        <CardHeader>
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>New here? Fill in your email and a password, then tap Sign up.</CardDescription>
        </CardHeader>
        <CardContent>
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

            {typeof error === "string" && (
              <p className="rounded-[var(--radius)] bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            {typeof message === "string" && (
              <p className="rounded-[var(--radius)] bg-secondary p-3 text-sm">{message}</p>
            )}

            <Button formAction={login} size="lg">
              Log in
            </Button>
            <Button formAction={signup} variant="outline" size="lg">
              Sign up
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
