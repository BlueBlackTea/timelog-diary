"use client";

import { useState, useRef, useEffect } from "react";
import TimeTable, { type DrawMode, groupPaintedCells, ROW_H } from "@/components/daily/TimeTable";
import DrawSavePopup from "@/components/ui/DrawSavePopup";

const MIN_LABELS = ["00", "10", "20", "30", "40", "50"];

export default function TimeTablePanel() {
  const [mode, setMode] = useState<DrawMode>("view");
  const [paintedCells, setPaintedCells] = useState<Set<number>>(new Set());
  const [showSavePopup, setShowSavePopup] = useState(false);

  function toggleMode(next: DrawMode) {
    setMode((prev) => (prev === next ? "view" : next));
  }

  function handleClear() {
    setPaintedCells(new Set());
    setMode("view");
  }

  function handleSave() {
    if (paintedCells.size === 0) return;
    setShowSavePopup(true);
  }

  function handleSaveDone() {
    setShowSavePopup(false);
    setPaintedCells(new Set());
    setMode("view");
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * ROW_H;
    }
  }, []);

  const isDrawing = mode !== "view";
  const canSave = isDrawing && paintedCells.size > 0;

  return (
    <section className="relative flex flex-col overflow-hidden h-[60vh] md:h-full md:border-l border-[var(--color-line)]">
      {/* 패널 헤더 */}
      <div className="px-4 py-2 border-b border-[var(--color-line)] shrink-0 flex items-center justify-between">
        <span className="font-gothic text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] uppercase">
          Timetable
        </span>

        {/* 드로우 모드 버튼 */}
        <div className="flex items-center gap-1">
          {/* 그리기 버튼 */}
          <button
            onClick={() => toggleMode("draw")}
            title="그리기"
            className="p-1 rounded transition-colors"
            style={{
              color: mode === "draw" ? "var(--color-ink)" : "var(--color-ink-muted)",
              backgroundColor: mode === "draw" ? "var(--color-paper-dark)" : "transparent",
            }}
          >
            {/* 연필 아이콘 */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" />
            </svg>
          </button>

          {/* 지우개 버튼 */}
          <button
            onClick={() => toggleMode("erase")}
            title="지우개"
            className="p-1 rounded transition-colors"
            style={{
              color: mode === "erase" ? "var(--color-ink)" : "var(--color-ink-muted)",
              backgroundColor: mode === "erase" ? "var(--color-paper-dark)" : "transparent",
            }}
          >
            {/* 지우개 아이콘 */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10h9" />
              <path d="M7 2l4 4-5 5H2L6 7z" />
            </svg>
          </button>

          {/* 저장 버튼 (칠한 셀 있을 때만 활성) */}
          {isDrawing && (
            <button
              onClick={handleSave}
              disabled={!canSave}
              title="저장"
              className="px-2 py-0.5 rounded font-gothic text-[9px] font-bold transition-opacity"
              style={{
                backgroundColor: "var(--color-ink)",
                color: "var(--color-paper)",
                opacity: canSave ? 1 : 0.35,
              }}
            >
              저장
            </button>
          )}

          {/* 초기화 버튼 */}
          {isDrawing && (
            <button
              onClick={handleClear}
              title="초기화"
              className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="2" x2="9" y2="9" />
                <line x1="9" y1="2" x2="2" y2="9" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 타임테이블 본문 (sticky 헤더 포함) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[var(--color-paper)]"
        style={{ scrollbarGutter: "stable" }}
      >
        {/* sticky 분 레이블 헤더 — scroll 컨테이너 안에 위치해야 열 정렬 일치 */}
        <div className="sticky top-0 z-20 flex border-b border-[var(--color-line)] bg-[var(--color-paper)]">
          {/* 시간 레이블 열 너비 (w-9 = 36px, TimeTable LABEL_W와 일치) */}
          <div className="shrink-0 w-9" />
          {/* 6개 10분 컬럼 */}
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

        {/* 타임테이블 그리드 */}
        <TimeTable
          mode={mode}
          paintedCells={paintedCells}
          onCellsChange={setPaintedCells}
        />
      </div>

      {/* 저장 팝업 */}
      {showSavePopup && (
        <DrawSavePopup
          ranges={groupPaintedCells(paintedCells)}
          onSave={handleSaveDone}
          onClose={() => setShowSavePopup(false)}
        />
      )}
    </section>
  );
}
