import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Rent Ledger</h1>
        <p className="text-muted-foreground">Who has paid, at a glance.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
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
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </p>
            )}
            {typeof message === "string" && (
              <p className="rounded-md bg-secondary p-3 text-sm">{message}</p>
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
