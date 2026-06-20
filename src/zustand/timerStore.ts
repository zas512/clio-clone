import { create } from "zustand";

export type RunningTimer = {
  id: string;
  matterId: string;
  matterName: string;
  clientFacingDescription: string;
  internalNote: string;
  startedAt: number;
  elapsedBeforePause: number;
  isPaused: boolean;
};

type TimerStore = {
  timers: RunningTimer[];
  startTimer: (matterId: string, matterName: string) => string;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  updateDescription: (
    id: string,
    field: "clientFacingDescription" | "internalNote",
    value: string
  ) => void;
  stopTimer: (id: string) => RunningTimer | undefined;
  discardTimer: (id: string) => void;
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  timers: [],

  startTimer: (matterId, matterName) => {
    const id = crypto.randomUUID();
    const newTimer: RunningTimer = {
      id,
      matterId,
      matterName,
      clientFacingDescription: "",
      internalNote: "",
      startedAt: Date.now(),
      elapsedBeforePause: 0,
      isPaused: false
    };
    set((state) => ({ timers: [...state.timers, newTimer] }));
    return id;
  },

  pauseTimer: (id) => {
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id && !t.isPaused
          ? {
              ...t,
              isPaused: true,
              elapsedBeforePause:
                t.elapsedBeforePause + (Date.now() - t.startedAt)
            }
          : t
      )
    }));
  },

  resumeTimer: (id) => {
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id && t.isPaused
          ? { ...t, isPaused: false, startedAt: Date.now() }
          : t
      )
    }));
  },

  updateDescription: (id, field, value) => {
    set((state) => ({
      timers: state.timers.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  },

  stopTimer: (id) => {
    const timer = get().timers.find((t) => t.id === id);
    set((state) => ({ timers: state.timers.filter((t) => t.id !== id) }));
    return timer;
  },

  discardTimer: (id) => {
    set((state) => ({ timers: state.timers.filter((t) => t.id !== id) }));
  }
}));

export function getElapsedMs(timer: RunningTimer): number {
  if (timer.isPaused) return timer.elapsedBeforePause;
  return timer.elapsedBeforePause + (Date.now() - timer.startedAt);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
