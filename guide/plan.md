# Timelog Diary — 개발 플랜

## 프로젝트 한 줄 정의

종이 다이어리 레이아웃으로 하루 업무(Task)와 실제 수행 시간(Time Block)을 기록하고,
JSON 원본 → Excel 파생 → Google Drive 백업 구조로 데이터를 관리하는 개인용 웹앱

---

## 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | |
| UI | React + Tailwind CSS | |
| 상태관리 | Zustand | |
| DB | Supabase (PostgreSQL) | 원본 데이터 저장 |
| Excel 생성 | SheetJS (xlsx) | 파생 결과물 |
| 날짜 처리 | dayjs | |
| 인증 | Supabase Auth (Google OAuth) | Drive 연동 포함 |
| 파일 저장 | Google Drive API v3 | 백업 + 열람용 |

---

## 데이터 모델

### Day
```json
{
  "date": "2026-03-26",
  "comment": "오전 집중도 좋음",
  "memo": "회의 후 기획안 방향 수정 필요",
  "totalMinutes": 485
}
```

### Task
```json
{
  "id": "task_001",
  "date": "2026-03-26",
  "taskName": "자료조사",
  "detail": "경쟁 서비스 사례 수집",
  "workType": "업무",
  "color": "#EFA4B8",
  "completed": false,
  "order": 1
}
```

### TimeBlock
```json
{
  "id": "block_001",
  "date": "2026-03-26",
  "taskId": "task_001",
  "workType": "업무",
  "taskName": "자료조사",
  "detail": "경쟁 서비스 사례 수집",
  "color": "#EFA4B8",
  "start": "09:00",
  "end": "10:30",
  "durationMinutes": 90,
  "memo": "핵심 사례 5건 정리"
}
```

### 업무유형 고정값
`회의` / `업무` / `공부` / `외근` / `기타`

---

## Supabase 테이블 설계

```sql
-- days
create table days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  date date not null,
  comment text,
  memo text,
  total_minutes int default 0,
  created_at timestamptz default now()
);

-- tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  date date not null,
  task_name text not null,
  detail text,
  work_type text not null,
  color text,
  completed boolean default false,
  "order" int default 0,
  created_at timestamptz default now()
);

-- time_blocks
create table time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  date date not null,
  task_id uuid references tasks(id),
  work_type text not null,
  task_name text not null,
  detail text,
  color text,
  start_time time not null,
  end_time time not null,
  duration_minutes int not null,
  memo text,
  created_at timestamptz default now()
);
```

---

## Google Drive 폴더 구조

```
Google Drive
└── timelog-diary/
    ├── data/
    │   └── days/
    │       └── 2026-03-26.json
    └── exports/
        ├── timelog_log.xlsx
        └── timelog_summary.xlsx
```

---

## Excel 시트 구성

| 시트 | 내용 |
|------|------|
| Time Log | 날짜 / 시작 / 종료 / 소요분 / 업무유형 / 업무명 / 내용 / 메모 |
| Daily Summary | 날짜 / 총 기록시간 / 코멘트 / 메모 |
| Work Type Summary | 기간 / 업무유형 / 총 소요분 / 총 시간 |
| Tasks | 날짜 / 업무명 / 내용 / 완료여부 |

> Excel은 파생 결과물. 원본은 반드시 Supabase JSON 기준으로 유지.

---

## 화면 구성

### 메인 데일리 화면

```
┌─────────────────────────────────────────────┐
│  상단: 날짜 / 요일 / 코멘트 / 총 기록시간         │
├──────────────────┬──────────────────────────┤
│  좌측: Task 목록  │  우측: 타임테이블 그리드      │
│  - 업무명         │  - Time Block 시각화        │
│  - 내용 (종속)    │  - 드래그로 신규 생성         │
│  - 완료 체크      │  - 블록 클릭으로 수정          │
│  - 추가 버튼      │                             │
├──────────────────┴──────────────────────────┤
│  하단: 자유 메모 / 하루 회고 / 내일 포인트         │
└─────────────────────────────────────────────┘
```

---

## 입력 UX 규칙

### Task 입력
1. 업무명 입력
2. 해당 업무명에 내용(detail) 추가
3. 같은 업무명에 내용 여러 개 등록 가능
4. 업무유형 / 색상 지정

### Time Block 입력

**방식 A. 드래그**
- 타임테이블에서 시간 범위 드래그
- 팝업 오픈 → 등록된 Task 목록에서 선택
- 업무유형 자동 반영 (수정 가능)
- 메모 입력 후 저장

