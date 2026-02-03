/**
 * 데이터베이스 스키마 및 인메모리 저장소
 * 실제 프로덕션에서는 MongoDB/PostgreSQL 등으로 교체
 */

import { v4 as uuidv4 } from 'uuid';

// 인메모리 데이터 저장소
const db = {
    users: [],
    sessions: [],
    bookings: [],
    payments: [],
    reviews: [],
    favorites: [],
    notifications: []
};

// ==================== 사용자 관리 ====================

/**
 * 사용자 스키마
 * {
 *   id: string (UUID)
 *   email: string (unique)
 *   password: string (hashed)
 *   name: string
 *   phone: string
 *   profileImage: string (URL)
 *   membership: 'free' | 'basic' | 'premium'
 *   points: number
 *   createdAt: Date
 *   updatedAt: Date
 *   lastLoginAt: Date
 *   isEmailVerified: boolean
 *   isActive: boolean
 * }
 */

export const createUser = (userData) => {
    const user = {
        id: uuidv4(),
        email: userData.email,
        password: userData.password, // 이미 해시된 상태로 전달됨
        name: userData.name,
        phone: userData.phone || null,
        profileImage: userData.profileImage || null,
        membership: userData.membership || 'free',
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        isEmailVerified: false,
        isActive: true
    };
    
    db.users.push(user);
    return user;
};

export const findUserByEmail = (email) => {
    return db.users.find(u => u.email === email);
};

export const findUserById = (userId) => {
    return db.users.find(u => u.id === userId);
};

export const updateUser = (userId, updates) => {
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    db.users[userIndex] = {
        ...db.users[userIndex],
        ...updates,
        updatedAt: new Date()
    };
    
    return db.users[userIndex];
};

export const deleteUser = (userId) => {
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    
    db.users.splice(index, 1);
    return true;
};

// ==================== 세션 관리 ====================

/**
 * 세션 스키마
 * {
 *   id: string (UUID)
 *   userId: string
 *   token: string (JWT)
 *   refreshToken: string
 *   expiresAt: Date
 *   createdAt: Date
 *   ipAddress: string
 *   userAgent: string
 * }
 */

export const createSession = (sessionData) => {
    const session = {
        id: uuidv4(),
        userId: sessionData.userId,
        token: sessionData.token,
        refreshToken: sessionData.refreshToken,
        expiresAt: sessionData.expiresAt,
        createdAt: new Date(),
        ipAddress: sessionData.ipAddress || null,
        userAgent: sessionData.userAgent || null
    };
    
    db.sessions.push(session);
    return session;
};

export const findSessionByToken = (token) => {
    return db.sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
};

export const findSessionsByUserId = (userId) => {
    return db.sessions.filter(s => s.userId === userId && new Date(s.expiresAt) > new Date());
};

export const deleteSession = (sessionId) => {
    const index = db.sessions.findIndex(s => s.id === sessionId);
    if (index === -1) return false;
    
    db.sessions.splice(index, 1);
    return true;
};

export const deleteSessionsByUserId = (userId) => {
    db.sessions = db.sessions.filter(s => s.userId !== userId);
    return true;
};

// ==================== 예약 관리 ====================

/**
 * 예약 스키마
 * {
 *   id: string (UUID)
 *   userId: string
 *   type: 'parking' | 'restaurant' | 'hotel' | 'charging'
 *   itemId: string
 *   itemName: string
 *   date: string (YYYY-MM-DD)
 *   time: string (HH:MM)
 *   duration: number (hours)
 *   guests: number
 *   totalPrice: number
 *   status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
 *   paymentId: string
 *   specialRequest: string
 *   createdAt: Date
 *   updatedAt: Date
 * }
 */

