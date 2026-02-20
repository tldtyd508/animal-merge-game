# 🚀 Vercel 배포 가이드

## 1단계: Vercel 계정 & 프로젝트 연결

### 1-1. Vercel CLI 설치
```bash
npm install -g vercel
```

### 1-2. Vercel 로그인
```bash
vercel login
```

### 1-3. 프로젝트 배포 (첫 배포)
```bash
cd /Users/jiho_dt/Desktop/changup/animal_game
vercel
```

**질문 응답:**
- Set up and deploy? → **Y**
- Which scope? → (본인 계정 선택)
- Link to existing project? → **N**
- Project name? → `animal-merge-game` (원하는 이름)
- In which directory? → `.` (현재 디렉토리)
- Override settings? → **N**

---

## 2단계: Vercel Postgres 설정

### 2-1. Vercel 대시보드에서 Postgres 추가
1. https://vercel.com 접속
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** → **Postgres** 선택
5. **Continue** (무료 tier)

### 2-2. 환경변수 자동 설정 확인
- Vercel이 자동으로 `POSTGRES_*` 환경변수 설정
- **Settings → Environment Variables**에서 확인

### 2-3. 데이터베이스 초기화
#### 옵션 A: Vercel 대시보드에서 실행
1. **Storage → Postgres** 선택
2. **Query** 탭 클릭
3. `scripts/init-db.sql` 내용 복사 & 붙여넣기
4. **Run Query**

#### 옵션 B: Vercel CLI로 실행
```bash
vercel env pull .env.local
psql $POSTGRES_URL -f scripts/init-db.sql
```

---

## 3단계: 프론트엔드 환경변수 설정

### 3-1. 배포된 URL 확인
배포 완료 후 터미널에 표시된 URL 복사:
```
https://animal-merge-game-xxxx.vercel.app
```

### 3-2. Vercel에 환경변수 추가
```bash
vercel env add VITE_API_URL
```

입력값: `https://animal-merge-game-xxxx.vercel.app/api`

또는 대시보드에서:
1. **Settings → Environment Variables**
2. **Add** 클릭
3. Name: `VITE_API_URL`
4. Value: `https://animal-merge-game-xxxx.vercel.app/api`
5. **Save**

---

## 4단계: 재배포

환경변수 설정 후 재배포:
```bash
vercel --prod
```

---

## 5단계: 테스트

1. 배포된 URL 접속: `https://animal-merge-game-xxxx.vercel.app`
2. 게임 플레이
3. 🏆 버튼 클릭
4. 점수 제출
5. 랭킹 확인

---

## 로컬 개발 (선택사항)

로컬에서 백엔드 테스트하려면:

### 1. Vercel 환경변수 다운로드
```bash
vercel env pull .env.local
```

### 2. Vercel Dev 서버 실행
```bash
vercel dev
```

### 3. 프론트엔드 환경변수 설정
`.env` 파일 생성:
```
VITE_API_URL=http://localhost:3000/api
```

---

## 문제 해결

### API 호출 실패
- 브라우저 콘솔에서 에러 확인
- Vercel 대시보드 → **Deployments → Functions**에서 로그 확인

### CORS 에러
- `vercel.json`의 CORS 설정 확인
- 재배포: `vercel --prod`

### 데이터베이스 연결 실패
- **Storage → Postgres**에서 상태 확인
- 환경변수 재설정: `vercel env pull .env.local`

---

## 유용한 명령어

```bash
# 배포 상태 확인
vercel ls

# 로그 확인
vercel logs

# 환경변수 확인
vercel env ls

# 배포 롤백
vercel rollback
```

---

## 다음 단계: OAuth 로그인 추가 (선택)

백엔드 동작 확인 후, 구글/네이버 로그인 추가 가능합니다.
자세한 내용은 별도 문서 참조.
