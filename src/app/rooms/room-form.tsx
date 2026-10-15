import Link from "next/link";
import { Notice } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "@/lib/rooms";

// One titled group of fields, separated from the next by a line.
function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-b border-border pb-6 last-of-type:border-b-0">
      <div className="flex flex-col gap-0.5">
        <legend className="text-sm font-semibold">{title}</legend>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

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
    <form action={action} className="flex flex-col gap-6">
      <FormSection title="Room">
        <Field id="label" label="Room name">
          <Input id="label" name="label" placeholder="Room 4" defaultValue={room?.label} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="monthly_amount" label="Monthly amount (₱)" hint="Change it when utilities change.">
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
          </Field>
          <Field id="due_day" label="Due day (1–31)" hint="Moved in on the 5th? Then it's 5.">
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
          </Field>
        </div>
      </FormSection>

      <FormSection title="Boarder" hint="Leave both empty if the room is vacant.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="boarder_first_name" label="First name">
            <Input
              id="boarder_first_name"
              name="boarder_first_name"
              placeholder="Juan"
              defaultValue={room?.boarder_first_name ?? ""}
            />
          </Field>
          <Field id="boarder_email" label="Email" hint="The boarder logs in with this.">
            <Input
              id="boarder_email"
              name="boarder_email"
              type="email"
              placeholder="juan@example.com"
              defaultValue={room?.boarder_email ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Notes">
        <Field id="note" label="Note (optional)">
          <Textarea
            id="note"
            name="note"
            placeholder="e.g. all-inclusive, or has its own sub-meter"
            defaultValue={room?.note ?? ""}
          />
        </Field>
      </FormSection>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={room ? `/rooms/${room.id}` : "/rooms"} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
