#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "======================================"
echo "   여행 플래너 기능 테스트 시작"
echo "======================================"

# 테스트 함수
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_success="$5"
    
    echo -n "테스트: $test_name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "${BASE_URL}${endpoint}")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "${BASE_URL}${endpoint}")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -X PUT -H "Content-Type: application/json" -d "$data" "${BASE_URL}${endpoint}")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -X DELETE "${BASE_URL}${endpoint}")
    fi
    
    success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$success" = "$expected_success" ]; then
        echo -e "${GREEN}✓ 통과${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ 실패${NC}"
        echo "  응답: $response"
        ((FAILED++))
        return 1
    fi
}

echo ""
echo "=== 여행 계획 API 테스트 ==="

# 1. 계획 목록 조회 (빈 목록)
test_api "빈 계획 목록 조회" "GET" "/api/travel-plans" "" "true"

# 2. 계획 생성
echo "=== 계획 생성 테스트 ==="
PLAN_DATA='{
    "title": "제주도 가족 여행",
    "destination": "제주도",
    "startDate": "2026-03-15",
    "endDate": "2026-03-18",
    "budget": 2000000,
    "travelers": 4,
    "notes": "가족들과 함께하는 봄 여행"
}'
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$PLAN_DATA" "${BASE_URL}/api/travel-plans")
PLAN_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$PLAN_ID" ]; then
    echo -e "${GREEN}✓ 계획 생성 성공 (ID: $PLAN_ID)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 계획 생성 실패${NC}"
    ((FAILED++))
fi

# 3. 계획 목록 조회 (계획 있음)
test_api "계획 목록 조회" "GET" "/api/travel-plans" "" "true"

# 4. 계획 상세 조회
if [ -n "$PLAN_ID" ]; then
    test_api "계획 상세 조회" "GET" "/api/travel-plans/$PLAN_ID" "" "true"
fi

echo ""
echo "=== 일정 API 테스트 ==="

# 5. 일정 추가
if [ -n "$PLAN_ID" ]; then
    ITINERARY_DATA='{
        "planId": '$PLAN_ID',
        "date": "2026-03-15",
        "time": "10:00",
        "title": "성산일출봉 등반",
        "location": "성산일출봉",
        "type": "activity",
        "notes": "아침 일찍 출발",
        "lat": 33.4597,
        "lng": 126.9425
    }'
    response=$(curl -s -X POST -H "Content-Type: application/json" -d "$ITINERARY_DATA" "${BASE_URL}/api/itineraries")
    ITINERARY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -n "$ITINERARY_ID" ]; then
        echo -e "${GREEN}✓ 일정 추가 성공 (ID: $ITINERARY_ID)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 일정 추가 실패${NC}"
        ((FAILED++))
    fi
fi

# 6. 일정 목록 조회
test_api "일정 목록 조회" "GET" "/api/itineraries?planId=$PLAN_ID" "" "true"

# 7. 일정 완료 토글
if [ -n "$ITINERARY_ID" ]; then
    test_api "일정 완료 표시" "PUT" "/api/itineraries/$ITINERARY_ID" '{"completed": true}' "true"
fi

# 8. 계획에 일정 추가 (숙박)
if [ -n "$PLAN_ID" ]; then
    HOTEL_DATA='{
        "planId": '$PLAN_ID',
        "date": "2026-03-15",
        "time": "15:00",
        "title": "호텔 체크인",
        "location": "제주 신라호텔",
        "type": "accommodation",
        "notes": "오션뷰 객실"
    }'
    test_api "숙박 일정 추가" "POST" "/api/itineraries" "$HOTEL_DATA" "true"
fi

# 9. 계획에 일정 추가 (식사)
if [ -n "$PLAN_ID" ]; then
    MEAL_DATA='{
        "planId": '$PLAN_ID',
        "date": "2026-03-15",
        "time": "18:00",
        "title": "저녁 식사",
        "location": "흑돼지 맛집",
        "type": "restaurant",
        "notes": "예약 필요"
    }'
    test_api "식사 일정 추가" "POST" "/api/itineraries" "$MEAL_DATA" "true"
fi

echo ""
echo "=== 수정 및 삭제 테스트 ==="

# 10. 계획 수정
if [ -n "$PLAN_ID" ]; then
    UPDATE_DATA='{
        "title": "제주도 가족 여행 (수정)",
        "status": "confirmed"
    }'
    test_api "계획 수정" "PUT" "/api/travel-plans/$PLAN_ID" "$UPDATE_DATA" "true"
fi

# 11. iCalendar 내보내기 테스트 (삭제 전에 실행)
echo ""
echo "=== 구글 캘린더 내보내기 테스트 ==="
if [ -n "$PLAN_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/travel-plans/$PLAN_ID/export-ical")
    http_code=$(echo "$response" | tail -1)
    content=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ] && echo "$content" | grep -q "BEGIN:VCALENDAR"; then
        echo -e "${GREEN}✓ iCalendar 내보내기 성공${NC}"
        echo "  - VCALENDAR 형식 확인"
        echo "  - 이벤트 수: $(echo "$content" | grep -c "BEGIN:VEVENT")"
        ((PASSED++))
    else
        echo -e "${RED}✗ iCalendar 내보내기 실패${NC}"
        echo "  HTTP 코드: $http_code"
        ((FAILED++))
    fi
fi

# 12. 일정 삭제
if [ -n "$ITINERARY_ID" ]; then
    test_api "일정 삭제" "DELETE" "/api/itineraries/$ITINERARY_ID" "" "true"
fi

# 13. 계획 삭제
if [ -n "$PLAN_ID" ]; then
    test_api "계획 삭제" "DELETE" "/api/travel-plans/$PLAN_ID" "" "true"
fi

# 14. 삭제 후 조회 (404 확인)
if [ -n "$PLAN_ID" ]; then
    test_api "삭제된 계획 조회 (404)" "GET" "/api/travel-plans/$PLAN_ID" "" "false"
fi

echo ""
echo "=== 데이터 품질 테스트 ==="

# 15. 필수 필드 누락 테스트
test_api "필수 필드 누락 (제목)" "POST" "/api/travel-plans" '{"destination":"서울"}' "false"

# 16. 잘못된 계획 ID
test_api "존재하지 않는 계획 조회" "GET" "/api/travel-plans/99999" "" "false"

# 17. 일정에 잘못된 planId
test_api "잘못된 planId로 일정 추가" "POST" "/api/itineraries" '{"planId":99999,"date":"2026-03-15","title":"테스트"}' "false"

echo ""
echo "======================================"
echo "        테스트 결과 요약"
echo "======================================"
echo -e "${GREEN}통과: $PASSED${NC}"
echo -e "${RED}실패: $FAILED${NC}"
echo "총 테스트: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ 모든 테스트 통과!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ 일부 테스트 실패${NC}"
    exit 1
fi
