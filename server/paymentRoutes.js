/**
 * 결제 라우터
 * PortOne (구 아임포트) 및 Toss Payments 통합
 */

import express from 'express';
import axios from 'axios';
import { authenticate, requireMembership } from './middleware.js';
import {
    createPayment,
    findPaymentById,
    findPaymentsByUserId,
    updatePayment,
    createBooking,
    findBookingById,
    updateBooking,
    findUserById,
    updateUser,
    createNotification
} from './database.js';

const router = express.Router();

// 결제 설정 (환경변수로 관리)
const PORTONE_IMP_KEY = process.env.PORTONE_IMP_KEY || 'imp_test_key';
const PORTONE_IMP_SECRET = process.env.PORTONE_IMP_SECRET || 'imp_test_secret';
const TOSS_CLIENT_KEY = process.env.TOSS_CLIENT_KEY || 'test_ck_xxxxx';
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_xxxxx';

// ==================== 결제 준비 ====================

/**
 * POST /api/payments/prepare
 * 결제 준비 (예약 정보 저장 및 결제 ID 발급)
 */
router.post('/prepare', authenticate, async (req, res) => {
    try {
        const {
            type,           // 'parking' | 'restaurant' | 'hotel' | 'membership'
            itemId,
            itemName,
            date,
            time,
            duration,
            guests,
            amount,
            currency = 'KRW',
            provider = 'portone'  // 'portone' | 'toss' | 'kakao'
        } = req.body;
        
        // 입력 검증
        if (!type || !itemName || !amount) {
            return res.status(400).json({
                success: false,
                message: '필수 정보를 입력해주세요.'
            });
        }
        
        // 금액 검증
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '결제 금액이 올바르지 않습니다.'
            });
        }
        
        // 예약 생성 (멤버십은 제외)
        let booking = null;
        if (type !== 'membership') {
            booking = createBooking({
                userId: req.user.id,
                type,
                itemId,
                itemName,
                date,
                time,
                duration,
                guests,
                totalPrice: amount
            });
        }
        
        // 결제 정보 생성
        const payment = createPayment({
            userId: req.user.id,
            bookingId: booking?.id || null,
            amount,
            currency,
            method: null, // 결제 수단은 결제 완료 시 업데이트
            provider
        });
        
        res.json({
            success: true,
            message: '결제가 준비되었습니다.',
            data: {
                paymentId: payment.id,
                bookingId: booking?.id,
                amount,
                currency,
                provider
            }
        });
    } catch (error) {
        console.error('결제 준비 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 준비 중 오류가 발생했습니다.'
        });
    }
});

// ==================== PortOne (아임포트) 결제 ====================

/**
 * POST /api/payments/portone/verify
 * PortOne 결제 검증
 */
