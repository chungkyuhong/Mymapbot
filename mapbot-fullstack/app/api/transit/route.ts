// app/api/transit/route.ts
// ============================================================
// Transit Route Search API — Kakao + ODsay 통합
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { fetchOdsayTransitRoute, fetchKakaoCarRoute, POHANG_LOCATIONS } from '@/lib/transit-api';
import { kakaoGeocode } from '@/lib/kakao-map';
import { ApiResponse, RouteOption, LatLng } from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originKey, destinationKey,
      originLat, originLng, destLat, destLng,
      originAddress, destAddress,
      priority = 'fastest',
      passengers = 1,
    } = body;

    // Resolve coordinates
    let origin: LatLng | null = null;
    let destination: LatLng | null = null;

    if (originKey && POHANG_LOCATIONS[originKey]) {
      origin = { lat: POHANG_LOCATIONS[originKey].lat, lng: POHANG_LOCATIONS[originKey].lng };
    } else if (originLat && originLng) {
      origin = { lat: originLat, lng: originLng };
    } else if (originAddress) {
      origin = await kakaoGeocode(originAddress);
    }

    if (destinationKey && POHANG_LOCATIONS[destinationKey]) {
      destination = { lat: POHANG_LOCATIONS[destinationKey].lat, lng: POHANG_LOCATIONS[destinationKey].lng };
    } else if (destLat && destLng) {
      destination = { lat: destLat, lng: destLng };
    } else if (destAddress) {
      destination = await kakaoGeocode(destAddress);
    }

    if (!origin || !destination) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '출발지 또는 목적지 좌표를 확인할 수 없습니다',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Fetch from ODsay (public transit)
    const [transitRoutes, carRouteData] = await Promise.allSettled([
      fetchOdsayTransitRoute({
        SX: origin.lng, SY: origin.lat,
        EX: destination.lng, EY: destination.lat,
        OPT: priority === 'fastest' ? 0 : priority === 'cheapest' ? 2 : 0,
      }),
      fetchKakaoCarRoute(origin, destination),
    ]);

    const routes: RouteOption[] = transitRoutes.status === 'fulfilled'
      ? transitRoutes.value
      : [];

    // Add car/taxi route from Kakao
    if (carRouteData.status === 'fulfilled' && carRouteData.value) {
      const kakaoRoute = carRouteData.value;
      const section = kakaoRoute?.routes?.[0];
      if (section) {
        const summary = section.summary;
        routes.push({
          id: 'kakao-car-1',
          rank: routes.length + 1,
          label: '🚖 택시 직행 (카카오 길찾기)',
          totalDurationMinutes: Math.round((summary?.duration ?? 1800) / 60),
          totalDistanceKm: Math.round((summary?.distance ?? 10000) / 100) / 10,
          totalCost: Math.round((summary?.distance ?? 10000) / 1000 * 1050 + 3800),
          ecoScore: 65,
          comfortScore: 95,
          steps: [{
            mode: 'taxi',
            from: '출발지',
            to: '목적지',
            durationMinutes: Math.round((summary?.duration ?? 1800) / 60),
            distanceKm: Math.round((summary?.distance ?? 10000) / 100) / 10,
            instructions: '택시/카카오T 직행',
            path: extractKakaoPath(section.sections?.[0]),
          }],
          transferCount: 0,
          carbonGrams: Math.round((summary?.distance ?? 10000) / 1000 * 120),
          muPointEarn: Math.round((Math.round((summary?.distance ?? 10000) / 1000 * 1050 + 3800)) * 0.05),
        });
      }
    }

    // Sort by priority
    routes.sort((a, b) => {
      if (priority === 'fastest') return a.totalDurationMinutes - b.totalDurationMinutes;
      if (priority === 'cheapest') return a.totalCost - b.totalCost;
      if (priority === 'eco') return b.ecoScore - a.ecoScore;
      if (priority === 'comfort') return b.comfortScore - a.comfortScore;
      return a.rank - b.rank;
    });

    // Re-rank
    routes.forEach((r, i) => { r.rank = i + 1; });

    const source = process.env.ODSAY_API_KEY && process.env.ODSAY_API_KEY !== 'your_odsay_api_key_here'
      ? 'odsay' : 'simulation';

    return NextResponse.json<ApiResponse<RouteOption[]>>({
      success: true,
      data: routes,
      timestamp: new Date().toISOString(),
      source,
    });
  } catch (err) {
    console.error('[API/transit]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '경로 탐색 중 오류가 발생했습니다',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function extractKakaoPath(section: Record<string, unknown>): Array<{ lat: number; lng: number }> {
  const roads = (section?.roads as Array<Record<string, unknown>>) ?? [];
  const path: Array<{ lat: number; lng: number }> = [];
  roads.forEach((road) => {
    const vertexes = (road.vertexes as number[]) ?? [];
    for (let i = 0; i < vertexes.length; i += 2) {
      path.push({ lng: vertexes[i], lat: vertexes[i + 1] });
    }
  });
  return path;
}
