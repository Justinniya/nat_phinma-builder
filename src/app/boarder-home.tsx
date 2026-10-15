import { Clock, Send } from "lucide-react";
import Link from "next/link";
import { Notice, PageContainer, PageHeader, RoomStatusBadge, TwoColumn } from "@/components/layout";
import { PaymentHistory } from "@/components/payment-history";
import { RoomSummary } from "@/components/room-summary";
import { buttonVariants } from "@/components/ui/button";
import type { BoarderRoom } from "@/lib/my-room";
import { PAYMENT_COLUMNS, type Payment } from "@/lib/payments";
import { listRoomPhotos } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import { confirmedPeriods, formatPeriod, roomDue, todayInManila } from "@/lib/rooms";
import { BoarderShell } from "./boarder-shell";

// What a boarder sees after logging in: only their own room.
// Same layout as Mama Lita's room screen: history left, room details right.

export async function BoarderHome({ room, reported }: { room: BoarderRoom; reported: boolean }) {
  const supabase = await createClient();

  // Row Level Security only returns this boarder's own payments.
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("room_id", room.id)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  const payments = (data as Payment[] | null) ?? [];

  const [cover] = await listRoomPhotos(supabase, room.landlord_id, room.id);

  const due = roomDue(room, todayInManila(), confirmedPeriods(payments));
  const waiting =
    due.status !== "paid" &&
    payments.some((p) => p.type === "monthly" && p.period === due.period && p.status === "pending");

  return (
    <BoarderShell room={room} active="room">
      <PageContainer>
        <PageHeader
          title={`Hi${room.boarder_first_name ? `, ${room.boarder_first_name}` : ""}`}
          badge={<RoomStatusBadge status={due.status} />}
          description={`Here's where you stand for ${room.label}.`}
          actions={
            due.status !== "paid" &&
            !waiting && (
              <Link href="/i-paid" className={buttonVariants()}>
                <Send className="h-4 w-4" aria-hidden />
                I paid
              </Link>
            )
          }
        />

        {reported && (
          <Notice tone="success">Thanks! Your payment was sent. It shows as Pending until your landlord confirms it.</Notice>
        )}
        {waiting && (
          <Notice tone="warning">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              Your payment for {formatPeriod(due.period)} is waiting for your landlord to confirm.
            </span>
          </Notice>
        )}

        <TwoColumn
          main={
            <PaymentHistory
              payments={payments}
              emptyText="No payments yet. After you pay, tap “I paid” so your landlord can confirm it."
            />
          }
          side={<RoomSummary room={room} photoUrl={cover?.url} due={due} />}
        />
      </PageContainer>
    </BoarderShell>
  );
}
