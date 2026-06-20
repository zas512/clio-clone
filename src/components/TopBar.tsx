"use client";
import { Search, Bell, Plus, Menu, Link, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { TimeTracker } from "@/components/TimeTracker";
import { useTimerStore } from "@/zustand/timerStore";

export function TopBar() {
  const isMobileSidebarOpen = useTimerStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useTimerStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="flex h-16 w-full items-center justify-between bg-[#005bbb] px-4 sm:px-6 text-white shrink-0 shadow-sm border-b border-[#004ba3]">
      {/* Left Search Box with Hamburger Menu */}
      {/* Brand Section */}
      <div className="flex items-center flex-1 max-w-xs sm:max-w-sm md:max-w-md mr-2">
        <div className="flex bg-[#005bbb] h-16 items-center justify-between px-4 border-b border-[#0c223f]">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-white overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d4e96] text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </Link>
        </div>
        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button
          onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden text-white mr-3 hover:text-blue-100 transition-colors p-1"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-200" />
          <Input
            type="text"
            placeholder="Search Zain Ali Legal"
            className="h-9 w-full bg-blue-900/40 border-none pl-9 pr-4 sm:pr-14 text-sm text-white placeholder-blue-200/80 focus-visible:ring-1 focus-visible:ring-white rounded-md"
          />
          <div className="absolute right-3 top-2 hidden sm:flex h-5 items-center gap-1 rounded bg-blue-800/60 px-1.5 text-[10px] font-medium text-blue-100/90 border border-blue-700/50 select-none">
            <span>Ctrl + K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Time Tracker Widget */}
        <TimeTracker />

        {/* Create new button */}
        <button className="flex items-center gap-1 rounded bg-blue-800/40 hover:bg-blue-800/70 border border-blue-400/30 p-2 sm:px-3.5 sm:py-1.5 text-xs font-semibold text-white transition-all shadow-sm">
          <span className="hidden sm:inline">Create new</span>
          <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        </button>

        {/* Bell / Notifications */}
        <button className="relative text-blue-100 hover:text-white transition-colors p-1">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* User Profile Avatar */}
        <Avatar className="h-8 w-8 border border-blue-400/30 shrink-0">
          <AvatarFallback className="bg-blue-800 text-white text-xs font-medium">
            ZA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
