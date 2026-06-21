"use client";
import { Play, Pause, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatDuration, getElapsedMs } from "@/zustand/timerStore";
import type { Matter } from "@/types";

type UserOption = {
  id: string;
  name: string;
  email: string;
  defaultHourlyRate: number;
};

type ActiveTimer =
  NonNullable<ReturnType<typeof getElapsedMs>> extends number
    ? Parameters<typeof getElapsedMs>[0]
    : never;

type Props = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  activeTimer: ActiveTimer | undefined;
  matters: Matter[];
  users: UserOption[];
  saveError: string | null;
  selectedMatterId: string;
  selectedUserId: string;
  activityCategory: string;
  dateStr: string;
  clientFacingDescription: string;
  rateStr: string;
  nonBillable: boolean;
  writtenOff: boolean;
  showOnBill: boolean;
  displayHoursStr: string;

  setActivityCategory: (val: string) => void;
  setDateStr: (val: string) => void;
  setRateStr: (val: string) => void;
  setNonBillable: (val: boolean) => void;
  setWrittenOff: (val: boolean) => void;
  setShowOnBill: (val: boolean) => void;
  setIsManualDuration: (val: boolean) => void;
  setManualDurationHours: (val: string) => void;
  handleMatterChange: (val: string) => void;
  handleUserChange: (val: string) => void;
  handleDescriptionChange: (val: string) => void;
  handleDefaultRateClick: () => void;
  toggleTimerPlayback: () => void;
  saveTimeEntry: (options: {
    duplicate?: boolean;
    createAnother?: boolean;
  }) => void;
  handleDelete: () => void;
};

