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

// API 엔드포인트

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

// 주차장 검색
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
