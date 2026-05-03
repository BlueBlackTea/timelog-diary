"use client";

import { useState } from "react";
import {
  useDailyStore,
  WORK_TYPE_COLORS,
  type WorkType,
  type TaskMaster,
} from "@/store/dailyStore";
import Chip from "@/components/ui/Chip";

const WORK_TYPES: WorkType[] = ["업무", "회의", "공부", "외근", "기타"];

interface Props {
  onClose: () => void;
}

function EditRow({
  master,
  onDone,
}: {
  master: TaskMaster;
  onDone: () => void;
}) {
  const { updateTaskMaster } = useDailyStore();
  const [name, setName] = useState(master.name);
  const [workType, setWorkType] = useState<WorkType>(master.workType);

  function save() {
    if (!name.trim()) return;
    updateTaskMaster(master.id, {
      name: name.trim(),
      workType,
      color: WORK_TYPE_COLORS[workType],
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-2 bg-[var(--color-paper-dark)] rounded">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onDone(); }}
        className="font-handwriting text-base bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] pb-0.5"
      />
      <div className="flex gap-1 flex-wrap">
        {WORK_TYPES.map((wt) => (
          <Chip
            key={wt}
            label={wt}
            color={WORK_TYPE_COLORS[wt]}
            selected={workType === wt}
            onClick={() => setWorkType(wt)}
          />
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onDone}
          className="font-gothic text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] px-2 py-1"
        >
          취소
        </button>
        <button
          onClick={save}
          className="font-gothic text-xs font-bold px-3 py-1 rounded bg-[var(--color-ink)] text-[var(--color-paper)]"
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default function TaskMasterModal({ onClose }: Props) {
  const { taskMasters, addTaskMaster, removeTaskMaster } = useDailyStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newWorkType, setNewWorkType] = useState<WorkType>("업무");

  function handleAdd() {
    if (!newName.trim()) return;
    addTaskMaster({
      name: newName.trim(),
      workType: newWorkType,
      color: WORK_TYPE_COLORS[newWorkType],
    });
    setNewName("");
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: "rgba(44,44,44,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-paper)] rounded-lg shadow-xl w-full max-w-sm mx-4 flex flex-col max-h-[80vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <span className="font-gothic text-sm font-bold tracking-widest text-[var(--color-ink)] uppercase">
            업무명 관리
          </span>
          <button
            onClick={onClose}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
          {taskMasters.length === 0 && (
            <p className="font-handwriting text-base text-[var(--color-ink-muted)] text-center py-4">
              등록된 업무명이 없습니다
            </p>
          )}

          {taskMasters.map((m) =>
            editingId === m.id ? (
              <EditRow key={m.id} master={m} onDone={() => setEditingId(null)} />
            ) : (
              <div
                key={m.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-[var(--color-paper-dark)] group"
              >
                {/* 업무유형 색 도트 */}
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                {/* 업무명 */}
                <span className="flex-1 font-handwriting text-base text-[var(--color-ink)] leading-tight">
                  {m.name}
                </span>
                {/* 업무유형 칩 */}
                <span
                  className="font-gothic text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{ backgroundColor: m.color + "33", color: m.color }}
                >
                  {m.workType}
                </span>
                {/* 수정 / 삭제 */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(m.id)}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
                    title="수정"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeTaskMaster(m.id)}
                    className="text-[var(--color-ink-muted)] hover:text-[#e07070] p-0.5"
                    title="삭제"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                      <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* 추가 폼 */}
        <div className="border-t border-[var(--color-line)] px-4 py-3 flex flex-col gap-2">
          <div className="flex gap-1 flex-wrap">
            {WORK_TYPES.map((wt) => (
              <Chip
                key={wt}
                label={wt}
                color={WORK_TYPE_COLORS[wt]}
                selected={newWorkType === wt}
                onClick={() => setNewWorkType(wt)}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="새 업무명 입력"
              className="flex-1 font-handwriting text-base bg-transparent border-b border-[var(--color-line)] outline-none text-[var(--color-ink)] placeholder:text-[var(--color-line)] pb-0.5"
            />
            <button
              onClick={handleAdd}
              className="shrink-0 font-gothic text-xs font-bold px-3 py-1.5 rounded bg-[var(--color-ink)] text-[var(--color-paper)] hover:opacity-80 transition-opacity"
            >
              + 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
