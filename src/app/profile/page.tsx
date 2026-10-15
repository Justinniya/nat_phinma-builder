import { redirect } from "next/navigation";
import { DetailRow, Notice, PageContainer, PageHeader, TwoColumn } from "@/components/layout";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLandlordName, isLandlord, LANDLORD_ROLE } from "@/lib/my-room";
import { createClient } from "@/lib/supabase/server";
import { LandlordShell } from "../landlord-shell";
import { updateName } from "./actions";

// The landlord's profile: her name (shown in the sidebar and used as the
// default "Received by") and her account details.

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await isLandlord(supabase, user.id))) redirect("/");

  const { saved, error } = await searchParams;
  const name = await getLandlordName(supabase, user.id);

  return (
    <LandlordShell userId={user.id} email={user.email} active="profile">
      <PageContainer>
        <PageHeader title="Profile" description="How you appear in Rent Ledger." />

        {saved && <Notice tone="success">Name saved.</Notice>}
        {typeof error === "string" && <Notice tone="error">{error}</Notice>}

        <TwoColumn
          main={
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Your name</CardTitle>
                <CardDescription>
                  Shown in the sidebar, and filled in as &ldquo;Received by&rdquo; when you record a payment.
                  Your boarders see it too.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateName} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label htmlFor="display_name">Name</Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      placeholder="e.g. Mama Lita"
                      defaultValue={name ?? ""}
                      maxLength={60}
                      required
                    />
                  </div>
                  <SubmitButton pendingText="Saving…">Save name</SubmitButton>
                </form>
              </CardContent>
            </Card>
          }
          side={
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Account</CardTitle>
              </CardHeader>
              <dl className="divide-y divide-border px-6 pb-2">
                <DetailRow label="Role">{LANDLORD_ROLE}</DetailRow>
                <DetailRow label="Email">
                  <span className="break-all">{user.email}</span>
                </DetailRow>
              </dl>
            </Card>
          }
        />
      </PageContainer>
    </LandlordShell>
  );
}
