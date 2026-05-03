"use client";

import { useState, useRef } from "react";
import DailyHeader from "@/components/layout/DailyHeader";
import DailyFooter from "@/components/layout/DailyFooter";
import TaskPanel from "@/components/layout/TaskPanel";
import TimeTablePanel from "@/components/layout/TimeTablePanel";
import CalendarInline from "@/components/calendar/CalendarInline";
import FocusOverlay from "@/components/daily/FocusOverlay";

/**
 * 3열 너비 (flex-grow 비율, 합계 = 100)
 * 기본값: 화면 1280px 기준 현재 레이아웃 근사
 *   Calendar  ≈ 50%  (flex-1 영역)
 *   Timetable ≈ 25%  (300px / 1280px)
 *   Tasks     ≈ 25%  (300px / 1280px)
 */
interface Cols { cal: number; time: number; task: number }

const DEFAULT_COLS: Cols = { cal: 50, time: 25, task: 25 };
const MIN_GROW = 8; // 최소 flex-grow (≈ 8% → ~80px @ 1000px)

export default function DailyPage() {
  const [cols, setCols] = useState<Cols>(DEFAULT_COLS);
  const containerRef = useRef<HTMLElement>(null);

  /** 드래그 핸들 공통 로직
   *  which="left"  → Calendar | Timetable 경계 이동
   *  which="right" → Timetable | Tasks 경계 이동
   */
  function startDrag(e: React.MouseEvent, which: "left" | "right") {
    e.preventDefault();
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // movementX → flex-grow 단위 델타 (컨테이너 너비 기준 비율)
      const delta = (ev.movementX / rect.width) * 100;

      setCols((prev) => {
        if (which === "left") {
          const cal  = prev.cal  + delta;
          const time = prev.time - delta;
          if (cal < MIN_GROW || time < MIN_GROW) return prev;
          return { ...prev, cal, time };
        } else {
          const time = prev.time + delta;
          const task = prev.task - delta;
          if (time < MIN_GROW || task < MIN_GROW) return prev;
          return { ...prev, time, task };
        }
      });
    };

    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--color-paper)]">
      <DailyHeader />

      {/* CSS 변수로 flex-grow 값 전달 → globals.css .col-* 클래스가 소비 */}
      <main
        ref={containerRef}
        className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden"
        style={{
          "--col-cal":  cols.cal,
          "--col-time": cols.time,
          "--col-task": cols.task,
        } as React.CSSProperties}
      >
        {/* ── 달력 (lg+ 전용) ── */}
        <div className="col-calendar hidden lg:flex lg:flex-col border-r border-[var(--color-line)] lg:overflow-hidden">
          <CalendarInline />
        </div>

        {/* ── 드래그 핸들: Calendar | Timetable ── */}
        <div
          className="hidden lg:flex items-center justify-center shrink-0 cursor-ew-resize group"
          style={{ width: 8 }}
          onMouseDown={(e) => startDrag(e, "left")}
          title="너비 조절"
        >
          <div className="h-full w-px bg-[var(--color-line)] group-hover:bg-[var(--color-ink-muted)] transition-colors" />
        </div>

        {/* ── 타임테이블 ── */}
        <div className="col-timetable border-b lg:border-b-0 border-[var(--color-line)] lg:overflow-hidden">
          <TimeTablePanel />
        </div>

        {/* ── 드래그 핸들: Timetable | Tasks ── */}
        <div
          className="hidden lg:flex items-center justify-center shrink-0 cursor-ew-resize group"
          style={{ width: 8 }}
          onMouseDown={(e) => startDrag(e, "right")}
          title="너비 조절"
        >
          <div className="h-full w-px bg-[var(--color-line)] group-hover:bg-[var(--color-ink-muted)] transition-colors" />
        </div>

        {/* ── 태스크 목록 ── */}
        <div className="col-tasks lg:overflow-hidden">
          <TaskPanel />
        </div>
      </main>

      <DailyFooter />
      <FocusOverlay />
    </div>
  );
}
