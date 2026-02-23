// ============================================================
// Kakao Maps SDK — Client-side Map Engine
// v2.0 — 카카오 JavaScript Key 내장 + 실전 연동
// ============================================================
import { LatLng, KakaoPlace } from '@/types';

declare global {
  interface Window {
    kakao: KakaoSDK;
    _mapbotKakaoKey?: string;
  }
}

interface KakaoSDK {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Map: new (container: HTMLElement, options: object) => KakaoMapInstance;
    Marker: new (options: object) => KakaoMarker;
    InfoWindow: new (options: object) => KakaoInfoWindow;
    Polyline: new (options: object) => KakaoPolyline;
    Circle: new (options: object) => KakaoCircle;
    CustomOverlay: new (options: object) => KakaoCustomOverlay;
    services: {
      Geocoder: new () => KakaoGeocoder;
      Places: new () => KakaoPlaces;
      Status: { OK: string; ZERO_RESULT: string; ERROR: string };
    };
    event: {
      addListener: (target: object, type: string, handler: Function) => void;
      removeListener: (target: object, type: string, handler: Function) => void;
    };
  };
}

interface KakaoLatLng { getLat(): number; getLng(): number; }
interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  setLevel(level: number): void;
  getLevel(): number;
  panTo(latlng: KakaoLatLng): void;
  setBounds(bounds: object): void;
}
interface KakaoMarker { setMap(map: KakaoMapInstance | null): void; setPosition(latlng: KakaoLatLng): void; getPosition(): KakaoLatLng; }
interface KakaoInfoWindow { open(map: KakaoMapInstance, marker: KakaoMarker): void; close(): void; setContent(content: string): void; }
interface KakaoPolyline { setMap(map: KakaoMapInstance | null): void; setPath(path: KakaoLatLng[]): void; }
interface KakaoCircle { setMap(map: KakaoMapInstance | null): void; }
interface KakaoCustomOverlay { setMap(map: KakaoMapInstance | null): void; setPosition(latlng: KakaoLatLng): void; }
interface KakaoGeocoder { addressSearch(addr: string, callback: Function): void; coord2Address(lng: number, lat: number, callback: Function): void; }
interface KakaoPlaces { keywordSearch(keyword: string, callback: Function, options?: object): void; }

// ── SDK Loader ─────────────────────────────────────────────────
let sdkLoaded = false;
let loadPromise: Promise<void> | null = null;

// Kakao JavaScript API Key (9ae99572568cbb7dc7d90ce792f63aa9)
const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? '9ae99572568cbb7dc7d90ce792f63aa9';

export function loadKakaoMapSDK(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (sdkLoaded && window.kakao?.maps) { resolve(); return; }

    // Check if already injected
    const existingScript = document.getElementById('kakao-map-sdk');
    if (existingScript && window.kakao?.maps) {
      window.kakao.maps.load(() => { sdkLoaded = true; resolve(); });
      return;
    }

    if (!KAKAO_APP_KEY || KAKAO_APP_KEY === 'your_kakao_javascript_key_here') {
      console.warn('[MapBot] Kakao Map SDK key not configured → simulation mode');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services,clusterer&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => { sdkLoaded = true; resolve(); });
      } else {
        reject(new Error('Kakao Maps API not available'));
      }
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Kakao Map SDK script failed to load'));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function isKakaoLoaded(): boolean {
  return sdkLoaded && !!window.kakao?.maps;
}

// ── Map Instance Manager ───────────────────────────────────────
export class KakaoMapManager {
  private map: KakaoMapInstance | null = null;
  private markers: Map<string, KakaoMarker> = new Map();
  private overlays: Map<string, KakaoCustomOverlay> = new Map();
  private polylines: KakaoPolyline[] = [];
  private circles: KakaoCircle[] = [];
  private infoWindows: Map<string, KakaoInfoWindow> = new Map();

  init(container: HTMLElement, center: LatLng, level = 7): void {
    if (!isKakaoLoaded()) return;
    const K = window.kakao.maps;
    this.map = new K.Map(container, {
      center: new K.LatLng(center.lat, center.lng),
      level,
    });
  }

  getMap(): KakaoMapInstance | null { return this.map; }

  // ── Vehicle Markers ────────────────────────────────────────
  addVehicleMarker(vehicle: { id: string; location: LatLng; status: string; type: string }): void {
    if (!this.map || !isKakaoLoaded()) return;
    const K = window.kakao.maps;
    const pos = new K.LatLng(vehicle.location.lat, vehicle.location.lng);

    const color = vehicle.status === 'available' ? '#5de67a'
      : vehicle.status === 'busy' ? '#f5c842'
      : '#888899';

    const icon = vehicle.type.includes('버스') ? '🚌'
      : vehicle.type.includes('택시') ? '🚖'
      : vehicle.type.includes('프리미엄') ? '🚘'
      : '🚗';

    const content = `<div style="
      background:${color}22;border:1.5px solid ${color};
      border-radius:20px;padding:4px 10px;
      font:bold 11px Manrope,sans-serif;color:${color};
      white-space:nowrap;cursor:pointer;
      backdrop-filter:blur(8px);
    ">${icon} ${vehicle.id}</div>`;

    if (this.overlays.has(vehicle.id)) {
      this.overlays.get(vehicle.id)!.setPosition(pos);
    } else {
      const overlay = new K.CustomOverlay({ content, position: pos, yAnchor: 1.2 });
      overlay.setMap(this.map);
      this.overlays.set(vehicle.id, overlay);
    }
  }

