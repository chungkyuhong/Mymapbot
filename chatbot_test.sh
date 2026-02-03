#!/bin/bash

API_URL="http://localhost:3000"
PASS_COUNT=0
FAIL_COUNT=0

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_api() {
    TEST_NAME=$1
    METHOD=$2
    ENDPOINT=$3
    DATA=$4
    
    echo -n "테스트: $TEST_NAME ... "
    
    if [ "$METHOD" == "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL$ENDPOINT")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD -H "Content-Type: application/json" -d "$DATA" "$API_URL$ENDPOINT")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo -e "${GREEN}✓ 통과${NC} (HTTP $HTTP_CODE)"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗ 실패${NC} (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
        ((FAIL_COUNT++))
    fi
}

echo "===== 챗봇 API 테스트 ====="
echo ""

# 1. 기본 챗봇 메시지 테스트
test_api "기본 메시지" "POST" "/api/chatbot/message" '{
    "message": "안녕하세요",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 2. 식당 검색
test_api "식당 검색" "POST" "/api/chatbot/message" '{
    "message": "근처 맛집 찾아줘",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 3. 주차 정보
test_api "주차 정보" "POST" "/api/chatbot/message" '{
    "message": "주차장 어디 있어?",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 4. 메뉴 주문
test_api "메뉴 주문" "POST" "/api/chatbot/message" '{
    "message": "메뉴 주문하고 싶어요",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 5. 드라이브스루
test_api "드라이브스루" "POST" "/api/chatbot/message" '{
    "message": "드라이브스루 가능한 곳",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 6. 예약 (챗봇)
test_api "예약 메시지" "POST" "/api/chatbot/message" '{
    "message": "예약하고 싶어요",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 7. 경로 안내
test_api "경로 안내" "POST" "/api/chatbot/message" '{
    "message": "경로 안내해줘",
    "location": {"lat": 37.5665, "lng": 126.9780}
}'

# 8. 식당 예약 API
test_api "식당 예약 API" "POST" "/api/chatbot/reservation" '{
    "restaurantId": "R001",
    "date": "2026-02-05",
    "time": "18:00",
    "people": 4,
    "notes": "창가 자리 부탁드립니다"
}'

# 9. 메뉴 미리주문 API
test_api "메뉴 미리주문 API" "POST" "/api/chatbot/preorder" '{
    "restaurantId": "R001",
    "items": [
        {"name": "아메리카노", "quantity": 2, "price": 4500},
        {"name": "카페라떼", "quantity": 1, "price": 5000}
    ],
    "pickupTime": "30분 후",
    "notes": "얼음 적게 부탁합니다"
}'

# 10. 예약 누락 필드 (에러 처리)
test_api "예약 에러 처리" "POST" "/api/chatbot/reservation" '{
    "restaurantId": "R001",
    "date": "2026-02-05"
}'

echo ""
echo "===== 테스트 결과 ====="
echo -e "${GREEN}통과: $PASS_COUNT${NC}"
echo -e "${RED}실패: $FAIL_COUNT${NC}"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
SUCCESS_RATE=$(echo "scale=1; $PASS_COUNT * 100 / $TOTAL" | bc)
echo "성공률: ${SUCCESS_RATE}%"
