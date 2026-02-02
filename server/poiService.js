import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || 'demo_key_for_testing';
const KAKAO_API_BASE_URL = 'https://dapi.kakao.com/v2/local';

/**
 * 카카오맵 API를 사용한 POI 검색
 * @param {string} query - 검색 키워드
 * @param {number} x - 경도 (longitude)
 * @param {number} y - 위도 (latitude)
 * @param {number} radius - 검색 반경 (미터, 최대 20000)
 * @param {string} category - 카테고리 (선택)
 * @returns {Promise<Array>} POI 목록
 */
export async function searchPOI(query, x = null, y = null, radius = 5000, category = null) {
    try {
        const params = {
            query: query,
            size: 15, // 최대 15개 결과
            sort: x && y ? 'distance' : 'accuracy' // 좌표가 있으면 거리순, 없으면 정확도순
        };

        if (x && y) {
            params.x = x;
            params.y = y;
            params.radius = Math.min(radius, 20000); // 최대 20km
        }

        if (category) {
            params.category_group_code = category;
        }

        const response = await axios.get(`${KAKAO_API_BASE_URL}/search/keyword.json`, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            },
            params: params
        });

        return response.data.documents.map(place => ({
            id: place.id,
            name: place.place_name,
            category: place.category_name,
            phone: place.phone || '',
            address: place.address_name,
            roadAddress: place.road_address_name || '',
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            distance: place.distance ? parseInt(place.distance) : null,
            placeUrl: place.place_url,
            categoryGroupCode: place.category_group_code,
            categoryGroupName: place.category_group_name
        }));
    } catch (error) {
        console.error('카카오 POI 검색 실패:', error.message);
        
        // API 키가 없거나 오류 시 샘플 데이터 반환
        return generateSamplePOI(query, x, y);
    }
}

/**
 * 카테고리별 POI 검색
 * @param {string} category - 카테고리 코드 (MT1, CS2, PS3, SC4, AC5, PK6, OL7, SW8, BK9, CT1, AG2, PO3, AT4, AD5, FD6, CE7, HP8, PM9)
 * @param {number} x - 경도
 * @param {number} y - 위도
 * @param {number} radius - 검색 반경
 * @returns {Promise<Array>} POI 목록
 */
export async function searchByCategory(category, x, y, radius = 5000) {
    try {
        const response = await axios.get(`${KAKAO_API_BASE_URL}/search/category.json`, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            },
            params: {
                category_group_code: category,
                x: x,
                y: y,
                radius: Math.min(radius, 20000),
                size: 15,
                sort: 'distance'
            }
        });

        return response.data.documents.map(place => ({
            id: place.id,
            name: place.place_name,
            category: place.category_name,
            phone: place.phone || '',
            address: place.address_name,
            roadAddress: place.road_address_name || '',
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            distance: place.distance ? parseInt(place.distance) : null,
            placeUrl: place.place_url,
            categoryGroupCode: place.category_group_code,
            categoryGroupName: place.category_group_name
        }));
    } catch (error) {
        console.error('카카오 카테고리 검색 실패:', error.message);
        return generateSamplePOIByCategory(category, x, y);
    }
}

/**
 * 주소로 좌표 검색
 * @param {string} address - 주소
 * @returns {Promise<Object>} 좌표 정보
 */
export async function addressToCoord(address) {
    try {
        const response = await axios.get(`${KAKAO_API_BASE_URL}/search/address.json`, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            },
            params: {
                query: address
            }
        });

        if (response.data.documents.length === 0) {
            return null;
        }

        const doc = response.data.documents[0];
        return {
            address: doc.address_name,
            roadAddress: doc.road_address?.address_name || '',
            lat: parseFloat(doc.y),
            lng: parseFloat(doc.x)
        };
    } catch (error) {
        console.error('주소 검색 실패:', error.message);
        return null;
    }
}

/**
 * 샘플 POI 데이터 생성 (API 실패 시 대체용)
 */
function generateSamplePOI(query, x, y) {
    const baseLat = y || 37.5665;
    const baseLng = x || 126.9780;
    
    const samples = [];
    for (let i = 0; i < 5; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.01;
        const offsetLng = (Math.random() - 0.5) * 0.01;
        
        samples.push({
            id: `sample_${i}`,
            name: `${query} ${i + 1}`,
            category: '샘플 카테고리',
            phone: '02-1234-5678',
            address: '서울특별시 중구 세종대로 110',
            roadAddress: '서울특별시 중구 세종대로 110',
            lat: baseLat + offsetLat,
            lng: baseLng + offsetLng,
            distance: Math.floor(Math.random() * 5000),
            placeUrl: '#',
            categoryGroupCode: 'CE7',
            categoryGroupName: '카페'
        });
    }
    
    return samples;
}

/**
 * 카테고리별 샘플 POI 데이터 생성
 */
function generateSamplePOIByCategory(category, x, y) {
    const categoryNames = {
        'MT1': '대형마트',
        'CS2': '편의점',
        'PS3': '어린이집/유치원',
        'SC4': '학교',
        'AC5': '학원',
        'PK6': '주차장',
        'OL7': '주유소',
        'SW8': '지하철역',
        'BK9': '은행',
        'CT1': '문화시설',
        'AG2': '중개업소',
        'PO3': '공공기관',
        'AT4': '관광명소',
        'AD5': '숙박',
        'FD6': '음식점',
        'CE7': '카페',
        'HP8': '병원',
        'PM9': '약국'
    };
    
    return generateSamplePOI(categoryNames[category] || '장소', x, y);
}

// 카테고리 코드 매핑
export const CATEGORY_CODES = {
    mart: 'MT1',
    convenience: 'CS2',
    parking: 'PK6',
    gas_station: 'OL7',
    subway: 'SW8',
    bank: 'BK9',
    culture: 'CT1',
    tourism: 'AT4',
    accommodation: 'AD5',
    restaurant: 'FD6',
    cafe: 'CE7',
    hospital: 'HP8',
    pharmacy: 'PM9'
};
