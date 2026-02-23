// ============================================================
// ODsay & 공공데이터 API — Real Public Transit Data
// ============================================================
import { RouteOption, TransitStep, TransitMode, LatLng } from '@/types';

const ODSAY_BASE = 'https://api.odsay.com/v1/api';
const PUBLIC_DATA_BASE = 'https://apis.data.go.kr/1613000';

// ── ODsay 대중교통 경로 탐색 ─────────────────────────────────
export interface OdsayRouteParams {
  SX: number;   // 출발지 경도
  SY: number;   // 출발지 위도
  EX: number;   // 목적지 경도
  EY: number;   // 목적지 위도
  OPT?: number; // 0: 최소시간, 1: 최소환승, 2: 최소도보
  SearchType?: number; // 0: 도시내, 1: 도시간
  SearchPathType?: number; // 0: 전체, 1: 지하철, 2: 버스
}

export async function fetchOdsayTransitRoute(
  params: OdsayRouteParams
): Promise<RouteOption[]> {
  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey || apiKey === 'your_odsay_api_key_here') {
    return generateSimulationRoutes(params);
  }
  try {
    const searchType = params.SearchType ?? 0;
    const endpoint = searchType === 1 ? 'searchPubTransPathT' : 'searchPubTransPath';
    const url = new URL(`${ODSAY_BASE}/${endpoint}`);
    Object.entries({ ...params, apiKey, SearchType: searchType }).forEach(([k, v]) => {
      url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`ODsay API error: ${res.status}`);
    const json = await res.json();
    return parseOdsayResponse(json);
  } catch (err) {
    console.error('[ODsay] API call failed, using simulation:', err);
    return generateSimulationRoutes(params);
  }
}

function parseOdsayResponse(json: Record<string, unknown>): RouteOption[] {
  const result = json?.result as Record<string, unknown>;
  const path = result?.path as Array<Record<string, unknown>>;
  if (!path?.length) return [];

  return path.slice(0, 3).map((p: Record<string, unknown>, i: number) => {
    const info = p.info as Record<string, unknown>;
    const subPath = (p.subPath as Array<Record<string, unknown>>) ?? [];
    const steps: TransitStep[] = subPath.map((sp: Record<string, unknown>) => {
      const trafficType = sp.trafficType as number;
      const modeMap: Record<number, TransitMode> = { 1: 'subway', 2: 'bus', 3: 'walk' };
      const mode: TransitMode = modeMap[trafficType] ?? 'mixed';
      const lane = (sp.lane as Array<Record<string, unknown>>)?.[0];
      return {
        mode,
        from: ((sp.startName ?? '') as string),
        to: ((sp.endName ?? '') as string),
        lineName: (lane?.busNo ?? lane?.name ?? '') as string,
        durationMinutes: Math.round((sp.sectionTime as number ?? 0)),
        distanceKm: Math.round((sp.distance as number ?? 0)) / 1000,
        instructions: buildInstruction(mode, sp),
        path: parsePolyline(sp.passShape as Record<string, string>),
      };
    });

    const totalTime = info?.totalTime as number ?? 30;
    const payment = info?.payment as number ?? 1500;
    const totalDistance = (info?.totalDistance as number ?? 10000) / 1000;

    return {
      id: `odsay-${i}`,
      rank: i + 1,
      label: `ODsay 경로 ${i + 1}`,
      totalDurationMinutes: totalTime,
      totalDistanceKm: totalDistance,
      totalCost: payment,
      ecoScore: 92 - i * 5,
      comfortScore: 75 - i * 8,
      steps,
      transferCount: info?.transferCount as number ?? 0,
      carbonGrams: Math.round(totalDistance * 21),
      muPointEarn: Math.round(payment * 0.05),
    };
  });
}

