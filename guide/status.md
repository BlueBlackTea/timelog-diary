# status.md
> 동적 파일 — 작업 단계가 바뀔 때마다 업데이트

---

## ⚠️ 세션 종료 전 반드시 완료할 것 (순서 준수)

- [ ] `guide/log.md` 맨 아래에 이번 세션 작업 로그 추가 (`## YYYY-MM-DD (역할)` + 불릿 형식)
- [ ] `guide/status.md` 이 파일의 "현재 상태" 및 "다음 할 일" 갱신

> 이 두 항목을 완료하지 않으면 세션을 끝내지 않는다.

---

## guide/ 파일 구조 요약

| 파일 | 성격 | 용도 |
|------|------|------|
| status.md | 동적 | 현재 작업 단계 및 다음 할 일 |
| log.md | 동적 | 세션별 작업 로그 누적 |
| agents.md | 정적 | 역할별 담당 작업 및 파일 정의 |
| deploy.md | 정적 | 배포 절차 (Vercel + 환경변수) |
| plan.md | 정적 | 전체 프로젝트 스펙 및 티켓 목록 |

---

## 현재 상태

**1단계 UI 구현 완료 — 16/16 완료**

마지막 작업: DESIGNER (2026-05-03)

### 1단계 티켓 현황
- [x] T1-01 Next.js 프로젝트 초기 세팅
- [x] T1-02 폰트 세팅 (손글씨 한글 폰트)
- [x] T1-03 메인 데일리 페이지 레이아웃
- [x] T1-04 줄 노트 배경선 컴포넌트
- [x] T1-05 Task 입력 컴포넌트
- [x] T1-06 Task 목록 렌더링 (업무명 그룹핑 + Highlighter 연결)
- [x] T1-07 형광펜 효과 SVG 컴포넌트 `<Highlighter>`
- [x] T1-08 Task 완료 체크 토글
- [x] T1-09 타임테이블 그리드 렌더링 (src/components/daily/TimeTable.tsx)
- [x] T1-10 Time Block 드래그 입력 (TimeTable.tsx drag + TimeBlockPopup.tsx)
- [x] T1-11 구조화 입력기 (TimeBlockPopup — Task 라디오 선택 + 시간 수동 조정)
- [x] T1-12 총 기록 시간 자동 계산 및 상단 표시 (store ↔ DailyHeader 연동 완료)
- [x] T1-13 하단 메모 / 회고 / 내일 포인트 텍스트 영역
- [x] T1-14 업무유형 칩(Chip) 컴포넌트 분리 (src/components/ui/Chip.tsx)
- [x] T1-15 업무명 색상 배정 로직 (workType → WORK_TYPE_COLORS 자동 매핑)
- [x] T1-16 달력 뷰 (CalendarModal — 월별 기록 그라데이션 + 날짜 이동, localStorage persist)

### 전달 사항
- ResizeObserver: `useResizeObserver<HTMLSpanElement>()` 훅. ref를 span에 붙이고 width를 Highlighter에 전달
- Highlighter 컨테이너는 `relative` + `style={{ height: 20 }}`로 감싸야 inset-0 정렬이 맞음
- TaskInput: taskName 유지 정책 — 같은 업무명으로 내용만 다르게 추가할 때 taskName 초기화 안 함
- T1-15(색상 배정): workType → WORK_TYPE_COLORS 자동 매핑. 커스텀 색상 선택 UI는 미구현
- T1-16(달력 뷰): Zustand persist(localStorage) + allDayTotals 기반. Phase 2에서 Supabase로 대체 예정
- 레이아웃 패널 리사이즈: CSS `--task-pct` 변수를 `<main>` style에 주입 → `.task-panel-col` 클래스가 `@media (min-width:768px)`에서만 해당 변수 사용. 드래그 핸들(width:12px) 범위 25~80%, 기본 66.67%
- 폰트 스택: 한글 손글씨 = `NanumDongHi` (public/fonts/NanumDongHi.ttf), 영문 손글씨 = `School Bell` (Google Fonts), 고딕 = `Noto Sans KR`. 파일 없어도 빌드 정상 동작
- 컬러 팔레트 (5색): 업무=#FFBEBE, 회의=#586994, 공부=#7D869C, 외근=#69995D, 기타=#CADBC0
- 텍스트 색상 (팔레트와 분리): ink=#2C2C2C(내추럴 다크 차콜), ink-muted=#787878(내추럴 그레이), line=#CADBC0(Tea Green 경계선)

---

## 다음 할 일

2단계(Supabase) 진입 준비:
- [ ] T2-01 Supabase 프로젝트 생성 및 테이블 생성
- [ ] T2-02 Supabase 클라이언트 연결 설정
- [ ] T2-03 ~ T2-05 Day / Task / TimeBlock CRUD 연동
- [ ] T2-06 날짜 이동: localStorage allDayTotals → Supabase days 테이블 조회로 대체

---

## 작업 순서 (매 세션)

1. `guide/agents.md` 읽고 다음 할 일에 맞는 역할 파악
2. `guide/plan.md` 읽고 티켓 상태 확인
3. 이 파일의 "다음 할 일" 기준으로 자율적으로 작업 수행 (한 번에 3~5개 티켓)
4. 완료 티켓은 plan.md의 `[ ]`를 `[x]`로 변경
5. **`guide/log.md` 맨 아래에 이번 세션 로그 추가** ← 위 체크리스트 참고
6. **`guide/status.md` 갱신** (현재 상태 + 다음 할 일 + 전달 사항 업데이트) 후 마무리
