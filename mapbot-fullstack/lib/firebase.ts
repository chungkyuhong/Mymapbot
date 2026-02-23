// ============================================================
// Firebase Client SDK — Optional Integration
// Firebase 설정이 없으면 시뮬레이션 모드로 자동 전환
// ============================================================
'use client';

let app: import('firebase/app').FirebaseApp | null = null;
let db: import('firebase/firestore').Firestore | null = null;
let auth: import('firebase/auth').Auth | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId && firebaseConfig.projectId !== ''
);

async function initFirebase() {
  if (!isFirebaseConfigured) return;
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    const { getFirestore } = await import('firebase/firestore');
    db = getFirestore(app);
    const { getAuth } = await import('firebase/auth');
    auth = getAuth(app);
  } catch (e) {
    console.warn('[Firebase] Initialization failed, using simulation mode:', e);
  }
}

// Initialize asynchronously — won't block if Firebase is not configured
if (typeof window !== 'undefined') {
  initFirebase();
}

// ── Auth ─────────────────────────────────────────────────────
let _anonUser: { uid: string } | null = null;

export async function signInAnon(): Promise<{ uid: string }> {
  if (!isFirebaseConfigured) {
    // Simulation: return a pseudo user ID
    if (!_anonUser) {
      _anonUser = { uid: `sim-user-${Date.now().toString(36)}` };
    }
    return _anonUser;
  }
  try {
    if (!auth) await initFirebase();
    if (!auth) throw new Error('Firebase Auth not available');
    const { signInAnonymously } = await import('firebase/auth');
    const result = await signInAnonymously(auth);
    return { uid: result.user.uid };
  } catch (e) {
    console.warn('[Firebase] Auth failed, using simulation:', e);
    if (!_anonUser) _anonUser = { uid: `sim-user-${Date.now().toString(36)}` };
    return _anonUser;
  }
}

// ── Firestore helpers ────────────────────────────────────────
export async function getFirestoreDB() {
  if (!isFirebaseConfigured) return null;
  if (!db) await initFirebase();
  return db;
}

export { app, db, auth, isFirebaseConfigured };
