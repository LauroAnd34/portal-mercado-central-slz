/* Service worker do Portal do Mercado Central — gerado na construção do site.
   Não edite em site-pronto/: altere ferramentas/modelo-sw.js.
   Estratégia:
   - páginas (HTML): busca primeiro na internet (sempre a versão mais nova);
     sem internet, usa a cópia guardada;
   - arquivos com "impressão digital" no nome (assets/…): guardados de vez;
   - demais arquivos do site: internet primeiro, cópia guardada como reserva;
   - quadradinhos do mapa já vistos: guardados (até 400). */
const VERSAO = '__VERSAO__';
const CACHE_SITE = `mercado-site-${VERSAO}`;
const CACHE_MAPA = 'mercado-mapa-v1';
const LIMITE_MAPA = 400;
const ARQUIVOS = __ARQUIVOS__;

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_SITE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome.startsWith('mercado-site-') && nome !== CACHE_SITE)
            .map((nome) => caches.delete(nome)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function limitarCache(nome, limite) {
  const cache = await caches.open(nome);
  const chaves = await cache.keys();
  for (const chave of chaves.slice(0, Math.max(0, chaves.length - limite)))
    await cache.delete(chave);
}

async function internetPrimeiro(request) {
  const cache = await caches.open(CACHE_SITE);
  try {
    const resposta = await fetch(request);
    if (resposta.ok) cache.put(request, resposta.clone());
    return resposta;
  } catch {
    const guardado = await cache.match(request, { ignoreSearch: true });
    if (guardado) return guardado;
    if (request.mode === 'navigate') return (await cache.match('./404.html')) ?? Response.error();
    return Response.error();
  }
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/assets/')) {
      evento.respondWith(
        caches.match(request).then((guardado) => guardado ?? internetPrimeiro(request)),
      );
    } else {
      evento.respondWith(internetPrimeiro(request));
    }
    return;
  }

  if (url.hostname === 'tile.openstreetmap.org') {
    evento.respondWith(
      caches.open(CACHE_MAPA).then(async (cache) => {
        const guardado = await cache.match(request);
        if (guardado) return guardado;
        const resposta = await fetch(request);
        if (resposta.ok) {
          cache.put(request, resposta.clone());
          limitarCache(CACHE_MAPA, LIMITE_MAPA);
        }
        return resposta;
      }),
    );
  }
});
