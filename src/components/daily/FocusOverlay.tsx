"use client";

import { useEffect, useState } from "react";
import { useDailyStore } from "@/store/dailyStore";

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusOverlay() {
  const { activeTimer, stopTimer } = useDailyStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }
    setElapsed(Math.floor((Date.now() - activeTimer.startedAt) / 1000));
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTimer.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [activeTimer]);

  if (!activeTimer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: "rgba(28, 28, 28, 0.92)" }}
    >
      {/* 업무유형 색 인디케이터 */}
      <div
        className="w-2.5 h-2.5 rounded-full mb-5 opacity-80"
        style={{ backgroundColor: activeTimer.color }}
      />

      {/* 업무명 */}
      <p className="font-gothic text-[11px] font-bold tracking-[0.22em] uppercase mb-3"
        style={{ color: "rgba(255,255,255,0.45)" }}>
        {activeTimer.taskName}
      </p>

      {/* 경과 시간 */}
      <p className="font-schoolbell leading-none mb-1"
        style={{ fontSize: "5rem", color: "rgba(255,255,255,0.92)" }}>
        {formatElapsed(elapsed)}
      </p>

      {/* 세부 내용 */}
      {activeTimer.detail && (
        <p className="font-handwriting text-base mt-3"
          style={{ color: "rgba(255,255,255,0.30)" }}>
          {activeTimer.detail}
        </p>
      )}

      {/* 종료 버튼 */}
      <button
        onClick={stopTimer}
        className="mt-14 px-10 py-3 rounded-full font-gothic text-xs font-bold tracking-widest transition-opacity hover:opacity-80"
        style={{
          backgroundColor: activeTimer.color,
          color: "#2c2c2c",
        }}
      >
        종료
      </button>

      <p className="font-gothic text-[10px] tracking-widest mt-4"
        style={{ color: "rgba(255,255,255,0.20)" }}>
        종료하면 타임블록이 자동 저장됩니다
      </p>
    </div>
  );
}
