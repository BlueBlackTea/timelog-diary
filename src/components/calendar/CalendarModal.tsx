"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { useDailyStore } from "@/store/dailyStore";

interface Props {
  onClose: () => void;
}

const DOW_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}M`;
  if (m === 0) return `${h}H`;
  return `${h}H${String(m).padStart(2, "0")}M`;
}

// 0~480분(8H) 기준 0~1 강도 반환
function getIntensity(minutes: number): number {
  return Math.min(minutes / 480, 1);
}

export default function CalendarModal({ onClose }: Props) {
  const { currentDate, allDayTotals, setCurrentDate } = useDailyStore();

  const today = dayjs().format("YYYY-MM-DD");
  const [viewMonth, setViewMonth] = useState(() =>
    dayjs(currentDate).startOf("month")
  );

  const startOfMonth = viewMonth.startOf("month");
  const endOfMonth = viewMonth.endOf("month");
  // 달력 그리드 시작: 해당 월 1일의 요일(0=SUN)만큼 앞 빈 칸
  const startPad = startOfMonth.day();
  const daysInMonth = endOfMonth.date();
  // 6주 그리드 (최대 42칸)
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  function handleDayClick(date: string) {
    setCurrentDate(date);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-paper)] border border-[var(--color-line)] shadow-xl w-[480px] max-w-[95vw] rounded-sm flex flex-col">

        {/* 헤더 — 월 이동 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-line)]">
          <button
            onClick={() => setViewMonth((m) => m.subtract(1, "month"))}
            className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            aria-label="이전 달"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10 3 5 8 10 13" />
            </svg>
          </button>

          <span className="font-gothic text-sm font-bold tracking-widest text-[var(--color-ink)]">
            {viewMonth.format("YYYY . MM")}
          </span>

          <button
            onClick={() => setViewMonth((m) => m.add(1, "month"))}
            className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            aria-label="다음 달"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 3 11 8 6 13" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 px-2 pt-3 pb-1">
          {DOW_LABELS.map((d) => (
            <div
              key={d}
              className="text-center font-gothic text-[9px] font-bold tracking-widest text-[var(--color-ink-muted)] pb-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-px px-2 pb-3">
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - startPad + 1;
            if (dayNum < 1 || dayNum > daysInMonth) {
              return <div key={i} />;
            }

            const date = viewMonth.date(dayNum).format("YYYY-MM-DD");
            const minutes = allDayTotals[date] ?? 0;
            const intensity = getIntensity(minutes);
            const isToday = date === today;
            const isSelected = date === currentDate;

            return (
              <button
                key={date}
                onClick={() => handleDayClick(date)}
                className="relative flex flex-col items-center justify-start py-1.5 rounded-sm transition-opacity hover:opacity-80 min-h-[52px]"
                style={{
                  backgroundColor:
                    intensity > 0
                      ? `rgba(255, 190, 190, ${intensity * 0.75})`
                      : undefined,
                  outline: isSelected ? "2px solid var(--color-ink)" : undefined,
                  outlineOffset: "-2px",
                }}
              >
                {/* 날짜 숫자 */}
                <span
                  className="font-gothic text-[11px] font-bold leading-none"
                  style={{
                    color: isToday
                      ? "var(--color-ink)"
                      : "var(--color-ink-muted)",
                    textDecoration: isToday ? "underline" : undefined,
                    textUnderlineOffset: "2px",
                  }}
                >
                  {dayNum}
                </span>

                {/* 기록 시간 */}
                {minutes > 0 && (
                  <span className="mt-1 font-gothic text-[9px] leading-none text-[var(--color-ink)] font-bold">
                    {formatMinutes(minutes)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
