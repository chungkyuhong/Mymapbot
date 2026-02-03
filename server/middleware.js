/**
 * 인증 미들웨어
 */

import {
    verifyToken,
    isTokenBlacklisted,
    checkRateLimit,
    sanitizeUser
} from './auth.js';
import { findUserById } from './database.js';

// ==================== 인증 미들웨어 ====================

/**
 * JWT 토큰 검증 미들웨어
 */
export const authenticate = async (req, res, next) => {
    try {
        // Authorization 헤더에서 토큰 추출
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.'
            });
        }
        
        const token = authHeader.substring(7); // 'Bearer ' 제거
        
        // 블랙리스트 체크
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다. 다시 로그인해주세요.'
            });
        }
        
        // 토큰 검증
        const decoded = verifyToken(token);
        
        // 사용자 정보 조회
        const user = findUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: '비활성화된 계정입니다.'
            });
        }
        
        // req 객체에 사용자 정보 추가 (비밀번호 제외)
        req.user = sanitizeUser(user);
        req.token = token;
        
        next();
    } catch (error) {
        if (error.message === 'TOKEN_EXPIRED') {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다. 다시 로그인해주세요.',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error.message === 'INVALID_TOKEN') {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.',
                code: 'INVALID_TOKEN'
            });
        } else {
            console.error('인증 오류:', error);
            return res.status(500).json({
                success: false,
                message: '인증 처리 중 오류가 발생했습니다.'
            });
        }
    }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // 토큰이 없으면 그냥 통과
            return next();
        }
        
        const token = authHeader.substring(7);
        
        if (isTokenBlacklisted(token)) {
            return next();
        }
        
        const decoded = verifyToken(token);
        const user = findUserById(decoded.userId);
        
        if (user && user.isActive) {
            req.user = sanitizeUser(user);
            req.token = token;
        }
        
        next();
    } catch (error) {
        // 에러가 발생해도 통과 (선택적이므로)
        next();
    }
};

// ==================== Rate Limiting 미들웨어 ====================

/**
 * Rate limiting 미들웨어
 */
export const rateLimiter = (maxRequests = 100, windowMs = 60000, message = null) => {
    return (req, res, next) => {
        const key = req.user?.id || req.ip || 'unknown';
        const result = checkRateLimit(key, maxRequests, windowMs);
        
        // Rate limit 헤더 추가
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
        
        if (!result.allowed) {
            return res.status(429).json({
                success: false,
                message: message || '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                retryAfter: result.resetAt
            });
        }
        
        next();
    };
};

/**
 * 로그인 시도 제한 (더 엄격)
 */
export const loginRateLimiter = rateLimiter(5, 15 * 60 * 1000, '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.');

/**
 * API 요청 제한 (일반)
 */
export const apiRateLimiter = rateLimiter(100, 60 * 1000, 'API 요청 한도를 초과했습니다. 1분 후 다시 시도해주세요.');

// ==================== 권한 체크 미들웨어 ====================

/**
 * 멤버십 레벨 체크 미들웨어
 */
export const requireMembership = (requiredLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.'
            });
        }
        
        const levels = { free: 0, basic: 1, premium: 2 };
        const userLevel = levels[req.user.membership] || 0;
        const required = levels[requiredLevel] || 0;
        
        if (userLevel < required) {
            return res.status(403).json({
                success: false,
                message: `이 기능은 ${requiredLevel} 멤버십 이상만 사용할 수 있습니다.`,
                requiredMembership: requiredLevel,
                currentMembership: req.user.membership
            });
        }
        
        next();
    };
};

/**
 * 이메일 인증 필수 미들웨어
 */
export const requireEmailVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '로그인이 필요합니다.'
        });
    }
    
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: '이메일 인증이 필요합니다.',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }
    
    next();
};

// ==================== CORS 미들웨어 ====================

/**
 * CORS 설정
 */
export const corsOptions = {
    origin: (origin, callback) => {
        // 허용할 도메인 목록
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            /^https:\/\/.*\.sandbox\.novita\.ai$/,
            /^https:\/\/.*\.vercel\.app$/,
            /^https:\/\/.*\.netlify\.app$/
        ];
        
        // origin이 없는 경우 (모바일 앱, Postman 등) 허용
        if (!origin) {
            return callback(null, true);
        }
        
        // 허용된 origin인지 확인
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Origin not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

// ==================== 에러 핸들러 미들웨어 ====================

/**
 * 404 핸들러
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: '요청하신 리소스를 찾을 수 없습니다.',
        path: req.path,
        method: req.method
    });
};

/**
 * 전역 에러 핸들러
 */
export const errorHandler = (err, req, res, next) => {
    console.error('서버 에러:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: '입력 데이터가 유효하지 않습니다.',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.'
        });
    }
    
    // Token expired error
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: '토큰이 만료되었습니다.',
            code: 'TOKEN_EXPIRED'
        });
    }
    
    // CORS error
    if (err.message === 'CORS policy: Origin not allowed') {
        return res.status(403).json({
            success: false,
            message: 'CORS 정책에 의해 차단되었습니다.'
        });
    }
    
    // 기본 에러 응답
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '서버 오류가 발생했습니다.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// ==================== 로깅 미들웨어 ====================

/**
 * 요청 로깅
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            userId: req.user?.id || 'anonymous',
            timestamp: new Date().toISOString()
        };
        
        console.log(JSON.stringify(log));
    });
    
    next();
};

export default {
    authenticate,
    optionalAuthenticate,
    rateLimiter,
    loginRateLimiter,
    apiRateLimiter,
    requireMembership,
    requireEmailVerified,
    corsOptions,
    notFoundHandler,
    errorHandler,
    requestLogger
};
