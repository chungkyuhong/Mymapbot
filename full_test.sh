#!/bin/bash

# 모빌리티 플랫폼 전수 검사 스크립트
# 작성일: 2026-02-03

echo "======================================"
echo "   🚀 모빌리티 플랫폼 전수 검사"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0
TOTAL=0

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 함수
test_api() {
    local name="$1"
    local endpoint="$2"
    local expected_code="${3:-200}"
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "테스트 $TOTAL: $name ... "
    
    response=$(curl --max-time 5 -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ 통과${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ 실패${NC} (HTTP $http_code, 예상: $expected_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# JSON 검증 함수
test_api_json() {
    local name="$1"
    local endpoint="$2"
    local check_field="$3"
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "테스트 $TOTAL: $name ... "
    
    response=$(curl --max-time 5 -s "$BASE_URL$endpoint" 2>/dev/null)
    
    # JSON 파싱 (jq 없이)
    if echo "$response" | grep -q "\"$check_field\""; then
        echo -e "${GREEN}✓ 통과${NC} (필드 '$check_field' 존재)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ 실패${NC} (필드 '$check_field' 없음)"
        echo "  응답: $(echo "$response" | head -c 100)..."
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# POST 테스트 함수
test_api_post() {
    local name="$1"
    local endpoint="$2"
    local data="$3"
    local expected_code="${4:-200}"
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "테스트 $TOTAL: $name ... "
    
    response=$(curl --max-time 5 -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL$endpoint" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ 통과${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ 실패${NC} (HTTP $http_code, 예상: $expected_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo -e "${BLUE}=== 1. 헬스 체크 ===${NC}"
test_api_json "서버 헬스 체크" "/api/health" "success"
echo ""

echo -e "${BLUE}=== 2. 주차장 API 테스트 ===${NC}"
test_api_json "주차장 목록 조회" "/api/parking" "success"
test_api_json "주차장 검색" "/api/parking/search?query=시청" "success"
echo ""

echo -e "${BLUE}=== 3. 경로 API 테스트 ===${NC}"
test_api_post "경로 검색" "/api/route" '{"start":{"lat":37.5665,"lng":126.978},"end":{"lat":37.5651,"lng":126.988},"mode":"car"}' 200
echo ""

echo -e "${BLUE}=== 4. POI API 테스트 ===${NC}"
test_api_json "카테고리 검색 (카페)" "/api/poi/category/cafe?lat=37.5665&lng=126.978&radius=2000" "success"
test_api_json "카테고리 검색 (음식점)" "/api/poi/category/restaurant?lat=37.5665&lng=126.978&radius=2000" "success"
test_api_json "카테고리 검색 (편의점)" "/api/poi/category/store?lat=37.5665&lng=126.978&radius=2000" "success"
test_api_json "주변 검색 (카페)" "/api/nearby/cafe?lat=37.5665&lng=126.978&radius=2000" "success"
test_api_json "주변 검색 (병원)" "/api/nearby/hospital?lat=37.5665&lng=126.978&radius=2000" "success"
echo ""

echo -e "${BLUE}=== 5. 여행 추천 API 테스트 ===${NC}"
test_api_json "출장 추천" "/api/recommendations/business?lat=37.5665&lng=126.978" "success"
test_api_json "여행 추천" "/api/recommendations/travel?lat=37.5665&lng=126.978" "success"
test_api_json "식사 추천" "/api/recommendations/dining?lat=37.5665&lng=126.978" "success"
echo ""

echo -e "${BLUE}=== 6. 여행 플래너 API 테스트 ===${NC}"
test_api_json "여행 계획 목록" "/api/travel-plans" "success"
test_api_post "여행 계획 생성" "/api/travel-plans" '{"title":"테스트 여행","destination":"제주도","startDate":"2026-03-01","endDate":"2026-03-03","travelers":2,"budget":500000}' 201
test_api_json "여행 계획 조회" "/api/travel-plans/1" "success"
echo ""

echo -e "${BLUE}=== 7. 일정 API 테스트 ===${NC}"
test_api_json "일정 목록 조회" "/api/itineraries?planId=1" "success"
test_api_post "일정 추가" "/api/itineraries" '{"planId":1,"date":"2026-03-01","time":"09:00","title":"공항 출발","type":"transport","location":"김포공항"}' 201
echo ""

echo -e "${BLUE}=== 8. 목적지 콘텐츠 API 테스트 ===${NC}"
test_api_json "제주도 콘텐츠 (여행)" "/api/destination-content/제주도?purpose=travel" "success"
test_api_json "서울 콘텐츠 (출장)" "/api/destination-content/서울?purpose=business" "success"
test_api_json "부산 콘텐츠 (맛집)" "/api/destination-content/부산?purpose=dining" "success"
echo ""

echo -e "${BLUE}=== 9. 민원 API 테스트 ===${NC}"
test_api_json "민원 목록" "/api/complaints" "success"
test_api_post "민원 신고" "/api/complaints" '{"type":"parking","location":"테스트 위치","description":"테스트 민원","lat":37.5665,"lng":126.978}' 201
echo ""

echo -e "${BLUE}=== 10. 예약 API 테스트 ===${NC}"
test_api_json "예약 목록" "/api/bookings" "success"
test_api_post "예약 생성" "/api/bookings" '{"type":"parking","facilityId":"1","date":"2026-03-01","time":"09:00","duration":"2"}' 201
echo ""

echo -e "${BLUE}=== 11. 통계 API 테스트 ===${NC}"
test_api_json "통계 조회" "/api/stats" "success"
echo ""

echo -e "${BLUE}=== 12. 에러 핸들링 테스트 ===${NC}"
test_api "잘못된 경로 (404)" "/api/invalid-endpoint" 404
test_api_json "위치 정보 누락 (400)" "/api/nearby/cafe" "success"
test_api "존재하지 않는 여행 계획 (404)" "/api/travel-plans/99999" 404
echo ""

echo -e "${BLUE}=== 13. 성능 테스트 ===${NC}"
echo -n "테스트 $((TOTAL + 1)): API 응답 시간 측정 ... "
TOTAL=$((TOTAL + 1))

start_time=$(date +%s%3N)
curl -s "$BASE_URL/api/health" > /dev/null 2>&1
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ $response_time -lt 1000 ]; then
    echo -e "${GREEN}✓ 통과${NC} (${response_time}ms < 1000ms)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ 경고${NC} (${response_time}ms >= 1000ms)"
    PASSED=$((PASSED + 1))
fi
echo ""

echo "======================================"
echo -e "${BLUE}📊 전수 검사 결과 요약${NC}"
echo "======================================"
echo -e "총 테스트: ${BLUE}$TOTAL${NC}"
echo -e "통과: ${GREEN}$PASSED${NC}"
echo -e "실패: ${RED}$FAILED${NC}"
echo -e "성공률: ${BLUE}$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 테스트 통과!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAILED개 테스트 실패${NC}"
    echo ""
    exit 1
fi
