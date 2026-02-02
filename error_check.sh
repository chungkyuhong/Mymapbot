#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              상세 오류 점검 및 진단 시작                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERROR_COUNT=0
WARNING_COUNT=0

# 1. 서버 상태 점검
echo -e "${BLUE}[1] 서버 프로세스 상태 점검${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vite 서버 점검
if pgrep -f "vite" > /dev/null; then
    echo -e "${GREEN}✅ Vite 개발 서버 실행 중${NC}"
else
    echo -e "${RED}❌ Vite 개발 서버 미실행${NC}"
    ((ERROR_COUNT++))
fi

# Express 서버 점검
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Express API 서버 실행 중 (포트 3000)${NC}"
else
    echo -e "${RED}❌ Express API 서버 미실행${NC}"
    ((ERROR_COUNT++))
fi

echo ""

# 2. API 엔드포인트 상세 점검
echo -e "${BLUE}[2] API 엔드포인트 상세 점검${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_api() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected=$4
    
    echo -n "  $method $endpoint ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" http://localhost:3000$endpoint 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            http://localhost:3000$endpoint 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected" ]; then
        echo -e "${GREEN}✅ $http_code${NC}"
        return 0
    else
        echo -e "${RED}❌ $http_code (예상: $expected)${NC}"
        echo "     응답: $body"
        ((ERROR_COUNT++))
        return 1
    fi
}

# 헬스 체크
check_api "/api/health" "GET" "" "200"

# 주차장 API
check_api "/api/parking" "GET" "" "200"
check_api "/api/parking/1" "GET" "" "200"
check_api "/api/parking/999" "GET" "" "404"
check_api "/api/parking/search?available=true" "GET" "" "200"

# 경로 API
check_api "/api/route" "POST" '{"start":"서울역","end":"강남역","mode":"car"}' "200"

# 민원 API
check_api "/api/complaints" "POST" '{"type":"parking","location":"테스트","description":"테스트"}' "200"
check_api "/api/complaints" "GET" "" "200"

# 주변 시설 API
check_api "/api/nearby/gas" "GET" "" "200"
check_api "/api/nearby/hospital" "GET" "" "200"

# 예약 API
check_api "/api/bookings" "POST" '{"type":"parking","facilityId":"1","date":"2026-02-05","time":"10:00"}' "200"
check_api "/api/bookings" "GET" "" "200"

# 통계 API
check_api "/api/stats" "GET" "" "200"

echo ""

# 3. 파일 구조 점검
echo -e "${BLUE}[3] 파일 구조 및 의존성 점검${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
    else
        echo -e "  ${RED}❌${NC} $file (누락)"
        ((ERROR_COUNT++))
    fi
}

check_file "index.html"
check_file "style.css"
check_file "main.js"
check_file "server/index.js"
check_file "package.json"
check_file "vite.config.js"
check_file "README.md"

echo ""

# 4. JavaScript 구문 검사
echo -e "${BLUE}[4] JavaScript 구문 검사${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_js() {
    local file=$1
    echo -n "  $file ... "
    
    if node -c "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ 구문 오류 없음${NC}"
    else
        echo -e "${RED}❌ 구문 오류 발견${NC}"
        node -c "$file" 2>&1 | sed 's/^/    /'
        ((ERROR_COUNT++))
    fi
}

check_js "main.js"
check_js "server/index.js"

echo ""

# 5. HTML 유효성 검사
echo -e "${BLUE}[5] HTML 구조 검사${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  index.html ... "
if grep -q "<!DOCTYPE html>" index.html && \
   grep -q "<html" index.html && \
   grep -q "<head>" index.html && \
   grep -q "<body>" index.html; then
    echo -e "${GREEN}✅ 기본 구조 정상${NC}"
else
    echo -e "${RED}❌ HTML 구조 오류${NC}"
    ((ERROR_COUNT++))
fi

echo ""

# 6. CSS 검사
echo -e "${BLUE}[6] CSS 파일 검사${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  style.css ... "
if [ -s "style.css" ]; then
    echo -e "${GREEN}✅ 파일 존재 및 비어있지 않음${NC}"
