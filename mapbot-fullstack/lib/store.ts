'use client';
// ============================================================
// Zustand Global Store
// ============================================================
import { create } from 'zustand';
import { MapBotState, Vehicle, RouteOption, DispatchResult, HeatmapPoint } from '@/types';

interface MapBotStore extends MapBotState {
  setActiveTab: (tab: string) => void;
  setVehicles: (v: Vehicle[]) => void;
  setRouteOptions: (r: RouteOption[]) => void;
  setSelectedRoute: (r: RouteOption | null) => void;
  setDispatchResult: (d: DispatchResult | null) => void;
  setHeatmapData: (h: HeatmapPoint[]) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
  setMuPoints: (p: number) => void;
  setUserId: (id: string | null) => void;
  updateSearchParam: (key: string, value: unknown) => void;
}

export const useMapBotStore = create<MapBotStore>((set) => ({
  activeTab: 'mobility',
  vehicles: [],
  searchParams: {},
  routeOptions: [],
  selectedRoute: null,
  dispatchResult: null,
  heatmapData: [],
  isLoading: false,
  error: null,
  muPoints: 500,
  userId: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setVehicles: (vehicles) => set({ vehicles }),
  setRouteOptions: (routeOptions) => set({ routeOptions }),
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setDispatchResult: (dispatchResult) => set({ dispatchResult }),
  setHeatmapData: (heatmapData) => set({ heatmapData }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setMuPoints: (muPoints) => set({ muPoints }),
  setUserId: (userId) => set({ userId }),
  updateSearchParam: (key, value) =>
    set((state) => ({ searchParams: { ...state.searchParams, [key]: value } })),
}));
