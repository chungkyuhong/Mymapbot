// 온보딩 시스템
const ONBOARDING_STEPS = 3;
let currentStep = 0;

// 온보딩 상태 체크
function checkOnboardingStatus() {
    const completed = localStorage.getItem('onboarding_completed');
    const user = localStorage.getItem('accessToken');
    
    // 신규 가입 사용자만 온보딩 표시
    if (!completed && user) {
        showOnboarding();
    }
}

// 온보딩 표시
function showOnboarding() {
    const onboardingHTML = `
        <div id="onboarding-overlay" class="onboarding-overlay">
            <div class="onboarding-container">
                <button class="onboarding-skip" onclick="skipOnboarding()">건너뛰기 ✕</button>
                
                <div class="onboarding-content">
                    <!-- Step 1: 환영 -->
                    <div class="onboarding-step active" data-step="1">
                        <div class="onboarding-icon">🎉</div>
                        <h2 data-i18n="onboarding.welcome">환영합니다!</h2>
                        <p data-i18n="onboarding.welcomeDesc">
                            마이맵봇에서 더 스마트한 일상을<br>
                            경험해보세요
                        </p>
                        <div class="onboarding-features">
                            <div class="feature-item">
                                <span class="feature-icon">🅿️</span>
                                <span data-i18n="onboarding.feature1">실시간 주차장 정보</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">✈️</span>
                                <span data-i18n="onboarding.feature2">AI 여행 플래너</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🔍</span>
                                <span data-i18n="onboarding.feature3">주변 맛집 탐색</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 2: 개인화 설정 -->
                    <div class="onboarding-step" data-step="2">
                        <div class="onboarding-icon">⚙️</div>
                        <h2 data-i18n="onboarding.personalize">맞춤 설정</h2>
                        <p data-i18n="onboarding.personalizeDesc">
                            관심 있는 서비스를 선택하세요
                        </p>
                        
                        <div class="preference-grid">
                            <label class="preference-card">
                                <input type="checkbox" name="interest" value="parking" checked>
                                <div class="card-content">
                                    <span class="card-icon">🅿️</span>
                                    <span class="card-label" data-i18n="onboarding.interestParking">주차장</span>
                                </div>
                            </label>
                            
                            <label class="preference-card">
                                <input type="checkbox" name="interest" value="route">
                                <div class="card-content">
                                    <span class="card-icon">🗺️</span>
                                    <span class="card-label" data-i18n="onboarding.interestRoute">경로 안내</span>
                                </div>
                            </label>
                            
                            <label class="preference-card">
                                <input type="checkbox" name="interest" value="travel">
                                <div class="card-content">
                                    <span class="card-icon">✈️</span>
                                    <span class="card-label" data-i18n="onboarding.interestTravel">여행</span>
                                </div>
                            </label>
                            
                            <label class="preference-card">
                                <input type="checkbox" name="interest" value="dining">
                                <div class="card-content">
                                    <span class="card-icon">🍽️</span>
                                    <span class="card-label" data-i18n="onboarding.interestDining">맛집</span>
                                </div>
                            </label>
                        </div>
                        
                        <div class="transport-selection">
                            <h3 data-i18n="onboarding.transportTitle">주요 이동 수단</h3>
                            <div class="transport-options">
                                <label class="transport-option">
                                    <input type="radio" name="transport" value="car" checked>
                                    <span class="transport-icon">🚗</span>
                                    <span data-i18n="onboarding.transportCar">자동차</span>
                                </label>
                                <label class="transport-option">
                                    <input type="radio" name="transport" value="transit">
                                    <span class="transport-icon">🚇</span>
                                    <span data-i18n="onboarding.transportTransit">대중교통</span>
                                </label>
                                <label class="transport-option">
                                    <input type="radio" name="transport" value="walk">
                                    <span class="transport-icon">🚶</span>
                                    <span data-i18n="onboarding.transportWalk">도보</span>
                                </label>
                                <label class="transport-option">
                                    <input type="radio" name="transport" value="bike">
                                    <span class="transport-icon">🚴</span>
                                    <span data-i18n="onboarding.transportBike">자전거</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 3: 시작하기 -->
                    <div class="onboarding-step" data-step="3">
                        <div class="onboarding-icon">🚀</div>
                        <h2 data-i18n="onboarding.ready">준비 완료!</h2>
                        <p data-i18n="onboarding.readyDesc">
                            이제 마이맵봇을 시작해보세요
                        </p>
                        
                        <div class="quick-actions">
                            <button class="quick-action-btn" onclick="startFeature('parking')">
                                <span class="action-icon">🅿️</span>
                                <span data-i18n="onboarding.actionParking">주차장 찾기</span>
                            </button>
                            <button class="quick-action-btn" onclick="startFeature('travel')">
                                <span class="action-icon">✈️</span>
                                <span data-i18n="onboarding.actionTravel">여행 계획하기</span>
                            </button>
                            <button class="quick-action-btn" onclick="startFeature('dining')">
                                <span class="action-icon">🍽️</span>
                                <span data-i18n="onboarding.actionDining">맛집 찾기</span>
                            </button>
                        </div>
                        
                        <div class="onboarding-tips">
                            <h3 data-i18n="onboarding.tipsTitle">💡 유용한 팁</h3>
                            <ul>
                                <li data-i18n="onboarding.tip1">챗봇에게 음성으로 명령할 수 있어요</li>
                                <li data-i18n="onboarding.tip2">자주 가는 장소를 즐겨찾기 해보세요</li>
                                <li data-i18n="onboarding.tip3">알림을 설정하면 더 편리해요</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Progress Indicator -->
                <div class="onboarding-progress">
                    <div class="progress-dots">
                        <span class="dot active" data-step="1"></span>
                        <span class="dot" data-step="2"></span>
                        <span class="dot" data-step="3"></span>
                    </div>
                    <div class="progress-text">
                        <span class="current-step">1</span> / ${ONBOARDING_STEPS}
                    </div>
                </div>
                
                <!-- Navigation -->
                <div class="onboarding-navigation">
                    <button class="nav-btn prev" onclick="prevStep()" style="visibility: hidden;" data-i18n="onboarding.prev">이전</button>
                    <button class="nav-btn next primary" onclick="nextStep()" data-i18n="onboarding.next">다음</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', onboardingHTML);
    currentStep = 1;
    
    // 언어 업데이트
    if (typeof updateAllLanguageUI === 'function') {
        updateAllLanguageUI();
    }
}

// 다음 단계
function nextStep() {
    if (currentStep < ONBOARDING_STEPS) {
        // 현재 단계 검증
        if (currentStep === 2) {
            // 관심사 저장
            savePreferences();
        }
        
        currentStep++;
        updateOnboardingStep();
    } else {
        // 온보딩 완료
        completeOnboarding();
    }
}

// 이전 단계
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateOnboardingStep();
    }
}

// 단계 업데이트
function updateOnboardingStep() {
    const steps = document.querySelectorAll('.onboarding-step');
    const dots = document.querySelectorAll('.progress-dots .dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    
    // 단계 표시
    steps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Progress dots
    dots.forEach((dot, index) => {
        if (index + 1 <= currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // 현재 단계 텍스트
    document.querySelector('.current-step').textContent = currentStep;
    
    // 네비게이션 버튼
    prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    
    if (currentStep === ONBOARDING_STEPS) {
        nextBtn.textContent = t('onboarding.finish') || '시작하기';
        nextBtn.classList.add('finish');
    } else {
        nextBtn.textContent = t('onboarding.next') || '다음';
        nextBtn.classList.remove('finish');
    }
}

// 선호도 저장
function savePreferences() {
    const interests = [];
    document.querySelectorAll('input[name="interest"]:checked').forEach(input => {
        interests.push(input.value);
    });
    
    const transport = document.querySelector('input[name="transport"]:checked').value;
    
    const preferences = {
        interests,
        transport,
        completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    
    // 백엔드 전송 (인증된 사용자)
    if (window.auth && window.auth.isLoggedIn()) {
        window.auth.apiRequest('/api/auth/preferences', {
            method: 'PATCH',
            body: JSON.stringify({ preferences })
        }).catch(err => console.error('Failed to save preferences:', err));
    }
}

// 온보딩 완료
function completeOnboarding() {
    savePreferences();
    localStorage.setItem('onboarding_completed', 'true');
    
    // 축하 애니메이션
    const overlay = document.getElementById('onboarding-overlay');
    overlay.classList.add('fade-out');
    
    setTimeout(() => {
        overlay.remove();
        
        // 환영 알림
        if (typeof showNotification === 'function') {
            showNotification('🎉 ' + (t('onboarding.congratulations') || '환영합니다! 마이맵봇을 시작해보세요'), 'success');
        }
    }, 500);
}

// 온보딩 건너뛰기
function skipOnboarding() {
    if (confirm(t('onboarding.skipConfirm') || '온보딩을 건너뛰시겠습니까?\n나중에 설정에서 다시 볼 수 있습니다.')) {
        localStorage.setItem('onboarding_completed', 'true');
        document.getElementById('onboarding-overlay').remove();
    }
}

// 빠른 시작
function startFeature(feature) {
    completeOnboarding();
    
    // 해당 기능 탭으로 이동
    setTimeout(() => {
        const tabButton = document.querySelector(`[data-tab="${feature}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }, 600);
}

// 온보딩 재시작 (설정에서)
function restartOnboarding() {
    localStorage.removeItem('onboarding_completed');
    currentStep = 0;
    showOnboarding();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 성공 후 온보딩 체크
    document.addEventListener('loginSuccess', () => {
        setTimeout(checkOnboardingStatus, 500);
    });
    
    // 페이지 로드 시 체크
    setTimeout(checkOnboardingStatus, 1000);
});

// Export
window.onboarding = {
    show: showOnboarding,
    restart: restartOnboarding,
    check: checkOnboardingStatus
};
