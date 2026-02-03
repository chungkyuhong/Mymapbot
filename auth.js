// 인증 관리
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000' 
    : 'https://3000-illhsa38wy27xi3njh23r-2e77fc33.sandbox.novita.ai';

// 토큰 관리
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let currentUser = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupAuthEventListeners();
    checkAuthStatus();
});

// 인증 초기화
function initAuth() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        // 토큰이 있으면 사용자 정보 가져오기
        fetchUserProfile();
    }
}

// 이벤트 리스너 설정
function setupAuthEventListeners() {
    // 로그인 버튼
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        openModal('loginModal');
    });

    // 회원가입 버튼
    document.getElementById('signupBtn')?.addEventListener('click', () => {
        openModal('signupModal');
    });

    // 로그아웃 버튼
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // 프로필 버튼
    document.getElementById('profileBtn')?.addEventListener('click', showProfile);

    // 모달 닫기
    document.querySelectorAll('.auth-modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-modal')) {
            e.target.style.display = 'none';
        }
    });

    // 로그인 폼 제출
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // 회원가입 폼 제출
    document.getElementById('signupForm')?.addEventListener('submit', handleSignup);

    // 모달 전환
    document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('loginModal');
        openModal('signupModal');
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('signupModal');
        openModal('loginModal');
    });
}

// 모달 열기
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // 토큰 저장
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            accessToken = data.data.accessToken;
            refreshToken = data.data.refreshToken;
            currentUser = data.data.user;

            // UI 업데이트
            updateAuthUI(true);
            closeModal('loginModal');

            // 성공 메시지
            showNotification(t('loginSuccess'), 'success');
            
            // 폼 리셋
            document.getElementById('loginForm').reset();
        } else {
            showNotification(data.message || t('loginFailed'), 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(t('loginFailed'), 'error');
    }
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // 비밀번호 확인
    if (password !== confirmPassword) {
        showNotification(t('passwordMismatch'), 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // 토큰 저장
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            accessToken = data.data.accessToken;
            refreshToken = data.data.refreshToken;
            currentUser = data.data.user;

            // UI 업데이트
            updateAuthUI(true);
            closeModal('signupModal');

            // 성공 메시지
            showNotification(t('signupSuccess'), 'success');
            
            // 폼 리셋
            document.getElementById('signupForm').reset();
        } else {
            showNotification(data.message || t('signupFailed'), 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(t('signupFailed'), 'error');
    }
}

// 로그아웃
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    accessToken = null;
    refreshToken = null;
    currentUser = null;

    // UI 업데이트
    updateAuthUI(false);
    showNotification('로그아웃되었습니다', 'success');
}

// 사용자 프로필 가져오기
async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentUser = data.data;
            updateAuthUI(true);
        } else {
            // 토큰 만료 등
            logout();
        }
    } catch (error) {
        console.error('Fetch profile error:', error);
        logout();
    }
}

// 프로필 보기
function showProfile() {
    if (!currentUser) return;

    alert(`👤 내 정보\n\n이름: ${currentUser.name}\n이메일: ${currentUser.email}\n전화: ${currentUser.phone || '-'}\n포인트: ${currentUser.points || 0}점`);
}

// 인증 상태 확인
function checkAuthStatus() {
    const token = localStorage.getItem('accessToken');
    updateAuthUI(!!token);
}

// 인증 UI 업데이트
function updateAuthUI(isLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        profileBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        profileBtn.style.display = 'none';
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existing = document.querySelector('.auth-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `auth-notification auth-notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // 애니메이션
    setTimeout(() => notification.classList.add('show'), 10);

    // 3초 후 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 번역 함수 (i18n.js에서 가져오기)
function t(key) {
    return window.translations?.[window.currentLanguage]?.[key] || key;
}

// API 요청 헬퍼 (토큰 자동 포함)
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    return response;
}

// Export
window.auth = {
    apiRequest,
    isLoggedIn: () => !!accessToken,
    getUser: () => currentUser,
    getToken: () => accessToken
};