export const createBooking = (bookingData) => {
    const booking = {
        id: uuidv4(),
        userId: bookingData.userId,
        type: bookingData.type,
        itemId: bookingData.itemId,
        itemName: bookingData.itemName,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration || 1,
        guests: bookingData.guests || 1,
        totalPrice: bookingData.totalPrice || 0,
        status: 'pending',
        paymentId: null,
        specialRequest: bookingData.specialRequest || '',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    db.bookings.push(booking);
    return booking;
};

export const findBookingById = (bookingId) => {
    return db.bookings.find(b => b.id === bookingId);
};

export const findBookingsByUserId = (userId, filters = {}) => {
    let bookings = db.bookings.filter(b => b.userId === userId);
    
    if (filters.status) {
        bookings = bookings.filter(b => b.status === filters.status);
    }
    
    if (filters.type) {
        bookings = bookings.filter(b => b.type === filters.type);
    }
    
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateBooking = (bookingId, updates) => {
    const index = db.bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return null;
    
    db.bookings[index] = {
        ...db.bookings[index],
        ...updates,
        updatedAt: new Date()
    };
    
    return db.bookings[index];
};

// ==================== 결제 관리 ====================

/**
 * 결제 스키마
 * {
 *   id: string (UUID)
 *   userId: string
 *   bookingId: string
 *   amount: number
 *   currency: 'KRW' | 'USD'
 *   method: 'card' | 'kakaopay' | 'tosspay' | 'bank'
 *   status: 'pending' | 'completed' | 'failed' | 'refunded'
 *   provider: 'portone' | 'toss' | 'kakao'
 *   transactionId: string (from payment gateway)
 *   paidAt: Date
 *   refundedAt: Date
 *   createdAt: Date
 * }
 */

export const createPayment = (paymentData) => {
    const payment = {
        id: uuidv4(),
        userId: paymentData.userId,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'KRW',
        method: paymentData.method,
        status: 'pending',
        provider: paymentData.provider,
        transactionId: null,
        paidAt: null,
        refundedAt: null,
        createdAt: new Date()
    };
    
    db.payments.push(payment);
    return payment;
};

export const findPaymentById = (paymentId) => {
    return db.payments.find(p => p.id === paymentId);
};

export const findPaymentsByUserId = (userId) => {
    return db.payments.filter(p => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updatePayment = (paymentId, updates) => {
    const index = db.payments.findIndex(p => p.id === paymentId);
    if (index === -1) return null;
    
    db.payments[index] = {
        ...db.payments[index],
        ...updates
    };
    
    return db.payments[index];
};

// ==================== 리뷰 관리 ====================

/**
 * 리뷰 스키마
 * {
 *   id: string (UUID)
 *   userId: string
 *   userName: string
 *   bookingId: string
 *   itemId: string
 *   itemType: string
 *   rating: number (1-5)
 *   comment: string
 *   images: string[] (URLs)
 *   isVerified: boolean
 *   createdAt: Date
 * }
 */

export const createReview = (reviewData) => {
    const review = {
        id: uuidv4(),
        userId: reviewData.userId,
        userName: reviewData.userName,
        bookingId: reviewData.bookingId,
        itemId: reviewData.itemId,
        itemType: reviewData.itemType,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || [],
        isVerified: reviewData.isVerified || false,
        createdAt: new Date()
    };
    
    db.reviews.push(review);
    return review;
};

export const findReviewsByItemId = (itemId) => {
    return db.reviews.filter(r => r.itemId === itemId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const findReviewsByUserId = (userId) => {
    return db.reviews.filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// ==================== 즐겨찾기 관리 ====================

/**
 * 즐겨찾기 스키마
 * {
 *   id: string (UUID)
 *   userId: string
 *   itemId: string
 *   itemType: 'parking' | 'restaurant' | 'hotel' | 'attraction'
 *   itemName: string
 *   itemData: object
 *   createdAt: Date
 * }
 */

export const addFavorite = (favoriteData) => {
    // 중복 체크
    const exists = db.favorites.find(
        f => f.userId === favoriteData.userId && f.itemId === favoriteData.itemId
    );
    
    if (exists) return exists;
    
    const favorite = {
        id: uuidv4(),
        userId: favoriteData.userId,
        itemId: favoriteData.itemId,
        itemType: favoriteData.itemType,
        itemName: favoriteData.itemName,
        itemData: favoriteData.itemData || {},
        createdAt: new Date()
    };
    
    db.favorites.push(favorite);
    return favorite;
};

export const findFavoritesByUserId = (userId, itemType = null) => {
    let favorites = db.favorites.filter(f => f.userId === userId);
    
    if (itemType) {
        favorites = favorites.filter(f => f.itemType === itemType);
    }
    
    return favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const removeFavorite = (userId, itemId) => {
    const index = db.favorites.findIndex(f => f.userId === userId && f.itemId === itemId);
    if (index === -1) return false;
    
    db.favorites.splice(index, 1);
    return true;
};

// ==================== 알림 관리 ====================

/**
 * 알림 스키마
 * {
 *   id: string (UUID)
 *   userId: string
 *   type: 'booking' | 'payment' | 'promotion' | 'system'
 *   title: string
 *   message: string
 *   data: object
 *   isRead: boolean
 *   createdAt: Date
 * }
 */

export const createNotification = (notificationData) => {
    const notification = {
        id: uuidv4(),
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        isRead: false,
        createdAt: new Date()
    };
    
    db.notifications.push(notification);
    return notification;
};

export const findNotificationsByUserId = (userId, unreadOnly = false) => {
    let notifications = db.notifications.filter(n => n.userId === userId);
    
    if (unreadOnly) {
        notifications = notifications.filter(n => !n.isRead);
    }
    
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const markNotificationAsRead = (notificationId) => {
    const notification = db.notifications.find(n => n.id === notificationId);
    if (!notification) return null;
    
    notification.isRead = true;
    return notification;
};

export const markAllNotificationsAsRead = (userId) => {
    db.notifications
        .filter(n => n.userId === userId)
        .forEach(n => n.isRead = true);
    return true;
};

// ==================== 통계 및 유틸리티 ====================

export const getStats = () => {
    return {
        totalUsers: db.users.filter(u => u.isActive).length,
        totalBookings: db.bookings.length,
        totalPayments: db.payments.filter(p => p.status === 'completed').length,
        totalRevenue: db.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0),
        todayBookings: db.bookings.filter(b => {
            const today = new Date().toISOString().split('T')[0];
            return b.date === today;
        }).length
    };
};

export const clearAllData = () => {
    db.users = [];
    db.sessions = [];
    db.bookings = [];
    db.payments = [];
    db.reviews = [];
    db.favorites = [];
    db.notifications = [];
    return true;
};

// Export database for direct access if needed
export default db;
