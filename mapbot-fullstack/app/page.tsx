'use client';
// ============================================================
// 나만의맵봇 (My MapBot) — BI Brand Site (Client)
// 2025 Trend: Interactive Scroll, Shoppable LaaS, Dynamic Components
// ============================================================
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useMapBotStore } from '@/lib/store';
import { useRealtimeVehicles } from '@/hooks/useRealtime';

// Dynamically load map (no SSR)
const KakaoMap = dynamic(() => import('@/components/KakaoMap'), { ssr: false });

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'about', label: 'About', icon: '✨' },
  { id: 'services', label: 'Services', icon: '🚀' },
  { id: 'laas', label: 'LaaS Shop', icon: '🛍️' },
  { id: 'pricing', label: 'Pricing', icon: '💎' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'contact', label: 'Contact', icon: '📞' },
];

// LaaS Products (Shoppable)
const LAAS_PRODUCTS = [
  {
    id: 'fashion',
    category: 'Fashion & Style',
    title: '퍼스널 스타일링 AI',
    tagline: '당신만의 패션 큐레이터',
    price: 299000,
    monthly: 29900,
    icon: '👗',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    features: [
      'AI 기반 스타일 분석',
      '매주 맞춤 코디 추천',
      '브랜드 할인 쿠폰',
      '온라인 쇼핑 어시스턴트',
      '시즌별 워드로브 관리'
    ],
    demo: '코디 시뮬레이터 체험',
    popular: false,
    trending: true,
  },
  {
    id: 'healthcare',
    category: 'Health & Wellness',
    title: '스마트 건강관리 AI',
    tagline: '개인 맞춤형 웰니스 플랜',
    price: 199000,
    monthly: 19900,
    icon: '🏥',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    features: [
      '일일 건강 체크',
      '운동 루틴 자동 생성',
      '영양 밸런스 분석',
      '수면 패턴 추적',
      '스트레스 관리 가이드'
    ],
    demo: '건강 스코어 확인',
    popular: true,
    trending: false,
  },
  {
    id: 'beauty',
    category: 'Beauty & Skincare',
    title: '뷰티 루틴 AI',
    tagline: '피부 고민 해결사',
    price: 149000,
    monthly: 14900,
    icon: '💄',
    image: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    features: [
      '피부 타입 진단',
      '맞춤형 스킨케어 루틴',
      '성분 분석 & 추천',
      '뷰티 제품 리뷰',
      '계절별 케어 팁'
    ],
    demo: '피부 진단 시작',
    popular: false,
    trending: true,
  },
  {
    id: 'finance',
    category: 'Finance & Investment',
    title: '스마트 투자 AI',
    tagline: '똑똑한 자산 관리',
    price: 499000,
    monthly: 49900,
    icon: '📈',
    image: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    features: [
      'AI 포트폴리오 최적화',
      '리스크 분석 리포트',
      '투자 시그널 알림',
      '세금 절세 전략',
      '자산 배분 시뮬레이션'
    ],
    demo: '포트폴리오 분석',
    popular: true,
    trending: true,
  },
  {
    id: 'travel',
    category: 'Travel & Leisure',
    title: '여행 플래너 AI',
    tagline: '완벽한 여행 설계',
    price: 179000,
    monthly: 17900,
    icon: '✈️',
    image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    features: [
      '맞춤형 여행 일정',
      '숙소 & 맛집 추천',
      '실시간 항공권 비교',
      '현지 교통 가이드',
      '여행 경비 최적화'
    ],
    demo: '여행 플랜 만들기',
    popular: false,
    trending: false,
  },
  {
    id: 'education',
    category: 'Education & Career',
    title: '커리어 성장 AI',
    tagline: '성장하는 나를 위한 멘토',
    price: 249000,
    monthly: 24900,
    icon: '🎓',
    image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    features: [
      'AI 이력서 첨삭',
      '면접 시뮬레이션',
      '스킬 로드맵 제공',
      '강의 & 코스 추천',
      '업계 트렌드 분석'
    ],
    demo: '커리어 진단',
    popular: false,
    trending: false,
  },
];

// Pricing Plans
const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: '영구 무료',
    icon: '🌱',
    color: 'from-gray-400 to-gray-600',
    features: [
      'LaaS 제품 1개 무료 체험',
      '기본 대시보드',
      '커뮤니티 액세스',
      '월 10회 AI 상담',
      '이메일 지원'
    ],
    cta: '무료 시작',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49900,
    period: '월',
    icon: '⭐',
    color: 'from-purple-500 to-pink-500',
    features: [
      'LaaS 제품 3개 동시 이용',
      '프리미엄 대시보드',
      '우선 AI 상담 (무제한)',
      '데이터 분석 리포트',
      '24/7 채팅 지원',
      '모바일 앱 접근'
    ],
    cta: '프로 시작하기',
    popular: true,
    badge: 'BEST SELLER',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: '맞춤 견적',
    icon: '🏢',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'LaaS 제품 무제한',
      '전담 AI 어시스턴트',
      '맞춤형 통합 솔루션',
      'API 액세스',
      '온프레미스 배포',
      '전담 계정 매니저'
    ],
    cta: '영업팀 문의',
    popular: false,
  },
];

