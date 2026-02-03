import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchPOI, searchByCategory, addressToCoord, CATEGORY_CODES } from './poiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// 샘플 데이터
let parkingLots = [
    { id: 1, name: '시청역 공영주차장', lat: 37.5665, lng: 126.9780, totalSpots: 120, availableSpots: 45, fee: 2000 },
    { id: 2, name: '광화문 주차장', lat: 37.5760, lng: 126.9769, totalSpots: 80, availableSpots: 23, fee: 2500 },
    { id: 3, name: '강남역 주차장', lat: 37.4979, lng: 127.0276, totalSpots: 150, availableSpots: 67, fee: 3000 }
];

let complaints = [];
let bookings = [];

// 여행 플래너 데이터
let travelPlans = [];
let itineraries = [];

// Haversine 거리 계산 함수 (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}


// 여행 목적별 추천 데이터
const recommendations = {
    business: {
        hotels: [
            { id: 1, name: '서울 비즈니스 호텔', lat: 37.5665, lng: 126.9780, rating: 4.5, price: 120000, amenities: ['WiFi', '회의실', '주차'], image: 'hotel1.jpg' },
            { id: 2, name: '강남 비즈니스 센터', lat: 37.4979, lng: 127.0276, rating: 4.7, price: 150000, amenities: ['WiFi', '회의실', '라운지'], image: 'hotel2.jpg' },
            { id: 3, name: '명동 비즈니스 인', lat: 37.5635, lng: 126.9843, rating: 4.3, price: 100000, amenities: ['WiFi', '비즈니스센터'], image: 'hotel3.jpg' }
        ],
        restaurants: [
            { id: 1, name: '한정식 서울', lat: 37.5670, lng: 126.9790, cuisine: '한식', rating: 4.6, priceRange: '30000-50000', image: 'rest1.jpg' },
            { id: 2, name: '일식당 미나토', lat: 37.5000, lng: 127.0300, cuisine: '일식', rating: 4.8, priceRange: '40000-60000', image: 'rest2.jpg' }
        ],
        attractions: [
            { id: 1, name: '코엑스 컨벤션', lat: 37.5112, lng: 127.0591, type: '컨벤션', openHours: '09:00-18:00', image: 'attr1.jpg' },
            { id: 2, name: '여의도 금융가', lat: 37.5219, lng: 126.9245, type: '비즈니스지구', openHours: '24시간', image: 'attr2.jpg' }
        ]
    },
    travel: {
        hotels: [
            { id: 4, name: '북촌 한옥 게스트하우스', lat: 37.5820, lng: 126.9838, rating: 4.8, price: 80000, amenities: ['WiFi', '전통체험', '조식'], image: 'hotel4.jpg' },
            { id: 5, name: '홍대 부티크 호텔', lat: 37.5560, lng: 126.9236, rating: 4.6, price: 90000, amenities: ['WiFi', '루프탑', '조식'], image: 'hotel5.jpg' },
            { id: 6, name: '한강뷰 리조트', lat: 37.5280, lng: 126.9291, rating: 4.9, price: 180000, amenities: ['WiFi', '수영장', '스파'], image: 'hotel6.jpg' }
        ],
        restaurants: [
            { id: 3, name: '광장시장', lat: 37.5704, lng: 126.9998, cuisine: '한식', rating: 4.7, priceRange: '5000-15000', image: 'rest3.jpg' },
            { id: 4, name: '이태원 세계음식거리', lat: 37.5343, lng: 126.9943, cuisine: '세계음식', rating: 4.5, priceRange: '15000-30000', image: 'rest4.jpg' },
            { id: 5, name: '강남 파인다이닝', lat: 37.5048, lng: 127.0249, cuisine: '퓨전', rating: 4.9, priceRange: '50000-100000', image: 'rest5.jpg' }
        ],
        attractions: [
            { id: 3, name: '경복궁', lat: 37.5796, lng: 126.9770, type: '문화유산', openHours: '09:00-18:00', image: 'attr3.jpg' },
            { id: 4, name: '남산타워', lat: 37.5512, lng: 126.9882, type: '관광명소', openHours: '10:00-23:00', image: 'attr4.jpg' },
            { id: 5, name: '한강공원', lat: 37.5270, lng: 126.9340, type: '레저', openHours: '24시간', image: 'attr5.jpg' },
            { id: 6, name: '명동 쇼핑거리', lat: 37.5636, lng: 126.9862, type: '쇼핑', openHours: '10:00-22:00', image: 'attr6.jpg' }
        ]
    },
    dining: {
        restaurants: [
            { id: 6, name: '미슐랭 프렌치', lat: 37.5270, lng: 127.0385, cuisine: '프렌치', rating: 4.9, priceRange: '80000-150000', image: 'rest6.jpg' },
            { id: 7, name: '강남 스시야', lat: 37.5010, lng: 127.0268, cuisine: '일식', rating: 4.8, priceRange: '60000-100000', image: 'rest7.jpg' },
            { id: 8, name: '압구정 이탈리안', lat: 37.5273, lng: 127.0286, cuisine: '이탈리안', rating: 4.7, priceRange: '40000-70000', image: 'rest8.jpg' },
            { id: 9, name: '삼청동 카페거리', lat: 37.5827, lng: 126.9829, cuisine: '카페', rating: 4.6, priceRange: '5000-15000', image: 'rest9.jpg' },
            { id: 10, name: '을지로 포차거리', lat: 37.5663, lng: 126.9910, cuisine: '한식', rating: 4.5, priceRange: '10000-30000', image: 'rest10.jpg' }
        ]
    }
};

