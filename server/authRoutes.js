/**
 * 인증 라우터 (회원가입, 로그인, 로그아웃 등)
 */

import express from 'express';
import {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    validateEmail,
    validatePassword,
    validateName,
    sanitizeUser,
    blacklistToken
} from './auth.js';
import {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    createSession,
    deleteSessionsByUserId,
    createNotification
} from './database.js';
import { authenticate, loginRateLimiter } from './middleware.js';

const router = express.Router();

// ==================== 회원가입 ====================

/**
 * POST /api/auth/register
 * 회원가입
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        
        // 입력 검증
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: '이메일, 비밀번호, 이름은 필수입니다.'
            });
        }
        
        // 이메일 형식 검증
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: '올바른 이메일 형식이 아닙니다.'
            });
        }
        
        // 비밀번호 강도 검증
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }
        
        // 이름 검증
        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                message: '이름은 2-50자 사이여야 합니다.'
            });
        }
        
        // 이메일 중복 체크
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: '이미 사용 중인 이메일입니다.'
            });
        }
        
        // 비밀번호 해싱
        const hashedPassword = await hashPassword(password);
        
        // 사용자 생성
        const user = createUser({
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
            membership: 'free'
        });
        
        // 환영 알림 생성
        createNotification({
            userId: user.id,
            type: 'system',
            title: '마이맵봇에 오신 것을 환영합니다! 🎉',
            message: `${name}님, 마이맵봇과 함께 편리한 여행을 시작하세요!`
        });
        
        // 토큰 생성
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // 세션 저장
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        createSession({
            userId: user.id,
            token: accessToken,
            refreshToken,
            expiresAt,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                user: sanitizeUser(user),
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원가입 처리 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 로그인 ====================

/**
 * POST /api/auth/login
 * 로그인
 */
router.post('/login', loginRateLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 입력 검증
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '이메일과 비밀번호를 입력해주세요.'
            });
        }
        
        // 사용자 찾기
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }
        
        // 계정 활성화 확인
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: '비활성화된 계정입니다. 고객센터에 문의해주세요.'
            });
        }
        
        // 비밀번호 검증
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }
        
        // 마지막 로그인 시간 업데이트
        updateUser(user.id, { lastLoginAt: new Date() });
        
        // 토큰 생성
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // 세션 저장
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        createSession({
            userId: user.id,
            token: accessToken,
            refreshToken,
            expiresAt,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.json({
            success: true,
            message: '로그인되었습니다.',
            data: {
                user: sanitizeUser(user),
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 로그아웃 ====================

/**
 * POST /api/auth/logout
 * 로그아웃
 */
router.post('/logout', authenticate, (req, res) => {
    try {
        // 토큰 블랙리스트에 추가
        blacklistToken(req.token);
        
        // 사용자의 모든 세션 삭제
        deleteSessionsByUserId(req.user.id);
        
        res.json({
            success: true,
            message: '로그아웃되었습니다.'
        });
    } catch (error) {
        console.error('로그아웃 오류:', error);
        res.status(500).json({
            success: false,
            message: '로그아웃 처리 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 내 정보 조회 ====================

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보
 */
router.get('/me', authenticate, (req, res) => {
    try {
        const user = findUserById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: sanitizeUser(user)
        });
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 정보 조회 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 프로필 수정 ====================

/**
 * PATCH /api/auth/profile
 * 프로필 수정
 */
router.patch('/profile', authenticate, async (req, res) => {
    try {
        const { name, phone, profileImage } = req.body;
        const updates = {};
        
        // 수정할 필드만 업데이트
        if (name !== undefined) {
            if (!validateName(name)) {
                return res.status(400).json({
                    success: false,
                    message: '이름은 2-50자 사이여야 합니다.'
                });
            }
            updates.name = name;
        }
        
        if (phone !== undefined) {
            updates.phone = phone;
        }
        
        if (profileImage !== undefined) {
            updates.profileImage = profileImage;
        }
        
        // 업데이트할 내용이 없으면
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: '수정할 정보를 입력해주세요.'
            });
        }
        
        // 사용자 정보 업데이트
        const updatedUser = updateUser(req.user.id, updates);
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            message: '프로필이 수정되었습니다.',
            data: sanitizeUser(updatedUser)
        });
    } catch (error) {
        console.error('프로필 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '프로필 수정 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 비밀번호 변경 ====================

/**
 * PUT /api/auth/password
 * 비밀번호 변경
 */
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // 입력 검증
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '현재 비밀번호와 새 비밀번호를 입력해주세요.'
            });
        }
        
        // 사용자 찾기
        const user = findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        
        // 현재 비밀번호 확인
        const isPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '현재 비밀번호가 올바르지 않습니다.'
            });
        }
        
        // 새 비밀번호 검증
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }
        
        // 새 비밀번호 해싱
        const hashedPassword = await hashPassword(newPassword);
        
        // 비밀번호 업데이트
        updateUser(user.id, { password: hashedPassword });
        
        // 모든 세션 삭제 (다시 로그인 필요)
        deleteSessionsByUserId(user.id);
        blacklistToken(req.token);
        
        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.'
        });
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '비밀번호 변경 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 이메일 인증 (향후 구현) ====================

/**
 * POST /api/auth/send-verification-email
 * 이메일 인증 메일 발송
 */
router.post('/send-verification-email', authenticate, (req, res) => {
    // TODO: 이메일 발송 로직 구현
    res.json({
        success: true,
        message: '인증 메일이 발송되었습니다. (미구현)'
    });
});

/**
 * GET /api/auth/verify-email/:token
 * 이메일 인증 확인
 */
router.get('/verify-email/:token', (req, res) => {
    // TODO: 이메일 인증 로직 구현
    res.json({
        success: true,
        message: '이메일이 인증되었습니다. (미구현)'
    });
});

export default router;
