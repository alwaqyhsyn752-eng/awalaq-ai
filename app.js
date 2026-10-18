const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const CFG=window.AWALAQ;
const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const esc=t=>{const d=document.createElement('div');d.textContent=String(t);return d.innerHTML;};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');
clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400);}
let splashDone=false;
async function initSplash(){
  let THREE;try{THREE=await import('three');}catch{return fallbackSplash('Three.js غير متاح');}
  const c=$('#three-canvas');
  if(!(c.getContext('webgl2')||c.getContext('webgl')))return fallbackSplash('WebGL غير مدعوم');
  try{buildScene(THREE,c);fakeLoading();}catch(e){console.error(e);fallbackSplash('فشل المشهد');}
}
function buildScene(THREE,canvas){
  const r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  r.setSize(innerWidth,innerHeight);r.setPixelRatio(Math.min(devicePixelRatio,2));
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.15;
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x05060f,0.05);
  const cam=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,1.7,7.2);const clock=new THREE.Clock();
  scene.add(new THREE.AmbientLight(0x4466ff,0.35));
  [[0x4dd0ff,4,[3.6,3.2,3.6]],[0xa06bff,4,[-3.6,2.5,2.6]],[0x00ffd5,2.2,[0,-2,4.2]]]
    .forEach(([c,i,p])=>{const l=new THREE.PointLight(c,i,28,2);l.position.set(...p);scene.add(l);});
  const floor=new THREE.Mesh(new THREE.CircleGeometry(9.5,96),
    new THREE.MeshStandardMaterial({color:0x060914,metalness:.96,roughness:.14,
    emissive:0x0a1530,emissiveIntensity:.32}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.65;scene.add(floor);
  [[2.4,.06,0x4dd0ff],[2.95,.028,0xa06bff]].forEach(([rr,t,c])=>{
    const m=new THREE.Mesh(new THREE.TorusGeometry(rr,t,16,100),
      new THREE.MeshBasicMaterial({color:c,transparent:c!==0x4dd0ff,opacity:.65}));
    m.rotation.x=-Math.PI/2;m.position.y=-1.55;scene.add(m);});
  const brain=new THREE.Group();
  brain.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.18,2),
    new THREE.MeshStandardMaterial({color:0x4dd0ff,emissive:0x4dd0ff,emissiveIntensity:.75,
    wireframe:true,transparent:true,opacity:.85})));
  brain.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.06,1),
    new THREE.MeshStandardMaterial({color:0x0a1530,emissive:0x1a3a70,emissiveIntensity:.65,
    metalness:.85,roughness:.35,transparent:true,opacity:.5})));
  const core=new THREE.Mesh(new THREE.SphereGeometry(.52,32,32),
    new THREE.MeshBasicMaterial({color:0xa06bff,transparent:true,opacity:.88}));
  brain.add(core);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(.78,24,24),
    new THREE.MeshBasicMaterial({color:0xa06bff,transparent:true,opacity:.14,
    blending:THREE.AdditiveBlending}));
  brain.add(halo);scene.add(brain);
  const rings=[0x4dd0ff,0xa06bff,0x00ffd5].map((c,i)=>{
    const rr=new THREE.Mesh(new THREE.TorusGeometry(1.75+i*.38,.016,8,128),
      new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.82}));
    rr.rotation.x=Math.PI/2+(i-1)*.52;rr.rotation.y=i*.65;scene.add(rr);return rr;});
  const holo=new THREE.Group();
  for(let i=0;i<6;i++){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(1.35,.88),
      new THREE.MeshBasicMaterial({color:i%2?0xa06bff:0x4dd0ff,transparent:true,opacity:.08,
      side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    const a=(i/6)*Math.PI*2,R=3.15;
    p.position.set(Math.cos(a)*R,.2+Math.sin(i*1.3)*.9,Math.sin(a)*R);
    p.lookAt(0,0,0);p.userData={baseY:p.position.y,phase:i*.85};holo.add(p);
    const b=new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry),
      new THREE.LineBasicMaterial({color:i%2?0xa06bff:0x4dd0ff,transparent:true,opacity:.55}));
    b.position.copy(p.position);b.quaternion.copy(p.quaternion);b.userData=p.userData;holo.add(b);}
  scene.add(holo);
  const N=950,pos=new Float32Array(N*3),col=new Float32Array(N*3);
  const C=[new THREE.Color(0x4dd0ff),new THREE.Color(0xa06bff),new THREE.Color(0x00ffd5)];
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*25;pos[i*3+1]=(Math.random()-.5)*17;
    pos[i*3+2]=(Math.random()-.5)*25;
    const c=C[Math.random()<.5?0:Math.random()<.7?1:2];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  const pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  pg.setAttribute('color',new THREE.BufferAttribute(col,3));
  const particles=new THREE.Points(pg,new THREE.PointsMaterial({size:.055,vertexColors:true,
    transparent:true,opacity:.72,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene.add(particles);
  const mouse={x:0,y:0};
  const track=e=>{const t=e.touches?.[0]??e;mouse.x=(t.clientX/innerWidth)*2-1;
    mouse.y=-(t.clientY/innerHeight)*2+1;};
  addEventListener('mousemove',track);addEventListener('touchmove',track,{passive:true});
  (function loop(){
    if(splashDone)return;requestAnimationFrame(loop);
    const t=clock.getElapsedTime();
    brain.rotation.y=t*.32;brain.rotation.x=Math.sin(t*.52)*.14;
    core.scale.setScalar(1+Math.sin(t*3.1)*.08);
    halo.scale.setScalar(1+Math.sin(t*1.35)*.13);
    rings.forEach((rr,i)=>{rr.rotation.z+=.0042+i*.0018;rr.rotation.y+=.0028*(i%2?-1:1);});
    holo.children.forEach(o=>{o.position.y=o.userData.baseY+Math.sin(t*.8+o.userData.phase)*.14;
      o.material.opacity=.08+(Math.sin(t*1.5+o.userData.phase)*.5+.5)*.08;});
    particles.rotation.y=t*.028;
    cam.position.x+=(Math.sin(t*.24)*.5+mouse.x*.8-cam.position.x)*.05;
    cam.position.y+=(1.7+Math.sin(t*.38)*.14+mouse.y*.4-cam.position.y)*.05;
    cam.lookAt(0,0,0);r.render(scene,cam);
  })();
  addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
    r.setSize(innerWidth,innerHeight);});
}
function fakeLoading(){
  const f=$('#loading-fill'),t=$('#loading-text');
  const steps=['تهيئة الغرفة البلورية…','تحميل نواة الوكلاء…','ربط Logic Node…','ربط CodeGen Node…','جاهز'];
  let p=0;const iv=setInterval(()=>{p+=7+Math.random()*11;
    if(p>=100){p=100;clearInterval(iv);}f.style.width=p+'%';
    t.textContent=steps[Math.min(steps.length-1,Math.floor(p/21))];
    if(p===100)setTimeout(finishSplash,480);},210);
}
function fallbackSplash(r){
  $('#splash').classList.add('fallback');$('#loading-text').textContent=`الوضع الاحتياطي — ${r}`;
  const f=$('#loading-fill');f.style.transition='width 1.1s';f.style.width='100%';
  setTimeout(finishSplash,1300);
}
function finishSplash(){
  if(splashDone)return;splashDone=true;$('#splash').classList.add('fade-out');
  setTimeout(()=>{$('#splash').style.display='none';$('#app').classList.remove('hidden');
    $('#user-input').focus();probePipeline();},700);
}
$('#skip-btn').onclick=finishSplash;
const K_SESS='awalaq.sessions.v3',K_ACTIVE='awalaq.active.v3';
const state={sessions:[],activeId:null,attachments:[],busy:false};
const load=()=>{try{state.sessions=JSON.parse(localStorage.getItem(K_SESS)||'[]');
  const a=localStorage.getItem(K_ACTIVE);
  if(a&&state.sessions.some(s=>s.id===a))state.activeId=a;
  else if(state.sessions.length)state.activeId=state.sessions[0].id;}catch{state.sessions=[];}};
