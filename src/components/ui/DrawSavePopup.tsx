"use client";

import { useState, useMemo } from "react";
import { useDailyStore } from "@/store/dailyStore";
import type { CellRange } from "@/components/daily/TimeTable";

interface Props {
  ranges: CellRange[];
  onSave: () => void;
  onClose: () => void;
}

// "HH:MM" + 분 수치 → "HH:MM"
function addMinutes(time: string, delta: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.max(0, Math.min(24 * 60, h * 60 + m + delta));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
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
  const { taskMasters, addTimeBlock, currentDate } = useDailyStore();

  // 각 구간별 편집 상태 (start/end 텍스트 편집 가능)
  const [editedRanges, setEditedRanges] = useState<CellRange[]>(() =>
    ranges.map((r) => ({ ...r }))
  );
  const [selectedMasterId, setSelectedMasterId] = useState<string>(
    taskMasters[0]?.id ?? ""
  );

  const totalMinutes = useMemo(
    () => editedRanges.reduce((sum, r) => sum + r.minutes, 0),
    [editedRanges]
  );

  const selectedMaster = taskMasters.find((m) => m.id === selectedMasterId);

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
    if (!selectedMaster) return;
    for (const r of editedRanges) {
      if (r.minutes <= 0) continue;
      addTimeBlock({
        date: currentDate,
        taskId: "",
        taskName: selectedMaster.name,
        detail: "",
        workType: selectedMaster.workType,
        color: selectedMaster.color,
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

        {/* 구간 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {editedRanges.length === 0 && (
            <p className="font-handwriting text-base text-[var(--color-ink-muted)] text-center py-4">
              선택된 시간 없음
            </p>
          )}

          {editedRanges.map((r, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-3 rounded bg-[var(--color-paper-dark)]">
              <div className="flex items-center gap-2">
                {/* 시작 시간 */}
                <input
                  type="time"
                  value={r.startStr}
                  onChange={(e) => updateRange(i, "startStr", e.target.value)}
                  className="font-gothic text-sm bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] pb-0.5 w-[5.5rem]"
                />
                <span className="font-gothic text-[10px] text-[var(--color-ink-muted)]">~</span>
                {/* 종료 시간 */}
                <input
                  type="time"
                  value={r.endStr}
                  onChange={(e) => updateRange(i, "endStr", e.target.value)}
                  className="font-gothic text-sm bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] pb-0.5 w-[5.5rem]"
                />
                {/* 계산된 분 수 */}
                <span className="font-gothic text-[10px] text-[var(--color-ink-muted)] ml-auto shrink-0">
                  {r.minutes > 0 ? formatDuration(r.minutes) : "—"}
                </span>
              </div>
            </div>
          ))}

          {/* 합계 */}
          {editedRanges.length > 0 && (
            <div className="flex justify-between items-center px-1 pt-1 border-t border-[var(--color-line)]">
              <span className="font-gothic text-[10px] text-[var(--color-ink-muted)] uppercase tracking-widest">
                Total
              </span>
              <span className="font-handwriting text-base text-[var(--color-ink)]">
                {formatDuration(totalMinutes)}
              </span>
            </div>
          )}
        </div>

        {/* 태스크 선택 + 저장 */}
        <div className="border-t border-[var(--color-line)] px-4 py-3 flex flex-col gap-2">
          {taskMasters.length === 0 ? (
            <p className="font-handwriting text-sm text-[var(--color-ink-muted)] text-center py-1">
              업무명을 먼저 등록해주세요
            </p>
          ) : (
            <div className="flex items-center gap-2">
              {/* 태스크 선택 드롭다운 */}
              <div className="relative flex-1">
                <select
                  value={selectedMasterId}
                  onChange={(e) => setSelectedMasterId(e.target.value)}
                  className="w-full font-handwriting text-base bg-transparent border-b border-[var(--color-line)]
                             outline-none text-[var(--color-ink)] pb-0.5 appearance-none cursor-pointer pr-5"
                >
                  {taskMasters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-ink-muted)] text-[9px]">
                  ▾
                </span>
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={!selectedMaster || totalMinutes <= 0}
                className="shrink-0 font-gothic text-xs font-bold px-3 py-1.5 rounded
                           bg-[var(--color-ink)] text-[var(--color-paper)]
                           hover:opacity-80 transition-opacity disabled:opacity-35"
              >
                저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
