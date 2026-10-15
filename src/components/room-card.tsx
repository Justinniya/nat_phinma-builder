import { User } from "lucide-react";
import Link from "next/link";
import { RoomIllustration } from "@/components/illustrations";
import { RoomStatusBadge } from "@/components/layout";
import { Card } from "@/components/ui/card";
import type { RoomWithDue } from "@/lib/landlord-rooms";
import { formatDate, formatPesos, ordinal, roomStatusStyle } from "@/lib/rooms";

// One room on the Rooms page: photo, status, boarder, amount, due date.
export function RoomCard({ item, photoUrl }: { item: RoomWithDue; photoUrl?: string }) {
  const { room, status, due } = item;
  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/30">
        {/* Coloured bar: the room's status at a glance */}
        <div className={`h-1.5 w-full ${roomStatusStyle[status].stripe}`} aria-hidden />
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-secondary">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links
            <img src={photoUrl} alt={`Photo of ${room.label}`} className="h-full w-full object-cover" />
          ) : (
            <RoomIllustration className="h-full w-full" />
          )}
          <RoomStatusBadge status={status} className="absolute left-3 top-3 shadow-sm" />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="truncate font-semibold tracking-tight">{room.label}</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{room.boarder_first_name ?? "No boarder"}</span>
              </p>
            </div>
            <span className="font-semibold tabular-nums">{formatPesos(room.monthly_amount)}</span>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Due every {ordinal(room.due_day)}</span>
            <span className={`font-medium ${roomStatusStyle[status].text}`}>
              {status === "paid" ? `Next: ${formatDate(due)}` : formatDate(due)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
