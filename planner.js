// 여행 플래너 상태
const plannerState = {
    plans: [],
    currentPlan: null,
    currentView: 'list', // list, create, detail
    itineraries: []
};

// 플래너 초기화
function initPlanner() {
    loadPlans();
    setupPlannerEventListeners();
}

// 이벤트 리스너 설정
function setupPlannerEventListeners() {
    // 모드 토글
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            switchPlannerView(mode);
        });
    });
    
    // 계획 생성 폼
    const planForm = document.getElementById('planForm');
    if (planForm) {
        planForm.addEventListener('submit', handlePlanSubmit);
    }
    
    // 목록으로 돌아가기
    const backBtn = document.getElementById('backToPlanList');
    if (backBtn) {
        backBtn.addEventListener('click', () => switchPlannerView('list'));
    }
    
    // 캘린더 내보내기
    const exportBtn = document.getElementById('exportToCalendar');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCalendar);
    }
    
    // 계획 삭제
    const deleteBtn = document.getElementById('deletePlan');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deletePlan);
    }
    
    // 일정 추가
    const addItineraryBtn = document.getElementById('addItinerary');
    if (addItineraryBtn) {
        addItineraryBtn.addEventListener('click', () => {
            document.getElementById('itineraryModal').classList.add('active');
        });
    }
    
    // 모달 닫기
    const closeModalBtn = document.getElementById('closeItineraryModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('itineraryModal').classList.remove('active');
        });
    }
    
    // 일정 추가 폼
    const itineraryForm = document.getElementById('itineraryForm');
    if (itineraryForm) {
        itineraryForm.addEventListener('submit', handleItinerarySubmit);
    }
}

// 뷰 전환
function switchPlannerView(view) {
    // 토글 버튼 업데이트
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-mode') === view) {
            btn.classList.add('active');
        }
    });
    
    // 뷰 전환
    document.querySelectorAll('.planner-view').forEach(v => {
        v.classList.remove('active');
    });
    
    if (view === 'list') {
        document.getElementById('planner-list-view').classList.add('active');
        loadPlans();
    } else if (view === 'create') {
        document.getElementById('planner-create-view').classList.add('active');
    } else if (view === 'detail') {
        document.getElementById('planner-detail-view').classList.add('active');
    }
}

// 계획 목록 로드
async function loadPlans() {
    try {
        const response = await fetch('/api/travel-plans');
        const result = await response.json();
        
        if (result.success) {
            plannerState.plans = result.data;
            renderPlanList();
        }
    } catch (error) {
        console.error('계획 로드 실패:', error);
    }
}

// 계획 목록 렌더링
function renderPlanList() {
    const container = document.getElementById('planList');
    
    if (plannerState.plans.length === 0) {
        container.innerHTML = `
            <p style="padding: 1rem; text-align: center; color: #6b7280;">
                아직 여행 계획이 없습니다.<br>
                '새 계획 만들기'를 클릭해보세요!
            </p>
        `;
        return;
    }
    
    const statusLabels = {
        planning: '계획중',
        confirmed: '확정',
        completed: '완료',
        cancelled: '취소'
    };
    
    container.innerHTML = plannerState.plans.map(plan => `
        <div class="plan-card" onclick="showPlanDetail(${plan.id})">
            <div class="plan-card-header">
                <div>
                    <div class="plan-card-title">${plan.title}</div>
                    <div class="plan-card-destination">📍 ${plan.destination}</div>
                </div>
                <span class="plan-card-status status-${plan.status}">
                    ${statusLabels[plan.status]}
                </span>
            </div>
            <div class="plan-card-dates">
                📅 ${plan.startDate} ~ ${plan.endDate}
            </div>
            <div class="plan-card-info">
                <span>👥 ${plan.travelers}명</span>
                ${plan.budget > 0 ? `<span>💰 ${plan.budget.toLocaleString()}원</span>` : ''}
            </div>
        </div>
    `).join('');
}

// 계획 생성 제출
async function handlePlanSubmit(e) {
    e.preventDefault();
    
    const planData = {
        title: document.getElementById('planTitle').value,
        destination: document.getElementById('planDestination').value,
        startDate: document.getElementById('planStartDate').value,
        endDate: document.getElementById('planEndDate').value,
        budget: parseInt(document.getElementById('planBudget').value) || 0,
        travelers: parseInt(document.getElementById('planTravelers').value) || 1,
        notes: document.getElementById('planNotes').value
    };
    
    try {
        const response = await fetch('/api/travel-plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(planData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('여행 계획이 생성되었습니다!');
            document.getElementById('planForm').reset();
            switchPlannerView('list');
        } else {
            alert('생성 실패: ' + result.message);
        }
    } catch (error) {
        console.error('계획 생성 실패:', error);
        alert('계획 생성 중 오류가 발생했습니다.');
    }
}

