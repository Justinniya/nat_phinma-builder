import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentForm } from "@/components/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { findMyRoom } from "@/lib/my-room";
import { createClient } from "@/lib/supabase/server";
import { formatPesos, isoDate, periodOf, todayInManila } from "@/lib/rooms";
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
              thisMonth={periodOf(today).slice(0, 7)}
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
