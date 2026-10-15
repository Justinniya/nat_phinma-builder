import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatPesos, isoDate, periodOf, todayInManila, type Room } from "@/lib/rooms";
import { TopBar } from "../../../top-bar";
import { recordPayment } from "./actions";
import { PaymentForm } from "@/components/payment-form";

export default async function RecordPaymentPage({ params, searchParams }: PageProps<"/rooms/[id]/pay">) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("rooms")
    .select("id, label, boarder_first_name, boarder_email, due_day, monthly_amount, note")
    .eq("id", id)
    .eq("landlord_id", user.id)
    .maybeSingle<Room>();
  if (!room) notFound();

  const today = todayInManila();

  return (
    <>
      <TopBar email={user.email} />
      <main className="grid w-full flex-1 grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-10 lg:px-10">
        <div className="flex flex-col gap-2">
          <Link href={`/rooms/${room.id}`} className="text-sm text-primary hover:underline">
            ← {room.label}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Record a payment</h1>
          <p className="text-muted-foreground">
            {room.label}
            {room.boarder_first_name ? ` · ${room.boarder_first_name}` : ""} · {formatPesos(room.monthly_amount)} a
            month
          </p>
          <p className="text-sm text-muted-foreground">
            Payments you record yourself count straight away. Deposits and advances are kept on record but don&apos;t
            mark a month as paid.
          </p>
        </div>

        <Card className="h-fit">
          <CardContent className="pt-6">
            <PaymentForm
              action={recordPayment.bind(null, room.id)}
              cancelHref={`/rooms/${room.id}`}
              defaultAmount={room.monthly_amount}
              today={isoDate(today)}
              thisMonth={periodOf(today).slice(0, 7)}
              error={typeof error === "string" ? error : undefined}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
