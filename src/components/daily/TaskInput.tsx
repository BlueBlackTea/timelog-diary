"use client";

import { useState, useRef, useEffect } from "react";
import {
  useDailyStore,
  WORK_TYPE_COLORS,
  type WorkType,
} from "@/store/dailyStore";
import Chip from "@/components/ui/Chip";

const WORK_TYPES: WorkType[] = ["업무", "회의", "공부", "외근", "기타"];

export default function TaskInput() {
  const { addTask, tasks, taskMasters, currentDate } = useDailyStore();

  const [taskName, setTaskName] = useState("");
  const [detail, setDetail] = useState("");
  const [workType, setWorkType] = useState<WorkType>("업무");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = taskMasters.filter((m) =>
    m.name.toLowerCase().includes(taskName.toLowerCase())
  );
  const showDropdown = dropdownOpen && taskMasters.length > 0;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function selectMaster(name: string, wt: WorkType) {
    setTaskName(name);
    setWorkType(wt);
    setDropdownOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim()) return;

    const dayTasks = tasks.filter((t) => t.date === currentDate);
    addTask({
      date: currentDate,
      taskName: taskName.trim(),
      detail: detail.trim(),
      workType,
      color: WORK_TYPE_COLORS[workType],
      completed: false,
      order: dayTasks.length,
    });

    setDetail("");
    // 같은 업무명으로 연속 추가를 위해 taskName 유지
  }

  const isExistingName = tasks.some(
    (t) => t.date === currentDate && t.taskName === taskName.trim() && taskName.trim() !== ""
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-[var(--color-line)] bg-[var(--color-paper-dark)] px-3 py-2 flex flex-col gap-2"
    >
      {/* 업무유형 칩 */}
      <div className="flex gap-1 flex-wrap">
        {WORK_TYPES.map((wt) => (
          <Chip
            key={wt}
            label={wt}
            color={WORK_TYPE_COLORS[wt]}
            selected={workType === wt}
            onClick={() => setWorkType(wt)}
          />
        ))}
      </div>

      {/* 입력 행 */}
      <div className="flex items-center gap-2">
        {/* 업무명 드롭다운 */}
        <div ref={containerRef} className="relative w-[45%]">
          <input
            type="text"
            value={taskName}
            onChange={(e) => { setTaskName(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setDropdownOpen(false);
              if (e.key === "Enter") { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
            }}
            placeholder="업무명"
            className="w-full font-handwriting text-lg bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] pb-0.5"
          />

          {/* 드롭다운 목록 */}
          {showDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--color-paper)] border border-[var(--color-line)] rounded shadow-md z-20 max-h-40 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="font-handwriting text-sm text-[var(--color-ink-muted)] px-3 py-2">
                  일치하는 업무명 없음
                </p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectMaster(m.name, m.workType); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--color-paper-dark)] text-left transition-colors"
                  >
                    <span
                      className="shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="flex-1 font-handwriting text-base text-[var(--color-ink)] leading-tight">
                      {m.name}
                    </span>
                    <span
                      className="font-gothic text-[9px] font-bold px-1 py-0.5 rounded-sm shrink-0"
                      style={{ backgroundColor: m.color + "33", color: m.color }}
                    >
                      {m.workType}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 내용 */}
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
          }}
          placeholder={isExistingName ? "내용 추가" : "내용"}
          className="flex-1 font-handwriting text-base bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] pb-0.5"
        />

        {/* 추가 버튼 */}
        <button
          type="submit"
          className="shrink-0 font-gothic text-xs font-bold px-2 py-1 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          + 추가
        </button>
      </div>
    </form>
  );
}
