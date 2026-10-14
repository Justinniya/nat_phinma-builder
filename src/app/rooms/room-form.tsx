import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "@/lib/rooms";

// The same form is used to add a room and to edit one.
export function RoomForm({
  action,
  room,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  room?: Room;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="label">Room name</Label>
        <Input id="label" name="label" placeholder="Room 4" defaultValue={room?.label} required />
      </div>

      <fieldset className="flex flex-col gap-4 rounded-[var(--radius)] border border-border p-4">
        <legend className="px-1 text-sm font-medium">Boarder</legend>
        <p className="text-sm text-muted-foreground">Leave both empty if the room is vacant.</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="boarder_first_name">First name</Label>
          <Input
            id="boarder_first_name"
            name="boarder_first_name"
            placeholder="Juan"
            defaultValue={room?.boarder_first_name ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="boarder_email">Email (the boarder will log in with this)</Label>
          <Input
            id="boarder_email"
            name="boarder_email"
            type="email"
            placeholder="juan@example.com"
            defaultValue={room?.boarder_email ?? ""}
          />
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="due_day">Due day (1–31)</Label>
          <Input
            id="due_day"
            name="due_day"
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            defaultValue={room?.due_day}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="monthly_amount">Monthly amount (₱)</Label>
          <Input
            id="monthly_amount"
            name="monthly_amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            defaultValue={room?.monthly_amount}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" name="note" placeholder="e.g. all-inclusive, or has its own sub-meter" defaultValue={room?.note ?? ""} />
      </div>

      {error && (
        <p className="rounded-[var(--radius)] bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-1">
          {submitLabel}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
