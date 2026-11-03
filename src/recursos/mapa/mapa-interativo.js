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

  /* ---------- Camada de fundo ---------- */
  const fundo = L.tileLayer(URL_MAPA_DE_FUNDO, { attribution: ATRIBUICAO, maxZoom: 19 }).addTo(
    mapa,
  );
  fundo.on('tileerror', () => elemento.classList.add('mapa--sem-fundo'));
  fundo.on('tileload', () => elemento.classList.remove('mapa--sem-fundo'));

  /* ---------- Raios: linhas do Mercado até cada ponto ---------- */
  const camadaRaios = L.layerGroup().addTo(mapa);
  const camadaRota = L.layerGroup().addTo(mapa);
  const camadaRoteiro = L.layerGroup().addTo(mapa);
  const camadaMinhaPosicao = L.layerGroup().addTo(mapa);

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
          padding: [70, 70],
          maxZoom: 17,
          duration: document.documentElement.dataset.movimento ? 0 : 0.8,
        });
      }
    },
    /** Desenha a rota real (ou aproximada). */
    desenharRota(coordenadas, cor) {
      camadaRota.clearLayers();
      L.polyline(coordenadas, { color: '#ffffff', weight: 9, opacity: 0.9 }).addTo(camadaRota);
      L.polyline(coordenadas, { color: cor, weight: 5, opacity: 1, className: 'mapa__rota' }).addTo(
        camadaRota,
      );
      mapa.fitBounds(L.latLngBounds(coordenadas), { padding: [60, 60], maxZoom: 17 });
    },
    centralizarNoMercado() {
      mapa.setView(mercado.coordenadas, 16);
    },
    mostrarCentroHistorico() {
      const doCentro = pontos.filter((p) =>
        ['centro-historico', 'fe', 'cultura'].includes(p.categoria),
      );
      mapa.fitBounds(L.latLngBounds([mercado.coordenadas, ...doCentro.map((p) => p.coordenadas)]), {
        padding: [40, 40],
      });
    },
    mostrarIlhaInteira() {
      mapa.fitBounds(L.latLngBounds([mercado.coordenadas, ...pontos.map((p) => p.coordenadas)]), {
        padding: [40, 40],
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
      mapa.fitBounds(L.latLngBounds(coordenadas), { padding: [50, 50] });
    },
    limparRoteiro() {
      camadaRoteiro.clearLayers();
    },
    /** Marca a posição da pessoa (só no navegador; nada é enviado). */
    mostrarMinhaPosicao(coordenadas) {
      camadaMinhaPosicao.clearLayers();
      L.circleMarker(coordenadas, {
        radius: 10,
        color: '#ffffff',
        weight: 3,
        fillColor: '#c32146',
        fillOpacity: 1,
      })
        .bindTooltip('Você está aqui', { permanent: false, direction: 'top' })
        .addTo(camadaMinhaPosicao);
      mapa.fitBounds(L.latLngBounds([coordenadas, mercado.coordenadas]), {
        padding: [60, 60],
        maxZoom: 16,
      });
    },
    redimensionar: () => mapa.invalidateSize(),
  };

  desenharRaios();
  api.mostrarIlhaInteira();
  return api;
}

/** Dá nome acessível ao marcador (o Leaflet só põe `title`). */
function rotularMarcador(marcador, rotulo) {
  const elemento = marcador.getElement?.();
  if (!elemento) return;
  elemento.setAttribute('role', 'button');
  elemento.setAttribute('aria-label', rotulo);
}
