"use client";
import { useEffect, useState } from "react";
import { Clock, Play, Pause, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  useTimerStore,
  getElapsedMs,
  formatDuration
} from "@/zustand/timerStore";
import type { Matter } from "@/types";

// Tick hook to force update every second
function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
}

type UserOption = {
  id: string;
  name: string;
  email: string;
  defaultHourlyRate: number;
};

export function TimeTracker() {
  useTick();
  const timers = useTimerStore((s) => s.timers);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const discardTimer = useTimerStore((s) => s.discardTimer);
  const updateTimer = useTimerStore((s) => s.updateTimer);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dialog form state
  const [selectedMatterId, setSelectedMatterId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [activityCategory, setActivityCategory] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [clientFacingDescription, setClientFacingDescription] =
    useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");
  const [rateStr, setRateStr] = useState<string>("0.00");

  // Duration override state
  const [isManualDuration, setIsManualDuration] = useState(false);
  const [manualDurationHours, setManualDurationHours] = useState("");

  // Checkboxes
  const [nonBillable, setNonBillable] = useState(false);
  const [writtenOff, setWrittenOff] = useState(false);
  const [showOnBill, setShowOnBill] = useState(true);

  // Active timer reference
  const activeTimer = timers[0];

  // Fetch matters and users on mount
  useEffect(() => {
    fetch("/api/matters")
      .then((r) => r.json())
      .then((data) => setMatters(data))
      .catch(() => setMatters([]));

    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        if (data.length > 0) {
          setSelectedUserId(data[0].id);
        }
      })
      .catch(() => setUsers([]));

    // Set default date to today in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    setDateStr(today);
  }, []);

  // Update dialog form inputs when a timer becomes active/loaded
  useEffect(() => {
    if (activeTimer && dialogOpen) {
      setSelectedMatterId(activeTimer.matterId || "");
      setClientFacingDescription(activeTimer.clientFacingDescription || "");
      setInternalNote(activeTimer.internalNote || "");

      // Calculate active rate
      if (activeTimer.matterId && selectedUserId) {
        resolveRate(activeTimer.matterId, selectedUserId);
      }
    }
  }, [activeTimer, dialogOpen]);

  // Resolve rate from server when matter or user changes
  async function resolveRate(matterId: string, userId: string) {
    if (!matterId || !userId) return;
    try {
      const res = await fetch(
        `/api/rates/resolve?matterId=${matterId}&userId=${userId}`
      );
      const data = await res.json();
      if (res.ok) {
        setRateStr(data.rate.toFixed(2));
      } else {
        setRateStr("300.00");
      }
    } catch {
      setRateStr("300.00"); // fallback
    }
  }

  // Handle clicking the timer button in the top bar
  function handleTimerButtonClick() {
    if (!activeTimer) {
      // Start a new unassigned timer
      startTimer("", "");
      setSaveError(null);
      setIsManualDuration(false);
      setManualDurationHours("");
    } else {
      // Open dialog to save/edit the active timer
      setDialogOpen(true);
      setSaveError(null);
    }
  }

  // Handle pausing/resuming from inside the dialog
  function toggleTimerPlayback() {
    if (!activeTimer) return;
    if (activeTimer.isPaused) {
      resumeTimer(activeTimer.id);
    } else {
      pauseTimer(activeTimer.id);
      // When pausing, set the manual duration helper to the frozen elapsed time if they want to edit it
      const elapsedMs = getElapsedMs(activeTimer);
      const hours = (elapsedMs / (1000 * 60 * 60)).toFixed(4);
      setManualDurationHours(hours + "h");
    }
  }

  // Reset rate to default
  function handleDefaultRateClick() {
    if (selectedMatterId && selectedUserId) {
      resolveRate(selectedMatterId, selectedUserId);
    }
  }

  // Calculate live hours to display
  let displayHoursStr = "0.0000h";
  if (activeTimer) {
    if (isManualDuration) {
      displayHoursStr = manualDurationHours;
    } else {
      const elapsedMs = getElapsedMs(activeTimer);
      const hours = (elapsedMs / (1000 * 60 * 60)).toFixed(4);
      displayHoursStr = `${hours}h`;
    }
  }

  // Parse custom hours back to ms
  function getFinalDurationMs(): number {
    if (!activeTimer) return 0;
    if (isManualDuration) {
      const numericVal = parseFloat(manualDurationHours.replace("h", ""));
      if (!isNaN(numericVal)) {
        return Math.floor(numericVal * 3600 * 1000);
      }
    }
    return getElapsedMs(activeTimer);
  }

  // API Call to save time entry
  async function saveTimeEntry(options: {
    duplicate?: boolean;
    createAnother?: boolean;
  }) {
    if (!activeTimer) return false;

    if (!selectedMatterId) {
      setSaveError("Please select a matter before saving");
      return false;
    }

    const durationMs = getFinalDurationMs();
    if (durationMs <= 0) {
      setSaveError("Duration must be greater than 0");
      return false;
    }

    const rate = nonBillable ? 0 : parseFloat(rateStr);

    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matterId: selectedMatterId,
          userId: selectedUserId,
          clientFacingDescription,
          internalNote,
          durationMs,
          rate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save time entry");
        return false;
      }

      setSaveError(null);

      // Handle timer cleanup/transitions
      if (options.duplicate) {
        // Keep same fields, but show success notification
      } else if (options.createAnother) {
        // Stop current timer
        stopTimer(activeTimer.id);
        // Start a brand new timer immediately
        startTimer("", "");
        // Reset dialog states
        setIsManualDuration(false);
        setManualDurationHours("");
      } else {
        // Stop timer and close dialog
        stopTimer(activeTimer.id);
        setDialogOpen(false);
      }

      return true;
    } catch {
      setSaveError("Failed to save time entry. Please try again.");
      return false;
    }
  }

  return (
    <>
      {/* Top Bar Timer Button */}
      <button
        onClick={handleTimerButtonClick}
        className="flex items-center gap-2 rounded bg-slate-900 border border-[#2f3f56] px-4 py-1.5 text-xs font-semibold text-white transition-all shadow-md hover:bg-slate-800"
      >
        <Play
          className={`h-3 w-3 ${activeTimer && !activeTimer.isPaused ? "text-green-400 fill-green-400" : "text-white"}`}
        />
        <span className="font-mono text-sm">
          {activeTimer ? formatDuration(getElapsedMs(activeTimer)) : "00:00:00"}
        </span>
        <Clock className="h-4 w-4 text-blue-200" />
      </button>

      {/* Edit Time Entry Dialog (Image 2 styling) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-[#1a2638] text-white border border-[#2c3d52] p-0 rounded-xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 border-b border-[#2c3d52] flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-wide">
              Edit time entry
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="p-6 space-y-5 text-sm">
            {saveError && (
              <div className="bg-red-950/50 border border-red-500/50 text-red-200 p-3 rounded-md flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Duration field */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  Duration{" "}
                  <HelpCircle className="h-3.5 w-3.5 text-blue-400 cursor-pointer" />
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={displayHoursStr}
                    onChange={(e) => {
                      setIsManualDuration(true);
                      setManualDurationHours(e.target.value);
                    }}
                    className="bg-[#132238] border-[#2f3f56] text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-md font-mono"
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
                <label className="text-slate-300 font-medium">Matter</label>
                <Select
                  value={selectedMatterId}
                  onValueChange={(val) => {
                    setSelectedMatterId(val);
                    const matter = matters.find((m) => m.id === val);
                    if (matter && activeTimer) {
                      updateTimer(activeTimer.id, {
                        matterId: val,
                        matterName: matter.name
                      });
                    }
                    if (val && selectedUserId) {
                      resolveRate(val, selectedUserId);
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#132238] border-[#2f3f56] text-white focus:ring-1 focus:ring-blue-500 rounded-md text-left truncate">
                    <SelectValue placeholder="Find a matter by matter name or client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2638] border-[#2f3f56] text-white">
                    {matters.map((m) => (
                      <SelectItem
                        key={m.id}
                        value={m.id}
                        className="hover:bg-[#202f46] focus:bg-[#202f46] text-slate-200"
                      >
                        {m.name} ({m.clientName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Activity category */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">
                  Activity category
                </label>
                <Select
                  value={activityCategory}
                  onValueChange={setActivityCategory}
                >
                  <SelectTrigger className="bg-[#132238] border-[#2f3f56] text-white focus:ring-1 focus:ring-blue-500 rounded-md">
                    <SelectValue placeholder="Find a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2638] border-[#2f3f56] text-white">
                    <SelectItem value="Research" className="hover:bg-[#202f46]">
                      Research
                    </SelectItem>
                    <SelectItem value="Drafting" className="hover:bg-[#202f46]">
                      Drafting
                    </SelectItem>
                    <SelectItem
                      value="Reviewing"
                      className="hover:bg-[#202f46]"
                    >
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
                <label className="text-slate-300 font-medium">
                  Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="bg-[#132238] border-[#2f3f56] text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-md [color-scheme:dark]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:row-span-2">
                <label className="text-slate-300 font-medium">
                  Description
                </label>
                <Textarea
                  value={clientFacingDescription}
                  onChange={(e) => {
                    setClientFacingDescription(e.target.value);
                    if (activeTimer) {
                      updateTimer(activeTimer.id, {
                        clientFacingDescription: e.target.value
                      });
                    }
                  }}
                  placeholder="Client-facing notes..."
                  className="bg-[#132238] border-[#2f3f56] text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-md h-28 resize-none"
                />
              </div>

              {/* Firm user */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">
                  Firm user <span className="text-red-400">*</span>
                </label>
                <Select
                  value={selectedUserId}
                  onValueChange={(val) => {
                    setSelectedUserId(val);
                    if (selectedMatterId) {
                      resolveRate(selectedMatterId, val);
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#132238] border-[#2f3f56] text-white focus:ring-1 focus:ring-blue-500 rounded-md">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2638] border-[#2f3f56] text-white">
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
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  Rate <span className="text-red-400">*</span>
                  <HelpCircle className="h-3.5 w-3.5 text-blue-400 cursor-pointer" />
                </label>
                <div className="flex gap-2 items-center">
                  <div className="flex rounded-md overflow-hidden bg-[#132238] border border-[#2f3f56] flex-1">
                    <span className="bg-[#202f46] text-[#94a3b8] px-3 py-2 flex items-center text-xs font-semibold select-none border-r border-[#2f3f56]">
                      Rs
                    </span>
                    <Input
                      type="text"
                      disabled={nonBillable}
                      value={nonBillable ? "0.00" : rateStr}
                      onChange={(e) => setRateStr(e.target.value)}
                      className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:outline-none focus:outline-none shadow-none rounded-none text-center font-mono h-full"
                    />
                    <span className="bg-[#202f46] text-[#94a3b8] px-3 py-2 flex items-center text-xs font-semibold select-none border-l border-[#2f3f56]">
                      PKR / hr
                    </span>
                  </div>
                  <button
                    onClick={handleDefaultRateClick}
                    disabled={nonBillable}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0 disabled:opacity-40 disabled:hover:text-blue-400"
                  >
                    Default rate
                  </button>
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
                <span className="flex items-center gap-1">
                  Non-billable{" "}
                  <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                </span>
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
                onClick={() => {
                  if (activeTimer) {
                    discardTimer(activeTimer.id);
                  }
                  setDialogOpen(false);
                }}
                className="bg-[#a61c28] hover:bg-red-700 text-white font-bold"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
