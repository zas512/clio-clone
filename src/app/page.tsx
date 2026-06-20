import { DashboardCards } from "@/components/DashboardCards";
import { getDashboardData } from "@/lib/services/dashboard";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Calculate stats
  const tasksDueCount = 0;
  const eventsCount = 0;
  const overdueInvoicesCount = data.invoices.length;
  const overdueTotal = data.invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Dashboard Tabs Header */}
      <div className="flex border-b border-[#1d2c3f] pb-px">
        <button className="border-b-2 border-blue-500 pb-3 text-sm font-semibold text-white px-1 cursor-pointer">
          Personal Dashboard
        </button>
        <button className="text-slate-400 hover:text-white pb-3 text-sm font-semibold ml-6 px-1 transition-colors cursor-pointer">
          Firm Dashboard
        </button>
        <button className="text-slate-400 hover:text-white pb-3 text-sm font-semibold ml-6 px-1 transition-colors cursor-pointer">
          Firm Feed
        </button>
      </div>

      {/* Today's Agenda Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Today&apos;s Agenda{" "}
          <span className="text-xs text-blue-400 hover:underline cursor-pointer font-medium">
            (Hide)
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tasks Box */}
          <div className="flex items-center gap-4 bg-[#131f33] border border-[#1d2c3f] p-4 rounded-lg">
            <div className="flex items-center justify-center h-9 px-3 rounded-full bg-[#1b2b45] border border-[#2f3f56] text-xs font-bold text-white shrink-0">
              {tasksDueCount} Tasks Due Today
            </div>
            <p className="text-sm text-slate-400">
              You have no tasks due today
            </p>
          </div>

          {/* Calendar Events Box */}
          <div className="flex items-center gap-4 bg-[#131f33] border border-[#1d2c3f] p-4 rounded-lg">
            <div className="flex items-center justify-center h-9 px-3 rounded-full bg-[#1b2b45] border border-[#2f3f56] text-xs font-bold text-white shrink-0">
              {eventsCount} Calendar Events
            </div>
            <p className="text-sm text-slate-400">
              You have no events scheduled for today
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid for Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Hourly Metrics */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1">
            Hourly Metrics for Zain Ali{" "}
            <HelpCircle className="h-4 w-4 text-blue-400" />
          </h3>

          <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
            <h4 className="font-bold text-white text-base">
              Billable Hours Target
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              You haven&apos;t set up your billing target
            </p>
            <Button className="bg-[#005bbb] hover:bg-blue-600 font-bold px-6 text-xs text-white rounded">
              SET UP YOUR TARGET
            </Button>
          </div>
        </div>

        {/* Right Column: Billing Metrics */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1">
            Billing Metrics for Firm{" "}
            <HelpCircle className="h-4 w-4 text-blue-400" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Draft Bills */}
            <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-4 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-400">Draft Bills</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">0</span>
                  <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">
                    [create new bills]
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                  ⚙ View
                </button>
              </div>
            </div>

            {/* Total in Draft */}
            <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-4 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  Total in Draft
                </p>
                <p className="text-2xl font-bold text-slate-500 mt-1">-</p>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                  ⚙ View
                </button>
              </div>
            </div>

            {/* Unpaid Bills */}
            <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-4 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-400">Unpaid Bills</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-white">0</span>
                  <span className="text-[9px] text-slate-500 line-clamp-1">
                    Approve from Draft or Pending Approval
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                  ⚙ View
                </button>
              </div>
            </div>

            {/* Total in Unpaid */}
            <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-4 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  Total in Unpaid
                </p>
                <p className="text-2xl font-bold text-slate-500 mt-1">-</p>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                  ⚙ View
                </button>
              </div>
            </div>

            {/* Overdue Bills */}
            <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-4 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  Overdue Bills
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${overdueInvoicesCount > 0 ? "text-red-400" : "text-white"}`}
                >
                  {overdueInvoicesCount}
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                  ⚙ View
                </button>
              </div>
            </div>

            {/* Total in Overdue */}
            <div className="bg-[#131f33] border border-[#1d2c3f] rounded-lg p-4 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  Total in Overdue
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${overdueTotal > 0 ? "text-red-400" : "text-slate-500"}`}
                >
                  {overdueTotal > 0
                    ? `Rs ${overdueTotal.toLocaleString()}`
                    : "-"}
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                  ⚙ View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Cards (Firms pipeline and tasks details) */}
      <div className="border-t border-[#1d2c3f] pt-6 space-y-4">
        <h3 className="text-sm font-bold text-white">
          Firm Management Dashboard Overview
        </h3>
        <DashboardCards
          matters={data.matters}
          deadlines={data.deadlines}
          invoices={data.invoices}
          leads={data.leads}
        />
      </div>
    </div>
  );
}
