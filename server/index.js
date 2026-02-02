import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

// 특정 주차장 조회
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
    
    res.json({
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

// 주변 시설 검색
app.get('/api/nearby/:category', (req, res) => {
    const { category } = req.params;
    const { lat, lng, radius } = req.query;
    
    // 샘플 주변 시설 데이터
    const places = {
        gas: [
            { id: 1, name: 'SK 주유소', lat: 37.5680, lng: 126.9800, distance: 0.8 },
            { id: 2, name: 'GS 칼텍스', lat: 37.5650, lng: 126.9750, distance: 1.2 }
        ],
        hospital: [
            { id: 1, name: '서울대병원', lat: 37.5790, lng: 126.9940, distance: 2.1 },
            { id: 2, name: '삼성서울병원', lat: 37.4880, lng: 127.0857, distance: 3.5 }
        ],
        restaurant: [
            { id: 1, name: '한식당', lat: 37.5670, lng: 126.9790, distance: 0.5 },
            { id: 2, name: '이탈리안 레스토랑', lat: 37.5660, lng: 126.9770, distance: 0.7 }
        ],
        cafe: [
            { id: 1, name: '스타벅스', lat: 37.5675, lng: 126.9785, distance: 0.3 },
            { id: 2, name: '이디야', lat: 37.5655, lng: 126.9775, distance: 0.6 }
        ],
        store: [
            { id: 1, name: 'CU', lat: 37.5668, lng: 126.9782, distance: 0.2 },
            { id: 2, name: 'GS25', lat: 37.5662, lng: 126.9778, distance: 0.4 }
        ]
    };
    
    res.json({
        success: true,
        data: places[category] || []
    });
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
    
    res.json({
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

// 여행 목적별 추천 조회
app.get('/api/recommendations/:purpose', (req, res) => {
    const { purpose } = req.params;
    const { lat, lng } = req.query;
    
    if (!recommendations[purpose]) {
        return res.status(404).json({
            success: false,
            message: '해당 목적의 추천 정보를 찾을 수 없습니다.'
        });
    }
    
    // 거리 계산 (간단한 유클리드 거리)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const dx = lat2 - lat1;
        const dy = lng2 - lng1;
        return Math.sqrt(dx * dx + dy * dy) * 111; // 대략적인 km 변환
    };
    
    // 현재 위치가 제공된 경우 거리 추가
    if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        
        const data = JSON.parse(JSON.stringify(recommendations[purpose]));
        
        // 각 카테고리의 항목에 거리 추가
        Object.keys(data).forEach(category => {
            data[category] = data[category].map(item => ({
                ...item,
                distance: calculateDistance(userLat, userLng, item.lat, item.lng).toFixed(1)
            })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        });
        
        return res.json({ success: true, data });
    }
    
    res.json({ success: true, data: recommendations[purpose] });
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
    console.log(`🚀 모빌리티 플랫폼 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📍 http://localhost:${PORT}`);
});

export default app;
