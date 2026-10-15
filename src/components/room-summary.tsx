import { RoomIllustration } from "@/components/illustrations";
import { DetailRow } from "@/components/layout";
import { Card } from "@/components/ui/card";
import {
  formatDate,
  formatPeriod,
  formatPesos,
  ordinal,
  roomStatusStyle,
  type Room,
  type RoomDue,
} from "@/lib/rooms";

// The room's photo and key facts, as one card. Used on the room screen,
// the boarder's screen and next to both payment forms, so the same
// information always looks the same.
export function RoomSummary({
  room,
  photoUrl,
  due,
  showEmail = false,
  showNote = false,
}: {
  room: Room;
  photoUrl?: string;
  due?: RoomDue;
  showEmail?: boolean;
  showNote?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/10] w-full overflow-hidden border-b border-border bg-secondary">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links
          <img src={photoUrl} alt={`Photo of ${room.label}`} className="h-full w-full object-cover" />
        ) : (
          <RoomIllustration className="h-full w-full" />
        )}
      </div>
      <dl className="divide-y divide-border px-6">
        <DetailRow label="Boarder">{room.boarder_first_name ?? <span className="text-muted-foreground">None (vacant)</span>}</DetailRow>
        {showEmail && room.boarder_email && (
          <DetailRow label="Email">
            <span className="break-all">{room.boarder_email}</span>
          </DetailRow>
        )}
        <DetailRow label="Monthly amount">{formatPesos(room.monthly_amount)}</DetailRow>
        <DetailRow label="Due day">Every {ordinal(room.due_day)}</DetailRow>
        {due && due.status !== "vacant" && (
          <DetailRow label={due.status === "paid" ? "Next due" : "Due"}>
            <span className={roomStatusStyle[due.status].text}>{formatDate(due.due)}</span>
            <span className="block text-xs font-normal text-muted-foreground">for {formatPeriod(due.period)}</span>
          </DetailRow>
        )}
      </dl>
      {showNote && room.note && (
        <p className="mx-6 mb-6 rounded-lg bg-secondary p-3 text-sm text-muted-foreground">{room.note}</p>
      )}
    </Card>
  );
}
