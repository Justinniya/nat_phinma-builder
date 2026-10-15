import { redirect } from "next/navigation";
import { PageContainer, PageHeader, TwoColumn } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "../../top-bar";
import { createRoom } from "../actions";
import { RoomForm } from "../room-form";

const tips = [
  "The due day comes from the boarder's move-in date. Moved in on the 5th? They pay on the 5th of every month.",
  "Use the boarder's real email. They sign up with it to see their own room.",
  "You can add photos right after saving.",
];

export default async function NewRoomPage({ searchParams }: PageProps<"/rooms/new">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <>
      <TopBar email={user.email} />
      <PageContainer>
        <PageHeader back={{ href: "/", label: "Dashboard" }} title="Add a room" />
        <TwoColumn
          main={
            <Card>
              <CardContent className="pt-6">
                <RoomForm action={createRoom} error={typeof error === "string" ? error : undefined} submitLabel="Save room" />
              </CardContent>
            </Card>
          }
          side={
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Good to know</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex list-disc flex-col gap-3 pl-4 text-sm text-muted-foreground">
                  {tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          }
        />
      </PageContainer>
    </>
  );
}
