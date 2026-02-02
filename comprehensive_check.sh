#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           모빌리티 플랫폼 - 종합 점검 리포트              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}점검 시각: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# 1. 서버 상태
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[1] 서버 상태${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Vite 서버
VITE_PID=$(pgrep -f "vite" | head -1)
if [ ! -z "$VITE_PID" ]; then
    VITE_MEM=$(ps -o rss= -p $VITE_PID | awk '{print int($1/1024)}')
    echo -e "  ${GREEN}✅${NC} Vite 개발 서버"
    echo -e "     - PID: $VITE_PID"
    echo -e "     - 메모리: ${VITE_MEM}MB"
    echo -e "     - 포트: 5173"
else
    echo -e "  ${RED}❌${NC} Vite 개발 서버 미실행"
fi

# Express 서버
EXPRESS_PID=$(lsof -ti:3000 | head -1)
if [ ! -z "$EXPRESS_PID" ]; then
    EXPRESS_MEM=$(ps -o rss= -p $EXPRESS_PID | awk '{print int($1/1024)}')
    echo -e "  ${GREEN}✅${NC} Express API 서버"
    echo -e "     - PID: $EXPRESS_PID"
    echo -e "     - 메모리: ${EXPRESS_MEM}MB"
    echo -e "     - 포트: 3000"
else
    echo -e "  ${RED}❌${NC} Express API 서버 미실행"
fi

echo ""

# 2. API 헬스 체크
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[2] API 헬스 체크${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HEALTH=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH" | grep -q "success.*true"; then
    echo -e "  ${GREEN}✅${NC} API 서버 정상"
    TIMESTAMP=$(echo "$HEALTH" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)
    echo -e "     - 응답 시간: $TIMESTAMP"
else
    echo -e "  ${RED}❌${NC} API 서버 응답 없음"
fi

echo ""

# 3. 데이터 상태
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[3] 데이터 상태${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

STATS=$(curl -s http://localhost:3000/api/stats)

PARKING_COUNT=$(echo "$STATS" | grep -o '"totalParkingLots":[0-9]*' | cut -d':' -f2)
AVAILABLE_SPOTS=$(echo "$STATS" | grep -o '"availableSpots":[0-9]*' | cut -d':' -f2)
TOTAL_SPOTS=$(echo "$STATS" | grep -o '"totalSpots":[0-9]*' | cut -d':' -f2)
COMPLAINTS=$(echo "$STATS" | grep -o '"totalComplaints":[0-9]*' | cut -d':' -f2)
BOOKINGS=$(echo "$STATS" | grep -o '"totalBookings":[0-9]*' | cut -d':' -f2)

echo -e "  📊 주차장 현황"
echo -e "     - 등록된 주차장: ${PARKING_COUNT}개"
echo -e "     - 이용 가능: ${AVAILABLE_SPOTS}/${TOTAL_SPOTS}석"
echo -e "     - 점유율: $(echo "scale=1; 100-($AVAILABLE_SPOTS*100/$TOTAL_SPOTS)" | bc)%"

echo -e "  📝 민원 현황"
echo -e "     - 총 민원: ${COMPLAINTS}건"

echo -e "  📅 예약 현황"
echo -e "     - 총 예약: ${BOOKINGS}건"

echo ""

# 4. API 응답 시간 측정
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[4] API 성능 테스트${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

measure_api() {
    local endpoint=$1
    local name=$2
    
    local start=$(date +%s%N)
    local response=$(curl -s http://localhost:3000$endpoint)
    local end=$(date +%s%N)
    
    local duration=$(( (end - start) / 1000000 ))
    
    if [ $duration -lt 100 ]; then
        local color="${GREEN}"
        local status="우수"
    elif [ $duration -lt 500 ]; then
        local color="${BLUE}"
        local status="양호"
    else
        local color="${YELLOW}"
        local status="개선필요"
    fi
    
    echo -e "  ${color}⚡${NC} $name: ${duration}ms ($status)"
}

measure_api "/api/parking" "주차장 목록 조회"
measure_api "/api/stats" "통계 조회"
measure_api "/api/health" "헬스 체크"
measure_api "/api/nearby/gas" "주변 시설 검색"

echo ""

# 5. 엔드포인트 가용성
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[5] 엔드포인트 가용성${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_endpoint() {
    local method=$1
    local endpoint=$2
    local name=$3
    
    if [ "$method" = "GET" ]; then
        local code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$endpoint)
    else
        local code=$(curl -s -o /dev/null -w "%{http_code}" -X $method http://localhost:3000$endpoint)
    fi
    
    if [ "$code" = "200" ] || [ "$code" = "400" ]; then
        echo -e "  ${GREEN}✅${NC} $name (HTTP $code)"
    else
        echo -e "  ${RED}❌${NC} $name (HTTP $code)"
    fi
}

check_endpoint "GET" "/api/parking" "주차장 목록"
check_endpoint "GET" "/api/parking/1" "주차장 상세"
check_endpoint "GET" "/api/parking/search" "주차장 검색"
check_endpoint "GET" "/api/complaints" "민원 목록"
check_endpoint "GET" "/api/bookings" "예약 목록"
check_endpoint "GET" "/api/stats" "통계"
check_endpoint "GET" "/api/nearby/gas" "주변 주유소"
check_endpoint "GET" "/api/nearby/hospital" "주변 병원"
check_endpoint "GET" "/api/nearby/restaurant" "주변 음식점"
check_endpoint "GET" "/api/nearby/cafe" "주변 카페"
check_endpoint "GET" "/api/nearby/store" "주변 편의점"

echo ""

# 6. 파일 무결성
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[6] 파일 무결성${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_file_size() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        local size=$(wc -c < "$file")
        local lines=$(wc -l < "$file")
        echo -e "  ${GREEN}✅${NC} $name"
        echo -e "     - 크기: $size bytes"
        echo -e "     - 라인: $lines"
    else
        echo -e "  ${RED}❌${NC} $name (파일 없음)"
    fi
}

check_file_size "index.html" "index.html"
check_file_size "style.css" "style.css"
check_file_size "main.js" "main.js"
check_file_size "server/index.js" "server/index.js"
check_file_size "package.json" "package.json"

echo ""

# 7. 보안 점검
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[7] 보안 점검${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# CORS 체크
CORS_RESPONSE=$(curl -s -H "Origin: http://example.com" -I http://localhost:3000/api/health | grep -i "access-control")
if [ ! -z "$CORS_RESPONSE" ]; then
    echo -e "  ${GREEN}✅${NC} CORS 설정 활성화"
else
    echo -e "  ${YELLOW}⚠️${NC}  CORS 헤더 미확인"
fi

# 에러 처리
ERROR_RESPONSE=$(curl -s -X POST http://localhost:3000/api/complaints -H "Content-Type: application/json" -d '{}')
if echo "$ERROR_RESPONSE" | grep -q "필수 정보"; then
    echo -e "  ${GREEN}✅${NC} 입력 유효성 검사 작동"
else
    echo -e "  ${YELLOW}⚠️${NC}  입력 유효성 검사 확인 필요"
fi

# 404 처리
NOT_FOUND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/nonexistent)
if [ "$NOT_FOUND" = "404" ]; then
    echo -e "  ${GREEN}✅${NC} 404 에러 처리 정상"
else
    echo -e "  ${YELLOW}⚠️${NC}  404 처리 확인 필요"
fi

echo ""

# 8. 메모리 사용량
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[8] 시스템 리소스${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL_MEM=0
if [ ! -z "$VITE_PID" ]; then
    VITE_MEM=$(ps -o rss= -p $VITE_PID | awk '{print int($1/1024)}')
    TOTAL_MEM=$((TOTAL_MEM + VITE_MEM))
fi

if [ ! -z "$EXPRESS_PID" ]; then
    EXPRESS_MEM=$(ps -o rss= -p $EXPRESS_PID | awk '{print int($1/1024)}')
    TOTAL_MEM=$((TOTAL_MEM + EXPRESS_MEM))
fi

echo -e "  📊 총 메모리 사용량: ${TOTAL_MEM}MB"

if [ $TOTAL_MEM -lt 200 ]; then
    echo -e "  ${GREEN}✅${NC} 메모리 사용량 정상"
elif [ $TOTAL_MEM -lt 500 ]; then
    echo -e "  ${BLUE}ℹ️${NC}  메모리 사용량 보통"
else
    echo -e "  ${YELLOW}⚠️${NC}  메모리 사용량 높음"
fi

echo ""

# 9. 접속 URL
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[9] 접속 정보${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "  🌐 프론트엔드:"
echo -e "     https://5173-illhsa38wy27xi3njh23r-2e77fc33.sandbox.novita.ai"

echo -e "  🔧 백엔드 API:"
echo -e "     https://3000-illhsa38wy27xi3njh23r-2e77fc33.sandbox.novita.ai"

echo ""

# 최종 요약
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                      종합 평가                               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 점수 계산
SCORE=100

# 서버 상태
if [ -z "$VITE_PID" ]; then SCORE=$((SCORE - 15)); fi
if [ -z "$EXPRESS_PID" ]; then SCORE=$((SCORE - 15)); fi

# API 상태
if ! echo "$HEALTH" | grep -q "success.*true"; then SCORE=$((SCORE - 20)); fi

# 데이터 상태
if [ -z "$PARKING_COUNT" ] || [ "$PARKING_COUNT" -eq 0 ]; then SCORE=$((SCORE - 10)); fi

echo -e "  ${GREEN}종합 점수: ${SCORE}/100${NC}"

if [ $SCORE -ge 90 ]; then
    echo -e "  ${GREEN}⭐⭐⭐⭐⭐ 우수${NC}"
    echo -e "  모든 시스템이 정상적으로 작동하고 있습니다."
elif [ $SCORE -ge 70 ]; then
    echo -e "  ${BLUE}⭐⭐⭐⭐ 양호${NC}"
    echo -e "  대부분의 시스템이 정상이나 일부 개선이 필요합니다."
else
    echo -e "  ${YELLOW}⭐⭐⭐ 보통${NC}"
    echo -e "  여러 영역에서 개선이 필요합니다."
fi

echo ""
echo -e "${BLUE}점검 완료: $(date '+%Y-%m-%d %H:%M:%S')${NC}"

