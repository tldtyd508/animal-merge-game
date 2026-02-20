# 🚀 Supabase + Vercel 배포 가이드

## 완성된 기능
- ✅ Supabase Postgres 데이터베이스
- ✅ Google OAuth 로그인
- ✅ Kakao OAuth 로그인
- ✅ 익명 사용자 지원 (UUID)
- ✅ 통합 랭킹 시스템

---

## 1단계: Supabase 프로젝트 생성

### 1-1. Supabase 계정 생성
1. https://supabase.com 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인

### 1-2. 새 프로젝트 생성
1. **New Project** 클릭
2. 프로젝트 설정:
   - **Name**: `animal-merge-game`
   - **Database Password**: 강력한 비밀번호 생성 (저장 필요!)
   - **Region**: `Northeast Asia (Seoul)` 또는 가까운 지역
3. **Create new project** 클릭 (2-3분 소요)

### 1-3. API Keys 확인
프로젝트 생성 후:
1. 좌측 메뉴 → **Settings** → **API**
2. 다음 값들을 복사해두기:
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ 절대 공개하지 말 것!)

---

## 2단계: 데이터베이스 초기화

### 2-1. SQL Editor에서 테이블 생성
1. 좌측 메뉴 → **SQL Editor**
2. **New query** 클릭
3. `scripts/init-db.sql` 파일 내용 복사 & 붙여넣기:

```sql
-- 랭킹 테이블 생성 (Supabase Postgres)
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255),  -- UUID for anonymous users
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Supabase Auth user
  player_name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  highest_animal INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (빠른 정렬)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard (user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_auth_user ON leaderboard (auth_user_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사람이 랭킹을 읽을 수 있음
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- 정책: 인증된 사용자는 자신의 점수를 제출할 수 있음
CREATE POLICY "Authenticated users can insert their scores"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- 정책: 익명 사용자도 점수를 제출할 수 있음 (auth_user_id가 NULL인 경우)
CREATE POLICY "Anonymous users can insert scores"
  ON leaderboard FOR INSERT
  WITH CHECK (auth_user_id IS NULL);
```

4. **Run** 클릭

---

## 3단계: OAuth 설정 (Google & Kakao)

### 3-1. Google OAuth 설정

#### A. Google Cloud Console에서
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: `animal-merge-game`
3. **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `Animal Merge Game`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
4. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Animal Merge Game`
   - Authorized redirect URIs 추가:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     (Supabase 대시보드 → Authentication → Providers → Google에서 확인)
5. **Client ID**와 **Client Secret** 복사

#### B. Supabase에서
1. 좌측 메뉴 → **Authentication** → **Providers**
2. **Google** 클릭
3. Enable 토글 ON
4. Google Cloud에서 복사한 Client ID와 Secret 입력
5. **Save** 클릭

### 3-2. Kakao OAuth 설정

#### A. Kakao Developers에서
1. https://developers.kakao.com 접속 & 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기**
   - 앱 이름: `Animal Merge Game`
3. **앱 키** → **REST API 키**, **JavaScript 키** 복사
4. **제품 설정** → **카카오 로그인** 활성화
5. **Redirect URI 등록**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
6. **동의 항목** 설정:
   - 닉네임: 필수 동의
   - 프로필 사진: 선택 동의
   - 카카오계정(이메일): 선택 동의

#### B. Supabase에서
1. **Authentication** → **Providers**
2. **Kakao** 클릭
3. Enable 토글 ON
4. Kakao REST API 키를 Client ID에 입력
5. **Save** 클릭

---

## 4단계: Vercel 환경변수 설정

### 4-1. Vercel 대시보드에서 설정
1. https://vercel.com/tldtyd508/animal_game/settings/environment-variables
2. 다음 환경변수 추가:

**백엔드용:**
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**프론트엔드용 (VITE_로 시작):**
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=https://animalgame-iota.vercel.app/api
```

3. 모든 환경변수를 **Production**, **Preview**, **Development**에 적용

---

## 5단계: 코드 커밋 & 배포

### 5-1. 변경사항 커밋
```bash
cd /Users/jiho_dt/Desktop/changup/animal_game
git add .
git commit -m "Migrate to Supabase with OAuth support

- Switch from @vercel/postgres to @supabase/supabase-js
- Add Google and Kakao OAuth login
- Support both authenticated and anonymous users
- Update database schema with auth_user_id
- Add RLS policies for secure access

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

### 5-2. 자동 배포 확인
- GitHub push하면 Vercel이 자동으로 배포 시작
- https://vercel.com/tldtyd508/animal_game에서 배포 상태 확인

---

## 6단계: 테스트

### 6-1. 익명 사용자 테스트
1. https://animalgame-iota.vercel.app 접속
2. 게임 플레이
3. 🏆 버튼 클릭 → 랭킹 확인
4. 이름 입력 후 점수 제출 (익명)
5. 랭킹에 표시 확인

### 6-2. OAuth 로그인 테스트
1. 게임 플레이 후 🏆 클릭
2. **Google** 또는 **Kakao** 버튼 클릭
3. 로그인 완료
4. 이름이 자동으로 채워지는지 확인
5. 점수 제출
6. 로그인된 사용자로 랭킹 표시 확인

### 6-3. 데이터 확인
Supabase 대시보드:
1. **Table Editor** → `leaderboard` 테이블
2. 익명 유저: `user_id` 값 있음, `auth_user_id` NULL
3. 로그인 유저: `auth_user_id` 값 있음

---

## 7단계: Site URL 설정 (중요!)

OAuth 리다이렉트가 작동하려면:

1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL** 설정:
   ```
   https://animalgame-iota.vercel.app
   ```
3. **Redirect URLs** 추가 (허용된 도메인):
   ```
   https://animalgame-iota.vercel.app/**
   http://localhost:5173/**
   ```

---

## 문제 해결

### OAuth 로그인이 안 돼요
- ✅ Google/Kakao에서 Redirect URI 정확히 입력했는지 확인
- ✅ Supabase에서 Provider 활성화했는지 확인
- ✅ Site URL이 올바른지 확인
- ✅ 브라우저 콘솔에서 에러 메시지 확인

### 데이터베이스 연결 실패
- ✅ Vercel 환경변수가 올바른지 확인
- ✅ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 확인
- ✅ Supabase 프로젝트가 활성화되어 있는지 확인

### RLS 정책 오류
- ✅ `init-db.sql`을 정확히 실행했는지 확인
- ✅ Supabase Table Editor에서 RLS가 활성화되어 있는지 확인

---

## 로컬 개발

로컬에서 테스트하려면:

### 1. .env.local 파일 생성
```bash
# /Users/jiho_dt/Desktop/changup/animal_game/.env.local
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=http://localhost:3000/api
```

### 2. Vercel Dev 실행
```bash
vercel dev
```

---

## 다음 단계

✅ **완료된 것:**
- Supabase 데이터베이스
- Google/Kakao OAuth
- 익명/로그인 사용자 모두 지원
- 통합 랭킹 시스템

💡 **추가 가능한 기능:**
- Naver OAuth (Supabase는 기본 지원 안 함 - 커스텀 구현 필요)
- 개인 최고 기록 페이지
- 일일/주간 랭킹
- 프로필 사진 표시
- 친구 초대 시스템
