"use client";

import TimeTable from "@/components/daily/TimeTable";

const MIN_LABELS = ["00", "10", "20", "30", "40", "50"];

export default function TimeTablePanel() {
  return (
    <section className="relative flex flex-col overflow-hidden h-[60vh] md:h-full md:border-l border-[var(--color-line)]">
      {/* 패널 헤더 */}
      <div className="px-4 py-2 border-b border-[var(--color-line)] shrink-0">
        <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
          Timetable
        </span>
      </div>

      {/* 분 단위 컬럼 헤더 (00 ~ 50) */}
      <div className="flex shrink-0 border-b border-[var(--color-line)] bg-[var(--color-paper)]">
        {/* 시간 레이블 열 너비 맞춤 */}
        <div className="shrink-0 w-9" />
        {/* 6개 컬럼 (10분 단위) */}
        <div className="flex-1 flex border-l border-[var(--color-line)]">
          {MIN_LABELS.map((m, i) => (
            <div
              key={m}
              className="flex-1 text-center font-gothic text-[7px] leading-none text-[var(--color-ink-muted)] py-[3px]"
              style={{
                borderLeft: i > 0
                  ? "1px solid color-mix(in srgb, var(--color-line) 55%, transparent)"
                  : undefined,
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* 타임테이블 본문 */}
      <div className="flex-1 overflow-y-auto bg-[var(--color-paper)]" style={{ scrollbarGutter: "stable" }}>
        <TimeTable />
      </div>
    </section>
  );
}
