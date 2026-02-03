// 지도 초기화
let map;
let currentLocation = { lat: 37.5665, lng: 126.9780 }; // 서울 시청
let markers = [];
let routeLayer = null;

// 애플리케이션 상태
const appState = {
    parkingLots: [],
    complaints: [],
    bookings: [],
    selectedCategory: null,
    currentPurpose: null,
    recommendations: null
};

// 지도 초기화
function initMap() {
    try {
        map = L.map('map').setView([currentLocation.lat, currentLocation.lng], 13);
        
        // 여러 타일 서버 시도 (폴백 지원)
        const tileUrls = [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
            'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png'
        ];
        
        let tileLayer = L.tileLayer(tileUrls[0], {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=='
        }).addTo(map);
        
        // 타일 로드 에러 핸들링
        tileLayer.on('tileerror', function(error) {
            console.warn('Tile loading error, attempting fallback...', error);
        });
        
        // 현재 위치 마커
        L.marker([currentLocation.lat, currentLocation.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '📍',
                iconSize: [40, 40]
            })
        }).addTo(map).bindPopup('현재 위치');
        
        console.log('✅ 지도 초기화 완료');
    } catch (error) {
        console.error('❌ 지도 초기화 실패:', error);
        alert('지도를 로드하는데 실패했습니다. 페이지를 새로고침 해주세요.');
    }
}

// 샘플 주차장 데이터 생성
function generateParkingData() {
    const parkingNames = [
        '시청역 공영주차장', '광화문 주차장', '명동 공영주차장',
        '강남역 주차장', '홍대입구 주차장', '이태원 공영주차장',
        '여의도 주차장', '잠실 주차장', '신촌 공영주차장'
    ];
    
    appState.parkingLots = parkingNames.map((name, index) => ({
        id: index + 1,
        name: name,
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.05,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.05,
        totalSpots: Math.floor(Math.random() * 100) + 50,
        availableSpots: Math.floor(Math.random() * 80),
        fee: Math.floor(Math.random() * 3000) + 1000,
        address: `서울시 ${['종로구', '중구', '강남구', '마포구'][Math.floor(Math.random() * 4)]}`
    }));
    
    renderParkingList();
    addParkingMarkers();
    updateStats();
}

// 주차장 리스트 렌더링
function renderParkingList() {
    const container = document.getElementById('parkingList');
    const filterAvailable = document.getElementById('filterAvailable').checked;
    
    let filteredLots = appState.parkingLots;
    if (filterAvailable) {
        filteredLots = filteredLots.filter(lot => lot.availableSpots > 0);
    }
    
    container.innerHTML = filteredLots.map(lot => `
        <div class="parking-card" onclick="focusParking(${lot.id})">
            <h3>${lot.name}</h3>
            <div class="parking-info">
                <span>💰 ${lot.fee}원/시간</span>
                <span class="${lot.availableSpots > 0 ? 'parking-available' : 'parking-full'}">
                    🅿️ ${lot.availableSpots}/${lot.totalSpots}
                </span>
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #6b7280;">
                ${lot.address}
            </div>
        </div>
    `).join('');
}

// 주차장 마커 추가
function addParkingMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    appState.parkingLots.forEach(lot => {
        const marker = L.marker([lot.lat, lot.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '🅿️',
                iconSize: [40, 40]
            })
        }).addTo(map);
        
        marker.bindPopup(`
            <div class="popup-content">
                <h3>${lot.name}</h3>
                <p><strong>이용 가능:</strong> ${lot.availableSpots}/${lot.totalSpots}</p>
                <p><strong>요금:</strong> ${lot.fee}원/시간</p>
                <p><strong>주소:</strong> ${lot.address}</p>
                <button onclick="makeBooking('parking', ${lot.id})">예약하기</button>
            </div>
        `);
        
        markers.push(marker);
    });
}

// 주차장 포커스
window.focusParking = function(id) {
    const lot = appState.parkingLots.find(l => l.id === id);
    if (lot) {
        map.setView([lot.lat, lot.lng], 16);
        markers[id - 1].openPopup();
    }
};