const save=()=>{try{localStorage.setItem(K_SESS,JSON.stringify(state.sessions));
  if(state.activeId)localStorage.setItem(K_ACTIVE,state.activeId);}catch{toast('التخزين ممتلئ');}};
const current=()=>state.sessions.find(s=>s.id===state.activeId);
function newSession(){const s={id:uid(),title:'محادثة جديدة',messages:[],createdAt:Date.now()};
  state.sessions.unshift(s);state.activeId=s.id;
  save();drawSessions();drawMessages();drawHeader();}
function delSession(id){if(!confirm('حذف؟'))return;
  state.sessions=state.sessions.filter(s=>s.id!==id);
  if(state.activeId===id)state.activeId=state.sessions[0]?.id||null;
  if(!state.sessions.length)newSession();else{save();drawSessions();drawMessages();drawHeader();}}
function pickSession(id){state.activeId=id;save();drawSessions();drawMessages();drawHeader();
  $('#sidebar').classList.remove('open');}
function drawSessions(){const e=$('#sessions-list');e.innerHTML='';
  state.sessions.forEach(s=>{const d=document.createElement('div');
    d.className=`session-item${s.id===state.activeId?' active':''}`;
    d.innerHTML=`<div class="session-title">${esc(s.title)}</div><button class="session-del">✕</button>`;
    d.querySelector('.session-title').onclick=()=>pickSession(s.id);
    d.querySelector('.session-del').onclick=ev=>{ev.stopPropagation();delSession(s.id);};
    e.appendChild(d);});}
