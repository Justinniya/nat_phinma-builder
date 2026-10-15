import { notFound, redirect } from "next/navigation";
import { PageContainer, PageHeader, TwoColumn } from "@/components/layout";
import { PaymentForm } from "@/components/payment-form";
import { RoomSummary } from "@/components/room-summary";
import { Card, CardContent } from "@/components/ui/card";
import { listRoomPhotos } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import { confirmedPeriods, isoDate, roomDue, ROOM_COLUMNS, todayInManila, type Room } from "@/lib/rooms";
import { TopBar } from "../../../top-bar";
import { recordPayment } from "./actions";

export default async function RecordPaymentPage({ params, searchParams }: PageProps<"/rooms/[id]/pay">) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("rooms")
    .select(ROOM_COLUMNS)
    .eq("id", id)
    .eq("landlord_id", user.id)
    .maybeSingle<Room>();
  if (!room) notFound();

  // Pre-select the month that should be paid next.
  const { data: confirmed } = await supabase
    .from("payments")
    .select("type, status, period")
    .eq("room_id", room.id)
    .eq("status", "confirmed");
  const today = todayInManila();
  const due = roomDue(room, today, confirmedPeriods(confirmed ?? []));
  const [cover] = await listRoomPhotos(supabase, user.id, room.id);

  return (
    <>
      <TopBar email={user.email} />
      <PageContainer>
        <PageHeader
          back={{ href: `/rooms/${room.id}`, label: room.label }}
          title="Record a payment"
          description="Payments you record yourself count straight away. Deposits and advances are kept on record but don't mark a month as paid."
        />
        <TwoColumn
          main={
            <Card>
              <CardContent className="pt-6">
                <PaymentForm
                  action={recordPayment.bind(null, room.id)}
                  cancelHref={`/rooms/${room.id}`}
                  defaultAmount={room.monthly_amount}
                  today={isoDate(today)}
                  thisMonth={due.period.slice(0, 7)}
                  error={typeof error === "string" ? error : undefined}
                />
              </CardContent>
            </Card>
          }
          side={<RoomSummary room={room} photoUrl={cover?.url} due={due} />}
        />
      </PageContainer>
    </>
  );
}