// 경로 찾기
function findRoute() {
    const start = document.getElementById('routeStart').value || '현재 위치';
    const end = document.getElementById('routeEnd').value;
    const mode = document.getElementById('transportMode').value;
    
    if (!end) {
        alert('도착지를 입력해주세요.');
        return;
    }
    
    // 경로 레이어 제거
    if (routeLayer) {
        map.removeLayer(routeLayer);
    }
    
    // 샘플 경로 생성
    const endLat = currentLocation.lat + (Math.random() - 0.5) * 0.03;
    const endLng = currentLocation.lng + (Math.random() - 0.5) * 0.03;
    
    const latlngs = [
        [currentLocation.lat, currentLocation.lng],
        [(currentLocation.lat + endLat) / 2, (currentLocation.lng + endLng) / 2],
        [endLat, endLng]
    ];
    
    routeLayer = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.7
    }).addTo(map);
    
    map.fitBounds(routeLayer.getBounds());
    
    // 결과 표시
    const distance = (Math.random() * 5 + 1).toFixed(1);
    const time = Math.floor(Math.random() * 30 + 10);
    
    const modeNames = { car: '자동차', walk: '도보', bike: '자전거' };
    
    document.getElementById('routeResult').innerHTML = `
        <h3>경로 정보</h3>
        <div class="route-step">
            <p><strong>출발:</strong> ${start}</p>
            <p><strong>도착:</strong> ${end}</p>
            <p><strong>교통수단:</strong> ${modeNames[mode]}</p>
        </div>
        <div class="route-step">
            <p><strong>거리:</strong> ${distance}km</p>
            <p><strong>예상 시간:</strong> ${time}분</p>
        </div>
    `;
}

// 민원 접수
function submitComplaint() {
    const type = document.getElementById('complaintType').value;
    const location = document.getElementById('complaintLocation').value;
    const desc = document.getElementById('complaintDesc').value;
    
    if (!location || !desc) {
        alert('위치와 설명을 입력해주세요.');
        return;
    }
    
    const complaint = {
        id: appState.complaints.length + 1,
        type: type,
        location: location,
        description: desc,
        status: 'processing',
        date: new Date().toLocaleDateString('ko-KR')
    };
    
    appState.complaints.push(complaint);
    
    alert('민원이 접수되었습니다.');
    
    // 폼 초기화
    document.getElementById('complaintDesc').value = '';
    
    // 이력 업데이트
    updateComplaintHistory();
    updateStats();
}