function drawHeader(){const s=current();$('#header-title').textContent=s?s.title:'محادثة جديدة';}
function drawMessages(){
  const box=$('#messages'),s=current();box.innerHTML='';
  if(!s||!s.messages.length){
    box.innerHTML=`<div class="empty-state"><div class="empty-icon">◈</div>
      <h2>نظام الوكلاء جاهز</h2>
      <p>Master يستقبل، Logic يحلل، CodeGen ينتج — والنتيجة تعود إليك مباشرة.</p>
      <div class="suggestions">
      <button class="suggestion-card" data-p="اكتب دالة JavaScript لفرز مصفوفة merge sort مع تحليل التعقيد">merge sort بـ JavaScript</button>
      <button class="suggestion-card" data-p="اشرح خوارزمية A* مع مثال Python">شرح خوارزمية A*</button>
      <button class="suggestion-card" data-p="راجع هذا الكود للثغرات: db.query('SELECT * FROM users WHERE id='+req.query.id)">فحص SQL Injection</button>
      <button class="suggestion-card" data-p="اكتب Express.js مع JWT وتحديد معدل">API مع JWT</button></div></div>`;
    $$('.suggestion-card',box).forEach(c=>c.onclick=()=>{const i=$('#user-input');
      i.value=c.dataset.p;autoGrow();i.focus();});
    return;
  }
  s.messages.forEach((m,i)=>box.appendChild(buildMsg(m,i)));
  box.scrollTop=box.scrollHeight;
}
function buildMsg(m,idx){
  const wrap=document.createElement('div');wrap.className=`message ${m.role}`;
  const av=document.createElement('div');av.className='avatar';
  av.textContent=m.role==='user'?'⌬':'◈';
  const bubble=document.createElement('div');bubble.className='bubble';
  if(m.role==='assistant'){bubble.innerHTML=m.pipeline?renderPipeline(m.pipeline):md(m.content||'');wireCopy(bubble);}
  else{bubble.textContent=m.content;
    if(m.attachments?.length){const a=document.createElement('div');a.className='msg-attachments';
      m.attachments.forEach(f=>{const c=document.createElement('span');c.className='att-chip';
        c.textContent=`⟢ ${f.name}`;a.appendChild(c);});bubble.appendChild(a);}}
  const actions=document.createElement('div');actions.className='msg-actions';
  actions.appendChild(act('⌘','نسخ',()=>navigator.clipboard.writeText(m.content||'')
    .then(()=>toast('تم النسخ')).catch(()=>toast('فشل'))));
  if(m.role==='user'){
    actions.appendChild(act('⟡','تعديل',()=>editMsg(idx)));
    actions.appendChild(act('↻','إعادة',()=>resend(idx)));
  }else{
    actions.appendChild(act('△','إيجابي',()=>rate(idx,1)));
    actions.appendChild(act('▽','سلبي',()=>rate(idx,-1)));
    actions.appendChild(act('⟳','توليد',()=>regen(idx)));
  }
  const meta=document.createElement('div');meta.className='msg-meta';
  if(m.role==='assistant'&&m.nodes)
    meta.innerHTML=`<span>Logic: ${m.nodes.logic||'—'}</span><span>CodeGen: ${m.nodes.codegen||'—'}</span><span>${m.elapsed?(m.elapsed/1000).toFixed(1)+'s':''}</span>`;
  const cw=document.createElement('div');cw.className='msg-content';
  cw.append(bubble,meta,actions);wrap.append(av,cw);return wrap;
}
function renderPipeline(p){
  const row=(n,st)=>`<div class="pipe-row ${st}"><span class="node-tag">${n}</span>
    <div class="pipe-bar"><div class="pipe-fill"></div></div></div>`;
  return `<div class="pipeline">${row('Master',p.master||'done')}${row('Logic',p.logic||'idle')}
    ${row('CodeGen',p.codegen||'idle')}${row('Merge',p.merge||'idle')}</div>`;
}
function act(i,t,fn){const b=document.createElement('button');b.className='msg-action-btn';
  b.title=t;b.textContent=i;b.onclick=fn;return b;}
