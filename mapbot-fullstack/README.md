# MapBot — Mobility AI Agent 🗺️

> 카카오맵 + 실시간 대중교통 + DRT 배차 + LaaS AI  
> Next.js 14 · Firebase · Vercel 배포 가능 풀스택 MaaS 플랫폼

---

## 🚀 빠른 시작

### 사전 준비
- Node.js 18+
- npm 9+

### 1. 설치 및 실행

```bash
# 프로젝트 복사 후
cd mapbot-fullstack
npm install
npm run dev
# → http://localhost:3000
```

### 2. 즉시 미리보기 (설치 없이)
`mapbot/index.html` 파일을 브라우저에서 직접 열면 **카카오맵이 연동된 데모**가 바로 실행됩니다.

---

## 🔑 API 키 현황

| 키 종류 | 값 | 상태 |
|--------|-----|------|
| Kakao JavaScript Key | `9ae99572568cbb7dc7d90ce792f63aa9` | ✅ 연동 완료 |
| Kakao REST API Key | `5fb47e56131ad4934b7cff2f8b8e3cac` | ✅ 연동 완료 |
| Kakao Native App Key | `087ac29ee010926e9f31743686d84d38` | ✅ 설정됨 |
| ODsay 대중교통 API | 미설정 → 시뮬레이션 모드 자동 전환 | ⚠️ 선택사항 |
| 공공데이터포털 버스 API | 미설정 → 시뮬레이션 모드 자동 전환 | ⚠️ 선택사항 |
| Firebase | 미설정 → 시뮬레이션 모드 자동 전환 | ⚠️ 선택사항 |

### ODsay API 발급 (실제 대중교통 데이터)
1. [lab.odsay.com](https://lab.odsay.com) 회원가입
2. API Key 발급 (무료)
3. `.env.local`에 `ODSAY_API_KEY=발급키` 추가

### 공공데이터포털 API 발급 (포항시 버스 정보)
1. [data.go.kr](https://www.data.go.kr) 회원가입
2. "버스노선정보서비스" 검색 → API 신청
3. `.env.local`에 `PUBLIC_DATA_BUS_KEY=발급키` 추가

---

## 📁 프로젝트 구조

```
mapbot-fullstack/
├── app/
│   ├── page.tsx                # 메인 UI (클라이언트 컴포넌트)
│   ├── layout.tsx              # 루트 레이아웃
│   ├── globals.css             # 전역 스타일
│   └── api/
│       ├── transit/route.ts    # 대중교통 경로 탐색 API
│       ├── drt/route.ts        # DRT 배차 API
│       ├── dispatch/route.ts   # 요금·정책 검사 API
│       ├── realtime/route.ts   # SSE 실시간 차량 위치
│       └── places/route.ts     # 카카오 장소 검색 API
├── components/
│   └── KakaoMap.tsx            # 카카오맵 React 컴포넌트
├── lib/
│   ├── kakao-map.ts            # Kakao Maps SDK 래퍼
│   ├── transit-api.ts          # ODsay + 카카오 모빌리티 API
│   ├── dispatch-engine.ts      # AI 배차 알고리즘 (Haversine)
│   ├── firebase.ts             # Firebase 클라이언트 (선택)
│   └── store.ts                # Zustand 전역 상태
├── hooks/
│   └── useRealtime.ts          # SSE 실시간 구독 훅
├── types/
│   └── index.ts                # TypeScript 타입 정의
├── firebase/                   # Firebase 설정 파일
├── .env.local                  # 환경변수 (API 키)
├── next.config.js              # Next.js 설정
├── vercel.json                 # Vercel 배포 설정 (서울 리전)
└── mapbot/
    └── index.html              # 단독 실행 데모 (카카오맵 포함)
```

---

## 🌐 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/api/transit` | 멀티모달 경로 탐색 (ODsay + 카카오 길찾기) |
| `POST` | `/api/drt` | DRT 차량 배차 요청 |
| `GET`  | `/api/drt` | 현재 차량 목록 |
| `POST` | `/api/dispatch` | 동적 요금 계산 / 정책 검사 |
| `GET`  | `/api/realtime?type=vehicles` | SSE 실시간 차량 위치 스트림 |
| `GET`  | `/api/realtime?type=heatmap` | SSE 실시간 수요 히트맵 |
| `GET`  | `/api/places?q=검색어` | 카카오 장소 키워드 검색 |
| `GET`  | `/api/places?q=주소&type=address` | 카카오 주소 → 좌표 변환 |

---

## ☁️ Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포 (서울 리전 자동 설정)
vercel --prod
```

**환경변수 설정 (Vercel 대시보드)**
```
NEXT_PUBLIC_KAKAO_MAP_KEY = 9ae99572568cbb7dc7d90ce792f63aa9
KAKAO_REST_API_KEY        = 5fb47e56131ad4934b7cff2f8b8e3cac
ODSAY_API_KEY             = (선택) ODsay 키
```

---

## 🔥 Firebase 설정 (선택)

Firebase 없이도 시뮬레이션 모드로 완전 동작합니다.  
실제 운영 환경에서는 아래를 추가하세요:

```bash
# Firebase 프로젝트 생성 후 .env.local에 추가
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│              MapBot MaaS Platform v2.0                   │
├─────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14 + React + Tailwind)               │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐│
│  │KakaoMap  │  │Fleet View│  │DRT / Pricing / LaaS AI ││
│  │SDK 연동  │  │SSE 실시간│  │                        ││
│  └──────────┘  └──────────┘  └────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  API Layer (Vercel Edge Functions — 서울 리전)           │
│  /api/transit → ODsay API + Kakao Mobility REST         │
│  /api/drt     → Haversine AI 배차 알고리즘              │
│  /api/realtime→ SSE 실시간 스트림                       │
│  /api/places  → 카카오 장소 검색 / 주소 → 좌표          │
├─────────────────────────────────────────────────────────┤
│  Data Sources                                           │
│  Kakao Maps JS SDK  · Kakao Mobility REST API           │
│  ODsay 대중교통 API · 공공데이터포털 버스 API            │
│  Firebase (선택) · 시뮬레이션 데이터 (기본값)            │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 기능 목록

| 탭 | 기능 |
|----|------|
| 🗺️ **이동 추천** | 멀티모달 경로 탐색, 카카오맵 실시간 경로 표시, 숙박 추천 |
| 🚗 **Fleet 현황** | 차량 실시간 위치 (카카오맵), 배터리/상태 모니터링 |
| ⚡ **DRT 배차** | AI 차량 매칭, ETA 계산, 합승 감지, 배차 이력 |
| 💎 **요금·Point** | 동적 요금 계산, MU Point 적립/차감, 결제 수단 |
| 🤖 **LaaS AI** | 패션·헬스케어·미용·투자 4주 플랜 생성 |
| 📊 **관리자** | 수요 히트맵, 운영 KPI, 기업 출장 정책 준수 현황 |

---

## 🛠️ 다음 단계 (Next Steps)

- [ ] ODsay API 키 발급 후 실제 대중교통 경로 연동
- [ ] Firebase 연동으로 실시간 차량 상태 영속화
- [ ] 카카오 로그인 / 카카오페이 결제 연동
- [ ] 포항시 Open API 실버스와 연동 (공공 버스 BIS)
- [ ] 모스트업 얼라이언스(MOSTUP) 파트너사 API 연동
- [ ] 보트랑 전기보트 노선 데이터 연동
