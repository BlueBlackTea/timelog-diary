"use client";

import { useEffect, useRef, useState } from "react";
import { useDailyStore } from "@/store/dailyStore";

/**
 * FocusOverlay → 미니 타이머 위젯
 *
 * 타이머 실행 중에만 표시.
 * - 드래그로 화면 어디서든 이동 가능 (fixed 레이어, z-[9999])
 * - 초기 위치: 우하단 24px 여백
 * - 접기(▲) / 펼치기(▼) 토글
 * - 종료 버튼: stopTimer() 호출 → TimeBlock 자동 저장
 */

const W = 200; // 위젯 너비 px
const H_FULL = 108; // 펼쳐진 높이 px
const H_MINI = 36;  // 접힌 높이 px
const MARGIN = 20;

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
  const [collapsed, setCollapsed] = useState(false);

  // 위치 (left, top) — null 이면 아직 초기화 전
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // 이전 타이머 ID 추적 (새 타이머 시작 시 위치 리셋)
  const prevTimerRef = useRef<string | null>(null);

  // 경과 시간 카운트
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

  // 타이머가 새로 시작되면 → 우하단으로 위치 초기화
  useEffect(() => {
    if (!activeTimer) {
      prevTimerRef.current = null;
      return;
    }
    if (prevTimerRef.current !== activeTimer.taskId) {
      prevTimerRef.current = activeTimer.taskId;
      setCollapsed(false);
      setPos({
        x: window.innerWidth  - W - MARGIN,
        y: window.innerHeight - H_FULL - MARGIN,
      });
    }
  }, [activeTimer]);

  // ── 드래그 핸들러 ──────────────────────────────────────────────────────
  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    // 버튼 클릭은 드래그 무시
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();

    const startMx = e.clientX;
    const startMy = e.clientY;
    const startX  = pos?.x ?? 0;
    const startY  = pos?.y ?? 0;

    const onMove = (ev: PointerEvent) => {
      const h = collapsed ? H_MINI : H_FULL;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - W, startX + ev.clientX - startMx)),
        y: Math.max(0, Math.min(window.innerHeight - h, startY + ev.clientY - startMy)),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }

  // 아직 위치가 계산되지 않았거나 타이머 없으면 렌더링 생략
  if (!activeTimer || !pos) return null;

  const h = collapsed ? H_MINI : H_FULL;

  return (
    <div
      className="fixed z-[9999] select-none"
      style={{ left: pos.x, top: pos.y, width: W }}
    >
      {/* 위젯 카드 */}
      <div
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(250,250,248,0.95)",
          backdropFilter: "blur(10px)",
          border: `1.5px solid ${activeTimer.color}55`,
          height: h,
          transition: "height 0.18s ease",
        }}
      >
        {/* ── 헤더 행 (드래그 핸들) ── */}
        <div
          className="flex items-center gap-1.5 px-2.5 cursor-grab active:cursor-grabbing"
          style={{ height: H_MINI, borderBottom: collapsed ? "none" : `1px solid ${activeTimer.color}33` }}
          onPointerDown={startDrag}
        >
          {/* 색상 인디케이터 */}
          <span
            className="shrink-0 w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeTimer.color }}
          />

          {/* 업무명 */}
          <span className="flex-1 font-handwriting text-sm leading-none text-[var(--color-ink)] truncate">
            {activeTimer.taskName}
          </span>

          {/* 접기 / 펼치기 */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded
                       text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            title={collapsed ? "펼치기" : "접기"}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {collapsed
                ? <polyline points="2,7 5,4 8,7" />   /* ▲ */
                : <polyline points="2,4 5,7 8,4" />}   {/* ▼ */}
            </svg>
          </button>

          {/* 종료 버튼 */}
          <button
            onClick={stopTimer}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded
                       text-[var(--color-ink-muted)] hover:text-red-400 transition-colors"
            title="타이머 종료 (저장)"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <rect width="8" height="8" rx="1" />
            </svg>
          </button>
        </div>

        {/* ── 본문 (접힌 상태에서는 숨김) ── */}
        {!collapsed && (
          <div className="flex flex-col items-center justify-center px-2 pb-2.5 pt-1.5" style={{ height: H_FULL - H_MINI }}>
            {/* 경과 시간 */}
            <p
              className="font-schoolbell leading-none text-[var(--color-ink)]"
              style={{ fontSize: "2rem" }}
            >
              {formatElapsed(elapsed)}
            </p>

            {/* 세부 내용 */}
            {activeTimer.detail && (
              <p className="font-handwriting text-[11px] text-[var(--color-ink-muted)] mt-1 truncate max-w-full px-1 text-center">
                {activeTimer.detail}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
