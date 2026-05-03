import DailyHeader from "@/components/layout/DailyHeader";
import DailyFooter from "@/components/layout/DailyFooter";
import TaskPanel from "@/components/layout/TaskPanel";
import TimeTablePanel from "@/components/layout/TimeTablePanel";
import CalendarInline from "@/components/calendar/CalendarInline";
import FocusOverlay from "@/components/daily/FocusOverlay";

export default function DailyPage() {
  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--color-paper)]">
      <DailyHeader />

      {/*
        모바일 (<lg):   세로 스택 — Timetable → Tasks
        데스크톱 (lg+): 3열   — Calendar(flex-1) | Timetable(고정) | Tasks(고정)
      */}
      <main className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">

        {/* ── 달력 사이드바 (lg+ 전용) ── */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-w-[200px] lg:border-r border-[var(--color-line)] lg:overflow-hidden">
          <CalendarInline />
        </div>

        {/* ── 타임테이블 — 모바일 최상단, 데스크톱 중앙 ── */}
        <div className="border-b lg:border-b-0 lg:border-r border-[var(--color-line)] lg:w-[300px] lg:shrink-0 lg:overflow-hidden">
          <TimeTablePanel />
        </div>

        {/* ── 태스크 목록 — 모바일 두 번째, 데스크톱 우측 ── */}
        <div className="lg:w-[300px] lg:shrink-0 lg:overflow-hidden">
          <TaskPanel />
        </div>
      </main>

      <DailyFooter />
      <FocusOverlay />
    </div>
  );
}