function rate(i,v){const s=current();if(!s)return;s.messages[i].rating=v;save();
  toast(v===1?'تقييم إيجابي':'ملاحظة مسجلة');}
function editMsg(i){const s=current();if(!s)return;
  if(!confirm('حذف وإعادة للصندوق؟'))return;
  $('#user-input').value=s.messages[i].content;
  s.messages.splice(i,1);save();drawMessages();autoGrow();$('#user-input').focus();}
function resend(i){const s=current();if(!s)return;
  $('#user-input').value=s.messages[i].content;autoGrow();$('#user-input').focus();}
async function regen(i){const s=current();if(!s||state.busy)return;
  s.messages.splice(i,1);save();drawMessages();
  if([...s.messages].reverse().some(m=>m.role==='user'))send();}
function md(t){
  let h=esc(t);
  h=h.replace(/```(\w*)\n?([\s\S]*?)```/g,(_,l,c)=>
    `<pre class="code-block"><div class="code-lang">${l||'code'}</div><button class="copy-code">نسخ</button><code>${c.trim()}</code></pre>`);
  h=h.replace(/`([^`\n]+)`/g,'<code class="inline-code">$1</code>');
  h=h.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
  h=h.replace(/\n/g,'<br>');return h;
}
function wireCopy(root){$$('.copy-code',root).forEach(b=>b.onclick=()=>{
  const c=b.parentElement.querySelector('code').textContent;
  navigator.clipboard.writeText(c).then(()=>toast('تم نسخ الكود')).catch(()=>toast('فشل'));});}
const input=$('#user-input');
function autoGrow(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,200)+'px';}
input.addEventListener('input',autoGrow);
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();send();}});
$('#send-btn').onclick=send;
async function send(){
  const text=input.value.trim();
  if(!text&&!state.attachments.length)return;
  if(state.busy){toast('طلب قيد المعالجة');return;}
  let s=current();if(!s){newSession();s=current();}
  s.messages.push({role:'user',content:text,attachments:[...state.attachments],ts:Date.now()});
  if(s.title==='محادثة جديدة'&&text)s.title=text.slice(0,42)+(text.length>42?'…':'');
  input.value='';autoGrow();state.attachments=[];drawAttachments();
  save();drawSessions();drawMessages();drawHeader();
  await runPipeline();
}
function setStatus(k,l){$('#status-indicator').className=`status-indicator ${k}`;$('#status-text').textContent=l;}
async function probePipeline(){
  try{const r=await fetch(`${CFG.API_BASE}/api/health`,{cache:'no-store'});
    if(!r.ok)throw 0;const d=await r.json();
    if(d.ok)setStatus('','الوكلاء متصلون');else setStatus('error','بوابة غير مهيأة');}
  catch{setStatus('error','البوابة غير متاحة');}
}

async function runPipeline() {
  const s = current(); if (!s || state.busy) return;
  state.busy = true;
  $("#send-btn").disabled = true;
  setStatus("thinking", "الذكاء الاصطناعي يفكر...");

  const live = { role: "assistant", content: "", pipeline: { master: "done", logic: "done", codegen: "done", merge: "done" } };
  s.messages.push(live);
  drawMessages();
  const box = $("#messages");
  const liveEl = box.lastElementChild;
  const liveBubble = liveEl.querySelector(".bubble");
  liveBubble.innerHTML = "<div class="typing"><span></span><span></span><span></span></div>";

  try {
    const history = s.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    
    // الاتصال المباشر بـ GitHub Models
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ghp_ضع_التوكن_هنا_بصلاحية_models"
      },
      body: JSON.stringify({
        model: "gpt-4o", // شبكة عصبية قوية جداً في البرمجة
        messages: [
          { role: "system", content: "أنت مبرمج خبير. اكتب الكود المطلوب فقط باللغة العربية، واستخدم ``` للكود." },
          ...history
        ],
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "HTTP " + res.status);
    }
    
    const data = await res.json();
    live.content = data.choices[0].message.content;
    delete live.pipeline;
    save(); drawMessages(); setStatus("", "الوكلاء متصلون");
  } catch (err) {
    live.content = "**فشل الاتصال بـ GitHub Models**\n\nالسبب: " + err.message;
    delete live.pipeline;
    save(); drawMessages(); setStatus("error", "فشل");
  } finally {
    state.busy = false;
    $("#send-btn").disabled = false;
    box.scrollTop = box.scrollHeight;
  }
}