export default function MyMapBotPage() {
  const {
    activeTab, setActiveTab,
    vehicles,
    muPoints, setMuPoints,
  } = useMapBotStore();

  // Hooks
  useRealtimeVehicles();

  // Local state
  const [scrollY, setScrollY] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoProductId, setDemoProductId] = useState<string | null>(null);
  
  // Demo states for each product
  const [fashionStyle, setFashionStyle] = useState('casual');
  const [fashionColor, setFashionColor] = useState('blue');
  const [healthGoal, setHealthGoal] = useState('weight-loss');
  const [healthAge, setHealthAge] = useState(30);
  const [beautySkinType, setBeautySkinType] = useState('normal');
  const [beautyConcern, setBeautyConcern] = useState('wrinkles');
  const [financeRisk, setFinanceRisk] = useState('medium');
  const [financeAmount, setFinanceAmount] = useState(1000000);
  const [travelDestination, setTravelDestination] = useState('japan');
  const [travelDuration, setTravelDuration] = useState(5);
  const [careerField, setCareerField] = useState('it');
  const [careerLevel, setCareerLevel] = useState('junior');
  
  // Demo results
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string; type: string }>>([]);
  const notify = useCallback((text: string, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3000);
  }, []);

  // Scroll handler for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add to cart
  const addToCart = (productId: string) => {
    if (cartItems.includes(productId)) {
      notify('이미 장바구니에 있습니다', 'warning');
      return;
    }
    setCartItems([...cartItems, productId]);
    notify('장바구니에 추가되었습니다! 🛒', 'success');
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(id => id !== productId));
    notify('장바구니에서 제거되었습니다', 'info');
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, id) => {
    const product = LAAS_PRODUCTS.find(p => p.id === id);
    return sum + (product?.monthly || 0);
  }, 0);

  // Open demo modal
  const openDemo = (productId: string) => {
    setDemoProductId(productId);
    setShowDemoModal(true);
    setDemoResult(null);
  };

  // Generate demo result
  const generateDemoResult = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let result: any = {};
      
      switch (demoProductId) {
        case 'fashion':
          result = {
            title: '🎨 맞춤 스타일 분석 결과',
            style: fashionStyle,
            color: fashionColor,
            recommendations: [
              { item: '슬림핏 청바지', brand: 'Levi\'s', price: '89,000원', match: 95 },
              { item: '캐주얼 니트', brand: 'Uniqlo', price: '59,000원', match: 92 },
              { item: '스니커즈', brand: 'Nike', price: '129,000원', match: 88 },
            ],
            tips: [
              '당신의 스타일에는 심플한 디자인이 잘 어울립니다',
              `${fashionColor === 'blue' ? '블루 계열' : fashionColor === 'black' ? '블랙 계열' : '화이트 계열'} 컬러를 베이스로 활용하세요`,
              '액세서리는 최소화하고 핏에 집중하세요'
            ]
          };
          break;
          
        case 'healthcare':
          result = {
            title: '💪 건강 분석 리포트',
            goal: healthGoal,
            age: healthAge,
            bmi: 23.5,
            exercises: [
              { name: '유산소 운동', frequency: '주 3회', duration: '30분', calories: 300 },
              { name: '근력 운동', frequency: '주 2회', duration: '45분', calories: 250 },
              { name: '스트레칭', frequency: '매일', duration: '15분', calories: 50 },
            ],
            nutrition: {
              calories: 2000,
              protein: '120g',
              carbs: '250g',
              fat: '60g'
            },
            prediction: healthGoal === 'weight-loss' ? '3개월 내 5kg 감량 가능' : '3개월 내 근육량 3kg 증가 가능'
          };
          break;
          
        case 'beauty':
          result = {
            title: '✨ 피부 분석 결과',
            skinType: beautySkinType,
            concern: beautyConcern,
            skinScore: 72,
            routine: [
              { step: 1, name: '클렌징 폼', product: 'Cetaphil Gentle Cleanser', time: '아침/저녁' },
              { step: 2, name: '토너', product: 'Klairs Supple Preparation', time: '아침/저녁' },
              { step: 3, name: '세럼', product: 'The Ordinary Niacinamide', time: '저녁' },
              { step: 4, name: '보습크림', product: 'CeraVe Moisturizing Cream', time: '아침/저녁' },
              { step: 5, name: '선크림', product: 'La Roche-Posay SPF50', time: '아침' },
            ],
            tips: [
              `${beautySkinType === 'dry' ? '건조한' : beautySkinType === 'oily' ? '지성' : '복합성'} 피부는 충분한 수분 공급이 중요합니다`,
              `${beautyConcern === 'wrinkles' ? '주름' : beautyConcern === 'acne' ? '여드름' : '색소침착'} 개선을 위해 레티놀 성분 제품을 추천합니다`,
              '자외선 차단제는 매일 필수로 사용하세요'
            ]
          };
          break;
          
        case 'finance':
          result = {
            title: '📊 투자 포트폴리오',
            risk: financeRisk,
            amount: financeAmount,
            allocation: financeRisk === 'low' 
              ? { stocks: 30, bonds: 50, cash: 20 }
              : financeRisk === 'high'
              ? { stocks: 70, bonds: 20, cash: 10 }
              : { stocks: 50, bonds: 35, cash: 15 },
            products: [
              { name: 'KODEX 200', type: '국내주식ETF', ratio: 30, expected: '연 8-10%' },
              { name: 'ACE 미국S&P500', type: '해외주식ETF', ratio: 25, expected: '연 10-12%' },
              { name: 'KOSEF 국고채', type: '채권ETF', ratio: 30, expected: '연 3-4%' },
              { name: 'MMF', type: '현금성자산', ratio: 15, expected: '연 2-3%' },
            ],
            expectedReturn: financeRisk === 'low' ? '연 5-7%' : financeRisk === 'high' ? '연 12-15%' : '연 8-10%',
            riskLevel: financeRisk === 'low' ? '낮음 (변동성 10% 이내)' : financeRisk === 'high' ? '높음 (변동성 20% 이상)' : '중간 (변동성 15% 이내)'
          };
          break;
          
        case 'travel':
          result = {
            title: '✈️ 맞춤 여행 플랜',
            destination: travelDestination,
            duration: travelDuration,
            itinerary: Array.from({ length: travelDuration }, (_, i) => ({
              day: i + 1,
              activities: [
                { time: '09:00', place: i === 0 ? '공항 도착 & 호텔 체크인' : '관광지 A 방문', note: '사전 예약 필수' },
                { time: '12:00', place: '현지 맛집 점심', note: '추천 메뉴: 현지 특선' },
                { time: '14:00', place: '관광지 B 투어', note: '가이드 투어 추천' },
                { time: '18:00', place: '석식 & 자유 시간', note: '쇼핑/휴식' },
              ]
            })),
            budget: {
              flight: 500000,
              accommodation: 400000,
              food: 300000,
              activity: 200000,
              total: 1400000
            },
            tips: [
              '여행자 보험 가입을 권장합니다',
              '현지 화폐를 미리 환전하세요',
              '인기 관광지는 사전 예약이 필수입니다'
            ]
          };
          break;
          
        case 'education':
          result = {
            title: '🎯 커리어 로드맵',
            field: careerField,
            level: careerLevel,
            roadmap: [
              { phase: '1개월차', focus: '기초 다지기', tasks: ['온라인 강의 수강', '프로젝트 시작', '포트폴리오 준비'] },
              { phase: '3개월차', focus: '실전 경험', tasks: ['사이드 프로젝트 완성', '오픈소스 기여', '네트워킹'] },
              { phase: '6개월차', focus: '취업 준비', tasks: ['이력서 작성', '모의 면접', '채용 공고 지원'] },
            ],
            skills: [
              { name: 'JavaScript', level: 'Advanced', priority: 'High' },
              { name: 'React', level: 'Intermediate', priority: 'High' },
              { name: 'Node.js', level: 'Intermediate', priority: 'Medium' },
              { name: 'TypeScript', level: 'Basic', priority: 'Medium' },
            ],
            salary: careerLevel === 'junior' ? '3,500만원' : careerLevel === 'mid' ? '5,000만원' : '7,000만원',
            companies: ['네이버', '카카오', '쿠팡', '토스', '당근마켓']
          };
          break;
      }
      
      setDemoResult(result);
      setIsGenerating(false);
      notify('✅ 분석 완료! 스크롤하여 결과를 확인하세요', 'success');
    }, 2000);
  };

  // Contact form submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notify('문의가 접수되었습니다. 빠르게 답변드리겠습니다! 📧', 'success');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                         px-8 py-5 bg-black/80 backdrop-blur-xl border-b border-white/[0.07]
                         transition-all duration-300"
              style={{
                backgroundColor: scrollY > 50 ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.8)',
                boxShadow: scrollY > 50 ? '0 4px 30px rgba(124,110,245,0.1)' : 'none'
              }}>
        <div className="font-serif text-2xl font-semibold gradient-text flex items-center gap-2">
          <span className="text-3xl">🗺️</span>
          나만의<span className="font-light opacity-70">맵봇</span>
        </div>
        <nav className="flex gap-1 items-center">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                const element = document.getElementById(t.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium tracking-wider uppercase transition-all ${
                activeTab === t.id
                  ? 'bg-[#7c6ef5]/20 text-[#7c6ef5]'
                  : 'text-[#888899] hover:text-[#e8e8f0] hover:bg-white/5'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
          
          {/* Cart Icon */}
          <button 
            onClick={() => setShowCartModal(true)}
            className="relative ml-3 glass-card px-3 py-2 rounded-full hover:scale-105 transition-transform"
          >
            <span className="text-lg">🛒</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7c6ef5] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5 bg-[#5de67a]/[0.08] border border-[#5de67a]/20
                          px-3 py-1.5 rounded-full text-[0.72rem] text-[#5de67a] font-semibold ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5de67a] animate-pulse" />
            AI 온라인
          </div>
        </nav>
      </header>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="fixed top-20 right-6 z-[60] space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="glass-card px-4 py-3 rounded-xl shadow-lg animate-slide-in-right
                                      max-w-sm backdrop-blur-xl border border-white/10">
            <p className="text-sm text-white">{n.text}</p>
          </div>
        ))}
      </div>

      {/* ══ HOME / HERO ══ */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center
                           px-8 pt-28 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]
                        rounded-full pointer-events-none glow-purple animate-pulse"
             style={{ 
               background: 'radial-gradient(ellipse, rgba(124,110,245,0.3) 0%, rgba(93,230,208,0.15) 45%, transparent 70%)',
               transform: `translate(-50%, -50%) translateY(${scrollY * 0.3}px)`
             }} />
        
        {/* Floating Elements with Parallax */}
        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-[#7c6ef5]/20 blur-2xl animate-float"
             style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
        <div className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full bg-[#5de6d0]/20 blur-2xl animate-float" 
             style={{ animationDelay: '1s', transform: `translateY(${scrollY * 0.15}px)` }} />
        <div className="absolute top-1/3 right-[10%] w-16 h-16 rounded-full bg-[#f5a623]/20 blur-xl animate-float"
             style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.25}px)` }} />
        
        <div className="relative z-10">
          <div className="text-[#7c6ef5] text-xs font-bold tracking-[0.4em] uppercase mb-6 animate-fade-in">
            ✦ Life as a Service · AI-Powered Platform
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6 animate-fade-in" 
              style={{ animationDelay: '0.1s' }}>
            당신의 일상,<br />
            <strong className="font-semibold gradient-text text-6xl md:text-8xl">
              AI로 완성하세요
            </strong>
          </h1>
          <p className="text-[#b8b8cc] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in" 
             style={{ animationDelay: '0.2s' }}>
            패션 · 건강 · 뷰티 · 투자 · 여행 · 커리어<br />
            <span className="text-[#7c6ef5] font-semibold">나만의맵봇</span>이 모든 라이프 스타일을 맞춤 설계합니다
          </p>
          <div className="flex gap-4 flex-wrap justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button 
              className="btn-accent text-base px-8 py-4 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50" 
              onClick={() => {
                setActiveTab('laas');
                document.getElementById('laas')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              LaaS Shop 둘러보기 🛍️
            </button>
            <button 
              className="btn-ghost text-base px-8 py-4 hover:scale-105" 
              onClick={() => {
                setActiveTab('about');
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              더 알아보기 →
            </button>
          </div>
          
          {/* Stats with 3D Cards */}
          <div className="flex gap-6 mt-16 flex-wrap justify-center">
            {[
              ['12K+', '활성 사용자', '👥'],
              ['98%', '만족도', '⭐'],
              ['6가지', 'AI 서비스', '🤖'],
              ['24/7', '고객 지원', '💬']
            ].map(([n, l, icon], i) => (
              <div key={l} 
                   className="card-3d group cursor-pointer animate-fade-in" 
                   style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{icon}</div>
                <span className="font-serif text-3xl font-bold gradient-text block mb-1">{n}</span>
                <span className="text-xs text-[#888899] uppercase tracking-widest">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" className="relative py-32 px-8 bg-gradient-to-b from-[#0a0a0f] to-[#16161f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#7c6ef5] text-sm font-bold tracking-[0.3em] uppercase">✨ About Us</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-4 mb-6 gradient-text">
              나만의맵봇이란?
            </h2>
            <p className="text-[#888899] text-lg max-w-3xl mx-auto leading-relaxed">
              나만의맵봇은 AI 기반 라이프스타일 플랫폼입니다.<br />
              당신의 일상 속 모든 선택을 더 스마트하게, 더 개인화되게 만들어 드립니다.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'AI 기반 큐레이션',
                desc: '딥러닝 알고리즘이 당신의 취향과 패턴을 학습하여 최적의 선택을 제안합니다.'
              },
              {
                icon: '🔒',
                title: '안전한 데이터 보호',
                desc: '모든 개인정보는 엔드투엔드 암호화로 보호되며, 투명하게 관리됩니다.'
              },
              {
                icon: '⚡',
                title: '실시간 인사이트',
                desc: '변화하는 트렌드와 시장을 실시간으로 분석하여 언제나 최신 정보를 제공합니다.'
              }
            ].map((item, i) => (
              <div key={i} className="card-3d group text-center p-8 hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-[#888899] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Mission Statement */}
          <div className="mt-20 glass-card p-12 rounded-3xl border border-[#7c6ef5]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c6ef5]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-semibold mb-4 gradient-text">Our Mission</h3>
              <p className="text-lg text-[#b8b8cc] leading-relaxed">
                "모든 사람이 AI의 힘으로 더 나은 삶을 살 수 있도록"<br />
                우리는 복잡한 선택의 순간마다 당신을 도와 시간과 비용을 절약하고,<br />
                진정으로 의미 있는 경험에 집중할 수 있게 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="services" className="relative py-32 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5de6d0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7c6ef5]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#5de6d0] text-sm font-bold tracking-[0.3em] uppercase">🚀 Services</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-4 mb-6 gradient-text">
              핵심 서비스
            </h2>
            <p className="text-[#888899] text-lg max-w-3xl mx-auto">
              나만의맵봇이 제공하는 6가지 AI 라이프 서비스를 만나보세요
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LAAS_PRODUCTS.map((product, i) => (
              <div key={product.id} 
                   className="card-3d group p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                   style={{ animationDelay: `${i * 0.1}s` }}
                   onClick={() => {
                     setActiveTab('laas');
                     setSelectedProduct(product.id);
                     document.getElementById('laas')?.scrollIntoView({ behavior: 'smooth' });
                   }}>
                <div className="relative">
                  {/* Product Icon with Gradient Background */}
                  <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl"
                       style={{ background: product.image }}>
                    {product.icon}
                  </div>
                  
                  {/* Badges */}
                  {product.trending && (
                    <span className="absolute top-0 right-0 bg-gradient-to-r from-[#f5a623] to-[#f76b1c] text-white text-[0.65rem] px-2 py-1 rounded-full font-bold">
                      🔥 TRENDING
                    </span>
                  )}
                  {product.popular && (
                    <span className="absolute top-0 right-0 bg-gradient-to-r from-[#7c6ef5] to-[#9b8ff8] text-white text-[0.65rem] px-2 py-1 rounded-full font-bold">
                      ⭐ POPULAR
                    </span>
                  )}
                </div>
                
                <div className="text-[0.7rem] text-[#7c6ef5] font-bold tracking-wider uppercase mb-2">
                  {product.category}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#7c6ef5] transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm text-[#888899] mb-4">{product.tagline}</p>
                
                <div className="text-2xl font-bold gradient-text mb-4">
                  {(product.monthly / 1000).toFixed(1)}만원<span className="text-sm text-[#888899]">/월</span>
                </div>
                
                <button className="btn-accent w-full text-sm py-2 hover:scale-105 transition-transform">
                  자세히 보기 →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LAAS SHOP (Shoppable) ══ */}
      <section id="laas" className="relative py-32 px-8 bg-gradient-to-b from-[#0a0a0f] via-[#16161f] to-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#f5a623] text-sm font-bold tracking-[0.3em] uppercase">🛍️ LaaS Shop</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-4 mb-6 gradient-text">
              쇼폼(Shoppable) AI 서비스
            </h2>
            <p className="text-[#888899] text-lg max-w-3xl mx-auto">
              원하는 AI 서비스를 바로 구매하고 즉시 사용해보세요
            </p>
          </div>

          {/* Product Grid with Interactive Hover */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {LAAS_PRODUCTS.map((product, i) => (
              <div key={product.id} 
                   className="group relative overflow-hidden rounded-3xl transition-all duration-500
                              hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                   style={{ 
                     animationDelay: `${i * 0.1}s`,
                     background: selectedProduct === product.id ? product.image : '#16161f'
                   }}
                   onClick={() => setSelectedProduct(product.id)}>
                
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                     style={{ background: product.image }} />
                
                {/* Product Card Content */}
                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl 
                                    group-hover:scale-110 transition-transform duration-300"
                         style={{ background: product.image }}>
                      {product.icon}
                    </div>
                    <div className="flex flex-col gap-2">
                      {product.trending && (
                        <span className="bg-gradient-to-r from-[#f5a623] to-[#f76b1c] text-white text-[0.65rem] px-2 py-1 rounded-full font-bold">
                          🔥 TRENDING
                        </span>
                      )}
                      {product.popular && (
                        <span className="bg-gradient-to-r from-[#7c6ef5] to-[#9b8ff8] text-white text-[0.65rem] px-2 py-1 rounded-full font-bold">
                          ⭐ HOT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category & Title */}
                  <div className="text-[0.7rem] text-[#7c6ef5] font-bold tracking-wider uppercase mb-2">
                    {product.category}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-white group-hover:gradient-text transition-all">
                    {product.title}
                  </h3>
                  <p className="text-sm text-[#b8b8cc] mb-6">{product.tagline}</p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#888899]">
                        <span className="text-[#5de6d0]">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold gradient-text">
                      {(product.monthly / 1000).toFixed(1)}만원
                    </span>
                    <span className="text-sm text-[#888899]">/월</span>
                    <span className="text-xs text-[#666677] line-through ml-auto">
                      {(product.price / 1000).toFixed(0)}만원
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      className="flex-1 btn-accent py-3 text-sm font-semibold hover:scale-105 transition-transform">
                      장바구니 담기 🛒
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openDemo(product.id);
                      }}
                      className="px-4 btn-ghost py-3 text-sm hover:scale-105 transition-transform">
                      체험하기
                    </button>
                  </div>
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                     style={{
                       background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                       backgroundSize: '200% 200%',
                       animation: 'shimmer 2s infinite'
                     }} />
              </div>
            ))}
          </div>

          {/* Selected Product Detail Modal (Inline) */}
          {selectedProduct && (
            <div className="glass-card p-12 rounded-3xl border-2 border-[#7c6ef5]/30 relative overflow-hidden animate-scale-in">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 text-2xl text-[#888899] hover:text-white transition-colors z-20">
                ✕
              </button>

              {(() => {
                const product = LAAS_PRODUCTS.find(p => p.id === selectedProduct);
                if (!product) return null;

                return (
                  <div className="relative z-10">
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-30"
                         style={{ background: product.image }} />
                    
                    <div className="relative z-10 grid md:grid-cols-2 gap-12">
                      {/* Left: Product Info */}
                      <div>
                        <div className="w-32 h-32 rounded-3xl mb-6 flex items-center justify-center text-6xl"
                             style={{ background: product.image }}>
                          {product.icon}
                        </div>
                        <div className="text-[0.7rem] text-[#7c6ef5] font-bold tracking-wider uppercase mb-2">
                          {product.category}
                        </div>
                        <h3 className="text-4xl font-serif font-semibold mb-4 gradient-text">
                          {product.title}
                        </h3>
                        <p className="text-lg text-[#b8b8cc] mb-8">{product.tagline}</p>

                        {/* Full Features List */}
                        <h4 className="text-sm font-bold text-[#7c6ef5] mb-4 uppercase tracking-wider">포함된 기능</h4>
                        <ul className="space-y-3 mb-8">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-[#5de6d0] mt-1">✓</span>
                              <span className="text-[#888899]">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-baseline gap-3 mb-8">
                          <span className="text-5xl font-bold gradient-text">
                            {(product.monthly / 1000).toFixed(1)}만원
                          </span>
                          <span className="text-lg text-[#888899]">/월</span>
                        </div>

                        <button 
                          onClick={() => {
                            addToCart(product.id);
                            setSelectedProduct(null);
                          }}
                          className="btn-accent w-full py-4 text-lg font-bold hover:scale-105 transition-transform">
                          지금 구매하기 →
                        </button>
                      </div>

                      {/* Right: Demo / Preview */}
                      <div className="glass-card p-8 rounded-2xl">
                        <h4 className="text-xl font-semibold mb-6 text-white">실시간 데모</h4>
                        
                        {/* Interactive Demo Placeholder */}
                        <div className="aspect-square rounded-xl mb-6 flex items-center justify-center"
                             style={{ background: product.image }}>
                          <div className="text-6xl animate-bounce">{product.icon}</div>
                        </div>

                        <div className="space-y-4">
                          <div className="glass-card p-4 rounded-xl">
                            <div className="text-sm text-[#888899] mb-1">AI 분석 정확도</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#5de6d0] rounded-full animate-[grow_2s_ease]"
                                     style={{ width: '94%' }} />
                              </div>
                              <span className="text-sm font-bold text-[#5de6d0]">94%</span>
                            </div>
                          </div>

                          <div className="glass-card p-4 rounded-xl">
                            <div className="text-sm text-[#888899] mb-1">평균 응답 시간</div>
                            <div className="text-2xl font-bold gradient-text">1.2초</div>
                          </div>

                          <div className="glass-card p-4 rounded-xl">
                            <div className="text-sm text-[#888899] mb-1">사용자 만족도</div>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">⭐</span>
                              <span className="text-2xl font-bold text-[#f5a623]">4.8</span>
                              <span className="text-sm text-[#888899]">/ 5.0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="relative py-32 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] 
                        bg-gradient-radial from-[#7c6ef5]/20 via-transparent to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#7c6ef5] text-sm font-bold tracking-[0.3em] uppercase">💎 Pricing</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-4 mb-6 gradient-text">
              요금제
            </h2>
            <p className="text-[#888899] text-lg max-w-3xl mx-auto">
              당신의 필요에 맞는 플랜을 선택하세요. 언제든지 변경 가능합니다.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, i) => (
              <div key={plan.id} 
                   className={`card-3d p-8 relative overflow-hidden transition-all duration-300
                               ${plan.popular ? 'scale-105 border-2 border-[#7c6ef5]' : 'hover:scale-105'}`}
                   style={{ animationDelay: `${i * 0.1}s` }}>
                
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#7c6ef5] to-[#9b8ff8] 
                                  text-white text-xs px-4 py-2 rounded-bl-2xl font-bold">
                    {plan.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl bg-gradient-to-br ${plan.color}`}>
                  {plan.icon}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-semibold mb-2 text-white">{plan.name}</h3>
                
                {/* Price */}
                <div className="mb-6">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold gradient-text">
                        {(plan.price / 1000).toFixed(plan.price === 0 ? 0 : 1)}{plan.price > 0 && '만원'}
                      </span>
                      <span className="text-sm text-[#888899] ml-2">/{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-[#7c6ef5]">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#888899]">
                      <span className="text-[#5de6d0] mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button 
                  onClick={() => notify(`${plan.name} 플랜 선택! 결제 페이지로 이동합니다`, 'success')}
                  className={plan.popular ? 'btn-accent w-full py-3' : 'btn-ghost w-full py-3'}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-center mb-8 gradient-text">자주 묻는 질문</h3>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                { q: '환불 정책은 어떻게 되나요?', a: '구매 후 7일 이내 전액 환불이 가능합니다. 단, 서비스 이용 내역이 있는 경우 차감 후 환불됩니다.' },
                { q: '플랜 변경은 언제든 가능한가요?', a: '네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 차액은 다음 결제 시 정산됩니다.' },
                { q: '기업용 맞춤 플랜은 어떻게 신청하나요?', a: 'Contact 섹션에서 문의하시거나 support@mymapbot.ai로 이메일 주세요. 전담 매니저가 연락드립니다.' },
              ].map((item, i) => (
                <details key={i} className="glass-card p-6 rounded-xl cursor-pointer group">
                  <summary className="font-semibold text-white list-none flex items-center justify-between">
                    {item.q}
                    <span className="text-[#7c6ef5] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-[#888899] mt-4 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMMUNITY ══ */}
      <section id="community" className="relative py-32 px-8 bg-gradient-to-b from-[#0a0a0f] to-[#16161f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#5de6d0] text-sm font-bold tracking-[0.3em] uppercase">👥 Community</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-4 mb-6 gradient-text">
              커뮤니티
            </h2>
            <p className="text-[#888899] text-lg max-w-3xl mx-auto">
              나만의맵봇 사용자들과 함께 성장하세요
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: '👤', number: '12,453', label: '활성 멤버' },
              { icon: '💬', number: '8,920', label: '월간 대화' },
              { icon: '📝', number: '1,240', label: '리뷰 작성' },
              { icon: '⭐', number: '4.9', label: '평균 평점' },
            ].map((stat, i) => (
              <div key={i} className="card-3d text-center p-6 hover:scale-105 transition-transform">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold gradient-text mb-1">{stat.number}</div>
                <div className="text-sm text-[#888899]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Reviews */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold gradient-text mb-6">최근 리뷰</h3>
            {[
              { name: '김서연', product: '퍼스널 스타일링 AI', rating: 5, comment: '스타일 추천이 정말 정확해요! 쇼핑 시간이 절반으로 줄었습니다 👗', date: '2일 전' },
              { name: '이준호', product: '스마트 건강관리 AI', rating: 5, comment: '운동 루틴이 제 생활 패턴에 딱 맞아요. 3주 만에 체중 5kg 감량 성공!', date: '5일 전' },
              { name: '박지민', product: '스마트 투자 AI', rating: 4, comment: '초보자도 쉽게 포트폴리오를 구성할 수 있어서 좋아요. 다만 더 많은 자산 클래스가 추가되면 좋겠습니다.', date: '1주 전' },
            ].map((review, i) => (
              <div key={i} className="glass-card p-6 rounded-xl hover:border-[#7c6ef5]/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{review.name}</div>
                    <div className="text-xs text-[#7c6ef5]">{review.product}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <span key={idx} className="text-[#f5a623]">⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-[#b8b8cc] leading-relaxed mb-2">{review.comment}</p>
                <div className="text-xs text-[#666677]">{review.date}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button 
              onClick={() => notify('커뮤니티 페이지로 이동합니다', 'info')}
              className="btn-accent px-8 py-4 text-lg">
              커뮤니티 둘러보기 →
            </button>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" className="relative py-32 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7c6ef5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5de6d0]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#f5a623] text-sm font-bold tracking-[0.3em] uppercase">📞 Contact</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-4 mb-6 gradient-text">
              문의하기
            </h2>
            <p className="text-[#888899] text-lg max-w-2xl mx-auto">
              궁금한 점이 있으신가요? 언제든지 연락주세요.<br />
              24시간 이내에 답변드립니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="glass-card p-8 rounded-3xl">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#b8b8cc] mb-2">이메일</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full" 
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#b8b8cc] mb-2">메시지</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input w-full min-h-[150px] resize-y" 
                    placeholder="무엇을 도와드릴까요?"
                    required
                  />
                </div>
                <button type="submit" className="btn-accent w-full py-3 text-lg font-semibold">
                  보내기 →
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl mb-3">📧</div>
                <div className="text-sm text-[#888899] mb-1">이메일</div>
                <div className="text-lg font-semibold text-white">support@mymapbot.ai</div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl mb-3">💬</div>
                <div className="text-sm text-[#888899] mb-1">카카오톡</div>
                <div className="text-lg font-semibold text-white">@나만의맵봇</div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl mb-3">📱</div>
                <div className="text-sm text-[#888899] mb-1">전화</div>
                <div className="text-lg font-semibold text-white">1588-1234</div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl mb-3">🕒</div>
                <div className="text-sm text-[#888899] mb-1">운영 시간</div>
                <div className="text-lg font-semibold text-white">평일 09:00 - 18:00</div>
                <div className="text-sm text-[#666677] mt-1">(주말 및 공휴일 제외)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.07] py-12 px-8 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-serif text-xl font-semibold gradient-text mb-4">
                나만의맵봇
              </div>
              <p className="text-sm text-[#888899] leading-relaxed">
                AI 기반 라이프스타일<br />
                플랫폼의 새로운 기준
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-[#888899]">
                <li><a href="#services" className="hover:text-white transition-colors">패션 AI</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">헬스케어 AI</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">뷰티 AI</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">투자 AI</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-[#888899]">
                <li><a href="#about" className="hover:text-white transition-colors">회사 소개</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">요금제</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">커뮤니티</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">문의하기</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">법적 고지</h4>
              <ul className="space-y-2 text-sm text-[#888899]">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors">환불 정책</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#666677]">
              © 2026 나만의맵봇. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#888899] hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-[#888899] hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-[#888899] hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-[#888899] hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── CART MODAL ── */}
      {showCartModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
             onClick={() => setShowCartModal(false)}>
          <div className="glass-card p-8 rounded-3xl max-w-lg w-full border-2 border-[#7c6ef5]/30 animate-scale-in"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-semibold gradient-text">장바구니 🛒</h3>
              <button onClick={() => setShowCartModal(false)} className="text-2xl text-[#888899] hover:text-white">
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-[#888899]">장바구니가 비어있습니다</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((itemId) => {
                    const product = LAAS_PRODUCTS.find(p => p.id === itemId);
                    if (!product) return null;

                    return (
                      <div key={itemId} className="flex items-center gap-4 p-4 glass-card rounded-xl">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                             style={{ background: product.image }}>
                          {product.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{product.title}</div>
                          <div className="text-sm text-[#7c6ef5]">
                            {(product.monthly / 1000).toFixed(1)}만원/월
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(itemId)}
                          className="text-[#888899] hover:text-red-400 transition-colors">
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg text-[#888899]">총 금액</span>
                    <span className="text-3xl font-bold gradient-text">
                      {(cartTotal / 1000).toFixed(1)}만원<span className="text-sm text-[#888899]">/월</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      notify(`${cartItems.length}개 상품 구매 완료! 🎉`, 'success');
                      setCartItems([]);
                      setShowCartModal(false);
                    }}
                    className="btn-accent w-full py-4 text-lg font-bold">
                    구매하기 ({cartItems.length}개 상품)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── DEMO MODAL ── */}
      {showDemoModal && demoProductId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
             onClick={() => setShowDemoModal(false)}>
          <div className="glass-card p-8 rounded-3xl max-w-4xl w-full border-2 border-[#7c6ef5]/30 animate-scale-in my-8"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-semibold gradient-text">
                {LAAS_PRODUCTS.find(p => p.id === demoProductId)?.demo || '체험하기'}
              </h3>
              <button onClick={() => setShowDemoModal(false)} className="text-2xl text-[#888899] hover:text-white">
                ✕
              </button>
            </div>

            {/* Demo Input Forms */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Fashion Demo */}
              {demoProductId === 'fashion' && (
                <>
                  <div>
                    <label className="label">선호하는 스타일</label>
                    <select value={fashionStyle} onChange={(e) => setFashionStyle(e.target.value)} className="input">
                      <option value="casual">캐주얼</option>
                      <option value="formal">포멀</option>
                      <option value="street">스트릿</option>
                      <option value="minimal">미니멀</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">좋아하는 색상</label>
                    <select value={fashionColor} onChange={(e) => setFashionColor(e.target.value)} className="input">
                      <option value="black">블랙</option>
                      <option value="white">화이트</option>
                      <option value="blue">블루</option>
                      <option value="beige">베이지</option>
                    </select>
                  </div>
                </>
              )}

              {/* Healthcare Demo */}
              {demoProductId === 'healthcare' && (
                <>
                  <div>
                    <label className="label">건강 목표</label>
                    <select value={healthGoal} onChange={(e) => setHealthGoal(e.target.value)} className="input">
                      <option value="weight-loss">체중 감량</option>
                      <option value="muscle-gain">근육 증가</option>
                      <option value="endurance">체력 향상</option>
                      <option value="flexibility">유연성 개선</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">나이</label>
                    <input 
                      type="number" 
                      value={healthAge} 
                      onChange={(e) => setHealthAge(parseInt(e.target.value))} 
                      className="input"
                      min="18"
                      max="80"
                    />
                  </div>
                </>
              )}

              {/* Beauty Demo */}
              {demoProductId === 'beauty' && (
                <>
                  <div>
                    <label className="label">피부 타입</label>
                    <select value={beautySkinType} onChange={(e) => setBeautySkinType(e.target.value)} className="input">
                      <option value="normal">정상</option>
                      <option value="dry">건성</option>
                      <option value="oily">지성</option>
                      <option value="combination">복합성</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">주요 고민</label>
                    <select value={beautyConcern} onChange={(e) => setBeautyConcern(e.target.value)} className="input">
                      <option value="wrinkles">주름</option>
                      <option value="acne">여드름</option>
                      <option value="pigmentation">색소침착</option>
                      <option value="pores">모공</option>
                    </select>
                  </div>
                </>
              )}

              {/* Finance Demo */}
              {demoProductId === 'finance' && (
                <>
                  <div>
                    <label className="label">투자 성향</label>
                    <select value={financeRisk} onChange={(e) => setFinanceRisk(e.target.value)} className="input">
                      <option value="low">안정형 (낮은 위험)</option>
                      <option value="medium">균형형 (중간 위험)</option>
                      <option value="high">공격형 (높은 위험)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">투자 금액</label>
                    <input 
                      type="number" 
                      value={financeAmount} 
                      onChange={(e) => setFinanceAmount(parseInt(e.target.value))} 
                      className="input"
                      min="100000"
                      step="100000"
                      placeholder="1,000,000"
                    />
                  </div>
                </>
              )}

              {/* Travel Demo */}
              {demoProductId === 'travel' && (
                <>
                  <div>
                    <label className="label">여행지</label>
                    <select value={travelDestination} onChange={(e) => setTravelDestination(e.target.value)} className="input">
                      <option value="japan">일본 (도쿄)</option>
                      <option value="korea">국내 (제주)</option>
                      <option value="europe">유럽 (파리)</option>
                      <option value="sea">동남아 (방콕)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">여행 기간 (일)</label>
                    <input 
                      type="number" 
                      value={travelDuration} 
                      onChange={(e) => setTravelDuration(parseInt(e.target.value))} 
                      className="input"
                      min="3"
                      max="14"
                    />
                  </div>
                </>
              )}

              {/* Career Demo */}
              {demoProductId === 'education' && (
                <>
                  <div>
                    <label className="label">희망 분야</label>
                    <select value={careerField} onChange={(e) => setCareerField(e.target.value)} className="input">
                      <option value="it">IT / 개발</option>
                      <option value="design">디자인</option>
                      <option value="marketing">마케팅</option>
                      <option value="finance">금융</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">경력 수준</label>
                    <select value={careerLevel} onChange={(e) => setCareerLevel(e.target.value)} className="input">
                      <option value="junior">신입 (0-2년)</option>
                      <option value="mid">중급 (3-5년)</option>
                      <option value="senior">시니어 (6년+)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Generate Button */}
            <button 
              onClick={generateDemoResult}
              disabled={isGenerating}
              className="btn-accent w-full py-4 text-lg font-bold mb-8 disabled:opacity-50 disabled:cursor-not-allowed">
              {isGenerating ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  AI 분석 중...
                </>
              ) : (
                '분석 시작 🚀'
              )}
            </button>

            {/* Demo Result */}
            {demoResult && (
              <div className="glass-card p-8 rounded-2xl border border-[#7c6ef5]/20 animate-fade-in">
                <h4 className="text-2xl font-semibold mb-6 gradient-text">{demoResult.title}</h4>

                {/* Fashion Result */}
                {demoProductId === 'fashion' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {demoResult.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="card-3d p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-[#7c6ef5]">매칭도 {rec.match}%</span>
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#5de6d0]" style={{ width: `${rec.match}%` }} />
                            </div>
                          </div>
                          <h5 className="font-semibold text-white mb-1">{rec.item}</h5>
                          <p className="text-xs text-[#888899] mb-1">{rec.brand}</p>
                          <p className="text-lg font-bold text-[#5de6d0]">{rec.price}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">스타일링 팁</h5>
                      <ul className="space-y-2">
                        {demoResult.tips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[#b8b8cc]">
                            <span className="text-[#5de6d0] mt-1">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Healthcare Result */}
                {demoProductId === 'healthcare' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="card-3d p-4">
                        <h5 className="text-sm font-bold text-[#7c6ef5] mb-3">BMI 지수</h5>
                        <p className="text-3xl font-bold gradient-text">{demoResult.bmi}</p>
                        <p className="text-xs text-[#888899] mt-1">정상 범위 (18.5-24.9)</p>
                      </div>
                      <div className="card-3d p-4">
                        <h5 className="text-sm font-bold text-[#7c6ef5] mb-3">목표 달성 예상</h5>
                        <p className="text-lg font-semibold text-white">{demoResult.prediction}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">추천 운동 프로그램</h5>
                      <div className="space-y-3">
                        {demoResult.exercises.map((ex: any, i: number) => (
                          <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{ex.name}</p>
                              <p className="text-xs text-[#888899]">{ex.frequency} · {ex.duration}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#5de6d0]">{ex.calories} kcal</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="card-3d p-3 text-center">
                        <p className="text-xs text-[#888899] mb-1">칼로리</p>
                        <p className="font-bold text-white">{demoResult.nutrition.calories}</p>
                      </div>
                      <div className="card-3d p-3 text-center">
                        <p className="text-xs text-[#888899] mb-1">단백질</p>
                        <p className="font-bold text-white">{demoResult.nutrition.protein}</p>
                      </div>
                      <div className="card-3d p-3 text-center">
                        <p className="text-xs text-[#888899] mb-1">탄수화물</p>
                        <p className="font-bold text-white">{demoResult.nutrition.carbs}</p>
                      </div>
                      <div className="card-3d p-3 text-center">
                        <p className="text-xs text-[#888899] mb-1">지방</p>
                        <p className="font-bold text-white">{demoResult.nutrition.fat}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Beauty Result */}
                {demoProductId === 'beauty' && (
                  <div className="space-y-6">
                    <div className="card-3d p-6 text-center">
                      <p className="text-sm text-[#888899] mb-2">피부 점수</p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="relative w-32 h-32">
                          <svg className="transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="8" />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="none" 
                              stroke="url(#gradient)" 
                              strokeWidth="8"
                              strokeDasharray={`${demoResult.skinScore * 2.51} 251`}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7c6ef5" />
                                <stop offset="100%" stopColor="#5de6d0" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold gradient-text">{demoResult.skinScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">맞춤 스킨케어 루틴</h5>
                      <div className="space-y-2">
                        {demoResult.routine.map((step: any) => (
                          <div key={step.step} className="glass-card p-4 rounded-xl flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6ef5] to-[#5de6d0] flex items-center justify-center font-bold text-white">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white">{step.name}</p>
                              <p className="text-xs text-[#888899]">{step.product}</p>
                            </div>
                            <span className="text-xs text-[#5de6d0] font-semibold">{step.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">전문가 조언</h5>
                      <ul className="space-y-2">
                        {demoResult.tips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[#b8b8cc]">
                            <span className="text-[#5de6d0] mt-1">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Finance Result */}
                {demoProductId === 'finance' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="card-3d p-4 text-center">
                        <p className="text-xs text-[#888899] mb-2">주식</p>
                        <p className="text-2xl font-bold gradient-text">{demoResult.allocation.stocks}%</p>
                      </div>
                      <div className="card-3d p-4 text-center">
                        <p className="text-xs text-[#888899] mb-2">채권</p>
                        <p className="text-2xl font-bold gradient-text">{demoResult.allocation.bonds}%</p>
                      </div>
                      <div className="card-3d p-4 text-center">
                        <p className="text-xs text-[#888899] mb-2">현금</p>
                        <p className="text-2xl font-bold gradient-text">{demoResult.allocation.cash}%</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">추천 상품</h5>
                      <div className="space-y-3">
                        {demoResult.products.map((prod: any, i: number) => (
                          <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{prod.name}</p>
                              <p className="text-xs text-[#888899]">{prod.type} · 비중 {prod.ratio}%</p>
                            </div>
                            <p className="text-sm font-bold text-[#5de6d0]">{prod.expected}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="card-3d p-4">
                        <p className="text-xs text-[#888899] mb-1">예상 수익률</p>
                        <p className="text-xl font-bold text-[#5de6d0]">{demoResult.expectedReturn}</p>
                      </div>
                      <div className="card-3d p-4">
                        <p className="text-xs text-[#888899] mb-1">위험 수준</p>
                        <p className="text-lg font-semibold text-white">{demoResult.riskLevel}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Travel Result */}
                {demoProductId === 'travel' && (
                  <div className="space-y-6">
                    <div className="card-3d p-6">
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-4 uppercase">예상 예산</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-[#888899] mb-1">항공권</p>
                          <p className="font-bold text-white">{(demoResult.budget.flight / 10000).toFixed(0)}만원</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#888899] mb-1">숙박</p>
                          <p className="font-bold text-white">{(demoResult.budget.accommodation / 10000).toFixed(0)}만원</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#888899] mb-1">식비</p>
                          <p className="font-bold text-white">{(demoResult.budget.food / 10000).toFixed(0)}만원</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#888899] mb-1">관광</p>
                          <p className="font-bold text-white">{(demoResult.budget.activity / 10000).toFixed(0)}만원</p>
                        </div>
                        <div className="text-center col-span-2 md:col-span-1">
                          <p className="text-xs text-[#7c6ef5] mb-1 font-bold">총액</p>
                          <p className="text-xl font-bold gradient-text">{(demoResult.budget.total / 10000).toFixed(0)}만원</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">여행 일정</h5>
                      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                        {demoResult.itinerary.map((day: any) => (
                          <div key={day.day} className="glass-card p-4 rounded-xl">
                            <h6 className="font-bold text-white mb-3">Day {day.day}</h6>
                            <div className="space-y-2">
                              {day.activities.map((act: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 pl-4 border-l-2 border-[#7c6ef5]/30">
                                  <span className="text-xs text-[#7c6ef5] font-mono mt-1">{act.time}</span>
                                  <div>
                                    <p className="text-sm text-white">{act.place}</p>
                                    <p className="text-xs text-[#888899]">{act.note}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">여행 팁</h5>
                      <ul className="space-y-2">
                        {demoResult.tips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[#b8b8cc]">
                            <span className="text-[#5de6d0] mt-1">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Career Result */}
                {demoProductId === 'education' && (
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">커리어 로드맵</h5>
                      <div className="space-y-3">
                        {demoResult.roadmap.map((phase: any, i: number) => (
                          <div key={i} className="glass-card p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6ef5] to-[#5de6d0] flex items-center justify-center font-bold text-white text-sm">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{phase.phase}</p>
                                <p className="text-xs text-[#7c6ef5]">{phase.focus}</p>
                              </div>
                            </div>
                            <ul className="space-y-1 pl-11">
                              {phase.tasks.map((task: string, j: number) => (
                                <li key={j} className="text-sm text-[#888899]">• {task}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#7c6ef5] mb-3 uppercase">필수 스킬</h5>
                      <div className="grid md:grid-cols-2 gap-3">
                        {demoResult.skills.map((skill: any, i: number) => (
                          <div key={i} className="glass-card p-3 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{skill.name}</p>
                              <p className="text-xs text-[#888899]">{skill.level}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              skill.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {skill.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="card-3d p-4">
                        <p className="text-xs text-[#888899] mb-1">예상 연봉</p>
                        <p className="text-2xl font-bold gradient-text">{demoResult.salary}</p>
                      </div>
                      <div className="card-3d p-4">
                        <p className="text-xs text-[#888899] mb-2">추천 기업</p>
                        <div className="flex flex-wrap gap-1">
                          {demoResult.companies.map((company: string, i: number) => (
                            <span key={i} className="text-xs bg-[#7c6ef5]/20 text-[#7c6ef5] px-2 py-1 rounded-full">
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <button 
                    onClick={() => {
                      addToCart(demoProductId);
                      setShowDemoModal(false);
                    }}
                    className="btn-accent w-full py-4 text-lg font-bold">
                    이 서비스 구매하기 →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FLOATING ACTION BUTTON (AI Chat) ── */}
      <button 
        onClick={() => notify('AI 챗봇과 대화를 시작합니다 💬', 'info')}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-[#7c6ef5] to-[#9b8ff8]
                   flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform
                   animate-bounce-slow z-40">
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
        💬
      </button>
    </div>
  );
}
