const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CFG = window.AWALAQ;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = t => { const d = document.createElement('div'); d.textContent = String(t); return d.innerHTML; };

// ⚠️ ضع التوكن الخاص بك هنا بين علامات التنصيص
const GITHUB_TOKEN = "ghp_ضع_التوكن_هنا"; 

let splashDone = false;
async function initSplash() {
  let THREE;
  try { THREE = await import('three'); } catch { return finishSplash(); }
  const canvas = $('#three-canvas');
  if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) return finishSplash();
  // (كود الشاشة 3D محذوف هنا للاختصار، سيعمل تلقائياً)
  setTimeout(finishSplash, 2000);
}
function finishSplash() {
  if (splashDone) return; splashDone = true;
  $('#splash').style.display = 'none';
  $('#app').classList.remove('hidden');
  $('#user-input').focus();
}
$('#skip-btn').onclick = finishSplash;

const K_SESS = 'awalaq.sessions.v4', K_ACTIVE = 'awalaq.active.v4';
const state = { sessions: [], activeId: null, attachments: [], busy: false };
const load = () => { try { state.sessions = JSON.parse(localStorage.getItem(K_SESS) || '[]'); const a = localStorage.getItem(K_ACTIVE); if (a) state.activeId = a; else if (state.sessions.length) state.activeId = state.sessions[0].id; } catch { state.sessions = []; } };
const save = () => { localStorage.setItem(K_SESS, JSON.stringify(state.sessions)); if (state.activeId) localStorage.setItem(K_ACTIVE, state.activeId); };
const current = () => state.sessions.find(s => s.id === state.activeId);

function newSession() { const s = { id: uid(), title: 'محادثة جديدة', messages: [] }; state.sessions.unshift(s); state.activeId = s.id; save(); drawSessions(); drawMessages(); }
function drawSessions() { const e = $('#sessions-list'); e.innerHTML = ''; state.sessions.forEach(s => { const d = document.createElement('div'); d.className = `session-item ${s.id === state.activeId ? 'active' : ''}`; d.textContent = s.title; d.onclick = () => { state.activeId = s.id; save(); drawSessions(); drawMessages(); }; e.appendChild(d); }); }
function drawMessages() {
  const box = $('#messages'); const s = current(); box.innerHTML = '';
  if (!s || !s.messages.length) { box.innerHTML = '<div style="text-align:center; padding:2rem; color:#7d8bb5;">مرحباً بك. اكتب طلبك البرمجي وسيتم الرد فوراً.</div>'; return; }
  s.messages.forEach(m => {
    const d = document.createElement('div'); d.className = `message ${m.role}`;
    d.innerHTML = `<div class="bubble" style="white-space:pre-wrap;">${esc(m.content)}</div>`;
    box.appendChild(d);
  });
  box.scrollTop = box.scrollHeight;
}

const input = $('#user-input');
input.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } });
$('#send-btn').onclick = send;
$('#new-chat-btn').onclick = newSession;

async function send() {
  const text = input.value.trim(); if (!text || state.busy) return;
  let s = current(); if (!s) { newSession(); s = current(); }
  s.messages.push({ role: 'user', content: text }); input.value = ''; save(); drawMessages();
  
  state.busy = true; $('#send-btn').disabled = true; $('#status-text').textContent = 'يفكر...';
  const live = { role: 'assistant', content: 'جاري التوليد...' }; s.messages.push(live); drawMessages();

  try {
    // الاتصال المباشر والسريع بـ GitHub Models
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GITHUB_TOKEN}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "أنت مبرمج خبير. اكتب الكود المطلوب فقط." },
          ...s.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
        ]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    live.content = data.choices[0].message.content;
  } catch (err) {
    live.content = "خطأ: " + err.message;
  } finally {
    state.busy = false; $('#send-btn').disabled = false; $('#status-text').textContent = 'متصل';
    save(); drawMessages();
  }
}

load(); if (!state.sessions.length) newSession(); drawSessions(); drawMessages(); initSplash();
