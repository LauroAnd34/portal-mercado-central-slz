/**
 * Camada do mapa (Leaflet). Só desenha: não conhece a lista nem os filtros.
 * Comunica-se com o resto da página por callbacks (`aoSelecionar`).
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { criarIconeDeCategoria, criarIconeDoMercado } from './icones.js';
import { caminhoDoPonto } from './rotas-guardadas.js';

/** Caminho pelas ruas do Mercado até o ponto (ou linha reta, se não houver). */
const caminhoAte = (mercado, ponto) =>
  caminhoDoPonto(ponto.id, ponto.modoSugerido ?? 'a-pe') ?? [
    mercado.coordenadas,
    ponto.coordenadas,
  ];

/**
 * Mapa de fundo: OpenStreetMap padrão (gratuito, exige a atribuição abaixo).
 * Para produção com muito acesso, a política do OSM pede servidor próprio ou
 * um provedor contratado — basta trocar esta URL.
 * Modo escuro e alto contraste são feitos com filtros CSS (ver mapa.css).
 */
export const URL_MAPA_DE_FUNDO = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATRIBUICAO =
  '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>';

export function criarMapaInterativo(elemento, { mercado, pontos, categorias, aoSelecionar }) {
  const mapa = L.map(elemento, {
    center: mercado.coordenadas,
    zoom: 13,
    minZoom: 10,
    maxZoom: 19,
    zoomControl: false,
    scrollWheelZoom: false, // evita "prender" a rolagem da página
    keyboard: true,
    attributionControl: true,
  });
  mapa.attributionControl.setPrefix(false);
  L.control
    .zoom({ position: 'topright', zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' })
    .addTo(mapa);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(mapa);

  // a roda do mouse só dá zoom depois que a pessoa clica no mapa
  mapa.on('click', () => mapa.scrollWheelZoom.enable());
  mapa.on('mouseout', () => mapa.scrollWheelZoom.disable());

  /* Pinça no trackpad do computador (chega como Ctrl + roda) e no Safari do Mac
     (gesturechange): aproxima e afasta o mapa sem dar zoom na página inteira. */
  let acumulado = 0;
  elemento.addEventListener(
    'wheel',
    (evento) => {
      if (!evento.ctrlKey && !evento.metaKey) return;
      evento.preventDefault();
      evento.stopPropagation();
      acumulado += -evento.deltaY * 0.012;
      if (Math.abs(acumulado) < 0.5) return;
      const passo = Math.sign(acumulado);
      acumulado = 0;
      mapa.setZoomAround(mapa.mouseEventToContainerPoint(evento), mapa.getZoom() + passo);
    },
    { passive: false, capture: true },
  );
  let escalaInicial = 1;
  let zoomInicial = 0;
  elemento.addEventListener('gesturestart', (evento) => {
    evento.preventDefault();
    escalaInicial = evento.scale;
    zoomInicial = mapa.getZoom();
  });
  elemento.addEventListener('gesturechange', (evento) => {
    evento.preventDefault();
    const alvo = Math.round(zoomInicial + Math.log2(evento.scale / escalaInicial));
    if (alvo !== mapa.getZoom()) mapa.setZoom(alvo);
  });

  /* ---------- Camada de fundo ---------- */
  const fundo = L.tileLayer(URL_MAPA_DE_FUNDO, { attribution: ATRIBUICAO, maxZoom: 19 }).addTo(
    mapa,
  );
  fundo.on('tileerror', () => elemento.classList.add('mapa--sem-fundo'));
  fundo.on('tileload', () => elemento.classList.remove('mapa--sem-fundo'));

  /* ---------- Marcadores menores quando o mapa está afastado ---------- */
  const ajustarPeloZoom = () => {
    const z = mapa.getZoom();
    elemento.classList.toggle('mapa--longe', z < 13);
    elemento.classList.toggle('mapa--medio', z >= 13 && z < 15);
  };
  mapa.on('zoomend', ajustarPeloZoom);

  /** Margens para enquadrar sem esconder nada atrás do painel de detalhes. */
  const margens = () => {
    const painel = elemento.parentElement?.querySelector('.detalhes:not([hidden])');
    const sobreposto = painel && getComputedStyle(painel).position === 'absolute';
    const largura = sobreposto ? painel.offsetWidth + 40 : 60;
    return { paddingTopLeft: [largura, 60], paddingBottomRight: [60, 60] };
  };
  const semAnimacao = () => Boolean(document.documentElement.dataset.movimento);

  /* ---------- Raios: linhas do Mercado até cada ponto ---------- */
  const camadaRaios = L.layerGroup().addTo(mapa);
  const camadaRota = L.layerGroup().addTo(mapa);
  const camadaRoteiro = L.layerGroup().addTo(mapa);
  const camadaMinhaPosicao = L.layerGroup().addTo(mapa);
  let marcadorEu = null;
  let circuloPrecisao = null;

  /* ---------- Marcador central ---------- */
  const marcadorMercado = L.marker(mercado.coordenadas, {
    icon: criarIconeDoMercado(),
    zIndexOffset: 1000,
    keyboard: true,
    title: mercado.nome,
  })
    .addTo(mapa)
    .bindTooltip('Mercado Central — ponto de partida', { direction: 'top', offset: [0, -30] });
  marcadorMercado.on('add', () =>
    rotularMarcador(marcadorMercado, `${mercado.nome}, ponto de partida`),
  );
  rotularMarcador(marcadorMercado, `${mercado.nome}, ponto de partida`);
  marcadorMercado.on('click', () => aoSelecionar?.(mercado.id));

  /* ---------- Marcadores dos pontos ---------- */
  const marcadores = new Map();
  for (const ponto of pontos) {
    const categoria = categorias[ponto.categoria];
    const marcador = L.marker(ponto.coordenadas, {
      icon: criarIconeDeCategoria(categoria),
      keyboard: true,
      title: ponto.nome,
      riseOnHover: true,
    }).bindTooltip(ponto.nome, { direction: 'top', offset: [0, -40] });
    marcador.on('click', () => aoSelecionar?.(ponto.id));
    marcador.on('add', () => rotularMarcador(marcador, `${ponto.nome} — ${categoria.nome}`));
    marcadores.set(ponto.id, { marcador, ponto, categoria });
  }

  let selecionadoId = null;
  let emRoteiro = false; // com um roteiro aberto, as ligações radiais somem
  let idsVisiveis = new Set(pontos.map((p) => p.id));

  const desenharRaios = () => {
    camadaRaios.clearLayers();
    // com um destino escolhido, as outras ligações somem para não poluir o mapa
    const ids = emRoteiro || (selecionadoId && selecionadoId !== mercado.id) ? [] : idsVisiveis;
    for (const id of ids) {
      const { ponto, categoria } = marcadores.get(id);
      L.polyline(caminhoAte(mercado, ponto), {
        color: categoria.cor,
        weight: 3,
        opacity: 0.55,
        lineJoin: 'round',
        interactive: false,
        className: 'mapa__raio',
      }).addTo(camadaRaios);
    }
  };

  const api = {
    mapa,
    /** Mostra só os pontos com estes ids. */
    filtrar(ids) {
      idsVisiveis = new Set(ids);
      for (const [id, { marcador }] of marcadores) {
        if (idsVisiveis.has(id)) marcador.addTo(mapa);
        else marcador.remove();
      }
      desenharRaios();
    },
    /** Destaca um ponto (ou o Mercado) e centraliza a vista. */
    selecionar(id, { mover = true } = {}) {
      if (selecionadoId && marcadores.has(selecionadoId)) {
        const anterior = marcadores.get(selecionadoId);
        anterior.marcador.setIcon(criarIconeDeCategoria(anterior.categoria));
        rotularMarcador(anterior.marcador, `${anterior.ponto.nome} — ${anterior.categoria.nome}`);
      }
      selecionadoId = id;
      camadaRota.clearLayers();
      if (id) {
        camadaRoteiro.clearLayers();
        emRoteiro = false;
      }
      if (id === mercado.id || !marcadores.has(id)) {
        if (mover && id) api.centralizarNoMercado();
        desenharRaios();
        return;
      }
      const { marcador, ponto, categoria } = marcadores.get(id);
      marcador.setIcon(criarIconeDeCategoria(categoria, { selecionado: true }));
      rotularMarcador(marcador, `${ponto.nome} — ${categoria.nome}, selecionado`);
      desenharRaios();
      // linha destacada Mercado → ponto, até a rota real chegar
      const caminho = caminhoAte(mercado, ponto);
      L.polyline(caminho, { color: '#ffffff', weight: 9, opacity: 0.9, lineJoin: 'round' }).addTo(
        camadaRota,
      );
      L.polyline(caminho, {
        color: categoria.cor,
        weight: 5,
        lineJoin: 'round',
        className: 'mapa__rota',
      }).addTo(camadaRota);
      if (mover) {
        mapa.flyToBounds(L.latLngBounds(caminho), {
          ...margens(),
          maxZoom: 17,
          duration: semAnimacao() ? 0 : 0.8,
        });
      }
    },
    /** Desenha a rota real (ou aproximada), com rótulo de distância e tempo no meio. */
    desenharRota(coordenadas, cor, rotulo = '') {
      camadaRota.clearLayers();
      L.polyline(coordenadas, {
        color: '#ffffff',
        weight: 10,
        opacity: 0.95,
        lineJoin: 'round',
      }).addTo(camadaRota);
      L.polyline(coordenadas, {
        color: cor,
        weight: 6,
        opacity: 1,
        lineJoin: 'round',
        className: 'mapa__rota',
      }).addTo(camadaRota);
      L.polyline(coordenadas, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.9,
        interactive: false,
        className: 'mapa__rota-fluxo',
      }).addTo(camadaRota);
      if (rotulo && coordenadas.length > 1) {
        const meio = coordenadas[Math.floor(coordenadas.length / 2)];
        L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'rotulo-rota',
          interactive: false,
        })
          .setLatLng(meio)
          .setContent(rotulo)
          .addTo(camadaRota);
      }
      mapa.flyToBounds(L.latLngBounds(coordenadas), {
        ...margens(),
        maxZoom: 17,
        duration: semAnimacao() ? 0 : 0.8,
      });
    },
    /** Realça o marcador de um ponto (ao passar o mouse ou o foco na lista). */
    destacar(id) {
      for (const [chave, { marcador }] of marcadores) {
        marcador.getElement()?.classList.toggle('marcador--destacado', chave === id);
      }
    },
    /** Botão de tela cheia no próprio mapa. */
    adicionarBotaoTelaCheia() {
      const palco = elemento.parentElement;
      if (!palco?.requestFullscreen) return;
      const icone = (cheio) =>
        cheio
          ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const Controle = L.Control.extend({
        options: { position: 'topright' },
        onAdd() {
          const botao = L.DomUtil.create('button', 'mapa__tela-cheia');
          botao.type = 'button';
          const atualizar = () => {
            const cheio = document.fullscreenElement === palco;
            botao.innerHTML = icone(cheio);
            botao.setAttribute(
              'aria-label',
              cheio ? 'Sair da tela cheia' : 'Ver o mapa em tela cheia',
            );
            botao.title = botao.getAttribute('aria-label');
          };
          atualizar();
          L.DomEvent.disableClickPropagation(botao);
          L.DomEvent.on(botao, 'click', () =>
            document.fullscreenElement ? document.exitFullscreen() : palco.requestFullscreen(),
          );
          document.addEventListener('fullscreenchange', () => {
            atualizar();
            setTimeout(() => mapa.invalidateSize(), 150);
          });
          return botao;
        },
      });
      new Controle().addTo(mapa);
    },
    centralizarNoMercado() {
      mapa.setView(mercado.coordenadas, 16);
    },
    mostrarCentroHistorico() {
      const doCentro = pontos.filter((p) =>
        ['centro-historico', 'fe', 'cultura'].includes(p.categoria),
      );
      mapa.fitBounds(L.latLngBounds([mercado.coordenadas, ...doCentro.map((p) => p.coordenadas)]), {
        ...margens(),
      });
    },
    mostrarIlhaInteira() {
      mapa.fitBounds(L.latLngBounds([mercado.coordenadas, ...pontos.map((p) => p.coordenadas)]), {
        ...margens(),
      });
    },
    /** Roteiro: paradas numeradas + caminho (real ou em linha reta). */
    mostrarRoteiro({ paradas, coordenadas, cor }) {
      api.selecionar(null, { mover: false });
      emRoteiro = true;
      camadaRaios.clearLayers();
      camadaRoteiro.clearLayers();
      L.polyline(coordenadas, { color: '#ffffff', weight: 9, opacity: 0.9 }).addTo(camadaRoteiro);
      L.polyline(coordenadas, { color: cor, weight: 5, className: 'mapa__rota' }).addTo(
        camadaRoteiro,
      );
      paradas.forEach((parada, i) => {
        const numero = L.marker(parada.coordenadas, {
          icon: L.divIcon({
            className: 'marcador-numero',
            html: `<span style="background:${cor}">${i + 1}</span>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
          keyboard: false, // a lista de paradas ao lado é a forma acessível
          zIndexOffset: 2000,
        }).bindTooltip(`${i + 1}. ${parada.nome}`, { direction: 'top', offset: [0, -14] });
        numero.addTo(camadaRoteiro);
      });
      mapa.fitBounds(L.latLngBounds(coordenadas), margens());
    },
    limparRoteiro() {
      camadaRoteiro.clearLayers();
      emRoteiro = false;
      desenharRaios();
    },
    /**
     * Marca a posição da pessoa (fica só no navegador; nada é enviado).
     * Ponto azul com ondas, rótulo "Você está aqui" e o círculo da precisão.
     */
    mostrarMinhaPosicao(coordenadas, { precisaoM = 0, mover = true } = {}) {
      if (!marcadorEu) {
        marcadorEu = L.marker(coordenadas, {
          icon: L.divIcon({
            className: 'minha-posicao',
            html: `<span class="minha-posicao__onda"></span><span class="minha-posicao__onda minha-posicao__onda--2"></span>
              <span class="minha-posicao__ponto"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="6" r="3.2" fill="#fff"/><path d="M6 21c0-4.2 2.7-7.5 6-7.5s6 3.3 6 7.5z" fill="#fff"/></svg></span>
              <span class="minha-posicao__rotulo">Você está aqui</span>`,
            iconSize: [56, 56],
            iconAnchor: [28, 28],
          }),
          zIndexOffset: 2000,
          keyboard: true,
          title: 'Sua localização',
          alt: 'Sua localização',
        }).addTo(camadaMinhaPosicao);
        circuloPrecisao = L.circle(coordenadas, {
          radius: 1,
          color: '#1a73e8',
          weight: 1,
          fillColor: '#1a73e8',
          fillOpacity: 0.12,
          interactive: false,
        }).addTo(camadaMinhaPosicao);
      }
      marcadorEu.setLatLng(coordenadas);
      circuloPrecisao.setLatLng(coordenadas);
      circuloPrecisao.setRadius(precisaoM && precisaoM < 3000 ? precisaoM : 0);
      if (mover) {
        mapa.flyToBounds(L.latLngBounds([coordenadas, mercado.coordenadas]), {
          padding: [70, 70],
          maxZoom: 16,
          duration: document.documentElement.dataset.movimento ? 0 : 1,
        });
      }
    },
    centralizarEmMim() {
      if (marcadorEu)
        mapa.flyTo(marcadorEu.getLatLng(), 17, {
          duration: document.documentElement.dataset.movimento ? 0 : 0.8,
        });
    },
    /** Botão "Onde estou" no próprio mapa. */
    adicionarBotaoLocalizar(aoClicar) {
      const Controle = L.Control.extend({
        options: { position: 'topright' },
        onAdd() {
          const botao = L.DomUtil.create('button', 'mapa__localizar');
          botao.type = 'button';
          botao.title = 'Mostrar onde estou';
          botao.setAttribute('aria-label', 'Mostrar onde estou no mapa');
          botao.innerHTML =
            '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
          L.DomEvent.disableClickPropagation(botao);
          L.DomEvent.on(botao, 'click', aoClicar);
          return botao;
        },
      });
      new Controle().addTo(mapa);
    },
    redimensionar: () => mapa.invalidateSize(),
  };

  desenharRaios();
  api.mostrarIlhaInteira();
  ajustarPeloZoom();
  api.adicionarBotaoTelaCheia();
  // botão único no mapa para voltar a ver tudo (ilha inteira com o Mercado)
  const Controle = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const botao = L.DomUtil.create('button', 'mapa__tela-cheia');
      botao.type = 'button';
      botao.title = 'Ver a ilha inteira';
      botao.setAttribute('aria-label', 'Ver a ilha inteira');
      botao.innerHTML =
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6M12 8v8M8 12h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
      L.DomEvent.disableClickPropagation(botao);
      L.DomEvent.on(botao, 'click', () => api.mostrarIlhaInteira());
      return botao;
    },
  });
  new Controle().addTo(mapa);
  return api;
}

/** Dá nome acessível ao marcador (o Leaflet só põe `title`). */
function rotularMarcador(marcador, rotulo) {
  const elemento = marcador.getElement?.();
  if (!elemento) return;
  elemento.setAttribute('role', 'button');
  elemento.setAttribute('aria-label', rotulo);
}
