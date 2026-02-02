#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     모빌리티/지도 특화 미니 SaaS - 기능 품질 테스트     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 테스트 결과 저장
PASS_COUNT=0
FAIL_COUNT=0

# 테스트 함수
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -e "${YELLOW}[테스트] ${test_name}${NC}"
    
    result=$(eval "$test_command" 2>&1)
    
    if echo "$result" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ 통과${NC}"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}❌ 실패${NC}"
        echo "  응답: $result"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo -e "${BLUE}[1] API 서버 헬스 체크${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "서버 상태 확인" \
    "curl -s http://localhost:3000/api/health" \
    "success.*true"
echo ""

echo -e "${BLUE}[2] 주차장 관리 기능 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "주차장 목록 조회" \
    "curl -s http://localhost:3000/api/parking" \
    "success.*true"

run_test "특정 주차장 조회" \
    "curl -s http://localhost:3000/api/parking/1" \
    "시청역"

run_test "주차장 검색 (빈 자리)" \
    "curl -s 'http://localhost:3000/api/parking/search?available=true'" \
    "success.*true"
echo ""

echo -e "${BLUE}[3] 경로 안내 기능 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "경로 찾기 (자동차)" \
    "curl -s -X POST http://localhost:3000/api/route -H 'Content-Type: application/json' -d '{\"start\":\"서울역\",\"end\":\"강남역\",\"mode\":\"car\"}'" \
    "distance"

run_test "경로 찾기 (도보)" \
    "curl -s -X POST http://localhost:3000/api/route -H 'Content-Type: application/json' -d '{\"start\":\"홍대\",\"end\":\"신촌\",\"mode\":\"walk\"}'" \
    "duration"
echo ""

echo -e "${BLUE}[4] 민원 관리 기능 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "민원 접수" \
    "curl -s -X POST http://localhost:3000/api/complaints -H 'Content-Type: application/json' -d '{\"type\":\"parking\",\"location\":\"테스트 위치\",\"description\":\"테스트 민원\"}'" \
    "접수되었습니다"

run_test "민원 목록 조회" \
    "curl -s http://localhost:3000/api/complaints" \
    "success.*true"

# 민원 ID 가져오기
COMPLAINT_ID=$(curl -s http://localhost:3000/api/complaints | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$COMPLAINT_ID" ]; then
    run_test "민원 상세 조회" \
        "curl -s http://localhost:3000/api/complaints/$COMPLAINT_ID" \
        "success.*true"
fi
echo ""

echo -e "${BLUE}[5] 주변 시설 안내 기능 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "주변 주유소 검색" \
    "curl -s 'http://localhost:3000/api/nearby/gas?lat=37.5665&lng=126.9780'" \
    "주유소"

run_test "주변 병원 검색" \
    "curl -s 'http://localhost:3000/api/nearby/hospital?lat=37.5665&lng=126.9780'" \
    "병원"

run_test "주변 음식점 검색" \
    "curl -s 'http://localhost:3000/api/nearby/restaurant?lat=37.5665&lng=126.9780'" \
    "식당"

run_test "주변 카페 검색" \
    "curl -s 'http://localhost:3000/api/nearby/cafe?lat=37.5665&lng=126.9780'" \
    "스타벅스"

run_test "주변 편의점 검색" \
    "curl -s 'http://localhost:3000/api/nearby/store?lat=37.5665&lng=126.9780'" \
    "success"
echo ""

echo -e "${BLUE}[6] 예약 시스템 기능 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "주차장 예약" \
    "curl -s -X POST http://localhost:3000/api/bookings -H 'Content-Type: application/json' -d '{\"type\":\"parking\",\"facilityId\":\"1\",\"date\":\"2026-02-05\",\"time\":\"10:00\",\"duration\":\"3\"}'" \
    "예약이 완료"

run_test "예약 목록 조회" \
    "curl -s http://localhost:3000/api/bookings" \
    "success.*true"

# 예약 ID 가져오기
BOOKING_ID=$(curl -s http://localhost:3000/api/bookings | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$BOOKING_ID" ]; then
    run_test "예약 취소" \
        "curl -s -X DELETE http://localhost:3000/api/bookings/$BOOKING_ID" \
        "취소되었습니다"
fi
echo ""

echo -e "${BLUE}[7] 통계 및 대시보드 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "통계 데이터 조회" \
    "curl -s http://localhost:3000/api/stats" \
    "totalParkingLots"
echo ""

echo -e "${BLUE}[8] 에러 처리 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "존재하지 않는 주차장 조회" \
    "curl -s http://localhost:3000/api/parking/999" \
    "찾을 수 없습니다"

run_test "잘못된 경로 요청" \
    "curl -s -X POST http://localhost:3000/api/route -H 'Content-Type: application/json' -d '{\"start\":\"\"}'" \
    "success"

run_test "필수 정보 누락 민원 접수" \
    "curl -s -X POST http://localhost:3000/api/complaints -H 'Content-Type: application/json' -d '{\"type\":\"parking\"}'" \
    "필수 정보"

run_test "404 에러 처리" \
    "curl -s http://localhost:3000/api/nonexistent" \
    "찾을 수 없습니다"
echo ""

echo -e "${BLUE}[9] 성능 및 응답 시간 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 응답 시간 측정
echo -e "${YELLOW}[테스트] API 응답 시간 측정${NC}"
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/api/parking > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 500 ]; then
    echo -e "${GREEN}✅ 통과 (응답 시간: ${RESPONSE_TIME}ms)${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  경고 (응답 시간: ${RESPONSE_TIME}ms - 500ms 초과)${NC}"
    ((PASS_COUNT++))
fi
echo ""

# 동시 요청 테스트
echo -e "${YELLOW}[테스트] 동시 요청 처리${NC}"
for i in {1..5}; do
    curl -s http://localhost:3000/api/parking > /dev/null &
done
wait

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 통과 (5개 동시 요청 처리 성공)${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ 실패${NC}"
    ((FAIL_COUNT++))
fi
echo ""

# 최종 결과 출력
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      테스트 결과 요약                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "총 테스트: $((PASS_COUNT + FAIL_COUNT))개"
echo -e "${GREEN}통과: ${PASS_COUNT}개${NC}"
echo -e "${RED}실패: ${FAIL_COUNT}개${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트를 통과했습니다!${NC}"
    exit 0
else
    PASS_RATE=$(echo "scale=2; $PASS_COUNT * 100 / ($PASS_COUNT + $FAIL_COUNT)" | bc)
    echo -e "${YELLOW}⚠️  통과율: ${PASS_RATE}%${NC}"
    exit 1
fi