// API 엔드포인트

// 주차장 검색 (특정 경로이므로 먼저 정의)
app.get('/api/parking/search', (req, res) => {
    const { query, available } = req.query;
    let results = parkingLots;
    
    if (query) {
        results = results.filter(lot => 
            lot.name.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    if (available === 'true') {
        results = results.filter(lot => lot.availableSpots > 0);
    }
    
    res.json({ success: true, data: results });
});

// 주차장 목록 조회
app.get('/api/parking', (req, res) => {
    res.json({
        success: true,
        data: parkingLots
    });
});

// 주차장 검색 (반드시 :id 앞에 위치해야 함)
app.get('/api/parking/search', (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.json({
            success: true,
            data: parkingLots
        });
    }
    
    const results = parkingLots.filter(lot => 
        lot.name.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
        success: true,
        data: results,
        count: results.length
    });
});

// 특정 주차장 조회 (이 라우트는 search 뒤에 위치해야 함)
app.get('/api/parking/:id', (req, res) => {
    const lot = parkingLots.find(p => p.id === parseInt(req.params.id));
    if (lot) {
        res.json({ success: true, data: lot });
    } else {
        res.status(404).json({ success: false, message: '주차장을 찾을 수 없습니다.' });
    }
});

// 경로 찾기
app.post('/api/route', (req, res) => {
    const { start, end, mode } = req.body;
    
    // 샘플 경로 데이터
    const route = {
        distance: (Math.random() * 5 + 1).toFixed(1) + 'km',
        duration: Math.floor(Math.random() * 30 + 10) + '분',
        steps: [
            { instruction: '출발지에서 직진', distance: '0.5km' },
            { instruction: '첫 번째 교차로에서 우회전', distance: '1.2km' },
            { instruction: '목적지 도착', distance: '0.3km' }
        ]
    };
    
    res.json({ success: true, data: route });
});

// 민원 접수
app.post('/api/complaints', (req, res) => {
    const { type, location, description } = req.body;
    
    if (!type || !location || !description) {
        return res.status(400).json({
            success: false,
            message: '필수 정보를 입력해주세요.'
        });
    }
    
    const complaint = {
        id: complaints.length + 1,
        type,
        location,
        description,
        status: 'processing',
        createdAt: new Date().toISOString()
    };
    
    complaints.push(complaint);
    
    res.status(201).json({
        success: true,
        message: '민원이 접수되었습니다.',
        data: complaint
    });
});

// 민원 목록 조회
app.get('/api/complaints', (req, res) => {
    res.json({
        success: true,
        data: complaints
    });
});

// 민원 상세 조회
app.get('/api/complaints/:id', (req, res) => {
    const complaint = complaints.find(c => c.id === parseInt(req.params.id));
    if (complaint) {
        res.json({ success: true, data: complaint });
    } else {
        res.status(404).json({ success: false, message: '민원을 찾을 수 없습니다.' });
    }
});

// 주변 시설 검색 (실제 POI 데이터 사용)
app.get('/api/nearby/:category', async (req, res) => {
    const { category } = req.params;
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: '위치 정보(위도/경도)를 입력해주세요.'
        });
    }
    
    try {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = radius ? parseInt(radius) : 3000; // 기본 3km
        
        // 카테고리 매핑
        const categoryMapping = {
            gas: { code: 'OL7', name: '주유소' },
            hospital: { code: 'HP8', name: '병원' },
            restaurant: { code: 'FD6', name: '음식점' },
            cafe: { code: 'CE7', name: '카페' },
            store: { code: 'CS2', name: '편의점' },
            mart: { code: 'MT1', name: '마트' },
            pharmacy: { code: 'PM9', name: '약국' },
            bank: { code: 'BK9', name: '은행' },
            parking: { code: 'PK6', name: '주차장' }
        };
        
        const catInfo = categoryMapping[category];
        if (!catInfo) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 카테고리입니다.'
            });
        }
        
        // POI 검색
        const results = await searchByCategory(catInfo.code, userLng, userLat, searchRadius);
        
        // 응답 형식 변환
        const places = results.map(poi => ({
            id: poi.id,
            name: poi.name,
            lat: poi.lat,
            lng: poi.lng,
            distance: poi.distance ? (poi.distance / 1000).toFixed(1) : '0',
            address: poi.address,
            phone: poi.phone,
            placeUrl: poi.placeUrl
        }));
        
        res.json({
            success: true,
            category: category,
            count: places.length,
            data: places
        });
    } catch (error) {
        console.error('주변 검색 오류:', error);
        
        // 오류 시 샘플 데이터 반환
        const samplePlaces = {
            gas: [
                { id: 1, name: 'SK 주유소', lat: 37.5680, lng: 126.9800, distance: '0.8', address: '서울시 중구', phone: '02-1234-5678' },
                { id: 2, name: 'GS 칼텍스', lat: 37.5650, lng: 126.9750, distance: '1.2', address: '서울시 중구', phone: '02-1234-5679' }
            ],
            hospital: [
                { id: 1, name: '서울대병원', lat: 37.5790, lng: 126.9940, distance: '2.1', address: '서울시 종로구', phone: '02-2072-0694' },
                { id: 2, name: '삼성서울병원', lat: 37.4880, lng: 127.0857, distance: '3.5', address: '서울시 강남구', phone: '02-3410-2114' }
            ],
            restaurant: [
                { id: 1, name: '한식당', lat: 37.5670, lng: 126.9790, distance: '0.5', address: '서울시 중구', phone: '02-1234-5680' },
                { id: 2, name: '이탈리안 레스토랑', lat: 37.5660, lng: 126.9770, distance: '0.7', address: '서울시 중구', phone: '02-1234-5681' }
            ],
            cafe: [
                { id: 1, name: '스타벅스', lat: 37.5675, lng: 126.9785, distance: '0.3', address: '서울시 중구', phone: '1522-3232' },
                { id: 2, name: '이디야', lat: 37.5655, lng: 126.9775, distance: '0.6', address: '서울시 중구', phone: '1599-7071' }
            ],
            store: [
                { id: 1, name: 'CU', lat: 37.5668, lng: 126.9782, distance: '0.2', address: '서울시 중구', phone: '1577-1287' },
                { id: 2, name: 'GS25', lat: 37.5662, lng: 126.9778, distance: '0.4', address: '서울시 중구', phone: '1577-3285' }
            ]
        };
        
        res.json({
            success: true,
            category: category,
            count: (samplePlaces[category] || []).length,
            data: samplePlaces[category] || []
        });
    }
});