function buildInstruction(mode: TransitMode, sp: Record<string, unknown>): string {
  const lane = (sp.lane as Array<Record<string, unknown>>)?.[0];
  if (mode === 'bus') return `${lane?.busNo ?? '버스'} 탑승 → ${sp.stationCount ?? 0}정거장`;
  if (mode === 'subway') return `${lane?.name ?? '지하철'} 탑승 → ${sp.stationCount ?? 0}역`;
  if (mode === 'walk') return `도보 ${sp.sectionTime ?? 0}분`;
  return `이동 ${sp.sectionTime ?? 0}분`;
}

function parsePolyline(passShape?: Record<string, string>): LatLng[] {
  if (!passShape?.linestring) return [];
  try {
    return passShape.linestring.split(' ').map((p: string) => {
      const [lng, lat] = p.split(',').map(Number);
      return { lat, lng };
    });
  } catch { return []; }
}

// ── 공공데이터포털 실시간 버스 위치 ─────────────────────────
export async function fetchRealtimeBusLocations(cityCode: string, routeId: string) {
  const key = process.env.PUBLIC_DATA_BUS_KEY;
  if (!key || key === 'your_public_data_portal_key_here') {
    return generateSimBusLocations(routeId);
  }
  try {
    const url = `${PUBLIC_DATA_BASE}/BusLcInfoInqireService/getRouteAcctoBusLcList?serviceKey=${key}&cityCode=${cityCode}&routeId=${routeId}&_type=json`;
    const res = await fetch(url, { next: { revalidate: 10 } });
    const data = await res.json();
    return data?.response?.body?.items?.item ?? [];
  } catch (err) {
    console.error('[PublicData] Bus location error:', err);
    return generateSimBusLocations(routeId);
  }
}

// 포항시 버스 노선 (공공데이터 실 연동)
export async function fetchPolyangBusRoutes() {
  const key = process.env.PUBLIC_DATA_BUS_KEY;
  if (!key || key === 'your_public_data_portal_key_here') {
    return POHANG_BUS_ROUTES;
  }
  // 경상북도 포항시 cityCode: 37050
  try {
    const url = `${PUBLIC_DATA_BASE}/BusRouteInfoInqireService/getRouteNoList?serviceKey=${key}&cityCode=37050&_type=json&numOfRows=20`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    const items = data?.response?.body?.items?.item ?? [];
    if (items.length) return items;
  } catch (err) {
    console.error('[PublicData] Bus routes error:', err);
  }
  return POHANG_BUS_ROUTES;
}

