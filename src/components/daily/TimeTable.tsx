"use client";

import { useRef, useState, useEffect } from "react";
import { useDailyStore, type TimeBlock } from "@/store/dailyStore";
import Highlighter from "@/components/ui/Highlighter";

/**
 * 타임테이블 그리드
 *
 * 구조: 행(row) = 시(hour, 00~23), 열(col) = 10분 단위 6칸
 * 블록 진행 방향: 가로 (왼→오), 시간 경계 넘으면 다음 행으로
 *
 * 드로우 모드: 연속된 칠해진 셀 범위를 Highlighter SVG로 렌더링
 *   (양 끝 진하게 + 가운데 연하게 + feTurbulence 번짐 — Highlighter.tsx 동일 효과)
 */

export const ROW_H = 24;   // px per hour row (형광펜이 딱 들어가는 높이)
const LABEL_W = 36;        // px, 시간 레이블 열 너비 (w-9)
const COLS    = 6;         // 10분 단위 열 수
const HL_H    = 20;        // Highlighter 높이 (px)
const HL_TOP  = Math.max(0, (ROW_H - HL_H) / 2); // 행 내 세로 중앙

const DRAW_COLOR  = "#69995D"; // 드로우 하이라이트 색 (외근 Sage Green)
const ERASE_COLOR = "#C85050"; // 지우개 표시 색

// ── 유틸 ──────────────────────────────────────────────────────────────────

function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── TimeBlock → 행별 세그먼트 ─────────────────────────────────────────────

interface Segment {
  key: string;
  hour: number;
  leftFrac: number;
  widthFrac: number;
  block: TimeBlock;
  isFirst: boolean;
}

function blockToSegments(block: TimeBlock): Segment[] {
  const startTotalMin = toMin(block.start);
  const endTotalMin   = toMin(block.end);
  if (endTotalMin <= startTotalMin) return [];

  const startH = Math.floor(startTotalMin / 60);
  const endH   = Math.floor(endTotalMin   / 60);
  const segs: Segment[] = [];

  for (let h = startH; h <= Math.min(endH, 23); h++) {
    const fMin = h === startH ? startTotalMin % 60 : 0;
    const tMin = h === endH   ? endTotalMin   % 60 : 60;
    if (fMin >= tMin) continue;
    segs.push({
      key: `${block.id}-${h}`,
      hour: h,
      leftFrac:  fMin / 60,
      widthFrac: (tMin - fMin) / 60,
      block,
      isFirst: h === startH,
    });
  }
  return segs;
}

// ── 칠해진 셀 → 행별 연속 구간 ────────────────────────────────────────────

export interface CellRange {
  startStr: string;
  endStr:   string;
  minutes:  number;
}

export function groupPaintedCells(cells: Set<number>): CellRange[] {
  if (cells.size === 0) return [];
  const sorted = [...cells].sort((a, b) => a - b);
  const ranges: { s: number; e: number }[] = [];
  for (const c of sorted) {
    if (ranges.length && c === ranges[ranges.length - 1].e + 1) {
      ranges[ranges.length - 1].e = c;
    } else {
      ranges.push({ s: c, e: c });
    }
  }
  return ranges.map(({ s, e }) => {
    const startMin = Math.floor(s / COLS) * 60 + (s % COLS) * 10;
    const endMin   = startMin + (e - s + 1) * 10;
    return {
      startStr: fromMin(startMin),
      endStr:   fromMin(Math.min(endMin, 24 * 60)),
      minutes:  (e - s + 1) * 10,
    };
  });
}

/** 특정 행의 연속 col 범위 목록 반환 */
function getRowRanges(hour: number, cells: Set<number>): { startCol: number; endCol: number }[] {
  const cols: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (cells.has(hour * COLS + col)) cols.push(col);
  }
  if (cols.length === 0) return [];

  const ranges: { startCol: number; endCol: number }[] = [];
  for (const col of cols) {
    if (ranges.length && col === ranges[ranges.length - 1].endCol + 1) {
      ranges[ranges.length - 1].endCol = col;
    } else {
      ranges.push({ startCol: col, endCol: col });
    }
  }
  return ranges;
}

// ── props ─────────────────────────────────────────────────────────────────

export type DrawMode = "view" | "draw" | "erase";

