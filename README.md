# 🚗 모빌리티/지도 특화 미니 SaaS

주차, 경로, 민원, 안내, 예약 기능을 통합한 종합 모빌리티 플랫폼

## 📋 주요 기능

### 1. 🅿️ 주차장 관리
- 실시간 주차장 현황 조회
- 빈 자리 필터링
- 주차장 검색
- 지도 기반 시각화
- 요금 정보 제공

### 2. 🗺️ 경로 안내
- 최적 경로 탐색
- 다양한 교통수단 지원 (자동차, 도보, 자전거)
- 예상 시간 및 거리 계산
- 실시간 경로 표시

### 3. 📝 민원 관리
- 위치 기반 민원 신고
- 민원 유형 분류 (불법 주차, 도로 파손, 교통 신호 등)
- 사진 첨부 기능
- 처리 상태 추적
- 신고 이력 관리

### 4. ℹ️ 주변 안내
- 주변 시설 검색 (주유소, 병원, 음식점, 카페, 편의점)
- 거리 계산
- 지도 마커 표시
- 카테고리별 필터링

### 5. 📅 예약 시스템
- 주차장 예약
- 전기차 충전소 예약
- 세차 예약
- 예약 내역 관리
- 예약 상태 확인

## 🚀 시작하기

### 사전 요구사항
- Node.js 16.x 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 백엔드 API 서버 실행 (별도 터미널)
npm run server
```

### 접속
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000

## 📁 프로젝트 구조

```
mobility-map-saas/
├── index.html          # 메인 HTML 페이지
├── style.css           # 스타일시트
├── main.js             # 프론트엔드 로직
├── package.json        # 프로젝트 설정
├── server/
│   └── index.js        # Express 백엔드 서버
└── README.md           # 프로젝트 문서
```

## 🛠️ 기술 스택

### 프론트엔드
- **HTML5/CSS3**: 웹 표준
- **JavaScript (ES6+)**: 프론트엔드 로직
- **Leaflet.js**: 지도 시각화
- **Vite**: 빌드 도구

### 백엔드
- **Node.js**: 런타임 환경
- **Express**: 웹 프레임워크
- **CORS**: Cross-Origin Resource Sharing

## 📡 API 엔드포인트

### 주차장
- `GET /api/parking` - 주차장 목록 조회
- `GET /api/parking/:id` - 특정 주차장 조회
- `GET /api/parking/search?query={검색어}&available={true/false}` - 주차장 검색

### 경로
- `POST /api/route` - 경로 찾기
  ```json
  {
    "start": "출발지",
    "end": "도착지",
    "mode": "car|walk|bike"
  }
  ```

### 민원
- `POST /api/complaints` - 민원 접수
- `GET /api/complaints` - 민원 목록 조회
- `GET /api/complaints/:id` - 민원 상세 조회

### 주변 시설
- `GET /api/nearby/:category?lat={위도}&lng={경도}&radius={반경}` - 주변 시설 검색
  - 카테고리: gas, hospital, restaurant, cafe, store

### 예약
- `POST /api/bookings` - 예약 생성
- `GET /api/bookings` - 예약 목록 조회
- `DELETE /api/bookings/:id` - 예약 취소

### 통계
- `GET /api/stats` - 통계 조회

### 헬스 체크
- `GET /api/health` - 서버 상태 확인

## 🎨 주요 화면

### 대시보드
- 지도 기반 통합 뷰
- 실시간 통계 패널
- 탭 기반 네비게이션

### 주차 탭
- 주차장 리스트
- 빈 자리 필터
- 지도 마커

### 경로 탭
- 경로 검색 폼
- 교통수단 선택
- 경로 결과 표시

### 민원 탭
- 민원 신고 폼
- 위치 선택
- 신고 이력

### 안내 탭
- 카테고리 버튼
- 주변 시설 리스트
- 거리 정보

### 예약 탭
- 예약 폼
- 예약 내역
- 예약 상태

## 🔧 커스터마이징

### 지도 중심 좌표 변경
`main.js` 파일에서 초기 위치를 수정하세요:

```javascript
let currentLocation = { lat: 37.5665, lng: 126.9780 }; // 서울 시청
```

### 샘플 데이터 수정
`main.js`의 `generateParkingData()` 함수에서 주차장 데이터를 커스터마이징할 수 있습니다.

### 스타일 변경
`style.css`의 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
}
```

## 🌟 확장 가능성

### 단기 개선사항
- [ ] 실제 지도 API 연동 (Google Maps, Kakao Maps)
- [ ] 사용자 인증 시스템
- [ ] 결제 시스템 통합
- [ ] 푸시 알림
- [ ] 모바일 앱 버전

### 중기 개선사항
- [ ] 머신러닝 기반 주차 예측
- [ ] 실시간 교통 정보 연동
- [ ] 공유 모빌리티 통합
- [ ] 다국어 지원
- [ ] 관리자 대시보드

### 장기 개선사항
- [ ] IoT 센서 연동
- [ ] 자율주행 차량 지원
- [ ] 스마트 시티 플랫폼 통합
- [ ] 빅데이터 분석
- [ ] AI 챗봇 상담

## 📊 비즈니스 모델

### 수익 모델
1. **프리미엄 구독**: 고급 기능 제공
2. **광고 수익**: 주변 시설 프로모션
3. **예약 수수료**: 주차/충전 예약 수수료
4. **B2B 라이선스**: 기업용 솔루션 제공

### 타겟 고객
- 개인 운전자
- 상업용 차량 운전자
- 주차장 운영자
- 지방자치단체
- 기업 차량 관리팀

## 🔒 보안 고려사항

- HTTPS 필수 사용
- API 키 보안 관리
- 사용자 입력 검증
- SQL Injection 방지
- XSS 공격 방지
- Rate Limiting 구현

## 📱 반응형 디자인

- 데스크톱 최적화
- 태블릿 지원
- 모바일 친화적 UI
- 터치 제스처 지원

## 🤝 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 제작자

- 개발자: GenSpark AI
- 이메일: support@genspark.ai
- 웹사이트: https://www.genspark.ai

## 🙏 감사의 글

- Leaflet.js - 오픈소스 지도 라이브러리
- OpenStreetMap - 지도 데이터 제공
- Express.js - 웹 프레임워크

## 📞 지원

문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

---

**Made with ❤️ by GenSpark AI**