// 예약 생성
app.post('/api/bookings', (req, res) => {
    const { type, facilityId, date, time, duration } = req.body;
    
    if (!type || !facilityId || !date || !time) {
        return res.status(400).json({
            success: false,
            message: '필수 정보를 입력해주세요.'
        });
    }
    
    const booking = {
        id: bookings.length + 1,
        type,
        facilityId,
        date,
        time,
        duration,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    bookings.push(booking);
    
    res.status(201).json({
        success: true,
        message: '예약이 완료되었습니다.',
        data: booking
    });
});

// 예약 목록 조회
app.get('/api/bookings', (req, res) => {
    res.json({
        success: true,
        data: bookings
    });
});

// 예약 취소
app.delete('/api/bookings/:id', (req, res) => {
    const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
    if (index !== -1) {
        bookings.splice(index, 1);
        res.json({ success: true, message: '예약이 취소되었습니다.' });
    } else {
        res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
    }
});

// 통계 조회
app.get('/api/stats', (req, res) => {
    const stats = {
        totalParkingLots: parkingLots.length,
        availableSpots: parkingLots.reduce((sum, lot) => sum + lot.availableSpots, 0),
        totalSpots: parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0),
        activeComplaints: complaints.filter(c => c.status === 'processing').length,
        totalComplaints: complaints.length,
        todayBookings: bookings.filter(b => {
            const today = new Date().toISOString().split('T')[0];
            return b.date === today;
        }).length,
        totalBookings: bookings.length
    };
    
    res.json({ success: true, data: stats });
});

// 여행 목적별 추천 조회 (실제 POI 데이터 사용)
app.get('/api/recommendations/:purpose', async (req, res) => {
    const { purpose } = req.params;
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
        // 위치 정보가 없으면 샘플 데이터 반환
        if (!recommendations[purpose]) {
            return res.status(404).json({
                success: false,
                message: '해당 목적의 추천 정보를 찾을 수 없습니다.'
            });
        }
        return res.json({ success: true, data: recommendations[purpose] });
    }
    
    try {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radius = 10000; // 10km 반경
        
        // 목적별 검색 키워드 및 카테고리
        const searchConfig = {
            business: {
                hotels: { query: '비즈니스 호텔', category: 'AD5' },
                restaurants: { query: '고급 레스토랑', category: 'FD6' },
                attractions: { query: '컨벤션 센터', category: 'CT1' }
            },
            travel: {
                hotels: { query: '호텔 게스트하우스', category: 'AD5' },
                restaurants: { query: '맛집 레스토랑', category: 'FD6' },
                attractions: { query: '관광지 명소', category: 'AT4' }
            },
            dining: {
                restaurants: { query: '맛집 레스토랑', category: 'FD6' }
            }
        };
        
        const config = searchConfig[purpose];
        if (!config) {
            return res.status(404).json({
                success: false,
                message: '해당 목적의 추천 정보를 찾을 수 없습니다.'
            });
        }
        
        // 각 카테고리별로 POI 검색
        const data = {};
        
        for (const [category, searchParams] of Object.entries(config)) {
            const results = await searchPOI(
                searchParams.query,
                userLng,
                userLat,
                radius,
                searchParams.category
            );
            
            // 여행 추천 형식으로 변환
            data[category] = results.slice(0, 5).map((poi, index) => ({
                id: poi.id || index + 1,
                name: poi.name,
                lat: poi.lat,
                lng: poi.lng,
                rating: (4.0 + Math.random()).toFixed(1),
                price: category === 'hotels' ? Math.floor(Math.random() * 100000 + 80000) : undefined,
                priceRange: category === 'restaurants' ? `${Math.floor(Math.random() * 30000 + 20000)}-${Math.floor(Math.random() * 50000 + 40000)}` : undefined,
                amenities: category === 'hotels' ? ['WiFi', '주차', '조식'] : undefined,
                cuisine: category === 'restaurants' ? poi.category.split('>').pop().trim() : undefined,
                type: category === 'attractions' ? poi.categoryGroupName || '관광지' : undefined,
                openHours: category === 'attractions' ? '09:00-18:00' : undefined,
                image: 'placeholder.jpg',
                distance: poi.distance ? (poi.distance / 1000).toFixed(1) : '0',
                address: poi.address,
                phone: poi.phone,
                placeUrl: poi.placeUrl
            }));
        }
        
        res.json({ success: true, data });
    } catch (error) {
        console.error('추천 조회 오류:', error);
        
        // 오류 시 샘플 데이터 반환
        if (recommendations[purpose]) {
            return res.json({ success: true, data: recommendations[purpose] });
        }
        
        res.status(500).json({
            success: false,
            message: '추천 조회 중 오류가 발생했습니다.'
        });
    }
});

