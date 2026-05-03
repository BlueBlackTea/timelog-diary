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

## 2026-05-01 (DESIGNER)
- guide 동기화: plan.md T1-15 체크 수정; status.md T1-10/T1-11 완료 반영 (코드 확인됨)
- 레이아웃 정렬 버그 3건 수정:
  - TimeTablePanel `border-l` → `md:border-l` (데스크톱 이중 구분선 제거)
  - TimeTablePanel `<div className="py-1">` 래퍼 제거 (불필요한 오프셋)
  - TimeTable 레이블 열 `pt-[5px]` 추가 ("00" 레이블 overflow-y 클리핑 해결)
- T1-16 달력 뷰 구현:
  - dailyStore.ts: Zustand `persist` 미들웨어 적용, `allDayTotals: Record<string, number>` 추가, recalcTotalMinutes에서 날짜별 합계 동기화
  - DailyHeader.tsx: 달력 아이콘 버튼 추가 (우측 끝)
  - CalendarModal.tsx 신규: 월 이동, 7×N 그리드, totalMinutes 기준 핑크 그라데이션 배경, 날짜 클릭 시 currentDate 변경

## 2026-05-03 (DESIGNER)
- 추가 UI 개선:
  - page.tsx: Task 패널 기본 너비 2/3(66.67%), 드래그 핸들로 25~80% 조절 (CSS --task-pct 변수 + media query)
  - TaskPanel.tsx: md:border-r 제거 (드래그 핸들이 구분선 역할)
  - TimeTablePanel.tsx: 분 단위 컬럼 헤더 추가 (00·10·20·30·40·50), 10분 세로 구분선 5개
  - TimeTable.tsx: 30분 대시선 제거 → 1시간 solid 선만 유지, 수직 컬럼 구분선 5개 추가
  - TaskList.tsx: 빈 상태 텍스트 위치 규선에 맞도록 조정
  - layout.tsx: Nanum_Pen_Script → School Bell (Google Fonts)로 영문 손글씨 폰트 교체
  - globals.css: NanumDongHi @font-face 로컬 로드 추가, .font-handwriting 폰트 스택 구성
  - public/fonts/NanumDongHi.ttf 추가 (한글 손글씨 폰트 파일)
- 컬러 팔레트 전체 교체 (5색 시스템):
  - --color-paper: #fafaf8
  - --color-ink: #586994 (Baltic Blue)
  - --color-ink-muted: #7d869c (Lavender Grey)
  - --color-line: #cadbc0 (Tea Green)
  - WORK_TYPE_COLORS: 업무 #FFBEBE / 회의 #586994 / 공부 #7D869C / 외근 #69995D / 기타 #CADBC0
  - CalendarModal 그라데이션: rgba(255,190,190,…) (Powder Blush 기반)

## 2026-05-03 (DESIGNER) — 세션 2
- 텍스트 색상 팔레트 분리 (globals.css):
  - --color-ink: #586994 → #2c2c2c (내추럴 다크 차콜 — 텍스트 전용)
  - --color-ink-muted: #7d869c → #787878 (내추럴 미디엄 그레이 — 보조 텍스트 전용)
  - --color-work-meeting: #586994 / --color-work-study: #7d869c 유지 (Chip/Highlighter 전용)
  - 모든 컴포넌트가 CSS 변수 참조하므로 추가 변경 없이 전체 반영
