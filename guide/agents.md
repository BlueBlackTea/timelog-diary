# agents.md
> 정적 파일 — 역할 구조가 바뀔 때만 수정

---

## PLANNER
요구사항 관리 및 plan.md 티켓 관리 전담.

**수정 권한**
- `guide/plan.md`
- `guide/agents.md`
- 코드 파일 수정 금지

**담당 작업**
- plan.md 티켓 확인 및 우선순위 결정
- 다음 에이전트 지시

**추가 필독 파일**
- `guide/plan.md` 전체

---

## DESIGNER
UI 컴포넌트 및 디자인 시스템 전담.

**수정 권한**
- `src/components/`
- `src/styles/`
- `src/app/` (레이아웃)
- DB 연동 코드 수정 금지

**담당 작업**
- UI 컴포넌트 구현 및 수정
- 스타일링 / 디자인 시스템 관리

**담당 파일**
- `src/components/ui/`
- `src/components/daily/`
- `src/components/layout/`

**형광펜 컴포넌트 스펙** (plan.md 형광펜 섹션 참조)

```tsx
<Highlighter color={task.color} width={measuredWidth} completed={task.completed} />
```

- rect 3개 겹침 구조 (배경 + 왼쪽 캡 + 오른쪽 캡)
- 캡 길이 14px 고정 / skewX(-2.5) / feTurbulence 번짐
- `gradientUnits="userSpaceOnUse"` 사용 금지
- width는 ResizeObserver 실측값 사용

**폰트**: Nanum Pen Script 또는 Gaegu (`next/font/google`)

**추가 필독 파일**
- `guide/plan.md` — 화면 구성, 형광펜 효과 스펙 섹션

---

## DATA
Supabase / 훅 / 상태관리 전담.

**수정 권한**
- `src/lib/supabase/`
- `src/hooks/`
- `src/store/`
- UI 컴포넌트 수정 금지

**담당 작업**
- Supabase 연동 및 CRUD
- Zustand store 관리
- 커스텀 훅 구현

**담당 파일**
- `src/lib/supabase/`
- `src/hooks/`
- `src/store/`

테이블: days / tasks / time_blocks (스키마는 plan.md 참조)
모든 테이블에 user_id + RLS 적용

**추가 필독 파일**
- `guide/plan.md` — 데이터 모델, Supabase 테이블 설계 섹션

---

## DEPLOYER
Vercel / 환경변수 / Google Drive OAuth 전담.

**수정 권한**
- `vercel.json`
- `.env.example`
- `next.config.js`
- 비즈니스 로직 수정 금지

**담당 작업**
- 환경변수 관리
- Vercel 배포 설정
- Google OAuth scope 설정

**추가 필독 파일**
- `guide/deploy.md` ← **반드시 읽을 것**

---

## 공통 규칙

- 티켓 완료 시 `guide/plan.md`의 `[ ]`를 `[x]`로 변경
- 추가 작업 발생 시 PLANNER에 보고 후 plan.md에 추가
- 환경변수 하드코딩 금지 — `.env.local` 사용
- 컴포넌트 경로: `src/components/ui/` / `src/components/daily/` / `src/components/layout/`

---

## 세션 종료 규칙

작업 완료 후 **HANDOFF.md 대신** 아래 두 파일을 업데이트하고 멈춘다.

1. **`guide/log.md` 맨 아래에 이번 세션 로그 추가**
   - 형식: `## YYYY-MM-DD (역할)` + 완료 항목 불릿
   - 완료된 티켓 번호 + 파일명 포함. 사실만. 한 줄씩.

2. **`guide/status.md` 갱신**
   - "현재 상태" 업데이트
   - "다음 할 일" 체크리스트 업데이트
   - 다음 에이전트가 알아야 할 전달 사항 반영
