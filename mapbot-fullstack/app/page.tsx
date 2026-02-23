'use client';
// ============================================================
// MapBot — Main Page (Client)
// ============================================================
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useMapBotStore } from '@/lib/store';
import { useRealtimeVehicles, useRealtimeHeatmap } from '@/hooks/useRealtime';
import { POHANG_LOCATIONS } from '@/lib/transit-api';
import { RouteOption, DispatchResult, LaasPlan } from '@/types';
import { signInAnon } from '@/lib/firebase';
import { calculateDynamicPrice } from '@/lib/dispatch-engine';

// Dynamically load map (no SSR)
const KakaoMap = dynamic(() => import('@/components/KakaoMap'), { ssr: false });

const TABS = [
  { id: 'mobility', label: '이동 추천', icon: '🗺️' },
  { id: 'fleet', label: 'Fleet 현황', icon: '🚗' },
  { id: 'drt', label: 'DRT 배차', icon: '⚡' },
  { id: 'pricing', label: '요금·Point', icon: '💎' },
  { id: 'subscribe', label: 'Premium', icon: '👑' },
  { id: 'community', label: '커뮤니티', icon: '👥' },
  { id: 'laas', label: 'LaaS AI', icon: '🤖' },
  { id: 'admin', label: '관리자', icon: '📊' },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: '🆓',
    price: 0,
    period: '영구 무료',
    color: 'from-[#888899] to-[#666677]',
    features: [
      { text: '기본 경로 탐색 (1일 3회)', included: true },
      { text: '주변 시설 검색', included: true },
      { text: 'DRT 배차 요청 (수수료 10%)', included: true },
      { text: '100 MU Point 시작', included: true },
      { text: '광고 포함', included: true },
      { text: 'AI 챗봇 (제한적)', included: false },
      { text: '프리미엄 경로 추천', included: false },
      { text: 'LaaS AI 플랜', included: false },
      { text: '우선 배차', included: false },
      { text: '실시간 Fleet 추적', included: false },
    ],
    cta: '현재 플랜',
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: '⭐',
    price: 9900,
    period: '월',
    color: 'from-[#5de6d0] to-[#3dd5c0]',
    features: [
      { text: '무제한 경로 탐색', included: true },
      { text: '주변 시설 검색', included: true },
      { text: 'DRT 배차 요청 (수수료 5%)', included: true },
      { text: '500 MU Point 매월 지급', included: true },
      { text: '광고 제거', included: true },
      { text: 'AI 챗봇 기본', included: true },
      { text: '프리미엄 경로 추천', included: true },
      { text: 'LaaS AI 플랜 (1개)', included: false },
      { text: '우선 배차', included: false },
      { text: '실시간 Fleet 추적', included: false },
    ],
    cta: '시작하기',
    popular: false,
    discount: '첫 달 50% 할인',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '💎',
    price: 19900,
    period: '월',
    color: 'from-[#7c6ef5] to-[#9b8ff8]',
    features: [
      { text: '무제한 경로 탐색', included: true },
      { text: '프리미엄 경로 추천', included: true },
      { text: 'DRT 배차 요청 (수수료 0%)', included: true },
      { text: '1,500 MU Point 매월 지급', included: true },
      { text: '광고 제거 + 프리미엄 UI', included: true },
      { text: 'AI 챗봇 Pro (우선 응답)', included: true },
      { text: 'LaaS AI 플랜 (무제한)', included: true },
      { text: '우선 배차 (30% 빠름)', included: true },
      { text: '실시간 Fleet 추적', included: true },
      { text: '멀티모달 최적화', included: true },
    ],
    cta: '가장 인기',
    popular: true,
    badge: 'BEST VALUE',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: '🏢',
    price: 0,
    period: '맞춤 견적',
    color: 'from-[#f5c842] to-[#e6a020]',
    features: [
      { text: 'Pro 모든 기능 포함', included: true },
      { text: '기업 전용 대시보드', included: true },
      { text: '직원 계정 관리 (무제한)', included: true },
      { text: '출장 정책 자동 검사', included: true },
      { text: '월간 리포트 & 분석', included: true },
      { text: '전담 CS & API 지원', included: true },
      { text: '커스텀 브랜딩', included: true },
      { text: 'SLA 99.9% 보장', included: true },
      { text: '온프레미스 배포 옵션', included: true },
      { text: '맞춤형 기능 개발', included: true },
    ],
    cta: '문의하기',
    popular: false,
  },
];

const LAAS_DATA: Record<string, LaasPlan> = {
  fashion: {
    domain: 'fashion', title: '👗 퍼스널 스타일링 플랜',
    summary: '체형·라이프스타일 기반 AI 패션 전략',
    strategy: ['퍼스널 컬러 분석', '체형별 핏 가이드', '시즌 코디북', '스마트 쇼핑 연계'],
    weeklyActions: ['기본 아이템 3종 구매', '스타일링 피드백 수신', '코디 완성도 점검', '다음달 위시리스트'],
    warnings: ['트렌드 아이템 과소비 주의', '계절 아이템 우선 투자'],
    kpis: [{ label: '코디 완성도', target: '80%+' }, { label: '예산 준수율', target: '95%+' }, { label: '활용률', target: '70%+' }],
    estimatedBudget: 300000, generatedAt: new Date(),
  },
  healthcare: {
    domain: 'healthcare', title: '🏥 건강관리 로드맵',
    summary: '생활습관 개선 + 예방적 건강관리 AI 플랜',
    strategy: ['체성분 기반 운동 강도', '식이요법 캘린더', '수면·스트레스 모니터링', '정기검진 알림'],
    weeklyActions: ['기초 체력 측정', '식단 일지 시작', '운동 루틴 2회/주', '중간 점검'],
    warnings: ['본 플랜은 의료 진단이 아닙니다', '이상 증상 시 전문의 상담'],
    kpis: [{ label: '주 3회 운동', target: '달성' }, { label: '수면', target: '7시간+' }, { label: '체중 변화', target: '모니터링' }],
    estimatedBudget: 200000, generatedAt: new Date(),
  },
  beauty: {
    domain: 'beauty', title: '💄 뷰티 루틴 설계',
    summary: '피부 타입·시즌·예산 기반 맞춤 스킨케어',
    strategy: ['피부 타입 진단', '루틴 최적화', '성분 중복 체크', '레이어링 가이드'],
    weeklyActions: ['현재 제품 성분 분석', '세럼·선크림 업그레이드', '10분 모닝 케어 정착', '피부 변화 사진 기록'],
    warnings: ['패치 테스트 권장', '의약품 성분 함유 제품 주의'],
    kpis: [{ label: '수분도', target: '+15%' }, { label: '루틴 준수율', target: '90%+' }, { label: '예산', target: '초과 없음' }],
    estimatedBudget: 150000, generatedAt: new Date(),
  },
  investment: {
    domain: 'investment', title: '📈 스마트 투자 전략',
    summary: '리스크 분산·목표 수익률 기반 포트폴리오',
    strategy: ['ETF 60:40 분산', '안전자산 20% 편입', '적립식 코스트 애버리징', '분기 리밸런싱'],
    weeklyActions: ['비상금 6개월치 확보', 'ETF 포트폴리오 구성', '자동이체 설정', '분기 수익률 리뷰'],
    warnings: ['본 플랜은 투자 자문이 아닙니다', '원금 손실 가능성 존재', '최종 결정은 본인 책임'],
    kpis: [{ label: '목표 수익률', target: '8~12%/년' }, { label: '최대 낙폭', target: '-15% 이내' }, { label: '적립식 납입', target: '준수' }],
    estimatedBudget: 500000, generatedAt: new Date(),
  },
};

