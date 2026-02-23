// app/api/drt/route.ts
// ============================================================
// DRT Dispatch API — AI Vehicle Allocation
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { allocateVehicle } from '@/lib/dispatch-engine';
import { POHANG_LOCATIONS } from '@/lib/transit-api';
import { Vehicle, DispatchRequest, ApiResponse, DispatchResult } from '@/types';

export const runtime = 'edge';

// Simulation vehicle pool (replace with Firestore in production)
const SIM_VEHICLES: Vehicle[] = [
  { id:'MB-001', type:'전기차 DRT', status:'available', location:{lat:36.0320,lng:129.3650}, locationName:'포항역', driverName:'김민준', capacity:4, currentPassengers:0, etaMinutes:0, batteryLevel:85, isEV:true, rating:4.8, heading:90, speed:0, lastUpdated:new Date() },
  { id:'MB-002', type:'미니밴 DRT', status:'available', location:{lat:35.9877,lng:129.4200}, locationName:'포항공항', driverName:'이수연', capacity:7, currentPassengers:2, etaMinutes:0, batteryLevel:72, isEV:true, rating:4.9, heading:180, speed:35, lastUpdated:new Date() },
  { id:'MB-003', type:'전기버스', status:'available', location:{lat:36.0097,lng:129.3543}, locationName:'포스코', driverName:'박지혁', capacity:12, currentPassengers:0, etaMinutes:0, batteryLevel:91, isEV:true, rating:4.7, heading:45, speed:0, lastUpdated:new Date() },
  { id:'MB-004', type:'택시', status:'available', location:{lat:36.0320,lng:129.3600}, locationName:'포항시청', driverName:'최동현', capacity:4, currentPassengers:0, etaMinutes:0, isEV:false, rating:4.6, heading:270, speed:0, lastUpdated:new Date() },
  { id:'MB-005', type:'전기차 DRT', status:'available', location:{lat:36.1039,lng:129.3887}, locationName:'한동대', driverName:'정유나', capacity:4, currentPassengers:0, etaMinutes:0, batteryLevel:68, isEV:true, rating:4.9, heading:0, speed:0, lastUpdated:new Date() },
  { id:'MB-006', type:'프리미엄 세단', status:'available', location:{lat:36.0628,lng:129.3857}, locationName:'영일대', driverName:'강태윤', capacity:4, currentPassengers:0, etaMinutes:0, isEV:false, rating:5.0, heading:135, speed:0, lastUpdated:new Date() },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pickupKey, dropoffKey,
      pickupLat, pickupLng,
      dropoffLat, dropoffLng,
      passengers = 1,
      priority = 'nearest',
      userId,
    } = body;

    // Resolve pickup/dropoff
    const pickupLoc = pickupKey && POHANG_LOCATIONS[pickupKey]
      ? { lat: POHANG_LOCATIONS[pickupKey].lat, lng: POHANG_LOCATIONS[pickupKey].lng }
      : { lat: pickupLat ?? 36.0320, lng: pickupLng ?? 129.3650 };

    const dropoffLoc = dropoffKey && POHANG_LOCATIONS[dropoffKey]
      ? { lat: POHANG_LOCATIONS[dropoffKey].lat, lng: POHANG_LOCATIONS[dropoffKey].lng }
      : { lat: dropoffLat ?? 35.9877, lng: dropoffLng ?? 129.4200 };

    const pickupName = pickupKey ? POHANG_LOCATIONS[pickupKey]?.name ?? '출발지' : '출발지';
    const dropoffName = dropoffKey ? POHANG_LOCATIONS[dropoffKey]?.name ?? '목적지' : '목적지';

    const request: DispatchRequest = {
      pickupLocation: pickupLoc,
      pickupName,
      dropoffLocation: dropoffLoc,
      dropoffName,
      passengers: Math.max(1, parseInt(passengers)),
      requestedAt: new Date(),
      priority,
      userId,
    };

    // In production: fetch vehicles from Firestore
    const result = allocateVehicle(SIM_VEHICLES, request);

    if (!result || result.status === 'no_vehicle') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '현재 배차 가능한 차량이 없습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date().toISOString(),
        source: 'simulation',
      }, { status: 503 });
    }

    // Update vehicle status in simulation pool
    const idx = SIM_VEHICLES.findIndex((v) => v.id === result.assignedVehicle.id);
    if (idx >= 0) {
      SIM_VEHICLES[idx].status = 'busy';
      SIM_VEHICLES[idx].currentPassengers += request.passengers;
    }

    return NextResponse.json<ApiResponse<DispatchResult>>({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      source: 'simulation',
    });
  } catch (err) {
    console.error('[API/drt]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '배차 처리 중 오류가 발생했습니다',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json<ApiResponse<Vehicle[]>>({
    success: true,
    data: SIM_VEHICLES.map((v) => ({
      ...v,
      // Add slight randomization for demo
      location: {
        lat: v.location.lat + (Math.random() - 0.5) * 0.005,
        lng: v.location.lng + (Math.random() - 0.5) * 0.005,
      },
      lastUpdated: new Date(),
    })),
    timestamp: new Date().toISOString(),
    source: 'simulation',
  });
}
