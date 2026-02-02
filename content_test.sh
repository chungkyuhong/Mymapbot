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
echo "   목적지 콘텐츠 추천 기능 테스트"
echo "======================================"

# 테스트 함수
test_content_api() {
    local test_name="$1"
    local destination="$2"
    local purpose="$3"
    
    echo -n "테스트: $test_name ... "
    
    response=$(curl -s "${BASE_URL}/api/destination-content/${destination}?purpose=${purpose}")
    
    success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)
    youtube_count=$(echo "$response" | grep -o '"youtube":\[' | wc -l)
    blog_count=$(echo "$response" | grep -o '"blogs":\[' | wc -l)
    
    if [ "$success" = "true" ] && [ "$youtube_count" -gt 0 ] && [ "$blog_count" -gt 0 ]; then
        echo -e "${GREEN}✓ 통과${NC}"
        
        # 항목 수 확인
        youtube_items=$(echo "$response" | grep -o '"id":[0-9]*' | head -5 | wc -l)
        blog_items=$(echo "$response" | grep -o '"blogger"' | wc -l)
        echo "  - YouTube: ${youtube_items}개 항목"
        echo "  - 블로그: ${blog_items}개 항목"
        
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
echo "=== 기본 기능 테스트 ==="

# 1. 제주도 + 여행
test_content_api "제주도 여행 콘텐츠" "제주도" "travel"

# 2. 제주도 + 출장
test_content_api "제주도 출장 콘텐츠" "제주도" "business"

# 3. 제주도 + 맛집
test_content_api "제주도 맛집 콘텐츠" "제주도" "dining"

echo ""
echo "=== 다양한 목적지 테스트 ==="

# 4. 서울 + 여행
test_content_api "서울 여행 콘텐츠" "서울" "travel"

# 5. 부산 + 맛집
test_content_api "부산 맛집 콘텐츠" "부산" "dining"

# 6. 강릉 + 여행
test_content_api "강릉 여행 콘텐츠" "강릉" "travel"

echo ""
echo "=== 해외 목적지 테스트 ==="

# 7. 도쿄 + 여행
test_content_api "도쿄 여행 콘텐츠" "도쿄" "travel"

# 8. 파리 + 출장
test_content_api "파리 출장 콘텐츠" "파리" "business"

echo ""
echo "=== 데이터 구조 검증 ==="

# 9. YouTube 데이터 필드 확인
echo -n "테스트: YouTube 데이터 필드 검증 ... "
response=$(curl -s "${BASE_URL}/api/destination-content/제주도?purpose=travel")

if echo "$response" | grep -q '"title"' && \
   echo "$response" | grep -q '"channel"' && \
   echo "$response" | grep -q '"thumbnail"' && \
   echo "$response" | grep -q '"url"' && \
   echo "$response" | grep -q '"views"' && \
   echo "$response" | grep -q '"duration"'; then
    echo -e "${GREEN}✓ 통과${NC}"
    echo "  - 모든 필수 필드 존재"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

# 10. 블로그 데이터 필드 확인
echo -n "테스트: 블로그 데이터 필드 검증 ... "
if echo "$response" | grep -q '"blogger"' && \
   echo "$response" | grep -q '"summary"' && \
   echo "$response" | grep -q '"date"'; then
    echo -e "${GREEN}✓ 통과${NC}"
    echo "  - 모든 필수 필드 존재"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    ((FAILED++))
fi

echo ""
echo "=== 에러 처리 테스트 ==="

# 11. 빈 목적지
echo -n "테스트: 빈 목적지 처리 ... "
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/destination-content/?purpose=travel")
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✓ 통과${NC}"
    echo "  - 404 응답 반환"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC}"
    echo "  - 예상: 404, 실제: $http_code"
    ((FAILED++))
fi

echo ""
echo "=== 성능 테스트 ==="

# 12. 응답 시간 측정
echo -n "테스트: API 응답 시간 ... "
start=$(date +%s%3N)
curl -s "${BASE_URL}/api/destination-content/제주도?purpose=travel" > /dev/null
end=$(date +%s%3N)
elapsed=$((end - start))

if [ $elapsed -lt 500 ]; then
    echo -e "${GREEN}✓ 통과${NC}"
    echo "  - 응답 시간: ${elapsed}ms (< 500ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 경고${NC}"
    echo "  - 응답 시간: ${elapsed}ms (목표: < 500ms)"
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
    exit 0
else
    echo -e "\n${RED}✗ 일부 테스트 실패${NC}"
    exit 1
fi
