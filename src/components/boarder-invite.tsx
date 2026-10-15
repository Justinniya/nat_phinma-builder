import { headers } from "next/headers";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "@/lib/rooms";

// On the landlord's room screen: how this room's boarder gets into the
// app, plus a ready-made message to send them on Messenger.
export async function BoarderInvite({ room }: { room: Room }) {
  if (!room.boarder_email) return null;

  // The site's own address, e.g. https://nat-phinma-builder.vercel.app
  const h = await headers();
  const host = h.get("host") ?? "nat-phinma-builder.vercel.app";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${host}`;
  const name = room.boarder_first_name ?? "your boarder";

  const message = [
    `Hi ${room.boarder_first_name ?? ""}! You can now see your rent and report payments for ${room.label} in Rent Ledger.`,
    ``,
    `1. Open ${siteUrl}`,
    `2. Type this email: ${room.boarder_email}`,
    `3. Choose a password, then tap "Sign up"`,
    `4. Open the confirmation email we send you (check Spam too), then log in.`,
  ].join("\n");

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">How {name} logs in</CardTitle>
        <CardDescription>Send this on Messenger. They must sign up with exactly this email.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <pre className="whitespace-pre-wrap rounded-lg bg-secondary p-3 font-sans text-sm text-muted-foreground">
          {message}
        </pre>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton text={message} />
          <span className="text-xs text-muted-foreground">
            No email after an hour? You can create their account in Supabase (see GO-LIVE).
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
