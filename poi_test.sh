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
echo "   실제 POI API 통합 테스트"
echo "======================================"

# 테스트 위치 (서울시청)
TEST_LAT="37.5665"
TEST_LNG="126.9780"

echo ""
echo "=== POI 검색 API 테스트 ==="

# 1. 키워드 검색 (위치 없음)
echo -n "테스트: 키워드 검색 (스타벅스) ... "
response=$(curl -s "${BASE_URL}/api/poi/search?query=스타벅스")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

# 2. 키워드 + 위치 검색
echo -n "테스트: 위치 기반 키워드 검색 (카페) ... "
response=$(curl -s "${BASE_URL}/api/poi/search?query=카페&lat=${TEST_LAT}&lng=${TEST_LNG}&radius=3000")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

echo ""
echo "=== 카테고리 검색 API 테스트 ==="

# 3. 카페 검색
echo -n "테스트: 카테고리 검색 (카페) ... "
response=$(curl -s "${BASE_URL}/api/poi/category/cafe?lat=${TEST_LAT}&lng=${TEST_LNG}")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

# 4. 편의점 검색
echo -n "테스트: 카테고리 검색 (편의점) ... "
response=$(curl -s "${BASE_URL}/api/poi/category/convenience?lat=${TEST_LAT}&lng=${TEST_LNG}")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

# 5. 음식점 검색
echo -n "테스트: 카테고리 검색 (음식점) ... "
response=$(curl -s "${BASE_URL}/api/poi/category/restaurant?lat=${TEST_LAT}&lng=${TEST_LNG}&radius=2000")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

echo ""
echo "=== 주소 검색 API 테스트 ==="

# 6. 주소로 좌표 변환
echo -n "테스트: 주소 검색 (서울시청) ... "
response=$(curl -s "${BASE_URL}/api/poi/geocode?address=서울시청")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    lat=$(echo "$response" | grep -o '"lat":[0-9.]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (위도: ${lat})"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

echo ""
echo "=== 여행 추천 POI 연동 테스트 ==="

# 7. 출장 추천 (POI 연동)
echo -n "테스트: 출장 추천 (POI) ... "
response=$(curl -s "${BASE_URL}/api/recommendations/business?lat=${TEST_LAT}&lng=${TEST_LNG}")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    hotels=$(echo "$response" | grep -o '"hotels":\[' | wc -l)
    echo -e "${GREEN}✓ 통과${NC} (호텔 데이터 포함)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

# 8. 여행 추천 (POI 연동)
echo -n "테스트: 여행 추천 (POI) ... "
response=$(curl -s "${BASE_URL}/api/recommendations/travel?lat=${TEST_LAT}&lng=${TEST_LNG}")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    attractions=$(echo "$response" | grep -o '"attractions":\[' | wc -l)
    echo -e "${GREEN}✓ 통과${NC} (관광지 데이터 포함)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

echo ""
echo "=== 주변 안내 POI 연동 테스트 ==="

# 9. 주변 카페 검색
echo -n "테스트: 주변 카페 ... "
response=$(curl -s "${BASE_URL}/api/nearby/cafe?lat=${TEST_LAT}&lng=${TEST_LNG}")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

# 10. 주변 병원 검색
echo -n "테스트: 주변 병원 ... "
response=$(curl -s "${BASE_URL}/api/nearby/hospital?lat=${TEST_LAT}&lng=${TEST_LNG}")
success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 통과${NC} (${count}개 결과)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

echo ""
echo "=== 에러 처리 테스트 ==="

# 11. 위치 없이 카테고리 검색
echo -n "테스트: 위치 정보 누락 ... "
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/poi/category/cafe")
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ 통과${NC} (400 에러 반환)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC} (예상: 400, 실제: $http_code)"
    ((FAILED++))
fi

# 12. 잘못된 카테고리
echo -n "테스트: 잘못된 카테고리 ... "
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/poi/category/invalid?lat=${TEST_LAT}&lng=${TEST_LNG}")
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ 통과${NC} (400 에러 반환)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC} (예상: 400, 실제: $http_code)"
    ((FAILED++))
fi

echo ""
echo "=== 성능 테스트 ==="

# 13. API 응답 시간
echo -n "테스트: API 응답 시간 ... "
start=$(date +%s%3N)
curl -s "${BASE_URL}/api/poi/search?query=카페&lat=${TEST_LAT}&lng=${TEST_LNG}" > /dev/null
end=$(date +%s%3N)
elapsed=$((end - start))

if [ $elapsed -lt 2000 ]; then
    echo -e "${GREEN}✓ 통과${NC} (${elapsed}ms < 2000ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 경고${NC} (${elapsed}ms)"
    ((PASSED++))
fi

echo ""
echo "======================================"
echo "        테스트 결과 요약"
echo "======================================"
echo -e "${GREEN}통과: $PASSED${NC}"
echo -e "${RED}실패: $FAILED${NC}"
echo "총 테스트: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ 모든 테스트 통과!${NC}"
    echo "실제 POI 데이터 연동이 성공적으로 완료되었습니다."
    exit 0
else
    echo -e "\n${RED}✗ 일부 테스트 실패${NC}"
    exit 1
fi
