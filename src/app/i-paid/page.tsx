import { redirect } from "next/navigation";
import { PageContainer, PageHeader, TwoColumn } from "@/components/layout";
import { PaymentForm } from "@/components/payment-form";
import { RoomSummary } from "@/components/room-summary";
import { Card, CardContent } from "@/components/ui/card";
import { findMyRoom } from "@/lib/my-room";
import { listRoomPhotos } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import { confirmedPeriods, isoDate, roomDue, todayInManila } from "@/lib/rooms";
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
  const due = roomDue(room, today, confirmedPeriods(confirmed ?? []));
  const [cover] = await listRoomPhotos(supabase, room.landlord_id, room.id);

  return (
    <>
      <TopBar email={user.email} />
      <PageContainer>
        <PageHeader
          back={{ href: "/", label: "My room" }}
          title="I paid"
          description="Your landlord will confirm it once the money is with them. Until then it shows as Pending."
        />
        <TwoColumn
          main={
            <Card>
              <CardContent className="pt-6">
                <PaymentForm
                  action={reportPayment}
                  cancelHref="/"
                  defaultAmount={room.monthly_amount}
                  today={isoDate(today)}
                  thisMonth={due.period.slice(0, 7)}
                  error={typeof error === "string" ? error : undefined}
                  monthlyOnly
                  submitLabel="Send to landlord"
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
