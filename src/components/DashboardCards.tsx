import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Deadline, Invoice, Lead, Matter } from "@/types";
import { daysSince, STALE_THRESHOLD_DAYS } from "@/lib/services/dashboard";

type DashboardCardsProps = {
  matters: Matter[];
  deadlines: Deadline[];
  invoices: Invoice[];
  leads: Lead[];
};

export function DashboardCards({
  matters,
  deadlines,
  invoices,
  leads
}: DashboardCardsProps) {
  const staleMatters = matters.filter(
    (m) => daysSince(m.lastActivityAt) >= STALE_THRESHOLD_DAYS
  );
  const retainerFlags = matters.filter((m) => !m.retainerCollected);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Overdue Deadlines
            <Badge variant="destructive">{deadlines.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadlines
            .sort((a, b) => b.daysOverdue - a.daysOverdue)
            .map((d) => (
              <a
                key={d.id}
                href={`/matters/${d.matterId}`}
                className="block rounded-md p-2 hover:bg-muted"
              >
                <p className="text-sm font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.matterName} · {d.daysOverdue}d overdue
                </p>
              </a>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Overdue Invoices
            <Badge variant="destructive">{invoices.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoices.map((inv) => (
            <a
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="block rounded-md p-2 hover:bg-muted"
            >
              <p className="text-sm font-medium">
                {inv.clientName} · ${inv.total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {inv.matterName} · {inv.daysOverdue}d overdue
              </p>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Retainer Not Collected
            <Badge variant="outline">{retainerFlags.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {retainerFlags.map((m) => (
            <a
              key={m.id}
              href={`/matters/${m.id}`}
              className="block rounded-md p-2 hover:bg-muted"
            >
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.clientName} · ${m.retainerAmount.toLocaleString()} owed
              </p>
            </a>
          ))}
          {retainerFlags.length === 0 && (
            <p className="text-sm text-muted-foreground">All caught up</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            No Activity in {STALE_THRESHOLD_DAYS}+ Days
            <Badge variant="outline">{staleMatters.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {staleMatters.map((m) => (
            <a
              key={m.id}
              href={`/matters/${m.id}`}
              className="block rounded-md p-2 hover:bg-muted"
            >
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                Last activity {daysSince(m.lastActivityAt)}d ago
              </p>
            </a>
          ))}
          {staleMatters.length === 0 && (
            <p className="text-sm text-muted-foreground">All matters active</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Pending Leads
            <Badge variant="outline">{leads.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leads.map((l) => (
            <a
              key={l.id}
              href={`/leads/${l.id}`}
              className="block rounded-md p-2 hover:bg-muted"
            >
              <p className="text-sm font-medium">{l.contactName}</p>
              <p className="text-xs text-muted-foreground">
                {l.matterDescription}
              </p>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
