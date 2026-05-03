"use client";

import { useState, useMemo } from "react";
import { useDailyStore } from "@/store/dailyStore";
import type { CellRange } from "@/components/daily/TimeTable";

interface Props {
  ranges: CellRange[];
  onSave: () => void;
  onClose: () => void;
}

function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

export default function DrawSavePopup({ ranges, onSave, onClose }: Props) {
  const { tasks, addTimeBlock, currentDate } = useDailyStore();

  const [editedRanges, setEditedRanges] = useState<CellRange[]>(() =>
    ranges.map((r) => ({ ...r }))
  );
  // 오늘의 task.id 단위로 선택
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    tasks.length > 0 ? tasks[0].id : null
  );

  const totalMinutes = useMemo(
    () => editedRanges.reduce((sum, r) => sum + r.minutes, 0),
    [editedRanges]
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // taskName 기준 그룹핑 (TimeBlockPopup과 동일 패턴)
  const groupOrder: string[] = [];
  const groups: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    if (!groups[task.taskName]) {
      groups[task.taskName] = [];
      groupOrder.push(task.taskName);
    }
    groups[task.taskName].push(task);
  }

  function updateRange(idx: number, field: "startStr" | "endStr", value: string) {
    setEditedRanges((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const next = { ...r, [field]: value };
        next.minutes = diffMinutes(next.startStr, next.endStr);
        return next;
      })
    );
  }

  function handleSave() {
    if (!selectedTask) return;
    for (const r of editedRanges) {
      if (r.minutes <= 0) continue;
      addTimeBlock({
        date: currentDate,
        taskId: selectedTask.id,
        taskName: selectedTask.taskName,
        detail: selectedTask.detail,
        workType: selectedTask.workType,
        color: selectedTask.color,
        start: r.startStr,
        end: r.endStr,
        durationMinutes: r.minutes,
        memo: "",
      });
    }
    onSave();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(44,44,44,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-paper)] rounded-lg shadow-xl w-full max-w-sm mx-4 flex flex-col max-h-[85vh]">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <span className="font-gothic text-sm font-bold tracking-widest text-[var(--color-ink)] uppercase">
            시간 저장
          </span>
          <button
            onClick={onClose}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* 시간 구간 목록 */}
          <div className="px-4 py-3 flex flex-col gap-2.5">
            <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
              시간
            </span>

            {editedRanges.length === 0 && (
              <p className="font-handwriting text-base text-[var(--color-ink-muted)] py-2">
                선택된 시간 없음
              </p>
            )}

            {editedRanges.map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--color-paper-dark)]">
                <input
                  type="time"
                  value={r.startStr}
                  onChange={(e) => updateRange(i, "startStr", e.target.value)}
                  className="font-gothic text-sm bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] pb-0.5 w-[5.5rem]"
                />
                <span className="font-gothic text-[10px] text-[var(--color-ink-muted)]">~</span>
                <input
                  type="time"
                  value={r.endStr}
                  onChange={(e) => updateRange(i, "endStr", e.target.value)}
                  className="font-gothic text-sm bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] pb-0.5 w-[5.5rem]"
                />
                <span className="font-gothic text-[10px] text-[var(--color-ink-muted)] ml-auto shrink-0">
                  {r.minutes > 0 ? formatDuration(r.minutes) : "—"}
                </span>
              </div>
            ))}

            {editedRanges.length > 0 && (
              <div className="flex justify-between items-center px-1 pt-1 border-t border-[var(--color-line)]">
                <span className="font-gothic text-[10px] text-[var(--color-ink-muted)] uppercase tracking-widest">Total</span>
                <span className="font-handwriting text-base text-[var(--color-ink)]">
                  {formatDuration(totalMinutes)}
                </span>
              </div>
            )}
          </div>

          {/* 태스크 선택 — 오늘의 Task 목록 (TimeBlockPopup 패턴 동일) */}
          <div className="px-4 pb-3 flex flex-col gap-1.5">
            <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
              Task
            </span>

            {tasks.length === 0 ? (
              <p className="font-handwriting text-sm text-[var(--color-ink-muted)]">
                오늘 등록된 Task가 없습니다
              </p>
            ) : (
              <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto">
                {groupOrder.map((name) => (
                  <div key={name} className="flex flex-col gap-0.5">
                    {groups[name].map((task) => (
                      <label
                        key={task.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-[var(--color-paper-dark)]"
                        style={{
                          backgroundColor: selectedTaskId === task.id ? task.color + "33" : undefined,
                        }}
                      >
                        <input
                          type="radio"
                          name="draw-task"
                          value={task.id}
                          checked={selectedTaskId === task.id}
                          onChange={() => setSelectedTaskId(task.id)}
                          className="accent-[var(--color-ink-muted)]"
                        />
                        <span className="flex-1 font-handwriting text-base leading-5 text-[var(--color-ink)]">
                          {task.taskName}
                          {task.detail && (
                            <span className="text-[var(--color-ink-muted)] text-sm ml-1">
                              — {task.detail}
                            </span>
                          )}
                        </span>
                        <span
                          className="ml-auto w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.color }}
                        />
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="border-t border-[var(--color-line)] px-4 py-3 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="font-gothic text-xs px-3 py-1.5 border border-[var(--color-line)] rounded-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedTask || totalMinutes <= 0}
            className="font-gothic text-xs font-bold px-3 py-1.5 rounded-sm bg-[var(--color-ink)] text-[var(--color-paper)] disabled:opacity-30 hover:opacity-80 transition-opacity"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
