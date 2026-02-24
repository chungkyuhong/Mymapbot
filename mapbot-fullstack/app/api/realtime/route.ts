// app/api/realtime/route.ts
// ============================================================
// Realtime Vehicles & Heatmap API (WebSocket fallback via SSE)
// ============================================================
import { NextRequest } from 'next/server';
import { POHANG_LOCATIONS } from '@/lib/transit-api';
import { forecastDemand } from '@/lib/dispatch-engine';

export const runtime = 'edge';

// Server-Sent Events for real-time vehicle positions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'vehicles';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        let data: string;

        if (type === 'vehicles') {
          data = JSON.stringify(generateLiveVehicles());
        } else if (type === 'heatmap') {
          const hour = new Date().getHours();
          const dow = new Date().getDay();
          const points = forecastDemand(hour, dow, POHANG_HEATMAP_SOURCES);
          data = JSON.stringify(points);
        } else {
          data = JSON.stringify({ timestamp: new Date().toISOString() });
        }

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        // Auto-close after 300 events (~5 min)
        if (count >= 300) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

// ── Simulation Data Generators ────────────────────────────────
let vehicleStates = Object.entries(POHANG_LOCATIONS)
  .filter(([k]) => !['seoul_station', 'incheon_airport'].includes(k))
  .slice(0, 8)
  .map(([, loc], i) => ({
    id: `MB-${String(i + 1).padStart(3, '0')}`,
    type: ['전기차 DRT', '미니밴 DRT', '전기버스', '택시', '전기차 DRT', '프리미엄', '전기차 DRT', '미니밴 DRT'][i],
    status: i < 5 ? 'available' : i === 5 ? 'busy' : 'offline',
    lat: loc.lat,
    lng: loc.lng,
    heading: Math.floor(Math.random() * 360),
    speed: i === 5 ? 42 : 0,
    pax: i === 5 ? 2 : 0,
    battery: 60 + Math.floor(Math.random() * 40),
    locationName: loc.name,
  }));

function generateLiveVehicles() {
  vehicleStates = vehicleStates.map((v) => {
    if (v.status === 'busy') {
      const rad = (v.heading * Math.PI) / 180;
      const speed = 0.0001 + Math.random() * 0.0002;
      return {
        ...v,
        lat: Math.max(35.85, Math.min(36.15, v.lat + Math.cos(rad) * speed)),
        lng: Math.max(129.2, Math.min(129.5, v.lng + Math.sin(rad) * speed)),
        heading: (v.heading + (Math.random() - 0.5) * 10 + 360) % 360,
        speed: 30 + Math.floor(Math.random() * 30),
      };
    }
    return v;
  });
  return { vehicles: vehicleStates, timestamp: new Date().toISOString() };
}

const POHANG_HEATMAP_SOURCES = Object.entries(POHANG_LOCATIONS)
  .filter(([k]) => !['seoul_station', 'incheon_airport'].includes(k))
  .map(([, loc]) => ({
    location: { lat: loc.lat, lng: loc.lng },
    label: loc.name,
    baseDemand: 2 + Math.floor(Math.random() * 6),
  }));
