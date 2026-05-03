"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { useDailyStore } from "@/store/dailyStore";

const DOW_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}M`;
  if (m === 0) return `${h}H`;
  return `${h}H${String(m).padStart(2, "0")}M`;
}

function getIntensity(minutes: number): number {
  return Math.min(minutes / 480, 1);
}

export default function CalendarInline() {
  const { currentDate, allDayTotals, setCurrentDate } = useDailyStore();
  const today = dayjs().format("YYYY-MM-DD");
  const [viewMonth, setViewMonth] = useState(() =>
    dayjs(currentDate).startOf("month")
  );

  const startOfMonth = viewMonth.startOf("month");
  const endOfMonth   = viewMonth.endOf("month");
  const startPad     = startOfMonth.day();
  const daysInMonth  = endOfMonth.date();
  const totalCells   = Math.ceil((startPad + daysInMonth) / 7) * 7;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 패널 헤더 */}
      <div className="px-4 py-2 border-b border-[var(--color-line)] shrink-0 flex items-center">
        <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
          Calendar
        </span>
      </div>

      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)] shrink-0">
        <button
          onClick={() => setViewMonth((m) => m.subtract(1, "month"))}
          className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          aria-label="이전 달"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 3 5 8 10 13" />
          </svg>
        </button>
        <span className="font-gothic text-sm font-bold tracking-widest text-[var(--color-ink)]">
          {viewMonth.format("YYYY . MM")}
        </span>
        <button
          onClick={() => setViewMonth((m) => m.add(1, "month"))}
          className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          aria-label="다음 달"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 3 11 8 6 13" />
          </svg>
        </button>
      </div>

      {/* 달력 그리드
          - max-w-[560px] mx-auto: 공간이 넉넉하면 좌우 여백 생성, 정방형 유지
          - aspect-square on each cell: 너비=높이 항상 유지
          - 패널이 너무 좁으면 셀이 작아지되 정방형 유지 (lg 미만은 hidden 처리)
      */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="mx-auto w-full max-w-[560px] px-3">
          {/* DOW 레이블 + 날짜 셀을 단일 grid로 → 열 정렬 완벽 일치 */}
          <div className="grid grid-cols-7">

            {/* 요일 헤더 행 */}
            {DOW_LABELS.map((d) => (
              <div
                key={d}
                className="flex items-center justify-center pb-1
                           font-gothic text-[9px] font-bold tracking-widest
                           text-[var(--color-ink-muted)]"
              >
                {d}
              </div>
            ))}

            {/* 날짜 셀 — aspect-square로 정방형 강제 */}
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - startPad + 1;

              /* 빈 셀도 aspect-square로 공간 확보 */
              if (dayNum < 1 || dayNum > daysInMonth) {
                return <div key={i} className="aspect-square" />;
              }

              const date       = viewMonth.date(dayNum).format("YYYY-MM-DD");
              const minutes    = allDayTotals[date] ?? 0;
              const intensity  = getIntensity(minutes);
              const isToday    = date === today;
              const isSelected = date === currentDate;

              return (
                <button
                  key={date}
                  onClick={() => setCurrentDate(date)}
                  className="aspect-square flex flex-col items-center justify-center
                             rounded-sm transition-opacity hover:opacity-75 gap-0.5"
                  style={{
                    backgroundColor: intensity > 0
                      ? `rgba(255, 190, 190, ${intensity * 0.75})`
                      : undefined,
                    outline:       isSelected ? "2px solid var(--color-ink)" : undefined,
                    outlineOffset: isSelected ? "-2px" : undefined,
                  }}
                >
                  <span
                    className="font-gothic text-[11px] font-bold leading-none"
                    style={{
                      color:          isToday ? "var(--color-ink)" : "var(--color-ink-muted)",
                      textDecoration: isToday ? "underline" : undefined,
                      textUnderlineOffset: "2px",
                    }}
                  >
                    {dayNum}
                  </span>
                  {minutes > 0 && (
                    <span className="font-gothic text-[8px] leading-none text-[var(--color-ink)] font-bold">
                      {formatMinutes(minutes)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
