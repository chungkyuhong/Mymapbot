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
    originalPrice: 49900,
    discount: 40,
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
    stockLeft: 7,
    viewingNow: 34,
    purchasedToday: 128,
    rating: 4.8,
    reviewCount: 2847,
    savedAmount: 240000,
    limitedOffer: '48시간 한정',
  },
  {
    id: 'healthcare',
    category: 'Health & Wellness',
    title: '스마트 건강관리 AI',
    tagline: '개인 맞춤형 웰니스 플랜',
    price: 199000,
    monthly: 19900,
    originalPrice: 29900,
    discount: 33,
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
    stockLeft: 3,
    viewingNow: 89,
    purchasedToday: 342,
    rating: 4.9,
    reviewCount: 5124,
    savedAmount: 120000,
    limitedOffer: '오늘만 특가',
  },
  {
    id: 'beauty',
    category: 'Beauty & Skincare',
    title: '뷰티 루틴 AI',
    tagline: '피부 고민 해결사',
    price: 149000,
    monthly: 14900,
    originalPrice: 24900,
    discount: 40,
    icon: '💄',
    image: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    stockLeft: 12,
    viewingNow: 56,
    purchasedToday: 203,
    rating: 4.7,
    reviewCount: 3891,
    savedAmount: 150000,
    limitedOffer: '신규 가입 특가',
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
    originalPrice: 79900,
    discount: 38,
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
    stockLeft: 5,
    viewingNow: 127,
    purchasedToday: 456,
    rating: 4.9,
    reviewCount: 6732,
    savedAmount: 360000,
    limitedOffer: '얼리버드 특가',
  },
  {
    id: 'travel',
    category: 'Travel & Leisure',
    title: '여행 플래너 AI',
    tagline: '완벽한 여행 설계',
    price: 179000,
    monthly: 17900,
    originalPrice: 27900,
    discount: 36,
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
    stockLeft: 18,
    viewingNow: 43,
    purchasedToday: 167,
    rating: 4.6,
    reviewCount: 2134,
    savedAmount: 100000,
    limitedOffer: '주말 특가',
  },
  {
    id: 'education',
    category: 'Education & Career',
    title: '커리어 성장 AI',
    tagline: '성장하는 나를 위한 멘토',
    price: 249000,
    monthly: 24900,
    originalPrice: 39900,
    discount: 38,
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
    stockLeft: 9,
    viewingNow: 67,
    purchasedToday: 289,
    rating: 4.8,
    reviewCount: 4521,
    savedAmount: 180000,
    limitedOffer: '취업 시즌 특가',
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
  
  // ✨ NEW: Purchase & Service Usage States
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [serviceProgress, setServiceProgress] = useState<{ [key: string]: number }>({});
  const [aiResponses, setAiResponses] = useState<{ [key: string]: any[] }>({});
  const [userProfile, setUserProfile] = useState({
    name: '김맵봇',
    level: 1,
    joinDate: '2025-02-23',
    totalUsage: 0,
    subscription: 'starter'
  });
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
  
  // Purchase psychology triggers
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 0 });
  const [recentPurchases, setRecentPurchases] = useState<Array<{ user: string; product: string; time: string }>>([]);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  
  // ✨ NEW: Situation-based Product Recommendation System
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [situationInput, setSituationInput] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [purchaseAgentOrders, setPurchaseAgentOrders] = useState<any[]>([]);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Simulate recent purchases
  useEffect(() => {
    const purchaseData = [
      { user: '김*진', product: '스마트 건강관리 AI', city: '서울' },
      { user: '이*수', product: '퍼스널 스타일링 AI', city: '부산' },
      { user: '박*영', product: '스마트 투자 AI', city: '대전' },
      { user: '최*현', product: '뷰티 루틴 AI', city: '인천' },
      { user: '정*민', product: '커리어 성장 AI', city: '광주' },
    ];

    const showRandomPurchase = () => {
      const random = purchaseData[Math.floor(Math.random() * purchaseData.length)];
      const minutesAgo = Math.floor(Math.random() * 10) + 1;
      
      setRecentPurchases(prev => [...prev, {
        user: `${random.user} (${random.city})`,
        product: random.product,
        time: `${minutesAgo}분 전`
      }].slice(-5));
      
      setShowPurchasePopup(true);
      setTimeout(() => setShowPurchasePopup(false), 4000);
    };

    // Show first purchase after 3 seconds
    const firstTimer = setTimeout(showRandomPurchase, 3000);
    
    // Then show every 15-25 seconds
    const interval = setInterval(() => {
      showRandomPurchase();
    }, Math.random() * 10000 + 15000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);
  
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

  // ✨ NEW: Complete Purchase
  const completePurchase = () => {
    if (cartItems.length === 0) {
      notify('장바구니가 비어있습니다', 'warning');
      return;
    }
    
    // Add to purchased products
    setPurchasedProducts([...new Set([...purchasedProducts, ...cartItems])]);
    
    // Clear cart
    setCartItems([]);
    setShowCartModal(false);
    
    // Show success and open dashboard
    notify(`🎉 구매 완료! ${cartTotal.toLocaleString()}원 결제되었습니다`, 'success');
    
    setTimeout(() => {
      setShowDashboard(true);
      notify('내 대시보드로 이동합니다', 'info');
    }, 1500);
  };

  // ✨ NEW: Situation-based Product Recommendation with Purchase Agent
  const analyzeSituationAndRecommend = (situation: string) => {
    console.log('🤖 Starting AI recommendation for:', situation);
    setIsRecommending(true);
    setRecommendedProducts([]);
    notify('AI가 상황을 분석하고 최적의 상품을 찾고 있습니다...', 'info');
    
    setTimeout(() => {
      // 실제 상품 데이터베이스 (카테고리별 실제 상품들)
      const productDatabase = {
        fashion: [
          { id: 'f1', name: '유니클로 히트텍 이너웨어', brand: 'Uniqlo', price: 19900, rating: 4.8, reviews: 3420, image: '🧥', category: '의류', tags: ['겨울', '보온', '데일리', '실내'], shippingDays: 1, seller: 'Uniqlo 공식', link: '#' },
          { id: 'f2', name: '노스페이스 경량 패딩', brand: 'The North Face', price: 189000, rating: 4.9, reviews: 2145, image: '🧥', category: '아우터', tags: ['겨울', '등산', '캠핑', '야외활동'], shippingDays: 2, seller: '노스페이스 공식', link: '#' },
          { id: 'f3', name: 'H&M 슬림핏 청바지', brand: 'H&M', price: 39900, rating: 4.5, reviews: 1823, image: '👖', category: '하의', tags: ['캐주얼', '데일리', '사계절'], shippingDays: 1, seller: 'H&M', link: '#' },
          { id: 'f4', name: '나이키 에어맥스', brand: 'Nike', price: 139000, rating: 4.9, reviews: 5621, image: '👟', category: '신발', tags: ['운동', '러닝', '워킹', '스포츠'], shippingDays: 2, seller: 'Nike 공식', link: '#' },
          { id: 'f5', name: '자라 정장 재킷', brand: 'Zara', price: 89000, rating: 4.6, reviews: 892, image: '👔', category: '정장', tags: ['비즈니스', '면접', '회의', '정장'], shippingDays: 2, seller: 'Zara', link: '#' },
          { id: 'f6', name: '레이벤 선글라스', brand: 'Ray-Ban', price: 168000, rating: 4.9, reviews: 1245, image: '🕶️', category: '액세서리', tags: ['여름', '여행', '운전', '야외'], shippingDays: 1, seller: 'Luxottica', link: '#' },
          { id: 'f7', name: '무신사 오버핏 후드', brand: 'Musinsa Standard', price: 45900, rating: 4.7, reviews: 3890, image: '👕', category: '상의', tags: ['캐주얼', '힙합', '스트릿', '데일리'], shippingDays: 1, seller: '무신사', link: '#' },
          { id: 'f8', name: '컨버스 척테일러', brand: 'Converse', price: 69000, rating: 4.8, reviews: 4120, image: '👟', category: '신발', tags: ['캐주얼', '클래식', '데일리', '스트릿'], shippingDays: 1, seller: 'Converse 공식', link: '#' }
        ],
        electronics: [
          { id: 'e1', name: '애플 에어팟 프로 2세대', brand: 'Apple', price: 359000, rating: 4.9, reviews: 8234, image: '🎧', category: '오디오', tags: ['무선', '노이즈캔슬링', '통화', '음악'], shippingDays: 1, seller: 'Apple 공식', link: '#' },
          { id: 'e2', name: '삼성 갤럭시 버즈2 프로', brand: 'Samsung', price: 229000, rating: 4.7, reviews: 5621, image: '🎧', category: '오디오', tags: ['무선', '노이즈캔슬링', '운동', '방수'], shippingDays: 1, seller: 'Samsung 공식', link: '#' },
          { id: 'e3', name: 'LG 그램 17인치', brand: 'LG', price: 2390000, rating: 4.8, reviews: 1234, image: '💻', category: '노트북', tags: ['업무', '가벼움', '장시간', '재택'], shippingDays: 2, seller: 'LG 공식', link: '#' },
          { id: 'e4', name: '로지텍 MX Master 3S', brand: 'Logitech', price: 139000, rating: 4.9, reviews: 3421, image: '🖱️', category: '마우스', tags: ['업무', '무선', '인체공학', '생산성'], shippingDays: 1, seller: 'Logitech', link: '#' },
          { id: 'e5', name: '샤오미 보조배터리 20000mAh', brand: 'Xiaomi', price: 39900, rating: 4.8, reviews: 6789, image: '🔋', category: '배터리', tags: ['여행', '출장', '캠핑', '비상'], shippingDays: 1, seller: 'Xiaomi', link: '#' },
          { id: 'e6', name: '벤큐 아이케어 모니터 27인치', brand: 'BenQ', price: 389000, rating: 4.8, reviews: 2341, image: '🖥️', category: '모니터', tags: ['업무', '눈보호', '재택', '장시간'], shippingDays: 2, seller: 'BenQ', link: '#' }
        ],
        home: [
          { id: 'h1', name: '다이슨 V15 무선청소기', brand: 'Dyson', price: 899000, rating: 4.9, reviews: 4521, image: '🧹', category: '청소', tags: ['무선', '강력', '먼지감지', '반려동물'], shippingDays: 2, seller: 'Dyson 공식', link: '#' },
          { id: 'h2', name: '쿠쿠 압력밥솥 6인용', brand: 'Cuckoo', price: 389000, rating: 4.8, reviews: 3214, image: '🍚', category: '주방', tags: ['가족', '요리', '음압', '보온'], shippingDays: 2, seller: 'Cuckoo', link: '#' },
          { id: 'h3', name: '필립스 공기청정기', brand: 'Philips', price: 459000, rating: 4.8, reviews: 2891, image: '💨', category: '가전', tags: ['미세먼지', '황사', '알레르기', '실내'], shippingDays: 2, seller: 'Philips', link: '#' },
          { id: 'h4', name: '이케아 말름 책상', brand: 'IKEA', price: 129000, rating: 4.6, reviews: 1823, image: '🪑', category: '가구', tags: ['재택', '업무', '조립', '공간활용'], shippingDays: 3, seller: 'IKEA', link: '#' },
          { id: 'h5', name: '일룸 린백 의자', brand: 'iloom', price: 289000, rating: 4.9, reviews: 3421, image: '🪑', category: '의자', tags: ['업무', '인체공학', '허리', '장시간'], shippingDays: 3, seller: '일룸', link: '#' },
          { id: 'h6', name: '코웨이 정수기 렌탈', brand: 'Coway', price: 39900, rating: 4.7, reviews: 5621, image: '💧', category: '정수기', tags: ['건강', '물', '렌탈', '필터'], shippingDays: 5, seller: 'Coway', link: '#', isRental: true }
        ],
        beauty: [
          { id: 'b1', name: '설화수 자음생 크림', brand: 'Sulwhasoo', price: 198000, rating: 4.9, reviews: 3421, image: '🧴', category: '스킨케어', tags: ['안티에이징', '보습', '탄력', '한방'], shippingDays: 1, seller: '설화수 공식', link: '#' },
          { id: 'b2', name: 'SK-II 페이셜 트리트먼트 에센스', brand: 'SK-II', price: 189000, rating: 4.8, reviews: 2891, image: '💧', category: '에센스', tags: ['피부결', '광채', '수분', '럭셔리'], shippingDays: 1, seller: 'SK-II', link: '#' },
          { id: 'b3', name: '에스티로더 어드밴스드 나이트 리페어', brand: 'Estée Lauder', price: 152000, rating: 4.9, reviews: 4521, image: '🌙', category: '세럼', tags: ['야간', '재생', '탄력', '안티에이징'], shippingDays: 1, seller: 'Estée Lauder', link: '#' },
          { id: 'b4', name: '라로슈포제 시카플라스트 밤', brand: 'La Roche-Posay', price: 28900, rating: 4.8, reviews: 6782, image: '💊', category: '진정', tags: ['트러블', '진정', '재생', '민감'], shippingDays: 1, seller: '라로슈포제', link: '#' },
          { id: 'b5', name: '비오템 아쿠아소스 크림', brand: 'Biotherm', price: 89000, rating: 4.7, reviews: 1823, image: '💦', category: '보습', tags: ['수분', '청량', '보습', '여름'], shippingDays: 1, seller: 'Biotherm', link: '#' }
        ],
        sports: [
          { id: 's1', name: '아디다스 울트라부스트', brand: 'Adidas', price: 229000, rating: 4.9, reviews: 5234, image: '👟', category: '러닝화', tags: ['러닝', '조깅', '마라톤', '쿠셔닝'], shippingDays: 2, seller: 'Adidas 공식', link: '#' },
          { id: 's2', name: '룰루레몬 요가매트', brand: 'Lululemon', price: 98000, rating: 4.8, reviews: 2341, image: '🧘', category: '요가', tags: ['요가', '필라테스', '홈트', '미끄럼방지'], shippingDays: 2, seller: 'Lululemon', link: '#' },
          { id: 's3', name: '언더아머 쿨스위치 티셔츠', brand: 'Under Armour', price: 49000, rating: 4.7, reviews: 3421, image: '👕', category: '운동복', tags: ['운동', '땀배출', '시원', '여름'], shippingDays: 1, seller: 'Under Armour', link: '#' },
          { id: 's4', name: '제이드 요가매트 5mm', brand: 'Jade Yoga', price: 129000, rating: 4.9, reviews: 1245, image: '🧘', category: '요가', tags: ['요가', '친환경', '그립', '프리미엄'], shippingDays: 3, seller: 'Jade', link: '#' },
          { id: 's5', name: '나이키 드라이핏 반바지', brand: 'Nike', price: 39900, rating: 4.6, reviews: 2891, image: '🩳', category: '운동복', tags: ['러닝', '운동', '땀배출', '편안'], shippingDays: 1, seller: 'Nike', link: '#' }
        ],
        food: [
          { id: 'fo1', name: '오뚜기 3분 카레 멀티팩', brand: 'Ottogi', price: 24900, rating: 4.7, reviews: 5621, image: '🍛', category: '간편식', tags: ['간편', '혼밥', '비상식량', '캠핑'], shippingDays: 1, seller: '오뚜기', link: '#' },
          { id: 'fo2', name: '마켓컬리 신선 과일 박스', brand: 'Kurly', price: 39900, rating: 4.8, reviews: 3421, image: '🍎', category: '과일', tags: ['신선', '건강', '아침', '선물'], shippingDays: 1, seller: '마켓컬리', link: '#', isFresh: true },
          { id: 'fo3', name: '곰곰 구운란', brand: 'Gomgom', price: 5990, rating: 4.6, reviews: 4521, image: '🥚', category: '달걀', tags: ['간식', '단백질', '다이어트', '간편'], shippingDays: 1, seller: '쿠팡', link: '#', isFresh: true },
          { id: 'fo4', name: '삼다수 2L 12병', brand: 'Samdasoo', price: 9900, rating: 4.7, reviews: 8234, image: '💧', category: '생수', tags: ['물', '수분', '건강', '비상'], shippingDays: 1, seller: '제주개발공사', link: '#' }
        ],
        travel: [
          { id: 't1', name: '사무소나이트 캐리어 28인치', brand: 'Samsonite', price: 389000, rating: 4.9, reviews: 2341, image: '🧳', category: '캐리어', tags: ['여행', '출장', '장기', '해외'], shippingDays: 2, seller: 'Samsonite', link: '#' },
          { id: 't2', name: '에이스 침낭 -10도', brand: 'ACE', price: 89000, rating: 4.8, reviews: 1823, image: '🛌', category: '캠핑', tags: ['캠핑', '등산', '겨울', '보온'], shippingDays: 2, seller: 'ACE', link: '#' },
          { id: 't3', name: '오스프리 등산배낭 40L', brand: 'Osprey', price: 269000, rating: 4.9, reviews: 1234, image: '🎒', category: '백팩', tags: ['등산', '배낭여행', '트레킹', '장거리'], shippingDays: 2, seller: 'Osprey', link: '#' },
          { id: 't4', name: '코베아 휴대용 버너', brand: 'Kovea', price: 49900, rating: 4.7, reviews: 3421, image: '🔥', category: '버너', tags: ['캠핑', '요리', '휴대', '가스'], shippingDays: 1, seller: 'Kovea', link: '#' }
        ]
      };

      // AI 상황 분석 로직
      const situation_lower = situation.toLowerCase();
      let selectedProducts: any[] = [];
      let analysisResult = {
        situation,
        keywords: [] as string[],
        categories: [] as string[],
        reasoning: ''
      };

      // 키워드 기반 상품 매칭
      if (situation_lower.includes('면접') || situation_lower.includes('취업') || situation_lower.includes('정장')) {
        console.log('📍 Matched scenario: 면접/취업');
        selectedProducts = [
          productDatabase.fashion.find(p => p.id === 'f5'), // 자라 정장
          productDatabase.beauty.find(p => p.id === 'b1'), // 설화수 크림
          productDatabase.electronics.find(p => p.id === 'e3') // LG 그램
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['면접', '정장', '첫인상'];
        analysisResult.categories = ['패션', '뷰티', '전자기기'];
        analysisResult.reasoning = '면접 상황에는 단정한 정장과 좋은 인상을 위한 스킨케어, 그리고 포트폴리오 준비를 위한 노트북이 필수입니다.';
      } else if (situation_lower.includes('데이트') || situation_lower.includes('소개팅')) {
        console.log('📍 Matched scenario: 데이트/소개팅');
        selectedProducts = [
          productDatabase.fashion.find(p => p.id === 'f3'), // H&M 청바지
          productDatabase.beauty.find(p => p.id === 'b2'), // SK-II 에센스
          productDatabase.fashion.find(p => p.id === 'f6') // 레이벤 선글라스
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['데이트', '첫인상', '스타일'];
        analysisResult.categories = ['패션', '뷰티', '액세서리'];
        analysisResult.reasoning = '데이트에는 깔끔한 캐주얼 룩과 빛나는 피부, 그리고 세련된 액세서리로 완벽한 첫인상을 만들어보세요.';
      } else if (situation_lower.includes('캠핑') || situation_lower.includes('야외') || situation_lower.includes('등산')) {
        console.log('📍 Matched scenario: 캠핑/야외');
        selectedProducts = [
          productDatabase.fashion.find(p => p.id === 'f2'), // 노스페이스 패딩
          productDatabase.travel.find(p => p.id === 't2'), // 에이스 침낭
          productDatabase.travel.find(p => p.id === 't4') // 코베아 버너
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['캠핑', '야외', '보온'];
        analysisResult.categories = ['아우터', '캠핑용품', '조리기구'];
        analysisResult.reasoning = '캠핑에는 따뜻한 보온 장비와 편안한 수면 환경, 그리고 간편한 조리 도구가 필수입니다.';
      } else if (situation_lower.includes('재택') || situation_lower.includes('홈오피스') || situation_lower.includes('업무')) {
        selectedProducts = [
          productDatabase.home.find(p => p.id === 'h5'), // 일룸 의자
          productDatabase.electronics.find(p => p.id === 'e4'), // 로지텍 마우스
          productDatabase.electronics.find(p => p.id === 'e6') // 벤큐 모니터
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['재택근무', '생산성', '인체공학'];
        analysisResult.categories = ['가구', '전자기기', '모니터'];
        analysisResult.reasoning = '재택근무 환경에는 편안한 의자, 생산성 높은 마우스, 그리고 눈 건강을 위한 모니터가 필수입니다.';
      } else if (situation_lower.includes('운동') || situation_lower.includes('헬스') || situation_lower.includes('다이어트')) {
        selectedProducts = [
          productDatabase.sports.find(p => p.id === 's1'), // 아디다스 울트라부스트
          productDatabase.sports.find(p => p.id === 's3'), // 언더아머 티셔츠
          productDatabase.food.find(p => p.id === 'fo3') // 곰곰 구운란
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['운동', '다이어트', '건강'];
        analysisResult.categories = ['운동화', '운동복', '식품'];
        analysisResult.reasoning = '효과적인 운동을 위해서는 쿠셔닝 좋은 신발, 땀 배출이 잘되는 옷, 그리고 단백질 보충이 중요합니다.';
      } else if (situation_lower.includes('여행') || situation_lower.includes('휴가') || situation_lower.includes('비행기')) {
        selectedProducts = [
          productDatabase.travel.find(p => p.id === 't1'), // 사무소나이트 캐리어
          productDatabase.electronics.find(p => p.id === 'e5'), // 샤오미 보조배터리
          productDatabase.electronics.find(p => p.id === 'e1') // 애플 에어팟 프로
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['여행', '휴가', '이동'];
        analysisResult.categories = ['캐리어', '배터리', '오디오'];
        analysisResult.reasoning = '여행에는 튼튼한 캐리어, 긴 이동 시간을 위한 보조배터리, 그리고 편안한 이동을 위한 노이즈캔슬링 이어폰이 필수입니다.';
      } else if (situation_lower.includes('출장') || situation_lower.includes('비즈니스')) {
        selectedProducts = [
          productDatabase.fashion.find(p => p.id === 'f5'), // 자라 정장
          productDatabase.electronics.find(p => p.id === 'e3'), // LG 그램
          productDatabase.travel.find(p => p.id === 't1') // 사무소나이트 캐리어
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['출장', '비즈니스', '전문성'];
        analysisResult.categories = ['정장', '노트북', '캐리어'];
        analysisResult.reasoning = '출장에는 단정한 정장, 가벼운 노트북, 그리고 프로페셔널한 캐리어가 필수입니다.';
      } else if (situation_lower.includes('겨울') || situation_lower.includes('추위') || situation_lower.includes('보온')) {
        selectedProducts = [
          productDatabase.fashion.find(p => p.id === 'f2'),
          productDatabase.fashion.find(p => p.id === 'f1'),
          productDatabase.home.find(p => p.id === 'h1')
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['겨울', '보온', '따뜻함'];
        analysisResult.categories = ['아우터', '이너웨어', '청소'];
        analysisResult.reasoning = '추운 겨울에는 강력한 보온 패딩과 내피용 히트텍, 그리고 건조한 실내 먼지 관리가 중요합니다.';
      } else if (situation_lower.includes('대학') || situation_lower.includes('입학') || situation_lower.includes('학교') || situation_lower.includes('신입생')) {
        selectedProducts = [
          productDatabase.electronics.find(p => p.id === 'e3'), // LG 그램 노트북
          productDatabase.electronics.find(p => p.id === 'e4'), // 로지텍 마우스
          productDatabase.fashion.find(p => p.id === 'f7') // 무신사 후드
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['대학', '입학', '신입생', '학업'];
        analysisResult.categories = ['노트북', '마우스', '패션'];
        analysisResult.reasoning = '대학 입학을 축하드립니다! 학업에 필수적인 가벼운 노트북과 편안한 마우스, 그리고 캠퍼스에서 입기 좋은 캐주얼 룩을 추천합니다.';
      } else if (situation_lower.includes('청소') || situation_lower.includes('집정리') || situation_lower.includes('대청소')) {
        selectedProducts = [
          productDatabase.home.find(p => p.id === 'h1'), // 다이슨 청소기
          productDatabase.home.find(p => p.id === 'h3'), // 필립스 공기청정기
          productDatabase.home.find(p => p.id === 'h6') // 코웨이 정수기
        ].filter(Boolean) as any[];
        analysisResult.keywords = ['청소', '집정리', '깔끔'];
        analysisResult.categories = ['청소기', '공기청정기', '정수기'];
        analysisResult.reasoning = '깨끗한 집 환경을 위해서는 강력한 청소기, 공기 정화, 그리고 깨끗한 물이 필수입니다.';
      } else {
        // 기본 추천 (가장 인기 있는 상품들)
        const allProducts = [
          ...productDatabase.electronics,
          ...productDatabase.fashion,
          ...productDatabase.home,
          ...productDatabase.beauty,
          ...productDatabase.sports
        ];
        
        // 평점 높은 순으로 정렬
        const topRated = allProducts
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        
        selectedProducts = topRated;
        analysisResult.keywords = ['인기', '베스트셀러', '범용'];
        analysisResult.categories = topRated.map(p => p.category);
        analysisResult.reasoning = `"${situation}" 상황에 가장 높은 평점을 받은 인기 상품들을 추천합니다. 다양한 상황에서 유용하게 사용할 수 있는 아이템들입니다.`;
      }

      // 선택된 상품이 없으면 기본 인기 상품 제공
      if (selectedProducts.length === 0) {
        console.warn('⚠️ No products matched, using fallback top-rated items');
        const allProducts = [
          ...productDatabase.electronics,
          ...productDatabase.fashion,
          ...productDatabase.home,
          ...productDatabase.beauty,
          ...productDatabase.sports
        ];
        selectedProducts = allProducts
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        analysisResult.keywords = ['인기', '베스트셀러', '추천'];
        analysisResult.categories = selectedProducts.map(p => p.category);
        analysisResult.reasoning = `"${situation}" 상황에 가장 높은 평점을 받은 인기 상품들을 추천드립니다.`;
      }
      
      // 가격 순 정렬 (저렴한 순)
      selectedProducts.sort((a, b) => a.price - b.price);
      
      // 상위 3개만 선택
      const top3 = selectedProducts.slice(0, 3).map((product, index) => ({
        ...product,
        rank: index + 1,
        matchScore: 95 - (index * 5), // 95, 90, 85
        analysisResult
      }));

      console.log('✅ Recommended products:', top3);
      setRecommendedProducts(top3);
      setIsRecommending(false);
      notify(`✨ AI가 "${situation}" 상황에 최적인 ${top3.length}개 상품을 추천했습니다!`, 'success');
    }, 2500);
  };

  // ✨ NEW: Purchase Agent - 구매 대행 요청
  const requestPurchaseAgent = (product: any) => {
    const order = {
      id: `ORDER-${Date.now()}`,
      product,
      requestedAt: new Date().toISOString(),
      status: 'processing', // processing, confirmed, shipped, delivered
      estimatedDelivery: new Date(Date.now() + product.shippingDays * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    setPurchaseAgentOrders([...purchaseAgentOrders, order]);
    notify(`🛒 "${product.name}" 구매 대행 요청이 접수되었습니다!`, 'success');
    
    // 시뮬레이션: 5초 후 주문 확정
    setTimeout(() => {
      setPurchaseAgentOrders(prev => 
        prev.map(o => o.id === order.id ? { ...o, status: 'confirmed' } : o)
      );
      notify(`✅ "${product.name}" 주문이 확정되었습니다. 배송 준비 중입니다.`, 'success');
    }, 5000);

    // 시뮬레이션: 10초 후 배송 시작
    setTimeout(() => {
      setPurchaseAgentOrders(prev => 
        prev.map(o => o.id === order.id ? { ...o, status: 'shipped' } : o)
      );
      notify(`📦 "${product.name}" 배송이 시작되었습니다. 송장번호: ${order.trackingNumber}`, 'info');
    }, 10000);
  };

  // ✨ NEW: Start Using Service
  const startService = (productId: string) => {
    setActiveService(productId);
    setServiceProgress({ ...serviceProgress, [productId]: 0 });
    notify('AI 서비스를 시작합니다...', 'info');
    
    // Initialize AI responses
    if (!aiResponses[productId]) {
      setAiResponses({ ...aiResponses, [productId]: [] });
    }
    
    // Simulate AI initialization
    setTimeout(() => {
      addAiResponse(productId, {
        type: 'welcome',
        text: `안녕하세요! ${LAAS_PRODUCTS.find(p => p.id === productId)?.title} 서비스입니다. 무엇을 도와드릴까요?`,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  };

  // ✨ NEW: Add AI Response
  const addAiResponse = (productId: string, response: any) => {
    setAiResponses(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), response]
    }));
    
    // Update service progress
    setServiceProgress(prev => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 0) + 10, 100)
    }));
    
    // Update user stats
    setUserProfile(prev => ({
      ...prev,
      totalUsage: prev.totalUsage + 1,
      level: Math.floor((prev.totalUsage + 1) / 10) + 1
    }));
  };

  // ✨ ENHANCED: Get AI Recommendation with Rich Data
  const getAiRecommendation = (productId: string, userInput: string) => {
    notify('AI가 심층 분석 중입니다...', 'info');
    
    setTimeout(() => {
      const product = LAAS_PRODUCTS.find(p => p.id === productId);
      let recommendation: any = {};
      
      switch (productId) {
        case 'fashion':
          // 실제 쇼핑 데이터와 유사한 추천
          const fashionItems = [
            { name: '슬림핏 청바지', brand: 'Levi\'s 501', price: 89000, link: '#', image: '👖', match: 95, discount: 15 },
            { name: '캐주얼 니트', brand: 'Uniqlo Cashmere', price: 59000, link: '#', image: '👔', match: 92, discount: 20 },
            { name: '스니커즈', brand: 'Nike Air Force 1', price: 129000, link: '#', image: '👟', match: 88, discount: 10 },
            { name: '크로스백', brand: 'Coach Signature', price: 198000, link: '#', image: '👜', match: 85, discount: 25 }
          ];
          
          recommendation = {
            type: 'fashion_recommendation',
            text: `"${userInput}" 스타일 분석 완료! 총 ${fashionItems.length}개 아이템을 큐레이션했습니다.`,
            items: fashionItems,
            totalSavings: fashionItems.reduce((sum, item) => sum + (item.price * item.discount / 100), 0),
            styleScore: 94,
            seasonTip: '봄/가을 시즌에 최적화된 레이어링 스타일입니다',
            colorPalette: ['#2C3E50', '#34495E', '#7F8C8D', '#ECF0F1'],
            wardrobeCompletion: 73
          };
          break;
          
        case 'healthcare':
          // 실제 헬스 트래커 수준의 데이터
          const weeklyPlan = [
            { day: '월', exercises: ['런닝 5km', '상체 근력'], calories: 550, duration: 75 },
            { day: '화', exercises: ['요가', '스트레칭'], calories: 200, duration: 45 },
            { day: '수', exercises: ['사이클링 30분', '코어 운동'], calories: 450, duration: 60 },
            { day: '목', exercises: ['휴식일'], calories: 0, duration: 0 },
            { day: '금', exercises: ['수영 1km', '하체 근력'], calories: 600, duration: 80 },
            { day: '토', exercises: ['등산 2시간'], calories: 700, duration: 120 },
            { day: '일', exercises: ['휴식일', '가벼운 산책'], calories: 150, duration: 30 }
          ];
          
          recommendation = {
            type: 'health_plan',
            text: `"${userInput}" 목표 달성을 위한 맞춤 플랜이 생성되었습니다!`,
            weeklyPlan,
            totalCalories: weeklyPlan.reduce((sum, day) => sum + day.calories, 0),
            avgDaily: Math.round(weeklyPlan.reduce((sum, day) => sum + day.calories, 0) / 7),
            nutrition: {
              breakfast: { name: '오트밀+바나나', calories: 350, protein: 12 },
              lunch: { name: '닭가슴살 샐러드', calories: 450, protein: 35 },
              dinner: { name: '연어 구이+현미밥', calories: 550, protein: 40 },
              snack: { name: '그릭요거트+견과류', calories: 200, protein: 15 }
            },
            waterGoal: '2.5L',
            sleepTarget: '7-8시간',
            progressPrediction: '4주 후 -3.5kg 예상',
            currentBMI: 24.2,
            targetBMI: 22.8
          };
          break;
          
        case 'beauty':
          // 실제 피부 진단 앱 수준의 분석
          recommendation = {
            type: 'beauty_analysis',
            text: `"${userInput}" 피부 타입에 맞는 전문 루틴을 제안합니다.`,
            skinScore: {
              moisture: 68,
              elasticity: 72,
              pores: 65,
              brightness: 78,
              overall: 71
            },
            morningRoutine: [
              { step: 1, name: '저자극 클렌저', product: 'Cetaphil Gentle', price: 18000, time: '1분' },
              { step: 2, name: '비타민C 세럼', product: 'Klairs Vitamin Drop', price: 25000, time: '2분' },
              { step: 3, name: '보습 크림', product: 'Etude House 2X', price: 15000, time: '1분' },
              { step: 4, name: 'SPF50+ 선크림', product: 'Biore UV Aqua', price: 12000, time: '1분' }
            ],
            eveningRoutine: [
              { step: 1, name: '딥 클렌징 오일', product: 'DHC Deep Cleansing', price: 28000, time: '2분' },
              { step: 2, name: '각질 제거 토너', product: 'COSRX AHA/BHA', price: 18000, time: '1분' },
              { step: 3, name: '나이아신아마이드 세럼', product: 'The Ordinary 10%', price: 8000, time: '2분' },
              { step: 4, name: '재생 크림', product: 'CeraVe PM Lotion', price: 22000, time: '1분' }
            ],
            weeklyTreatment: '각질 제거 (수요일), 시트마스크 (금요일)',
            avoidIngredients: ['알코올', '인공향료', 'SLS'],
            recommendIngredients: ['히알루론산', '세라마이드', '나이아신아마이드'],
            improveIn: '4주 후 피부 점수 +15점 예상'
          };
          break;
          
        case 'finance':
          // 실제 로보어드바이저 수준의 포트폴리오
          const portfolio = [
            { asset: 'KODEX 200 ETF', allocation: 35, amount: 3500000, return1y: 8.2, risk: '중' },
            { asset: '미국 S&P500 ETF', allocation: 25, amount: 2500000, return1y: 12.5, risk: '중상' },
            { asset: '채권형 ETF', allocation: 20, amount: 2000000, return1y: 4.1, risk: '하' },
            { asset: '리츠 ETF', allocation: 10, amount: 1000000, return1y: 6.8, risk: '중' },
            { asset: '현금성 자산', allocation: 10, amount: 1000000, return1y: 3.5, risk: '최하' }
          ];
          
          recommendation = {
            type: 'investment_plan',
            text: `"${userInput}" 성향에 맞는 포트폴리오를 구성했습니다.`,
            portfolio,
            totalInvestment: portfolio.reduce((sum, item) => sum + item.amount, 0),
            expectedReturn1y: 8.4,
            expectedReturn3y: 27.8,
            expectedReturn5y: 52.1,
            riskScore: 45,
            volatility: '±12%',
            monthlyDCA: 500000,
            taxBenefit: '연 150만원 절세 가능 (ISA 계좌)',
            rebalancingSchedule: '분기별 (3, 6, 9, 12월)',
            marketAnalysis: {
              outlook: '중립적 상승',
              opportunities: ['미국 빅테크', '국내 배당주', '신흥국 채권'],
              risks: ['금리 변동성', '환율 리스크', '지정학적 리스크']
            },
            backtest3y: '+34.2% (2022-2025)'
          };
          break;
          
        case 'travel':
          // 실제 여행 플래너 앱 수준의 일정
          const itinerary = [
            {
              day: 1,
              date: '2025-03-15 (토)',
              activities: [
                { time: '09:00', name: '인천공항 출발', location: 'ICN → NRT', cost: 450000, icon: '✈️' },
                { time: '13:00', name: '도쿄 도착 & 호텔 체크인', location: '시부야 하얏트', cost: 180000, icon: '🏨' },
                { time: '16:00', name: '시부야 스크램블 교차로', location: '시부야구', cost: 0, icon: '📸' },
                { time: '19:00', name: '저녁 식사', location: '이치란 라멘', cost: 25000, icon: '🍜' }
              ],
              totalCost: 655000
            },
            {
              day: 2,
              date: '2025-03-16 (일)',
              activities: [
                { time: '08:00', name: '후지산 투어', location: '가와구치코', cost: 85000, icon: '🗻' },
                { time: '13:00', name: '점심 (혼토)', location: '후지 5합목', cost: 18000, icon: '🍱' },
                { time: '17:00', name: '온천 체험', location: '후지야마 온천', cost: 35000, icon: '♨️' },
                { time: '20:00', name: '호텔 복귀', location: '시부야', cost: 0, icon: '🚌' }
              ],
              totalCost: 138000
            },
            {
              day: 3,
              date: '2025-03-17 (월)',
              activities: [
                { time: '09:00', name: '츠키지 수산시장', location: '츄오구', cost: 45000, icon: '🐟' },
                { time: '12:00', name: '센소지 & 아사쿠사', location: '타이토구', cost: 5000, icon: '⛩️' },
                { time: '15:00', name: '쇼핑 (하라주쿠)', location: '시부야구', cost: 120000, icon: '🛍️' },
                { time: '18:00', name: '저녁 & 공항', location: 'NRT', cost: 35000, icon: '✈️' }
              ],
              totalCost: 205000
            }
          ];
          
          recommendation = {
            type: 'travel_plan',
            text: `"${userInput}" 여행 맞춤 플랜이 완성되었습니다!`,
            itinerary,
            totalBudget: itinerary.reduce((sum, day) => sum + day.totalCost, 0),
            breakdown: {
              flight: 450000,
              accommodation: 360000,
              food: 123000,
              activities: 125000,
              shopping: 120000,
              transport: 20000
            },
            savingTips: [
              '항공권 지금 예약 시 18% 할인 (₩82,000 절약)',
              '호텔 조식 포함 패키지 선택 (₩45,000 절약)',
              'JR Pass 3일권 구매 (₩35,000 절약)'
            ],
            totalSavings: 162000,
            weather: ['맑음 16°C', '구름 14°C', '맑음 17°C'],
            localTips: '3월은 벚꽃 시즌 시작, 주말 혼잡 예상',
            packlist: ['여권', '엔화 현금 5만엔', '포켓와이파이', '우산', '편한 신발']
          };
          break;
          
        case 'education':
          // 실제 커리어 코칭 수준의 로드맵
          const roadmap = [
            {
              phase: 1,
              title: '기초 역량 구축',
              period: '0-3개월',
              milestones: [
                { task: 'HTML/CSS/JS 마스터', hours: 120, completed: false },
                { task: 'React 기초 학습', hours: 80, completed: false },
                { task: '미니 프로젝트 3개', hours: 60, completed: false }
              ],
              skills: ['JavaScript', 'React', 'Git', 'REST API'],
              salary: 0
            },
            {
              phase: 2,
              title: '실전 프로젝트 경험',
              period: '3-6개월',
              milestones: [
                { task: 'Next.js 풀스택 프로젝트', hours: 150, completed: false },
                { task: 'TypeScript 전환', hours: 40, completed: false },
                { task: '포트폴리오 사이트 제작', hours: 50, completed: false }
              ],
              skills: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
              salary: 3500000
            },
            {
              phase: 3,
              title: '취업 준비 & 면접',
              period: '6-9개월',
              milestones: [
                { task: '이력서 최적화', hours: 10, completed: false },
                { task: '알고리즘 문제 100제', hours: 80, completed: false },
                { task: '모의 면접 10회', hours: 20, completed: false }
              ],
              skills: ['자료구조', '알고리즘', '시스템 디자인', '면접 스킬'],
              salary: 4200000
            }
          ];
          
          recommendation = {
            type: 'career_roadmap',
            text: `"${userInput}" 분야 커리어 로드맵을 설계했습니다!`,
            roadmap,
            totalHours: roadmap.reduce((sum, phase) => 
              sum + phase.milestones.reduce((s, m) => s + m.hours, 0), 0),
            targetSalary: 4200000,
            salaryIncrease: '+120%',
            marketDemand: '매우 높음 (채용공고 1,234개)',
            topCompanies: ['카카오', '네이버', '쿠팡', '당근마켓', '토스'],
            interviewPrep: {
              technicalQuestions: [
                'React의 렌더링 최적화 방법은?',
                'REST API vs GraphQL 차이점',
                'Next.js SSR vs SSG 선택 기준',
                'TypeScript 제네릭 활용법',
                'Redux vs Zustand 상태관리 비교'
              ],
              behavioralQuestions: [
                '가장 어려웠던 프로젝트는?',
                '팀 충돌 해결 경험',
                '실패에서 배운 점',
                '5년 후 커리어 목표'
              ]
            },
            resumeTips: [
              '프로젝트 성과를 수치로 표현 (방문자 +300% 등)',
              '기술 스택은 우선순위 순으로 나열',
              'GitHub 링크 필수 포함',
              '1페이지로 압축 (2페이지 절대 금지)'
            ],
            salaryNegotiation: {
              initial: 3800000,
              target: 4200000,
              minimum: 3500000,
              strategy: '경력과 프로젝트 성과를 근거로 target 제시 → 복지 혜택도 협상 포인트'
            }
          };
          break;
          
        default:
          recommendation = {
            type: 'general',
            text: '분석이 완료되었습니다.'
          };
      }
      
      addAiResponse(productId, {
        type: 'recommendation',
        text: recommendation.text || recommendation,
        data: recommendation,
        timestamp: new Date().toISOString(),
        userInput
      });
      
      notify('✨ 심층 분석 결과가 도착했습니다!', 'success');
    }, 2500);
  };

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
      <header className="fixed top-12 left-0 right-0 z-50 flex items-center justify-between
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
          
          {/* Dashboard Icon (NEW) */}
          {purchasedProducts.length > 0 && (
            <button 
              onClick={() => setShowDashboard(!showDashboard)}
              className="relative ml-2 glass-card px-3 py-2 rounded-full hover:scale-105 transition-transform"
              title="내 대시보드"
            >
              <span className="text-lg">👤</span>
              {purchasedProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {purchasedProducts.length}
                </span>
              )}
            </button>
          )}
          
          {/* ✨ NEW: Situation-based Recommendation Button */}
          <button 
            onClick={() => setShowRecommendModal(true)}
            className="relative ml-2 glass-card px-4 py-2 rounded-full hover:scale-105 transition-transform group"
            title="상황 기반 AI 추천"
          >
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="hidden md:inline">AI 추천</span>
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7c6ef5] to-[#e6a020] opacity-0 group-hover:opacity-20 transition-opacity" />
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

      {/* ── REAL-TIME PURCHASE POPUP ── */}
      {showPurchasePopup && recentPurchases.length > 0 && (
        <div className="fixed bottom-24 left-6 z-[60] animate-slide-in-left">
          <div className="glass-card px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 border-[#5de6d0]/30 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5de6d0] to-[#3dd5c0] flex items-center justify-center flex-shrink-0 animate-pulse">
                🎉
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#5de6d0] font-bold mb-1">실시간 구매 알림</p>
                <p className="text-sm text-white font-semibold mb-1">
                  {recentPurchases[recentPurchases.length - 1].user}님이<br />
                  <span className="gradient-text">{recentPurchases[recentPurchases.length - 1].product}</span>를 구매했습니다
                </p>
                <p className="text-xs text-[#888899]">{recentPurchases[recentPurchases.length - 1].time}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── URGENCY COUNTDOWN BANNER ── */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 py-2 shadow-lg animate-pulse">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 text-white">
          <span className="font-bold text-sm">⚡ 특별 할인 종료까지</span>
          <div className="flex items-center gap-2 font-mono text-lg font-bold">
            <div className="bg-black/30 px-3 py-1 rounded">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span>:</span>
            <div className="bg-black/30 px-3 py-1 rounded">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span>:</span>
            <div className="bg-black/30 px-3 py-1 rounded">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
          <span className="font-bold text-sm">남음! 서두르세요 🔥</span>
        </div>
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
                  {/* Urgency Banner */}
                  {product.limitedOffer && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold py-2 px-4 text-center animate-pulse">
                      ⚡ {product.limitedOffer} ⚡
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 mt-8">
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
                      {product.discount && (
                        <span className="bg-red-500 text-white text-[0.65rem] px-2 py-1 rounded-full font-bold">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-sm font-bold text-white">{product.rating}</span>
                      <span className="text-xs text-[#666677]">({product.reviewCount?.toLocaleString()})</span>
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="text-xs text-[#888899]">
                      {product.viewingNow}명이 보는 중
                    </div>
                  </div>

                  {/* Scarcity */}
                  {product.stockLeft && product.stockLeft <= 10 && (
                    <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400 font-semibold">
                        ⚠️ 재고 {product.stockLeft}개 남음 - 서두르세요!
                      </p>
                    </div>
                  )}

                  {/* FOMO - Today's Purchase */}
                  <div className="mb-4 px-3 py-2 bg-[#5de6d0]/10 border border-[#5de6d0]/20 rounded-lg">
                    <p className="text-xs text-[#5de6d0] font-semibold">
                      🔥 오늘 {product.purchasedToday}명이 구매했습니다
                    </p>
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
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold gradient-text">
                        {(product.monthly / 1000).toFixed(1)}만원
                      </span>
                      <span className="text-sm text-[#888899]">/월</span>
                      {product.originalPrice && (
                        <span className="text-sm text-[#666677] line-through ml-auto">
                          {(product.originalPrice / 1000).toFixed(1)}만원
                        </span>
                      )}
                    </div>
                    {product.savedAmount && (
                      <p className="text-xs text-[#5de6d0] font-semibold">
                        💰 연간 {(product.savedAmount / 10000).toFixed(0)}만원 절약
                      </p>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      className="flex-1 btn-accent py-3 text-sm font-semibold hover:scale-105 transition-transform relative overflow-hidden">
                      <span className="relative z-10">지금 시작하기 →</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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

          {/* Trust Badges */}
          <div className="grid md:grid-cols-4 gap-6 mt-16 mb-12">
            {[
              { icon: '✅', title: '7일 환불 보장', desc: '100% 무조건 환불' },
              { icon: '🔒', title: '안전한 결제', desc: 'SSL 암호화 보호' },
              { icon: '⚡', title: '즉시 이용 가능', desc: '구매 후 바로 시작' },
              { icon: '🎁', title: '무료 체험', desc: '모든 기능 체험 가능' },
            ].map((badge, i) => (
              <div key={i} className="card-3d text-center p-6 hover:scale-105 transition-transform">
                <div className="text-4xl mb-3">{badge.icon}</div>
                <div className="font-bold text-white mb-1">{badge.title}</div>
                <div className="text-xs text-[#888899]">{badge.desc}</div>
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ✨ USER DASHBOARD & SERVICE USAGE MODAL (NEW)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showDashboard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             onClick={() => setShowDashboard(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-8"
               onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowDashboard(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 
                         flex items-center justify-center text-2xl transition-all">
              ✕
            </button>

            {/* Dashboard Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2 gradient-text">
                🎯 내 대시보드
              </h2>
              <p className="text-[#999] text-lg">
                구매한 서비스를 관리하고 AI와 상호작용하세요
              </p>
            </div>

            {/* User Profile Card */}
            <div className="glass-card p-6 rounded-2xl mb-8 border border-white/10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                              flex items-center justify-center text-4xl">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{userProfile.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#999]">
                    <span>🎖️ Level {userProfile.level}</span>
                    <span>📅 가입일: {userProfile.joinDate}</span>
                    <span>📊 총 사용: {userProfile.totalUsage}회</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#999] mb-1">구독 플랜</div>
                  <div className="text-xl font-bold text-[#7c6ef5]">
                    {PRICING_PLANS.find(p => p.id === userProfile.subscription)?.name || 'Starter'}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Services Overview */}
            {activeService ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    🔥 활성 서비스
                  </h3>
                  <button 
                    onClick={() => setActiveService(null)}
                    className="text-sm text-[#999] hover:text-white transition-colors">
                    전체 보기 →
                  </button>
                </div>
                
                {/* Active Service Detail View */}
                {(() => {
                  const product = LAAS_PRODUCTS.find(p => p.id === activeService);
                  if (!product) return null;
                  
                  return (
                    <div className="glass-card p-6 rounded-2xl border border-white/10">
                      {/* Service Header */}
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                        <div className="text-5xl">{product.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-white mb-1">{product.title}</h4>
                          <p className="text-[#999]">{product.tagline}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#999] mb-1">진행률</div>
                          <div className="text-3xl font-bold text-[#7c6ef5]">
                            {serviceProgress[activeService] || 0}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#e6a020] transition-all duration-500"
                            style={{ width: `${serviceProgress[activeService] || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* AI Chat Interface */}
                      <div className="space-y-4 mb-6">
                        <h5 className="text-lg font-bold text-white mb-3">💬 AI 대화</h5>
                        
                        {/* AI Messages - ENHANCED with Rich Data */}
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                          {(aiResponses[activeService] || []).map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`${msg.type === 'user' ? 'max-w-[70%]' : 'max-w-[90%]'} p-4 rounded-2xl ${
                                msg.type === 'user' 
                                  ? 'bg-[#7c6ef5]/20 border border-[#7c6ef5]/30' 
                                  : 'bg-white/5 border border-white/10'
                              }`}>
                                <p className="text-white text-sm leading-relaxed mb-2">{msg.text}</p>
                                
                                {/* Rich Data Visualization */}
                                {msg.data && (() => {
                                  const data = msg.data;
                                  
                                  // Fashion Recommendation
                                  if (data.type === 'fashion_recommendation') {
                                    return (
                                      <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-teal-400">스타일 매칭 점수: {data.styleScore}/100</span>
                                          <span className="text-[#999]">워드로브 완성도: {data.wardrobeCompletion}%</span>
                                        </div>
                                        
                                        {data.items.map((item: any, i: number) => (
                                          <div key={i} className="glass-card p-3 rounded-xl flex items-center gap-3 hover:border-[#7c6ef5]/30 transition-all">
                                            <div className="text-3xl">{item.image}</div>
                                            <div className="flex-1">
                                              <div className="font-bold text-white text-sm">{item.name}</div>
                                              <div className="text-xs text-[#999]">{item.brand}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-[#7c6ef5] font-bold">₩{(item.price * (100 - item.discount) / 100).toLocaleString()}</div>
                                              <div className="text-xs text-red-400 line-through">₩{item.price.toLocaleString()}</div>
                                              <div className="text-xs text-teal-400">매칭 {item.match}%</div>
                                            </div>
                                          </div>
                                        ))}
                                        
                                        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                                          <div className="text-teal-400 text-xs font-bold mb-1">💰 총 절약 금액</div>
                                          <div className="text-white text-lg font-bold">₩{data.totalSavings.toLocaleString()}</div>
                                        </div>
                                        
                                        <div className="text-xs text-[#999] p-2 bg-white/5 rounded-lg">
                                          💡 {data.seasonTip}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Health Plan
                                  if (data.type === 'health_plan') {
                                    return (
                                      <div className="mt-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                            <div className="text-purple-400 mb-1">주간 소모</div>
                                            <div className="text-white font-bold">{data.totalCalories.toLocaleString()} kcal</div>
                                          </div>
                                          <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                                            <div className="text-teal-400 mb-1">하루 평균</div>
                                            <div className="text-white font-bold">{data.avgDaily} kcal</div>
                                          </div>
                                          <div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                                            <div className="text-pink-400 mb-1">목표 BMI</div>
                                            <div className="text-white font-bold">{data.targetBMI}</div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {data.weeklyPlan.slice(0, 3).map((day: any, i: number) => (
                                            <div key={i} className="glass-card p-2 rounded-lg flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#7c6ef5]/20 flex items-center justify-center font-bold text-white">
                                                  {day.day}
                                                </div>
                                                <div className="text-white">{day.exercises[0]}</div>
                                              </div>
                                              <div className="text-teal-400 font-bold">{day.calories}kcal</div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                                          <div className="text-white text-sm font-bold mb-2">🎯 예상 성과</div>
                                          <div className="text-teal-400 text-xs">{data.progressPrediction}</div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Beauty Analysis
                                  if (data.type === 'beauty_analysis') {
                                    return (
                                      <div className="mt-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          {Object.entries(data.skinScore).slice(0, 4).map(([key, value]: any, i) => (
                                            <div key={i} className="p-2 bg-white/5 rounded-lg">
                                              <div className="text-[#999] mb-1 capitalize">{key}</div>
                                              <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                  <div className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#e6a020]" style={{width: `${value}%`}} />
                                                </div>
                                                <span className="text-white font-bold">{value}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <div className="text-white text-xs font-bold">🌅 모닝 루틴</div>
                                          {data.morningRoutine.map((step: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-xs p-2 bg-white/5 rounded-lg">
                                              <div className="w-6 h-6 rounded-full bg-[#7c6ef5]/20 flex items-center justify-center font-bold text-white">
                                                {step.step}
                                              </div>
                                              <div className="flex-1">
                                                <div className="text-white">{step.name}</div>
                                                <div className="text-[#999]">{step.product}</div>
                                              </div>
                                              <div className="text-teal-400 font-bold">₩{step.price.toLocaleString()}</div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="text-xs p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
                                          ✨ {data.improveIn}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Investment Plan
                                  if (data.type === 'investment_plan') {
                                    return (
                                      <div className="mt-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                            <div className="text-blue-400 mb-1">1년 수익률</div>
                                            <div className="text-white font-bold">+{data.expectedReturn1y}%</div>
                                          </div>
                                          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                            <div className="text-purple-400 mb-1">3년 수익률</div>
                                            <div className="text-white font-bold">+{data.expectedReturn3y}%</div>
                                          </div>
                                          <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                                            <div className="text-teal-400 mb-1">리스크</div>
                                            <div className="text-white font-bold">{data.riskScore}</div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {data.portfolio.map((asset: any, i: number) => (
                                            <div key={i} className="glass-card p-2 rounded-lg">
                                              <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-white font-bold">{asset.asset}</span>
                                                <span className="text-teal-400">{asset.allocation}%</span>
                                              </div>
                                              <div className="flex items-center justify-between text-xs text-[#999]">
                                                <span>₩{asset.amount.toLocaleString()}</span>
                                                <span className="text-green-400">+{asset.return1y}%</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="p-3 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/30 rounded-xl text-xs">
                                          <div className="text-white font-bold mb-1">💡 절세 혜택</div>
                                          <div className="text-teal-400">{data.taxBenefit}</div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Travel Plan
                                  if (data.type === 'travel_plan') {
                                    return (
                                      <div className="mt-4 space-y-3">
                                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl text-center">
                                          <div className="text-[#999] text-xs mb-1">총 여행 경비</div>
                                          <div className="text-white text-2xl font-bold">₩{data.totalBudget.toLocaleString()}</div>
                                          <div className="text-teal-400 text-xs mt-1">절약 가능: ₩{data.totalSavings.toLocaleString()}</div>
                                        </div>
                                        
                                        {data.itinerary.map((day: any, i: number) => (
                                          <div key={i} className="glass-card p-3 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="text-white font-bold text-sm">Day {day.day}</div>
                                              <div className="text-teal-400 text-xs">₩{day.totalCost.toLocaleString()}</div>
                                            </div>
                                            <div className="space-y-1">
                                              {day.activities.slice(0, 2).map((act: any, j: number) => (
                                                <div key={j} className="flex items-center gap-2 text-xs text-[#999]">
                                                  <span>{act.icon}</span>
                                                  <span className="flex-1">{act.name}</span>
                                                  <span className="text-white">₩{act.cost.toLocaleString()}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                        
                                        <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                          {data.weather.map((w: string, i: number) => (
                                            <div key={i} className="p-2 bg-white/5 rounded-lg">
                                              <div className="text-white">{w.split(' ')[0]}</div>
                                              <div className="text-[#999]">{w.split(' ')[1]}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Career Roadmap
                                  if (data.type === 'career_roadmap') {
                                    return (
                                      <div className="mt-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                            <div className="text-purple-400 mb-1">목표 연봉</div>
                                            <div className="text-white text-xl font-bold">₩{(data.targetSalary / 10000).toFixed(0)}만원</div>
                                          </div>
                                          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                                            <div className="text-teal-400 mb-1">연봉 상승률</div>
                                            <div className="text-white text-xl font-bold">{data.salaryIncrease}</div>
                                          </div>
                                        </div>
                                        
                                        {data.roadmap.map((phase: any, i: number) => (
                                          <div key={i} className="glass-card p-3 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                              <div>
                                                <div className="text-white font-bold text-sm">Phase {phase.phase}</div>
                                                <div className="text-[#999] text-xs">{phase.title}</div>
                                              </div>
                                              <div className="text-teal-400 text-xs">{phase.period}</div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {phase.skills.slice(0, 4).map((skill: string, j: number) => (
                                                <span key={j} className="px-2 py-1 bg-[#7c6ef5]/20 border border-[#7c6ef5]/30 rounded text-xs text-[#7c6ef5]">
                                                  {skill}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                        
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs">
                                          <div className="text-blue-400 font-bold mb-1">🏢 추천 기업</div>
                                          <div className="flex flex-wrap gap-1">
                                            {data.topCompanies.map((company: string, i: number) => (
                                              <span key={i} className="text-white">{company}{i < data.topCompanies.length - 1 ? ',' : ''}</span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  return null;
                                })()}
                                
                                <div className="text-xs text-[#999] mt-3 pt-2 border-t border-white/10">
                                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* User Input */}
                        <div className="flex gap-3">
                          <input 
                            type="text"
                            placeholder="AI에게 질문하거나 요청하세요..."
                            className="flex-1 input-field"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const userInput = e.currentTarget.value.trim();
                                
                                // Add user message
                                addAiResponse(activeService, {
                                  type: 'user',
                                  text: userInput,
                                  timestamp: new Date().toISOString()
                                });
                                
                                // Get AI recommendation
                                getAiRecommendation(activeService, userInput);
                                
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input?.value.trim()) {
                                const userInput = input.value.trim();
                                addAiResponse(activeService, {
                                  type: 'user',
                                  text: userInput,
                                  timestamp: new Date().toISOString()
                                });
                                getAiRecommendation(activeService, userInput);
                                input.value = '';
                              }
                            }}
                            className="btn-accent px-6">
                            전송
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions - Service Specific */}
                      <div className="grid grid-cols-2 gap-3">
                        {(() => {
                          const quickActions: { [key: string]: Array<{label: string, prompt: string, icon: string}> } = {
                            fashion: [
                              { label: '오늘의 코디', prompt: '오늘 날씨에 맞는 데일리 코디 추천해줘', icon: '👗' },
                              { label: '쇼핑 리스트', prompt: '이번 시즌 필수 아이템 추천', icon: '🛍️' },
                              { label: '스타일 분석', prompt: '내 스타일 유형 분석해줘', icon: '🎨' },
                              { label: '브랜드 추천', prompt: '나에게 맞는 브랜드 추천', icon: '⭐' }
                            ],
                            healthcare: [
                              { label: '오늘의 운동', prompt: '오늘 할 운동 루틴 추천', icon: '💪' },
                              { label: '식단 플랜', prompt: '주간 식단 계획 세워줘', icon: '🥗' },
                              { label: '건강 리포트', prompt: '이번 주 운동 분석', icon: '📊' },
                              { label: '목표 조정', prompt: '현재 진행 상황 체크', icon: '🎯' }
                            ],
                            beauty: [
                              { label: '루틴 추천', prompt: '계절별 스킨케어 루틴', icon: '✨' },
                              { label: '제품 분석', prompt: '화장품 성분 분석', icon: '🔬' },
                              { label: '피부 진단', prompt: '피부 상태 체크', icon: '📸' },
                              { label: '트러블 케어', prompt: '피부 트러블 해결법', icon: '💊' }
                            ],
                            finance: [
                              { label: '포트폴리오', prompt: '현재 포트폴리오 분석', icon: '💼' },
                              { label: '리밸런싱', prompt: '자산 재배분 추천', icon: '⚖️' },
                              { label: '시장 분석', prompt: '최근 시장 동향 분석', icon: '📈' },
                              { label: '절세 전략', prompt: 'ISA 절세 방법', icon: '💰' }
                            ],
                            travel: [
                              { label: '일정 최적화', prompt: '여행 일정 최적화해줘', icon: '🗓️' },
                              { label: '예산 분석', prompt: '여행 경비 절약 팁', icon: '💵' },
                              { label: '맛집 추천', prompt: '현지 맛집 추천', icon: '🍴' },
                              { label: '준비물 체크', prompt: '여행 준비물 리스트', icon: '🎒' }
                            ],
                            education: [
                              { label: '학습 플랜', prompt: '이번 주 학습 계획', icon: '📚' },
                              { label: '모의 면접', prompt: '면접 질문 생성', icon: '🎤' },
                              { label: '이력서 첨삭', prompt: '이력서 개선 포인트', icon: '📝' },
                              { label: '연봉 협상', prompt: '연봉 협상 전략', icon: '💸' }
                            ]
                          };
                          
                          const actions = quickActions[activeService] || [];
                          
                          return actions.map((action, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                // Add user message
                                addAiResponse(activeService, {
                                  type: 'user',
                                  text: action.prompt,
                                  timestamp: new Date().toISOString()
                                });
                                getAiRecommendation(activeService, action.prompt);
                              }}
                              className="btn-ghost py-3 text-sm hover:scale-105 transition-transform">
                              <span className="mr-2">{action.icon}</span>
                              {action.label}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Service Grid View */
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  📦 구매한 서비스 ({purchasedProducts.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedProducts.map((productId, idx) => {
                    const product = LAAS_PRODUCTS.find(p => p.id === productId);
                    if (!product) return null;
                    
                    const progress = serviceProgress[productId] || 0;
                    const responseCount = (aiResponses[productId] || []).length;
                    
                    return (
                      <div 
                        key={productId}
                        className="glass-card p-6 rounded-2xl border border-white/10 hover:border-[#7c6ef5]/30 
                                   transition-all hover:scale-105 cursor-pointer"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        onClick={() => startService(productId)}>
                        
                        {/* Product Icon & Title */}
                        <div className="text-center mb-4">
                          <div className="text-5xl mb-3">{product.icon}</div>
                          <h4 className="text-lg font-bold text-white mb-1">{product.title}</h4>
                          <p className="text-sm text-[#999]">{product.category}</p>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-[#999] mb-2">
                            <span>진행률</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#7c6ef5] to-[#e6a020]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-sm mb-4">
                          <div className="text-[#999]">
                            💬 대화: <span className="text-white font-bold">{responseCount}</span>
                          </div>
                          <div className="text-[#999]">
                            ⏱️ 사용: <span className="text-white font-bold">
                              {Math.floor(Math.random() * 10) + 1}일
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button className="btn-accent w-full py-3 text-sm">
                          {progress === 0 ? '시작하기' : '계속하기'} →
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* Add More Service Card */}
                  <div 
                    className="glass-card p-6 rounded-2xl border border-dashed border-white/20 
                               hover:border-[#7c6ef5]/50 transition-all cursor-pointer
                               flex flex-col items-center justify-center text-center"
                    onClick={() => {
                      setShowDashboard(false);
                      const laasSection = document.getElementById('laas');
                      if (laasSection) {
                        laasSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}>
                    <div className="text-5xl mb-3">➕</div>
                    <h4 className="text-lg font-bold text-white mb-1">새 서비스 추가</h4>
                    <p className="text-sm text-[#999] mb-4">더 많은 AI 서비스를 구독하세요</p>
                    <button className="btn-ghost px-6 py-2 text-sm">
                      둘러보기 →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {purchasedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-white mb-2">아직 구매한 서비스가 없습니다</h3>
                <p className="text-[#999] mb-6">LaaS Shop에서 원하는 AI 서비스를 구독해보세요!</p>
                <button 
                  onClick={() => {
                    setShowDashboard(false);
                    const laasSection = document.getElementById('laas');
                    if (laasSection) {
                      laasSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="btn-accent px-8 py-3">
                  LaaS Shop 둘러보기 →
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ✨ SITUATION-BASED AI RECOMMENDATION MODAL (NEW)                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showRecommendModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4"
             onClick={() => setShowRecommendModal(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-8"
               onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => setShowRecommendModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 
                         flex items-center justify-center text-2xl transition-all z-10">
              ✕
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2 gradient-text flex items-center gap-3">
                <span className="text-4xl">🤖</span>
                AI 상황 기반 상품 추천
              </h2>
              <p className="text-[#999] text-lg">
                특정 상황을 입력하면 AI가 최적의 상품 3개를 추천하고 구매 대행까지 도와드립니다
              </p>
            </div>

            {/* Input Section */}
            <div className="mb-8">
              <label className="block text-white font-bold mb-3 text-lg">
                🎯 어떤 상황인가요?
              </label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={situationInput}
                  onChange={(e) => setSituationInput(e.target.value)}
                  placeholder="예: 내일 면접이 있어요 / 주말에 캠핑 가요 / 재택근무 환경 개선하고 싶어요"
                  className="flex-1 input-field text-lg py-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && situationInput.trim() && !isRecommending) {
                      analyzeSituationAndRecommend(situationInput.trim());
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (situationInput.trim() && !isRecommending) {
                      analyzeSituationAndRecommend(situationInput.trim());
                    }
                  }}
                  disabled={isRecommending || !situationInput.trim()}
                  className="btn-accent px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isRecommending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⚙️</span>
                      분석 중...
                    </>
                  ) : '🔍 추천받기'}
                </button>
              </div>
              
              {/* Quick Situation Examples */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  '내일 면접 있어요',
                  '주말 캠핑 계획',
                  '재택근무 환경 개선',
                  '첫 데이트 준비',
                  '겨울 등산 준비',
                  '해외 여행 준비',
                  '다이어트 시작',
                  '출장 가요'
                ].map((example, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setSituationInput(example);
                      analyzeSituationAndRecommend(example);
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7c6ef5]/50 
                               rounded-full text-sm text-[#999] hover:text-white transition-all">
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    ✨ AI 추천 결과
                    <span className="text-sm font-normal text-teal-400">
                      (상위 {recommendedProducts.length}개)
                    </span>
                  </h3>
                </div>

                {/* Analysis Result */}
                {recommendedProducts[0]?.analysisResult && (
                  <div className="glass-card p-4 rounded-xl border border-[#7c6ef5]/30 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">💡</div>
                      <div className="flex-1">
                        <div className="text-white font-bold mb-2">AI 분석 결과</div>
                        <p className="text-[#999] text-sm leading-relaxed mb-3">
                          {recommendedProducts[0].analysisResult.reasoning}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="text-xs text-[#999]">키워드:</div>
                          {recommendedProducts[0].analysisResult.keywords.map((kw: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-[#7c6ef5]/20 border border-[#7c6ef5]/30 rounded text-xs text-[#7c6ef5]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedProducts.map((product, idx) => (
                    <div 
                      key={product.id}
                      className="glass-card p-5 rounded-2xl border border-white/10 hover:border-[#7c6ef5]/50 transition-all relative overflow-hidden group"
                      style={{ animationDelay: `${idx * 0.1}s` }}>
                      
                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#7c6ef5] to-[#e6a020] 
                                    flex items-center justify-center font-bold text-white text-lg z-10">
                        #{product.rank}
                      </div>

                      {/* Match Score */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-teal-500/20 border border-teal-500/50 rounded-full 
                                    text-xs font-bold text-teal-400 z-10">
                        매칭도 {product.matchScore}%
                      </div>

                      {/* Product Image */}
                      <div className="text-center mb-4 mt-8">
                        <div className="text-6xl mb-3">{product.image}</div>
                        <div className="text-xs text-[#999] mb-1">{product.category}</div>
                        <h4 className="text-lg font-bold text-white mb-1">{product.name}</h4>
                        <p className="text-sm text-[#999]">{product.brand}</p>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-4 pb-4 border-b border-white/10">
                        <div className="text-2xl font-bold text-[#7c6ef5] mb-1">
                          ₩{product.price.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-[#999]">
                          <span>⭐ {product.rating}</span>
                          <span>•</span>
                          <span>리뷰 {product.reviews.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-[#999]">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Shipping Info */}
                      <div className="flex items-center justify-between text-xs text-[#999] mb-4">
                        <span>🚚 {product.shippingDays}일 내 배송</span>
                        <span>판매: {product.seller}</span>
                      </div>

                      {/* Purchase Agent Button */}
                      <button 
                        onClick={() => {
                          requestPurchaseAgent(product);
                          notify(`"${product.name}" 구매 대행을 요청했습니다!`, 'success');
                        }}
                        className="btn-accent w-full py-3 text-sm font-bold hover:scale-105 transition-transform">
                        🛒 구매 대행 요청
                      </button>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#7c6ef5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  ))}
                </div>

                {/* Purchase Agent Orders Status */}
                {purchaseAgentOrders.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      📦 구매 대행 현황
                      <span className="text-sm font-normal text-[#999]">
                        ({purchaseAgentOrders.length}건)
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {purchaseAgentOrders.slice(-3).reverse().map((order, idx) => (
                        <div key={order.id} className="glass-card p-4 rounded-xl flex items-center gap-4">
                          <div className="text-3xl">{order.product.image}</div>
                          <div className="flex-1">
                            <div className="text-white font-bold text-sm mb-1">{order.product.name}</div>
                            <div className="text-xs text-[#999]">
                              주문번호: {order.id} • 송장: {order.trackingNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold mb-1 ${
                              order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                              order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                              order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {order.status === 'processing' ? '⏳ 처리중' :
                               order.status === 'confirmed' ? '✅ 주문확정' :
                               order.status === 'shipped' ? '🚚 배송중' :
                               '📦 배송완료'}
                            </div>
                            <div className="text-xs text-[#999]">도착 예정: {order.estimatedDelivery}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {recommendedProducts.length === 0 && !isRecommending && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">상황을 입력해주세요</h3>
                <p className="text-[#999]">
                  AI가 귀하의 상황에 가장 적합한 상품 3개를 찾아드립니다
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CART MODAL — Update with Purchase Button                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCartModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             onClick={() => setShowCartModal(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          
          <div className="relative w-full max-w-2xl glass-card rounded-3xl p-8"
               onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => setShowCartModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 
                         flex items-center justify-center text-2xl transition-all">
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-6 gradient-text">🛒 장바구니</h2>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-[#999] text-lg">장바구니가 비어있습니다</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((id) => {
                    const product = LAAS_PRODUCTS.find(p => p.id === id);
                    if (!product) return null;
                    
                    return (
                      <div key={id} className="flex items-center gap-4 glass-card p-4 rounded-xl">
                        <div className="text-4xl">{product.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{product.title}</h4>
                          <p className="text-sm text-[#999]">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#7c6ef5]">
                            {(product.monthly / 1000).toFixed(1)}만원<span className="text-sm text-[#999]">/월</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(id)}
                          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 
                                     flex items-center justify-center text-red-400 transition-all">
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between items-center text-xl">
                    <span className="text-[#999]">총 결제 금액</span>
                    <span className="text-3xl font-bold text-white">
                      {cartTotal.toLocaleString()}원<span className="text-lg text-[#999]">/월</span>
                    </span>
                  </div>
                </div>

                <button 
                  onClick={completePurchase}
                  className="btn-accent w-full py-4 text-lg font-bold">
                  💳 {cartTotal.toLocaleString()}원 결제하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
