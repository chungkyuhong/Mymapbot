'use client';
// ============================================================
// useRealtime Hook — SSE + Firebase subscription
// ============================================================
import { useEffect, useRef } from 'react';
import { useMapBotStore } from '@/lib/store';
import { Vehicle, HeatmapPoint } from '@/types';

export function useRealtimeVehicles() {
  const setVehicles = useMapBotStore((s) => s.setVehicles);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      esRef.current = new EventSource('/api/realtime?type=vehicles');
      esRef.current.onmessage = (e) => {
        try {
          const { vehicles } = JSON.parse(e.data);
          setVehicles(
            vehicles.map((v: Record<string, unknown>) => ({
              id: v.id,
              type: v.type,
              status: v.status,
              location: { lat: v.lat, lng: v.lng },
              locationName: v.locationName ?? '',
              driverName: '',
              capacity: 4,
              currentPassengers: v.pax as number ?? 0,
              etaMinutes: 0,
              batteryLevel: v.battery as number ?? 100,
              isEV: (v.type as string)?.includes('전기') ?? false,
              rating: 4.8,
              heading: v.heading as number ?? 0,
              speed: v.speed as number ?? 0,
              lastUpdated: new Date(),
            })) as Vehicle[]
          );
        } catch {}
      };
      esRef.current.onerror = () => {
        esRef.current?.close();
        setTimeout(connect, 3000);
      };
    };
    connect();
    return () => esRef.current?.close();
  }, [setVehicles]);
}

export function useRealtimeHeatmap() {
  const setHeatmapData = useMapBotStore((s) => s.setHeatmapData);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      esRef.current = new EventSource('/api/realtime?type=heatmap');
      esRef.current.onmessage = (e) => {
        try {
          const points: HeatmapPoint[] = JSON.parse(e.data);
          setHeatmapData(points);
        } catch {}
      };
      esRef.current.onerror = () => {
        esRef.current?.close();
        setTimeout(connect, 5000);
      };
    };
    connect();
    return () => esRef.current?.close();
  }, [setHeatmapData]);
}
