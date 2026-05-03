import { create } from "zustand";
import { persist } from "zustand/middleware";
import dayjs from "dayjs";

export type WorkType = "회의" | "업무" | "공부" | "외근" | "기타";

export const WORK_TYPE_COLORS: Record<WorkType, string> = {
  업무: "#FFBEBE",
  회의: "#C4C8DA",
  공부: "#FFEDB5",
  외근: "#CADBC0",
  기타: "#D4D3CE",
};

export interface Task {
  id: string;
  date: string;
  taskName: string;
  detail: string;
  workType: WorkType;
  color: string;
  completed: boolean;
  order: number;
}

export interface TimeBlock {
  id: string;
  date: string;
  taskId: string;
  workType: WorkType;
  taskName: string;
  detail: string;
  color: string;
  start: string;
  end: string;
  durationMinutes: number;
  memo: string;
}

export interface DayData {
  date: string;
  comment: string;
  memo: string;
  review: string;
  tomorrow: string;
  totalMinutes: number;
}

interface DailyStore {
  currentDate: string;
  day: DayData;
  tasks: Task[];
  timeBlocks: TimeBlock[];
  allDayTotals: Record<string, number>;

  setCurrentDate: (date: string) => void;
  setComment: (comment: string) => void;
  setMemo: (memo: string) => void;
  setReview: (review: string) => void;
  setTomorrow: (tomorrow: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  addTimeBlock: (block: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  removeTimeBlock: (id: string) => void;
  recalcTotalMinutes: () => void;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useDailyStore = create<DailyStore>()(
  persist(
    (set, get) => ({
      currentDate: dayjs().format("YYYY-MM-DD"),
      day: {
        date: dayjs().format("YYYY-MM-DD"),
        comment: "",
        memo: "",
        review: "",
        tomorrow: "",
        totalMinutes: 0,
      },
      tasks: [],
      timeBlocks: [],
      allDayTotals: {},

      setCurrentDate: (date) =>
        set({ currentDate: date, day: { ...get().day, date } }),

      setComment: (comment) =>
        set((s) => ({ day: { ...s.day, comment } })),

      setMemo: (memo) =>
        set((s) => ({ day: { ...s.day, memo } })),

      setReview: (review) =>
        set((s) => ({ day: { ...s.day, review } })),

      setTomorrow: (tomorrow) =>
        set((s) => ({ day: { ...s.day, tomorrow } })),

      addTask: (task) =>
        set((s) => ({
          tasks: [...s.tasks, { ...task, id: `task_${genId()}` }],
        })),

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      addTimeBlock: (block) => {
        set((s) => ({
          timeBlocks: [
            ...s.timeBlocks,
            { ...block, id: `block_${genId()}` },
          ],
        }));
        get().recalcTotalMinutes();
      },

      updateTimeBlock: (id, updates) => {
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
        get().recalcTotalMinutes();
      },

      removeTimeBlock: (id) => {
        set((s) => ({
          timeBlocks: s.timeBlocks.filter((b) => b.id !== id),
        }));
        get().recalcTotalMinutes();
      },

      recalcTotalMinutes: () =>
        set((s) => {
          const total = s.timeBlocks.reduce(
            (sum, b) => sum + b.durationMinutes,
            0
          );
          return {
            day: { ...s.day, totalMinutes: total },
            allDayTotals: { ...s.allDayTotals, [s.currentDate]: total },
          };
        }),
    }),
    { name: "timelog-diary" }
  )
);