// 여행 예약 생성 (숙박, 맛집, 관광지)
app.post('/api/travel-bookings', (req, res) => {
    const { type, itemId, purpose, date, time, guests, specialRequest } = req.body;
    
    if (!type || !itemId || !purpose || !date) {
        return res.status(400).json({
            success: false,
            message: '필수 정보를 입력해주세요.'
        });
    }
    
    // 해당 항목 찾기
    let item = null;
    const purposeData = recommendations[purpose];
    
    if (purposeData) {
        if (type === 'hotel' && purposeData.hotels) {
            item = purposeData.hotels.find(h => h.id === itemId);
        } else if (type === 'restaurant' && purposeData.restaurants) {
            item = purposeData.restaurants.find(r => r.id === itemId);
        } else if (type === 'attraction' && purposeData.attractions) {
            item = purposeData.attractions.find(a => a.id === itemId);
        }
    }
    
    if (!item) {
        return res.status(404).json({
            success: false,
            message: '예약하려는 항목을 찾을 수 없습니다.'
        });
    }
    
    const booking = {
        id: bookings.length + 1,
        type,
        itemId,
        itemName: item.name,
        purpose,
        date,
        time: time || '미정',
        guests: guests || 1,
        specialRequest: specialRequest || '',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    bookings.push(booking);
    
    res.json({
        success: true,
        message: '예약이 완료되었습니다.',
        data: booking
    });
});

// ===== 여행 플래너 API =====

// 여행 계획 생성
app.post('/api/travel-plans', (req, res) => {
    const { title, destination, startDate, endDate, budget, travelers, notes } = req.body;
    
    if (!title || !destination || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: '필수 정보를 입력해주세요.'
        });
    }
    
    const plan = {
        id: travelPlans.length + 1,
        title,
        destination,
        startDate,
        endDate,
        budget: budget || 0,
        travelers: travelers || 1,
        notes: notes || '',
        status: 'planning', // planning, confirmed, completed, cancelled
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    travelPlans.push(plan);
    
    res.status(201).json({
        success: true,
        message: '여행 계획이 생성되었습니다.',
        data: plan
    });
});

// 여행 계획 목록 조회
app.get('/api/travel-plans', (req, res) => {
    const { status } = req.query;
    
    let plans = travelPlans;
    if (status) {
        plans = plans.filter(p => p.status === status);
    }
    
    res.json({
        success: true,
        data: plans
    });
});

// 여행 계획 상세 조회
app.get('/api/travel-plans/:id', (req, res) => {
    const plan = travelPlans.find(p => p.id === parseInt(req.params.id));
    
    if (!plan) {
        return res.status(404).json({
            success: false,
            message: '여행 계획을 찾을 수 없습니다.'
        });
    }
    
    // 해당 계획의 일정 가져오기
    const planItineraries = itineraries.filter(i => i.planId === plan.id);
    
    res.json({
        success: true,
        data: {
            ...plan,
            itineraries: planItineraries
        }
    });
});

// 여행 계획 수정
app.put('/api/travel-plans/:id', (req, res) => {
    const index = travelPlans.findIndex(p => p.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: '여행 계획을 찾을 수 없습니다.'
        });
    }
    
    const { title, destination, startDate, endDate, budget, travelers, notes, status } = req.body;
    
    travelPlans[index] = {
        ...travelPlans[index],
        title: title || travelPlans[index].title,
        destination: destination || travelPlans[index].destination,
        startDate: startDate || travelPlans[index].startDate,
        endDate: endDate || travelPlans[index].endDate,
        budget: budget !== undefined ? budget : travelPlans[index].budget,
        travelers: travelers || travelPlans[index].travelers,
        notes: notes !== undefined ? notes : travelPlans[index].notes,
        status: status || travelPlans[index].status,
        updatedAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        message: '여행 계획이 수정되었습니다.',
        data: travelPlans[index]
    });
});

