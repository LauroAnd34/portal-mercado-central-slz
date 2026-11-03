/* Service worker do Portal do Mercado Central — gerado na construção do site.
   Não edite em site-pronto/: altere ferramentas/modelo-sw.js. */
const VERSAO = '__VERSAO__';
const CACHE_SITE = `mercado-site-${VERSAO}`;
const CACHE_MAPA = 'mercado-mapa-v1';
const LIMITE_MAPA = 400; // quadradinhos do mapa guardados
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

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Arquivos do próprio site: responde do cache e atualiza em segundo plano
  if (url.origin === self.location.origin) {
    evento.respondWith(
      caches.open(CACHE_SITE).then(async (cache) => {
        const guardado = await cache.match(request, { ignoreSearch: true });
        const daRede = fetch(request)
          .then((resposta) => {
            if (resposta.ok) cache.put(request, resposta.clone());
            return resposta;
          })
          .catch(() => guardado ?? cache.match('./404.html'));
        return guardado ?? daRede;
      }),
    );
    return;
  }

  // Quadradinhos do mapa: guarda os que a pessoa já viu
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
  // demais serviços (rotas, VLibras): sempre pela rede
});