else
    echo -e "${RED}❌ 파일 없음 또는 비어있음${NC}"
    ((ERROR_COUNT++))
fi

echo ""

# 7. 네트워크 연결 테스트
echo -e "${BLUE}[7] 프론트엔드 접근성 테스트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  Vite 개발 서버 (5173) ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    echo -e "${GREEN}✅ 접근 가능${NC}"
else
    echo -e "${YELLOW}⚠️  접근 불가 (서버 확인 필요)${NC}"
    ((WARNING_COUNT++))
fi

echo ""

# 8. 콘솔 에러 시뮬레이션
echo -e "${BLUE}[8] 에러 처리 검증${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 잘못된 요청 테스트
echo -n "  잘못된 데이터 처리 ... "
response=$(curl -s -X POST http://localhost:3000/api/complaints \
    -H "Content-Type: application/json" \
    -d '{"type":"parking"}')

if echo "$response" | grep -q "필수 정보"; then
    echo -e "${GREEN}✅ 에러 메시지 정상${NC}"
else
    echo -e "${RED}❌ 에러 처리 미흡${NC}"
    ((ERROR_COUNT++))
fi

# 존재하지 않는 리소스
echo -n "  404 에러 처리 ... "
http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/nonexistent)
if [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✅ 404 정상 처리${NC}"
else
    echo -e "${RED}❌ 404 처리 오류 (코드: $http_code)${NC}"
    ((ERROR_COUNT++))
fi

echo ""

# 9. 데이터 무결성 검사
echo -e "${BLUE}[9] 데이터 무결성 검사${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  주차장 데이터 ... "
parking_data=$(curl -s http://localhost:3000/api/parking)
if echo "$parking_data" | grep -q "id" && \
   echo "$parking_data" | grep -q "name" && \
   echo "$parking_data" | grep -q "availableSpots"; then
    echo -e "${GREEN}✅ 필수 필드 존재${NC}"
else
    echo -e "${RED}❌ 데이터 구조 오류${NC}"
    ((ERROR_COUNT++))
fi

echo -n "  통계 데이터 ... "
stats_data=$(curl -s http://localhost:3000/api/stats)
if echo "$stats_data" | grep -q "totalParkingLots" && \
   echo "$stats_data" | grep -q "availableSpots"; then
    echo -e "${GREEN}✅ 통계 데이터 정상${NC}"
else
    echo -e "${RED}❌ 통계 데이터 오류${NC}"
    ((ERROR_COUNT++))
fi

echo ""

# 10. 성능 측정
echo -e "${BLUE}[10] 성능 측정${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

measure_response_time() {
    local endpoint=$1
    local start=$(date +%s%N)
    curl -s http://localhost:3000$endpoint > /dev/null
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 ))
    echo $duration
}

echo -n "  /api/parking 응답 시간 ... "
time1=$(measure_response_time "/api/parking")
if [ $time1 -lt 500 ]; then
    echo -e "${GREEN}✅ ${time1}ms${NC}"
else
    echo -e "${YELLOW}⚠️  ${time1}ms (느림)${NC}"
    ((WARNING_COUNT++))
fi

echo -n "  /api/stats 응답 시간 ... "
time2=$(measure_response_time "/api/stats")
if [ $time2 -lt 500 ]; then
    echo -e "${GREEN}✅ ${time2}ms${NC}"
else
    echo -e "${YELLOW}⚠️  ${time2}ms (느림)${NC}"
    ((WARNING_COUNT++))
fi

echo ""

# 최종 결과
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    점검 결과 요약                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "발견된 오류: ${RED}${ERROR_COUNT}개${NC}"
echo -e "발견된 경고: ${YELLOW}${WARNING_COUNT}개${NC}"
echo ""

if [ $ERROR_COUNT -eq 0 ] && [ $WARNING_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 점검을 통과했습니다! 시스템이 정상입니다.${NC}"
    exit 0
elif [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  경고가 있지만 시스템은 작동 가능합니다.${NC}"
    exit 0
else
    echo -e "${RED}❌ 오류가 발견되었습니다. 수정이 필요합니다.${NC}"
    exit 1
fi
