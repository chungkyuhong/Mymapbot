#!/bin/bash

# 프론트엔드 여행 탭 기능 테스트

echo "========================================="
echo "🧪 프론트엔드 여행 탭 기능 테스트"
echo "========================================="
echo ""

BASE_URL="http://localhost:5173"
API_URL="http://localhost:3000"
PASS=0
FAIL=0

# 테스트 함수
test_check() {
    local name="$1"
    local result="$2"
    
    echo -n "[$((PASS + FAIL + 1))] $name ... "
    
    if [ "$result" = "0" ]; then
        echo "✅ 통과"
        ((PASS++))
    else
        echo "❌ 실패"
        ((FAIL++))
    fi
}

echo "=== 1. 프론트엔드 서버 확인 ==="
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
test_check "프론트엔드 서버 응답" $((response != 200))

response=$(curl -s "$BASE_URL" | grep -c "모빌리티 통합 플랫폼")
test_check "페이지 제목 확인" $((response == 0))

response=$(curl -s "$BASE_URL" | grep -c "여행")
test_check "여행 탭 존재 확인" $((response == 0))
echo ""

echo "=== 2. 여행 탭 HTML 구조 ==="
response=$(curl -s "$BASE_URL" | grep -c "travel-tab")
test_check "여행 탭 ID 존재" $((response == 0))

response=$(curl -s "$BASE_URL" | grep -c "purpose-btn")
test_check "목적 선택 버튼 존재" $((response == 0))

response=$(curl -s "$BASE_URL" | grep -c "data-purpose=\"business\"")
test_check "출장 버튼 존재" $((response == 0))

response=$(curl -s "$BASE_URL" | grep -c "data-purpose=\"travel\"")
test_check "여행 버튼 존재" $((response == 0))

response=$(curl -s "$BASE_URL" | grep -c "data-purpose=\"dining\"")
test_check "식사 버튼 존재" $((response == 0))

response=$(curl -s "$BASE_URL" | grep -c "recommendationList")
test_check "추천 목록 컨테이너 존재" $((response == 0))
echo ""

echo "=== 3. JavaScript 파일 확인 ==="
response=$(curl -s "$BASE_URL/main.js" | grep -c "selectPurpose")
test_check "selectPurpose 함수 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "renderRecommendations")
test_check "renderRecommendations 함수 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "bookItem")
test_check "bookItem 함수 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "viewOnMap")
test_check "viewOnMap 함수 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "window.bookItem")
test_check "bookItem 전역 노출 확인" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "window.viewOnMap")
test_check "viewOnMap 전역 노출 확인" $((response == 0))
echo ""

echo "=== 4. API 연동 확인 ==="
response=$(curl -s "$BASE_URL/main.js" | grep -c "/api/recommendations/")
test_check "API 엔드포인트 호출 코드 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "/api/travel-bookings")
test_check "예약 API 호출 코드 존재" $((response == 0))
echo ""

echo "=== 5. CSS 스타일 확인 ==="
response=$(curl -s "$BASE_URL/style.css" | grep -c "purpose-btn")
test_check "목적 버튼 스타일 존재" $((response == 0))

response=$(curl -s "$BASE_URL/style.css" | grep -c "recommendation")
test_check "추천 카드 스타일 존재" $((response == 0))
echo ""

echo "=== 6. API 실제 응답 확인 ==="
response=$(curl -s "$API_URL/api/recommendations/business?lat=37.5665&lng=126.9780" | grep -c "서울 비즈니스 호텔")
test_check "출장 호텔 데이터 확인" $((response == 0))

response=$(curl -s "$API_URL/api/recommendations/travel?lat=37.5665&lng=126.9780" | grep -c "북촌 한옥")
test_check "여행 숙박 데이터 확인" $((response == 0))

response=$(curl -s "$API_URL/api/recommendations/dining?lat=37.5665&lng=126.9780" | grep -c "미슐랭")
test_check "식사 레스토랑 데이터 확인" $((response == 0))

response=$(curl -s "$API_URL/api/recommendations/business?lat=37.5665&lng=126.9780" | grep -c "distance")
test_check "거리 정보 포함 확인" $((response == 0))
echo ""

echo "=== 7. 지도 연동 확인 ==="
response=$(curl -s "$BASE_URL/main.js" | grep -c "addRecommendationMarkers")
test_check "지도 마커 추가 함수 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "L.marker")
test_check "Leaflet 마커 생성 코드 존재" $((response == 0))
echo ""

echo "=== 8. 에러 처리 확인 ==="
response=$(curl -s "$BASE_URL/main.js" | grep -c "catch.*error")
test_check "에러 처리 코드 존재" $((response == 0))

response=$(curl -s "$BASE_URL/main.js" | grep -c "alert")
test_check "사용자 알림 코드 존재" $((response == 0))
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
    echo "🎉 모든 프론트엔드 테스트를 통과했습니다!"
    echo "========================================="
    echo ""
    echo "📱 테스트 방법:"
    echo "1. 브라우저에서 http://localhost:5173 접속"
    echo "2. 상단 '여행' 탭 클릭"
    echo "3. 목적 버튼 클릭 (출장/여행/식사)"
    echo "4. 추천 정보 확인"
    echo "5. 지도에서 마커 확인"
    echo "6. '예약하기' 버튼 테스트"
    echo ""
    exit 0
else
    echo ""
    echo "⚠️  일부 테스트가 실패했습니다."
    echo "========================================="
    exit 1
fi