**방식 B. 구조화 입력기**
- 시간 범위 직접 입력
- 업무유형 → 업무명 → 내용 순서로 드롭다운 선택
- 내용은 업무명에 종속된 목록만 노출
- 메모 입력 후 저장

---

## 시각 디자인 방향

### 레퍼런스
실물 스터디 플래너 다이어리. 줄 노트 위에 형광펜 하이라이트 + 손글씨 폰트 + 파스텔 색상이 혼합된 스타일.

### 레이아웃 원칙
- 종이 다이어리 / 스터디플래너 레이아웃
- 카드형보다 인쇄물형 UI
- 라운드 최소화, 선 정렬 강조
- 날짜 + 총 시간 크게 강조 (예: `20260326 THU`, `11H50M`)
- 타임블록: 얇고 길게
- 줄 노트 배경선 반복 적용

### 폰트
- 날짜 / 숫자 강조: 고딕 계열 굵게
- 본문 / Task 항목: 한글 손글씨체
  - 권장 후보: Nanum Pen Script, Gaegu (Google Fonts 무료)
- 영문 보조: 세리프 또는 모노 계열

### 색상 체계

업무명 색상 = Task 형광펜 색상 = Time Block 블록 색상 (모두 동일값)
업무유형은 칩(Chip) 태그로만 보조 표시

| 업무유형 | 형광펜 색상 |
|------|------|
| 업무 | #EFA4B8 (핑크) |
| 회의 | #AFA9EC (라일락) |
| 공부 | #FFE600 (노랑) |
| 외근 | #5DCAA5 (민트) |
| 기타 | #D3D1C7 (그레이) |

---

## 형광펜 효과 스펙 (Highlighter Effect)

Task 항목 배경에 적용하는 핵심 UI 효과. SVG 기반으로 구현.

### 시각적 특성
- 양 끝(펜 짚는 지점, 떼는 지점)이 진함
- 진한 구간은 형광펜 높이(20px) 기준 10px 고정 — 줄 길이와 무관
- 10px 이후 짧은 그라데이션으로 연함으로 전환
- 가운데 대부분 구간은 연하게 유지
- 2.5도 기울기 (skewX -2.5)
- 가장자리 번짐: SVG feTurbulence + feDisplacementMap

### SVG 구현 구조

rect 3개 겹침:

```
[연한 배경 rect — 전체 width]
[왼쪽 진한 캡 14px — 진함→투명 gradient]
[오른쪽 진한 캡 14px — 투명→진함 gradient, x = width - 14]
```

```svg
<linearGradient id="cap-l" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%"   stop-color="{color}" stop-opacity="0.62"/>
  <stop offset="62%"  stop-color="{color}" stop-opacity="0.44"/>
  <stop offset="100%" stop-color="{color}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="cap-r" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%"   stop-color="{color}" stop-opacity="0"/>
  <stop offset="38%"  stop-color="{color}" stop-opacity="0.44"/>
  <stop offset="100%" stop-color="{color}" stop-opacity="0.62"/>
</linearGradient>

<g filter="url(#noise-filter)" transform="skewX(-2.5)">
  <rect x="0"        width="{W}"  height="20" rx="2" fill="{color}" fill-opacity="0.26"/>
  <rect x="0"        width="14"   height="20" rx="2" fill="url(#cap-l)"/>
  <rect x="{W - 14}" width="14"   height="20" rx="2" fill="url(#cap-r)"/>
</g>
```

### 주의사항
- `gradientUnits="userSpaceOnUse"` 사용 금지 — filter와 함께 쓰면 좌표계 꼬임
- filter seed는 task.id 해시 기반으로 고정 → 새로고침해도 동일한 번짐 유지
- width는 ResizeObserver로 실측 후 prop 전달

### React 컴포넌트 인터페이스

```tsx
<Highlighter
  color={task.color}       // hex string
  width={measuredWidth}    // number (px)
  completed={task.completed} // boolean — 완료 시 opacity 0.45
/>
```

### 완료 항목 처리
- 배경 전체 opacity 0.45로 낮춤
- 텍스트에 취소선 적용

---

## 단계별 구현 계획

### 1단계 — UI 및 기본 입력

**목표**: 화면이 실제로 동작하는 상태. 데이터는 Zustand 로컬 상태만 사용.

