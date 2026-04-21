import DailyHeader from "@/components/layout/DailyHeader";
import DailyFooter from "@/components/layout/DailyFooter";
import TaskPanel from "@/components/layout/TaskPanel";
import TimeTablePanel from "@/components/layout/TimeTablePanel";

/**
 * 메인 데일리 페이지
 *
 * 레이아웃:
 *   ┌─────────────────────────────────────────────┐
 *   │  DailyHeader: 날짜 / 요일 / 코멘트 / 총시간   │
 *   ├──────────────────┬──────────────────────────┤
 *   │  TaskPanel (35%) │  TimeTablePanel (65%)    │
 *   ├──────────────────┴──────────────────────────┤
 *   │  DailyFooter: 메모 / 회고 / 내일포인트        │
 *   └─────────────────────────────────────────────┘
 */
/**
 * 레이아웃 반응형 기준 (Tailwind md: 768px)
 *
 * 모바일  : 단일 컬럼 — Header / Tasks / Timetable / Footer 순 스크롤
 * md 이상 : 좌우 2단 고정 — Header / [Tasks 35% | Timetable 65%] / Footer
 */
export default function DailyPage() {
  return (
    <div className="flex flex-col min-h-screen md:h-screen md:overflow-hidden bg-[var(--color-paper)]">
      {/* 상단 */}
      <DailyHeader />

      {/* 중단: 모바일=단일컬럼 / md+=좌우2단 */}
      <main className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        {/* Task 패널 — 모바일: 전체폭, md+: 35% */}
        <div className="w-full md:w-[35%] md:min-w-[280px]">
          <TaskPanel />
        </div>

        {/* 타임테이블 패널 — 모바일: 전체폭, md+: 나머지 */}
        <div className="w-full md:flex-1">
          <TimeTablePanel />
        </div>
      </main>

      {/* 하단 */}
      <DailyFooter />
    </div>
  );
}
