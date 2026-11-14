/* Service worker do Portal do Mercado Central — gerado na construção do site.
   Não edite em site-pronto/: altere ferramentas/modelo-sw.js.
   Estratégia:
   - páginas (HTML): busca primeiro na internet (sempre a versão mais nova);
     sem internet, usa a cópia guardada;
   - arquivos com "impressão digital" no nome (assets/…): guardados de vez;
   - demais arquivos do site: internet primeiro, cópia guardada como reserva;
   - quadradinhos do mapa já vistos: guardados (até 400). */
const VERSAO = 'f23c5c74f1';
const CACHE_SITE = `mercado-site-${VERSAO}`;
const CACHE_MAPA = 'mercado-mapa-v1';
const LIMITE_MAPA = 400;
const ARQUIVOS = [
  "./",
  "./assets/index-DtGKsCgY.html",
  "./assets/en-C3YFrW_0.html",
  "./assets/es-CvbnwpeB.html",
  "./assets/novo-mercado-central-projeto-480-DDihiUgs.webp",
  "./assets/mercado-1940-cartao-foto-berlim-DVKfE0_2.jpg",
  "./assets/novo-mercado-central-projeto-CeT11x_2.jpg",
  "./assets/novo-mercado-central-projeto-960-B8JV4zsH.webp",
  "./assets/painel-azulejos-cultura-480-CFffeAXu.webp",
  "./assets/painel-azulejos-cultura-960-Y6wlB76M.webp",
  "./assets/painel-azulejos-cultura-1600-DjwAtRg6.webp",
  "./assets/painel-azulejos-cultura-DomAvrS-.jpg",
  "./assets/faixa-azul-svL1b_yD.webp",
  "./assets/faixa-nazare-Cgw8lDkB.webp",
  "./assets/faixa-rosas-B8Dxrb3n.webp",
  "./assets/merriweather-latin-400-italic-CuD3zK4B.woff2",
  "./assets/merriweather-latin-700-normal-DoUP8Ce-.woff2",
  "./assets/merriweather-latin-400-normal-G4kZaoXi.woff2",
  "./assets/mercado-1941-cartao-foto-londres-pfMJINiw.jpg",
  "./assets/praia-grande-casarios-960-okzG8MQ9.webp",
  "./assets/azulejo-estrelas-dom-pedro-ii-B9g-Diuc.jpg",
  "./assets/azulejo-policromo-centro-BdRe-TlY.jpg",
  "./assets/azulejo-igreja-do-rosario-Cy4-Y_Ta.jpg",
  "./assets/azulejo-azul-couto-fernandes-B9zDW7BR.jpg",
  "./assets/azulejo-rua-nazare-328-D2BSLPpH.jpg",
  "./assets/azulejo-rua-nazare-08-Ck1d1mW0.jpg",
  "./assets/azulejo-rua-nazare-82-B_lEtKja.jpg",
  "./assets/azulejo-verde-rua-do-egito-BzicYTPb.jpg",
  "./assets/espigao-costeiro-BHkCAy_d.jpg",
  "./assets/casa-de-nhozinho-DdYQsYrB.jpg",
  "./assets/catedral-da-se-Ca0boR4M.jpg",
  "./assets/casa-das-tulhas-BplvuIEQ.jpg",
  "./assets/fonte-do-ribeirao-ALfGaGKg.jpg",
  "./assets/convento-das-merces-qt5W42VA.jpg",
  "./assets/mercado-garrafas-BmicKho-.jpg",
  "./assets/igreja-do-desterro-CuQUemLM.jpg",
  "./assets/palacio-dos-leoes-CXQ9hwC2.jpg",
  "./assets/ponte-jose-sarney-s5REBbju.jpg",
  "./assets/lagoa-da-jansen-iQoQWzqP.jpg",
  "./assets/por-do-sol-baia-BbXfcSDE.jpg",
  "./assets/mercado-camarao-seco-C2c7Sc__.jpg",
  "./assets/praia-do-calhau-xRdH9nOd.jpg",
  "./assets/praia-grande-casarios-Aj7YLd8n.jpg",
  "./assets/teatro-arthur-azevedo-CGPTYJbt.jpg",
  "./assets/rua-portugal-GKHU1Vv1.jpg",
  "./assets/azulejo-rua-nazare-08-480-CXhBOYEz.webp",
  "./assets/azulejo-estrelas-dom-pedro-ii-480-B66Y74Xu.webp",
  "./assets/sao-jose-de-ribamar-BriG-ocL.jpg",
  "./assets/azulejo-azul-couto-fernandes-480-GAVrJso2.webp",
  "./assets/espigao-costeiro-480-Dq6-fm0z.webp",
  "./assets/azulejo-igreja-do-rosario-960-BfRWaT4o.webp",
  "./assets/azulejo-igreja-do-rosario-480-DCeu8Cjp.webp",
  "./assets/azulejo-azul-couto-fernandes-960-DOWJvg7b.webp",
  "./assets/azulejo-rua-nazare-82-480-BkydgmLF.webp",
  "./assets/azulejo-rua-nazare-328-480-B8SEKN8v.webp",
  "./assets/azulejo-policromo-centro-480-BwDGOaX-.webp",
  "./assets/catedral-da-se-480-_GhmOxM2.webp",
  "./assets/palacio-dos-leoes-480-CjB9NNWp.webp",
  "./assets/azulejo-rua-nazare-08-960-C2sY54pf.webp",
  "./assets/lagoa-da-jansen-480-B2JZeP3d.webp",
  "./assets/azulejo-rua-nazare-328-960-BrpdwOJm.webp",
  "./assets/mercado-camarao-seco-480-Bb4tKesB.webp",
  "./assets/azulejo-rua-nazare-82-960-B17zyHLJ.webp",
  "./assets/casa-de-nhozinho-480-Cf2wotAR.webp",
  "./assets/por-do-sol-baia-480-zR0-SotE.webp",
  "./assets/mercado-garrafas-480-E5IYi-Vm.webp",
  "./assets/azulejo-verde-rua-do-egito-480-DRzhzCix.webp",
  "./assets/igreja-do-desterro-480-8c3_j9si.webp",
  "./assets/praia-do-calhau-480-P4lfCM4Z.webp",
  "./assets/praia-grande-casarios-480-BePXgerN.webp",
  "./assets/rua-portugal-480-B1TUoqGt.webp",
  "./assets/azulejo-verde-rua-do-egito-960-6kSAGj72.webp",
  "./assets/casa-das-tulhas-480-CQ1Xjaic.webp",
  "./assets/convento-das-merces-480-D_QANSjo.webp",
  "./assets/fonte-do-ribeirao-480-91EtLhTX.webp",
  "./assets/sao-jose-de-ribamar-480-CDSeYHT5.webp",
  "./assets/teatro-arthur-azevedo-480-j2UigqE7.webp",
  "./assets/mercado-camarao-seco-960-I5fz9R8X.webp",
  "./assets/ponte-jose-sarney-480-yzDIBzPT.webp",
  "./assets/rua-portugal-azulejos-480-A2QcQpxm.webp",
  "./assets/mercado-garrafas-960-DF0CyssQ.webp",
  "./assets/praia-grande-casarios-1600-CIVzFbqo.webp",
  "./assets/rua-portugal-azulejos-960-BL21w66i.webp",
  "./assets/rua-portugal-azulejos-1600-BdYk-QNz.webp",
  "./assets/rua-portugal-azulejos-BdKAVWQr.jpg",
  "./assets/montserrat-latin-700-normal-BdjcYUrC.woff2",
  "./assets/montserrat-latin-400-normal-BLhwKU8k.woff2",
  "./assets/montserrat-latin-600-normal-UVxSCcoG.woff2",
  "./assets/fraunces-latin-600-normal-BFCDtZfi.woff2",
  "./assets/atkinson-hyperlegible-latin-400-normal-BrHNak5F.woff2",
  "./assets/atkinson-hyperlegible-latin-700-normal-GZI4o3u0.woff2",
  "./assets/fraunces-latin-600-italic-O70d2LGK.woff2",
  "./assets/montserrat-latin-800-normal-axpkC1rd.woff2",
  "./assets/opendyslexic-latin-700-normal-Bnmt45Ln.woff2",
  "./assets/opendyslexic-latin-400-normal-nUhe5EwG.woff2",
  "./assets/fachada-mercado-CHtqyODV.svg",
  "./assets/naoEncontrada-ChfTdltD.css",
  "./assets/visitante-BPuG0Cu9.css",
  "./assets/inicio-SKR02JU7.css",
  "./assets/livro-BXpDM3gK.css",
  "./assets/mapa-B6brUIgn.css",
  "./assets/modulos-B09pC_W-.css",
  "./assets/naoEncontrada-B_MRCyc1.js",
  "./assets/ingles-DjNoFfL5.js",
  "./assets/espanhol-DjNoFfL5.js",
  "./assets/visitante-4FoDdp9R.js",
  "./assets/inicio-DDENmEW7.js",
  "./assets/livro-G7mEIV6U.js",
  "./assets/mapa-0kVJye4B.js",
  "./assets/geografia-BT1QoHBT.js",
  "./assets/modulos-Bgrvt3dT.js",
  "./icone.svg",
  "./img/compartilhar.png",
  "./img/oficial/logo_branca.png",
  "./img/oficial/logo_branca.webp",
  "./img/oficial/logo_mobile.png",
  "./img/oficial/logo_mobile.webp",
  "./img/oficial/logo_rodape.png",
  "./img/oficial/logo_rodape.webp",
  "./img/oficial/maos-libras.svg",
  "./livro/mercado-central-sao-luis.epub",
  "./livro/mercado-central-sao-luis.pdf",
  "./livro/mercado-central-sao-luis.txt",
  "./manifest.webmanifest"
];

// Assume o controle na hora: quem tinha uma versão antiga passa a ver a nova
// já na próxima página aberta (não espera baixar tudo para o modo offline).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const antigos = (await caches.keys()).filter(
        (nome) => nome.startsWith('mercado-site-') && nome !== CACHE_SITE,
      );
      await Promise.all(antigos.map((nome) => caches.delete(nome)));
      await self.clients.claim();
    })(),
  );
  // guarda o site para uso sem internet em segundo plano
  caches
    .open(CACHE_SITE)
    .then((cache) => cache.addAll(ARQUIVOS))
    .catch(() => {
      /* o que faltar é guardado conforme a pessoa navega */
    });
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
