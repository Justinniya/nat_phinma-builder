import { DoorOpen, Send } from "lucide-react";
import type { BoarderRoom } from "@/lib/my-room";
import { Shell } from "./shell";

// The frame around a boarder's screens: the same sidebar as the
// landlord's, with their own menu and their name and room.

export function BoarderShell({
  room,
  active,
  children,
}: {
  room: BoarderRoom;
  active: "room" | "i-paid";
  children: React.ReactNode;
}) {
  return (
    <Shell
      active={active}
      links={[
        { key: "room", href: "/", label: "My room", icon: DoorOpen },
        { key: "i-paid", href: "/i-paid", label: "I paid", icon: Send },
      ]}
      profile={{ title: room.boarder_first_name ?? "Boarder", subtitle: room.label }}
    >
      {children}
    </Shell>
  );
}
