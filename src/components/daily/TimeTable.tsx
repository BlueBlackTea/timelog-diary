"use client";

import { useRef } from "react";
import { useDailyStore, type TimeBlock } from "@/store/dailyStore";

/**
 * 타임테이블 그리드
 *
 * 구조: 행(row) = 시(hour, 00~23), 열(col) = 10분 단위 6칸
 * 블록 진행 방향: 가로 (왼→오), 시간 경계 넘으면 다음 행으로
 *
 * 예) 6:00~7:20 블록 →
 *   - 6시 행: 전체 너비 (00~50분, 60/60)
 *   - 7시 행: 좌측 2/6 (00~20분, 20/60)
 *
 * 1분 단위 정밀도: 분/60 × 행 너비 = 픽셀 위치
 * 드로우 모드: 10분 셀 단위로 칠하기 (data-cell 속성)
 */

const ROW_H = 44;    // px per hour row
const LABEL_W = 36;  // px, 시간 레이블 열 너비 (w-9 = 36px)
const COLS = 6;      // 10분 단위 열 수

// 시:분 문자열 → 분 수치
function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// 분 수치 → "HH:MM"
function fromMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// TimeBlock → 행별 렌더링 세그먼트 분해
interface Segment {
  key: string;
  hour: number;
  leftFrac: number;   // 0~1 (행 너비 기준 left 비율)
  widthFrac: number;  // 0~1 (행 너비 기준 width 비율)
  block: TimeBlock;
  isFirst: boolean;
}

function blockToSegments(block: TimeBlock): Segment[] {
  const startTotalMin = toMin(block.start);
  const endTotalMin = toMin(block.end);
  if (endTotalMin <= startTotalMin) return [];

  const startH = Math.floor(startTotalMin / 60);
  const endH = Math.floor(endTotalMin / 60);
  const segments: Segment[] = [];

  for (let h = startH; h <= Math.min(endH, 23); h++) {
    const fromMin = h === startH ? startTotalMin % 60 : 0;
    const toMinVal = h === endH ? endTotalMin % 60 : 60;
    if (fromMin >= toMinVal) continue;
    segments.push({
      key: `${block.id}-${h}`,
      hour: h,
      leftFrac: fromMin / 60,
      widthFrac: (toMinVal - fromMin) / 60,
      block,
      isFirst: h === startH,
    });
  }
  return segments;
}

// 연속된 칠해진 셀들을 구간으로 묶기
export interface CellRange {
  startStr: string;  // "HH:MM"
  endStr: string;    // "HH:MM"
  minutes: number;
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
    const endMin = startMin + (e - s + 1) * 10;
    return {
      startStr: fromMin(startMin),
      endStr: fromMin(Math.min(endMin, 24 * 60)),
      minutes: (e - s + 1) * 10,
    };
  });
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
  const isPainting = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // 드로우: gridRef BoundingClientRect 기준 좌표 계산으로 cell index 결정
  // elementFromPoint 대신 직접 계산 → implicit pointer capture 환경에서도 안정적
  function paintAt(clientX: number, clientY: number) {
    if (mode === "view" || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const relX = clientX - rect.left - LABEL_W; // 레이블 열 제외
    const relY = clientY - rect.top;

    if (relX < 0 || relX >= rect.width - LABEL_W) return;
    if (relY < 0 || relY >= 24 * ROW_H) return;

    const col  = Math.min(COLS - 1, Math.floor((relX / (rect.width - LABEL_W)) * COLS));
    const hour = Math.min(23, Math.floor(relY / ROW_H));
    if (col < 0 || hour < 0) return;

    const idx = hour * COLS + col;
    const next = new Set(paintedCells);
    mode === "draw" ? next.add(idx) : next.delete(idx);
    onCellsChange(next);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (mode === "view") return;
    isPainting.current = true;
    paintAt(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isPainting.current) return;
    paintAt(e.clientX, e.clientY);
  }

  function handlePointerUp() {
    isPainting.current = false;
  }

  // 모든 블록 세그먼트 계산
  const allSegments = timeBlocks.flatMap(blockToSegments);

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
      {/* ── 시간 레이블 열 (left=0, width=LABEL_W) ── */}
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

      {/* ── 그리드 콘텐츠 (left=LABEL_W) ── */}
      <div
        className="absolute top-0 bottom-0 border-l border-[var(--color-line)]"
        style={{ left: LABEL_W, right: 0 }}
      >
        {/* 24개 시간 행 */}
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="absolute left-0 right-0"
            style={{
              top: h * ROW_H,
              height: ROW_H,
              borderBottom: "1px solid var(--color-line)",
            }}
          >
            {/* 10분 단위 수직 구분선 (5개) */}
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

            {/* 드로우 모드: 10분 셀 하이라이트 (좌표 계산 방식 — data-cell 불필요) */}
            {mode !== "view" &&
              Array.from({ length: COLS }, (_, col) => {
                const idx = h * COLS + col;
                const painted = paintedCells.has(idx);
                return (
                  <div
                    key={col}
                    className="absolute top-0 pointer-events-none"
                    style={{
                      left: `${(col / COLS) * 100}%`,
                      width: `${100 / COLS}%`,
                      height: ROW_H,
                      backgroundColor: painted
                        ? mode === "erase"
                          ? "rgba(200,80,80,0.15)"
                          : "rgba(105,153,93,0.25)"
                        : "transparent",
                    }}
                  />
                );
              })}
          </div>
        ))}

        {/* ── TimeBlock 세그먼트 렌더링 ── */}
        {allSegments.map((seg) => (
          <div
            key={seg.key}
            className="absolute rounded-sm overflow-hidden group"
            style={{
              top: seg.hour * ROW_H + 2,
              height: ROW_H - 4,
              left: `${seg.leftFrac * 100}%`,
              width: `max(${seg.widthFrac * 100}%, 3px)`,
              backgroundColor: seg.block.color,
              opacity: 0.85,
              pointerEvents: mode === "view" ? "auto" : "none",
            }}
          >
            {/* 업무명 (isFirst 세그먼트에만 표시) */}
            {seg.isFirst && (
              <p className="font-handwriting text-[10px] leading-tight text-[var(--color-ink)] px-1 pt-0.5 truncate">
                {seg.block.taskName}
              </p>
            )}

            {/* 삭제 버튼 — view 모드 + hover */}
            {mode === "view" && (
              <button
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center
                           rounded-full text-[var(--color-ink)] opacity-0 group-hover:opacity-70
                           hover:!opacity-100 transition-opacity bg-white/50 text-[8px] font-bold leading-none"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTimeBlock(seg.block.id);
                }}
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