export default function MapBotPage() {
  const {
    activeTab, setActiveTab,
    vehicles, routeOptions, setRouteOptions,
    selectedRoute, setSelectedRoute,
    dispatchResult, setDispatchResult,
    isLoading, setLoading,
    error, setError,
    muPoints, setMuPoints,
    setUserId,
  } = useMapBotStore();

  // Hooks
  useRealtimeVehicles();

  // Local state
  const [originKey, setOriginKey] = useState('pohang_station');
  const [destKey, setDestKey] = useState('pohang_airport');
  const [purpose, setPurpose] = useState('business');
  const [priority, setPriority] = useState('fastest');
  const [passengers, setPassengers] = useState(1);
  const [drtPickup, setDrtPickup] = useState('pohang_station');
  const [drtDropoff, setDrtDropoff] = useState('pohang_airport');
  const [drtPax, setDrtPax] = useState(2);
  const [drtPriority, setDrtPriority] = useState('nearest');
  const [priceDist, setPriceDist] = useState(15);
  const [priceMode, setPriceMode] = useState('drt');
  const [priceTier, setPriceTier] = useState('normal');
  const [laasDomain, setLaasDomain] = useState<string | null>(null);
  const [laasPlan, setLaasPlan] = useState<LaasPlan | null>(null);
  const [userAge, setUserAge] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [userBudget, setUserBudget] = useState(300000);
  const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null);
  const [step, setStep] = useState(1);
  const [bookingModal, setBookingModal] = useState<{ open: boolean; data: Record<string, string> }>({ open: false, data: {} });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: '안녕하세요! 🤖 MapBot AI 어시스턴트입니다. 어떤 도움이 필요하신가요?' }
  ]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [achievements, setAchievements] = useState<string[]>(['🎉 첫 가입']);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  // Init Firebase Auth
  useEffect(() => {
    signInAnon().then((user) => setUserId(user.uid)).catch(() => {});
  }, [setUserId]);

  const notify = useCallback((msg: string, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ── Route Search ─────────────────────────────────────────────
  const searchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStep(2);
    try {
      const res = await fetch('/api/transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originKey, destinationKey: destKey, priority, passengers }),
      });
      const json = await res.json();
      if (json.success) {
        setRouteOptions(json.data);
        setSelectedRoute(json.data[0] ?? null);
        notify(`${json.data.length}개 경로를 찾았습니다! 🎉`);
        setStep(2);
      } else {
        setError(json.error);
        notify(json.error, 'error');
      }
    } catch (e) {
      notify('경로 탐색 오류', 'error');
    } finally {
      setLoading(false);
    }
  }, [originKey, destKey, priority, passengers, setLoading, setError, setRouteOptions, setSelectedRoute, notify]);

  // ── DRT Dispatch ─────────────────────────────────────────────
  const dispatchDRT = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupKey: drtPickup, dropoffKey: drtDropoff, passengers: drtPax, priority: drtPriority }),
      });
      const json = await res.json();
      if (json.success) {
        setDispatchResult(json.data);
        notify(`${json.data.assignedVehicle.id} 배차 완료! ETA ${json.data.etaMinutes}분 🚗`);
      } else {
        notify(json.error, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [drtPickup, drtDropoff, drtPax, drtPriority, setLoading, setDispatchResult, notify]);

  // ── Price Calc ────────────────────────────────────────────────
  const priceData = calculateDynamicPrice({
    distanceKm: priceDist, mode: priceMode, pricingTier: priceTier, muPoints, passengerCount: passengers,
  });

  // ── Booking ───────────────────────────────────────────────────
  const openBooking = (route: RouteOption) => {
    setBookingModal({
      open: true,
      data: {
        mode: route.steps[0]?.mode ?? 'DRT',
        time: `${route.totalDurationMinutes}분`,
        cost: String(route.totalCost),
        label: route.label,
        earn: String(route.muPointEarn),
      },
    });
  };

  const confirmBooking = () => {
    setBookingModal({ open: false, data: {} });
    setStep(3);
    const earnedPoints = parseInt(bookingModal.data.earn) || 0;
    setMuPoints(muPoints + earnedPoints);
    
    // Gamification: Add XP and check level up
    addXP(50, '예약 완료');
    
    // Add to trip history
    setTripHistory([...tripHistory, {
      date: new Date(),
      route: bookingModal.data.label,
      points: earnedPoints,
      mode: bookingModal.data.mode
    }]);
    
    notify('예약 확정! MU Point 적립 완료 🎫');
  };

  // ── Gamification ──────────────────────────────────────────────
  const addXP = (xp: number, reason: string) => {
    const newXP = userXP + xp;
    const xpForNextLevel = userLevel * 100;
    
    if (newXP >= xpForNextLevel) {
      const newLevel = userLevel + 1;
      setUserLevel(newLevel);
      setUserXP(newXP - xpForNextLevel);
      notify(`🎉 레벨 ${newLevel} 달성! ${reason}`, 'success');
      
      // Unlock achievements
      if (newLevel === 5) {
        setAchievements([...achievements, '⭐ 열정적인 여행자']);
      }
      if (newLevel === 10) {
        setAchievements([...achievements, '🏆 모빌리티 마스터']);
      }
    } else {
      setUserXP(newXP);
    }
  };

  const shareTrip = (trip: any) => {
    setShareData(trip);
    setShowShareModal(true);
  };

  // ── LaaS ──────────────────────────────────────────────────────
  const generateLaas = () => {
    if (!laasDomain) { notify('도메인을 선택해주세요', 'error'); return; }
    const plan = { ...LAAS_DATA[laasDomain], estimatedBudget: userBudget, generatedAt: new Date() };
    setLaasPlan(plan);
    notify(`${plan.title} 생성 완료! ✨`);
  };

  const originName = POHANG_LOCATIONS[originKey]?.name ?? '출발지';
  const destName = POHANG_LOCATIONS[destKey]?.name ?? '목적지';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                         px-8 py-5 bg-black/80 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="font-serif text-2xl font-semibold gradient-text">
          Map<span className="font-light opacity-70">Bot</span>
        </div>
        <nav className="flex gap-1 items-center">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium tracking-wider uppercase transition-all ${
                activeTab === t.id
                  ? 'bg-[#7c6ef5]/20 text-[#7c6ef5]'
                  : 'text-[#888899] hover:text-[#e8e8f0] hover:bg-white/5'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
          
          {/* Level & XP Display */}
          <div className="hidden md:flex items-center gap-2 ml-3 mr-2 glass-card px-3 py-1.5 rounded-full">
            <span className="text-[0.7rem] font-bold gradient-text">LV.{userLevel}</span>
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#5de6d0] transition-all duration-500"
                style={{ width: `${(userXP / (userLevel * 100)) * 100}%` }}
              />
            </div>
            <span className="text-[0.65rem] text-[#888899]">{userXP}/{userLevel * 100}XP</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#5de67a]/[0.08] border border-[#5de67a]/20
                          px-3 py-1.5 rounded-full text-[0.72rem] text-[#5de67a] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5de67a] animate-pulse" />
            AI 온라인
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center
                           px-8 pt-28 pb-16 overflow-hidden mesh-gradient">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px]
                        rounded-full pointer-events-none glow-purple animate-pulse"
             style={{ background: 'radial-gradient(ellipse, rgba(124,110,245,0.2) 0%, rgba(93,230,208,0.08) 45%, transparent 70%)' }} />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-[#7c6ef5]/10 blur-xl animate-float" />
        <div className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full bg-[#5de6d0]/10 blur-xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="text-[#7c6ef5] text-xs font-bold tracking-[0.3em] uppercase mb-5 animate-fade-in">
          ✦ Mobility AI Agent · MaaS · LaaS
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          당신의 일상을<br />
          <strong className="font-semibold gradient-text">
            서비스로 누리세요
          </strong>
        </h1>
        <p className="text-[#888899] text-base max-w-xl leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          카카오맵 + 실시간 대중교통 + DRT 배차<br />
          이동·숙박·패션·헬스케어·미용·투자까지
        </p>
        <div className="flex gap-4 flex-wrap justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button className="btn-accent" onClick={() => { setActiveTab('mobility'); window.scrollTo({ top: 600, behavior: 'smooth' }); }}>
            지금 시작하기 →
          </button>
          <button className="btn-ghost" onClick={() => { setActiveTab('fleet'); window.scrollTo({ top: 600, behavior: 'smooth' }); }}>
            실시간 Fleet 보기
          </button>
        </div>
        <div className="flex gap-8 mt-12 flex-wrap justify-center">
          {[['128', '운행 차량', '🚗'], ['1,240', '일 이용건', '📈'], ['12', '연계 도시', '🌐'], ['4.9', '만족도', '⭐']].map(([n, l, icon], i) => (
            <div key={l} className="text-center glass-card px-6 py-4 rounded-xl hover:scale-105 transition-transform duration-300 animate-fade-in" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
              <div className="text-xl mb-1">{icon}</div>
              <span className="font-serif text-2xl font-medium gradient-text block">{n}</span>
              <span className="text-xs text-[#888899] uppercase tracking-widest">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN APP ── */}
      <main className="max-w-[1400px] mx-auto px-6 pb-32 pt-8">
        {/* Mobile Tab Scroll */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-8 md:hidden scrollbar-none">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === t.id ? 'bg-[#16161f] text-[#7c6ef5]' : 'text-[#888899]'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══ MOBILITY TAB ══ */}
        {activeTab === 'mobility' && (
          <div className="animate-[fadeIn_0.35s_ease]">
            {/* Steps */}
            <div className="flex gap-0 mb-8">
              {['여정 입력', 'AI 추천', '예약 확정'].map((s, i) => (
                <div key={s} className="flex-1 text-center relative text-xs text-[#888899] font-medium">
                  {i < 2 && <div className="absolute top-[18px] left-1/2 w-full h-px bg-white/[0.07]" />}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                    mx-auto mb-2 relative z-10 border transition-all ${
                    step > i + 1 ? 'bg-[#7c6ef5] border-[#7c6ef5] text-white' :
                    step === i + 1 ? 'bg-[#7c6ef5]/20 border-[#7c6ef5] text-[#7c6ef5]' :
                    'bg-[#111118] border-white/[0.07]'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  {s}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Form */}
              <div>
                <div className="card-3d mb-5">
                  <div className="font-serif text-xl mb-5">🗺️ 이동 여정 검색
                    <span className="font-sans text-xs text-[#888899] font-normal ml-2">카카오맵 · ODsay 연동</span>
                  </div>
                  <div className="mb-4">
                    <label className="label">출발지</label>
                    <select className="input-field" value={originKey} onChange={(e) => setOriginKey(e.target.value)}>
                      {Object.entries(POHANG_LOCATIONS).map(([k, v]) => (
                        <option key={k} value={k}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="label">목적지</label>
                    <select className="input-field" value={destKey} onChange={(e) => setDestKey(e.target.value)}>
                      {Object.entries(POHANG_LOCATIONS).map(([k, v]) => (
                        <option key={k} value={k}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="label">이동 목적</label>
                      <select className="input-field" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                        <option value="business">비즈니스 출장</option>
                        <option value="leisure">여행·관광</option>
                        <option value="medical">의료·병원</option>
                        <option value="event">행사·공연</option>
                        <option value="commute">출퇴근</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">우선 순위</label>
                      <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="fastest">최단 시간</option>
                        <option value="cheapest">최저 비용</option>
                        <option value="eco">친환경</option>
                        <option value="comfort">편의성</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="label">탑승 인원</label>
                    <input type="number" className="input-field" value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value) || 1)} min={1} max={8} />
                  </div>
                  <button className="btn-accent w-full justify-center" onClick={searchRoutes} disabled={isLoading}>
                    {isLoading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '🔍'}
                    AI 최적 경로 탐색
                  </button>
                </div>
              </div>

              {/* Map + Results */}
              <div>
                <div className="w-full h-96 rounded-2xl overflow-hidden border border-white/[0.07] mb-5">
                  <KakaoMap
                    center={{ lat: 36.0320, lng: 129.3650 }}
                    vehicles={vehicles}
                    selectedRoute={selectedRoute}
                    mode="route"
                    originName={originName}
                    destName={destName}
                    className="w-full h-full"
                  />
                </div>

                {/* Route Results */}
                {routeOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs text-[#888899]">
                      📍 {originName} → {destName} — AI 추천 경로
                    </div>
                    {routeOptions.slice(0, 3).map((route, i) => (
                      <div key={route.id}
                        className={`result-item cursor-pointer ${i === 0 ? 'result-item-best' : ''} ${
                          selectedRoute?.id === route.id ? 'border-[#7c6ef5]/60' : ''
                        }`}
                        onClick={() => setSelectedRoute(route)}>
                        <div className={`rank-badge ${
                          i === 0 ? 'bg-[#f5c842]/20 text-[#f5c842]' :
                          i === 1 ? 'bg-[#5de6d0]/20 text-[#5de6d0]' : 'bg-[#7c6ef5]/20 text-[#7c6ef5]'
                        }`}>
                          {i === 0 ? '🏆 AI 추천' : i === 1 ? '2순위' : '3순위'}
                        </div>
                        <div className="font-semibold mb-1.5">{route.label}</div>
                        <div className="flex gap-4 text-xs text-[#888899] flex-wrap mb-3">
                          <span>⏱️ {route.totalDurationMinutes}분</span>
                          <span>💰 {route.totalCost.toLocaleString()}원</span>
                          <span>🌿 친환경 {route.ecoScore}%</span>
                          <span>😊 편의 {route.comfortScore}%</span>
                          <span>🔄 환승 {route.transferCount}회</span>
                        </div>
                        <div className="text-xs text-[#888899] mb-3">
                          {route.steps.map((s, si) => (
                            <span key={si}>{si > 0 && ' → '}{s.from} <span className="text-[#7c6ef5]">({s.mode})</span></span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-accent btn-sm" onClick={(e) => { e.stopPropagation(); openBooking(route); }}>예약</button>
                          <span className="text-xs text-[#5de6d0] flex items-center">+{route.muPointEarn}P 적립</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ FLEET TAB ══ */}
        {activeTab === 'fleet' && (
          <div className="animate-[fadeIn_0.35s_ease]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <div className="card-3d">
                  <div className="font-serif text-xl mb-5">🚗 실시간 Fleet 현황
                    <span className="font-sans text-xs text-[#5de67a] font-normal ml-2">● 실시간 SSE</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.07]">
                          {['차량ID', '유형', '위치', '상태', 'ETA', '승객'].map((h) => (
                            <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#888899]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => (
                          <tr key={v.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="py-3 px-3 font-bold">{v.id}</td>
                            <td className="py-3 px-3 text-[#888899]">{v.type}</td>
                            <td className="py-3 px-3 text-[#888899]">{v.locationName}</td>
                            <td className="py-3 px-3">
                              <span className={`v-status ${
                                v.status === 'available' ? 'v-online' : v.status === 'busy' ? 'v-busy' : 'v-offline'
                              }`}>
                                {v.status === 'available' ? '✅ 대기' : v.status === 'busy' ? '🟡 운행' : '⬛ 오프'}
                              </span>
                            </td>
                            <td className="py-3 px-3">{v.etaMinutes > 0 ? `${v.etaMinutes}분` : '즉시'}</td>
                            <td className="py-3 px-3">{v.currentPassengers}명</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!vehicles.length && (
                      <div className="py-10 text-center text-[#888899] text-sm">차량 데이터 로딩 중...</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-white/[0.07] mb-5">
                  <KakaoMap
                    center={{ lat: 36.0320, lng: 129.3650 }}
                    vehicles={vehicles}
                    mode="fleet"
                    className="w-full h-full"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    ['대기중', vehicles.filter((v) => v.status === 'available').length, '#5de67a'],
                    ['운행중', vehicles.filter((v) => v.status === 'busy').length, '#f5c842'],
                    ['오프라인', vehicles.filter((v) => v.status === 'offline').length, '#888899'],
                    ['탑승객', vehicles.reduce((s, v) => s + v.currentPassengers, 0), '#5de6d0'],
                  ].map(([label, val, color]) => (
                    <div key={label as string} className="card-sm text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: color as string }}>{val}</div>
                      <div className="text-xs text-[#888899] uppercase tracking-wide">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ DRT TAB ══ */}
        {activeTab === 'drt' && (
          <div className="animate-[fadeIn_0.35s_ease]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card-3d">
                <div className="font-serif text-xl mb-5">⚡ DRT 동적 배차
                  <span className="font-sans text-xs text-[#888899] font-normal ml-2">AI 할당 엔진</span>
                </div>
                <div className="mb-4">
                  <label className="label">픽업 위치</label>
                  <select className="input-field" value={drtPickup} onChange={(e) => setDrtPickup(e.target.value)}>
                    {Object.entries(POHANG_LOCATIONS).filter(([k]) => !k.includes('seoul') && !k.includes('incheon')).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="label">하차 위치</label>
                  <select className="input-field" value={drtDropoff} onChange={(e) => setDrtDropoff(e.target.value)}>
                    {Object.entries(POHANG_LOCATIONS).filter(([k]) => !k.includes('seoul') && !k.includes('incheon')).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="label">탑승 인원</label>
                    <input type="number" className="input-field" value={drtPax}
                      onChange={(e) => setDrtPax(parseInt(e.target.value) || 1)} min={1} max={8} />
                  </div>
                  <div>
                    <label className="label">배차 우선순위</label>
                    <select className="input-field" value={drtPriority} onChange={(e) => setDrtPriority(e.target.value)}>
                      <option value="nearest">최근접 차량</option>
                      <option value="fastest">최단 ETA</option>
                      <option value="eco">친환경 차량</option>
                      <option value="premium">프리미엄</option>
                    </select>
                  </div>
                </div>
                <button className="btn-accent w-full justify-center" onClick={dispatchDRT} disabled={isLoading}>
                  🚀 AI 배차 요청
                </button>

                {/* Dispatch Result */}
                {dispatchResult && (
                  <div className="mt-5 p-5 rounded-xl border border-[#7c6ef5]/30 bg-[#7c6ef5]/[0.06]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="rank-badge bg-[#5de67a]/20 text-[#5de67a]">✅ 배차 완료</span>
                      <span className="text-xs text-[#888899]">{new Date().toLocaleTimeString('ko-KR')}</span>
                    </div>
                    {[
                      ['배정 차량', `${dispatchResult.assignedVehicle.id} (${dispatchResult.assignedVehicle.type})`],
                      ['픽업', POHANG_LOCATIONS[drtPickup]?.name ?? drtPickup],
                      ['하차', POHANG_LOCATIONS[drtDropoff]?.name ?? drtDropoff],
                      ['탑승 인원', `${drtPax}명`],
                      ['예상 도착', `${dispatchResult.etaMinutes}분 후`],
                      ['예상 요금', `${dispatchResult.estimatedCost.toLocaleString()}원`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-white/[0.05] text-sm last:border-0">
                        <span className="text-[#888899]">{k}</span>
                        <span className="font-semibold">{v}</span>
                      </div>
                    ))}
                    {dispatchResult.poolingAvailable && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#5de6d0]/10 text-[#5de6d0] text-xs font-medium">
                        🔀 합승 가능 — 요금 20% 절감 옵션이 있습니다
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="card-3d mb-5">
                  <div className="font-serif text-xl mb-4">🔄 동적 라우팅 알고리즘</div>
                  <div className="space-y-3 text-sm">
                    {[
                      ['📍 Nearest Neighbor', '픽업 거리 최소화'],
                      ['⏱️ Greedy ETA', '대기 시간 최소화'],
                      ['🌿 EV Priority', '전기차 우선 배정'],
                      ['👥 Pooling Logic', '동일 방향 합승 감지'],
                      ['🧠 ML Demand Forecast', '수요 예측 선배치'],
                    ].map(([t, d]) => (
                      <div key={t as string} className="flex justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        <span className="font-semibold">{t}</span>
                        <span className="text-[#888899]">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/[0.07]">
                  <KakaoMap
                    center={POHANG_LOCATIONS[drtPickup] ?? { lat: 36.0320, lng: 129.3650 }}
                    vehicles={vehicles.filter((v) => v.status !== 'offline')}
                    mode="fleet"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PRICING TAB ══ */}
        {activeTab === 'pricing' && (
          <div className="animate-[fadeIn_0.35s_ease]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card-3d">
                <div className="font-serif text-xl mb-5">💎 동적 요금 계산
                  <span className="font-sans text-xs text-[#888899] font-normal ml-2">MU Point 적용</span>
                </div>
                <div className="mb-4">
                  <label className="label">이동 거리 (km)</label>
                  <input type="number" className="input-field" value={priceDist}
                    onChange={(e) => setPriceDist(parseFloat(e.target.value) || 15)} min={1} max={500} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="label">이동 수단</label>
                    <select className="input-field" value={priceMode} onChange={(e) => setPriceMode(e.target.value)}>
                      <option value="drt">DRT</option>
                      <option value="taxi">택시</option>
                      <option value="bus">버스</option>
                      <option value="ktx">KTX</option>
                      <option value="boat">전기보트(보트랑)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">시간대</label>
                    <select className="input-field" value={priceTier} onChange={(e) => setPriceTier(e.target.value)}>
                      <option value="normal">평상시</option>
                      <option value="peak">혼잡 (+20%)</option>
                      <option value="night">야간 (+15%)</option>
                      <option value="off">비수기 (-10%)</option>
                    </select>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="label">보유 MU Point</label>
                  <input type="number" className="input-field" value={muPoints}
                    onChange={(e) => setMuPoints(parseInt(e.target.value) || 0)} min={0} />
                </div>
                {/* Price Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['기본 요금', priceData.subtotal.toLocaleString() + '원', '#e8e8f0'],
                    ['Point 할인', '-' + priceData.muPointDiscount.toLocaleString() + '원', '#5de67a'],
                    ['최종 결제', priceData.finalFare.toLocaleString() + '원', '#7c6ef5'],
                    ['적립 Point', '+' + priceData.muPointEarn + 'P', '#5de6d0'],
                  ].map(([k, v, color]) => (
                    <div key={k as string} className="card-sm text-center">
                      <div className="text-xl font-bold mb-1" style={{ color: color as string }}>{v}</div>
                      <div className="text-xs text-[#888899] uppercase tracking-wide">{k}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="card-3d mb-5">
                  <div className="font-serif text-xl mb-4">⭐ MU Point 현황</div>
                  <div className="text-3xl font-bold text-[#5de6d0] mb-5">{muPoints.toLocaleString()} P</div>
                  <div className="space-y-1">
                    {[
                      { date: '오늘', desc: 'DRT 이용', delta: +priceData.muPointEarn },
                      { date: '어제', desc: '버스 이용', delta: +30 },
                      { date: '2일 전', desc: 'DRT 이용', delta: +150, used: -200 },
                      { date: '3일 전', desc: '택시 이용', delta: +120 },
                    ].map((h, i) => (
                      <div key={i} className="flex justify-between py-2.5 border-b border-white/[0.05] text-sm last:border-0">
                        <span className="text-[#888899]">{h.date} · {h.desc}</span>
                        <span>
                          {h.delta > 0 && <span className="text-[#5de67a]">+{h.delta}P</span>}
                          {h.used && <span className="text-[#f55e5e] ml-2">{h.used}P</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-3d">
                  <div className="font-serif text-xl mb-4">💳 결제 수단</div>
                  <div className="space-y-2.5">
                    {[['💳 신용카드', 'card'], ['📱 카카오페이', 'kakao'], ['⭐ MU Point 전액', 'mu'], ['🏢 법인카드', 'corp']].map(([l, v]) => (
                      <label key={v} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:border-[#7c6ef5]/30 transition-colors">
                        <input type="radio" name="pay" value={v} className="accent-[#7c6ef5]" defaultChecked={v === 'card'} />
                        <span className="text-sm">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ LaaS TAB ══ */}
        {activeTab === 'laas' && (
          <div className="animate-[fadeIn_0.35s_ease]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card-3d">
                <div className="font-serif text-xl mb-5">🤖 나만의 LaaS AI 에이전트
                  <span className="font-sans text-xs text-[#888899] font-normal ml-2">Life as a Service</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {[['fashion', '👗 패션'], ['healthcare', '🏥 헬스케어'], ['beauty', '💄 미용'], ['investment', '📈 투자']].map(([k, l]) => (
                    <button key={k} onClick={() => setLaasDomain(k)}
                      className={`btn justify-center text-sm py-3 transition-all ${
                        laasDomain === k ? 'btn-accent' : 'btn-ghost'
                      }`}>{l}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="label">나이</label>
                    <input type="number" className="input-field" placeholder="35" value={userAge}
                      onChange={(e) => setUserAge(e.target.value)} min={15} max={80} />
                  </div>
                  <div>
                    <label className="label">성별</label>
                    <select className="input-field">
                      <option>남성</option><option>여성</option><option>미지정</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="label">목표 / 관심사</label>
                  <input type="text" className="input-field" placeholder="예: 직장인 데일리룩, 체중감량 10kg"
                    value={userGoal} onChange={(e) => setUserGoal(e.target.value)} />
                </div>
                <div className="mb-5">
                  <label className="label">월 예산 (원)</label>
                  <input type="number" className="input-field" value={userBudget}
                    onChange={(e) => setUserBudget(parseInt(e.target.value) || 0)} step={50000} />
                </div>
                <button className="btn-accent w-full justify-center" onClick={generateLaas}>
                  ✨ AI 개인 플랜 생성
                </button>
              </div>

              <div>
                {laasPlan ? (
                  <div className="p-6 rounded-2xl border border-[#7c6ef5]/20 bg-gradient-to-br from-[#7c6ef5]/[0.08] to-[#5de6d0]/[0.04]">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h2 className="font-serif text-xl mb-1">{laasPlan.title}</h2>
                        <p className="text-xs text-[#888899]">{userAge ? `${userAge}세 · ` : ''}월 {userBudget.toLocaleString()}원 예산</p>
                      </div>
                      <span className="tag tag-teal">AI 생성</span>
                    </div>
                    <div className="mb-5">
                      <div className="text-xs font-bold tracking-widest uppercase text-[#7c6ef5] mb-3">📌 전략</div>
                      <div className="flex flex-wrap gap-2">
                        {laasPlan.strategy.map((s) => <span key={s} className="tag text-xs">{s}</span>)}
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="text-xs font-bold tracking-widest uppercase text-[#7c6ef5] mb-3">🗓️ 4주 실행 플랜</div>
                      {laasPlan.weeklyActions.map((a, i) => (
                        <div key={i} className="flex gap-3 py-2.5 border-b border-white/[0.05] text-sm last:border-0">
                          <span>{['1️⃣','2️⃣','3️⃣','4️⃣'][i]}</span>
                          <span className="text-[#888899]">{a}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mb-5">
                      <div className="text-xs font-bold tracking-widest uppercase text-[#f55e5e] mb-3">⚠️ 주의사항</div>
                      {laasPlan.warnings.map((w) => (
                        <div key={w} className="text-xs text-[#888899] py-1">⚠️ {w}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {laasPlan.kpis.map((k) => (
                        <div key={k.label} className="card-sm text-center">
                          <div className="font-bold text-[#5de6d0] mb-1">{k.target}</div>
                          <div className="text-xs text-[#888899]">{k.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="card h-full flex items-center justify-center text-center py-20 text-[#888899]">
                    <div>
                      <div className="text-5xl mb-4">🤖</div>
                      <div>도메인을 선택하고 정보를 입력하면<br />AI가 나만의 플랜을 제안합니다</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ SUBSCRIBE TAB ══ */}
        {activeTab === 'subscribe' && (
          <div className="animate-fade-in">
            {/* Hero Banner */}
            <div className="relative mb-12 rounded-3xl overflow-hidden glass-card p-12 text-center mesh-gradient">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c6ef5]/20 to-[#5de6d0]/20" />
              <div className="relative z-10">
                <div className="text-5xl mb-4 animate-bounce-slow inline-block">👑</div>
                <h2 className="font-serif text-4xl font-bold gradient-text mb-4">
                  Premium으로 업그레이드
                </h2>
                <p className="text-[#888899] text-lg max-w-2xl mx-auto mb-6">
                  AI 기반 최적 경로, 우선 배차, 무제한 LaaS 플랜까지<br />
                  프리미엄 기능으로 더 스마트한 모빌리티를 경험하세요
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <div className="glass-card px-6 py-3 rounded-xl">
                    <div className="text-2xl font-bold gradient-text">1,240+</div>
                    <div className="text-xs text-[#888899]">일일 이용자</div>
                  </div>
                  <div className="glass-card px-6 py-3 rounded-xl">
                    <div className="text-2xl font-bold gradient-text">4.9/5.0</div>
                    <div className="text-xs text-[#888899]">사용자 평점</div>
                  </div>
                  <div className="glass-card px-6 py-3 rounded-xl">
                    <div className="text-2xl font-bold gradient-text">99.9%</div>
                    <div className="text-xs text-[#888899]">서비스 가동률</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {SUBSCRIPTION_PLANS.map((plan, i) => (
                <div
                  key={plan.id}
                  className={`card-3d relative ${plan.popular ? 'ring-2 ring-[#7c6ef5] scale-105' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[#7c6ef5] to-[#5de6d0] px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                        {plan.badge}
                      </div>
                    </div>
                  )}
                  {plan.discount && (
                    <div className="absolute -top-3 right-3">
                      <div className="bg-[#f5c842] px-3 py-1 rounded-full text-xs font-bold text-[#0a0a0f]">
                        {plan.discount}
                      </div>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">{plan.icon}</div>
                    <div className="font-serif text-2xl font-bold mb-2">{plan.name}</div>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      {plan.price > 0 ? (
                        <>
                          <span className="text-4xl font-bold gradient-text">
                            {plan.price.toLocaleString()}
                          </span>
                          <span className="text-[#888899] text-sm">원/{plan.period}</span>
                        </>
                      ) : plan.id === 'free' ? (
                        <span className="text-4xl font-bold gradient-text">무료</span>
                      ) : (
                        <span className="text-2xl font-bold gradient-text">{plan.period}</span>
                      )}
                    </div>
                    {plan.price > 0 && plan.id !== 'enterprise' && (
                      <div className="text-xs text-[#888899]">
                        연 결제 시 2개월 무료
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2 text-sm">
                        <span className={`mt-0.5 ${f.included ? 'text-[#5de67a]' : 'text-[#888899]'}`}>
                          {f.included ? '✓' : '○'}
                        </span>
                        <span className={f.included ? 'text-[#e8e8f0]' : 'text-[#888899] line-through'}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => {
                      if (plan.id === currentPlan) {
                        notify('현재 사용 중인 플랜입니다', 'error');
                      } else if (plan.id === 'enterprise') {
                        notify('기업 문의가 접수되었습니다! 곧 연락드리겠습니다 📧');
                      } else {
                        setSelectedPlan(plan);
                        setShowPaymentModal(true);
                      }
                    }}
                    disabled={plan.id === currentPlan}
                    className={`w-full btn ${
                      plan.popular
                        ? 'btn-accent'
                        : plan.id === 'enterprise'
                        ? 'btn-gold'
                        : plan.id === 'basic'
                        ? 'btn-teal'
                        : 'btn-ghost'
                    } justify-center ${plan.id === currentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {plan.id === currentPlan ? '✓ ' + plan.cta : plan.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: '🚀', title: '즉시 시작', desc: '가입 후 바로 프리미엄 기능 사용' },
                { icon: '🔒', title: '안전한 결제', desc: '카카오페이/토스 간편 결제 지원' },
                { icon: '↩️', title: '언제든 해지', desc: '위약금 없이 자유롭게 플랜 변경' },
              ].map((b, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                  <div className="text-4xl mb-3">{b.icon}</div>
                  <div className="font-semibold text-lg mb-2">{b.title}</div>
                  <div className="text-sm text-[#888899]">{b.desc}</div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="card-3d">
              <div className="font-serif text-2xl mb-6">자주 묻는 질문</div>
              <div className="space-y-4">
                {[
                  { q: '무료 플랜에서 언제든 업그레이드 가능한가요?', a: '네, 언제든지 프리미엄 플랜으로 업그레이드하실 수 있습니다. 남은 기간은 일할 계산됩니다.' },
                  { q: '환불 정책은 어떻게 되나요?', a: '구독 후 7일 이내 100% 환불 가능합니다. 이후에는 남은 기간만큼 일할 계산하여 환불해드립니다.' },
                  { q: 'MU Point는 무엇인가요?', a: 'MapBot 전용 포인트로 1P = 1원입니다. 결제 시 자동 차감되며, 프리미엄 회원은 매월 포인트가 지급됩니다.' },
                  { q: '기업용 플랜은 어떤 혜택이 있나요?', a: '직원 계정 무제한, 전용 대시보드, 출장 정책 관리, API 지원 등 기업 맞춤 기능을 제공합니다.' },
                ].map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="cursor-pointer list-none flex justify-between items-center p-4 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl transition-colors">
                      <span className="font-medium">{faq.q}</span>
                      <span className="text-[#7c6ef5] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="p-4 text-sm text-[#888899] bg-white/[0.02] rounded-xl mt-2">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ COMMUNITY TAB ══ */}
        {activeTab === 'community' && (
          <div className="animate-fade-in">
            {/* Leaderboard & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Leaderboard */}
              <div className="card-3d">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-serif text-2xl">🏆 리더보드</div>
                  <div className="text-xs text-[#888899]">이번 주</div>
                </div>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: '김민수', level: 12, xp: 2400, badge: '👑' },
                    { rank: 2, name: '이지은', level: 10, xp: 1950, badge: '🥈' },
                    { rank: 3, name: '박준영', level: 9, xp: 1820, badge: '🥉' },
                    { rank: 4, name: currentPlan !== 'free' ? '나' : '???', level: userLevel, xp: userXP + (userLevel - 1) * 100, badge: '👤', highlight: true },
                    { rank: 5, name: '최서윤', level: 8, xp: 1650, badge: '⭐' },
                  ].map((user, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      user.highlight
                        ? 'bg-gradient-to-r from-[#7c6ef5]/20 to-[#5de6d0]/20 border-2 border-[#7c6ef5]/50'
                        : 'bg-white/[0.03] hover:bg-white/[0.05]'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${user.highlight ? 'animate-bounce-slow' : ''}`}>{user.badge}</div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {user.name}
                            {user.highlight && <span className="text-xs text-[#7c6ef5]">(나)</span>}
                          </div>
                          <div className="text-xs text-[#888899]">레벨 {user.level} · {user.xp}XP</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold gradient-text">#{user.rank}</div>
                    </div>
                  ))}
                </div>
                {currentPlan === 'free' && (
                  <div className="mt-4 p-4 bg-white/[0.03] rounded-xl border border-white/[0.07] text-center">
                    <div className="text-sm text-[#888899] mb-2">
                      🔒 프리미엄 회원만 리더보드에 참여할 수 있습니다
                    </div>
                    <button
                      className="btn-accent btn-sm"
                      onClick={() => setActiveTab('subscribe')}>
                      Premium 가입하기
                    </button>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="card-3d">
                <div className="font-serif text-2xl mb-6">🎖️ 내 업적</div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {achievements.map((achievement, i) => (
                    <div key={i} className="glass-card p-4 rounded-xl text-center animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="text-3xl mb-2">{achievement.split(' ')[0]}</div>
                      <div className="text-xs text-[#888899]">{achievement.split(' ').slice(1).join(' ')}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="text-sm font-semibold mb-3">🎯 다음 업적까지</div>
                  <div className="space-y-2">
                    {[
                      { emoji: '🚀', title: '스피드러너', desc: '10회 빠른 경로 이용', progress: Math.min(tripHistory.length, 10), max: 10 },
                      { emoji: '💎', title: '포인트 수집가', desc: '1000P 적립', progress: Math.min(muPoints, 1000), max: 1000 },
                      { emoji: '🌍', title: '여행 탐험가', desc: '5개 도시 방문', progress: 1, max: 5 },
                    ].map((achievement, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{achievement.emoji} {achievement.title}</span>
                          <span className="text-[#888899]">{achievement.progress}/{achievement.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#5de6d0] transition-all duration-500"
                            style={{ width: `${(achievement.progress / achievement.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip History & Reviews */}
            <div className="card-3d">
              <div className="font-serif text-2xl mb-6">📜 여행 기록 & 리뷰</div>
              {tripHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🗺️</div>
                  <div className="text-[#888899] mb-4">아직 여행 기록이 없습니다</div>
                  <button
                    className="btn-accent"
                    onClick={() => setActiveTab('mobility')}>
                    첫 여행 시작하기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tripHistory.slice(0, 5).map((trip, i) => (
                    <div key={i} className="result-item flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{trip.mode === 'DRT' ? '⚡' : trip.mode === 'bus' ? '🚌' : '🚗'}</span>
                          <div className="font-semibold">{trip.route}</div>
                          <span className="tag tag-teal">{trip.mode}</span>
                        </div>
                        <div className="text-xs text-[#888899]">
                          {new Date(trip.date).toLocaleDateString('ko-KR')} · +{trip.points}P 적립
                        </div>
                      </div>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => shareTrip(trip)}>
                        📤 공유
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ ADMIN TAB ══ */}
        {activeTab === 'admin' && <AdminPanel vehicles={vehicles} />}
      </main>

      {/* ── BOOKING MODAL ── */}
      {bookingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
          onClick={() => setBookingModal({ open: false, data: {} })}>
          <div className="bg-[#16161f] border border-white/[0.07] rounded-2xl p-9 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-6">
              <div className="font-serif text-2xl">🎫 예약 확인</div>
              <button className="text-[#888899] text-xl" onClick={() => setBookingModal({ open: false, data: {} })}>✕</button>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-5 mb-5 space-y-2.5">
              {[['경로', bookingModal.data.label], ['이동 수단', bookingModal.data.mode],
                ['소요 시간', bookingModal.data.time],
                ['결제 금액', parseInt(bookingModal.data.cost || '0').toLocaleString() + '원'],
                ['예상 적립', `+${bookingModal.data.earn}P`]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-[#888899]">{k}</span>
                  <span className={k === '예상 적립' ? 'text-[#5de6d0] font-semibold' : 'font-semibold'}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="label">연락처</label>
              <input type="tel" className="input-field" placeholder="010-0000-0000" />
            </div>
            <div className="mb-5">
              <label className="label">특이사항</label>
              <textarea className="input-field" placeholder="휠체어 필요, 유아 동반 등" rows={3} />
            </div>
            <button className="btn-accent w-full justify-center" onClick={confirmBooking}>
              ✅ 예약 확정
            </button>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setShowPaymentModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="font-serif text-2xl">💳 결제하기</div>
              <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                onClick={() => setShowPaymentModal(false)}>
                ✕
              </button>
            </div>

            {/* Plan Summary */}
            <div className={`bg-gradient-to-br ${selectedPlan.color} p-6 rounded-2xl mb-6 text-white`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{selectedPlan.icon}</span>
                <div>
                  <div className="font-bold text-xl">{selectedPlan.name} Plan</div>
                  <div className="text-sm opacity-90">{selectedPlan.period} 구독</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{selectedPlan.price.toLocaleString()}</span>
                <span className="text-lg">원/월</span>
              </div>
              {selectedPlan.discount && (
                <div className="mt-2 text-sm opacity-90">🎉 {selectedPlan.discount}</div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <label className="label mb-3">결제 수단</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card', icon: '💳', name: '카드' },
                  { id: 'kakao', icon: '🟡', name: '카카오페이' },
                  { id: 'toss', icon: '🔵', name: '토스' },
                ].map((method) => (
                  <button
                    key={method.id}
                    className="glass-card p-4 rounded-xl hover:border-[#7c6ef5]/50 hover:bg-white/[0.08] transition-all text-center">
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-xs">{method.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Code */}
            <div className="mb-6">
              <label className="label">할인 코드 (선택)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="WELCOME2024"
                />
                <button className="btn-ghost px-6">
                  적용
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-white/[0.03] rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#888899]">월 구독료</span>
                <span className="font-semibold">{selectedPlan.price.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#888899]">할인</span>
                <span className="text-[#5de6d0] font-semibold">-0원</span>
              </div>
              <div className="border-t border-white/[0.1] my-3" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">총 결제 금액</span>
                <span className="font-bold text-2xl gradient-text">{selectedPlan.price.toLocaleString()}원</span>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 mb-6 text-sm">
              <input type="checkbox" className="mt-1" />
              <span className="text-[#888899]">
                <span className="text-[#e8e8f0]">서비스 이용약관</span> 및 <span className="text-[#e8e8f0]">개인정보 처리방침</span>에 동의합니다
              </span>
            </label>

            {/* CTA */}
            <button
              className="btn-accent w-full justify-center text-lg py-4"
              onClick={() => {
                setShowPaymentModal(false);
                setCurrentPlan(selectedPlan.id);
                notify(`🎉 ${selectedPlan.name} 플랜 구독 완료! ${selectedPlan.features.find(f => f.text.includes('Point'))?.text || ''}`);
                setActiveTab('mobility');
              }}>
              💳 {selectedPlan.price.toLocaleString()}원 결제하기
            </button>
            <div className="text-center text-xs text-[#888899] mt-3">
              안전한 PG사 결제 시스템을 이용합니다
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE MODAL ── */}
      {showShareModal && shareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setShowShareModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="font-serif text-2xl">📤 여행 공유</div>
              <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                onClick={() => setShowShareModal(false)}>
                ✕
              </button>
            </div>

            {/* Share Preview */}
            <div className="bg-gradient-to-br from-[#7c6ef5]/20 to-[#5de6d0]/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c6ef5] to-[#9b8ff8] flex items-center justify-center text-2xl">
                  🗺️
                </div>
                <div>
                  <div className="font-semibold">{shareData.route}</div>
                  <div className="text-xs text-[#888899]">MapBot으로 여행했어요!</div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="tag">{shareData.mode}</span>
                <span className="tag tag-teal">+{shareData.points}P</span>
                <span className="tag tag-gold">LV.{userLevel}</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-3 mb-6">
              <button
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD000] text-[#000000] font-semibold transition-all"
                onClick={() => {
                  notify('카카오톡으로 공유되었습니다! 🎉');
                  addXP(10, '여행 공유');
                  setShowShareModal(false);
                }}>
                <span className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  카카오톡 공유
                </span>
                <span>→</span>
              </button>

              <button
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-semibold transition-all hover:opacity-90"
                onClick={() => {
                  notify('인스타그램 스토리에 공유되었습니다! ✨');
                  addXP(10, '여행 공유');
                  setShowShareModal(false);
                }}>
                <span className="flex items-center gap-2">
                  <span className="text-xl">📷</span>
                  인스타그램 스토리
                </span>
                <span>→</span>
              </button>

              <button
                className="w-full flex items-center justify-between p-4 rounded-xl glass-card hover:bg-white/[0.08] transition-all"
                onClick={() => {
                  navigator.clipboard?.writeText(`${shareData.route}에 다녀왔어요! MapBot으로 +${shareData.points}P 적립 🎉`);
                  notify('링크가 복사되었습니다! 📋');
                  addXP(5, '링크 복사');
                  setShowShareModal(false);
                }}>
                <span className="flex items-center gap-2">
                  <span className="text-xl">🔗</span>
                  링크 복사
                </span>
                <span>→</span>
              </button>
            </div>

            <div className="text-xs text-[#888899] text-center">
              공유하면 +10XP를 획득합니다!
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION ── */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-50 glass rounded-xl px-5 py-4 text-sm font-medium
          max-w-xs shadow-2xl animate-[fadeIn_0.3s_ease] border ${
          notification.type === 'success' ? 'border-[#5de67a]/30' : 'border-[#f55e5e]/30'
        }`}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}

// ── Admin Panel ──────────────────────────────────────────────
function AdminPanel({ vehicles }: { vehicles: Vehicle[] }) {
  useRealtimeHeatmap();
  const heatmapData = useMapBotStore((s) => s.heatmapData);

  return (
    <div className="animate-[fadeIn_0.35s_ease]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="card-3d">
            <div className="font-serif text-xl mb-4">📊 수요 히트맵
              <span className="font-sans text-xs text-[#888899] font-normal ml-2">포항시 기준</span>
            </div>
            <div className="w-full h-80 rounded-xl overflow-hidden border border-white/[0.07]">
              <KakaoMap
                center={{ lat: 36.0320, lng: 129.3650 }}
                heatmapPoints={heatmapData}
                mode="heatmap"
                level={8}
                className="w-full h-full"
              />
            </div>
            <div className="flex gap-3 mt-3">
              <span className="tag tag-red">🔴 고수요</span>
              <span className="tag tag-gold">🟡 중수요</span>
              <span className="tag tag-teal">🟢 저수요</span>
            </div>
          </div>
        </div>
        <div>
          <div className="card-3d mb-5">
            <div className="font-serif text-xl mb-4">⚙️ 운영 지표</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['평균 대기', '3.2분', '↓', '#5de67a'],
                ['가동률', '78%', '↑', '#f5c842'],
                ['일 이동건', '1,240', '↑', '#7c6ef5'],
                ['CO₂ 절감', '4.2톤', '↑', '#5de6d0'],
                ['만족도', '4.88', '→', '#f5c842'],
                ['평균 요금', '₩16,400', '↑', '#e8e8f0'],
              ].map(([l, v, t, c]) => (
                <div key={l as string} className="card-sm">
                  <div className="text-xs text-[#888899] uppercase tracking-wide mb-1.5">{l}</div>
                  <div className="text-xl font-bold" style={{ color: c as string }}>
                    {v} <span className="text-sm">{t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-3d">
            <div className="font-serif text-xl mb-4">🏙️ 기업 정책 준수 현황</div>
            <div className="space-y-2">
              {[
                { type: '승인완료', user: '김○○ 팀장', route: '포항→서울', cost: '₩182,000', s: 'ok' },
                { type: '정책위반', user: '이○○ 대리', route: '서울→제주', cost: '₩320,000', s: 'warn', note: '항공권 한도 초과' },
                { type: '승인대기', user: '박○○ 과장', route: '포항→부산', cost: '₩95,000', s: 'pending' },
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-start py-3 border-b border-white/[0.05] last:border-0 text-sm">
                  <div>
                    <span className={`v-status ${c.s === 'ok' ? 'v-online' : c.s === 'warn' ? 'v-busy' : 'v-offline'}`}>
                      {c.s === 'ok' ? '✅ 승인' : c.s === 'warn' ? '⚠️ 위반' : '🕐 대기'}
                    </span>
                    <span className="ml-2 text-[#888899]">{c.user} · {c.route}</span>
                    {c.note && <div className="text-xs text-[#f55e5e] mt-1">⚠️ {c.note}</div>}
                  </div>
                  <span className="font-semibold">{c.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ AI CHATBOT FAB & PANEL ══ */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Panel */}
        {chatOpen && (
          <div className="absolute bottom-20 right-0 w-96 h-[500px] 
                          glass-card rounded-2xl
                          flex flex-col overflow-hidden
                          animate-scale-in shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7c6ef5] to-[#5de6d0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">MapBot AI</div>
                  <div className="text-xs text-white/70">실시간 응답 가능</div>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 
                          flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#7c6ef5] to-[#9b8ff8] text-white'
                      : 'bg-white/[0.08] text-[#e8e8f0] border border-white/[0.1]'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.1]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl 
                            px-4 py-2.5 text-sm text-[#e8e8f0]
                            focus:border-[#7c6ef5] focus:outline-none focus:ring-2 focus:ring-[#7c6ef5]/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const userMsg = e.currentTarget.value.trim();
                      setChatMessages([...chatMessages, 
                        { role: 'user', text: userMsg },
                        { role: 'ai', text: `"${userMsg}"에 대한 답변을 준비 중입니다... 🔍` }
                      ]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button className="btn-accent btn-sm px-4">
                  전송
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] 
                            text-[#888899] hover:text-[#e8e8f0] transition-colors"
                  onClick={() => setChatMessages([...chatMessages, 
                    { role: 'user', text: '가장 빠른 경로 추천해줘' },
                    { role: 'ai', text: '포항역에서 포항공항까지 DRT 배차로 약 25분 소요됩니다. 지금 바로 예약하시겠어요?' }
                  ])}>
                  💬 빠른 경로
                </button>
                <button 
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] 
                            text-[#888899] hover:text-[#e8e8f0] transition-colors"
                  onClick={() => setChatMessages([...chatMessages, 
                    { role: 'user', text: '포인트 사용법 알려줘' },
                    { role: 'ai', text: '현재 500 MU Point를 보유 중이십니다. 결제 시 1P = 1원으로 자동 차감됩니다! 💎' }
                  ])}>
                  💎 포인트 안내
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="chat-fab relative"
          title="AI 어시스턴트">
          🤖
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#5de67a] rounded-full 
                          border-2 border-[#0a0a0f] pulse-ring" />
        </button>
      </div>

      {/* ══ NOTIFICATION TOAST ══ */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 
                        glass-card px-6 py-4 rounded-xl
                        animate-slide-in shadow-2xl
                        ${notification.type === 'error' ? 'border-[#f55e5e]/40' : 'border-[#5de67a]/40'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {notification.type === 'error' ? '⚠️' : '✅'}
            </span>
            <span className="text-sm font-medium text-[#e8e8f0]">
              {notification.msg}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Type for AdminPanel
import type { Vehicle } from '@/types';
