"use client";

import { useDailyStore, type Task } from "@/store/dailyStore";
import Highlighter from "@/components/ui/Highlighter";
import { useResizeObserver } from "@/hooks/useResizeObserver";

/**
 * T1-06 Task 목록 렌더링
 * T1-08 Task 완료 체크 토글
 *
 * 그룹 구조:
 *   [TaskNameRow]  — taskName + Highlighter (ResizeObserver 실측)
 *     [DetailRow]  — detail 텍스트 + 체크박스 (T1-08) + ▶ 포커스 타이머 버튼
 *     [DetailRow]  — ...
 *
 * 같은 taskName을 가진 Task들은 하나의 그룹으로 묶인다.
 * 그룹의 모든 항목이 완료되면 Highlighter opacity 0.45.
 * 포커스 타이머는 detail 항목(task.id) 단위로 기록됨.
 */

// ── 그룹 헤더 (업무명 + 형광펜) ──────────────────────────────────────────
interface TaskNameRowProps {
  taskName: string;
  color: string;
  workType: string;
  allCompleted: boolean;
  onDeleteGroup: () => void;
}

function TaskNameRow({ taskName, color, workType, allCompleted, onDeleteGroup }: TaskNameRowProps) {
  const { ref, width } = useResizeObserver<HTMLSpanElement>();

  return (
    <div className="flex items-center gap-2 px-3 pt-2 pb-0.5 group/row">
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

      {/* 업무유형 칩 */}
      <span
        className="font-gothic text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0"
        style={{ backgroundColor: color + "33", color }}
      >
        {workType}
      </span>

      {/* 그룹 전체 삭제 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteGroup(); }}
        title="그룹 전체 삭제"
        className="shrink-0 opacity-0 group-hover/row:opacity-40 hover:!opacity-100 transition-opacity
                   text-[var(--color-ink-muted)] hover:text-red-400 font-gothic text-xs leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ── 개별 내용 행 (체크박스 + detail 텍스트 + ▶ 타이머 버튼 + × 삭제) ──────────────
interface DetailRowProps {
  task: Task;
}

function DetailRow({ task }: DetailRowProps) {
  const { toggleTask, removeTask, activeTimer, startTimer } = useDailyStore();
  const isRunning = activeTimer?.taskId === task.id;

  return (
    <label className="flex items-center gap-2 px-4 py-0.5 cursor-pointer group/detail">
      {/* T1-08: 완료 체크박스 */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        className="w-3.5 h-3.5 shrink-0 accent-[var(--color-ink-muted)] cursor-pointer"
      />
      {/* T1-08: 완료 시 취소선 + opacity */}
      <span
        className="flex-1 font-handwriting text-base leading-6 text-[var(--color-ink)] transition-opacity"
        style={{
          opacity: task.completed ? 0.45 : 1,
          textDecoration: task.completed ? "line-through" : "none",
        }}
      >
        {task.detail || "—"}
      </span>

      {/* 포커스 타이머 버튼 — task.id 단위 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startTimer(task);
        }}
        title="포커스 타이머 시작"
        className="shrink-0 transition-opacity hover:opacity-100"
        style={{
          opacity: isRunning ? 1 : 0.3,
          color: isRunning ? task.color : "var(--color-ink-muted)",
        }}
      >
        {isRunning ? (
          /* 기록 중 — 펄스 원 */
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: task.color }}
          />
        ) : (
          /* 재생 삼각형 */
          <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
            <polygon points="0,0 9,5 0,10" />
          </svg>
        )}
      </button>

      {/* 항목 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeTask(task.id);
        }}
        title="삭제"
        className="shrink-0 opacity-0 group-hover/detail:opacity-40 hover:!opacity-100 transition-opacity
                   text-[var(--color-ink-muted)] hover:text-red-400 font-gothic text-xs leading-none"
      >
        ×
      </button>
    </label>
  );
}

// ── 메인 TaskList ─────────────────────────────────────────────────────────
export default function TaskList() {
  const { tasks, removeTask } = useDailyStore();

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
        const workType = groupTasks[0].workType;
        const allCompleted = groupTasks.every((t) => t.completed);

        return (
          <div key={name} className="mb-1">
            <TaskNameRow
              taskName={name}
              color={color}
              workType={workType}
              allCompleted={allCompleted}
              onDeleteGroup={() => groupTasks.forEach((t) => removeTask(t.id))}
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