// 여행 계획 삭제
app.delete('/api/travel-plans/:id', (req, res) => {
    const index = travelPlans.findIndex(p => p.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: '여행 계획을 찾을 수 없습니다.'
        });
    }
    
    // 관련 일정도 삭제
    itineraries = itineraries.filter(i => i.planId !== parseInt(req.params.id));
    travelPlans.splice(index, 1);
    
    res.json({
        success: true,
        message: '여행 계획이 삭제되었습니다.'
    });
});

// 일정 추가
app.post('/api/itineraries', (req, res) => {
    const { planId, date, time, title, location, type, notes, lat, lng } = req.body;
    
    if (!planId || !date || !title) {
        return res.status(400).json({
            success: false,
            message: '필수 정보를 입력해주세요.'
        });
    }
    
    // 계획 존재 확인
    const plan = travelPlans.find(p => p.id === parseInt(planId));
    if (!plan) {
        return res.status(404).json({
            success: false,
            message: '여행 계획을 찾을 수 없습니다.'
        });
    }
    
    const itinerary = {
        id: itineraries.length + 1,
        planId: parseInt(planId),
        date,
        time: time || '09:00',
        title,
        location: location || '',
        type: type || 'activity', // activity, accommodation, restaurant, transport
        notes: notes || '',
        lat: lat || null,
        lng: lng || null,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    itineraries.push(itinerary);
    
    res.status(201).json({
        success: true,
        message: '일정이 추가되었습니다.',
        data: itinerary
    });
});

// 일정 목록 조회
app.get('/api/itineraries', (req, res) => {
    const { planId, date } = req.query;
    
    let items = itineraries;
    
    if (planId) {
        items = items.filter(i => i.planId === parseInt(planId));
    }
    
    if (date) {
        items = items.filter(i => i.date === date);
    }
    
    // 날짜와 시간순 정렬
    items.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });
    
    res.json({
        success: true,
        data: items
    });
});

// 일정 수정
app.put('/api/itineraries/:id', (req, res) => {
    const index = itineraries.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: '일정을 찾을 수 없습니다.'
        });
    }
    
    const { date, time, title, location, type, notes, completed, lat, lng } = req.body;
    
    itineraries[index] = {
        ...itineraries[index],
        date: date || itineraries[index].date,
        time: time || itineraries[index].time,
        title: title || itineraries[index].title,
        location: location !== undefined ? location : itineraries[index].location,
        type: type || itineraries[index].type,
        notes: notes !== undefined ? notes : itineraries[index].notes,
        completed: completed !== undefined ? completed : itineraries[index].completed,
        lat: lat !== undefined ? lat : itineraries[index].lat,
        lng: lng !== undefined ? lng : itineraries[index].lng
    };
    
    res.json({
        success: true,
        message: '일정이 수정되었습니다.',
        data: itineraries[index]
    });
});

// 일정 삭제
app.delete('/api/itineraries/:id', (req, res) => {
    const index = itineraries.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: '일정을 찾을 수 없습니다.'
        });
    }
    
    itineraries.splice(index, 1);
    
    res.json({
        success: true,
        message: '일정이 삭제되었습니다.'
    });
});

// 구글 캘린더 연동 (iCalendar 형식 내보내기)
app.get('/api/travel-plans/:id/export-ical', (req, res) => {
    const plan = travelPlans.find(p => p.id === parseInt(req.params.id));
    
    if (!plan) {
        return res.status(404).json({
            success: false,
            message: '여행 계획을 찾을 수 없습니다.'
        });
    }
    
    const planItineraries = itineraries.filter(i => i.planId === plan.id);
    
    // iCalendar 형식 생성
    let icalContent = 'BEGIN:VCALENDAR\n';
    icalContent += 'VERSION:2.0\n';
    icalContent += 'PRODID:-//Mobility Platform//Travel Planner//EN\n';
    icalContent += `X-WR-CALNAME:${plan.title}\n`;
    icalContent += 'X-WR-TIMEZONE:Asia/Seoul\n';
    
    planItineraries.forEach(item => {
        const startDateTime = `${item.date.replace(/-/g, '')}T${item.time.replace(':', '')}00`;
        const endDateTime = `${item.date.replace(/-/g, '')}T${(parseInt(item.time.split(':')[0]) + 1).toString().padStart(2, '0')}${item.time.split(':')[1]}00`;
        
        icalContent += 'BEGIN:VEVENT\n';
        icalContent += `UID:${item.id}@mobilityplatform\n`;
        icalContent += `DTSTART:${startDateTime}\n`;
        icalContent += `DTEND:${endDateTime}\n`;
        icalContent += `SUMMARY:${item.title}\n`;
        if (item.location) {
            icalContent += `LOCATION:${item.location}\n`;
        }
        if (item.notes) {
            icalContent += `DESCRIPTION:${item.notes}\n`;
        }
        if (item.lat && item.lng) {
            icalContent += `GEO:${item.lat};${item.lng}\n`;
        }
        icalContent += 'END:VEVENT\n';
    });
    
    icalContent += 'END:VCALENDAR';
    
    // 파일명을 URL 인코딩 (한글 지원)
    const filename = encodeURIComponent(plan.title) + '.ics';
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(icalContent);
});

// ========== POI (관심지점) API ==========

