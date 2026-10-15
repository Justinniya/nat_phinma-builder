import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Notice, PageContainer, PageHeader, RoomStatusBadge, TwoColumn } from "@/components/layout";
import { PaymentHistory } from "@/components/payment-history";
import { RoomSummary } from "@/components/room-summary";
import { buttonVariants } from "@/components/ui/button";
import { PAYMENT_COLUMNS, type Payment } from "@/lib/payments";
import { listRoomPhotos } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import { confirmedPeriods, roomDue, ROOM_COLUMNS, todayInManila, type Room } from "@/lib/rooms";
import { LandlordShell } from "../../landlord-shell";

// One room: payment history on the left (the main thing), the room's
// details on the right — so "did I pay in August?" takes seconds.

export default async function RoomPage({ params, searchParams }: PageProps<"/rooms/[id]">) {
  const { id } = await params;
  const { recorded, confirmed, rejected, error } = await searchParams;

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

  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("room_id", room.id)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  const payments = (data as Payment[] | null) ?? [];

  const [cover] = await listRoomPhotos(supabase, user.id, room.id);
  const due = roomDue(room, todayInManila(), confirmedPeriods(payments));

  return (
    <LandlordShell email={user.email} active="rooms">
      <PageContainer>
        <PageHeader
          back={{ href: "/rooms", label: "Rooms" }}
          title={room.label}
          badge={<RoomStatusBadge status={due.status} />}
          description={room.boarder_first_name ? `Rented by ${room.boarder_first_name}` : "Vacant"}
          actions={
            <>
              <Link href={`/rooms/${room.id}/edit`} className={buttonVariants({ variant: "outline" })}>
                <Pencil className="h-4 w-4" aria-hidden />
                Edit room
              </Link>
              <Link href={`/rooms/${room.id}/pay`} className={buttonVariants()}>
                <Plus className="h-4 w-4" aria-hidden />
                Record payment
              </Link>
            </>
          }
        />

        {recorded && <Notice tone="success">Payment saved.</Notice>}
        {confirmed && <Notice tone="success">Payment confirmed.</Notice>}
        {rejected && <Notice tone="info">Report rejected. The boarder will see your reason.</Notice>}
        {typeof error === "string" && <Notice tone="error">{error}</Notice>}

        <TwoColumn
          main={
            <PaymentHistory
              payments={payments}
              removableForRoomId={room.id}
              emptyText={`No payments yet. Tap “Record payment” when ${room.boarder_first_name ?? "the boarder"} pays.`}
            />
          }
          side={<RoomSummary room={room} photoUrl={cover?.url} due={due} showEmail showNote />}
        />
      </PageContainer>
    </LandlordShell>
  );
}
