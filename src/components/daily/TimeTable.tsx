"use client";

import { useState, useRef } from "react";
import { useDailyStore } from "@/store/dailyStore";
import TimeBlockPopup from "@/components/daily/TimeBlockPopup";

const SLOT_H = 22; // px per 30-min slot
const TOTAL_SLOTS = 48; // 00:00 ~ 24:00

function timeToSlot(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 2 + (m >= 30 ? 1 : 0);
}

function slotToTime(slot: number) {
  const h = Math.floor(slot / 2);
  const m = slot % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
}

function posToSlot(y: number, rect: DOMRect) {
  const relY = y - rect.top;
  return Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(relY / SLOT_H)));
}

// 10분 단위 세로 구분선 위치 (1/6 ~ 5/6)
const COL_LINES = [1, 2, 3, 4, 5];

export default function TimeTable() {
  const { timeBlocks, addTimeBlock, currentDate } = useDailyStore();

  const gridRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [popup, setPopup] = useState<{ start: string; end: string } | null>(null);

  const previewStart = dragStart !== null && dragEnd !== null ? Math.min(dragStart, dragEnd) : null;
  const previewEnd = dragStart !== null && dragEnd !== null ? Math.max(dragStart, dragEnd) + 1 : null;

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!gridRef.current) return;
    e.preventDefault();
    const slot = posToSlot(e.clientY, gridRef.current.getBoundingClientRect());
    setDragStart(slot);
    setDragEnd(slot);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (dragStart === null || !gridRef.current) return;
    const slot = posToSlot(e.clientY, gridRef.current.getBoundingClientRect());
    setDragEnd(slot);
  }

  function handleMouseUp() {
    if (dragStart === null || dragEnd === null) return;
    const s = Math.min(dragStart, dragEnd);
    const e = Math.max(dragStart, dragEnd) + 1;
    if (e - s >= 1) {
      setPopup({ start: slotToTime(s), end: slotToTime(Math.min(e, TOTAL_SLOTS)) });
    }
    setDragStart(null);
    setDragEnd(null);
  }

  return (
    <>
      <div className="flex select-none" style={{ height: TOTAL_SLOTS * SLOT_H }}>
        {/* 시간 레이블 — h=0은 top:1 로 상단선에 맞춤, 나머지는 시간선 중앙 정렬 */}
        <div className="relative shrink-0 w-9">
          {Array.from({ length: 25 }, (_, h) => (
            <div
              key={h}
              className="absolute right-1.5 font-gothic text-[9px] leading-none text-[var(--color-ink-muted)]"
              style={{ top: h === 0 ? 1 : h * 2 * SLOT_H - 5 }}
            >
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* 그리드 */}
        <div
          ref={gridRef}
          className="relative flex-1 border-l border-[var(--color-line)] cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 수평 구분선 — 시간(hour)마다 solid 선만 표시 */}
          {Array.from({ length: 25 }, (_, h) => (
            <div
              key={h}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: h * 2 * SLOT_H, borderTop: "1px solid var(--color-line)" }}
            />
          ))}

          {/* 드래그 미리보기 */}
          {previewStart !== null && previewEnd !== null && (
            <div
              className="absolute left-0.5 right-0.5 rounded-sm pointer-events-none"
              style={{
                top: previewStart * SLOT_H,
                height: (previewEnd - previewStart) * SLOT_H,
                backgroundColor: "var(--color-ink)",
                opacity: 0.08,
              }}
            />
          )}

          {/* 타임블록 */}
          {timeBlocks.map((block) => {
            const startSlot = timeToSlot(block.start);
            const endSlot = timeToSlot(block.end);
            const slotSpan = endSlot - startSlot;
            if (slotSpan <= 0) return null;
            return (
              <div
                key={block.id}
                className="absolute left-0.5 right-0.5 rounded-sm px-1.5 py-0.5 overflow-hidden pointer-events-none"
                style={{
                  top: startSlot * SLOT_H + 1,
                  height: slotSpan * SLOT_H - 2,
                  backgroundColor: block.color,
                  opacity: 0.85,
                }}
              >
                <p className="font-gothic text-[10px] font-bold text-[var(--color-ink)] leading-tight truncate">
                  {block.taskName}
                </p>
                {slotSpan >= 3 && block.detail && (
                  <p className="font-handwriting text-[10px] text-[var(--color-ink-muted)] leading-tight truncate">
                    {block.detail}
                  </p>
                )}
              </div>
            );
          })}

          {/* 10분 단위 수직 컬럼 구분선 — 타임블록 위에 렌더링 */}
          {COL_LINES.map((i) => (
            <div
              key={`vcol-${i}`}
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${(i / 6) * 100}%`,
                width: "1px",
                background: "color-mix(in srgb, var(--color-line) 55%, transparent)",
              }}
            />
          ))}
        </div>
      </div>

      {/* 팝업 */}
      {popup && (
        <TimeBlockPopup
          start={popup.start}
          end={popup.end}
          onClose={() => setPopup(null)}
          onSave={(block) => {
            addTimeBlock({ ...block, date: currentDate });
            setPopup(null);
          }}
        />
      )}
    </>
  );
}
