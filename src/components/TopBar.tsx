"use client";
import { Search, Bell, Plus, Menu, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TimeTracker } from "@/components/TimeTracker";
import { useTimerStore } from "@/zustand/timerStore";

export function TopBar() {
  const isMobileSidebarOpen = useTimerStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useTimerStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="flex h-max py-2 w-full items-center justify-between bg-[#005bbb] px-4 text-white shrink-0 shadow-sm border-b border-[#004ba3]">
      {/* Left Search Box with Hamburger Menu */}
      <div className="flex items-center flex-1 max-w-xs sm:max-w-sm md:max-w-md mr-2">
        <section className="flex items-center gap-3 font-semibold text-white overflow-hidden mr-3">
          <CheckCircle2 className="size-6" />
        </section>

        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button
          onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden text-white mr-3 hover:text-blue-100 transition-colors p-1"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full rounded-sm bg-black/40">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-100/80" />
          <Input
            type="text"
            placeholder="Search Zain Ali Legal"
            className="h-9 w-full border-none pl-9 pr-4 sm:pr-14 text-sm text-white placeholder-blue-100/70 focus-visible:ring-1 focus-visible:ring-white rounded-md"
          />
          <div className="absolute right-3 top-2 hidden sm:flex h-5 items-center gap-1 rounded bg-black/25 px-1.5 text-[10px] font-medium text-blue-100/80 select-none">
            <span>Ctrl + K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Time Tracker Widget */}
        <TimeTracker />

        {/* Create new button */}
        <button className="flex h-9 items-center justify-center gap-1.5 rounded bg-black/30 hover:bg-black/45 hover:cursor-pointer px-2.5 sm:px-3.5 text-md font-semibold text-white transition-all">
          <Plus className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Create new</span>
        </button>

        {/* Bell / Notifications */}
        <button className="relative flex h-9 w-9 items-center bg-black/30 hover:bg-black/45 hover:cursor-pointer justify-center rounded text-white transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
