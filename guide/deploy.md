# deploy.md
> 정적 파일 — 배포 구조가 바뀔 때만 수정

---

## 배포 환경

- 플랫폼: **GitHub Pages** (정적 export) + 추후 **Vercel** (Supabase 연동 시)
- DB: **Supabase** (PostgreSQL + Auth)
- 파일 저장: **Google Drive API v3**

---

## 필수 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

로컬: `.env.local` / Vercel 대시보드: Environment Variables 탭에 동일하게 설정

---

## 배포 흐름

1. 로컬 빌드 확인
   ```bash
   npm run build
   ```
2. 로컬 개발 서버 동작 확인
   ```bash
   npm run dev
   ```
3. Vercel 자동 배포 (main 브랜치 push 시 트리거)
4. 배포 후 Vercel 대시보드에서 빌드 로그 확인

---

## 커밋 전 체크리스트

- [ ] 빌드 성공 여부 확인 (`npm run build`)
- [ ] 환경변수 누락 없는지 확인 (`.env.example` 기준 6개 모두)
- [ ] 하드코딩된 환경변수 없는지 확인
- [ ] 불필요한 콘솔 로그 제거

---

## Git 초기 설정 순서 (⚠️ 반드시 이 순서대로)

새 프로젝트를 GitHub에 올릴 때 `.gitignore`를 **git init 전에** 만들어야 함.
순서를 어기면 `node_modules` (파일 수만 개)가 git에 포함되어 push가 수십 분 걸림.

```bash
# 1. .gitignore 먼저 확인
# 2. git init
git init
# 3. add / commit / push
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/BlueBlackTea/timelog-diary.git
git push -u origin main
```

`.gitignore` 필수 항목:
```
node_modules/
.next/
out/
.env.local
```

---

## 자주 누락되는 항목

- **`.gitignore` 없이 `git add .`** → node_modules 전체 커밋됨 (치명적)
- Vercel 대시보드 환경변수와 `.env.local` 불일치
- Google OAuth consent screen에 `NEXTAUTH_URL` 도메인 미등록
- Supabase RLS 정책 미적용 상태로 배포
