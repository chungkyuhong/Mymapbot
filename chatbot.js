// 챗봇 상태 관리
const chatbotState = {
    isOpen: false,
    messages: [],
    isTyping: false,
    voiceRecognition: null,
    isListening: false
};

// API 기본 URL
const API_BASE_URL = window.location.origin.replace('5173', '3000');

// 챗봇 초기화
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input');
    const voiceBtn = document.getElementById('chatbot-voice');
    
    // 챗봇 열기/닫기
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            toggleChatbot();
        });
    }
    
    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            toggleChatbot();
        });
    }
    
    // 메시지 전송
    if (chatbotSend) {
        chatbotSend.addEventListener('click', () => {
            sendMessage();
        });
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // 음성 인식
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            toggleVoiceRecognition();
        });
    }
    
    // 언어 선택
    const languageSelect = document.getElementById('chatbot-language-select');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            // 웰컴 메시지 재설정
            chatbotState.messages = [];
            addBotMessage(t('welcomeMessage1'));
            addBotMessage(t('welcomeMessage2'));
            // 퀵 액션 재설정
            addQuickActions([
                { text: t('findRestaurant'), action: 'find_restaurant' },
                { text: t('findParking'), action: 'find_parking' },
                { text: t('driveThru'), action: 'drive_thru' },
                { text: t('orderMenu'), action: 'order_menu' }
            ]);
        });
    }
    
    // 웰컴 메시지
    addBotMessage(t('welcomeMessage1'));
    addBotMessage(t('welcomeMessage2'));
    
    // 퀵 액션 버튼
    addQuickActions([
        { text: t('findRestaurant'), action: 'find_restaurant' },
        { text: t('findParking'), action: 'find_parking' },
        { text: t('driveThru'), action: 'drive_thru' },
        { text: t('orderMenu'), action: 'order_menu' }
    ]);
    
    // 음성 인식 초기화
    initVoiceRecognition();
}

// 챗봇 토글
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-container');
    chatbotState.isOpen = !chatbotState.isOpen;
    
    if (chatbotState.isOpen) {
        chatbot.classList.add('active');
    } else {
        chatbot.classList.remove('active');
    }
}

// 메시지 전송
async function sendMessage(text = null) {
    const input = document.getElementById('chatbot-input');
    const message = text || input.value.trim();
    
    if (!message) return;
    
    // 사용자 메시지 추가
    addUserMessage(message);
    if (!text) input.value = ''; // 입력창에서 온 경우만 초기화
    
    // 타이핑 표시
    showTyping();
    
    try {
        // 백엔드 API 호출
        const location = window.appState?.currentLocation || { lat: 37.5665, lng: 126.9780 };
        
        const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                location,
                context: chatbotState.messages.slice(-5) // 최근 5개 메시지
            })
        });
        
        const result = await response.json();
        hideTyping();
        
        if (result.success) {
            addBotMessage(result.message);
            
            // 데이터가 있으면 표시
            if (result.data && result.data.length > 0) {
                displayResults(result.data, result.intent);
            }
            
            // 퀵 액션 버튼 표시
            if (result.quickActions && result.quickActions.length > 0) {
                addQuickActions(result.quickActions.map(qa => ({
                    text: qa.label,
                    action: qa.action
                })));
            }
        } else {
            addBotMessage(t('requestError'));
        }
    } catch (error) {
        hideTyping();
        addBotMessage(t('generalError'));
        console.error('Chatbot error:', error);
    }
}

