// 다국어 지원
const translations = {
    ko: {
        // 챗봇 기본
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
        reservationSuccess: '주차 예약이 완료되었습니다! 🎉',
        reservationFailed: '예약에 실패했습니다. 다시 시도해주세요.',
        reservationError: '예약 중 오류가 발생했습니다.',
        requestError: '죄송합니다. 요청을 처리할 수 없습니다.',
        generalError: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        noSpeechRecognition: '죄송합니다. 음성 인식을 지원하지 않는 브라우저입니다.'
    },
    en: {
        chatbotTitle: 'MyMapBot',
        welcomeMessage1: 'Hello! 🤖 I\'m MyMapBot. How can I help you?',
        welcomeMessage2: 'Speak with voice or select a button below!',
        inputPlaceholder: 'Type a message or speak...',
        listening: '🎙️ Listening...',
        
        findRestaurant: '🍽️ Find Restaurant',
        findParking: '🅿️ Find Parking',
        driveThru: '🚗 Drive-thru',
        orderMenu: '📋 Order Menu',
        
        viewOnMap: 'View on Map',
        makeReservation: 'Reserve',
        reserveParking: 'Reserve Parking',
        parkingAvailable: 'Parking Available',
        parkingUnavailable: 'No Parking',
        noPhone: 'No phone',
        noAddress: 'No address',
        
        reservationPrompt: 'Please tell me the date, time, and number of people.',
        reservationExample: 'Ex: "Tomorrow 6 PM, 4 people"',
        reservationSuccess: 'Parking reservation completed! 🎉',
        reservationFailed: 'Reservation failed. Please try again.',
        reservationError: 'An error occurred during reservation.',
        requestError: 'Sorry, unable to process your request.',
        generalError: 'Sorry, an error occurred. Please try again.',
        noSpeechRecognition: 'Sorry, speech recognition is not supported in this browser.'
    },
    ja: {
        chatbotTitle: 'マイマップボット',
        welcomeMessage1: 'こんにちは！🤖 マイマップボットです。どのようにお手伝いしましょうか？',
        welcomeMessage2: '音声で話すか、下のボタンを選択してください！',
        inputPlaceholder: 'メッセージを入力するか、音声で話してください...',
        listening: '🎙️ 聞いています...',
        
        findRestaurant: '🍽️ レストラン検索',
        findParking: '🅿️ 駐車場検索',
        driveThru: '🚗 ドライブスルー',
        orderMenu: '📋 メニュー注文',
        
        viewOnMap: '地図で見る',
        makeReservation: '予約する',
        reserveParking: '駐車予約',
        parkingAvailable: '駐車可能',
        parkingUnavailable: '駐車不可',
        noPhone: '電話番号なし',
        noAddress: '住所情報なし',
        
        reservationPrompt: '予約を進めます。日付、時間、人数を教えてください。',
        reservationExample: '例：「明日午後6時 4人」',
        reservationSuccess: '駐車予約が完了しました！🎉',
        reservationFailed: '予約に失敗しました。もう一度お試しください。',
        reservationError: '予約中にエラーが発生しました。',
        requestError: '申し訳ございません。リクエストを処理できません。',
        generalError: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        noSpeechRecognition: '申し訳ございません。このブラウザは音声認識をサポートしていません。'
    },
    zh: {
        chatbotTitle: '我的地图机器人',
        welcomeMessage1: '你好！🤖 我是我的地图机器人。我能帮您什么吗？',
        welcomeMessage2: '请用语音说话或选择下面的按钮！',
        inputPlaceholder: '输入消息或用语音说话...',
        listening: '🎙️ 正在聆听...',
        
        findRestaurant: '🍽️ 找餐厅',
        findParking: '🅿️ 找停车场',
        driveThru: '🚗 免下车服务',
        orderMenu: '📋 订购菜单',
        
        viewOnMap: '在地图上查看',
        makeReservation: '预订',
        reserveParking: '预订停车位',
        parkingAvailable: '可停车',
        parkingUnavailable: '无停车位',
        noPhone: '无电话',
        noAddress: '无地址信息',
        
        reservationPrompt: '我们将继续预订。请告诉我日期、时间和人数。',
        reservationExample: '例如："明天晚上6点 4人"',
        reservationSuccess: '停车预订已完成！🎉',
        reservationFailed: '预订失败。请重试。',
        reservationError: '预订过程中发生错误。',
        requestError: '抱歉，无法处理您的请求。',
        generalError: '抱歉，发生错误。请重试。',
        noSpeechRecognition: '抱歉，此浏览器不支持语音识别。'
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
    return translations[currentLanguage][key] || translations.ko[key] || key;
}

// 언어 설정
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('chatbot_language', lang);
        updateLanguageUI();
    }
}

// UI 언어 업데이트
function updateLanguageUI() {
    // 챗봇 제목
    const title = document.querySelector('.chatbot-title span:last-child');
    if (title) title.textContent = t('chatbotTitle');
    
    // 입력 플레이스홀더
    const input = document.getElementById('chatbot-input');
    if (input) input.placeholder = t('inputPlaceholder');
}

// 초기화
currentLanguage = localStorage.getItem('chatbot_language') || detectLanguage();

// Export for use in chatbot.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, currentLanguage };
}
