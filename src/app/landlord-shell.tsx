import { BedDouble, LayoutDashboard, Wallet } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "./shell";

// The frame around every one of Mama Lita's screens: the sidebar menu
// (Dashboard, Rooms, Payments), her list of renters, and who's logged in.

export type LandlordSection = "dashboard" | "rooms" | "payments";

export async function LandlordShell({
  userId,
  email,
  active,
  children,
}: {
  userId: string;
  email: string | undefined;
  active: LandlordSection;
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // How many boarder reports are waiting — shown next to "Payments".
  const { count } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", userId)
    .eq("status", "pending");

  // Her renters: who lives in which room.
  const { data } = await supabase
    .from("rooms")
    .select("id, label, boarder_first_name")
    .eq("landlord_id", userId);
  const rooms = (data ?? []).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  const renters = rooms.filter((r) => r.boarder_first_name);
  const vacant = rooms.length - renters.length;

  const sidePanel = (
    <div className="flex flex-col gap-2">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/45">Renters</p>
      {renters.length === 0 ? (
        <p className="px-3 text-sm text-white/55">No renters yet.</p>
      ) : (
        <ul className="flex flex-col">
          {renters.map((r) => (
            <li key={r.id}>
              <Link
                href={`/rooms/${r.id}`}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="truncate">{r.boarder_first_name}</span>
                <span className="shrink-0 text-xs text-white/45">{r.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {vacant > 0 && (
        <p className="px-3 text-xs text-white/45">
          {vacant} vacant {vacant === 1 ? "room" : "rooms"}
        </p>
      )}
    </div>
  );

  return (
    <Shell
      active={active}
      links={[
        { key: "dashboard", href: "/", label: "Dashboard", icon: LayoutDashboard },
        { key: "rooms", href: "/rooms", label: "Rooms", icon: BedDouble },
        { key: "payments", href: "/payments", label: "Payments", icon: Wallet, badge: count ?? 0 },
      ]}
      profile={{ title: "Landlord", subtitle: email }}
      sidePanel={sidePanel}
    >
      {children}
    </Shell>
  );
}
