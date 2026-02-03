/**
 * 인증 및 보안 유틸리티
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 비밀키 (실제 프로덕션에서는 환경변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'myMapBot_super_secret_key_2026_!@#$%';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'myMapBot_refresh_secret_key_2026_!@#$%';
const JWT_EXPIRES_IN = '24h'; // 액세스 토큰: 24시간
const JWT_REFRESH_EXPIRES_IN = '30d'; // 리프레시 토큰: 30일

// ==================== 비밀번호 해싱 ====================

/**
 * 비밀번호 해싱
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * 비밀번호 검증
 */
export const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// ==================== JWT 토큰 ====================

/**
 * 액세스 토큰 생성
 */
export const generateAccessToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        membership: user.membership
    };
    
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'MyMapBot',
        subject: user.id
    });
};

/**
 * 리프레시 토큰 생성
 */
export const generateRefreshToken = (user) => {
    const payload = {
        userId: user.id
    };
    
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'MyMapBot',
        subject: user.id
    });
};

/**
 * 토큰 검증
 */
export const verifyToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('TOKEN_EXPIRED');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('INVALID_TOKEN');
        } else {
            throw new Error('TOKEN_VERIFICATION_FAILED');
        }
    }
};

/**
 * 토큰에서 사용자 ID 추출
 */
export const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded?.userId || null;
    } catch (error) {
        return null;
    }
};

// ==================== 입력 검증 ====================

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * 비밀번호 강도 검증
 * 최소 8자, 대문자/소문자/숫자 포함
 */
export const validatePassword = (password) => {
    if (password.length < 8) {
        return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: '비밀번호는 대문자를 포함해야 합니다.' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: '비밀번호는 소문자를 포함해야 합니다.' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: '비밀번호는 숫자를 포함해야 합니다.' };
    }
    
    return { valid: true, message: '안전한 비밀번호입니다.' };
};

/**
 * 전화번호 형식 검증 (한국)
 */
export const validatePhone = (phone) => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone);
};

/**
 * 이름 검증
 */
export const validateName = (name) => {
    return name && name.length >= 2 && name.length <= 50;
};

// ==================== 데이터 정제 ====================

/**
 * 사용자 정보에서 민감한 데이터 제거
 */
export const sanitizeUser = (user) => {
    if (!user) return null;
    
    const { password, ...sanitized } = user;
    return sanitized;
};

/**
 * XSS 방지를 위한 HTML 이스케이프
 */
export const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

// ==================== Rate Limiting ====================

/**
 * Rate limit 체크용 저장소 (인메모리)
 */
const rateLimitStore = new Map();

/**
 * Rate limit 체크
 * @param {string} key - IP 주소 또는 사용자 ID
 * @param {number} maxRequests - 최대 요청 수
 * @param {number} windowMs - 시간 윈도우 (밀리초)
 */
export const checkRateLimit = (key, maxRequests = 100, windowMs = 60000) => {
    const now = Date.now();
    const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    
    // 시간 윈도우가 지났으면 리셋
    if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + windowMs;
    }
    
    record.count++;
    rateLimitStore.set(key, record);
    
    return {
        allowed: record.count <= maxRequests,
        remaining: Math.max(0, maxRequests - record.count),
        resetAt: new Date(record.resetTime)
    };
};

// ==================== 토큰 블랙리스트 ====================

/**
 * 블랙리스트 토큰 저장소
 */
const tokenBlacklist = new Set();

/**
 * 토큰을 블랙리스트에 추가 (로그아웃 시)
 */
export const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    
    // 24시간 후 자동 제거 (메모리 관리)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 24 * 60 * 60 * 1000);
};

/**
 * 토큰이 블랙리스트에 있는지 확인
 */
export const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

// ==================== CSRF 토큰 ====================

/**
 * CSRF 토큰 생성
 */
export const generateCSRFToken = () => {
    return jwt.sign(
        { type: 'csrf', timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

/**
 * CSRF 토큰 검증
 */
export const verifyCSRFToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.type === 'csrf';
    } catch (error) {
        return false;
    }
};

// ==================== 권한 체크 ====================

/**
 * 멤버십 레벨 체크
 */
export const checkMembership = (user, requiredLevel) => {
    const levels = { free: 0, basic: 1, premium: 2 };
    const userLevel = levels[user.membership] || 0;
    const required = levels[requiredLevel] || 0;
    
    return userLevel >= required;
};

/**
 * 사용자 권한 체크
 */
export const checkPermission = (user, resource, action) => {
    // 기본 권한 체크 로직
    // 실제로는 더 복잡한 RBAC (Role-Based Access Control) 구현 가능
    
    if (!user || !user.isActive) {
        return false;
    }
    
    // 프리미엄 사용자는 모든 권한
    if (user.membership === 'premium') {
        return true;
    }
    
    // 리소스별 권한 체크
    const permissions = {
        free: ['read', 'create'],
        basic: ['read', 'create', 'update'],
        premium: ['read', 'create', 'update', 'delete']
    };
    
    return permissions[user.membership]?.includes(action) || false;
};

export default {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    getUserIdFromToken,
    validateEmail,
    validatePassword,
    validatePhone,
    validateName,
    sanitizeUser,
    escapeHtml,
    checkRateLimit,
    blacklistToken,
    isTokenBlacklisted,
    generateCSRFToken,
    verifyCSRFToken,
    checkMembership,
    checkPermission
};