// ── 카카오 모빌리티 자동차 길찾기 (서버사이드) ────────────────
export async function fetchKakaoCarRoute(origin: LatLng, destination: LatLng) {
  const key = process.env.KAKAO_REST_API_KEY ?? '5fb47e56131ad4934b7cff2f8b8e3cac';
  if (!key) return null;
  try {
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}&priority=RECOMMEND`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('[Kakao] Car route error:', err);
    return null;
  }
}

// ── Simulation Fallback ───────────────────────────────────────
function generateSimulationRoutes(params: OdsayRouteParams): RouteOption[] {
  const distKm = Math.round(
    Math.sqrt(Math.pow(params.EX - params.SX, 2) + Math.pow(params.EY - params.SY, 2)) * 111
  ) || 15;

  const path = generateSamplePath(
    { lat: params.SY, lng: params.SX },
    { lat: params.EY, lng: params.EX }
  );

  return [
    {
      id: 'sim-drt-1',
      rank: 1,
      label: 'DRT 직행 (AI 추천)',
      totalDurationMinutes: Math.round(distKm * 2.2),
      totalDistanceKm: distKm,
      totalCost: Math.round(distKm * 900 + 1200),
      ecoScore: 90,
      comfortScore: 88,
      steps: [
        { mode: 'drt', from: '출발지', to: '목적지', durationMinutes: Math.round(distKm * 2.2), distanceKm: distKm, instructions: 'DRT 탑승 → 직행', path },
      ],
      transferCount: 0,
      carbonGrams: Math.round(distKm * 45),
      muPointEarn: Math.round((distKm * 900 + 1200) * 0.05),
    },
    {
      id: 'sim-bus-1',
      rank: 2,
      label: '버스 · 복합 노선',
      totalDurationMinutes: Math.round(distKm * 3.5),
      totalDistanceKm: distKm * 1.2,
      totalCost: 1500,
      ecoScore: 96,
      comfortScore: 65,
      steps: [
        { mode: 'walk', from: '출발지', to: '버스정류장', durationMinutes: 5, distanceKm: 0.3, instructions: '도보 5분', path: [] },
        { mode: 'bus', from: '버스정류장', to: '환승정류장', lineName: '100번', durationMinutes: Math.round(distKm * 2), distanceKm: distKm * 0.9, instructions: '100번 탑승', path },
        { mode: 'walk', from: '환승정류장', to: '목적지', durationMinutes: 8, distanceKm: 0.5, instructions: '도보 8분', path: [] },
      ],
      transferCount: 1,
      carbonGrams: Math.round(distKm * 21),
      muPointEarn: Math.round(1500 * 0.05),
    },
    {
      id: 'sim-taxi-1',
      rank: 3,
      label: '택시 직행',
      totalDurationMinutes: Math.round(distKm * 1.8),
      totalDistanceKm: distKm,
      totalCost: Math.round(distKm * 1100 + 3800),
      ecoScore: 65,
      comfortScore: 95,
      steps: [
        { mode: 'taxi', from: '출발지', to: '목적지', durationMinutes: Math.round(distKm * 1.8), distanceKm: distKm, instructions: '택시 직행', path },
      ],
      transferCount: 0,
      carbonGrams: Math.round(distKm * 120),
      muPointEarn: Math.round((distKm * 1100 + 3800) * 0.05),
    },
  ];
}

function generateSamplePath(start: LatLng, end: LatLng): LatLng[] {
  const steps = 8;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const jitter = (Math.random() - 0.5) * 0.01;
    return {
      lat: start.lat + (end.lat - start.lat) * t + jitter,
      lng: start.lng + (end.lng - start.lng) * t + jitter,
    };
  });
}

function generateSimBusLocations(routeId: string) {
  return Array.from({ length: 5 }, (_, i) => ({
    vehicleNo: `포항${routeId}-${i + 1}`,
    gpsLati: 36.0 + Math.random() * 0.1,
    gpsLong: 129.3 + Math.random() * 0.1,
    remainSeatCnt: Math.floor(Math.random() * 20),
    nodeName: `정류장 ${i + 1}`,
    routeId,
  }));
}

// ── Static Data (Pohang) ──────────────────────────────────────
export const POHANG_LOCATIONS: Record<string, LatLng & { name: string }> = {
  pohang_station:  { lat: 36.0320, lng: 129.3650, name: '포항역' },
  pohang_airport:  { lat: 35.9877, lng: 129.4200, name: '포항공항' },
  pohang_city:     { lat: 36.0320, lng: 129.3600, name: '포항시청' },
  posco:           { lat: 36.0097, lng: 129.3543, name: '포스코 본사' },
  handong_univ:    { lat: 36.1039, lng: 129.3887, name: '한동대학교' },
  yeongil_beach:   { lat: 36.0628, lng: 129.3857, name: '영일대해수욕장' },
  jukdo_market:    { lat: 36.0245, lng: 129.3650, name: '죽도시장' },
  sungmo_hospital: { lat: 36.0189, lng: 129.3421, name: '포항성모병원' },
  seoul_station:   { lat: 37.5547, lng: 126.9707, name: '서울역' },
  incheon_airport: { lat: 37.4602, lng: 126.4407, name: '인천국제공항' },
};

const POHANG_BUS_ROUTES = [
  { routeId: '37050001', routeNo: '100', routeTp: '일반버스', startNodeName: '포항역', endNodeName: '포항공항' },
  { routeId: '37050002', routeNo: '200', routeTp: '일반버스', startNodeName: '죽도시장', endNodeName: '한동대' },
  { routeId: '37050003', routeNo: '300', routeTp: '좌석버스', startNodeName: '포항역', endNodeName: '영일대' },
  { routeId: '37050004', routeNo: 'DRT-1', routeTp: 'DRT', startNodeName: '포항시청', endNodeName: '포항공항' },
];