router.post('/portone/verify', authenticate, async (req, res) => {
    try {
        const { imp_uid, merchant_uid, paymentId } = req.body;
        
        if (!imp_uid || !paymentId) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }
        
        // 결제 정보 조회
        const payment = findPaymentById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: '결제 정보를 찾을 수 없습니다.'
            });
        }
        
        // 권한 확인
        if (payment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        
        // PortOne API로 결제 정보 검증
        try {
            // 1. 액세스 토큰 발급
            const tokenResponse = await axios.post('https://api.iamport.kr/users/getToken', {
                imp_key: PORTONE_IMP_KEY,
                imp_secret: PORTONE_IMP_SECRET
            });
            
            const accessToken = tokenResponse.data.response.access_token;
            
            // 2. 결제 정보 조회
            const paymentResponse = await axios.get(
                `https://api.iamport.kr/payments/${imp_uid}`,
                {
                    headers: { Authorization: accessToken }
                }
            );
            
            const portonePayment = paymentResponse.data.response;
            
            // 3. 결제 금액 검증
            if (portonePayment.amount !== payment.amount) {
                return res.status(400).json({
                    success: false,
                    message: '결제 금액이 일치하지 않습니다.',
                    expected: payment.amount,
                    actual: portonePayment.amount
                });
            }
            
            // 4. 결제 상태 확인
            if (portonePayment.status !== 'paid') {
                return res.status(400).json({
                    success: false,
                    message: '결제가 완료되지 않았습니다.',
                    status: portonePayment.status
                });
            }
            
            // 5. 결제 정보 업데이트
            updatePayment(paymentId, {
                status: 'completed',
                method: portonePayment.pay_method,
                transactionId: imp_uid,
                paidAt: new Date()
            });
            
            // 6. 예약 상태 업데이트
            if (payment.bookingId) {
                updateBooking(payment.bookingId, {
                    status: 'confirmed',
                    paymentId
                });
                
                const booking = findBookingById(payment.bookingId);
                
                // 예약 확인 알림
                createNotification({
                    userId: req.user.id,
                    type: 'booking',
                    title: '예약이 확인되었습니다 ✅',
                    message: `${booking.itemName} 예약이 확인되었습니다. (${booking.date} ${booking.time})`
                });
            }
            
            // 7. 포인트 적립 (결제 금액의 1%)
            const user = findUserById(req.user.id);
            const earnedPoints = Math.floor(payment.amount * 0.01);
            updateUser(req.user.id, {
                points: user.points + earnedPoints
            });
            
            res.json({
                success: true,
                message: '결제가 완료되었습니다.',
                data: {
                    paymentId: payment.id,
                    bookingId: payment.bookingId,
                    amount: payment.amount,
                    earnedPoints,
                    paidAt: payment.paidAt
                }
            });
        } catch (apiError) {
            console.error('PortOne API 오류:', apiError.response?.data || apiError.message);
            
            // 결제 실패 처리
            updatePayment(paymentId, {
                status: 'failed'
            });
            
            if (payment.bookingId) {
                updateBooking(payment.bookingId, {
                    status: 'cancelled'
                });
            }
            
            return res.status(400).json({
                success: false,
                message: '결제 검증에 실패했습니다.',
                error: apiError.response?.data?.message || '결제 정보를 확인할 수 없습니다.'
            });
        }
    } catch (error) {
        console.error('결제 검증 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 검증 중 오류가 발생했습니다.'
        });
    }
});

// ==================== Toss Payments 결제 ====================

/**
 * POST /api/payments/toss/confirm
 * Toss Payments 결제 승인
 */
