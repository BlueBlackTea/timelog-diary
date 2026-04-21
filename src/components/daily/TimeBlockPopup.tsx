"use client";

import { useState } from "react";
import { useDailyStore, type TimeBlock } from "@/store/dailyStore";

interface Props {
  start: string;
  end: string;
  onSave: (block: Omit<TimeBlock, "id">) => void;
  onClose: () => void;
}

export default function TimeBlockPopup({ start, end, onSave, onClose }: Props) {
  const { tasks, currentDate } = useDailyStore();

  const [startTime, setStartTime] = useState(start);
  const [endTime, setEndTime] = useState(end);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    tasks.length > 0 ? tasks[0].id : null
  );
  const [memo, setMemo] = useState("");

  // taskName 기준 그룹핑
  const groupOrder: string[] = [];
  const groups: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    if (!groups[task.taskName]) {
      groups[task.taskName] = [];
      groupOrder.push(task.taskName);
    }
    groups[task.taskName].push(task);
  }

  function handleSave() {
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMinutes <= 0) return;

    onSave({
      date: currentDate,
      taskId: task.id,
      workType: task.workType,
      taskName: task.taskName,
      detail: task.detail,
      color: task.color,
      start: startTime,
      end: endTime,
      durationMinutes,
      memo,
    });
  }

  return (
    /* 배경 오버레이 */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-paper)] border border-[var(--color-line)] shadow-lg w-80 rounded-sm flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)]">
          <span className="font-gothic text-[11px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
            New Time Block
          </span>
          <button onClick={onClose} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-lg leading-none">×</button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">

          {/* 시간 범위 */}
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="font-gothic text-sm bg-[var(--color-paper-dark)] border border-[var(--color-line)] rounded-sm px-2 py-1 outline-none flex-1"
            />
            <span className="font-gothic text-xs text-[var(--color-ink-muted)]">~</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="font-gothic text-sm bg-[var(--color-paper-dark)] border border-[var(--color-line)] rounded-sm px-2 py-1 outline-none flex-1"
            />
          </div>

          {/* Task 선택 */}
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">Task</span>
            {tasks.length === 0 ? (
              <p className="font-handwriting text-sm text-[var(--color-ink-muted)]">등록된 Task가 없습니다.</p>
            ) : (
              groupOrder.map((name) => (
                <div key={name} className="flex flex-col gap-0.5">
                  {groups[name].map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-2 px-2 py-1 rounded-sm cursor-pointer hover:bg-[var(--color-paper-dark)]"
                      style={{ backgroundColor: selectedTaskId === task.id ? task.color + "33" : undefined }}
                    >
                      <input
                        type="radio"
                        name="task"
                        value={task.id}
                        checked={selectedTaskId === task.id}
                        onChange={() => setSelectedTaskId(task.id)}
                        className="accent-[var(--color-ink-muted)]"
                      />
                      <span className="font-handwriting text-base leading-5 text-[var(--color-ink)]">
                        {task.taskName}
                        {task.detail && (
                          <span className="text-[var(--color-ink-muted)] text-sm ml-1">— {task.detail}</span>
                        )}
                      </span>
                      <span
                        className="ml-auto w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                    </label>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* 메모 */}
          <div className="flex flex-col gap-1">
            <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">Memo</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택)"
              rows={2}
              className="font-handwriting text-base bg-[var(--color-paper-dark)] border border-[var(--color-line)] rounded-sm px-2 py-1 outline-none resize-none text-[var(--color-ink)] placeholder:text-[var(--color-line)]"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="font-gothic text-xs px-3 py-1.5 border border-[var(--color-line)] rounded-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedTaskId}
              className="font-gothic text-xs px-3 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] rounded-sm disabled:opacity-30"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
