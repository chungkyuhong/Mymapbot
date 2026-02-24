// ============================================================
// Firebase Cloud Functions — MapBot Backend
// ============================================================
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import axios from 'axios';

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

// ── Types ─────────────────────────────────────────────────────
interface LatLng { lat: number; lng: number; }
interface DispatchRequest {
  pickupLocation: LatLng;
  dropoffLocation: LatLng;
  passengers: number;
  priority: string;
  userId?: string;
}

// ── 1. Vehicle Position Updater (Scheduled) ───────────────────
export const updateVehiclePositions = functions
  .region('asia-northeast3')  // Seoul
  .pubsub.schedule('every 5 seconds')
  .onRun(async () => {
    const vehiclesRef = db.collection('vehicles');
    const snapshot = await vehiclesRef.where('status', '==', 'busy').get();
    const batch = db.batch();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const heading = data.heading ?? 0;
      const rad = (heading * Math.PI) / 180;
      const speed = 0.0001 + Math.random() * 0.0002;
      const newLat = (data.location?.lat ?? 36.032) + Math.cos(rad) * speed;
      const newLng = (data.location?.lng ?? 129.365) + Math.sin(rad) * speed;
      batch.update(doc.ref, {
        location: { lat: newLat, lng: newLng },
        heading: (heading + (Math.random() - 0.5) * 8 + 360) % 360,
        speed: 25 + Math.floor(Math.random() * 30),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
    return null;
  });

// ── 2. DRT Dispatch HTTPS Function ────────────────────────────
export const dispatchVehicle = functions
  .region('asia-northeast3')
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      try {
        const request: DispatchRequest = req.body;
        // Fetch available vehicles from Firestore
        const available = await db.collection('vehicles')
          .where('status', '==', 'available')
          .get();

        if (available.empty) {
          res.status(503).json({ success: false, error: '배차 가능 차량 없음' });
          return;
        }

        // Simple nearest-vehicle algorithm
        let bestDoc = available.docs[0];
        let bestDist = Infinity;
        available.docs.forEach((doc) => {
          const v = doc.data();
          const dist = haversine(
            v.location?.lat, v.location?.lng,
            request.pickupLocation.lat, request.pickupLocation.lng
          );
          if (dist < bestDist) { bestDist = dist; bestDoc = doc; }
        });

        const assigned = bestDoc.data();
        const eta = Math.max(2, Math.round(bestDist * 2.5 + 1));
        const tripDist = haversine(
          request.pickupLocation.lat, request.pickupLocation.lng,
          request.dropoffLocation.lat, request.dropoffLocation.lng
        );
        const cost = Math.round(tripDist * 900 + 1200);
        const requestId = `DRT-${Date.now().toString(36).toUpperCase()}`;

        // Update vehicle & create dispatch record
        await Promise.all([
          bestDoc.ref.update({
            status: 'busy',
            currentPassengers: admin.firestore.FieldValue.increment(request.passengers),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          }),
          db.collection('dispatch_requests').doc(requestId).set({
            ...request,
            vehicleId: bestDoc.id,
            eta,
            estimatedCost: cost,
            status: 'assigned',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          }),
        ]);

        res.json({
          success: true,
          data: {
            requestId,
            assignedVehicle: { id: bestDoc.id, ...assigned },
            etaMinutes: eta,
            estimatedCost: cost,
            poolingAvailable: false,
            status: 'assigned',
          },
        });
      } catch (err) {
        console.error('Dispatch error:', err);
        res.status(500).json({ success: false, error: '서버 오류' });
      }
    });
  });

// ── 3. Transit Route (ODsay Proxy) ────────────────────────────
export const transitRoute = functions
  .region('asia-northeast3')
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== 'POST') { res.status(405).end(); return; }
      const { SX, SY, EX, EY, OPT = 0 } = req.body;
      const apiKey = functions.config().odsay?.key;
      if (!apiKey) {
        res.json({ success: false, source: 'no_key', data: [] });
        return;
      }
      try {
        const url = `https://api.odsay.com/v1/api/searchPubTransPath?SX=${SX}&SY=${SY}&EX=${EX}&EY=${EY}&OPT=${OPT}&apiKey=${apiKey}`;
        const { data } = await axios.get(url, { timeout: 8000 });
        res.json({ success: true, source: 'odsay', data });
      } catch (err) {
        res.status(500).json({ success: false, error: 'ODsay API error' });
      }
    });
  });

// ── 4. MU Points Transaction ──────────────────────────────────
export const updateMuPoints = functions
  .region('asia-northeast3')
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      const { userId, delta, reason } = req.body;
      if (!userId || delta === undefined) {
        res.status(400).json({ error: 'Missing userId or delta' });
        return;
      }
      try {
        const userRef = db.collection('users').doc(userId);
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(userRef);
          const current = snap.exists ? (snap.data()?.muPoints ?? 0) : 0;
          const newTotal = Math.max(0, current + delta);
          tx.set(userRef, {
            muPoints: newTotal,
            muPointHistory: admin.firestore.FieldValue.arrayUnion({
              delta, reason, timestamp: new Date().toISOString(),
            }),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ success: false, error: 'Transaction failed' });
      }
    });
  });

// ── 5. Demand Heatmap (Scheduled) ────────────────────────────
export const generateDemandHeatmap = functions
  .region('asia-northeast3')
  .pubsub.schedule('every 10 minutes')
  .onRun(async () => {
    const hour = new Date().getHours();
    const dow = new Date().getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    const multiplier = isPeak && !isWeekend ? 2.0 : isWeekend ? 1.4 : 1.0;

    const LOCATIONS = [
      { lat: 36.0320, lng: 129.3650, name: '포항역', base: 8 },
      { lat: 35.9877, lng: 129.4200, name: '포항공항', base: 6 },
      { lat: 36.0097, lng: 129.3543, name: '포스코', base: 7 },
      { lat: 36.0320, lng: 129.3600, name: '포항시청', base: 4 },
      { lat: 36.1039, lng: 129.3887, name: '한동대', base: 3 },
      { lat: 36.0628, lng: 129.3857, name: '영일대해수욕장', base: 5 },
    ];

    const batch = db.batch();
    const heatRef = db.collection('demand_heatmap').doc('current');
    batch.set(heatRef, {
      points: LOCATIONS.map((l) => ({
        location: { lat: l.lat, lng: l.lng },
        label: l.name,
        intensity: Math.min(1, (l.base * multiplier) / 16),
        demandCount: Math.round(l.base * multiplier),
      })),
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return null;
  });

// ── Helper ────────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
