#!/usr/bin/env node
// ============================================================
// Firestore Seed Script — 초기 차량/수요 데이터 입력
// Usage: node scripts/seed-firestore.js
// ============================================================
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // 직접 경로 설정

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

const VEHICLES = [
  { type:'전기차 DRT', status:'available', location:{lat:36.0320,lng:129.3650}, locationName:'포항역', driverName:'김민준', capacity:4, currentPassengers:0, batteryLevel:87, isEV:true, rating:4.8, heading:90, speed:0 },
  { type:'미니밴 DRT', status:'available', location:{lat:35.9877,lng:129.4200}, locationName:'포항공항', driverName:'이수연', capacity:7, currentPassengers:0, batteryLevel:72, isEV:true, rating:4.9, heading:180, speed:0 },
  { type:'전기버스',   status:'available', location:{lat:36.0097,lng:129.3543}, locationName:'포스코', driverName:'박지혁', capacity:12, currentPassengers:0, batteryLevel:91, isEV:true, rating:4.7, heading:45, speed:0 },
  { type:'택시',       status:'available', location:{lat:36.0320,lng:129.3600}, locationName:'포항시청', driverName:'최동현', capacity:4, currentPassengers:0, batteryLevel:null, isEV:false, rating:4.6, heading:270, speed:0 },
  { type:'전기차 DRT', status:'busy',      location:{lat:36.1039,lng:129.3887}, locationName:'한동대', driverName:'정유나', capacity:4, currentPassengers:2, batteryLevel:68, isEV:true, rating:4.9, heading:0, speed:45 },
  { type:'프리미엄',   status:'available', location:{lat:36.0628,lng:129.3857}, locationName:'영일대', driverName:'강태윤', capacity:4, currentPassengers:0, batteryLevel:null, isEV:false, rating:5.0, heading:135, speed:0 },
  { type:'전기차 DRT', status:'available', location:{lat:36.0245,lng:129.3650}, locationName:'죽도시장', driverName:'윤성호', capacity:4, currentPassengers:0, batteryLevel:55, isEV:true, rating:4.7, heading:60, speed:0 },
  { type:'미니밴 DRT', status:'offline',   location:{lat:36.0189,lng:129.3421}, locationName:'성모병원', driverName:'홍나래', capacity:7, currentPassengers:0, batteryLevel:30, isEV:true, rating:4.8, heading:90, speed:0 },
];

const DEMAND_POINTS = [
  { location:{lat:36.0320,lng:129.3650}, label:'포항역', intensity:0.92, demandCount:9 },
  { location:{lat:35.9877,lng:129.4200}, label:'포항공항', intensity:0.78, demandCount:7 },
  { location:{lat:36.0097,lng:129.3543}, label:'포스코', intensity:0.70, demandCount:6 },
  { location:{lat:36.0320,lng:129.3600}, label:'포항시청', intensity:0.55, demandCount:5 },
  { location:{lat:36.1039,lng:129.3887}, label:'한동대', intensity:0.45, demandCount:4 },
  { location:{lat:36.0628,lng:129.3857}, label:'영일대', intensity:0.60, demandCount:5 },
  { location:{lat:36.0245,lng:129.3650}, label:'죽도시장', intensity:0.50, demandCount:4 },
];

async function seed() {
  console.log('🌱 Seeding Firestore...');
  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Vehicles
  console.log('  → Vehicles...');
  for (const v of VEHICLES) {
    const ref = db.collection('vehicles').doc();
    batch.set(ref, { ...v, lastUpdated: now });
  }

  // Demand heatmap
  console.log('  → Demand heatmap...');
  batch.set(db.collection('demand_heatmap').doc('current'), {
    points: DEMAND_POINTS, generatedAt: now,
  });

  // Sample demand events
  console.log('  → Demand events...');
  for (const p of DEMAND_POINTS) {
    const ref = db.collection('demand_events').doc();
    batch.set(ref, { ...p, timestamp: now });
  }

  await batch.commit();
  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
