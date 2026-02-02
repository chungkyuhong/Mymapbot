# 📅 여행 플래너 기능 가이드

## 목차
- [개요](#개요)
- [주요 기능](#주요-기능)
- [사용 방법](#사용-방법)
- [API 레퍼런스](#api-레퍼런스)
- [구글 캘린더 연동](#구글-캘린더-연동)
- [테스트 결과](#테스트-결과)

## 개요

모빌리티 통합 플랫폼의 **여행 플래너** 기능은 사용자가 여행 계획을 체계적으로 관리할 수 있도록 도와줍니다.

### 핵심 가치
- ✅ **통합 관리**: 여행 계획부터 일정까지 한 곳에서 관리
- 📅 **캘린더 연동**: iCalendar 형식으로 구글 캘린더에 내보내기 지원
- 🗺️ **지도 통합**: 일정의 위치를 지도에서 바로 확인
- 📱 **모바일 최적화**: 반응형 디자인으로 모든 기기에서 사용 가능

## 주요 기능

### 1. 여행 계획 관리

#### 계획 생성
- 여행 제목, 목적지 입력
- 출발일/도착일 선택
- 예산 및 인원 설정
- 메모 작성

#### 계획 상태 관리
- 🟡 **계획중** (planning): 초기 계획 단계
- 🟢 **확정** (confirmed): 확정된 계획
- 🔵 **완료** (completed): 여행 완료
- ⚫ **취소** (cancelled): 취소된 계획

### 2. 일정 관리

#### 일정 유형
- 🎯 **활동** (activity): 관광, 체험 등
- 🏨 **숙박** (accommodation): 호텔, 게스트하우스 등
- 🍽️ **식사** (restaurant): 레스토랑, 카페 등
- 🚗 **이동** (transport): 교통편, 이동 시간

#### 일정 정보
- 날짜 및 시간
- 제목 및 장소
- 위도/경도 (선택사항)
- 메모

#### 일정 기능
- ✅ 완료 표시
- 🗺️ 지도에서 보기 (위치 정보가 있는 경우)
- ✏️ 수정
- 🗑️ 삭제

### 3. 구글 캘린더 연동

#### iCalendar 내보내기
- 📅 표준 iCalendar (.ics) 형식
- 일정별 이벤트 생성
- 위치 정보 포함 (GEO 태그)
- 메모 포함 (DESCRIPTION)

#### 지원 캘린더 앱
- Google Calendar
- Apple Calendar
- Outlook
- 기타 iCalendar 호환 앱

## 사용 방법

### STEP 1: 여행 계획 만들기

1. **플래너 탭** 클릭
2. **새 계획 만들기** 버튼 클릭
3. 필수 정보 입력:
   - 여행 제목 (예: "제주도 가족 여행")
   - 목적지 (예: "제주도")
   - 출발일/도착일
4. 선택 정보 입력:
   - 예산 (원 단위)
   - 인원 (기본 1명)
   - 메모
5. **계획 생성** 버튼 클릭

### STEP 2: 일정 추가하기

1. 계획 카드 클릭 (상세 보기)
2. **일정 추가** 버튼 클릭
3. 일정 정보 입력:
   - 날짜 및 시간
   - 제목 (예: "성산일출봉 등반")
   - 장소 (예: "성산일출봉")
   - 유형 선택 (활동/숙박/식사/이동)
   - 메모 (선택)
4. **추가** 버튼 클릭

### STEP 3: 일정 관리하기

- **완료 표시**: 일정 완료 버튼 클릭
- **지도에서 보기**: 🗺️ 버튼 클릭 (위치가 있는 경우)
- **삭제**: 🗑️ 버튼 클릭

### STEP 4: 캘린더로 내보내기

1. 계획 상세 화면에서 **📅 캘린더로 내보내기** 버튼 클릭
2. .ics 파일 다운로드
3. 구글 캘린더에서:
   - 설정 → 캘린더 가져오기 선택
   - 다운로드한 .ics 파일 업로드
4. 모든 일정이 자동으로 캘린더에 추가됨

## API 레퍼런스

### 여행 계획 API

#### 계획 생성
```http
POST /api/travel-plans
Content-Type: application/json

{
  "title": "제주도 가족 여행",
  "destination": "제주도",
  "startDate": "2026-03-15",
  "endDate": "2026-03-18",
  "budget": 2000000,
  "travelers": 4,
  "notes": "가족들과 함께하는 봄 여행"
}
```

**응답**
```json
{
  "success": true,
  "message": "여행 계획이 생성되었습니다.",
  "data": {
    "id": 1,
    "title": "제주도 가족 여행",
    "destination": "제주도",
    "startDate": "2026-03-15",
    "endDate": "2026-03-18",
    "budget": 2000000,
    "travelers": 4,
    "notes": "가족들과 함께하는 봄 여행",
    "status": "planning",
    "createdAt": "2026-02-02T13:00:00.000Z",
    "updatedAt": "2026-02-02T13:00:00.000Z"
  }
}
```

#### 계획 목록 조회
```http
GET /api/travel-plans
GET /api/travel-plans?status=planning  # 상태별 필터링
```

#### 계획 상세 조회
```http
GET /api/travel-plans/:id
```

**응답**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "제주도 가족 여행",
    ...
    "itineraries": [
      {
        "id": 1,
        "planId": 1,
        "date": "2026-03-15",
        "time": "10:00",
        "title": "성산일출봉 등반",
        "location": "성산일출봉",
        "type": "activity",
        "lat": 33.4597,
        "lng": 126.9425,
        "completed": false
      }
    ]
  }
}
```

#### 계획 수정
```http
PUT /api/travel-plans/:id
Content-Type: application/json

{
  "title": "제주도 가족 여행 (수정)",
  "status": "confirmed"
}
```

#### 계획 삭제
```http
DELETE /api/travel-plans/:id
```

### 일정 API

#### 일정 추가
```http
POST /api/itineraries
Content-Type: application/json

{
  "planId": 1,
  "date": "2026-03-15",
  "time": "10:00",
  "title": "성산일출봉 등반",
  "location": "성산일출봉",
  "type": "activity",
  "notes": "아침 일찍 출발",
  "lat": 33.4597,
  "lng": 126.9425
}
```

#### 일정 목록 조회
```http
GET /api/itineraries?planId=1
GET /api/itineraries?planId=1&date=2026-03-15  # 날짜별 필터링
```

#### 일정 수정
```http
PUT /api/itineraries/:id
Content-Type: application/json

{
  "completed": true
}
```

#### 일정 삭제
```http
DELETE /api/itineraries/:id
```

### 캘린더 내보내기 API

#### iCalendar 파일 생성
```http
GET /api/travel-plans/:id/export-ical
```

**응답**: text/calendar 형식의 .ics 파일
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mobility Platform//Travel Planner//EN
X-WR-CALNAME:제주도 가족 여행
X-WR-TIMEZONE:Asia/Seoul
BEGIN:VEVENT
UID:1@mobilityplatform
DTSTART:20260315T100000
DTEND:20260315T110000
SUMMARY:성산일출봉 등반
LOCATION:성산일출봉
DESCRIPTION:아침 일찍 출발
GEO:33.4597;126.9425
END:VEVENT
...
END:VCALENDAR
```

## 구글 캘린더 연동

### 내보내기 프로세스

```mermaid
graph LR
    A[플래너] --> B[iCal 생성]
    B --> C[.ics 다운로드]
    C --> D[구글 캘린더]
    D --> E[일정 자동 추가]
```

### iCalendar 형식 상세

#### 지원 필드
- **UID**: 고유 식별자
- **DTSTART**: 시작 시간
- **DTEND**: 종료 시간 (시작 + 1시간)
- **SUMMARY**: 일정 제목
- **LOCATION**: 장소
- **DESCRIPTION**: 메모
- **GEO**: 위도/경도 좌표

#### 시간대 처리
- Asia/Seoul (KST, UTC+9) 기준
- ISO 8601 형식 사용

### 가져오기 방법

#### 구글 캘린더 (웹)
1. 설정 (⚙️) → 가져오기 및 내보내기
2. 컴퓨터에서 선택
3. .ics 파일 업로드
4. 캘린더 선택
5. 가져오기 클릭

#### 구글 캘린더 (모바일)
1. 이메일로 .ics 첨부파일 전송
2. 첨부파일 탭
3. 캘린더에 추가

#### Apple Calendar
- .ics 파일 더블클릭
- 자동으로 캘린더에 추가

#### Outlook
- 파일 → 열기 및 내보내기 → 가져오기/내보내기
- iCalendar(.ics) 또는 vCalendar 파일 선택

## 테스트 결과

### 자동화 테스트

```bash
# 테스트 실행
./planner_test.sh
```

### 테스트 항목 (17개)

#### ✅ 여행 계획 API (4개)
- 빈 계획 목록 조회
- 계획 생성
- 계획 목록 조회
- 계획 상세 조회

#### ✅ 일정 API (5개)
- 일정 추가 (활동)
- 일정 목록 조회
- 일정 완료 표시
- 숙박 일정 추가
- 식사 일정 추가

#### ✅ 수정 및 삭제 (4개)
- 계획 수정
- 일정 삭제
- 계획 삭제
- 삭제된 계획 조회 (404)

#### ✅ 구글 캘린더 연동 (1개)
- iCalendar 내보내기
- VCALENDAR 형식 확인
- 이벤트 수 검증

#### ✅ 데이터 품질 (3개)
- 필수 필드 누락 테스트
- 존재하지 않는 계획 조회
- 잘못된 planId 처리

### 성능 지표

| 항목 | 결과 |
|------|------|
| 총 테스트 | 17개 |
| 통과 | 17개 (100%) |
| 실패 | 0개 |
| 평균 응답 시간 | < 100ms |

## 기술 스택

### 백엔드
- **Node.js** + **Express.js**: REST API 서버
- **메모리 저장소**: 샘플 데이터 (실제 환경에서는 DB 연결 권장)

### 프론트엔드
- **바닐라 JavaScript**: 가볍고 빠른 UI
- **Leaflet.js**: 지도 통합
- **반응형 CSS**: 모바일 최적화

### 데이터 형식
- **JSON**: API 통신
- **iCalendar**: 캘린더 내보내기 (RFC 5545)

## 향후 개선 사항

### 단기 (1-2주)
- [ ] 데이터베이스 연동 (PostgreSQL/MongoDB)
- [ ] 사용자 인증 및 권한 관리
- [ ] 실시간 동기화 (WebSocket)

### 중기 (1-2개월)
- [ ] 소셜 공유 기능
- [ ] AI 추천 여행지
- [ ] 날씨 정보 연동
- [ ] 예산 추적 및 분석

### 장기 (3-6개월)
- [ ] 다국어 지원
- [ ] 오프라인 모드
- [ ] 여행 동반자 초대 및 협업
- [ ] 사진 앨범 통합

## 문의 및 지원

- **GitHub**: https://github.com/chungkyuhong/Mymapbot
- **이슈 등록**: GitHub Issues
- **문서**: README.md, TRAVEL_FEATURES.md

---

© 2026 GenSpark AI Developer | 모빌리티 통합 플랫폼
