/* Monte sua carteira — service worker
 * Guarda os arquivos do app para abrir sem internet.
 * As consultas ao Banco Central NÃO passam por aqui: o próprio app guarda a
 * última cópia dos dados (com a data) no armazenamento do navegador.
 * Ao publicar uma versão nova, mude o número abaixo. */
const VERSAO = 'msc-v1.4.0';
const ARQUIVOS = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/tema.js', 'js/config.js', 'js/engine.js', 'js/textos.js', 'js/macro.js', 'js/share.js',
  'js/charts.js', 'js/ui.js', 'js/ativos.js', 'js/opcoes.js', 'js/resultado.js', 'js/app.js', 'vendor/qrcode.js', '../site/fontes/bricolage-grotesque-latin.woff2',
  'icons/favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  // Outras origens (Banco Central) vão direto para a rede.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Arquivos do app: responde do cache e atualiza em segundo plano.
  ev.respondWith(caches.open(VERSAO).then(async (cache) => {
    const guardado = await cache.match(req, { ignoreSearch: true });
    const rede = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (guardado) { ev.waitUntil(rede); return guardado; }
    const res = await rede;
    if (res) return res;
    if (req.mode === 'navigate') { const inicio = await cache.match('index.html'); if (inicio) return inicio; }
    return new Response('Sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