interface TimeTableProps {
  mode: DrawMode;
  paintedCells: Set<number>;
  onCellsChange: (cells: Set<number>) => void;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function TimeTable({ mode, paintedCells, onCellsChange }: TimeTableProps) {
  const { timeBlocks, removeTimeBlock } = useDailyStore();

  const isPainting  = useRef(false);
  const lockedHour  = useRef<number | null>(null);
  const gridRef     = useRef<HTMLDivElement>(null);

  // 그리드 콘텐츠 너비 (px) — Highlighter width 계산용
  const [gridContentW, setGridContentW] = useState(0);

  useEffect(() => {
    if (!gridRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setGridContentW((entry.contentRect.width ?? 0) - LABEL_W);
    });
    ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, []);

  // ── 포인터 이벤트 ──────────────────────────────────────────────────────

  function getCol(clientX: number, rect: DOMRect): number | null {
    const relX = clientX - rect.left - LABEL_W;
    if (relX < 0 || relX >= rect.width - LABEL_W) return null;
    return Math.min(COLS - 1, Math.max(0, Math.floor((relX / (rect.width - LABEL_W)) * COLS)));
  }

  function paintAt(clientX: number, clientY: number) {
    if (mode === "view" || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();

    // 행은 pointerDown 시 고정 → 수평 drag 전용
    let hour = lockedHour.current;
    if (hour === null) {
      const relY = clientY - rect.top;
      if (relY < 0 || relY >= 24 * ROW_H) return;
      hour = Math.min(23, Math.max(0, Math.floor(relY / ROW_H)));
      lockedHour.current = hour;
    }

    const col = getCol(clientX, rect);
    if (col === null) return;

    const idx  = hour * COLS + col;
    const next = new Set(paintedCells);
    mode === "draw" ? next.add(idx) : next.delete(idx);
    onCellsChange(next);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (mode === "view") return;
    isPainting.current  = true;
    lockedHour.current  = null;
    paintAt(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isPainting.current) return;
    paintAt(e.clientX, e.clientY);
  }

  function handlePointerUp() {
    isPainting.current = false;
    lockedHour.current = null;
  }

  // ── 렌더링 ─────────────────────────────────────────────────────────────

  const allSegments = timeBlocks.flatMap(blockToSegments);
  const cellW = gridContentW / COLS; // 셀 하나의 픽셀 너비

  return (
    <div
      ref={gridRef}
      className="relative select-none"
      style={{
        height: 24 * ROW_H,
        touchAction: mode !== "view" ? "none" : undefined,
        cursor: mode === "draw" ? "crosshair" : mode === "erase" ? "cell" : "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ── 시간 레이블 열 ── */}
      <div
        className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: LABEL_W }}
      >
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="absolute right-1.5 font-gothic text-[9px] leading-none text-[var(--color-ink-muted)]"
            style={{ top: h * ROW_H + 2 }}
          >
            {String(h).padStart(2, "0")}
          </div>
        ))}
      </div>

      {/* ── 그리드 콘텐츠 ── */}
      <div
        className="absolute top-0 bottom-0 border-l border-[var(--color-line)]"
        style={{ left: LABEL_W, right: 0 }}
      >
        {/* 24개 시간 행 */}
        {Array.from({ length: 24 }, (_, h) => {
          const rowRanges = mode !== "view" ? getRowRanges(h, paintedCells) : [];

          return (
            <div
              key={h}
              className="absolute left-0 right-0"
              style={{ top: h * ROW_H, height: ROW_H, borderBottom: "1px solid var(--color-line)" }}
            >
              {/* 10분 단위 수직 구분선 */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `${(i / COLS) * 100}%`,
                    width: 1,
                    background: "color-mix(in srgb, var(--color-line) 55%, transparent)",
                  }}
                />
              ))}

              {/* 드로우 모드: 연속 범위마다 Highlighter 또는 지우개 표시 */}
              {rowRanges.map((range, ri) => {
                const spanCols  = range.endCol - range.startCol + 1;
                const hlWidth   = spanCols * cellW;
                const leftPct   = (range.startCol / COLS) * 100;
                const widthPct  = (spanCols / COLS) * 100;

                if (mode === "erase") {
                  // 지우개: 단순 붉은 배경
                  return (
                    <div
                      key={ri}
                      className="absolute pointer-events-none rounded-sm"
                      style={{
                        top: HL_TOP,
                        height: HL_H,
                        left:  `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: `${ERASE_COLOR}33`,
                        border: `1px dashed ${ERASE_COLOR}88`,
                      }}
                    />
                  );
                }

                // 드로우: Highlighter SVG (형광펜 스타일)
                return (
                  <div
                    key={ri}
                    className="absolute pointer-events-none"
                    style={{
                      top:    HL_TOP,
                      height: HL_H,
                      left:   `${leftPct}%`,
                      width:  `${widthPct}%`,
                    }}
                  >
                    {hlWidth > 0 && (
                      <Highlighter
                        color={DRAW_COLOR}
                        width={hlWidth}
                        id={`draw-${h}-${ri}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* ── TimeBlock 세그먼트 렌더링 ── */}
        {allSegments.map((seg) => (
          <div
            key={seg.key}
            className="absolute rounded-sm overflow-hidden group"
            style={{
              top:    seg.hour * ROW_H + 2,
              height: ROW_H - 4,
              left:   `${seg.leftFrac  * 100}%`,
              width:  `max(${seg.widthFrac * 100}%, 3px)`,
              backgroundColor: seg.block.color,
              opacity: 0.85,
              pointerEvents: mode === "view" ? "auto" : "none",
            }}
          >
            {seg.isFirst && (
              <p className="font-handwriting text-[10px] leading-tight text-[var(--color-ink)] px-1 pt-0.5 truncate">
                {seg.block.taskName}
              </p>
            )}
            {mode === "view" && (
              <button
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center
                           rounded-full text-[var(--color-ink)] opacity-0 group-hover:opacity-70
                           hover:!opacity-100 transition-opacity bg-white/50 text-[8px] font-bold leading-none"
                onClick={(e) => { e.stopPropagation(); removeTimeBlock(seg.block.id); }}
                title="삭제"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