- [x] `T1-01` Next.js 프로젝트 초기 세팅 (Tailwind, Zustand 포함)
- [x] `T1-02` 폰트 세팅 (손글씨 한글 폰트 Google Fonts 연결)
- [x] `T1-03` 메인 데일리 페이지 레이아웃 (상단 / 좌측 / 우측 / 하단)
- [x] `T1-04` 줄 노트 배경선 컴포넌트
- [x] `T1-05` Task 입력 컴포넌트 (업무명 + 내용 페어 등록)
- [x] `T1-06` Task 목록 렌더링 (업무명 하위 내용 종속 표시)
- [x] `T1-07` 형광펜 효과 SVG 컴포넌트 `<Highlighter>` 구현
- [x] `T1-08` Task 완료 체크 토글 (완료 시 opacity 낮춤 + 취소선)
- [x] `T1-09` 타임테이블 그리드 렌더링 (00:00~24:00, 30분 단위)
- [x] `T1-10` Time Block 드래그 입력 (범위 선택 → 팝업)
- [x] `T1-11` 구조화 입력기 (업무유형 → 업무명 → 내용 드롭다운)
- [x] `T1-12` 총 기록 시간 자동 계산 및 상단 표시
- [x] `T1-13` 하단 메모 / 회고 / 내일 포인트 텍스트 영역
- [x] `T1-14` 업무유형 칩(Chip) 컴포넌트
- [x] `T1-15` 업무명 색상 배정 로직 (팔레트 순환)
- [x] `T1-16` 달력 뷰 (CalendarModal — 월별 기록 현황 + 날짜 이동, localStorage persist)

---

### 2단계 — 데이터 저장 및 날짜 이동

**목표**: Supabase 연동 완료, Excel 내보내기 가능

- [ ] `T2-01` Supabase 프로젝트 생성 및 테이블 생성
- [ ] `T2-02` Supabase 클라이언트 연결 설정
- [ ] `T2-03` Day CRUD 연동
- [ ] `T2-04` Task CRUD 연동
- [ ] `T2-05` Time Block CRUD 연동
- [ ] `T2-06` 날짜 이동 기능 (이전날 / 다음날 / 캘린더)
- [ ] `T2-07` 특정 날짜 페이지 조회
- [ ] `T2-08` SheetJS로 Excel 생성 (4개 시트)
- [ ] `T2-09` Excel 로컬 다운로드
- [ ] `T2-10` JSON 원본 로컬 다운로드

---

### 3단계 — Google 로그인 및 Drive 연동

**목표**: 자동 백업 구조 완성

- [ ] `T3-01` Supabase Auth Google OAuth 로그인
- [ ] `T3-02` Google Drive API OAuth scope 설정 (drive.file)
- [ ] `T3-03` Drive 내 timelog-diary 폴더 자동 생성
- [ ] `T3-04` 하루 저장 시 JSON Drive 업로드
- [ ] `T3-05` 기록 변경 시 Excel 재생성 + Drive 업로드
- [ ] `T3-06` 업로드 상태 표시
- [ ] `T3-07` 수동 Drive 동기화 버튼

---

### 4단계 — 통계 및 확장

**목표**: 리포트 및 편의 기능

- [ ] `T4-01` 날짜별 검색
- [ ] `T4-02` 주간 요약 화면
- [ ] `T4-03` 월간 요약 화면
- [ ] `T4-04` 업무유형별 누적 시간 리포트
- [ ] `T4-05` 업무명별 누적 시간 리포트
- [ ] `T4-06` Task 템플릿 복제 (이전 날 Task 불러오기)
- [ ] `T4-07` 반복 Task 설정
- [ ] `T4-08` PDF 출력
- [ ] `T4-09` 모바일 반응형

---

## 저장 흐름 요약

```
사용자 입력 → Supabase 저장 (원본) → SheetJS Excel 생성 (파생) → Google Drive 업로드 (백업)
```

---

## 설계 원칙

1. Excel은 원본이 아님. 원본은 항상 Supabase.
2. Time Block 업무명은 반드시 Task 목록에서 선택. 자유 입력 없음.
3. 내용(detail)은 선택한 업무명에 종속된 값만 노출.
4. 업무유형은 Task 기본값, Time Block 레벨에서 수정 가능.
5. Google Drive는 백업 + 열람 채널. 실시간 DB로 사용하지 않음.
6. 색상은 업무명 기준 배정. 업무유형은 칩 태그로만 표시.
7. 형광펜 SVG는 rect 3개 겹침 구조. gradientUnits="userSpaceOnUse" 사용 금지.
8. 형광펜 filter seed는 task.id 기반 고정.
