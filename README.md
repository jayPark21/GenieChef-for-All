# 🍳 GenieChef for All (냉장고 속 지니 쉪)

> AI 기반 개인 맞춤형 레시피 추천 & 영양소 관리 웹 앱

**배포 URL**: [https://geniechef-app-2026.web.app](https://geniechef-app-2026.web.app)

---

## 🚀 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React + Vite, Tailwind CSS, Framer Motion |
| Backend/DB | Firebase Firestore, Firebase Hosting |
| AI | Google Gemini API (gemini-3-flash-preview, gemini-3.1-flash-image-preview) |
| 인증 | Firebase Authentication (Google 로그인, 게스트 모드) |

---

## 📱 주요 기능

### 1. 🤖 AI 레시피 추천 (홈)
- 냉장고 식재료를 선택하면 AI가 실시간으로 레시피 추천
- **식단 목적** 기반 맞춤 추천: `든든 한끼` / `간단식` / `야식` / `술안주`
- **식단 목표** 반영: `체중 감량` / `체중 유지` / `근육 성장`

### 2. 🧊 냉장고 관리
- 보유 식재료 목록 관리 (기본 재료 + 커스텀 추가)
- Firebase & LocalStorage 이중 동기화

### 3. 🧮 영양소 환산기 (`/nutrient-converter`)
- 식재료명 + 중량 입력 → AI가 탄수화물/단백질/지방/칼로리 즉시 계산
- 하드코딩 없이 100% Gemini AI 실시간 조회

### 4. 🥗 식단 목적별 영양 가이드 (`/guide`)
- 목적별 탄단지 권장 비율 안내
- **목표 선택 버튼**: 체중 감량 / 체중 유지 / 근육 성장
- 선택 즉시 LocalStorage + Firebase 동기화 → 홈 추천에 반영

### 5. 🛒 장보기 목록 (`/shopping-list`)
- 부족한 식재료 장바구니 관리

### 6. 📋 히스토리 (`/history`)
- 저장한 레시피 기록 열람

---

## 개발일지

### v1.0.0 (2026-02 초)
- 프로젝트 초기 구성: React + Vite + Firebase + Tailwind CSS
- Google 로그인 / 게스트 모드 구현
- 냉장고 식재료 관리 + AI 레시피 추천 기본 기능 구현

### v1.1.0 (2026-02-27)
- 장보기 목록 기능 추가 및 버그 수정
- 레시피 히스토리 저장 기능 구현
- 레시피 상세 페이지: 인포그래픽 및 타이머 기능 추가

### v1.2.0 (2026-03-04) ← 오늘
- **[신규]** 영양소 환산기 페이지 추가 (`/nutrient-converter`)
  - 식재료명 + 중량 입력 → Gemini AI 실시간 탄단지/칼로리 계산
  - 하단 네비바에 "영양소환산" 메뉴 추가 (전체 페이지 공통 적용)
- **[신규]** 식단 목적에 `체중 유지` 옵션 추가
  - 3열 그리드 버튼 레이아웃으로 개선 (체중 감량 / 체중 유지 / 근육 성장)
  - AI 프롬프트에 체중 유지 목적 반영 (탄단지 균형 5:2:3)
- **[버그수정]** 식단 목표 변경 시 홈 화면 즉시 미반영 문제 해결
  - `geniechef_user_data` 캐시 동기화 누락 수정

---

## 🔧 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 로컬 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# Firebase 배포
firebase deploy --only hosting
```

---

## 🔑 환경변수 설정

```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ API 키는 절대 커밋하지 마세요. `.env.local` 사용 권장.

---

*Made with ❤️ by 대표님 & 땡칠이 개발팀장 🫡*
