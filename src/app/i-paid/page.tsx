import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentForm } from "@/components/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { findMyRoom } from "@/lib/my-room";
import { createClient } from "@/lib/supabase/server";
import { confirmedPeriods, formatPesos, isoDate, roomDue, todayInManila } from "@/lib/rooms";
import { TopBar } from "../top-bar";
import { reportPayment } from "./actions";

// Boarder: "I paid" form.

export default async function IPaidPage({ searchParams }: PageProps<"/i-paid">) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const room = await findMyRoom(supabase, user.email);
  if (!room) redirect("/");

  const today = todayInManila();

  // Pre-select the month that should be paid next — e.g. last month if
  // it was never confirmed, or next month if this one is already paid.
  const { data: confirmed } = await supabase
    .from("payments")
    .select("type, status, period")
    .eq("room_id", room.id)
    .eq("status", "confirmed");
  const { period } = roomDue(room, today, confirmedPeriods(confirmed ?? []));

  return (
    <>
      <TopBar email={user.email} />
      <main className="grid w-full flex-1 grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-10 lg:px-10">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← My room
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">I paid</h1>
          <p className="text-muted-foreground">
            {room.label} · {formatPesos(room.monthly_amount)} a month
          </p>
          <p className="text-sm text-muted-foreground">
            Your landlord will confirm it once the money is with them. Until then it shows as Pending.
          </p>
        </div>

        <Card className="h-fit">
          <CardContent className="pt-6">
            <PaymentForm
              action={reportPayment}
              cancelHref="/"
              defaultAmount={room.monthly_amount}
              today={isoDate(today)}
              thisMonth={period.slice(0, 7)}
              error={typeof error === "string" ? error : undefined}
              monthlyOnly
              submitLabel="Send to landlord"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
