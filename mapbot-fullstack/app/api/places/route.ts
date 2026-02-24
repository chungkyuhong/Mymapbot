// app/api/places/route.ts
// ============================================================
// Kakao Places Search API
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { kakaoSearchPlaces, kakaoGeocode } from '@/lib/kakao-map';
import { ApiResponse, KakaoPlace } from '@/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const x = searchParams.get('x') ?? undefined;
  const y = searchParams.get('y') ?? undefined;
  const type = searchParams.get('type') ?? 'keyword';

  if (!query) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '검색어를 입력해주세요',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }

  try {
    if (type === 'address') {
      const coords = await kakaoGeocode(query);
      return NextResponse.json<ApiResponse<typeof coords>>({
        success: true,
        data: coords,
        timestamp: new Date().toISOString(),
        source: 'kakao',
      });
    }

    const places = await kakaoSearchPlaces(query, x, y);
    return NextResponse.json<ApiResponse<KakaoPlace[]>>({
      success: true,
      data: places,
      timestamp: new Date().toISOString(),
      source: 'kakao',
    });
  } catch (err) {
    console.error('[API/places]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '장소 검색 중 오류가 발생했습니다',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
