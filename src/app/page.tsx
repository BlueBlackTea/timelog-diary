"use client";

import { useState, useRef, useCallback } from "react";
import DailyHeader from "@/components/layout/DailyHeader";
import DailyFooter from "@/components/layout/DailyFooter";
import TaskPanel from "@/components/layout/TaskPanel";
import TimeTablePanel from "@/components/layout/TimeTablePanel";
import FocusOverlay from "@/components/daily/FocusOverlay";

const MIN_TASK_PCT = 25;
const MAX_TASK_PCT = 80;
const DEFAULT_TASK_PCT = 66.67; // 화면 2/3

export default function DailyPage() {
  const [taskPct, setTaskPct] = useState(DEFAULT_TASK_PCT);
  const containerRef = useRef<HTMLElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setTaskPct(Math.min(MAX_TASK_PCT, Math.max(MIN_TASK_PCT, pct)));
    };

    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div className="flex flex-col min-h-screen md:h-screen md:overflow-hidden bg-[var(--color-paper)]">
      <DailyHeader />

      {/* --task-pct CSS 변수를 main에 주입 → .task-panel-col 이 md+ 에서만 사용 */}
      <main
        ref={containerRef}
        className="flex flex-col md:flex-row flex-1 md:overflow-hidden"
        style={{ "--task-pct": `${taskPct}%` } as React.CSSProperties}
      >
        {/* Task 패널: 모바일=전체폭, md+=--task-pct */}
        <div className="task-panel-col md:shrink-0 md:overflow-hidden">
          <TaskPanel />
        </div>

        {/* 드래그 핸들 (md+ 전용) */}
        <div
          className="hidden md:flex items-center justify-center shrink-0 cursor-ew-resize group"
          style={{ width: 12 }}
          onMouseDown={handleMouseDown}
          title="드래그해서 너비 조절"
        >
          <div className="h-full w-px bg-[var(--color-line)] group-hover:bg-[var(--color-ink-muted)] transition-colors" />
        </div>

        {/* 타임테이블 패널: 나머지 공간 */}
        <div className="flex-1 md:overflow-hidden">
          <TimeTablePanel />
        </div>
      </main>

      <DailyFooter />
      <FocusOverlay />
    </div>
  );
}
