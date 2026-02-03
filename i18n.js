// 다국어 지원 - 전체 페이지
const translations = {
    ko: {
        // 헤더 & 네비게이션
        appTitle: '🤖 마이맵봇 (MyMapBot) - AI 기반 스마트 맵 플랫폼',
        appName: '마이맵봇',
        navParking: '주차',
        login: '로그인',
        signup: '회원가입',
        logout: '로그아웃',
        myProfile: '내 정보',
        navRoute: '경로',
        navTravel: '여행',
        navPlanner: '일정',
        navComplaint: '신고',
        navInfo: '주변',
        navBooking: '예약',
        
        // 챗봇
        chatbotTitle: '마이맵봇',
        welcomeMessage1: '안녕하세요! 🤖 마이맵봇입니다. 무엇을 도와드릴까요?',
        welcomeMessage2: '음성으로 말씀하시거나 아래 버튼을 선택해주세요!',
        inputPlaceholder: '메시지를 입력하거나 음성으로 말씀하세요...',
        listening: '🎙️ 말씀하세요...',
        
        // 퀵 액션
        findRestaurant: '🍽️ 식당 찾기',
        findParking: '🅿️ 주차장 찾기',
        driveThru: '🚗 드라이브스루',
        orderMenu: '📋 메뉴 주문',
        
        // 주차 탭
        parkingTitle: '주차장 검색',
        parkingSearch: '주차장 이름을 검색하세요',
        searchButton: '검색',
        availableOnly: '빈 자리만 표시',
        totalSpots: '총',
        availableSpots: '빈 자리',
        fee: '요금',
        perHour: '원/시간',
        viewDetails: '상세보기',
        reserve: '예약',
        
        // 경로 탭
        routeTitle: '경로 검색',
        startLocation: '출발지',
        endLocation: '도착지',
        transportMode: '이동 수단',
        car: '자동차',
        walk: '도보',
        bike: '자전거',
        findRoute: '경로 찾기',
        distance: '거리',
        duration: '소요 시간',
        
        // 여행 탭
        travelTitle: '여행 추천',
        travelPurpose: '여행 목적',
        business: '출장',
        travel: '여행',
        dining: '식사',
        recommendedHotels: '추천 숙박',
        recommendedRestaurants: '추천 음식점',
        recommendedAttractions: '추천 관광지',
        rating: '평점',
        price: '가격',
        bookNow: '예약하기',
        
        // 플래너 탭
        plannerTitle: '여행 플래너',
        createPlan: '새 계획 만들기',
        myPlans: '내 여행 계획',
        planTitle: '계획 제목',
        destination: '목적지',
        startDate: '시작일',
        endDate: '종료일',
        budget: '예산',
        travelers: '여행자 수',
        notes: '메모',
        save: '저장',
        cancel: '취소',
        edit: '수정',
        delete: '삭제',
        
        // 신고 탭
        complaintTitle: '문제 신고',
        complaintType: '신고 유형',
        parkingIssue: '주차 문제',
        roadIssue: '도로 문제',
        facilityIssue: '시설 문제',
        other: '기타',
        location: '위치',
        description: '상세 설명',
        submit: '제출',
        complaintHistory: '신고 내역',
        status: '상태',
        processing: '처리중',
        completed: '완료',
        
        // 주변 탭
        infoTitle: '주변 정보',
        nearbyCategory: '카테고리',
        cafe: '카페',
        restaurant: '음식점',
        convenience: '편의점',
        gasStation: '주유소',
        hospital: '병원',
        searchNearby: '주변 검색',
        
        // 예약 탭
        bookingTitle: '예약 관리',
        bookingType: '예약 유형',
        parkingReservation: '주차장 예약',
        chargingReservation: '전기차 충전',
        carwashReservation: '세차',
        facility: '시설',
        date: '날짜',
        time: '시간',
        duration: '시간',
        confirmBooking: '예약 확인',
        myBookings: '내 예약',
        
        // 검색 결과
        viewOnMap: '지도에서 보기',
        makeReservation: '예약하기',
        reserveParking: '주차 예약',
        parkingAvailable: '주차 가능',
        parkingUnavailable: '주차 불가',
        noPhone: '전화번호 없음',
        noAddress: '주소 정보 없음',
        
        // 메시지
        reservationPrompt: '예약을 진행합니다. 날짜와 시간, 인원을 알려주세요.',
        reservationExample: '예: "내일 저녁 6시 4명"',
        reservationSuccess: '예약이 완료되었습니다! 🎉',
        reservationFailed: '예약에 실패했습니다. 다시 시도해주세요.',
        reservationError: '예약 중 오류가 발생했습니다.',
        requestError: '죄송합니다. 요청을 처리할 수 없습니다.',
        generalError: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        noSpeechRecognition: '죄송합니다. 음성 인식을 지원하지 않는 브라우저입니다.',
        
        // 통계
        availableSpotsStat: '이용 가능',
        activeComplaintsStat: '처리 중 신고',
        todayBookingsStat: '오늘 예약',
        
        // 인증
        loginTitle: '로그인',
        signupTitle: '회원가입',
        email: '이메일',
        password: '비밀번호',
        confirmPassword: '비밀번호 확인',
        name: '이름',
        phone: '전화번호',
        loginButton: '로그인',
        signupButton: '회원가입',
        forgotPassword: '비밀번호 찾기',
        noAccount: '계정이 없으신가요?',
        hasAccount: '이미 계정이 있으신가요?',
        loginSuccess: '로그인 성공!',
        signupSuccess: '회원가입 완료!',
        loginFailed: '로그인 실패',
        signupFailed: '회원가입 실패',
        invalidEmail: '유효하지 않은 이메일',
        passwordMismatch: '비밀번호가 일치하지 않습니다',
        requiredField: '필수 입력 항목입니다'
    },
    en: {
        appTitle: '🤖 MyMapBot - AI-Powered Smart Map Platform',
        appName: 'MyMapBot',
        navParking: 'Parking',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        myProfile: 'My Profile',
        navRoute: 'Route',
        navTravel: 'Travel',
        navPlanner: 'Planner',
        navComplaint: 'Report',
        navInfo: 'Nearby',
        navBooking: 'Booking',
        
        chatbotTitle: 'MyMapBot',
        welcomeMessage1: 'Hello! 🤖 I\'m MyMapBot. How can I help you?',
        welcomeMessage2: 'Speak with voice or select a button below!',
        inputPlaceholder: 'Type a message or speak...',
        listening: '🎙️ Listening...',
        
        findRestaurant: '🍽️ Find Restaurant',
        findParking: '🅿️ Find Parking',
        driveThru: '🚗 Drive-thru',
        orderMenu: '📋 Order Menu',
        
        parkingTitle: 'Parking Search',
        parkingSearch: 'Search parking lot',
        searchButton: 'Search',
        availableOnly: 'Show available only',
        totalSpots: 'Total',
        availableSpots: 'Available',
        fee: 'Fee',
        perHour: '/hour',
        viewDetails: 'Details',
        reserve: 'Reserve',
        
        routeTitle: 'Route Search',
        startLocation: 'Start',
        endLocation: 'End',
        transportMode: 'Transport',
        car: 'Car',
        walk: 'Walk',
        bike: 'Bike',
        findRoute: 'Find Route',
        distance: 'Distance',
        duration: 'Duration',
        
        travelTitle: 'Travel Recommendations',
        travelPurpose: 'Purpose',
        business: 'Business',
        travel: 'Travel',
        dining: 'Dining',
        recommendedHotels: 'Recommended Hotels',
        recommendedRestaurants: 'Recommended Restaurants',
        recommendedAttractions: 'Recommended Attractions',
        rating: 'Rating',
        price: 'Price',
        bookNow: 'Book Now',
        
        plannerTitle: 'Travel Planner',
        createPlan: 'Create New Plan',
        myPlans: 'My Travel Plans',
        planTitle: 'Plan Title',
        destination: 'Destination',
        startDate: 'Start Date',
        endDate: 'End Date',
        budget: 'Budget',
        travelers: 'Travelers',
        notes: 'Notes',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        
        complaintTitle: 'Report Issue',
        complaintType: 'Issue Type',
        parkingIssue: 'Parking Issue',
        roadIssue: 'Road Issue',
        facilityIssue: 'Facility Issue',
        other: 'Other',
        location: 'Location',
        description: 'Description',
        submit: 'Submit',
        complaintHistory: 'Report History',
        status: 'Status',
        processing: 'Processing',
        completed: 'Completed',
        
        infoTitle: 'Nearby Info',
        nearbyCategory: 'Category',
        cafe: 'Cafe',
        restaurant: 'Restaurant',
        convenience: 'Convenience',
        gasStation: 'Gas Station',
        hospital: 'Hospital',
        searchNearby: 'Search Nearby',
        
        bookingTitle: 'Booking Management',
        bookingType: 'Booking Type',
        parkingReservation: 'Parking',
        chargingReservation: 'EV Charging',
        carwashReservation: 'Car Wash',
        facility: 'Facility',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        confirmBooking: 'Confirm',
        myBookings: 'My Bookings',
        
        viewOnMap: 'View on Map',
        makeReservation: 'Reserve',
        reserveParking: 'Reserve Parking',
        parkingAvailable: 'Available',
        parkingUnavailable: 'Not Available',
        noPhone: 'No phone',
        noAddress: 'No address',
        
        reservationPrompt: 'Please tell me the date, time, and number of people.',
        reservationExample: 'Ex: "Tomorrow 6 PM, 4 people"',
        reservationSuccess: 'Reservation completed! 🎉',
        reservationFailed: 'Reservation failed. Please try again.',
        reservationError: 'An error occurred during reservation.',
        requestError: 'Sorry, unable to process your request.',
        generalError: 'Sorry, an error occurred. Please try again.',
        noSpeechRecognition: 'Sorry, speech recognition is not supported.',
        
        availableSpotsStat: 'Available',
        activeComplaintsStat: 'Active Reports',
        todayBookingsStat: 'Today\'s Bookings',
        
        // Auth
        loginTitle: 'Login',
        signupTitle: 'Sign Up',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        name: 'Name',
        phone: 'Phone',
        loginButton: 'Login',
        signupButton: 'Sign Up',
        forgotPassword: 'Forgot Password?',
        noAccount: 'Don\'t have an account?',
        hasAccount: 'Already have an account?',
        loginSuccess: 'Login successful!',
        signupSuccess: 'Sign up complete!',
        loginFailed: 'Login failed',
        signupFailed: 'Sign up failed',
        invalidEmail: 'Invalid email',
        passwordMismatch: 'Passwords do not match',
        requiredField: 'This field is required'
    },
    ja: {
        appTitle: '🤖 マイマップボット (MyMapBot) - AIスマートマップ',
        appName: 'マイマップボット',
        navParking: '駐車',
        login: 'ログイン',
        signup: '会員登録',
        logout: 'ログアウト',
        myProfile: 'マイプロフィール',
        navRoute: '経路',
        navTravel: '旅行',
        navPlanner: 'プランナー',
        navComplaint: '報告',
        navInfo: '周辺',
        navBooking: '予約',
        
        chatbotTitle: 'マイマップボット',
        welcomeMessage1: 'こんにちは！🤖 マイマップボットです。どのようにお手伝いしましょうか？',
        welcomeMessage2: '音声で話すか、下のボタンを選択してください！',
        inputPlaceholder: 'メッセージを入力するか、音声で話してください...',
        listening: '🎙️ 聞いています...',
        
        findRestaurant: '🍽️ レストラン検索',
        findParking: '🅿️ 駐車場検索',
        driveThru: '🚗 ドライブスルー',
        orderMenu: '📋 メニュー注文',
        
        parkingTitle: '駐車場検索',
        parkingSearch: '駐車場名を検索',
        searchButton: '検索',
        availableOnly: '空きのみ表示',
        totalSpots: '合計',
        availableSpots: '空き',
        fee: '料金',
        perHour: '円/時',
        viewDetails: '詳細',
        reserve: '予約',
        
        routeTitle: '経路検索',
        startLocation: '出発地',
        endLocation: '目的地',
        transportMode: '移動手段',
        car: '自動車',
        walk: '徒歩',
        bike: '自転車',
        findRoute: '経路検索',
        distance: '距離',
        duration: '所要時間',
        
        travelTitle: '旅行おすすめ',
        travelPurpose: '旅行目的',
        business: '出張',
        travel: '旅行',
        dining: '食事',
        recommendedHotels: 'おすすめホテル',
        recommendedRestaurants: 'おすすめレストラン',
        recommendedAttractions: 'おすすめ観光地',
        rating: '評価',
        price: '価格',
        bookNow: '今すぐ予約',
        
        plannerTitle: '旅行プランナー',
        createPlan: '新しいプランを作成',
        myPlans: 'マイ旅行プラン',
        planTitle: 'プランタイトル',
        destination: '目的地',
        startDate: '開始日',
        endDate: '終了日',
        budget: '予算',
        travelers: '旅行者数',
        notes: 'メモ',
        save: '保存',
        cancel: 'キャンセル',
        edit: '編集',
        delete: '削除',
        
        complaintTitle: '問題報告',
        complaintType: '問題タイプ',
        parkingIssue: '駐車問題',
        roadIssue: '道路問題',
        facilityIssue: '施設問題',
        other: 'その他',
        location: '場所',
        description: '詳細',
        submit: '送信',
        complaintHistory: '報告履歴',
        status: 'ステータス',
        processing: '処理中',
        completed: '完了',
        
        infoTitle: '周辺案内',
        nearbyCategory: 'カテゴリ',
        cafe: 'カフェ',
        restaurant: 'レストラン',
        convenience: 'コンビニ',
        gasStation: 'ガソリンスタンド',
        hospital: '病院',
        searchNearby: '周辺検索',
        
        bookingTitle: '予約管理',
        bookingType: '予約タイプ',
        parkingReservation: '駐車場予約',
        chargingReservation: 'EV充電',
        carwashReservation: '洗車',
        facility: '施設',
        date: '日付',
        time: '時間',
        duration: '時間',
        confirmBooking: '予約確認',
        myBookings: 'マイ予約',
        
        viewOnMap: '地図で見る',
        makeReservation: '予約する',
        reserveParking: '駐車予約',
        parkingAvailable: '駐車可能',
        parkingUnavailable: '駐車不可',
        noPhone: '電話番号なし',
        noAddress: '住所情報なし',
        
        reservationPrompt: '予約を進めます。日付、時間、人数を教えてください。',
        reservationExample: '例：「明日午後6時 4人」',
        reservationSuccess: '予約が完了しました！🎉',
        reservationFailed: '予約に失敗しました。もう一度お試しください。',
        reservationError: '予約中にエラーが発生しました。',
        requestError: '申し訳ございません。リクエストを処理できません。',
        generalError: '申し訳ございません。エラーが発生しました。',
        noSpeechRecognition: 'このブラウザは音声認識をサポートしていません。',
        
        availableSpotsStat: '利用可能',
        activeComplaintsStat: '処理中の報告',
        todayBookingsStat: '本日の予約',
        
        // 認証
        loginTitle: 'ログイン',
        signupTitle: '会員登録',
        email: 'メール',
        password: 'パスワード',
        confirmPassword: 'パスワード確認',
        name: '名前',
        phone: '電話番号',
        loginButton: 'ログイン',
        signupButton: '会員登録',
        forgotPassword: 'パスワードを忘れました',
        noAccount: 'アカウントがありませんか？',
        hasAccount: '既にアカウントがありますか？',
        loginSuccess: 'ログイン成功！',
        signupSuccess: '会員登録完了！',
        loginFailed: 'ログイン失敗',
        signupFailed: '会員登録失敗',
        invalidEmail: '無効なメール',
        passwordMismatch: 'パスワードが一致しません',
        requiredField: '必須項目です'
    },
    zh: {
        appTitle: '🤖 我的地图机器人 (MyMapBot) - AI智能地图',
        appName: '我的地图机器人',
        navParking: '停车',
        login: '登录',
        signup: '注册',
        logout: '登出',
        myProfile: '我的资料',
        navRoute: '路线',
        navTravel: '旅行',
        navPlanner: '日程',
        navComplaint: '报告',
        navInfo: '附近',
        navBooking: '预订',
        
        chatbotTitle: '我的地图机器人',
        welcomeMessage1: '你好！🤖 我是我的地图机器人。我能帮您什么吗？',
        welcomeMessage2: '请用语音说话或选择下面的按钮！',
        inputPlaceholder: '输入消息或用语音说话...',
        listening: '🎙️ 正在聆听...',
        
        findRestaurant: '🍽️ 找餐厅',
        findParking: '🅿️ 找停车场',
        driveThru: '🚗 免下车服务',
        orderMenu: '📋 订购菜单',
        
        parkingTitle: '停车场搜索',
        parkingSearch: '搜索停车场',
        searchButton: '搜索',
        availableOnly: '仅显示空位',
        totalSpots: '总计',
        availableSpots: '空位',
        fee: '费用',
        perHour: '元/小时',
        viewDetails: '详情',
        reserve: '预订',
        
        routeTitle: '路线搜索',
        startLocation: '起点',
        endLocation: '终点',
        transportMode: '交通方式',
        car: '汽车',
        walk: '步行',
        bike: '自行车',
        findRoute: '查找路线',
        distance: '距离',
        duration: '时长',
        
        travelTitle: '旅行推荐',
        travelPurpose: '旅行目的',
        business: '商务',
        travel: '旅游',
        dining: '餐饮',
        recommendedHotels: '推荐酒店',
        recommendedRestaurants: '推荐餐厅',
        recommendedAttractions: '推荐景点',
        rating: '评分',
        price: '价格',
        bookNow: '立即预订',
        
        plannerTitle: '旅行规划',
        createPlan: '创建新计划',
        myPlans: '我的旅行计划',
        planTitle: '计划标题',
        destination: '目的地',
        startDate: '开始日期',
        endDate: '结束日期',
        budget: '预算',
        travelers: '旅行者数',
        notes: '备注',
        save: '保存',
        cancel: '取消',
        edit: '编辑',
        delete: '删除',
        
        complaintTitle: '问题报告',
        complaintType: '问题类型',
        parkingIssue: '停车问题',
        roadIssue: '道路问题',
        facilityIssue: '设施问题',
        other: '其他',
        location: '位置',
        description: '描述',
        submit: '提交',
        complaintHistory: '报告历史',
        status: '状态',
        processing: '处理中',
        completed: '已完成',
        
        infoTitle: '附近信息',
        nearbyCategory: '类别',
        cafe: '咖啡馆',
        restaurant: '餐厅',
        convenience: '便利店',
        gasStation: '加油站',
        hospital: '医院',
        searchNearby: '搜索附近',
        
        bookingTitle: '预订管理',
        bookingType: '预订类型',
        parkingReservation: '停车预订',
        chargingReservation: '电动车充电',
        carwashReservation: '洗车',
        facility: '设施',
        date: '日期',
        time: '时间',
        duration: '时长',
        confirmBooking: '确认预订',
        myBookings: '我的预订',
        
        viewOnMap: '在地图上查看',
        makeReservation: '预订',
        reserveParking: '预订停车位',
        parkingAvailable: '可停车',
        parkingUnavailable: '无停车位',
        noPhone: '无电话',
        noAddress: '无地址信息',
        
        reservationPrompt: '我们将继续预订。请告诉我日期、时间和人数。',
        reservationExample: '例如："明天晚上6点 4人"',
        reservationSuccess: '预订已完成！🎉',
        reservationFailed: '预订失败。请重试。',
        reservationError: '预订过程中发生错误。',
        requestError: '抱歉，无法处理您的请求。',
        generalError: '抱歉，发生错误。请重试。',
        noSpeechRecognition: '此浏览器不支持语音识别。',
        
        availableSpotsStat: '可用',
        activeComplaintsStat: '处理中的报告',
        todayBookingsStat: '今日预订',
        
        // 认证
        loginTitle: '登录',
        signupTitle: '注册',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        name: '姓名',
        phone: '电话',
        loginButton: '登录',
        signupButton: '注册',
        forgotPassword: '忘记密码？',
        noAccount: '没有账户？',
        hasAccount: '已有账户？',
        loginSuccess: '登录成功！',
        signupSuccess: '注册完成！',
        loginFailed: '登录失败',
        signupFailed: '注册失败',
        invalidEmail: '无效邮箱',
        passwordMismatch: '密码不匹配',
        requiredField: '必填项'
    }
};

