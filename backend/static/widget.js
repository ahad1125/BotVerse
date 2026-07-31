(function () {
    const scriptTag = document.currentScript;
    const botId = scriptTag.getAttribute('data-bot-id');
    const apiBase = scriptTag.getAttribute('data-api-base') || ('http://127.0.0.1:8000/api/v1')

    if (!botId) {
        console.error('Widget : data-bot-id is required.')
        return;
    }

    let conversationId = null;
    let botInfo = null;

    const host = document.createElement('div')
    host.id = 'widget-root'
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })

    const style = document.createElement('style');

    function applyPrimaryColor(color) {
        if (!color) return;
        style.textContent = style.textContent.replaceAll('#4f46e5', color)
    }

    style.textContent =
        `
         * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #4f46e5; color: white; display: flex;
      align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      z-index: 999999; border: none; outline: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    }
    .bubble:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 20px rgba(0,0,0,0.24);
    }
    .bubble:active {
      transform: scale(0.96);
    }
    .window {
      position: fixed; bottom: 96px; right: 24px;
      width: 350px; height: 500px;
      background: white; border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
      display: none; flex-direction: column;
      overflow: hidden; z-index: 999999;
      border: 1px solid rgba(0,0,0,0.06);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .window.open { display: flex; }
    .header {
      background: #4f46e5; color: white; padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .header-info {
      display: flex; align-items: center; gap: 10px;
      min-width: 0;
    }
    .header-title-container {
      display: flex; flex-direction: column;
      min-width: 0;
    }
    .header-title {
      font-weight: 600; font-size: 15px; line-height: 1.2;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .header-subtitle {
      font-size: 10px; opacity: 0.85; margin-top: 3px; display: flex; align-items: center; gap: 4.5px;
    }
    .header-subtitle::before {
      content: ''; width: 5.5px; height: 5.5px; background: #10b981; border-radius: 50%; display: inline-block;
    }
    .header img {
      width: 32px; height: 32px; border-radius: 50%;
      object-fit: cover; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.2);
    }
    .header-close {
      background: none; border: none; color: white; opacity: 0.75; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; outline: none;
    }
    .header-close:hover { opacity: 1; }
    .messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f9fafb;
    }
    .msg { max-width: 80%; padding: 10px 14px; font-size: 13.5px; line-height: 1.45; }
    .msg.user {
      align-self: flex-end; background: #4f46e5; color: white;
      border-radius: 16px 16px 4px 16px;
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
    }
    .msg.bot {
      align-self: flex-start; background: white; border: 1px solid #f3f4f6; color: #1f2937;
      border-radius: 4px 16px 16px 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .typing-bubble {
      align-self: flex-start; background: white; border: 1px solid #f3f4f6; padding: 10px 14px;
      border-radius: 4px 16px 16px 16px; display: flex; align-items: center; gap: 3.5px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .dot {
      width: 5px; height: 5px; background-color: #9ca3af;
      border-radius: 50%; display: inline-block;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.30s; }
    .quick-replies-container {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 16px 12px; background: #f9fafb;
    }
    .quick-reply-btn {
      border: 1px solid #e5e7eb; background: white; border-radius: 999px;
      padding: 5px 11px; font-size: 12px; cursor: pointer; color: #4b5563; font-weight: 500;
      transition: all 0.2s ease-in-out; outline: none;
    }
    .quick-reply-btn:hover {
      background: #f3f4f6; border-color: #d1d5db; color: #1f2937;
    }
    .input-row {
      display: flex; align-items: center; border-top: 1px solid #f3f4f6; padding: 10px 14px; background: white; gap: 10px;
    }
    .input-row input {
      flex: 1; border: none; outline: none; font-size: 13.5px; padding: 8px 14px; background: #f3f4f6; border-radius: 20px; transition: background 0.2s;
    }
    .input-row input:focus {
      background: #e5e7eb;
    }
    .input-row button {
      background: #4f46e5; color: white; border: none; outline: none;
      border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.2s, transform 0.2s; flex-shrink: 0;
    }
    .input-row button:hover {
      opacity: 0.9; transform: scale(1.04);
    }
    .input-row button:active {
      transform: scale(0.96);
    }
    .input-row button:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        `;

    const chatIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    const closeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    const bubble = document.createElement('button')
    bubble.className = 'bubble'
    bubble.innerHTML = chatIcon;

    const win = document.createElement('div')
    win.className = 'window'
    win.innerHTML = `
    <div class="header" id="conv-header">
      <div class="header-info">
        <span class="header-title-container">
          <span class="header-title" id="conv-header-text">Chat</span>
          <span class="header-subtitle" id="conv-header-subtitle">Online</span>
        </span>
      </div>
      <button class="header-close" id="conv-close" title="Close chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="messages" id="conv-messages"></div>
    <div class="quick-replies-container" id="conv-qr-container"></div>
    <div class="input-row">
      <input type="text" id="conv-input" placeholder="Type a message..." />
      <button id="conv-send" title="Send message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
  `;

    shadow.appendChild(style)
    shadow.appendChild(bubble)
    shadow.append(win)

    const messagesEl = shadow.getElementById('conv-messages')
    const inputEl = shadow.getElementById('conv-input')
    const sendBtn = shadow.getElementById('conv-send')
    const headerEl = shadow.getElementById('conv-header')
    const headerInfoEl = headerEl.querySelector('.header-info')
    const headerTextEl = shadow.getElementById('conv-header-text')
    const closeBtn = shadow.getElementById('conv-close')
    const qrContainer = shadow.getElementById('conv-qr-container')

    function appendMessage(text, sender) {
        const div = document.createElement('div')
        div.className = `msg ${sender}`
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'typing-bubble'
        div.id = 'typing-indicator';
        div.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>'
        messagesEl.appendChild(div)
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const el = shadow.getElementById('typing-indicator')
        if (el) el.remove();
    }

    let quickReplies = []

    async function loadQuickReplies() {
        try {
            const res = await fetch(`${apiBase}/bots/${botId}/public-quick-replies/`)
            quickReplies = await res.json();
            renderQuickReplies();
        } catch (err) {
            console.error('Widget: failed to load quick replies', err)
        }
    }

    function renderQuickReplies() {
        if (!quickReplies.length) return;
        qrContainer.innerHTML = '';
        quickReplies.forEach((qr) => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = qr.text;
            btn.addEventListener('click', () => {
                inputEl.value = qr.text;
                sendMessage();
                qrContainer.innerHTML = '';
            })
            qrContainer.appendChild(btn);
        })
    }

    function renderAvatar(avatarUrl, name) {
        if (!avatarUrl) return;
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = name || 'Bot avatar';
        headerInfoEl.insertBefore(img, headerInfoEl.firstChild);
    }

    async function loadBotInfo() {
        try {
            const res = await fetch(`${apiBase}/bots/${botId}/public-info/`)
            const data = await res.json();
            botInfo = data;
            headerTextEl.textContent = data.name || 'Chat';

            if (data.avatar) {
                renderAvatar(data.avatar, data.name);
            }

            if (data.greeting_message) {
                appendMessage(data.greeting_message, 'bot')
            }
            applyPrimaryColor(data.primary_color)
            loadQuickReplies();
        } catch (error) {
            headerTextEl.textContent = 'Chat';
            console.error('Widget : Failed to load bot info', error);
        }
    }

    let infoLoaded = false;

    function toggleChat(forceState) {
        const willOpen = typeof forceState === 'boolean' ? forceState : !win.classList.contains('open');
        
        if (willOpen) {
            win.classList.add('open');
            bubble.innerHTML = closeIcon;
            if (!infoLoaded) {
                infoLoaded = true;
                loadBotInfo();
            }
        } else {
            win.classList.remove('open');
            bubble.innerHTML = chatIcon;
        }
    }

    bubble.addEventListener('click', () => toggleChat())
    closeBtn.addEventListener('click', () => toggleChat(false))

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        inputEl.value = ''
        sendBtn.disabled = true
        showTyping();
        qrContainer.innerHTML = '';

        try {
            const res = await fetch(`${apiBase}/bots/${botId}/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversation_id: conversationId
                })
            })

            const data = await res.json();
            hideTyping();
            if (res.ok) {
                conversationId = data.conversation_id;
                appendMessage(data.answer, 'bot');
            } else {
                appendMessage('Sorry, something went wrong.', 'bot');
            }
        } catch (error) {
            hideTyping();
            appendMessage('Sorry, something went wrong.', 'bot');
            console.error('Widget : chat request failed', error)
        }
        finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', sendMessage)
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')
            sendMessage();
    })

})();