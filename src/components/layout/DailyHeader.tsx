"use client";

import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useDailyStore } from "@/store/dailyStore";

dayjs.locale("ko");

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}M`;
  if (m === 0) return `${h}H`;
  return `${h}H${String(m).padStart(2, "0")}M`;
}

export default function DailyHeader() {
  const { currentDate, day, setComment } = useDailyStore();

  const d = dayjs(currentDate);
  const dateStr = d.format("YYYYMMDD");
  const dayLabel = DAY_LABELS[d.day()];

  return (
    <header className="flex items-end gap-6 px-8 py-4 border-b border-[var(--color-line)] bg-[var(--color-paper)]">
      {/* 날짜 / 요일 */}
      <div className="flex items-baseline gap-3 shrink-0">
        <span className="font-gothic text-4xl font-black tracking-tight text-[var(--color-ink)] leading-none">
          {dateStr}
        </span>
        <span className="font-gothic text-xl font-bold text-[var(--color-ink-muted)] leading-none">
          {dayLabel}
        </span>
      </div>

      {/* 총 기록시간 */}
      <div className="shrink-0 flex items-baseline gap-1">
        <span className="font-gothic text-xs font-bold text-[var(--color-ink-muted)] tracking-widest uppercase">
          Total
        </span>
        <span className="font-gothic text-2xl font-black text-[var(--color-ink)] leading-none">
          {formatMinutes(day.totalMinutes)}
        </span>
      </div>

      {/* 코멘트 */}
      <input
        type="text"
        value={day.comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="오늘 하루 한 줄 코멘트..."
        className="flex-1 font-handwriting text-xl bg-transparent border-none outline-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] caret-[var(--color-ink-muted)]"
      />
    </header>
  );
}