// 민원 이력 업데이트
function updateComplaintHistory() {
    const container = document.getElementById('historyList');
    
    if (appState.complaints.length === 0) {
        container.innerHTML = '<p style="color: #6b7280;">신고 내역이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = appState.complaints.map(complaint => `
        <div class="complaint-item">
            <h4>${getComplaintTypeName(complaint.type)}</h4>
            <p>${complaint.description}</p>
            <p><strong>위치:</strong> ${complaint.location}</p>
            <p><strong>신고일:</strong> ${complaint.date}</p>
            <span class="status status-${complaint.status}">
                ${complaint.status === 'processing' ? '처리 중' : '처리 완료'}
            </span>
        </div>
    `).join('');
}

function getComplaintTypeName(type) {
    const names = {
        parking: '불법 주차',
        road: '도로 파손',
        traffic: '교통 신호',
        other: '기타'
    };
    return names[type] || type;
}

// 지도에서 위치 선택
document.getElementById('selectLocation')?.addEventListener('click', function() {
    alert('지도를 클릭하여 위치를 선택하세요.');
    
    map.once('click', function(e) {
        const { lat, lng } = e.latlng;
        document.getElementById('complaintLocation').value = `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`;
        
        // 임시 마커 추가
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '📍',
                iconSize: [40, 40]
            })
        }).addTo(map).bindPopup('선택된 위치').openPopup();
    });
});

// 주변 안내 정보
function showNearbyPlaces(category) {
    // 카테고리 버튼 활성화
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const places = generateNearbyPlaces(category);
    const container = document.getElementById('infoList');
    
    container.innerHTML = places.map(place => `
        <div class="info-card" onclick="focusPlace(${place.lat}, ${place.lng})">
            <h4>${place.name}</h4>
            <p>${place.address}</p>
            <p class="info-distance">📍 ${place.distance}km</p>
        </div>
    `).join('');
    
    // 마커 추가
    addPlaceMarkers(places, category);
}

function generateNearbyPlaces(category) {
    const names = {
        gas: ['SK 주유소', 'GS 칼텍스', '현대오일뱅크'],
        hospital: ['서울대병원', '삼성서울병원', '아산병원'],
        restaurant: ['한식당', '이탈리안 레스토랑', '일식집'],
        cafe: ['스타벅스', '이디야', '할리스'],
        store: ['CU', 'GS25', '세븐일레븐']
    };
    
    return (names[category] || []).map((name, index) => ({
        name: name,
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.02,
        address: `서울시 ${['종로구', '중구', '강남구'][index]}`,
        distance: (Math.random() * 2 + 0.5).toFixed(1)
    }));
}

function addPlaceMarkers(places, category) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    const icons = {
        gas: '⛽',
        hospital: '🏥',
        restaurant: '🍴',
        cafe: '☕',
        store: '🏪'
    };
    
    places.forEach(place => {
        const marker = L.marker([place.lat, place.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: icons[category] || '📍',
                iconSize: [40, 40]
            })
        }).addTo(map);
        
        marker.bindPopup(`
            <div class="popup-content">
                <h3>${place.name}</h3>
                <p>${place.address}</p>
                <p><strong>거리:</strong> ${place.distance}km</p>
            </div>
        `);
        
        markers.push(marker);
    });
}

window.focusPlace = function(lat, lng) {
    map.setView([lat, lng], 16);
};

// 예약하기
window.makeBooking = function(type, facilityId) {
    // 예약 탭으로 전환
    switchTab('booking');
    
    // 타입 설정
    document.getElementById('bookingType').value = type;
    
    // 시설 선택
    updateFacilityOptions();
    
    // 날짜 기본값 (오늘)
    document.getElementById('bookingDate').valueAsDate = new Date();
};

function submitBooking() {
    const type = document.getElementById('bookingType').value;
    const facility = document.getElementById('facilitySelect').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const duration = document.getElementById('bookingDuration').value;
    
    if (!facility || !date || !time) {
        alert('모든 정보를 입력해주세요.');
        return;
    }
    
    const booking = {
        id: appState.bookings.length + 1,
        type: type,
        facility: facility,
        date: date,
        time: time,
        duration: duration,
        status: 'confirmed'
    };
    
    appState.bookings.push(booking);
    
    alert('예약이 완료되었습니다!');
    
    updateBookingList();
    updateStats();
}

function updateFacilityOptions() {
    const type = document.getElementById('bookingType').value;
    const select = document.getElementById('facilitySelect');
    
    let options = '';
    if (type === 'parking') {
        options = appState.parkingLots.map(lot => 
            `<option value="${lot.id}">${lot.name}</option>`
        ).join('');
    } else {
        options = `
            <option value="1">시설 A</option>
            <option value="2">시설 B</option>
            <option value="3">시설 C</option>
        `;
    }
    
    select.innerHTML = '<option value="">시설을 선택하세요</option>' + options;
}

function updateBookingList() {
    const container = document.getElementById('myBookings');
    
    if (appState.bookings.length === 0) {
        container.innerHTML = '<p style="color: #6b7280;">예약 내역이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = appState.bookings.map(booking => `
        <div class="booking-card">
            <h4>${getBookingTypeName(booking.type)}</h4>
            <p><strong>날짜:</strong> ${booking.date}</p>
            <p><strong>시간:</strong> ${booking.time}</p>
            <p><strong>이용 시간:</strong> ${booking.duration === 'day' ? '종일' : booking.duration + '시간'}</p>
            <span class="booking-status status-${booking.status}">
                ${booking.status === 'confirmed' ? '예약 확정' : '대기 중'}
            </span>
        </div>
    `).join('');
}

function getBookingTypeName(type) {
    const names = {
        parking: '주차장 예약',
        charging: '전기차 충전',
        carwash: '세차'
    };
    return names[type] || type;
}

// 통계 업데이트
function updateStats() {
    document.getElementById('totalParking').textContent = appState.parkingLots.length;
    document.getElementById('availableSpots').textContent = 
        appState.parkingLots.reduce((sum, lot) => sum + lot.availableSpots, 0);
    document.getElementById('activeComplaints').textContent = 
        appState.complaints.filter(c => c.status === 'processing').length;
    document.getElementById('todayBookings').textContent = appState.bookings.length;
}

// 탭 전환
function switchTab(tabName) {
    // 탭 콘텐츠 전환
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 네비게이션 버튼 전환
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    // 지도 초기화
    initMap();
    
    // 샘플 데이터 생성
    generateParkingData();
    
    // 네비게이션
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // 현재 위치 버튼
    document.getElementById('currentLocation').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentLocation.lat = position.coords.latitude;
                    currentLocation.lng = position.coords.longitude;
                    map.setView([currentLocation.lat, currentLocation.lng], 13);
                    
                    // 현재 위치 마커 업데이트
                    L.marker([currentLocation.lat, currentLocation.lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '📍',
                            iconSize: [40, 40]
                        })
                    }).addTo(map).bindPopup('현재 위치');
                    
                    alert('현재 위치로 이동했습니다.');
                },
                function(error) {
                    console.error('위치 정보를 가져올 수 없습니다:', error);
                    map.setView([currentLocation.lat, currentLocation.lng], 13);
                    alert('위치 정보를 가져올 수 없어 기본 위치(서울시청)로 이동합니다.');
                }
            );
        } else {
            map.setView([currentLocation.lat, currentLocation.lng], 13);
            alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        }
    });
    
    // 새로고침 버튼
    document.getElementById('refreshData').addEventListener('click', function() {
        generateParkingData();
        alert('데이터가 새로고침되었습니다.');
    });
    
    // 주차장 필터
    document.getElementById('filterAvailable').addEventListener('change', renderParkingList);
    
    // 경로 찾기
    document.getElementById('findRoute').addEventListener('click', findRoute);
    
    // 민원 접수
    document.getElementById('submitComplaint').addEventListener('click', submitComplaint);
    
    // 카테고리 버튼
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            showNearbyPlaces(category);
        });
    });
    
    // 예약 타입 변경
    document.getElementById('bookingType').addEventListener('change', updateFacilityOptions);
    
    // 예약하기
    document.getElementById('submitBooking').addEventListener('click', submitBooking);
    
    // 여행 목적 선택
    document.querySelectorAll('.purpose-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const purpose = this.getAttribute('data-purpose');
            selectPurpose(purpose);
        });
    });
});

// 전역 함수로 노출 (HTML onclick에서 사용)
window.bookItem = bookItem;
window.viewOnMap = viewOnMap;
window.focusParking = focusParking;

// 여행 목적 선택
async function selectPurpose(purpose) {
    appState.currentPurpose = purpose;
    
    // 버튼 활성화 표시
    document.querySelectorAll('.purpose-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-purpose') === purpose) {
            btn.classList.add('active');
        }
    });
    
    try {
        const response = await fetch(`/api/recommendations/${purpose}?lat=${currentLocation.lat}&lng=${currentLocation.lng}`);
        const result = await response.json();
        
        if (result.success) {
            appState.recommendations = result.data;
            renderRecommendations(purpose);
            addRecommendationMarkers();
        } else {
            alert('추천 정보를 불러올 수 없습니다: ' + result.message);
        }
    } catch (error) {
        console.error('추천 정보 로드 실패:', error);
        alert('추천 정보를 불러오는데 실패했습니다.');
    }
}

// selectPurpose를 전역으로 노출
window.selectPurpose = selectPurpose;

// 추천 정보 렌더링
function renderRecommendations(purpose) {
    const container = document.getElementById('recommendationList');
    if (!appState.recommendations) {
        container.innerHTML = '<p style="padding: 1rem; text-align: center;">추천 정보를 불러오는 중...</p>';
        return;
    }
    
    let html = '';
    
    // 숙박 정보
    if (appState.recommendations.hotels && appState.recommendations.hotels.length > 0) {
        html += '<div class="recommendation-section"><h3>🏨 추천 숙박</h3>';
        appState.recommendations.hotels.forEach(hotel => {
            html += `
                <div class="recommendation-card">
                    <div class="recommendation-header">
                        <h4>${hotel.name}</h4>
                        <div class="recommendation-rating">⭐ ${hotel.rating}</div>
                    </div>
                    <div class="recommendation-info">
                        <span>💰 ${hotel.price.toLocaleString()}원</span>
                        ${hotel.distance ? `<span>📍 ${hotel.distance}km</span>` : ''}
                    </div>
                    <div class="recommendation-amenities">
                        ${hotel.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                    </div>
                    <button class="recommendation-btn" onclick="bookItem('hotel', ${hotel.id}, '${purpose}')">
                        예약하기
                    </button>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // 맛집 정보
    if (appState.recommendations.restaurants && appState.recommendations.restaurants.length > 0) {
        html += '<div class="recommendation-section"><h3>🍽️ 추천 맛집</h3>';
        appState.recommendations.restaurants.forEach(restaurant => {
            html += `
                <div class="recommendation-card">
                    <div class="recommendation-header">
                        <h4>${restaurant.name}</h4>
                        <div class="recommendation-rating">⭐ ${restaurant.rating}</div>
                    </div>
                    <div class="recommendation-info">
                        <span>🍴 ${restaurant.cuisine}</span>
                        ${restaurant.distance ? `<span>📍 ${restaurant.distance}km</span>` : ''}
                    </div>
                    <div class="recommendation-price">💰 ${restaurant.priceRange}원</div>
                    <button class="recommendation-btn" onclick="bookItem('restaurant', ${restaurant.id}, '${purpose}')">
                        예약하기
                    </button>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // 관광지 정보
    if (appState.recommendations.attractions && appState.recommendations.attractions.length > 0) {
        html += '<div class="recommendation-section"><h3>🎯 추천 관광지</h3>';
        appState.recommendations.attractions.forEach(attraction => {
            html += `
                <div class="recommendation-card">
                    <div class="recommendation-header">
                        <h4>${attraction.name}</h4>
                        <div class="recommendation-type">${attraction.type}</div>
                    </div>
                    <div class="recommendation-info">
                        <span>⏰ ${attraction.openHours}</span>
                        ${attraction.distance ? `<span>📍 ${attraction.distance}km</span>` : ''}
                    </div>
                    <button class="recommendation-btn" onclick="viewOnMap(${attraction.lat}, ${attraction.lng}, '${attraction.name}')">
                        지도에서 보기
                    </button>
                </div>
            `;
        });
        html += '</div>';
    }
    
    container.innerHTML = html || '<p style="padding: 1rem; text-align: center;">추천 정보가 없습니다.</p>';
}

// 추천 장소 마커 추가
function addRecommendationMarkers() {
    clearMarkers();
    
    if (!appState.recommendations) return;
    
    const addMarker = (item, icon, category) => {
        const marker = L.marker([item.lat, item.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: icon,
                iconSize: [40, 40]
            })
        }).addTo(map);
        
        let popupContent = `<strong>${item.name}</strong><br>`;
        if (item.rating) popupContent += `⭐ ${item.rating}<br>`;
        if (item.price) popupContent += `💰 ${item.price.toLocaleString()}원<br>`;
        if (item.cuisine) popupContent += `🍴 ${item.cuisine}<br>`;
        if (item.type) popupContent += `📍 ${item.type}<br>`;
        if (item.distance) popupContent += `📏 ${item.distance}km<br>`;
        
        marker.bindPopup(popupContent);
        markers.push(marker);
    };
    
    if (appState.recommendations.hotels) {
        appState.recommendations.hotels.forEach(hotel => addMarker(hotel, '🏨', 'hotel'));
    }
    if (appState.recommendations.restaurants) {
        appState.recommendations.restaurants.forEach(rest => addMarker(rest, '🍽️', 'restaurant'));
    }
    if (appState.recommendations.attractions) {
        appState.recommendations.attractions.forEach(attr => addMarker(attr, '🎯', 'attraction'));
    }
}

// 예약하기
async function bookItem(type, itemId, purpose) {
    const date = prompt('예약 날짜를 입력하세요 (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;
    
    const time = prompt('예약 시간을 입력하세요 (HH:MM):', '10:00');
    if (!time) return;
    
    const guests = prompt('인원 수를 입력하세요:', '2');
    if (!guests) return;
    
    try {
        const response = await fetch('/api/travel-bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type,
                itemId,
                purpose,
                date,
                time,
                guests: parseInt(guests),
                specialRequest: ''
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('예약이 완료되었습니다!\n\n' + 
                  `예약 번호: ${result.data.id}\n` +
                  `장소: ${result.data.itemName}\n` +
                  `날짜: ${result.data.date}\n` +
                  `시간: ${result.data.time}\n` +
                  `인원: ${result.data.guests}명`);
            updateStats();
        } else {
            alert('예약 실패: ' + result.message);
        }
    } catch (error) {
        console.error('예약 실패:', error);
        alert('예약 중 오류가 발생했습니다.');
    }
}

// 지도에서 보기
function viewOnMap(lat, lng, name) {
    map.setView([lat, lng], 16);
    
    // 해당 위치에 임시 마커 표시
    const tempMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'custom-marker temp-marker',
            html: '📍',
            iconSize: [50, 50]
        })
    }).addTo(map);
    
    tempMarker.bindPopup(`<strong>${name}</strong><br>선택한 위치입니다.`).openPopup();
    
    setTimeout(() => {
        map.removeLayer(tempMarker);
    }, 5000);
}
