#!/bin/bash

# 마이맵봇 인증 시스템 테스트

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# 테스트 함수
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${YELLOW}[테스트] $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        PASS_COUNT=$((PASS_COUNT + 1))
        
        # 응답에서 토큰 추출 (로그인 시)
        if echo "$body" | jq -e '.data.accessToken' > /dev/null 2>&1; then
            export ACCESS_TOKEN=$(echo "$body" | jq -r '.data.accessToken')
            echo -e "${GREEN}토큰 저장됨${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  마이맵봇 인증 시스템 테스트${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 헬스 체크
test_api "헬스 체크" "GET" "/api/health" "" "200"

# 2. 회원가입 - 성공
test_api "회원가입 (성공)" "POST" "/api/auth/register" '{
  "email": "test@example.com",
  "password": "Test1234!",
  "name": "홍길동",
  "phone": "010-1234-5678"
}' "201"

# 3. 회원가입 - 중복 이메일
test_api "회원가입 (중복 이메일)" "POST" "/api/auth/register" '{
  "email": "test@example.com",
  "password": "Test1234!",
  "name": "김철수"
}' "409"

# 4. 회원가입 - 약한 비밀번호
test_api "회원가입 (약한 비밀번호)" "POST" "/api/auth/register" '{
  "email": "weak@example.com",
  "password": "1234",
  "name": "김철수"
}' "400"

# 5. 로그인 - 성공
test_api "로그인 (성공)" "POST" "/api/auth/login" '{
  "email": "test@example.com",
  "password": "Test1234!"
}' "200"

# 6. 로그인 - 실패 (잘못된 비밀번호)
test_api "로그인 (잘못된 비밀번호)" "POST" "/api/auth/login" '{
  "email": "test@example.com",
  "password": "WrongPassword123!"
}' "401"

# 7. 내 정보 조회 (인증 필요)
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "\n${YELLOW}[테스트] 내 정보 조회 (인증)${NC}"
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$BASE_URL/api/auth/me")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        echo "$body" | jq .
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: 200, Got: $status_code)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
fi

# 8. 내 정보 조회 (인증 없음)
test_api "내 정보 조회 (인증 없음)" "GET" "/api/auth/me" "" "401"

# 9. 프로필 수정 (인증 필요)
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "\n${YELLOW}[테스트] 프로필 수정 (인증)${NC}"
    response=$(curl -s -w "\n%{http_code}" -X PATCH \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name": "홍길동 수정", "phone": "010-9999-8888"}' \
        "$BASE_URL/api/auth/profile")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        echo "$body" | jq .
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: 200, Got: $status_code)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
fi

# 10. 로그아웃
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "\n${YELLOW}[테스트] 로그아웃${NC}"
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$BASE_URL/api/auth/logout")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        echo "$body" | jq .
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: 200, Got: $status_code)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
fi

# 결과 출력
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}  테스트 결과${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "총 테스트: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}통과: $PASS_COUNT${NC}"
echo -e "${RED}실패: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n${GREEN}✓ 모든 테스트 통과!${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ 일부 테스트 실패${NC}\n"
    exit 1
fi
