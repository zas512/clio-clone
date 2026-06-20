"use client";
import { useEffect, useState } from "react";
import { Clock, Pause, Play, Square, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useTimerStore,
  getElapsedMs,
  formatDuration
} from "@/zustand/timerStore";
import type { Matter } from "@/types";

function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
}

export function TimeTracker() {
  useTick();
  const timers = useTimerStore((s) => s.timers);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const discardTimer = useTimerStore((s) => s.discardTimer);
  const updateDescription = useTimerStore((s) => s.updateDescription);

  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const runningCount = timers.length;

  useEffect(() => {
    fetch("/api/matters")
      .then((r) => r.json())
      .then(setMatters)
      .catch(() => setMatters([]));
  }, []);

  function handleStart() {
    const matter = matters.find((m) => m.id === selectedMatter);
    if (!matter) return;
    startTimer(matter.id, matter.name);
    setSelectedMatter("");
    setSaveError(null);
  }

  async function handleStop(id: string) {
    const timer = timers.find((t) => t.id === id);
    const stopped = stopTimer(id);
    if (!stopped || !timer) return;

    const durationMs = getElapsedMs(timer);

    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matterId: stopped.matterId,
          clientFacingDescription: stopped.clientFacingDescription,
          internalNote: stopped.internalNote,
          durationMs
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save time entry");
        return;
      }

      setSaveError(null);
    } catch {
      setSaveError("Failed to save time entry — is MONGODB_URI configured?");
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative gap-2">
          <Clock className="h-4 w-4" />
          {runningCount > 0 ? (
            <span className="font-mono text-sm">
              {formatDuration(getElapsedMs(timers[0]))}
            </span>
          ) : (
            <span className="text-sm">Track time</span>
          )}
          {runningCount > 1 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {runningCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="p-3">
          <p className="mb-2 text-sm font-medium">Start a new timer</p>
          <div className="flex gap-2">
            <Select value={selectedMatter} onValueChange={setSelectedMatter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a matter" />
              </SelectTrigger>
              <SelectContent>
                {matters.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              onClick={handleStart}
              disabled={!selectedMatter}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {saveError && (
            <p className="mt-2 text-xs text-destructive">{saveError}</p>
          )}
        </div>

        {timers.length > 0 && <Separator />}

        <div className="max-h-96 overflow-y-auto">
          {timers.map((timer) => (
            <div key={timer.id} className="border-b p-3 last:border-b-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{timer.matterName}</p>
                <span className="font-mono text-sm text-muted-foreground">
                  {formatDuration(getElapsedMs(timer))}
                </span>
              </div>

              <Input
                placeholder="Client-facing description"
                value={timer.clientFacingDescription}
                onChange={(e) =>
                  updateDescription(
                    timer.id,
                    "clientFacingDescription",
                    e.target.value
                  )
                }
                className="mb-2"
              />
              <Textarea
                placeholder="Internal note (not shown to client)"
                value={timer.internalNote}
                onChange={(e) =>
                  updateDescription(timer.id, "internalNote", e.target.value)
                }
                className="mb-2 min-h-14"
              />

              <div className="flex items-center justify-end gap-1">
                {timer.isPaused ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => resumeTimer(timer.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => pauseTimer(timer.id)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => discardTimer(timer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStop(timer.id)}
                  className="gap-1"
                >
                  <Square className="h-3 w-3" /> Stop & Save
                </Button>
              </div>
            </div>
          ))}

          {timers.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No timers running
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
