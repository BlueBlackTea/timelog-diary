"use client";

import TimeTable from "@/components/daily/TimeTable";

export default function TimeTablePanel() {
  return (
    <section className="relative flex flex-col overflow-hidden h-[60vh] md:h-full border-l border-[var(--color-line)]">
      <div className="px-4 py-2 border-b border-[var(--color-line)] shrink-0">
        <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
          Timetable
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-[var(--color-paper)]">
        <div className="py-1">
          <TimeTable />
        </div>
      </div>
    </section>
  );
}
