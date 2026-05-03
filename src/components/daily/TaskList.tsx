"use client";

import { useDailyStore, type Task } from "@/store/dailyStore";
import type { ActiveTimer } from "@/store/dailyStore";
import Highlighter from "@/components/ui/Highlighter";
import { useResizeObserver } from "@/hooks/useResizeObserver";

/**
 * T1-06 Task 목록 렌더링
 * T1-08 Task 완료 체크 토글
 *
 * 그룹 구조:
 *   [TaskNameRow]  — taskName + Highlighter (ResizeObserver 실측)
 *     [DetailRow]  — detail 텍스트 + 체크박스 (T1-08)
 *     [DetailRow]  — ...
 *
 * 같은 taskName을 가진 Task들은 하나의 그룹으로 묶인다.
 * 그룹의 모든 항목이 완료되면 Highlighter opacity 0.45.
 */

// ── 그룹 헤더 (업무명 + 형광펜) ──────────────────────────────────────────
interface TaskNameRowProps {
  taskName: string;
  color: string;
  allCompleted: boolean;
  activeTimer: ActiveTimer | null;
  onStartTimer: () => void;
}

function TaskNameRow({ taskName, color, allCompleted, activeTimer, onStartTimer }: TaskNameRowProps) {
  const { ref, width } = useResizeObserver<HTMLSpanElement>();
  const isRunning = activeTimer?.taskName === taskName;

  return (
    <div className="flex items-center gap-2 px-3 pt-2 pb-0.5">
      {/* 형광펜 + 업무명 */}
      <div className="relative flex-1" style={{ height: 20 }}>
        <span
          ref={ref}
          className="relative z-10 font-handwriting text-lg leading-5 whitespace-nowrap"
          style={{ opacity: allCompleted ? 0.45 : 1 }}
        >
          {taskName}
        </span>
        <Highlighter
          color={color}
          width={width}
          completed={allCompleted}
          id={taskName}
        />
      </div>

      {/* 포커스 타이머 시작 버튼 */}
      <button
        onClick={onStartTimer}
        title="포커스 타이머 시작"
        className="shrink-0 transition-opacity hover:opacity-100"
        style={{
          opacity: isRunning ? 1 : 0.35,
          color: isRunning ? color : "var(--color-ink-muted)",
        }}
      >
        {isRunning ? (
          /* 기록 중 — 펄스 원 */
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : (
          /* 재생 삼각형 */
          <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
            <polygon points="0,0 9,5 0,10" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── 개별 내용 행 (체크박스 + detail 텍스트) ──────────────────────────────
interface DetailRowProps {
  task: Task;
}

function DetailRow({ task }: DetailRowProps) {
  const { toggleTask } = useDailyStore();

  return (
    <label className="flex items-center gap-2 px-4 py-0.5 cursor-pointer group">
      {/* T1-08: 완료 체크박스 */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        className="w-3.5 h-3.5 shrink-0 accent-[var(--color-ink-muted)] cursor-pointer"
      />
      {/* T1-08: 완료 시 취소선 + opacity */}
      <span
        className="font-handwriting text-base leading-6 text-[var(--color-ink)] transition-opacity"
        style={{
          opacity: task.completed ? 0.45 : 1,
          textDecoration: task.completed ? "line-through" : "none",
        }}
      >
        {task.detail || "—"}
      </span>
    </label>
  );
}

// ── 메인 TaskList ─────────────────────────────────────────────────────────
export default function TaskList() {
  const { tasks, activeTimer, startTimer } = useDailyStore();

  if (tasks.length === 0) {
    return (
      <p className="px-3 pt-[5px] pb-0 font-handwriting text-base leading-7 text-[var(--color-line)]">
        오늘의 업무를 추가하세요.
      </p>
    );
  }

  // taskName 순서 유지하며 그룹핑 (첫 등장 순서)
  const groupOrder: string[] = [];
  const groups: Record<string, Task[]> = {};

  for (const task of tasks) {
    if (!groups[task.taskName]) {
      groups[task.taskName] = [];
      groupOrder.push(task.taskName);
    }
    groups[task.taskName].push(task);
  }

  return (
    <div className="flex flex-col">
      {groupOrder.map((name) => {
        const groupTasks = groups[name];
        const color = groupTasks[0].color;
        const allCompleted = groupTasks.every((t) => t.completed);

        return (
          <div key={name} className="mb-1">
            <TaskNameRow
              taskName={name}
              color={color}
              allCompleted={allCompleted}
              activeTimer={activeTimer}
              onStartTimer={() => startTimer(groupTasks[0])}
            />
            {groupTasks.map((task) => (
              <DetailRow key={task.id} task={task} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
