"use client";

import RuledLines from "@/components/ui/RuledLines";
import TaskList from "@/components/daily/TaskList";
import TaskInput from "@/components/daily/TaskInput";

export default function TaskPanel() {
  return (
    <section className="relative flex flex-col border-b md:border-b-0 md:border-r border-[var(--color-line)] overflow-hidden h-[50vh] md:h-full">
      {/* 패널 헤더 */}
      <div className="px-4 py-2 border-b border-[var(--color-line)] shrink-0">
        <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
          Tasks
        </span>
      </div>

      {/* 줄 노트 배경 + Task 목록 */}
      <div className="relative flex-1 overflow-y-auto">
        <RuledLines />
        <div className="relative z-10">
          <TaskList />
        </div>
      </div>

      {/* 입력 폼 — 패널 하단 고정 */}
      <TaskInput />
    </section>
  );
}
