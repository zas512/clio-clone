"use client";
import { useEffect, useState } from "react";
import { Clock, Play, Square } from "lucide-react";
import {
  useTimerStore,
  getElapsedMs,
  formatDuration
} from "@/zustand/timerStore";
import type { Matter } from "@/types";
import { EditTimeEntryDialog } from "./Dialog";

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
  const [selectedMatterId, setSelectedMatterId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activityCategory, setActivityCategory] = useState("");
  const [dateStr, setDateStr] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [clientFacingDescription, setClientFacingDescription] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [rateStr, setRateStr] = useState("0.00");

  const [isManualDuration, setIsManualDuration] = useState(false);
  const [manualDurationHours, setManualDurationHours] = useState("");
  const [nonBillable, setNonBillable] = useState(false);
  const [writtenOff, setWrittenOff] = useState(false);
  const [showOnBill, setShowOnBill] = useState(true);

  const activeTimer = timers[0];

  useEffect(() => {
    fetch("/api/matters")
      .then((r) => r.json())
      .then((data) => setMatters(data))
      .catch(() => setMatters([]));

    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        if (data.length > 0) setSelectedUserId(data[0].id);
      })
      .catch(() => setUsers([]));
  }, []);

  async function resolveRate(matterId: string, userId: string) {
    if (!matterId || !userId) return;
    try {
      const res = await fetch(
        `/api/rates/resolve?matterId=${matterId}&userId=${userId}`
      );
      const data = await res.json();
      setRateStr(res.ok ? data.rate.toFixed(2) : "300.00");
    } catch {
      setRateStr("300.00");
    }
  }

  function openDialogForTimer(timer: NonNullable<typeof activeTimer>) {
    setSelectedMatterId(timer.matterId || "");
    setClientFacingDescription(timer.clientFacingDescription || "");
    setInternalNote(timer.internalNote || "");
    setSaveError(null);
    setDialogOpen(true);

    if (timer.matterId && selectedUserId) {
      resolveRate(timer.matterId, selectedUserId);
    }
  }

  function handleTimerToggleClick() {
    if (activeTimer) {
      openDialogForTimer(activeTimer);
    } else {
      startTimer("", "");
      setSaveError(null);
      setIsManualDuration(false);
      setManualDurationHours("");
    }
  }

  function handleOpenDialogClick() {
    if (!activeTimer) return;
    openDialogForTimer(activeTimer);
  }

  function toggleTimerPlayback() {
    if (!activeTimer) return;
    if (activeTimer.isPaused) {
      resumeTimer(activeTimer.id);
    } else {
      pauseTimer(activeTimer.id);
      const hours = (getElapsedMs(activeTimer) / 3600000).toFixed(4);
      setManualDurationHours(hours + "h");
    }
  }

  function handleDefaultRateClick() {
    if (selectedMatterId && selectedUserId) {
      resolveRate(selectedMatterId, selectedUserId);
    }
  }

  function handleMatterChange(val: string) {
    setSelectedMatterId(val);
    const matter = matters.find((m) => m.id === val);
    if (matter && activeTimer) {
      updateTimer(activeTimer.id, { matterId: val, matterName: matter.name });
    }
    if (val && selectedUserId) resolveRate(val, selectedUserId);
  }

  function handleUserChange(val: string) {
    setSelectedUserId(val);
    if (selectedMatterId) resolveRate(selectedMatterId, val);
  }

  function handleDescriptionChange(val: string) {
    setClientFacingDescription(val);
    if (activeTimer) {
      updateTimer(activeTimer.id, { clientFacingDescription: val });
    }
  }

  let displayHoursStr = "0.0000h";
  if (activeTimer) {
    displayHoursStr = isManualDuration
      ? manualDurationHours
      : `${(getElapsedMs(activeTimer) / 3600000).toFixed(4)}h`;
  }

  function getFinalDurationMs(): number {
    if (!activeTimer) return 0;
    if (isManualDuration) {
      const numericVal = Number.parseFloat(
        manualDurationHours.replace("h", "")
      );
      if (!Number.isNaN(numericVal)) return Math.floor(numericVal * 3600000);
    }
    return getElapsedMs(activeTimer);
  }

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

    const rate = nonBillable ? 0 : Number.parseFloat(rateStr);

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

      if (options.duplicate) {
        // keep fields, show success notification elsewhere
      } else if (options.createAnother) {
        stopTimer(activeTimer.id);
        startTimer("", "");
        setIsManualDuration(false);
        setManualDurationHours("");
      } else {
        stopTimer(activeTimer.id);
        setDialogOpen(false);
      }

      return true;
    } catch {
      setSaveError("Failed to save time entry. Please try again.");
      return false;
    }
  }

  function handleDelete() {
    if (activeTimer) discardTimer(activeTimer.id);
    setDialogOpen(false);
  }

  const isRunning = !!activeTimer && !activeTimer.isPaused;

  return (
    <>
      <div className="flex">
        <button
          onClick={handleTimerToggleClick}
          className={`flex items-center gap-2 rounded-l border px-4 py-1.5 text-xs font-semibold text-white transition-all shadow-md ${
            isRunning
              ? "bg-red-950/40 border-red-500/40 hover:bg-red-900/50"
              : "bg-black/30 border-[#2f3f56] hover:bg-black/45"
          }`}
        >
          {isRunning ? (
            <Square className="h-3 w-3 text-red-400 fill-red-400" />
          ) : (
            <Play className="h-3 w-3 text-white" />
          )}
          <span className="font-mono text-sm">
            {activeTimer
              ? formatDuration(getElapsedMs(activeTimer))
              : "00:00:00"}
          </span>
        </button>
        <button
          onClick={handleOpenDialogClick}
          className="rounded-r bg-black/30 border border-[#2f3f56] border-l-white/50 p-2 py-1.5 text-white transition-all shadow-md hover:bg-black/45 disabled:opacity-40"
        >
          <Clock className="size-5" />
        </button>
      </div>

      <EditTimeEntryDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        activeTimer={activeTimer}
        matters={matters}
        users={users}
        saveError={saveError}
        selectedMatterId={selectedMatterId}
        selectedUserId={selectedUserId}
        activityCategory={activityCategory}
        dateStr={dateStr}
        clientFacingDescription={clientFacingDescription}
        rateStr={rateStr}
        nonBillable={nonBillable}
        writtenOff={writtenOff}
        showOnBill={showOnBill}
        displayHoursStr={displayHoursStr}
        setActivityCategory={setActivityCategory}
        setDateStr={setDateStr}
        setRateStr={setRateStr}
        setNonBillable={setNonBillable}
        setWrittenOff={setWrittenOff}
        setShowOnBill={setShowOnBill}
        setIsManualDuration={setIsManualDuration}
        setManualDurationHours={setManualDurationHours}
        handleMatterChange={handleMatterChange}
        handleUserChange={handleUserChange}
        handleDescriptionChange={handleDescriptionChange}
        handleDefaultRateClick={handleDefaultRateClick}
        toggleTimerPlayback={toggleTimerPlayback}
        saveTimeEntry={saveTimeEntry}
        handleDelete={handleDelete}
      />
    </>
  );
}