// POI 검색 (키워드 기반)
app.get('/api/poi/search', async (req, res) => {
    const { query, lat, lng, radius, category } = req.query;
    
    if (!query) {
        return res.status(400).json({
            success: false,
            message: '검색어를 입력해주세요.'
        });
    }
    
    try {
        const x = lng ? parseFloat(lng) : null;
        const y = lat ? parseFloat(lat) : null;
        const r = radius ? parseInt(radius) : 5000;
        
        const results = await searchPOI(query, x, y, r, category);
        
        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('POI 검색 오류:', error);
        res.status(500).json({
            success: false,
            message: 'POI 검색 중 오류가 발생했습니다.'
        });
    }
});

// POI 카테고리별 검색
app.get('/api/poi/category/:category', async (req, res) => {
    const { category } = req.params;
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: '위치 정보(위도/경도)를 입력해주세요.'
        });
    }
    
    try {
        const x = parseFloat(lng);
        const y = parseFloat(lat);
        const r = radius ? parseInt(radius) : 5000;
        
        // 카테고리 코드 매핑
        const categoryCode = CATEGORY_CODES[category];
        if (!categoryCode) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 카테고리입니다.'
            });
        }
        
        const results = await searchByCategory(categoryCode, x, y, r);
        
        res.json({
            success: true,
            category: category,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('카테고리 검색 오류:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 검색 중 오류가 발생했습니다.'
        });
    }
});

// 주소로 좌표 변환
app.get('/api/poi/geocode', async (req, res) => {
    const { address } = req.query;
    
    if (!address) {
        return res.status(400).json({
            success: false,
            message: '주소를 입력해주세요.'
        });
    }
    
    try {
        const result = await addressToCoord(address);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '해당 주소를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('주소 변환 오류:', error);
        res.status(500).json({
            success: false,
            message: '주소 변환 중 오류가 발생했습니다.'
        });
    }
});

// 목적지 콘텐츠 추천 (YouTube + 네이버 블로그)
app.get('/api/destination-content/:destination', (req, res) => {
    const { destination } = req.params;
    const { purpose } = req.query; // business, travel, dining
    
    if (!destination) {
        return res.status(400).json({
            success: false,
            message: '목적지를 입력해주세요.'
        });
    }
    
    // 목적별 키워드 매핑
    const purposeKeywords = {
        business: '출장 비즈니스',
        travel: '여행 관광',
        dining: '맛집 음식'
    };
    
    const keyword = purposeKeywords[purpose] || '여행';
    
    // YouTube 샘플 데이터 (실제로는 YouTube Data API v3 사용)
    const youtubeVideos = [
        {
            id: 1,
            title: `${destination} ${keyword} 완벽 가이드 | 꼭 가봐야 할 곳`,
            channel: '여행유튜버',
            thumbnail: 'https://via.placeholder.com/320x180?text=Video+1',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + keyword)}`,
            views: '12만',
            uploadDate: '2주 전',
            duration: '15:30'
        },
        {
            id: 2,
            title: `${destination} ${purpose === 'dining' ? '맛집' : '여행'} VLOG | 현지인 추천`,
            channel: '트래블러TV',
            thumbnail: 'https://via.placeholder.com/320x180?text=Video+2',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + keyword)}`,
            views: '8.5만',
            uploadDate: '1개월 전',
            duration: '22:15'
        },
        {
            id: 3,
            title: `${destination} 이것만 보면 끝! | ${keyword} 총정리`,
            channel: '여행의정석',
            thumbnail: 'https://via.placeholder.com/320x180?text=Video+3',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + keyword)}`,
            views: '15만',
            uploadDate: '3주 전',
            duration: '18:45'
        },
        {
            id: 4,
            title: `${destination} ${keyword} 리얼 후기 | 솔직 리뷰`,
            channel: '리얼여행',
            thumbnail: 'https://via.placeholder.com/320x180?text=Video+4',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + keyword)}`,
            views: '6.2만',
            uploadDate: '1주 전',
            duration: '12:20'
        },
        {
            id: 5,
            title: `${destination} ${purpose === 'business' ? '출장' : '여행'} 꿀팁 대공개`,
            channel: '스마트트래블',
            thumbnail: 'https://via.placeholder.com/320x180?text=Video+5',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + keyword)}`,
            views: '9.8만',
            uploadDate: '2주 전',
            duration: '20:10'
        }
    ];
    
    // 네이버 블로그 샘플 데이터 (실제로는 네이버 검색 API 사용)
    const naverBlogs = [
        {
            id: 1,
            title: `${destination} ${keyword} 완벽 가이드 - 3박 4일 일정`,
            blogger: '여행블로거A',
            summary: `${destination}을(를) 다녀온 후기입니다. ${keyword} 관련 정보와 꿀팁을 공유합니다. 실제 경험을 바탕으로 작성했습니다.`,
            url: `https://search.naver.com/search.naver?query=${encodeURIComponent(destination + ' ' + keyword)}`,
            date: '2024.01.15',
            thumbnail: 'https://via.placeholder.com/200x150?text=Blog+1'
        },
        {
            id: 2,
            title: `${destination} ${purpose === 'dining' ? '맛집' : '필수 코스'} 베스트 10`,
            blogger: '맛집헌터',
            summary: `현지인이 추천하는 ${destination}의 숨은 명소들을 소개합니다. ${keyword}을(를) 계획하신다면 꼭 참고하세요!`,
            url: `https://search.naver.com/search.naver?query=${encodeURIComponent(destination + ' ' + keyword)}`,
            date: '2024.01.20',
            thumbnail: 'https://via.placeholder.com/200x150?text=Blog+2'
        },
        {
            id: 3,
            title: `${destination} ${keyword} 실전 후기 | 알아두면 좋은 정보`,
            blogger: '트래블노트',
            summary: `${destination} ${keyword}을(를) 준비하면서 알게 된 유용한 정보들을 정리했습니다. 예산, 교통, 숙소 정보 포함!`,
            url: `https://search.naver.com/search.naver?query=${encodeURIComponent(destination + ' ' + keyword)}`,
            date: '2024.01.25',
            thumbnail: 'https://via.placeholder.com/200x150?text=Blog+3'
        },
        {
            id: 4,
            title: `${destination} ${purpose === 'business' ? '비즈니스' : '가족'} ${keyword} 추천`,
            blogger: '여행일기장',
            summary: `${destination}에서의 ${keyword} 경험을 상세하게 기록했습니다. 사진과 함께 보는 생생한 후기!`,
            url: `https://search.naver.com/search.naver?query=${encodeURIComponent(destination + ' ' + keyword)}`,
            date: '2024.02.01',
            thumbnail: 'https://via.placeholder.com/200x150?text=Blog+4'
        },
        {
            id: 5,
            title: `${destination} ${keyword} 가성비 좋은 코스 추천`,
            blogger: '알뜰여행',
            summary: `저렴하지만 알차게 즐길 수 있는 ${destination} ${keyword} 코스를 소개합니다. 가성비 최고!`,
            url: `https://search.naver.com/search.naver?query=${encodeURIComponent(destination + ' ' + keyword)}`,
            date: '2024.02.02',
            thumbnail: 'https://via.placeholder.com/200x150?text=Blog+5'
        }
    ];
    
    res.json({
        success: true,
        data: {
            destination,
            purpose: purpose || 'travel',
            youtube: youtubeVideos,
            blogs: naverBlogs
        }
    });
});