// 계획 상세 보기
async function showPlanDetail(planId) {
    try {
        const response = await fetch(`/api/travel-plans/${planId}`);
        const result = await response.json();
        
        if (result.success) {
            plannerState.currentPlan = result.data;
            plannerState.itineraries = result.data.itineraries || [];
            renderPlanDetail();
            switchPlannerView('detail');
        }
    } catch (error) {
        console.error('계획 상세 로드 실패:', error);
        alert('계획을 불러올 수 없습니다.');
    }
}

// 계획 상세 렌더링
function renderPlanDetail() {
    const plan = plannerState.currentPlan;
    const planInfo = document.getElementById('planInfo');
    
    const statusLabels = {
        planning: '계획중',
        confirmed: '확정',
        completed: '완료',
        cancelled: '취소'
    };
    
    planInfo.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">${plan.title}</h2>
            <p style="color: #6b7280;">📍 ${plan.destination}</p>
        </div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">출발일</span>
                <span class="info-value">${plan.startDate}</span>
            </div>
            <div class="info-item">
                <span class="info-label">도착일</span>
                <span class="info-value">${plan.endDate}</span>
            </div>
            <div class="info-item">
                <span class="info-label">인원</span>
                <span class="info-value">${plan.travelers}명</span>
            </div>
            <div class="info-item">
                <span class="info-label">예산</span>
                <span class="info-value">${plan.budget.toLocaleString()}원</span>
            </div>
            <div class="info-item">
                <span class="info-label">상태</span>
                <span class="info-value">${statusLabels[plan.status]}</span>
            </div>
            <div class="info-item">
                <span class="info-label">생성일</span>
                <span class="info-value">${new Date(plan.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        ${plan.notes ? `<div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 0.9rem; color: #374151;">${plan.notes}</p>
        </div>` : ''}
    `;
    
    renderItineraryList();
    loadDestinationContent('travel'); // 기본값으로 여행 목적 로드
}

// 일정 목록 렌더링
function renderItineraryList() {
    const container = document.getElementById('itineraryList');
    
    if (plannerState.itineraries.length === 0) {
        container.innerHTML = `
            <p style="padding: 2rem; text-align: center; color: #6b7280;">
                아직 일정이 없습니다.<br>
                '일정 추가' 버튼을 클릭하여 일정을 추가해보세요!
            </p>
        `;
        return;
    }
    
    const typeLabels = {
        activity: '활동',
        accommodation: '숙박',
        restaurant: '식사',
        transport: '이동'
    };
    
    container.innerHTML = plannerState.itineraries.map(item => `
        <div class="itinerary-item ${item.completed ? 'completed' : ''}">
            <div class="itinerary-header">
                <span class="itinerary-time">${item.date} ${item.time}</span>
                <span class="itinerary-type type-${item.type}">${typeLabels[item.type]}</span>
            </div>
            <div class="itinerary-title">${item.title}</div>
            ${item.location ? `<div class="itinerary-location">📍 ${item.location}</div>` : ''}
            ${item.notes ? `<div class="itinerary-notes">${item.notes}</div>` : ''}
            <div class="itinerary-actions">
                <button class="itinerary-btn" onclick="toggleItineraryComplete(${item.id})">
                    ${item.completed ? '✓ 완료' : '완료 표시'}
                </button>
                ${item.lat && item.lng ? `<button class="itinerary-btn" onclick="viewOnMap(${item.lat}, ${item.lng}, '${item.title}')">🗺️ 지도</button>` : ''}
                <button class="itinerary-btn" onclick="deleteItinerary(${item.id})">🗑️ 삭제</button>
            </div>
        </div>
    `).join('');
}

// 일정 추가 제출
async function handleItinerarySubmit(e) {
    e.preventDefault();
    
    const itineraryData = {
        planId: plannerState.currentPlan.id,
        date: document.getElementById('itineraryDate').value,
        time: document.getElementById('itineraryTime').value,
        title: document.getElementById('itineraryTitle').value,
        location: document.getElementById('itineraryLocation').value,
        type: document.getElementById('itineraryType').value,
        notes: document.getElementById('itineraryNotes').value
    };
    
    try {
        const response = await fetch('/api/itineraries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itineraryData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('일정이 추가되었습니다!');
            document.getElementById('itineraryForm').reset();
            document.getElementById('itineraryModal').classList.remove('active');
            
            // 계획 상세 다시 로드
            showPlanDetail(plannerState.currentPlan.id);
        } else {
            alert('일정 추가 실패: ' + result.message);
        }
    } catch (error) {
        console.error('일정 추가 실패:', error);
        alert('일정 추가 중 오류가 발생했습니다.');
    }
}

// 일정 완료 토글
async function toggleItineraryComplete(itineraryId) {
    const itinerary = plannerState.itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;
    
    try {
        const response = await fetch(`/api/itineraries/${itineraryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: !itinerary.completed
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 계획 상세 다시 로드
            showPlanDetail(plannerState.currentPlan.id);
        }
    } catch (error) {
        console.error('일정 업데이트 실패:', error);
    }
}

// 일정 삭제
async function deleteItinerary(itineraryId) {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;
    
    try {
        const response = await fetch(`/api/itineraries/${itineraryId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('일정이 삭제되었습니다.');
            showPlanDetail(plannerState.currentPlan.id);
        }
    } catch (error) {
        console.error('일정 삭제 실패:', error);
        alert('일정 삭제 중 오류가 발생했습니다.');
    }
}

// 계획 삭제
async function deletePlan() {
    if (!confirm('이 여행 계획을 삭제하시겠습니까? 모든 일정이 함께 삭제됩니다.')) return;
    
    try {
        const response = await fetch(`/api/travel-plans/${plannerState.currentPlan.id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('계획이 삭제되었습니다.');
            switchPlannerView('list');
        }
    } catch (error) {
        console.error('계획 삭제 실패:', error);
        alert('계획 삭제 중 오류가 발생했습니다.');
    }
}

// 캘린더로 내보내기
async function exportToCalendar() {
    try {
        const planId = plannerState.currentPlan.id;
        window.open(`/api/travel-plans/${planId}/export-ical`, '_blank');
        alert('캘린더 파일이 다운로드됩니다. 구글 캘린더나 다른 캘린더 앱에서 가져오기하세요!');
    } catch (error) {
        console.error('캘린더 내보내기 실패:', error);
        alert('내보내기 중 오류가 발생했습니다.');
    }
}

// 전역 함수로 노출
window.initPlanner = initPlanner;
window.showPlanDetail = showPlanDetail;
window.toggleItineraryComplete = toggleItineraryComplete;
window.deleteItinerary = deleteItinerary;

// 페이지 로드 시 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanner);
} else {
    initPlanner();
}

// 목적지 콘텐츠 로딩
async function loadDestinationContent(purpose) {
    if (!plannerState.currentPlan) return;
    
    const destination = plannerState.currentPlan.destination;
    
    try {
        const response = await fetch(`/api/destination-content/${encodeURIComponent(destination)}?purpose=${purpose}`);
        const result = await response.json();
        
        if (result.success) {
            renderYouTubeContent(result.data.youtube);
            renderBlogContent(result.data.blogs);
        }
    } catch (error) {
        console.error('콘텐츠 로드 실패:', error);
    }
}

// YouTube 콘텐츠 렌더링
function renderYouTubeContent(videos) {
    const container = document.getElementById('youtubeList');
    
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p class="loading-text">YouTube 콘텐츠가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = videos.map(video => `
        <a href="${video.url}" target="_blank" class="youtube-item">
            <div class="youtube-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23f3f4f6%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2220%22%3E🎬%3C/text%3E%3C/svg%3E'">
                <div class="youtube-duration">${video.duration}</div>
            </div>
            <div class="youtube-info">
                <div class="youtube-title">${video.title}</div>
                <div class="youtube-channel">${video.channel}</div>
                <div class="youtube-meta">
                    <span>조회수 ${video.views}</span>
                    <span>${video.uploadDate}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// 블로그 콘텐츠 렌더링
function renderBlogContent(blogs) {
    const container = document.getElementById('blogList');
    
    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p class="loading-text">블로그 콘텐츠가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = blogs.map(blog => `
        <a href="${blog.url}" target="_blank" class="blog-item">
            <div class="blog-thumbnail">
                <img src="${blog.thumbnail}" alt="${blog.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect width=%22200%22 height=%22150%22 fill=%22%23f3f4f6%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2220%22%3E📝%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="blog-info">
                <div class="blog-title">${blog.title}</div>
                <div class="blog-summary">${blog.summary}</div>
                <div class="blog-meta">
                    <span>작성자: ${blog.blogger}</span>
                    <span>${blog.date}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// 목적 필터 버튼 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
    // 목적 필터 버튼
    document.querySelectorAll('.purpose-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 활성화 상태 변경
            document.querySelectorAll('.purpose-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 콘텐츠 로드
            const purpose = this.getAttribute('data-purpose');
            loadDestinationContent(purpose);
        });
    });
    
    // 새로고침 버튼
    const refreshBtn = document.getElementById('refreshContent');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const activePurpose = document.querySelector('.purpose-filter-btn.active');
            const purpose = activePurpose ? activePurpose.getAttribute('data-purpose') : 'travel';
            loadDestinationContent(purpose);
        });
    }
});

// 전역 함수로 노출
window.loadDestinationContent = loadDestinationContent;