// 검색 결과 표시
function displayResults(data, intent) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const resultDiv = document.createElement('div');
    resultDiv.className = 'chatbot-results';
    
    if (intent === 'restaurant_search') {
        // 식당 목록 표시
        data.forEach(restaurant => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="result-header">
                    <h4>${restaurant.name}</h4>
                    <span class="rating">⭐ ${restaurant.rating}</span>
                </div>
                <p class="result-info">${restaurant.address}</p>
                <p class="result-info">📞 ${restaurant.phone || t('noPhone')}</p>
                <p class="result-info">🅿️ ${restaurant.parking ? t('parkingAvailable') : t('parkingUnavailable')}</p>
                <p class="result-info">📍 ${restaurant.distance}m</p>
                <div class="result-actions">
                    <button onclick="viewOnMap(${restaurant.lat}, ${restaurant.lng}, '${restaurant.name}')">${t('viewOnMap')}</button>
                    <button onclick="makeReservation('${restaurant.id}', '${restaurant.name}')">${t('makeReservation')}</button>
                </div>
            `;
            resultDiv.appendChild(card);
        });
    } else if (intent === 'parking_info') {
        // 주차장 목록 표시
        data.forEach(parking => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="result-header">
                    <h4>${parking.name}</h4>
                    <span class="available">${parking.available}/${parking.total}</span>
                </div>
                <p class="result-info">${parking.address}</p>
                <p class="result-info">💰 ${parking.fee}</p>
                <p class="result-info">📍 ${parking.distance}km</p>
                <div class="result-actions">
                    <button onclick="viewOnMap(${parking.lat}, ${parking.lng}, '${parking.name}')">${t('viewOnMap')}</button>
                    <button onclick="reserveParking(${parking.id})">${t('reserveParking')}</button>
                </div>
            `;
            resultDiv.appendChild(card);
        });
    }
    
    messagesDiv.appendChild(resultDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 지도에서 위치 보기
function viewOnMap(lat, lng, name) {
    if (window.map) {
        window.map.setView([lat, lng], 16);
        L.marker([lat, lng]).addTo(window.map)
            .bindPopup(name)
            .openPopup();
    }
    toggleChatbot(); // 챗봇 닫기
}

// 예약하기
async function makeReservation(restaurantId, restaurantName) {
    addBotMessage(`${restaurantName} ${t('reservationPrompt')}`);
    addBotMessage(t('reservationExample'));
    
    // 예약 컨텍스트 저장
    chatbotState.reservationContext = {
        restaurantId,
        restaurantName
    };
}

// 주차 예약
async function reserveParking(parkingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'parking',
                facilityId: parkingId,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                duration: 2
            })
        });
        
        const result = await response.json();
        if (result.success) {
            addBotMessage(t('reservationSuccess'));
        } else {
            addBotMessage(t('reservationFailed'));
        }
    } catch (error) {
        console.error('Parking reservation error:', error);
        addBotMessage(t('reservationError'));
    }
}

// 사용자 메시지 추가
function addUserMessage(message) {
    chatbotState.messages.push({
        type: 'user',
        text: message,
        timestamp: new Date()
    });
    renderMessages();
}

// 봇 메시지 추가
function addBotMessage(message) {
    chatbotState.messages.push({
        type: 'bot',
        text: message,
        timestamp: new Date()
    });
    renderMessages();
}

// 퀵 액션 추가
function addQuickActions(actions) {
    const container = document.getElementById('chatbot-quick-actions');
    if (!container) return;
    
    container.innerHTML = '';
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'quick-action-btn';
        button.textContent = action.text;
        button.onclick = () => {
            sendMessage(action.text);
        };
        container.appendChild(button);
    });
}

// 메시지 렌더링
function renderMessages() {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;
    
    container.innerHTML = '';
    
    chatbotState.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${msg.type}`;
        
        // 아바타
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${msg.type}`;
        avatar.textContent = msg.type === 'bot' ? '🤖' : '👤';
        
        // 메시지 내용
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = msg.text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        container.appendChild(messageDiv);
    });
    
    // 스크롤 하단으로
    container.scrollTop = container.scrollHeight;
}

// 타이핑 표시
function showTyping() {
    chatbotState.isTyping = true;
    const container = document.getElementById('chatbot-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chatbot-message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar bot';
    avatar.textContent = '🤖';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot-typing';
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingIndicator);
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

// 타이핑 숨김
function hideTyping() {
    chatbotState.isTyping = false;
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// 음성 인식 초기화
function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.log('음성 인식을 지원하지 않는 브라우저입니다.');
        return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        chatbotState.isListening = false;
        updateVoiceButton();
    };
    
    recognition.onend = () => {
        chatbotState.isListening = false;
        updateVoiceButton();
    };
    
    chatbotState.voiceRecognition = recognition;
}

// 음성 인식 토글
function toggleVoiceRecognition() {
    if (!chatbotState.voiceRecognition) {
        addBotMessage(t('noSpeechRecognition'));
        return;
    }
    
    if (chatbotState.isListening) {
        chatbotState.voiceRecognition.stop();
    } else {
        chatbotState.voiceRecognition.start();
        chatbotState.isListening = true;
        updateVoiceButton();
        addBotMessage(t('listening'));
    }
}

// 음성 버튼 업데이트
function updateVoiceButton() {
    const voiceBtn = document.getElementById('chatbot-voice');
    if (voiceBtn) {
        if (chatbotState.isListening) {
            voiceBtn.classList.add('listening');
        } else {
            voiceBtn.classList.remove('listening');
        }
    }
}

// DOMContentLoaded에서 초기화
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
});