// ===== 챗봇 API =====

// 챗봇 메시지 처리
app.post('/api/chatbot/message', async (req, res) => {
    try {
        const { message, context, location } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: '메시지를 입력해주세요.'
            });
        }
        
        // 의도 분석 (간단한 키워드 매칭)
        const intent = analyzeIntent(message);
        
        // 의도에 따른 응답 생성
        let response = {
            success: true,
            intent: intent.type,
            message: '',
            data: null,
            quickActions: []
        };
        
        switch (intent.type) {
            case 'restaurant_search':
                // 식당 검색
                const restaurants = await searchRestaurants(intent.keywords, location);
                response.message = `"${intent.keywords.join(', ')}" 검색 결과 ${restaurants.length}개의 식당을 찾았습니다.`;
                response.data = restaurants;
                response.quickActions = [
                    { label: '지도에서 보기', action: 'show_on_map' },
                    { label: '예약하기', action: 'make_reservation' },
                    { label: '메뉴 보기', action: 'view_menu' }
                ];
                break;
                
            case 'parking_info':
                // 주차 정보
                const parkingInfo = await getParkingInfo(intent.keywords, location);
                response.message = `주차 가능한 곳을 찾았습니다.`;
                response.data = parkingInfo;
                response.quickActions = [
                    { label: '주차 예약', action: 'reserve_parking' },
                    { label: '경로 안내', action: 'navigate' }
                ];
                break;
                
            case 'menu_order':
                // 메뉴 예약
                response.message = '어떤 메뉴를 예약하시겠어요?';
                response.quickActions = [
                    { label: '인기 메뉴', action: 'popular_menu' },
                    { label: '추천 메뉴', action: 'recommended_menu' }
                ];
                break;
                
            case 'drivethru':
                // 드라이브스루
                const driveThruInfo = await getDriveThruInfo(intent.keywords, location);
                response.message = '드라이브스루 가능한 매장을 찾았습니다.';
                response.data = driveThruInfo;
                response.quickActions = [
                    { label: '메뉴 미리주문', action: 'preorder' },
                    { label: '경로 안내', action: 'navigate' }
                ];
                break;
                
            case 'reservation':
                // 예약
                response.message = '예약 정보를 알려주세요. (날짜, 시간, 인원)';
                response.quickActions = [
                    { label: '오늘', action: 'today' },
                    { label: '내일', action: 'tomorrow' },
                    { label: '이번 주말', action: 'weekend' }
                ];
                break;
                
            case 'navigation':
                // 경로 안내
                response.message = '목적지까지의 경로를 안내합니다.';
                response.quickActions = [
                    { label: '자동차', action: 'car' },
                    { label: '도보', action: 'walk' }
                ];
                break;
                
            default:
                // 기본 응답
                response.message = '무엇을 도와드릴까요? 식당 검색, 주차 정보, 예약 등을 물어보세요!';
                response.quickActions = [
                    { label: '식당 찾기', action: 'search_restaurant' },
                    { label: '주차장 찾기', action: 'search_parking' },
                    { label: '드라이브스루', action: 'drivethru' }
                ];
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: '죄송합니다. 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 의도 분석 함수
function analyzeIntent(message) {
    const msg = message.toLowerCase();
    
    const patterns = {
        restaurant_search: [/식당/, /맛집/, /음식점/, /레스토랑/, /먹/, /카페/],
        parking_info: [/주차/, /주차장/, /주차 가능/, /주차비/],
        menu_order: [/메뉴/, /주문/, /예약/, /미리/],
        drivethru: [/드라이브/, /스루/, /픽업/, /테이크/],
        reservation: [/예약/, /예약하/, /예약할/],
        navigation: [/경로/, /길/, /찾아/, /가는 법/, /어떻게/]
    };
    
    for (const [intent, keywords] of Object.entries(patterns)) {
        for (const pattern of keywords) {
            if (pattern.test(msg)) {
                // 키워드 추출
                const extracted = extractKeywords(message);
                return { type: intent, keywords: extracted };
            }
        }
    }
    
    return { type: 'unknown', keywords: [] };
}

// 키워드 추출
function extractKeywords(message) {
    // 간단한 키워드 추출 (실제로는 NLP 사용)
    const words = message.split(' ').filter(word => word.length > 1);
    return words.slice(0, 3); // 최대 3개
}

// 식당 검색 (POI 서비스 활용)
async function searchRestaurants(keywords, location) {
    try {
        const keyword = keywords.join(' ') || '맛집';
        const lat = location?.lat || 37.5665;
        const lng = location?.lng || 126.9780;
        
        // POI 서비스의 카테고리 검색 사용
        const results = await searchPOI('FD6', lat, lng, 10); // FD6 = 음식점
        
        return results.slice(0, 5).map(place => ({
            id: place.id,
            name: place.place_name,
            category: place.category_name,
            address: place.address_name,
            distance: place.distance,
            phone: place.phone,
            parking: Math.random() > 0.5, // 실제로는 DB에서
            drivethru: Math.random() > 0.7,
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            lat: parseFloat(place.y),
            lng: parseFloat(place.x)
        }));
    } catch (error) {
        console.error('Restaurant search error:', error);
        return [];
    }
}

// 주차 정보 조회
async function getParkingInfo(keywords, location) {
    const lat = location?.lat || 37.5665;
    const lng = location?.lng || 126.9780;
    
    // 주차장 검색 (실제로는 API 호출)
    return parkingLots
        .filter(lot => {
            const distance = calculateDistance(lat, lng, lot.lat, lot.lng);
            return distance < 2; // 2km 이내
        })
        .slice(0, 3)
        .map(lot => ({
            ...lot,
            distance: calculateDistance(lat, lng, lot.lat, lot.lng).toFixed(2)
        }));
}

// 드라이브스루 정보
async function getDriveThruInfo(keywords, location) {
    const lat = location?.lat || 37.5665;
    const lng = location?.lng || 126.9780;
    
    // 드라이브스루 가능한 매장 검색
    const restaurants = await searchRestaurants(keywords, location);
    return restaurants.filter(r => r.drivethru);
}

// 챗봇 식당 예약 API
app.post('/api/chatbot/reservation', async (req, res) => {
    try {
        const { restaurantId, date, time, people, menu, notes } = req.body;
        
        if (!restaurantId || !date || !time || !people) {
            return res.status(400).json({
                success: false,
                message: '예약 정보를 모두 입력해주세요.'
            });
        }
        
        // 예약 생성 (실제로는 DB 저장)
        const reservation = {
            id: Date.now(),
            restaurantId,
            date,
            time,
            people,
            menu: menu || [],
            notes: notes || '',
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        res.status(201).json({
            success: true,
            message: '예약이 완료되었습니다.',
            data: reservation
        });
        
    } catch (error) {
        console.error('Reservation error:', error);
        res.status(500).json({
            success: false,
            message: '예약 처리 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 챗봇 메뉴 미리주문 API
app.post('/api/chatbot/preorder', async (req, res) => {
    try {
        const { restaurantId, items, pickupTime, notes } = req.body;
        
        if (!restaurantId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: '주문 정보를 입력해주세요.'
            });
        }
        
        // 미리주문 생성
        const order = {
            id: Date.now(),
            restaurantId,
            items,
            pickupTime: pickupTime || '30분 후',
            notes: notes || '',
            status: 'preparing',
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            createdAt: new Date().toISOString()
        };
        
        res.status(201).json({
            success: true,
            message: '미리주문이 완료되었습니다. 픽업 시간에 방문해주세요.',
            data: order
        });
        
    } catch (error) {
        console.error('Preorder error:', error);
        res.status(500).json({
            success: false,
            message: '주문 처리 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 헬스 체크
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '서버가 정상적으로 실행 중입니다.',
        timestamp: new Date().toISOString()
    });
});

// 루트 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 404 에러 핸들링
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 리소스를 찾을 수 없습니다.'
    });
});

// 에러 핸들링
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 마이맵봇 (MyMapBot) 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📍 http://localhost:${PORT}`);
});

export default app;