async function pollResult(jobId,onProgress){
  const url=`https://raw.githubusercontent.com/${CFG.OWNER}/${CFG.REPO}/${CFG.BRANCH}/results/${jobId}.json`;
  const t0=Date.now();let stage=0;
  while(Date.now()-t0<CFG.POLL_TIMEOUT){
    if(stage===0&&Date.now()-t0>2500){stage=1;
      onProgress({master:'done',logic:'done',codegen:'active',merge:'idle'});}
    else if(stage===1&&Date.now()-t0>7000){stage=2;
      onProgress({master:'done',logic:'done',codegen:'done',merge:'active'});}
    try{const r=await fetch(`${url}?t=${Date.now()}`,{cache:'no-store'});
      if(r.ok){const d=await r.json();
        onProgress({master:'done',logic:'done',codegen:'done',merge:'done'});return d;}}catch{}
    await new Promise(res=>setTimeout(res,CFG.POLL_INTERVAL));
  }
  throw new Error('انتهت المهلة (5 دقائق)');
}
$('#attach-btn').onclick=()=>$('#file-input').click();
$('#file-input').addEventListener('change',async e=>{
  for(const f of[...e.target.files]){
    if(f.size>256*1024){toast(`الحد 256KB: ${f.name}`);continue;}
    try{const t=await f.text();state.attachments.push({name:f.name,content:t.slice(0,12000)});}
    catch{toast(`فشل: ${f.name}`);}
  }
  drawAttachments();e.target.value='';
});
function drawAttachments(){
  const w=$('#attachments-preview');w.innerHTML='';
  state.attachments.forEach((a,i)=>{const c=document.createElement('div');
    c.className='att-preview-chip';c.innerHTML=`<span>${esc(a.name)}</span>`;
    const x=document.createElement('button');x.className='att-remove';x.textContent='✕';
    x.onclick=()=>{state.attachments.splice(i,1);drawAttachments();};
    c.appendChild(x);w.appendChild(c);});
}
const mic=$('#mic-btn');const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){const rec=new SR();rec.lang='ar-SA';rec.continuous=false;rec.interimResults=true;
  rec.onresult=ev=>{let t='';for(let i=ev.resultIndex;i<ev.results.length;i++)t+=ev.results[i][0].transcript;
    input.value=t;autoGrow();};
  rec.onend=()=>mic.classList.remove('recording');
  rec.onerror=()=>{mic.classList.remove('recording');toast('تعذر الصوت');};
  let on=false;mic.onclick=()=>{if(on){rec.stop();on=false;mic.classList.remove('recording');}
    else{try{rec.start();on=true;mic.classList.add('recording');}catch{toast('ميكروفون غير متاح');}}};
}else{mic.style.opacity='.35';mic.onclick=()=>toast('لا يدعم الصوت');}
$('#new-chat-btn').onclick=newSession;
$('#clear-all-btn').onclick=()=>{if(!confirm('حذف كل المحادثات؟'))return;
  state.sessions=[];state.activeId=null;localStorage.removeItem(K_SESS);
  localStorage.removeItem(K_ACTIVE);newSession();};
$('#toggle-sidebar').onclick=()=>$('#sidebar').classList.toggle('open');
addEventListener('beforeunload',e=>{if(state.busy){e.preventDefault();e.returnValue='';}});
async function checkUpdate(){
  try{const r=await fetch(`version.json?t=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)return;const{version}=await r.json();
    if(version&&version!==CFG.VERSION){toast('تحديث جديد — يعاد التحميل…');
      const reg=await navigator.serviceWorker?.getRegistration();
      await reg?.update();setTimeout(()=>location.reload(),1200);}}catch{}
}
load();if(!state.sessions.length)newSession();
drawSessions();drawMessages();drawHeader();initSplash();
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js')
  .then(()=>checkUpdate()).catch(()=>{});}
