// ============================================================
// DRT Dispatch Engine — AI Vehicle Allocation Logic
// ============================================================
import { Vehicle, DispatchRequest, DispatchResult, LatLng } from '@/types';

// Haversine distance in km
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ── Scoring Functions ─────────────────────────────────────────
function scoreVehicle(
  vehicle: Vehicle,
  request: DispatchRequest,
  distKm: number
): number {
  let score = 100;
  // Distance penalty
  score -= distKm * 10;
  // Priority bonuses
  if (request.priority === 'nearest') score += (1 / (distKm + 0.1)) * 20;
  if (request.priority === 'fastest') score += (vehicle.speed > 0 ? vehicle.speed : 30) * 0.3;
  if (request.priority === 'eco' && vehicle.isEV) score += 25;
  if (request.priority === 'premium' && vehicle.type.includes('프리미엄')) score += 30;
  // Capacity check
  if (vehicle.capacity - vehicle.currentPassengers < request.passengers) score = -999;
  // Pooling bonus
  if (vehicle.currentPassengers > 0 && vehicle.currentPassengers + request.passengers <= vehicle.capacity) {
    score += 15; // pooling incentive
  }
  // Battery penalty for EV
  if (vehicle.isEV && (vehicle.batteryLevel ?? 100) < 20) score -= 40;
  return score;
}

// ── Main Dispatch Algorithm ───────────────────────────────────
export function allocateVehicle(
  vehicles: Vehicle[],
  request: DispatchRequest
): DispatchResult | null {
  const available = vehicles.filter(
    (v) =>
      v.status === 'available' &&
      v.capacity - v.currentPassengers >= request.passengers
  );

  if (!available.length) {
    return {
      requestId: generateRequestId(),
      assignedVehicle: vehicles[0],
      etaMinutes: 0,
      estimatedCost: 0,
      routePath: [],
      poolingAvailable: false,
      status: 'no_vehicle',
    };
  }

  // Score each vehicle
  const scored = available
    .map((v) => {
      const dist = haversineKm(v.location, request.pickupLocation);
      return { vehicle: v, dist, score: scoreVehicle(v, request, dist) };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const etaMinutes = Math.max(2, Math.round(best.dist * 2.5 + 1));
  const tripDistKm = haversineKm(request.pickupLocation, request.dropoffLocation);
  const baseFare = 1200 + tripDistKm * 900;
  const prioritySurcharge = request.priority === 'premium' ? 1.3 : 1.0;
  const estimatedCost = Math.round(baseFare * prioritySurcharge);

  // Check pooling
  const poolingAvailable = scored.some(
    (s) => s.vehicle.currentPassengers > 0 && s.dist < 1.5
  );

  // Generate route path
  const routePath = generateRoutePath(
    best.vehicle.location,
    request.pickupLocation,
    request.dropoffLocation
  );

  return {
    requestId: generateRequestId(),
    assignedVehicle: best.vehicle,
    etaMinutes,
    estimatedCost,
    routePath,
    poolingAvailable,
    status: 'assigned',
  };
}

function generateRoutePath(
  vehicleLoc: LatLng,
  pickup: LatLng,
  dropoff: LatLng
): LatLng[] {
  const path: LatLng[] = [];
  const steps = 6;
  // Vehicle → Pickup
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    path.push({
      lat: vehicleLoc.lat + (pickup.lat - vehicleLoc.lat) * t,
      lng: vehicleLoc.lng + (pickup.lng - vehicleLoc.lng) * t,
    });
  }
  // Pickup → Dropoff
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    path.push({
      lat: pickup.lat + (dropoff.lat - pickup.lat) * t,
      lng: pickup.lng + (dropoff.lng - pickup.lng) * t,
    });
  }
  return path;
}

function generateRequestId(): string {
  return `DRT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// ── Demand Forecasting (Simple ML-like heuristic) ─────────────
export interface DemandForecast {
  location: LatLng;
  label: string;
  predictedDemand: number;   // vehicles needed
  timeSlot: string;
  confidence: number;        // 0-1
}

export function forecastDemand(
  hour: number,
  dayOfWeek: number,
  locations: Array<{ location: LatLng; label: string; baseDemand: number }>
): DemandForecast[] {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isPeakMorning = hour >= 7 && hour <= 9;
  const isPeakEvening = hour >= 17 && hour <= 20;
  const isLunchHour = hour >= 12 && hour <= 13;

  return locations.map((loc) => {
    let multiplier = 1.0;
    if (isPeakMorning && !isWeekend) multiplier = 2.2;
    else if (isPeakEvening && !isWeekend) multiplier = 1.9;
    else if (isLunchHour) multiplier = 1.4;
    else if (isWeekend && hour >= 10 && hour <= 18) multiplier = 1.5;
    else if (hour >= 22 || hour <= 5) multiplier = 0.3;

    return {
      location: loc.location,
      label: loc.label,
      predictedDemand: Math.round(loc.baseDemand * multiplier),
      timeSlot: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
      confidence: isWeekend ? 0.75 : 0.88,
    };
  });
}

// ── Dynamic Pricing ───────────────────────────────────────────
export interface DynamicPriceInput {
  distanceKm: number;
  mode: string;
  pricingTier: string;
  muPoints: number;
  passengerCount: number;
}

export function calculateDynamicPrice(input: DynamicPriceInput) {
  const BASE_RATES: Record<string, number> = {
    drt: 900, taxi: 1050, bus: 100, ktx: 90, boat: 1200, subway: 80,
  };
  const TIME_MULTIPLIERS: Record<string, number> = {
    normal: 1.0, peak: 1.2, night: 1.15, off: 0.9,
  };

  const baseRate = BASE_RATES[input.mode] ?? 900;
  const timeMul = TIME_MULTIPLIERS[input.pricingTier] ?? 1.0;
  const minFare = input.mode === 'bus' ? 1500 : input.mode === 'ktx' ? 15000 : 1200;

  const distanceFare = Math.round(input.distanceKm * baseRate);
  const timeSurcharge = Math.round(distanceFare * (timeMul - 1));
  const subtotal = Math.max(minFare, distanceFare + timeSurcharge);
  const maxDiscount = Math.round(subtotal * 0.3);
  const muPointDiscount = Math.min(input.muPoints, maxDiscount);
  const finalFare = subtotal - muPointDiscount;
  const muPointEarn = Math.round(finalFare * 0.05);

  return {
    baseFare: minFare,
    distanceFare,
    timeSurcharge,
    demandMultiplier: timeMul,
    subtotal,
    muPointDiscount,
    finalFare,
    muPointEarn,
    currency: 'KRW' as const,
  };
}
