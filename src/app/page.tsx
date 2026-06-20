import { DashboardCards } from "@/components/DashboardCards";
import { getDashboardData } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {data.source === "mock" && (
        <p className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Using mock data — add <code className="text-xs">MONGODB_URI</code> to{" "}
          <code className="text-xs">.env.local</code>, then{" "}
          <code className="text-xs">POST /api/seed</code> to load demo records.
        </p>
      )}
      <DashboardCards
        matters={data.matters}
        deadlines={data.deadlines}
        invoices={data.invoices}
        leads={data.leads}
      />
    </div>
  );
}
