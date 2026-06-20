"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  Briefcase,
  Users,
  Clock,
  Receipt,
  FileText,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/zustand/timerStore";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isMobileSidebarOpen = useTimerStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useTimerStore((s) => s.setMobileSidebarOpen);

  // Menu items based strictly on requirements
  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Matters", href: "/matters", icon: Briefcase },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Tasks", href: "/tasks", icon: ListChecks },
    { name: "Activities", href: "/activities", icon: Clock },
    { name: "Billing", href: "/billing", icon: Receipt },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Audit Log", href: "/audit-log", icon: History },
    { name: "Settings", href: "/settings", icon: Settings }
  ];

  const handleLinkClick = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-full bg-[#051429] text-[#a5b4fc] select-none border-r border-[#0c223f] shrink-0 fixed inset-y-0 left-0 z-50 transform md:static md:translate-x-0 transition-all duration-300 ease-in-out",
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-64 md:w-16" : "w-64 md:w-60"
        )}
      >
        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#0d4e96] text-white"
                    : "text-[#94a3b8] hover:bg-[#0b2447] hover:text-white"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-white" : "text-[#64748b]"
                  )}
                />
                {(!isCollapsed || isMobileSidebarOpen) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions and Profile */}
        <div className="border-t border-[#0c223f] p-3 space-y-2">
          {/* Help/Resource centre */}
          <Link
            href="/resources"
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#94a3b8] hover:bg-[#0b2447] hover:text-white"
            title={isCollapsed ? "Resource centre" : undefined}
          >
            <HelpCircle className="h-5 w-5 shrink-0 text-[#64748b]" />
            {(!isCollapsed || isMobileSidebarOpen) && (
              <span className="truncate">Resource centre</span>
            )}
          </Link>

          {/* User profile */}
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-md bg-[#0a1e38] text-white",
              isCollapsed && !isMobileSidebarOpen ? "justify-center" : ""
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d4e96] text-sm font-semibold">
              ZA
            </div>
            {(!isCollapsed || isMobileSidebarOpen) && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">Zain Ali</p>
                <p className="truncate text-[10px] text-[#64748b]">
                  Zain Ali Legal
                </p>
              </div>
            )}
          </div>

          {/* Collapse button (Desktop only) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full justify-start text-[#94a3b8] hover:bg-[#0b2447] hover:text-white px-3 py-2 h-10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 mx-auto" />
            ) : (
              <div className="flex items-center gap-3 w-full">
                <ChevronLeft className="h-5 w-5" />
                <span className="truncate">Collapse</span>
              </div>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