export function EditTimeEntryDialog({
  dialogOpen,
  setDialogOpen,
  activeTimer,
  users,
  saveError,
  selectedMatterId,
  selectedUserId,
  activityCategory,
  dateStr,
  clientFacingDescription,
  rateStr,
  nonBillable,
  writtenOff,
  showOnBill,
  displayHoursStr,
  setActivityCategory,
  setDateStr,
  setRateStr,
  setNonBillable,
  setWrittenOff,
  setShowOnBill,
  setIsManualDuration,
  setManualDurationHours,
  handleMatterChange,
  handleUserChange,
  handleDescriptionChange,
  toggleTimerPlayback,
  saveTimeEntry,
  handleDelete
}: Readonly<Props>) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* Form */}
      <div className="p-6 space-y-5 text-sm">
        <p className="text-xl font-semibold">Edit Time Entry</p>
        {saveError && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-200 p-3 rounded-md flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Duration field */}
          <div className="space-y-1.5">
            <label
              htmlFor="duration"
              className="text-slate-300 font-medium flex items-center gap-1.5"
            >
              Duration
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={displayHoursStr}
                onChange={(e) => {
                  setIsManualDuration(true);
                  setManualDurationHours(e.target.value);
                }}
                className="bg-[#132238] border-[#2f3f56] text-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md font-mono"
              />
              <button
                onClick={toggleTimerPlayback}
                className="flex items-center gap-1.5 bg-[#132238] hover:bg-[#202f46] border border-[#2f3f56] text-white px-4 py-2 rounded-md font-mono shrink-0 select-none text-xs"
              >
                {activeTimer && !activeTimer.isPaused ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span>{formatDuration(getElapsedMs(activeTimer))}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-green-400 fill-green-400" />
                    <span>
                      {activeTimer
                        ? formatDuration(getElapsedMs(activeTimer))
                        : "00:00:00"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Matter field */}
          <div className="space-y-1.5">
            <p className="text-slate-300 mb-1.5 font-medium">
              Matter <span className="text-red-400">*</span>
            </p>
            <Select value={selectedMatterId} onValueChange={handleMatterChange}>
              <SelectTrigger className="w-full bg-[#132238] border-[#2f3f56] text-white focus:ring-1 focus:ring-blue-500 rounded-md text-left truncate">
                <SelectValue placeholder="Find a matter by matter name or client" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="z-100 bg-[#1a2638] border border-[#2f3f56] text-white"
              >
                <SelectItem value="Research" className="hover:bg-[#202f46]">
                  Matter 1 - Client A
                </SelectItem>
                <SelectItem value="Drafting" className="hover:bg-[#202f46]">
                  Matter 2 - Client B
                </SelectItem>
                <SelectItem value="Reviewing" className="hover:bg-[#202f46]">
                  Matter 3 - Client C
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity category */}
          <div className="space-y-1.5">
            <p className="text-slate-300 mb-1.5 font-medium">
              Activity Category
            </p>
            <Select
              value={activityCategory}
              onValueChange={setActivityCategory}
            >
              <SelectTrigger className="w-full bg-[#132238] border-[#2f3f56] text-white focus:ring-1 focus:ring-blue-500 rounded-md text-left truncate">
                <SelectValue placeholder="Find a category" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="z-100 bg-[#1a2638] border border-[#2f3f56] text-white"
              >
                <SelectItem value="Research" className="hover:bg-[#202f46]">
                  Research
                </SelectItem>
                <SelectItem value="Drafting" className="hover:bg-[#202f46]">
                  Drafting
                </SelectItem>
                <SelectItem value="Reviewing" className="hover:bg-[#202f46]">
                  Reviewing
                </SelectItem>
                <SelectItem
                  value="Client Meeting"
                  className="hover:bg-[#202f46]"
                >
                  Client Meeting
                </SelectItem>
                <SelectItem
                  value="Court Appearance"
                  className="hover:bg-[#202f46]"
                >
                  Court Appearance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <p className="text-slate-300 mb-1.5 font-medium">
              Date <span className="text-red-400">*</span>
            </p>
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-[#132238] border-[#2f3f56] text-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md scheme-dark"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:row-span-2">
            <p className="text-slate-300 mb-1.5 font-medium">Description</p>
            <Textarea
              value={clientFacingDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Client-facing notes..."
              className="bg-[#132238] border-[#2f3f56] text-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md h-28 resize-none"
            />
          </div>

          {/* Firm user */}
          <div className="space-y-1.5">
            <p className="text-slate-300 mb-1.5 font-medium">
              Firm user <span className="text-red-400">*</span>
            </p>
            <Select value={selectedUserId} onValueChange={handleUserChange}>
              <SelectTrigger className="w-full bg-[#132238] border-[#2f3f56] text-white focus:ring-1 focus:ring-blue-500 rounded-md">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="z-100 bg-[#1a2638] border border-[#2f3f56] text-white"
              >
                {users.map((u) => (
                  <SelectItem
                    key={u.id}
                    value={u.id}
                    className="hover:bg-[#202f46]"
                  >
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rate field */}
          <div className="space-y-1.5">
            <p className="text-slate-300 font-medium flex items-center gap-1">
              Rate <span className="text-red-400">*</span>
            </p>
            <div className="flex rounded-md overflow-hidden bg-input/30 border border-[#2f3f56] flex-1">
              <div className="text-[#94a3b8] px-3 py-2 flex items-center text-xs font-semibold select-none border-r border-[#2f3f56]">
                $
              </div>
              <input
                type="text"
                disabled={nonBillable}
                value={nonBillable ? "0.00" : rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                className="border-none text-white focus-visible:ring-0 focus-visible:outline-none focus:outline-none shadow-none rounded-none text-center"
              />
              <div className="text-[#94a3b8] px-3 w-max py-2 flex items-center text-xs font-semibold whitespace-nowrap select-none border-l border-[#2f3f56]">
                per hr
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes Row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-[#2c3d52]/50 text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={nonBillable}
              onChange={(e) => setNonBillable(e.target.checked)}
              className="rounded border-[#2f3f56] text-[#005bbb] focus:ring-offset-[#1a2638] bg-[#132238] h-4 w-4"
            />
            <span className="flex items-center gap-1">Non-billable</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={writtenOff}
              onChange={(e) => setWrittenOff(e.target.checked)}
              className="rounded border-[#2f3f56] text-[#005bbb] focus:ring-offset-[#1a2638] bg-[#132238] h-4 w-4"
            />
            <span>Written-off</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnBill}
              onChange={(e) => setShowOnBill(e.target.checked)}
              className="rounded border-[#2f3f56] text-[#005bbb] focus:ring-offset-[#1a2638] bg-[#132238] h-4 w-4"
            />
            <span>Show this entry on the bill</span>
          </label>
        </div>
      </div>
      {/* Footer Buttons */}
      <div className="bg-[#132238] p-4 flex flex-wrap gap-2 justify-between border-t border-[#2c3d52] items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => saveTimeEntry({})}
            className="bg-[#005bbb] text-white hover:bg-blue-600 font-bold px-5"
          >
            Save entry
          </Button>
          <Button
            variant="outline"
            onClick={() => saveTimeEntry({ createAnother: true })}
            className="border-[#2f3f56] text-white hover:bg-[#202f46] bg-transparent"
          >
            Save and create another
          </Button>
          <Button
            variant="outline"
            onClick={() => saveTimeEntry({ duplicate: true })}
            className="border-[#2f3f56] text-white hover:bg-[#202f46] bg-transparent hidden sm:inline-flex"
          >
            Save and duplicate
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setDialogOpen(false)}
            className="text-slate-300 hover:text-white hover:bg-[#202f46]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-[#a61c28] hover:bg-red-700 text-white font-bold"
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
