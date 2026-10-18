const V='awalaq-v1';
const SHELL=['./','./index.html','./style.css','./app.js','./config.js','./manifest.json','./offline.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([
  caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('awalaq-')&&x!==V).map(x=>caches.delete(x)))),
  self.clients.claim()]));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('github')||u.hostname.includes('workers.dev'))return;
  if(e.request.mode==='navigate'||/\.(js|css|html|json)$/.test(u.pathname)){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();
      caches.open(V).then(cc=>cc.put(e.request,c));return r;})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./offline.html'))));
    return;}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();});
