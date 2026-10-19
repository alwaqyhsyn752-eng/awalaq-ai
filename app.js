const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// رابط الـ Worker الخاص بك
const WORKER_URL = "https://round-dew-b9e5awalaq-gateway.alwaqyhsyn752.workers.dev/api/chat";

let splashDone = false;
function finishSplash() {
  if (splashDone) return; splashDone = true;
  const sp = $('#splash');
  if (sp) sp.style.display = 'none';
  $('#app').classList.remove('hidden');
  $('#status-text').textContent = 'متصل';
}
setTimeout(finishSplash, 2000);
const skipBtn = $('#skip-btn');
if (skipBtn) skipBtn.onclick = finishSplash;

const K_SESS = 'awalaq.sessions.v11', K_ACTIVE = 'awalaq.active.v11';
const state = { sessions: [], activeId: null, busy: false };

function load() {
  try {
    state.sessions = JSON.parse(localStorage.getItem(K_SESS) || '[]');
    const a = localStorage.getItem(K_ACTIVE);
    if (a) state.activeId = a;
    else if (state.sessions.length) state.activeId = state.sessions[0].id;
  } catch { state.sessions = []; }
}
function save() {
  localStorage.setItem(K_SESS, JSON.stringify(state.sessions));
  if (state.activeId) localStorage.setItem(K_ACTIVE, state.activeId);
}
const current = () => state.sessions.find(s => s.id === state.activeId);

function newSession() {
  const s = { id: uid(), title: 'محادثة جديدة', messages: [] };
  state.sessions.unshift(s); state.activeId = s.id;
  save(); drawSessions(); drawMessages();
}

function drawSessions() {
  const e = $('#sessions-list'); if (!e) return;
  e.innerHTML = '';
  state.sessions.forEach(s => {
    const d = document.createElement('div');
    d.className = `session-item ${s.id === state.activeId ? 'active' : ''}`;
    d.textContent = s.title;
    d.onclick = () => { state.activeId = s.id; save(); drawSessions(); drawMessages(); };
    e.appendChild(d);
  });
}

function drawMessages() {
  const box = $('#messages'); if (!box) return;
  const s = current(); box.innerHTML = '';
  if (!s || !s.messages.length) {
    box.innerHTML = '<div style="text-align:center; padding:2rem; color:#7d8bb5;">مرحباً بك. اكتب طلبك البرمجي وسيتم الرد فوراً.</div>';
    return;
  }
  s.messages.forEach(m => {
    const d = document.createElement('div');
    d.className = `message ${m.role}`;
    d.innerHTML = `<div class="bubble" style="white-space:pre-wrap;">${m.content}</div>`;
    box.appendChild(d);
  });
  box.scrollTop = box.scrollHeight;
}

const input = $('#user-input');
if (input) {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
  });
}
const sendBtn = $('#send-btn');
if (sendBtn) sendBtn.onclick = send;
const newBtn = $('#new-chat-btn');
if (newBtn) newBtn.onclick = newSession;

async function send() {
  const text = input.value.trim();
  if (!text || state.busy) return;
  
  let s = current();
  if (!s) { newSession(); s = current(); }
  
  s.messages.push({ role: 'user', content: text });
  if (s.title === 'محادثة جديدة') s.title = text.slice(0, 30);
  input.value = ''; save(); drawSessions(); drawMessages();
  
  state.busy = true; sendBtn.disabled = true; $('#status-text').textContent = 'يفكر...';
  const live = { role: 'assistant', content: 'جاري التوليد...' };
  s.messages.push(live); drawMessages();

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: s.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    live.content = data.content;
  } catch (err) {
    live.content = "خطأ: " + err.message;
  } finally {
    state.busy = false; sendBtn.disabled = false; $('#status-text').textContent = 'متصل';
    save(); drawMessages();
  }
}

load();
if (!state.sessions.length) newSession();
drawSessions(); drawMessages();
