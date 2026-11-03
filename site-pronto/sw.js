/* Service worker do Portal do Mercado Central — gerado na construção do site.
   Não edite em site-pronto/: altere ferramentas/modelo-sw.js. */
const VERSAO = '50eed78cab';
const CACHE_SITE = `mercado-site-${VERSAO}`;
const CACHE_MAPA = 'mercado-mapa-v1';
const LIMITE_MAPA = 400; // quadradinhos do mapa guardados
const ARQUIVOS = [
  "./",
  "./assets/fachada-mercado-CHtqyODV.svg",
  "./assets/merriweather-latin-700-normal-DoUP8Ce-.woff2",
  "./assets/montserrat-latin-400-normal-BLhwKU8k.woff2",
  "./assets/montserrat-latin-600-normal-UVxSCcoG.woff2",
  "./assets/montserrat-latin-700-normal-BdjcYUrC.woff2",
  "./assets/montserrat-latin-800-normal-axpkC1rd.woff2",
  "./assets/atkinson-hyperlegible-latin-400-normal-BrHNak5F.woff2",
  "./assets/atkinson-hyperlegible-latin-700-normal-GZI4o3u0.woff2",
  "./assets/opendyslexic-latin-400-normal-nUhe5EwG.woff2",
  "./assets/opendyslexic-latin-700-normal-Bnmt45Ln.woff2",
  "./assets/merriweather-latin-400-normal-G4kZaoXi.woff2",
  "./assets/merriweather-latin-400-italic-CuD3zK4B.woff2",
  "./assets/naoEncontrada-ChfTdltD.css",
  "./assets/acessibilidade-DG-tSo7h.css",
  "./assets/inicio-DHOfgYwU.css",
  "./assets/livro-DbR4yVu8.css",
  "./assets/mapa-BW4Btd27.css",
  "./assets/modulos-Dye-sCMR.css",
  "./assets/naoEncontrada-upPWTjq8.js",
  "./assets/acessibilidade-DCRmwMhe.js",
  "./assets/inicio-bv_S6ZLn.js",
  "./assets/livro-D7jwuPfu.js",
  "./assets/mapa-CAOPbytP.js",
  "./assets/pontos-turisticos-BWk8hFS6.js",
  "./assets/modulos-D9ixZTVa.js",
  "./icone.svg",
  "./img/compartilhar.png",
  "./img/logo-prefeitura-branca.svg",
  "./img/logo-prefeitura.svg",
  "./livro/mercado-central-sao-luis.epub",
  "./livro/mercado-central-sao-luis.pdf",
  "./livro/mercado-central-sao-luis.txt",
  "./manifest.webmanifest"
];

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
