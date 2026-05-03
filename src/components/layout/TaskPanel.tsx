"use client";

import { useState } from "react";
import RuledLines from "@/components/ui/RuledLines";
import TaskList from "@/components/daily/TaskList";
import TaskInput from "@/components/daily/TaskInput";
import TaskMasterModal from "@/components/ui/TaskMasterModal";

export default function TaskPanel() {
  const [masterModalOpen, setMasterModalOpen] = useState(false);

  return (
    <section className="relative flex flex-col border-b md:border-b-0 border-[var(--color-line)] overflow-hidden h-[50vh] md:h-full">
      {/* 패널 헤더 */}
      <div className="px-4 py-2 border-b border-[var(--color-line)] shrink-0 flex items-center justify-between">
        <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
          Tasks
        </span>
        <button
          onClick={() => setMasterModalOpen(true)}
          title="업무명 관리"
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="4" x2="12" y2="4" />
            <line x1="2" y1="7" x2="12" y2="7" />
            <line x1="2" y1="10" x2="8" y2="10" />
          </svg>
        </button>
      </div>

      {masterModalOpen && (
        <TaskMasterModal onClose={() => setMasterModalOpen(false)} />
      )}

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
