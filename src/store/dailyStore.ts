import { create } from "zustand";
import { persist } from "zustand/middleware";
import dayjs from "dayjs";

export type WorkType = "회의" | "업무" | "공부" | "외근" | "기타";

export const WORK_TYPE_COLORS: Record<WorkType, string> = {
  업무: "#FFBEBE",
  회의: "#586994",
  공부: "#7D869C",
  외근: "#69995D",
  기타: "#CADBC0",
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

export interface TaskMaster {
  id: string;
  name: string;
  workType: WorkType;
  color: string;
}

export interface ActiveTimer {
  taskId: string;
  taskName: string;
  detail: string;
  workType: WorkType;
  color: string;
  startedAt: number; // Date.now()
}

interface DailyStore {
  currentDate: string;
  day: DayData;
  tasks: Task[];
  timeBlocks: TimeBlock[];
  allDayTotals: Record<string, number>;
  activeTimer: ActiveTimer | null;
  taskMasters: TaskMaster[];

  setCurrentDate: (date: string) => void;
  setComment: (comment: string) => void;
  setMemo: (memo: string) => void;
  setReview: (review: string) => void;
  setTomorrow: (tomorrow: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addTimeBlock: (block: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  removeTimeBlock: (id: string) => void;
  recalcTotalMinutes: () => void;
  startTimer: (task: Task) => void;
  stopTimer: () => void;
  addTaskMaster: (master: Omit<TaskMaster, "id">) => void;
  updateTaskMaster: (id: string, updates: Partial<Omit<TaskMaster, "id">>) => void;
  removeTaskMaster: (id: string) => void;
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
      activeTimer: null,
      taskMasters: [],

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

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

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

      addTaskMaster: (master) =>
        set((s) => ({
          taskMasters: [...s.taskMasters, { ...master, id: `tm_${genId()}` }],
        })),

      updateTaskMaster: (id, updates) =>
        set((s) => ({
          taskMasters: s.taskMasters.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      removeTaskMaster: (id) =>
        set((s) => ({
          taskMasters: s.taskMasters.filter((m) => m.id !== id),
        })),

      startTimer: (task) =>
        set({
          activeTimer: {
            taskId: task.id,
            taskName: task.taskName,
            detail: task.detail,
            workType: task.workType,
            color: task.color,
            startedAt: Date.now(),
          },
        }),

      stopTimer: () => {
        const { activeTimer, currentDate, addTimeBlock } = get();
        if (!activeTimer) return;
        const endedAt = Date.now();
        const durationMinutes = Math.max(1, Math.round((endedAt - activeTimer.startedAt) / 60000));
        set({ activeTimer: null });
        addTimeBlock({
          date: currentDate,
          taskId: activeTimer.taskId,
          taskName: activeTimer.taskName,
          detail: activeTimer.detail,
          workType: activeTimer.workType,
          color: activeTimer.color,
          start: dayjs(activeTimer.startedAt).format("HH:mm"),
          end: dayjs(endedAt).format("HH:mm"),
          durationMinutes,
          memo: "",
        });
      },
    }),
    {
      name: "timelog-diary",
      partialize: (s) => ({
        // currentDate 제외 — 앱 로드 시 항상 오늘 날짜로 초기화
        day: s.day,
        tasks: s.tasks,
        timeBlocks: s.timeBlocks,
        allDayTotals: s.allDayTotals,
        taskMasters: s.taskMasters,
        // activeTimer 제외 — 새로고침 시 타이머 초기화
      }),
    }
  )
);
