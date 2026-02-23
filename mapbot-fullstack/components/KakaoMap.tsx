'use client';
// ============================================================
// KakaoMap Component — Real Map Integration
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import { loadKakaoMapSDK, KakaoMapManager, isKakaoLoaded } from '@/lib/kakao-map';
import { LatLng, RouteOption, Vehicle, HeatmapPoint } from '@/types';

interface KakaoMapProps {
  center?: LatLng;
  level?: number;
  vehicles?: Vehicle[];
  routeOptions?: RouteOption[];
  selectedRoute?: RouteOption | null;
  heatmapPoints?: HeatmapPoint[];
  mode?: 'route' | 'fleet' | 'heatmap';
  originName?: string;
  destName?: string;
  className?: string;
}

export default function KakaoMap({
  center = { lat: 36.0320, lng: 129.3650 },
  level = 7,
  vehicles = [],
  routeOptions = [],
  selectedRoute = null,
  heatmapPoints = [],
  mode = 'route',
  originName = '출발지',
  destName = '목적지',
  className = '',
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<KakaoMapManager>(new KakaoMapManager());
  const [mapReady, setMapReady] = useState(false);
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  // Load SDK
  useEffect(() => {
    loadKakaoMapSDK()
      .then(() => {
        setSdkStatus(isKakaoLoaded() ? 'ready' : 'fallback');
      })
      .catch(() => setSdkStatus('fallback'));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || sdkStatus === 'loading') return;
    if (sdkStatus === 'fallback') { setMapReady(false); return; }
    try {
      managerRef.current.init(containerRef.current, center, level);
      setMapReady(true);
    } catch (e) {
      console.error('Map init error:', e);
      setSdkStatus('fallback');
    }
  }, [sdkStatus, center.lat, center.lng, level]);

  // Vehicles
  useEffect(() => {
    if (!mapReady) return;
    vehicles.forEach((v) => managerRef.current.addVehicleMarker(v));
  }, [vehicles, mapReady]);

  // Route
  useEffect(() => {
    if (!mapReady || !selectedRoute) return;
    const manager = managerRef.current;
    manager.clearPolylines();

    const paths = selectedRoute.steps
      .filter((s) => s.path && s.path.length > 1)
      .map((s) => s.path!);
    const colors = selectedRoute.steps.map((s) => {
      if (s.mode === 'bus') return '#5de6d0';
      if (s.mode === 'subway') return '#f5c842';
      if (s.mode === 'taxi') return '#f5a742';
      if (s.mode === 'drt') return '#7c6ef5';
      if (s.mode === 'walk') return '#888899';
      return '#7c6ef5';
    });
    if (paths.length) manager.drawRoute(paths, colors);

    // POI markers
    if (selectedRoute.steps.length) {
      const first = selectedRoute.steps[0];
      const last = selectedRoute.steps[selectedRoute.steps.length - 1];
      if (first.path?.length) manager.addPoiMarker('origin', first.path[0], `📍 ${originName}`, '#7c6ef5');
      if (last.path?.length) manager.addPoiMarker('dest', last.path[last.path.length - 1], `🏁 ${destName}`, '#5de67a');
    }
  }, [selectedRoute, mapReady, originName, destName]);

  // Heatmap
  useEffect(() => {
    if (!mapReady || mode !== 'heatmap') return;
    managerRef.current.drawHeatmap(heatmapPoints);
  }, [heatmapPoints, mapReady, mode]);

  // Canvas fallback
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const drawFallback = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // City watermark
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = 'bold 32px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('포항시', W / 2, H / 2 + 12);

    // Heatmap circles
    if (mode === 'heatmap') {
      heatmapPoints.forEach((hp) => {
        const x = ((hp.location.lng - 129.2) / 0.3) * W;
        const y = H - ((hp.location.lat - 35.9) / 0.3) * H;
        const r = hp.intensity * 80 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const color = hp.intensity > 0.7 ? '245,94,94' : hp.intensity > 0.4 ? '245,200,66' : '93,230,208';
        grad.addColorStop(0, `rgba(${color},${0.5 * hp.intensity + 0.2})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 11px Manrope, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hp.label, x, y + 4);
      });
    }

    // Vehicle dots
    if (mode === 'fleet' || mode === 'route') {
      vehicles.forEach((v) => {
        const x = ((v.location.lng - 129.2) / 0.3) * W;
        const y = H - ((v.location.lat - 35.9) / 0.3) * H;
        if (x < 0 || x > W || y < 0 || y > H) return;
        const color = v.status === 'available' ? '#5de67a' : v.status === 'busy' ? '#f5c842' : '#555';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color + '33'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '10px Manrope, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(v.id, x + 8, y + 4);
      });
    }

    // Route line
    if (selectedRoute && mode === 'route') {
      const allPts = selectedRoute.steps.flatMap((s) => s.path ?? []);
      if (allPts.length > 1) {
        ctx.beginPath();
        allPts.forEach((p, i) => {
          const x = ((p.lng - 129.2) / 0.3) * W;
          const y = H - ((p.lat - 35.9) / 0.3) * H;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#7c6ef5';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    animFrameRef.current = requestAnimationFrame(drawFallback);
  }, [vehicles, heatmapPoints, selectedRoute, mode]);

  useEffect(() => {
    if (sdkStatus !== 'fallback') return;
    animFrameRef.current = requestAnimationFrame(drawFallback);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [sdkStatus, drawFallback]);

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden ${className}`}>
      {/* Real Kakao Map */}
      {sdkStatus === 'ready' && (
        <div ref={containerRef} className="absolute inset-0" />
      )}
      {/* Canvas Fallback */}
      {sdkStatus === 'fallback' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
      {/* Loading */}
      {sdkStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d18]">
          <div className="text-center text-[#888899]">
            <div className="w-8 h-8 border-2 border-[#7c6ef5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm">지도 로딩 중...</div>
          </div>
        </div>
      )}
      {/* Overlay badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white">
          {sdkStatus === 'ready' ? '🗺️ 카카오맵' : '🗺️ 시뮬레이션 맵'}
        </div>
        {mode === 'fleet' && (
          <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#5de67a] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5de67a] animate-pulse inline-block" />
            실시간
          </div>
        )}
      </div>
    </div>
  );
}