// 현재 언어 (기본값: 한국어)
let currentLanguage = 'ko';

// 언어 감지
function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('en')) return 'en';
    return 'ko'; // 기본값
}

// 번역 함수
function t(key) {
    return translations[currentLanguage]?.[key] || translations.ko?.[key] || key;
}

// 언어 설정
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('myMapBot_language', lang);
        updateAllLanguageUI();
        
        // 페이지 새로고침 없이 모든 텍스트 업데이트
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        console.log(`✅ 언어 변경: ${lang}`);
    }
}

// 전체 UI 언어 업데이트
function updateAllLanguageUI() {
    // data-i18n 속성으로 텍스트 업데이트
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // placeholder는 별도 속성으로 처리
        } else if (el.tagName === 'OPTION') {
            el.textContent = translation;
        } else {
            // 이모지 보존
            const emoji = el.textContent.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u)?.[0] || '';
            el.textContent = emoji ? `${emoji} ${translation.replace(emoji, '').trim()}` : translation;
        }
    });
    
    // data-i18n-placeholder 속성으로 placeholder 업데이트
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // data-i18n-title 속성으로 title 업데이트
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    
    console.log(`🌐 UI 업데이트 완료: ${currentLanguage}`);
}

// 초기화 함수
function initLanguage() {
    const savedLang = localStorage.getItem('myMapBot_language');
    currentLanguage = savedLang || detectLanguage();
    updateAllLanguageUI();
}

// 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}