router.post('/toss/confirm', authenticate, async (req, res) => {
    try {
        const { paymentKey, orderId, amount, paymentId } = req.body;
        
        if (!paymentKey || !orderId || !amount || !paymentId) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }
        
        // 결제 정보 조회
        const payment = findPaymentById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: '결제 정보를 찾을 수 없습니다.'
            });
        }
        
        // 권한 확인
        if (payment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        
        // 금액 검증
        if (amount !== payment.amount) {
            return res.status(400).json({
                success: false,
                message: '결제 금액이 일치하지 않습니다.'
            });
        }
        
        try {
            // Toss Payments API로 결제 승인
            const tossResponse = await axios.post(
                'https://api.tosspayments.com/v1/payments/confirm',
                {
                    paymentKey,
                    orderId,
                    amount
                },
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const tossPayment = tossResponse.data;
            
            // 결제 정보 업데이트
            updatePayment(paymentId, {
                status: 'completed',
                method: tossPayment.method,
                transactionId: paymentKey,
                paidAt: new Date()
            });
            
            // 예약 상태 업데이트
            if (payment.bookingId) {
                updateBooking(payment.bookingId, {
                    status: 'confirmed',
                    paymentId
                });
                
                const booking = findBookingById(payment.bookingId);
                
                // 예약 확인 알림
                createNotification({
                    userId: req.user.id,
                    type: 'booking',
                    title: '예약이 확인되었습니다 ✅',
                    message: `${booking.itemName} 예약이 확인되었습니다. (${booking.date} ${booking.time})`
                });
            }
            
            // 포인트 적립
            const user = findUserById(req.user.id);
            const earnedPoints = Math.floor(payment.amount * 0.01);
            updateUser(req.user.id, {
                points: user.points + earnedPoints
            });
            
            res.json({
                success: true,
                message: '결제가 완료되었습니다.',
                data: {
                    paymentId: payment.id,
                    bookingId: payment.bookingId,
                    amount: payment.amount,
                    earnedPoints,
                    paidAt: payment.paidAt
                }
            });
        } catch (apiError) {
            console.error('Toss Payments API 오류:', apiError.response?.data || apiError.message);
            
            // 결제 실패 처리
            updatePayment(paymentId, {
                status: 'failed'
            });
            
            if (payment.bookingId) {
                updateBooking(payment.bookingId, {
                    status: 'cancelled'
                });
            }
            
            return res.status(400).json({
                success: false,
                message: '결제 승인에 실패했습니다.',
                error: apiError.response?.data?.message || '결제를 처리할 수 없습니다.'
            });
        }
    } catch (error) {
        console.error('결제 승인 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 승인 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 결제 내역 조회 ====================

/**
 * GET /api/payments/history
 * 내 결제 내역
 */
router.get('/history', authenticate, (req, res) => {
    try {
        const payments = findPaymentsByUserId(req.user.id);
        
        // 예약 정보 포함
        const paymentsWithBookings = payments.map(payment => {
            if (payment.bookingId) {
                const booking = findBookingById(payment.bookingId);
                return { ...payment, booking };
            }
            return payment;
        });
        
        res.json({
            success: true,
            data: paymentsWithBookings
        });
    } catch (error) {
        console.error('결제 내역 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 내역 조회 중 오류가 발생했습니다.'
        });
    }
});

/**
 * GET /api/payments/:paymentId
 * 결제 상세 조회
 */
router.get('/:paymentId', authenticate, (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = findPaymentById(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: '결제 정보를 찾을 수 없습니다.'
            });
        }
        
        // 권한 확인
        if (payment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        
        // 예약 정보 포함
        let paymentWithBooking = { ...payment };
        if (payment.bookingId) {
            const booking = findBookingById(payment.bookingId);
            paymentWithBooking.booking = booking;
        }
        
        res.json({
            success: true,
            data: paymentWithBooking
        });
    } catch (error) {
        console.error('결제 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 상세 조회 중 오류가 발생했습니다.'
        });
    }
});

// ==================== 결제 취소/환불 ====================

/**
 * POST /api/payments/:paymentId/refund
 * 결제 환불
 */
router.post('/:paymentId/refund', authenticate, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;
        
        const payment = findPaymentById(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: '결제 정보를 찾을 수 없습니다.'
            });
        }
        
        // 권한 확인
        if (payment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        
        // 결제 상태 확인
        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: '완료된 결제만 환불할 수 있습니다.'
            });
        }
        
        // TODO: 실제 결제 게이트웨이 환불 API 호출
        
        // 결제 상태 업데이트
        updatePayment(paymentId, {
            status: 'refunded',
            refundedAt: new Date()
        });
        
        // 예약 취소
        if (payment.bookingId) {
            updateBooking(payment.bookingId, {
                status: 'cancelled'
            });
        }
        
        // 환불 알림
        createNotification({
            userId: req.user.id,
            type: 'payment',
            title: '환불이 완료되었습니다',
            message: `${payment.amount.toLocaleString()}원이 환불되었습니다.`
        });
        
        res.json({
            success: true,
            message: '환불이 완료되었습니다.',
            data: {
                paymentId: payment.id,
                refundedAmount: payment.amount,
                refundedAt: payment.refundedAt
            }
        });
    } catch (error) {
        console.error('환불 오류:', error);
        res.status(500).json({
            success: false,
            message: '환불 처리 중 오류가 발생했습니다.'
        });
    }
});

export default router;
