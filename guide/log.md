# log.md
> 동적 파일 — 세션마다 맨 아래에 추가 (오래된 것이 위, 최신이 아래)

---

## 2026-03-26 (DESIGNER)
- T1-05 TaskInput 구현 (src/components/daily/TaskInput.tsx) — 인라인 폼, 업무명+내용+업무유형 칩 선택. 같은 업무명 반복 추가 시 taskName 유지
- T1-06 TaskList 구현 (src/components/daily/TaskList.tsx) — taskName 기준 그룹핑, TaskNameRow(Highlighter) + DetailRow 구조
- T1-07 Highlighter SVG 컴포넌트 (src/components/ui/Highlighter.tsx)
- T1-08 DetailRow 체크박스 토글 — toggleTask 연동, 취소선+opacity 0.45, 그룹 전체 완료 시 Highlighter faded
- useResizeObserver 훅 구현 (src/hooks/useResizeObserver.ts) — 마운트 직후 초기값 + ResizeObserver 실시간 추적

## 2026-04-19 (DESIGNER)
- T1-14 Chip 컴포넌트 분리 (src/components/ui/Chip.tsx) — TaskInput 인라인 버튼을 재사용 가능한 컴포넌트로 추출
- T1-09 타임테이블 그리드 (src/components/daily/TimeTable.tsx) — 00:00~24:00 / 30분 단위 / 시간 레이블 + 구분선 + 타임블록 오버레이
- T1-12 총 기록 시간 표시 확인 — store recalcTotalMinutes ↔ DailyHeader.totalMinutes 연동 완료 (추가 코드 불필요)

## 2026-04-19 (DESIGNER) — 세션 2
- T1-13 DailyFooter store 연동 — DayData에 review/tomorrow 추가, setReview/setTomorrow 액션 추가, DailyFooter.tsx textarea 연결