  // ── POI Markers ────────────────────────────────────────────
  addPoiMarker(id: string, loc: LatLng, label: string, color = '#7c6ef5'): void {
    if (!this.map || !isKakaoLoaded()) return;
    const K = window.kakao.maps;
    const pos = new K.LatLng(loc.lat, loc.lng);

    // Remove existing
    this.markers.get(id)?.setMap(null);
    this.overlays.get(`poi-${id}`)?.setMap(null);

    const marker = new K.Marker({ position: pos });
    marker.setMap(this.map);
    this.markers.set(id, marker);

    const content = `<div style="
      background:${color};color:#fff;border-radius:12px;
      padding:4px 10px;font:bold 11px Manrope,sans-serif;
      margin-bottom:8px;white-space:nowrap;
    ">${label}</div>`;
    const overlay = new K.CustomOverlay({ content, position: pos, yAnchor: 2.2 });
    overlay.setMap(this.map);
    this.overlays.set(`poi-${id}`, overlay);
  }

  // ── Route Polylines ────────────────────────────────────────
  drawRoute(paths: LatLng[][], colors: string[] = ['#7c6ef5', '#5de6d0', '#f5c842']): void {
    if (!this.map || !isKakaoLoaded()) return;
    const K = window.kakao.maps;
    this.clearPolylines();
    paths.forEach((path, i) => {
      if (path.length < 2) return;
      const line = new K.Polyline({
        path: path.map((p) => new K.LatLng(p.lat, p.lng)),
        strokeWeight: 5,
        strokeColor: colors[i % colors.length],
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
      });
      line.setMap(this.map!);
      this.polylines.push(line);
    });
  }

  clearPolylines(): void {
    this.polylines.forEach((l) => l.setMap(null));
    this.polylines = [];
  }

  // ── Heatmap (Custom Circles) ───────────────────────────────
  drawHeatmap(points: Array<{ location: LatLng; intensity: number; label?: string }>): void {
    if (!this.map || !isKakaoLoaded()) return;
    const K = window.kakao.maps;
    this.clearHeatmap();
    points.forEach((p) => {
      const opacity = 0.15 + p.intensity * 0.45;
      const radius = 250 + p.intensity * 700;
      const r = p.intensity > 0.7 ? 245 : p.intensity > 0.4 ? 245 : 93;
      const g = p.intensity > 0.7 ? 94  : p.intensity > 0.4 ? 200 : 230;
      const b = p.intensity > 0.7 ? 94  : p.intensity > 0.4 ? 66  : 208;
      const circle = new K.Circle({
        center: new K.LatLng(p.location.lat, p.location.lng),
        radius,
        strokeWeight: 0,
        strokeOpacity: 0,
        fillColor: `rgb(${r},${g},${b})`,
        fillOpacity: opacity,
      });
      circle.setMap(this.map!);
      this.circles.push(circle);
    });
  }

  clearHeatmap(): void {
    this.circles.forEach((c) => c.setMap(null));
    this.circles = [];
  }

  clearAll(): void {
    this.overlays.forEach((o) => o.setMap(null));
    this.overlays.clear();
    this.markers.forEach((m) => m.setMap(null));
    this.markers.clear();
    this.clearPolylines();
    this.clearHeatmap();
  }

  panTo(lat: number, lng: number): void {
    if (!this.map || !isKakaoLoaded()) return;
    this.map.panTo(new window.kakao.maps.LatLng(lat, lng));
  }

  setLevel(level: number): void {
    this.map?.setLevel(level);
  }

  fitBounds(points: LatLng[]): void {
    if (!this.map || !isKakaoLoaded() || !points.length) return;
    const K = window.kakao.maps;
    // Create a simple bounds-like structure using setCenter + setLevel
    const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    this.map.panTo(new K.LatLng(avgLat, avgLng));
  }
}

// ── REST API helpers (Server-side — called from API routes) ───
export async function kakaoGeocode(address: string): Promise<LatLng | null> {
  const key = process.env.KAKAO_REST_API_KEY ?? '5fb47e56131ad4934b7cff2f8b8e3cac';
  if (!key) return null;
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${key}` } }
    );
    const data = await res.json();
    if (data.documents?.length > 0) {
      return { lat: parseFloat(data.documents[0].y), lng: parseFloat(data.documents[0].x) };
    }
    // Fall back to keyword search
    const res2 = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}&size=1`,
      { headers: { Authorization: `KakaoAK ${key}` } }
    );
    const data2 = await res2.json();
    if (data2.documents?.length > 0) {
      return { lat: parseFloat(data2.documents[0].y), lng: parseFloat(data2.documents[0].x) };
    }
  } catch (e) { console.error('Kakao geocode error:', e); }
  return null;
}

export async function kakaoSearchPlaces(keyword: string, x?: string, y?: string): Promise<KakaoPlace[]> {
  const key = process.env.KAKAO_REST_API_KEY ?? '5fb47e56131ad4934b7cff2f8b8e3cac';
  if (!key) return [];
  try {
    let url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=10`;
    if (x && y) url += `&x=${x}&y=${y}&radius=5000`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
    const data = await res.json();
    return data.documents ?? [];
  } catch (e) { console.error('Kakao places error:', e); }
  return [];
}
