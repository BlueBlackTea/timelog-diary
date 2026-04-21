"use client";

import { useState } from "react";
import { useDailyStore, WORK_TYPE_COLORS, type WorkType } from "@/store/dailyStore";
import Chip from "@/components/ui/Chip";

const WORK_TYPES: WorkType[] = ["업무", "회의", "공부", "외근", "기타"];

/**
 * T1-05 Task 입력 컴포넌트
 *
 * 인라인 다이어리 스타일. TaskPanel 하단에 고정.
 * - 업무명 (taskName) 필수
 * - 내용 (detail) 선택
 * - 업무유형 칩 선택 → 색상 자동 배정 (T1-15: WORK_TYPE_COLORS 기반)
 * - 같은 업무명으로 반복 추가 가능 (taskName 유지, detail만 초기화)
 */
export default function TaskInput() {
  const { addTask, tasks, currentDate } = useDailyStore();

  const [taskName, setTaskName] = useState("");
  const [detail, setDetail] = useState("");
  const [workType, setWorkType] = useState<WorkType>("업무");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim()) return;

    addTask({
      date: currentDate,
      taskName: taskName.trim(),
      detail: detail.trim(),
      workType,
      color: WORK_TYPE_COLORS[workType],
      completed: false,
      order: tasks.length,
    });

    // 같은 업무명으로 내용만 다르게 추가할 수 있도록 taskName 유지
    setDetail("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const isExistingName = tasks.some(
    (t) => t.taskName === taskName.trim() && taskName.trim() !== ""
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-[var(--color-line)] bg-[var(--color-paper-dark)] px-3 py-2 flex flex-col gap-2"
    >
      {/* 업무유형 칩 선택 */}
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
        {/* 업무명 */}
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="업무명"
          className="w-[45%] font-handwriting text-lg bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] pb-0.5"
        />

        {/* 내용 — 기존 업무명이면 "추가 내용" 힌트 */}
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isExistingName ? "내용 추가..." : "내용 (선택)"}
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
