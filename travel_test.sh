#!/bin/bash

# 여행 추천 및 예약 기능 테스트 스크립트

echo "========================================="
echo "🧪 여행 추천 및 예약 시스템 테스트"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

# 테스트 함수
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected="$5"
    
    echo -n "[$((PASS + FAIL + 1))] $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BASE_URL$endpoint")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q "$expected"; then
        echo "✅ 통과"
        ((PASS++))
    else
        echo "❌ 실패"
        echo "   응답: $response"
        ((FAIL++))
    fi
}

echo "=== 1. 출장 목적 추천 테스트 ==="
test_api "출장 호텔 추천" "GET" "/api/recommendations/business?lat=37.5665&lng=126.9780" "" "서울 비즈니스 호텔"
test_api "출장 맛집 추천" "GET" "/api/recommendations/business?lat=37.5665&lng=126.9780" "" "한정식 서울"
test_api "출장 관광지 추천" "GET" "/api/recommendations/business?lat=37.5665&lng=126.9780" "" "코엑스 컨벤션"
echo ""

echo "=== 2. 여행 목적 추천 테스트 ==="
test_api "여행 호텔 추천" "GET" "/api/recommendations/travel?lat=37.5665&lng=126.9780" "" "북촌 한옥 게스트하우스"
test_api "여행 맛집 추천" "GET" "/api/recommendations/travel?lat=37.5665&lng=126.9780" "" "광장시장"
test_api "여행 관광지 추천" "GET" "/api/recommendations/travel?lat=37.5665&lng=126.9780" "" "경복궁"
test_api "여행 쇼핑 추천" "GET" "/api/recommendations/travel?lat=37.5665&lng=126.9780" "" "명동 쇼핑거리"
echo ""

echo "=== 3. 식사 목적 추천 테스트 ==="
test_api "파인다이닝 추천" "GET" "/api/recommendations/dining?lat=37.5665&lng=126.9780" "" "미슐랭 프렌치"
test_api "스시 맛집 추천" "GET" "/api/recommendations/dining?lat=37.5665&lng=126.9780" "" "강남 스시야"
test_api "이탈리안 추천" "GET" "/api/recommendations/dining?lat=37.5665&lng=126.9780" "" "압구정 이탈리안"
test_api "카페 거리 추천" "GET" "/api/recommendations/dining?lat=37.5665&lng=126.9780" "" "삼청동 카페거리"
echo ""

echo "=== 4. 거리 계산 기능 테스트 ==="
test_api "거리 정보 포함" "GET" "/api/recommendations/business?lat=37.5665&lng=126.9780" "" "distance"
echo ""

echo "=== 5. 여행 예약 테스트 ==="
test_api "호텔 예약" "POST" "/api/travel-bookings" \
    '{"type":"hotel","itemId":1,"purpose":"business","date":"2026-02-10","time":"15:00","guests":2}' \
    "예약이 완료되었습니다"

test_api "레스토랑 예약" "POST" "/api/travel-bookings" \
    '{"type":"restaurant","itemId":3,"purpose":"travel","date":"2026-02-11","time":"18:00","guests":4}' \
    "예약이 완료되었습니다"

test_api "관광지 예약" "POST" "/api/travel-bookings" \
    '{"type":"attraction","itemId":3,"purpose":"travel","date":"2026-02-12","time":"10:00","guests":2}' \
    "예약이 완료되었습니다"
echo ""

echo "=== 6. 잘못된 요청 테스트 ==="
test_api "존재하지 않는 목적" "GET" "/api/recommendations/invalid" "" "해당 목적의 추천 정보를 찾을 수 없습니다"

test_api "필수 정보 누락" "POST" "/api/travel-bookings" \
    '{"type":"hotel","purpose":"business"}' \
    "필수 정보를 입력해주세요"

test_api "존재하지 않는 항목" "POST" "/api/travel-bookings" \
    '{"type":"hotel","itemId":999,"purpose":"business","date":"2026-02-10"}' \
    "예약하려는 항목을 찾을 수 없습니다"
echo ""

echo "=== 7. 추천 데이터 품질 테스트 ==="
echo -n "[$((PASS + FAIL + 1))] 출장 추천 데이터 구조 ... "
response=$(curl -s "$BASE_URL/api/recommendations/business?lat=37.5665&lng=126.9780")
if echo "$response" | grep -q "hotels" && echo "$response" | grep -q "restaurants" && echo "$response" | grep -q "attractions"; then
    echo "✅ 통과"
    ((PASS++))
else
    echo "❌ 실패"
    ((FAIL++))
fi

echo -n "[$((PASS + FAIL + 1))] 여행 추천 데이터 구조 ... "
response=$(curl -s "$BASE_URL/api/recommendations/travel?lat=37.5665&lng=126.9780")
if echo "$response" | grep -q "hotels" && echo "$response" | grep -q "restaurants" && echo "$response" | grep -q "attractions"; then
    echo "✅ 통과"
    ((PASS++))
else
    echo "❌ 실패"
    ((FAIL++))
fi

echo -n "[$((PASS + FAIL + 1))] 식사 추천 데이터 구조 ... "
response=$(curl -s "$BASE_URL/api/recommendations/dining?lat=37.5665&lng=126.9780")
if echo "$response" | grep -q "restaurants"; then
    echo "✅ 통과"
    ((PASS++))
else
    echo "❌ 실패"
    ((FAIL++))
fi
echo ""

echo "=== 8. 성능 테스트 ==="
echo -n "[$((PASS + FAIL + 1))] API 응답 시간 (<500ms) ... "
start_time=$(date +%s%3N)
curl -s "$BASE_URL/api/recommendations/travel?lat=37.5665&lng=126.9780" > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))
if [ $response_time -lt 500 ]; then
    echo "✅ 통과 (${response_time}ms)"
    ((PASS++))
else
    echo "❌ 실패 (${response_time}ms)"
    ((FAIL++))
fi
echo ""

# 최종 결과
echo "========================================="
echo "📊 테스트 결과"
echo "========================================="
echo "총 테스트: $((PASS + FAIL))개"
echo "✅ 통과: ${PASS}개"
echo "❌ 실패: ${FAIL}개"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "🎉 모든 테스트를 통과했습니다!"
    echo "========================================="
    exit 0
else
    echo ""
    echo "⚠️  일부 테스트가 실패했습니다."
    echo "========================================="
    exit 1
fi
