# CLAUDE.md — Timelog Diary
> 정적 파일 — 프로젝트 구조가 바뀔 때만 수정

## 프로젝트 개요
종이 다이어리 레이아웃으로 하루 업무(Task)와 실제 수행 시간(Time Block)을 기록하는 개인용 웹앱.
JSON 원본(Supabase) → Excel 파생(SheetJS) → Google Drive 백업 구조로 데이터 관리.

## 기술스택
- Next.js (App Router) + React + Tailwind CSS
- Zustand (상태관리) / Supabase (DB + Auth) / SheetJS (Excel) / dayjs
- Google Drive API v3 (백업)

## 경로
```
/
├── CLAUDE.md
├── guide/
│   ├── status.md   ← 현재 작업 단계 및 다음 할 일
│   ├── log.md      ← 세션별 작업 로그 누적
│   ├── agents.md   ← 역할별 담당 작업 및 파일 정의
│   ├── deploy.md   ← 배포 절차
│   └── plan.md     ← 전체 스펙 및 티켓 목록
└── src/
```

## 주의사항
- `gradientUnits="userSpaceOnUse"` Highlighter SVG에서 사용 금지
- 환경변수 하드코딩 금지 — `.env.local` 사용
- Excel은 파생 결과물. 원본은 항상 Supabase 기준

---

> **세션 시작 시: `guide/agents.md` → `guide/plan.md` → `guide/status.md` 순서로 읽고, "다음 할 일" 목록을 자율적으로 수행할 것.**
> 작업 완료 후 `guide/log.md` 추가 및 `guide/status.md` 갱신 후 종료.
