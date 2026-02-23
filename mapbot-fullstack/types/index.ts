// ============================================================
// MapBot — Core Type Definitions
// ============================================================

export type VehicleStatus = 'available' | 'busy' | 'offline' | 'charging';
export type TransitMode = 'drt' | 'bus' | 'subway' | 'taxi' | 'ktx' | 'walk' | 'boat' | 'mixed';
export type TripPurpose = 'business' | 'leisure' | 'medical' | 'event' | 'commute';
export type PricingTier = 'normal' | 'peak' | 'night' | 'off';
export type LaasCategory = 'fashion' | 'healthcare' | 'beauty' | 'investment';
export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

// ── Coordinates ──────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

// ── Vehicle ──────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  type: string;
  status: VehicleStatus;
  location: LatLng;
  locationName: string;
  driverName: string;
  capacity: number;
  currentPassengers: number;
  etaMinutes: number;
  batteryLevel?: number;       // EV only
  isEV: boolean;
  rating: number;
  heading: number;             // 0-360 degrees
  speed: number;               // km/h
  lastUpdated: Date;
}

// ── Route & Transit ──────────────────────────────────────────
export interface TransitStep {
  mode: TransitMode;
  from: string;
  to: string;
  lineName?: string;
  lineColor?: string;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes: number;
  distanceKm: number;
  instructions: string;
  path?: LatLng[];             // polyline coords
}

export interface RouteOption {
  id: string;
  rank: number;
  label: string;
  totalDurationMinutes: number;
  totalDistanceKm: number;
  totalCost: number;
  ecoScore: number;             // 0-100
  comfortScore: number;         // 0-100
  steps: TransitStep[];
  transferCount: number;
  carbonGrams: number;
  muPointEarn: number;
}

export interface RouteSearchParams {
  origin: LatLng;
  originName: string;
  destination: LatLng;
  destinationName: string;
  purpose: TripPurpose;
  priority: 'fastest' | 'cheapest' | 'eco' | 'comfort';
  passengers: number;
  departureTime?: Date;
}

// ── DRT Dispatch ─────────────────────────────────────────────
export interface DispatchRequest {
  pickupLocation: LatLng;
  pickupName: string;
  dropoffLocation: LatLng;
  dropoffName: string;
  passengers: number;
  requestedAt: Date;
  priority: 'nearest' | 'fastest' | 'eco' | 'premium';
  userId?: string;
}

export interface DispatchResult {
  requestId: string;
  assignedVehicle: Vehicle;
  etaMinutes: number;
  estimatedCost: number;
  routePath: LatLng[];
  poolingAvailable: boolean;
  status: 'assigned' | 'no_vehicle' | 'error';
}

// ── Pricing ──────────────────────────────────────────────────
export interface PriceBreakdown {
  baseFare: number;
  distanceFare: number;
  timeSurcharge: number;
  demandMultiplier: number;
  subtotal: number;
  muPointDiscount: number;
  finalFare: number;
  muPointEarn: number;
  currency: 'KRW';
}

// ── Lodging ──────────────────────────────────────────────────
export interface Lodging {
  id: string;
  name: string;
  type: string;
  location: LatLng;
  address: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  thumbnail?: string;
  bookingUrl?: string;
}

// ── LaaS Plan ────────────────────────────────────────────────
export interface LaasPlan {
  domain: LaasCategory;
  title: string;
  summary: string;
  strategy: string[];
  weeklyActions: string[];
  warnings: string[];
  kpis: { label: string; target: string }[];
  estimatedBudget: number;
  generatedAt: Date;
}

// ── Heatmap ──────────────────────────────────────────────────
export interface HeatmapPoint {
  location: LatLng;
  intensity: number;          // 0-1
  label: string;
  demandCount: number;
  timeSlot?: string;          // e.g. "08:00-09:00"
}

// ── Booking ──────────────────────────────────────────────────
export interface Booking {
  id: string;
  userId: string;
  type: 'transit' | 'drt' | 'lodging';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  routeOption?: RouteOption;
  dispatchResult?: DispatchResult;
  lodging?: Lodging;
  amount: number;
  muPointsUsed: number;
  muPointsEarned: number;
  paymentMethod: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Corporate Policy ─────────────────────────────────────────
export interface TravelPolicy {
  maxDailyTransport: number;
  maxHotelPerNight: number;
  allowedModes: TransitMode[];
  requiresApprovalAbove: number;
  mealAllowance: number;
  preApprovalRequired: boolean;
}

export interface PolicyCheckResult {
  compliant: boolean;
  violations: string[];
  requiresApproval: boolean;
  approvalChain: string[];
  estimatedReimbursement: number;
}

// ── API Response ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source?: 'kakao' | 'odsay' | 'public_data' | 'simulation';
}

// ── Kakao Map Types ──────────────────────────────────────────
export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  x: string;   // lng
  y: string;   // lat
  phone: string;
  place_url: string;
}

export interface KakaoTransitRoute {
  totalTime: number;
  totalWalkTime: number;
  transferCount: number;
  totalDistance: number;
  subPath: KakaoSubPath[];
}

export interface KakaoSubPath {
  trafficType: number;  // 1:지하철, 2:버스, 3:도보
  distance: number;
  sectionTime: number;
  stationCount?: number;
  lane?: { name: string; busNo?: string; subwayCode?: number };
  startX?: number; startY?: number;
  endX?: number; endY?: number;
  passStopList?: { stations: Array<{ stationName: string; x: number; y: number }> };
  passShape?: { linestring: string };
}

// ── Store State ──────────────────────────────────────────────
export interface MapBotState {
  activeTab: string;
  vehicles: Vehicle[];
  searchParams: Partial<RouteSearchParams>;
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  dispatchResult: DispatchResult | null;
  heatmapData: HeatmapPoint[];
  isLoading: boolean;
  error: string | null;
  muPoints: number;
  userId: string | null;
}
