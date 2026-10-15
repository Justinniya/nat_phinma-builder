import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmReject } from "@/components/confirm-reject";
import { Notice, PageContainer, PageHeader, PaymentStatusBadge } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { isLandlord } from "@/lib/my-room";
import { methodLabel, PAYMENT_COLUMNS, statusLabel, typeLabel, type Payment, type PaymentStatus } from "@/lib/payments";
import { formatDate, formatPeriod, formatPesos, parseDate, periodOf, todayInManila } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { LandlordShell } from "../landlord-shell";

// Mama Lita's Payments page: every payment across all rooms, newest
// first — the notebook, as a table. Tabs show only one status.

type Row = Payment & { rooms: { id: string; label: string; boarder_first_name: string | null } | null };

const filters: PaymentStatus[] = ["pending", "confirmed", "rejected"];

export default async function PaymentsPage({ searchParams }: PageProps<"/payments">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await isLandlord(supabase, user.id))) redirect("/");

  const { status: statusParam, confirmed, rejected, error } = await searchParams;
  const active = filters.find((f) => f === statusParam);

  const { data } = await supabase
    .from("payments")
    .select(`${PAYMENT_COLUMNS}, rooms(id, label, boarder_first_name)`)
    .eq("landlord_id", user.id)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  const all = (data as Row[] | null) ?? [];
  const shown = active ? all.filter((p) => p.status === active) : all;

  // Money actually received this month (confirmed payments dated this month).
  const thisMonth = periodOf(todayInManila()).slice(0, 7);
  const collected = all
    .filter((p) => p.status === "confirmed" && p.paid_on.startsWith(thisMonth))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const tabs = [
    { key: undefined, label: "All", count: all.length },
    ...filters.map((f) => ({ key: f, label: statusLabel[f].label, count: all.filter((p) => p.status === f).length })),
  ];

  return (
    <LandlordShell email={user.email} active="payments">
      <PageContainer>
        <PageHeader
          title="Payments"
          description={`Every payment across all rooms. Collected in ${formatPeriod(`${thisMonth}-01`)}: ${formatPesos(collected)}`}
        />

        <nav className="-mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Filter payments">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <Link
                key={tab.label}
                href={tab.key ? `/payments?status=${tab.key}` : "/payments"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.key && <span className={cn("h-1.5 w-1.5 rounded-full", statusLabel[tab.key].dot)} />}
                {tab.label}
                <span className={cn("tabular-nums", isActive ? "text-primary-foreground/80" : "text-muted-foreground/70")}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </nav>

        {confirmed && <Notice tone="success">Payment confirmed.</Notice>}
        {rejected && <Notice tone="info">Report rejected. The boarder will see your reason.</Notice>}
        {typeof error === "string" && <Notice tone="error">{error}</Notice>}

        <Card className="overflow-hidden">
          {shown.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">No payments here yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date paid</th>
                    <th className="px-6 py-3 font-medium">Room</th>
                    <th className="px-6 py-3 font-medium">For</th>
                    <th className="hidden px-6 py-3 font-medium md:table-cell">Method</th>
                    <th className="hidden px-6 py-3 font-medium lg:table-cell">Received by</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shown.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/40">
                      <td className="whitespace-nowrap px-6 py-3">{formatDate(parseDate(p.paid_on))}</td>
                      <td className="whitespace-nowrap px-6 py-3">
                        {p.rooms ? (
                          <Link href={`/rooms/${p.rooms.id}`} className="font-medium hover:text-primary hover:underline">
                            {p.rooms.label}
                          </Link>
                        ) : (
                          "—"
                        )}
                        {p.rooms?.boarder_first_name && (
                          <span className="block text-xs text-muted-foreground">{p.rooms.boarder_first_name}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        {p.type === "monthly" && p.period ? formatPeriod(p.period) : typeLabel[p.type]}
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-3 md:table-cell">
                        {methodLabel[p.method]}
                        {p.reference_no && <span className="block text-xs text-muted-foreground">Ref {p.reference_no}</span>}
                      </td>
                      <td className="hidden px-6 py-3 text-muted-foreground lg:table-cell">{p.received_by ?? "—"}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-right font-semibold tabular-nums">
                        {formatPesos(p.amount)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col items-start gap-2">
                          <PaymentStatusBadge status={p.status} />
                          {p.status === "pending" && <ConfirmReject paymentId={p.id} returnTo="/payments" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageContainer>
    </LandlordShell>
  );
}
