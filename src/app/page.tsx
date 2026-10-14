import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

// Ticket 02: prove the live site can reach Supabase.
// A logged-out visitor should see "0 rooms visible" — that is Row Level
// Security working, not a bug. Login and the real dashboard come in ticket 03.

async function countVisibleRooms(): Promise<{ count: number } | { error: string }> {
  try {
    const supabase = await createClient();
    // head: true asks only for the count, not the rows themselves.
    const { count, error } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true });
    if (error) return { error: error.message };
    return { count: count ?? 0 };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export default async function Home() {
  const result = await countVisibleRooms();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:py-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Rent Ledger
        </h1>
        <p className="text-base text-muted-foreground">
          Mama Lita&apos;s boarding house — who has paid, at a glance.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            {"error" in result
              ? "Not connected to the database"
              : `Connected — ${result.count} rooms visible`}
          </CardTitle>
          <CardDescription>
            {"error" in result
              ? result.error
              : "You are not logged in, so Row Level Security hides every room. Log in comes next."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
}
