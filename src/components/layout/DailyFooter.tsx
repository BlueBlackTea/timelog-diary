"use client";

import { useDailyStore } from "@/store/dailyStore";

export default function DailyFooter() {
  const { day, setMemo, setReview, setTomorrow } = useDailyStore();

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-paper)] px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:h-28">
        {/* 자유 메모 */}
        <div className="flex flex-col gap-1">
          <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
            Memo
          </span>
          <textarea
            value={day.memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="자유 메모..."
            className="flex-1 font-handwriting text-lg bg-transparent border-none outline-none resize-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] leading-7"
          />
        </div>

        {/* 하루 회고 */}
        <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-[var(--color-line)] pt-4 md:pt-0 md:pl-6">
          <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
            Review
          </span>
          <textarea
            value={day.review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="오늘 하루 회고..."
            className="flex-1 font-handwriting text-lg bg-transparent border-none outline-none resize-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] leading-7"
          />
        </div>

        {/* 내일 포인트 */}
        <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-[var(--color-line)] pt-4 md:pt-0 md:pl-6">
          <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
            Tomorrow
          </span>
          <textarea
            value={day.tomorrow}
            onChange={(e) => setTomorrow(e.target.value)}
            placeholder="내일 포인트..."
            className="flex-1 font-handwriting text-lg bg-transparent border-none outline-none resize-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] leading-7"
          />
        </div>
      </div>
    </footer>
  );
}
